const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000; // Render will set the port

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to handle incoming messages
app.post("/message", (req, res) => {
    const { sender, message } = req.body;

    if (!sender || !message) {
        return res.status(400).json({ reply: "Invalid request. Missing sender or message." });
    }

    let replyMessage = `Hello ${sender}, we received your message: "${message}".`;

    // Custom automated responses (modify as needed)
    if (message.toLowerCase().includes("order")) {
        replyMessage = "You can track your order status at https://mega94.com/orders.";
    } else if (message.toLowerCase().includes("support")) {
        replyMessage = "For support, visit https://mega94.com/support or reply with your issue.";
    }

    // JSON response to WhatsAuto
    res.json({ reply: replyMessage });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
