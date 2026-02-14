const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let scriptDatabase = new Map();
const ADMIN_PASSWORD = "sufyanhidden1x1x1"; // CHANGE THIS BEFORE COMMITTING!

// Simplified obfuscator to prevent execution errors
function obfuscate(code) {
    const encoded = Buffer.from(code).toString('base64');
    return `loadstring(game:GetService("HttpService"):Base64Decode("${encoded}"))()`;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code provided");
    
    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, {
        code: userLua,
        protected: obfuscate(userLua),
        time: new Date().toLocaleString()
    });
    res.json({ id: id });
});

app.get('/h1dd3n-admin', (req, res) => {
    const pass = req.query.password;
    if (pass !== ADMIN_PASSWORD) {
        return res.status(403).send('<h1>H1DD3N PROTECTS: ACCESS DENIED</h1><p>Incorrect Password.</p>');
    }

    let html = '<html><body style="background:#000;color:#8a2be2;font-family:monospace;padding:20px;"><h1>H1DD3N MANAGER</h1>';
    scriptDatabase.forEach((data, id) => {
        html += `<div style="border:1px solid #8a2be2;padding:10px;margin-bottom:10px;">
            <p>ID: ${id} | Time: ${data.time}</p>
            <pre style="color:#0f0;background:#111;padding:10px;white-space:pre-wrap;max-height:500px;overflow:auto;">${data.code}</pre>
            <button onclick="fetch('/delete-script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'${id}'})}).then(()=>location.reload())" style="background:red;color:white;border:none;padding:8px;cursor:pointer;">DELETE & TERMINATE</button>
        </div>`;
    });
    res.send(html + '</body></html>');
});

app.post('/delete-script', (req, res) => {
    scriptDatabase.delete(req.body.id);
    res.sendStatus(200);
});

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
app.listen(PORT, () => console.log("Server online"));
