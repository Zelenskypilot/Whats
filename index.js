const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Define the path for the auth state file
const authStatePath = path.join(__dirname, 'auth_info.json');

// Load or initialize the auth state
const { state, saveState } = useSingleFileAuthState(authStatePath);

async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: false, // Pairing code method doesn't need QR code
    auth: state, // Pass the auth state
  });

  // Listen for connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, isNewLogin } = update;

    if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }

    // Request pairing code if the device is not registered
    if (!state.creds.registered) {
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

  // Save the auth state whenever it updates
  sock.ev.on('creds.update', saveState);
}

// Start the bot
startBot();