const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let scriptDatabase = new Map();
const ADMIN_PASSWORD = "sufyanhidden1x1x1"; // Change this!

// This version is MUCH more compatible with different executors
function obfuscate(code) {
    const encoded = Buffer.from(code).toString('base64');
    return `-- H1DD3N PROTECT\nlocal h = game:GetService("HttpService"); loadstring(h:Base64Decode("${encoded}"))()`;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");
    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, {
        code: userLua,
        protected: obfuscate(userLua),
        time: new Date().toLocaleString()
    });
    res.json({ id: id });
});

// Admin Panel
app.get('/h1dd3n-admin', (req, res) => {
    if (req.query.password !== ADMIN_PASSWORD) return res.status(403).send("Wrong Password");
    let html = '<html><body style="background:#000;color:#8a2be2;font-family:monospace;padding:20px;"><h1>MANAGER</h1>';
    scriptDatabase.forEach((data, id) => {
        html += `<div style="border:1px solid #333;padding:10px;margin-bottom:10px;">
            <p>ID: ${id}</p>
            <pre style="color:#0f0;">${data.code}</pre>
            <button onclick="fetch('/delete-script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'${id}'})}).then(()=>location.reload())">DELETE</button>
        </div>`;
    });
    res.send(html + '</body></html>');
});

app.post('/delete-script', (req, res) => {
    scriptDatabase.delete(req.body.id);
    res.sendStatus(200);
});

// FIX: Removed the "userAgent.includes" check to ensure it works for ALL executors
app.get('/raw/:id', (req, res) => {
    const data = scriptDatabase.get(req.params.id);
    if (data) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(data.protected); 
    } else {
        res.status(404).send("-- SCRIPT NOT FOUND");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("H1DD3N LIVE"));
