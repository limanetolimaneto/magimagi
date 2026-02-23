import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const clients = {};
const users = [
    { id: 1, email: 'admin@email.com', number: '27664593531' },
    { id: 3, email: 'flask@email.com', number: '27664593531' }
];

async function connectUser(userId) {
    if (clients[userId]) return clients[userId];
    console.log('1. Antes de criar client');
    const client = new Client({
        authStrategy: new LocalAuth({ 
            clientId: userId,
            dataPath: `/home/limanetouser/punilissa/app/static/js/whatsapp/session_${userId}`
        }),
        puppeteer: {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
                '--no-zygote'
            ]
        }
    });
    console.log("usuario criado com sucesso", client)
    client.on('qr', async (qr) => {
        const url = await QRCode.toDataURL(qr);
        try {
            await fetch(`https://german-smug-respectfully.ngrok-free.dev/whatsapp/qr_code?user_id=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qr: url })
            });
            console.log('QR enviado para Flask');
        } catch(e) {
            console.error('Falha ao enviar QR:', e);
        }
    });

    client.initialize();
    clients[userId] = client;
    return true;
}

async function disconnectUser(userId){
    const client = clients[userId];
    if (!client) return; // nada a fazer se não existe

    try {
        // Fecha a instância do client (fecha Puppeteer e desconecta)
        await client.destroy();
        console.log(`Client ${userId} destruído`);
    } catch (e) {
        console.error('Erro ao destruir client:', e);
    }

    // Remove a referência do objeto global
    delete clients[userId];
    console.log(`Client ${userId} removido do objeto clients`);
    return true
}



// ===========================================================
// ENDPOINTS =================================================

app.get('/whatsapp/connect_user', async (req, res) => {
    try {
        const userId = req.query.user_id;

        if (!userId) {
            return res.status(200).json({ user: 'empty' });
        }

        console.log('antes de chamar connect');
        const connectedUser = await connectUser(userId);
        console.log('objeto',connectedUser);
        console.log('depois de chamar connect');

        res.json({ user: connectedUser });
    } catch (error) {
        console.error('Error connecting user:', error);
        res.status(500).json({ user: 'empty' });
    }
});

app.get('/whatsapp/user_status', (req, res) => {
    const userId = String(req.query.user_id);
    const client = clients[userId];
    const userDetails = users.find(item => item.id === Number(userId));

    if (!userDetails) {
        return res.status(404).json({ connected: false, error: 'User not found' });
    }

    if (!client) {
        return res.json({
            connected: false,
            source: 'no-client',
            email: userDetails.email,
            number: userDetails.number
        });
    }

    const isConnected = client?.info?.wid && client?.ws?.readyState === 1;

    res.json({
        connected: Boolean(isConnected),
        source: 'client',
        email: userDetails.email,
        number: userDetails.number
    });
});

app.get('/whatsapp/disconnect_user', async (req, res) => {
    const userId = String(req.query.user_id);
    try {
        const disconnected = await disconnectUser(userId); // await aqui
        res.json({ disconnected }); // agora é true ou false
    } catch (e) {
        console.error('Erro ao desconectar user:', e);
        res.json({ disconnected: false, error: e.message });
    }
});


app.listen(3001, () => {
    console.log('WhatsApp Node server running on port 3001');
});




// const { Client, LocalAuth } = require('whatsapp-web.js');
// const fs = require('fs');
// const express = require('express');
// const cors = require('cors');
// const app = express();


// app.use(cors({
//     origin: '*',           
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type']
// }));

// app.use(express.json());

// const clients = {}; // chave = userId, valor = client instance
// const users = [
//     {id: 1, email: 'admin@email.com',number:'27664593531'},
//     {id: 3, email: 'flask@email.com',number:'27664593531'}
// ]

// function connectUser(userId) {
//     console.log('comeca funcao');
//     if (clients[userId]) return clients[userId]; 
//     console.log('nao existe cliente');
//     const client = new Client({
//         authStrategy: new LocalAuth({ clientId: userId }),
//         puppeteer: { headless: 'new', args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage',
//             '--disable-gpu',
//             '--single-process',
//             '--no-zygote'
//         ] }
//     });
//     console.log('criou cliente');
//     client.on('qr', async (qr) => {
//         const url = await require('qrcode').toDataURL(qr);
//         try {
//             await fetch(`https://german-smug-respectfully.ngrok-free.dev/whatsapp/qr_code?user_id=${userId}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ qr: url })
//             });
//             console.log('QR enviado para Flask');
//         } catch(e) {
//             console.error('Falha ao enviar QR:', e);
//         }
//     });


//     client.initialize();
//     clients[userId] = client;
//     return userId;
// }

// app.get('/whatsapp/connect_user', async (req, res) => {
//     try {
//         const userId = req.query.user_id;
//         if (!userId) {
//             return res.status(200).json({ user: 'empty' });
//         }
//         console.log('antes de chamar connect')
//         const connectedUser = await connectUser(userId);
//         console.log('depois de chamar connect')
//         res.json({ user: connectedUser });
//     } catch (error) {
//         console.error('Error connecting user:', error);
//         res.status(500).json({ user: 'empty' });
//     }
// });









// old ones ==========================
// function startWhatsAppClient(userId) {
//     console.log('criado')
//     if (clients[userId]) return clients[userId]; // já existe
//     console.log('criado 2')
//     const client = new Client({
//         authStrategy: new LocalAuth({ clientId: userId }),
//         puppeteer: { headless: 'new', args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage',
//             '--disable-gpu',
//             '--single-process',
//             '--no-zygote'
//         ] }
//     });

//     client.on('qr', async (qr) => {
//         // const url = await require('qrcode').toDataURL(qr);
//         const url = await require('qrcode').toDataURL(qr);
//         fetch(`https://german-smug-respectfully.ngrok-free.dev/whatsapp/qr?user_id=${userId}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ qr: url })
//         });
//         console.log('QR enviado para Flask');
//     });
//     client.on('authenticated', async() => {
//         console.log('🔐 QR lido, sessão autenticada!');
//     });
//     client.on('ready', async() => {
//         console.log('WhatsApp conectado e pronto!');
//     })
//     client.initialize();
//     clients[userId] = client;
//     return client;
// }

// function disconnectClient(userId) {
//     print('chamada')
//     userId = String(userId);

//     if (clients[userId]) {
//         clients[userId].destroy();
//         delete clients[userId];
//     }

//     print('deletado')
//     const authPath = path.join('.wwebjs_auth', `session-${userId}`);
//     print('authPath')
//     if (fs.existsSync(authPath)) {
//         fs.rmSync(authPath, { recursive: true, force: true });
//         console.log('LocalAuth removed for user:', userId);
//     }
// }


// function disconnectClient(userId) {
//     if (clients[userId]) {
//         console.log(clients)
//         clients[userId].destroy();
//         delete clients[userId];
//     }
// }

// app.get('/whatsapp/status', (req, res) => {
//     const userId = String(req.query.user_id);
//     const client = clients[userId];

//     if (!client) {
//         return res.json({ connected: false, source: 'no-client' });
//     }

//     const isConnected =
//         client.info &&
//         client.info.wid &&
//         client.ws &&
//         client.ws.readyState === 1;

//     res.json({
//         connected: Boolean(isConnected),
//         source: 'client'
//     });
// });

// ==============================================================
// HTTP SERVER ==================================================
// ==============================================================



// app.post('/whatsapp/connect', (req, res) => {
//     const { user_id } = req.body;

//     if (!user_id) {
//         return res.status(400).json({ error: 'user_id is required' });
//     }

//     startWhatsAppClient(user_id);

//     res.json({ status: 'starting', user_id });
// });



// app.get('/whatsapp/disconnect', (req, res) => {
//     const userId = req.query.user_id;
//     disconnectClient(userId);

//     res.json({ status: 'disconnected', userId });
// });

// app.get('/whatsapp/status', (req, res) => {
//     const userId = String(req.query.user_id);
//     const client = clients[userId];

//     if (!client) {
//         return res.json({ connected: false, source: 'no-client' });
//     }

//     const isConnected =
//         client.info &&
//         client.info.wid &&
//         client.ws &&
//         client.ws.readyState === 1;

//     res.json({
//         connected: Boolean(isConnected),
//         source: 'client'
//     });
// });



// app.listen(3001, () => {
//     console.log('🚀 WhatsApp Node server running on port 3001');
// });



