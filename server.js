const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let scriptDatabase = new Map();
const ADMIN_PASSWORD = "sufyanhidden1x1x1"; // Change this!

// Use a simple, reliable obfuscation that won't break executors
function obfuscate(code) {
    const encoded = Buffer.from(code).toString('base64');
    return `-- H1DD3N PROTECT\nloadstring(game:GetService("HttpService"):Base64Decode("${encoded}"))()`;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. GENERATOR
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

// 2. ADMIN PANEL (with Password)
app.get('/h1dd3n-admin', (req, res) => {
    const pass = req.query.password;
    if (pass !== sufyanhidden1x1x1) {
        return res.status(403).send('<h1>ACCESS DENIED</h1><form><input type="password" name="password"><button>Login</button></form>');
    }

    let html = '<html><body style="background:#000;color:#8a2be2;font-family:monospace;padding:20px;"><h1>H1DD3N PROTECTS: MANAGER</h1>';
    scriptDatabase.forEach((data, id) => {
        html += `<div style="border:1px solid #8a2be2;padding:10px;margin-bottom:10px;">
            <p>ID: ${id} | ${data.time}</p>
            <pre style="color:#0f0;background:#111;padding:10px;">${data.code}</pre>
            <button onclick="fetch('/delete-script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'${id}'})}).then(()=>location.reload())" style="background:red;color:white;border:none;padding:5px;cursor:pointer;">DELETE</button>
        </div>`;
    });
    res.send(html + '</body></html>');
});

// 3. DELETE LOGIC
app.post('/delete-script', (req, res) => {
    scriptDatabase.delete(req.body.id);
    res.sendStatus(200);
});

// 4. THE RAW LINK (REMOVED STRICT USER-AGENT CHECK FOR RELIABILITY)
app.get('/raw/:id', (req, res) => {
    const data = scriptDatabase.get(req.params.id);
    if (data) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(data.protected);
    } else {
        res.status(404).send("-- SCRIPT NOT FOUND OR TERMINATED");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("H1DD3N PROTECTS LIVE"));
