import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import fs from 'fs';

async function startBot() {
    // Initialize authentication state
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    // Create WhatsApp socket connection
    const sock = makeWASocket({
        auth: state, // Use the authentication state
        printQRInTerminal: false // Disable QR code
    });

    // Save credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Generate pairing code if not registered
    if (!state.creds.registered) {
        const number = '255625101994'; // Your phone number
        const code = await sock.requestPairingCode(number);
        console.log('Your WhatsApp Pairing Code:', code); // Visible in Render logs
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