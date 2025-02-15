const venom = require('venom-bot');
const qrcode = require('qrcode-terminal');

// Create the bot
venom.create({
  session: 'my-bot', // Name of the session
  multidevice: true, // For multi-device support
  logQR: true,      // Log QR code to the terminal
})
  .then((client) => {
    console.log('Bot is running!');

    // Listen for incoming messages
    client.onMessage((message) => {
      // Check if the message is from a user (not a group or status)
      if (message.isGroupMsg === false) {
        const sender = message.sender.name || message.sender.pushname || message.sender.id;
        const greeting = `Hello ${sender}! 👋\nWelcome to the bot. How can I assist you today?`;

        // Send a greeting message
        client.sendText(message.from, greeting)
          .then(() => console.log(`Greeting sent to ${sender}`))
          .catch((err) => console.error('Error sending message:', err));
      }
    });
  })
  .catch((err) => {
    console.error('Error initializing bot:', err);
  });

// Handle QR code generation
venom.onStateChange((state) => {
  if (state === 'qrReadSuccess') {
    console.log('QR code generated!');
  } else if (state === 'qrReadFail') {
    console.log('Failed to read QR code. Please try again.');
  }
});

// Log QR code to the terminal
venom.onQRCode((qrCode) => {
  qrcode.generate(qrCode, { small: true }); // Display QR code in the terminal
  console.log('Scan the QR code above to log in.');
});