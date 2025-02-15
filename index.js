import { makeWASocket } from '@whiskeysockets/baileys';

async function startBot() {
    const sock = makeWASocket({
        printQRInTerminal: false // Disable QR code
    });

    // Generate pairing code
    if (!sock.authState.creds.registered) {
        const number = '255625101994'; // Your phone number
        const code = await sock.requestPairingCode(number);
        console.log('Your WhatsApp Pairing Code:', code); // Display in Render logs
    }

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages[0]?.key.fromMe) {
            const sender = messages[0].key.remoteJid;
            await sock.sendMessage(sender, { text: 'Hello! Welcome to my WhatsApp bot 😊' });
        }
    });

    // Handle reconnection
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            console.log('Connection closed. Restarting...');
            startBot(); // Restart the bot if it disconnects
        } else if (connection === 'open') {
            console.log('WhatsApp bot connected successfully!');
        }
    });
}

// Start the bot
startBot();