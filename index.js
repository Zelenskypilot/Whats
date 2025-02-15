const { makeWASocket } = require('@whiskeysockets/baileys');

async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: false, // Pairing code method doesn't need QR code
  });

  // Wait for the connection to be ready
  sock.ev.on('connection.update', async (update) => {
    const { connection, isNewLogin } = update;

    if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }

    // Request pairing code if the device is not registered
    if (!sock.authState.creds.registered) {
      const number = '255625101994'; // Your phone number (without +, (), or -)
      try {
        const code = await sock.requestPairingCode(number);
        console.log(`Pairing Code: ${code}`);
      } catch (error) {
        console.error('Failed to request pairing code:', error);
      }
    }
  });

  // Listen for incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.key.fromMe && message.message.conversation) {
      const userMessage = message.message.conversation;
      const sender = message.key.remoteJid;

      console.log(`Received message: ${userMessage} from ${sender}`);

      // Respond to the user
      await sock.sendMessage(sender, {
        text: 'Hello my friend! Bot is now in testing by my developer Jaxx 😁',
      });
    }
  });
}

// Start the bot
startBot();