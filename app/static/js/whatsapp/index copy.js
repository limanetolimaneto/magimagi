const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();


const clients = {}; // chave = userId, valor = client instance

function startWhatsAppClient(userId) {
    console.log('criado')
    if (clients[userId]) return clients[userId]; // já existe
    console.log('criado 2')
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: userId }),
        puppeteer: { headless: 'new', args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote'
        ] }
    });

    client.on('qr', async (qr) => {
        // const url = await require('qrcode').toDataURL(qr);
        const url = await require('qrcode').toDataURL(qr);
        fetch(`https://german-smug-respectfully.ngrok-free.dev/whatsapp/qr?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qr: url })
        });
        console.log('QR enviado para Flask');
    });
    client.on('authenticated', async() => {
        console.log('🔐 QR lido, sessão autenticada!');
    });
    client.on('ready', async() => {
        console.log('WhatsApp conectado e pronto!');
    })
    client.initialize();
    clients[userId] = client;
    return client;
}

function disconnectClient(userId) {
    print('chamada')
    userId = String(userId);

    if (clients[userId]) {
        clients[userId].destroy();
        delete clients[userId];
    }

    print('deletado')
    const authPath = path.join('.wwebjs_auth', `session-${userId}`);
    print('authPath')
    if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log('LocalAuth removed for user:', userId);
    }
}


// function disconnectClient(userId) {
//     if (clients[userId]) {
//         console.log(clients)
//         clients[userId].destroy();
//         delete clients[userId];
//     }
// }

app.get('/whatsapp/status', (req, res) => {
    const userId = String(req.query.user_id);
    const client = clients[userId];

    if (!client) {
        return res.json({ connected: false, source: 'no-client' });
    }

    const isConnected =
        client.info &&
        client.info.wid &&
        client.ws &&
        client.ws.readyState === 1;

    res.json({
        connected: Boolean(isConnected),
        source: 'client'
    });
});

// ==============================================================
// HTTP SERVER ==================================================
// ==============================================================

app.use(cors({
    origin: '*',           
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.post('/whatsapp/connect', (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    startWhatsAppClient(user_id);

    res.json({ status: 'starting', user_id });
});



app.get('/whatsapp/disconnect', (req, res) => {
    const userId = req.query.user_id;
    disconnectClient(userId);

    res.json({ status: 'disconnected', userId });
});

app.get('/whatsapp/status', (req, res) => {
    const userId = String(req.query.user_id);
    const client = clients[userId];

    if (!client) {
        return res.json({ connected: false, source: 'no-client' });
    }

    const isConnected =
        client.info &&
        client.info.wid &&
        client.ws &&
        client.ws.readyState === 1;

    res.json({
        connected: Boolean(isConnected),
        source: 'client'
    });
});



app.listen(3001, () => {
    console.log('🚀 WhatsApp Node server running on port 3001');
});



