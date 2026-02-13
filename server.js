const express = require('express');
const app = express();
const path = require('path');

// Middleware to handle JSON and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// This variable stores the code in the computer's memory
let savedCode = "-- No code obfuscated yet";

// 1. Sends the GUI to the user
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Handles the Obfuscation request
app.post('/obfuscate', (req, res) => {
    const userLua = req.body.lua;

    if (!userLua) {
        return res.status(400).send("No code provided");
    }

    // Base64 encoding logic
    const encoded = Buffer.from(userLua).toString('base64');
    
    // Formatting the string for the Roblox side
    savedCode = `--[[ Obfuscated by HiddenHub ]]\nloadstring(game:HttpGet("https://raw.githubusercontent.com/re-base64-logic"))\n--[[ DATA: ${encoded} ]]`;
    
    res.sendStatus(200);
});

// 3. The "Raw" endpoint for Roblox (CRITICAL FIXES HERE)
app.get('/raw/temp-file', (req, res) => {
    // These headers ensure the executor gets fresh code every time
    res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.send(savedCode);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
