const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto'); // Built-in for generating random IDs

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// This stores all scripts: { "a1b2c3": "print('hello')" }
const scriptDatabase = new Map();

// 1. Protection: Stop people from seeing the main page
app.get('/', (req, res) => {
    res.status(403).send('<body style="background:black;color:red;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h1>ACCESS DENIED BY H1DD3N</h1></body>');
});

// 2. Secret Admin Route: Use this to actually access your GUI
// Go to your-site.vercel.app/admin-panel to use the tool
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. Create a unique link
app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");

    // Create a random ID like '7f3a1b'
    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, userLua);

    res.json({ id: id });
});

// 4. The Raw Link for Roblox
app.get('/raw/:id', (req, res) => {
    const script = scriptDatabase.get(req.params.id);
    
    if (script) {
        res.set('Content-Type', 'text/plain');
        res.send(script);
    } else {
        res.status(403).send('ACCESS DENIED BY H1DD3N');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Shield Active on ${PORT}`));
