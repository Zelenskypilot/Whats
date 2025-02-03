const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; // Use the assigned port or default to 3000

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle incoming messages
app.post('/message', (req, res) => {
    const { sender, message } = req.body;

    // Welcome message with buttons
    const response = {
        reply: `Welcome, ${sender}! How can we assist you today?`,
        buttons: ["Support", "My Order", "Status"]
    };

    // Send the response back to WhatsAuto
    res.json(response);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
