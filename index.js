const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express'); // Express to keep Render happy

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "/data" }), // Uses persistent storage
    puppeteer: { headless: true }
});

// Generate QR code for authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Log in confirmation
client.on('ready', () => {
    console.log('Client is ready!');
});

// Listen for incoming messages
client.on('message', async (message) => {
    console.log(`Received message from ${message.from}: ${message.body}`);

    if (message.body.toLowerCase() === 'start' || message.body.toLowerCase() === 'menu') {
        let buttonMessage = new Buttons(
            'Welcome to our SMM Panel Website! 🎉\n\nPlease choose an option:',
            [
                { body: '🛒 New Order' },
                { body: '🆘 Support' },
                { body: '📦 Track Order' }
            ],
            'Main Menu',
            'Select an option below'
        );

        await client.sendMessage(message.from, buttonMessage);
    } else if (message.body === '🛒 New Order') {
        message.reply('You selected *New Order*. Please visit our website to place your order: https://your-smm-panel.com');
    } else if (message.body === '🆘 Support') {
        message.reply('You selected *Support*. Our support team will contact you shortly. For immediate assistance, email us at support@your-smm-panel.com.');
    } else if (message.body === '📦 Track Order') {
        message.reply('You selected *Track Order*. Please provide your order ID to track your order.');
    }
});

// Start the WhatsApp bot
client.initialize();

// Dummy HTTP server to keep Render alive
app.get('/', (req, res) => {
    res.send('WhatsApp Bot is Running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
