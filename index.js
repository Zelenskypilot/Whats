import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';
import http from 'http'; // Dummy HTTP server

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Disable QR code
        browser: ['Chrome', 'ChromeOS', '1.0'], // Helps avoid connection issues
    });

    sock.ev.on('creds.update', saveCreds);

    // Generate pairing code if not registered
    if (!state.creds.registered) {
        const number = '255625101994';
        const code = await sock.requestPairingCode(number);
        console.log('Your WhatsApp Pairing Code:', code);
    }

    // Listen for messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages[0]?.key.fromMe) {
            const sender = messages[0].key.remoteJid;
            await sock.sendMessage(sender, { text: 'Hello! Welcome to my WhatsApp bot 😊' });
        }
    });

    // Handle disconnections and automatic reconnection
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log('Connection lost. Reconnecting...');
                setTimeout(startBot, 5000); // Restart after 5s
            } else {
                console.log('Logged out. Restart manually.');
            }
        } else if (connection === 'open') {
            console.log('WhatsApp bot connected successfully!');
        }
    });
}

// Start the bot
startBot();

// Create a dummy HTTP server to keep Render happy
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK\n');
}).listen(process.env.PORT || 3000, () => {
    console.log('Dummy server running on port', process.env.PORT || 3000);
});