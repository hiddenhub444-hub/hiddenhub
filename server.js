const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const scriptDatabase = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");

    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, userLua);
    res.json({ id: id });
});

// Secure Raw endpoint
app.get('/raw/:id', (req, res) => {
    const script = scriptDatabase.get(req.params.id);
    const userAgent = req.headers['user-agent'] || "";

    // ONLY allow Roblox to see the code
    if (script && userAgent.includes("Roblox")) {
        res.set({
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
        });
        res.send(script);
    } else {
        // Show this to everyone else in a browser
        res.status(403).send(`
            <body style="background:black;color:red;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:monospace;margin:0;">
                <h1 style="font-size:50px;border:2px solid red;padding:20px;">ACCESS DENIED BY H1DD3N</h1>
                <p style="color:#555;">UNAUTHORIZED_VIEW_PROTECTION_ENABLED</p>
                <a href="https://discord.gg/8Pb8sxaS" style="color:#8a2be2;text-decoration:none;margin-top:20px;">Join Discord for Access</a>
            </body>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`H1DD3N OBFUSCATER LIVE`));
