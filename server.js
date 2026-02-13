const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stores scripts in memory: { "id": "code" }
const scriptDatabase = new Map();

// 1. Main Page (Now everyone can see the GUI directly)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Generator: Creates a unique ID for the code
app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code provided");

    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, userLua);

    res.json({ id: id });
});

// 3. Public Raw Link: Accessible by anyone and Roblox
app.get('/raw/:id', (req, res) => {
    const script = scriptDatabase.get(req.params.id);

    if (script) {
        res.set({
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.send(script);
    } else {
        res.status(404).send("Script not found or expired.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Public Obfuscator live on ${PORT}`));
