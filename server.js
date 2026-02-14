const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const scriptDatabase = new Map();
const logs = []; // This stores the history of what people put in
const ADMIN_PASSWORD = "sufyanhidden1x1x1"; // CHANGE THIS!

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. The script generator
app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");

    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, userLua);
    
    // Save to logs with a timestamp
    logs.push({
        time: new Date().toLocaleString(),
        content: userLua,
        id: id
    });

    res.json({ id: id });
});

// 2. THE SECRET DASHBOARD
app.get('/h1dd3n-logs', (req, res) => {
    const pass = req.query.password;
    if (pass !== ADMIN_PASSWORD) {
        return res.status(403).send("ACCESS DENIED BY H1DD3N");
    }

    let html = `<html><body style="background:#000;color:#0f0;font-family:monospace;padding:20px;">`;
    html += `<h1>H1DD3N LOGS PANEL</h1><hr>`;
    
    logs.reverse().forEach(log => {
        html += `<div style="border:1px solid #8a2be2;padding:10px;margin-bottom:10px;">
                    <p><strong>Time:</strong> ${log.time} | <strong>ID:</strong> ${log.id}</p>
                    <pre style="background:#111;padding:10px;color:#8a2be2;">${log.content}</pre>
                 </div>`;
    });

    html += `</body></html>`;
    res.send(html);
});

// 3. Raw endpoint for Roblox
app.get('/raw/:id', (req, res) => {
    const script = scriptDatabase.get(req.params.id);
    const userAgent = req.headers['user-agent'] || "";

    if (script && userAgent.includes("Roblox")) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(script);
    } else {
        res.status(403).send("ACCESS DENIED BY H1DD3N");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`H1DD3N OBFUSCATER LIVE`));
