const express = require('express');
const app = express();
const path = require('path');

app.use(express.json()); 
app.use(express.static('public')); 

// This variable stores the code in the computer's memory temporarily
let savedCode = "-- No code obfuscated yet"; 

// 1. This handles the Obfuscation request from the GUI
app.post('/obfuscate', (req, res) => {
    const userLua = req.body.lua;
    
    // This is the obfuscation logic. For now, it Base64 encodes the code.
    // You can replace this later with a more powerful Lua obfuscator.
    const encoded = Buffer.from(userLua).toString('base64');
    savedCode = `--[[ Obfuscated by MyObfuscater ]]\nloadstring(game:HttpGet("https://raw.githubusercontent.com/re-base64-logic"))\n--[[ DATA: ${encoded} ]]`;
    
    console.log("New script obfuscated and saved!");
    res.json({ success: true, obfuscatedCode: savedCode });
});

// 2. This is the "Raw" link that Roblox uses
// When you visit http://localhost:3000/raw/temp-file, it shows ONLY the code.
app.get('/raw/temp-file', (req, res) => {
    res.set('Content-Type', 'text/plain'); // This makes it a raw text file
    res.send(savedCode);
});

app.listen(3000, () => {
    console.log("Server is running!");
    console.log("GUI: http://localhost:3000");
    console.log("RAW: http://localhost:3000/raw/temp-file");
});