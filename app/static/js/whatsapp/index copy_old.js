const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
// const qrcodeTerminal = require('qrcode-terminal');

// Inicializa o cliente
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'test' }),
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

// --- EVENTOS ---

// QR Code gerado
client.on('qr', async (qr) => {
    console.log('📷 QR gerado!');
    // Mostrar QR no terminal
    // qrcodeTerminal.generate(qr, { small: true });
    // Enviar para Flask
    try {
        const url = await require('qrcode').toDataURL(qr); 
        fetch('https://german-smug-respectfully.ngrok-free.dev/whatsapp/qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qr: url })
        });
        console.log('QR enviado para Flask');
    } catch (err) {
        console.error('Erro ao enviar QR para Flask:', err);
    }
});

// QR lido, sessão autenticada
client.on('authenticated', () => {
    console.log('🔐 QR lido, sessão autenticada!');
});

// Cliente pronto
client.on('ready', async () => {
    console.log('✅ WhatsApp conectado e pronto!');

    // Pega todos os chats
    const chats = await client.getChats();

    // Procura grupo "task"
    const taskGroup = chats.find(chat => chat.isGroup && chat.name === 'task');

    if (!taskGroup) {
        console.log('⚠️ Grupo "task" não encontrado.');
        return;
    }

    // Salva ID do grupo em arquivo JSON
    const data = { taskGroupId: taskGroup.id._serialized };
    fs.writeFileSync('./whatsapp-groups.json', JSON.stringify(data, null, 2));
    console.log('Grupo "task" salvo em arquivo.');
});

// Falha na autenticação
client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

// Desconectado
client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp desconectado:', reason);
});


// --- PROCESSAMENTO DE MENSAGENS ENCAMINHADAS ---
client.on('message_create', async msg => {
    const clientInfo = client.info; // sem await
    const myId = clientInfo.wid._serialized; 
    console.log(myId); // seu ID completo    
    console.log('evento capturado')
    // Somente mensagens encaminhadas
    if (!msg.isForwarded) return;
    console.log('a mensagem e encaminhada');
    // Somente grupos
    // if (!msg.from.endsWith('@g.us')) return;
    // console.log('quem recebeu foi um grupo');
    // Lê JSON atualizado (evita cache do require)
    let groups;
    try {
        groups = JSON.parse(fs.readFileSync('./whatsapp-groups.json'));
        console.log('grupo setado');
        console.log(groups.taskGroupId);
    } catch (err) {
        console.error('Erro ao ler whatsapp-groups.json:', err);
        return;
    }

    // Verifica se a mensagem veio do grupo "task"
    console.log('msg.from 1:', msg.from);
    console.log('msg.from 2:', msg.to);
    // if (msg.from === groups.taskGroupId) {
    if (msg.to === groups.taskGroupId){
        try {
            const response = await fetch(
                'https://german-smug-respectfully.ngrok-free.dev/tasks/save-task-from-whatsapp-web',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: msg.body, from: myId })
                }
            );

            const resp = await response.json();
            msg.reply(resp.content);
        } catch (err) {
            console.error(err);
            msg.reply('Error saving task.');
        }
    }
});

// Inicializa o cliente
client.initialize();
