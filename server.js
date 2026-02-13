const express = require('express');
const app = express();
const path = require('path');

// Middleware to handle JSON and serve your static files from the 'public' folder
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// This variable stores the code in the computer's memory temporarily
let savedCode = "-- No code obfuscated yet";

// 1. This sends your index.html GUI to anyone who visits the main link
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. This handles the Obfuscation request from the GUI
app.post('/obfuscate', (req, res) => {
    const userLua = req.body.lua;

    if (!userLua) {
        return res.status(400).send("No code provided");
    }

    // Simple Base64 encoding logic
    const encoded = Buffer.from(userLua).toString('base64');
    
    // Formatting the string that Roblox will eventually read
    savedCode = `--[[ Obfuscated by HiddenHub ]]\nloadstring(game:HttpGet("https://raw.githubusercontent.com/re-base64-logic"))\n--[[ DATA: ${encoded} ]]`;
    
    res.sendStatus(200);
});

// 3. This handles the "Raw" request that your Roblox script will call
app.get('/raw/temp-file', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(savedCode);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
