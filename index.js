import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';
import http from 'http';

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth'); // Ensure auth is saved properly

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false, // Disable QR code
            browser: ['Chrome', 'Windows', '10.0'], // More stable browser signature
            syncFullHistory: true
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

        // Handle disconnections & prevent Render from crashing
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log('Connection closed, reason:', reason);
                if (reason !== DisconnectReason.loggedOut) {
                    setTimeout(startBot, 15000); // Wait 15 seconds before reconnecting
                } else {
                    console.log('Logged out. Restart manually.');
                }
            } else if (connection === 'open') {
                console.log('WhatsApp bot connected successfully!');
            }
        });
    } catch (err) {
        console.error('Error in startBot:', err);
        setTimeout(startBot, 30000); // Wait 30 seconds before retrying to avoid spam
    }
}

// Start the bot
startBot();

// Dummy HTTP server to keep Render alive
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK\n');
}).listen(process.env.PORT || 3000, () => {
    console.log('Dummy server running on port', process.env.PORT || 3000);
});