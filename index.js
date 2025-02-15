import { makeWASocket, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';

async function startBot() {
    // Initialize authentication state
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    // Create WhatsApp socket connection with QR code logging in Railway
    const sock = makeWASocket({
        auth: state, // Use the authentication state
        browser: Browsers.ubuntu('My App'), // Custom browser name
        printQRInTerminal: false // Disable QR code in terminal
    });

    // Save credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Log the QR code to Railway logs and generate a QR code using `qrcode` library
    sock.ev.on('qr', (qr) => {
        console.log('Your WhatsApp QR Code (scannable):');
        
        // Log the QR code directly to the Railway logs as a string
        QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
            if (err) {
                console.error('Error generating QR code:', err);
                return;
            }
            // This will print the QR code to the logs in a scannable format
            console.log(url);
        });
    });

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