const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let scriptDatabase = new Map();
const ADMIN_PASSWORD = "sufyanhidden1x1x1"; // Set your password here!

// FIXED OBFUSCATOR: This now uses the correct Roblox syntax
function obfuscate(code) {
    const encoded = Buffer.from(code).toString('base64');
    // Using game:GetService("HttpService") is safer for execution
    return `local http = game:GetService("HttpService"); loadstring(http:Base64Decode("${encoded}"))()`;
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

// ADMIN PANEL with Password Protection
app.get('/h1dd3n-admin', (req, res) => {
    const pass = req.query.password;
    if (pass !== ADMIN_PASSWORD) {
        return res.status(403).send(`
            <body style="background:black;color:red;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:monospace;">
                <h1>H1DD3N PROTECTS: UNAUTHORIZED</h1>
                <form action="/h1dd3n-admin" method="GET">
                    <input type="password" name="password" placeholder="Admin Key" style="padding:10px;background:#111;color:white;border:1px solid red;">
                    <button type="submit" style="padding:10px;background:red;color:white;border:none;cursor:pointer;">ENTER</button>
                </form>
            </body>
        `);
    }

    let html = `<html><head><style>
        body { background:#000; color:#8a2be2; font-family:monospace; padding:20px; }
        pre { background:#111; padding:15px; color:#0f0; max-height:600px; overflow:auto; white-space:pre-wrap; border:1px solid #333; }
        .card { border:1px solid #8a2be2; padding:15px; margin-bottom:20px; background:#050505; }
    </style></head><body><h1>H1DD3N PROTECTS: SCRIPT MANAGER</h1>`;

    scriptDatabase.forEach((data, id) => {
        html += `<div id="card-${id}" class="card">
            <p><strong>ID:</strong> ${id} | <strong>Created:</strong> ${data.time}</p>
            <pre>${data.code}</pre>
            <button onclick="deleteScript('${id}')" style="background:red;color:white;padding:10px;border:none;cursor:pointer;">DELETE & TERMINATE</button>
        </div>`;
    });

    html += `<script>
        async function deleteScript(id) {
            const res = await fetch('/delete-script', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id: id })
            });
            if(res.ok) document.getElementById('card-' + id).remove();
        }
    </script></body></html>`;
    res.send(html);
});

app.post('/delete-script', (req, res) => {
    const { id } = req.body;
    scriptDatabase.delete(id);
    res.sendStatus(200);
});

app.get('/raw/:id', (req, res) => {
    const data = scriptDatabase.get(req.params.id);
    const userAgent = req.headers['user-agent'] || "";
    if (data && userAgent.includes("Roblox")) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(data.protected);
    } else {
        res.status(403).send("ACCESS DENIED BY H1DD3N");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("H1DD3N PROTECTS LIVE"));

