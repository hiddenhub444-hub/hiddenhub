const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Memory storage for scripts
let scriptDatabase = new Map();

// Helper: Simple Scrambler to prevent easy bypass reading
function obfuscate(code) {
    // Encodes the code into Base64 so it's not plain text in the browser
    const encoded = Buffer.from(code).toString('base64');
    return `-- H1DD3N PROTECT ACTIVE\nloadstring(game:HttpService:Base64Decode("${encoded}"))()`;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. GENERATOR (Now with Scrambling)
app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");
    
    const id = crypto.randomBytes(4).toString('hex');
    
    scriptDatabase.set(id, {
        code: userLua, // Store original for YOU to see
        protected: obfuscate(userLua), // Store scrambled for THEM to see
        time: new Date().toLocaleString()
    });
    res.json({ id: id });
});

// 2. ADMIN DASHBOARD - Full View Enabled
app.get('/h1dd3n-admin', (req, res) => {
    let html = `
    <html>
    <head>
        <title>H1DD3N MANAGEMENT</title>
        <style>
            body { background:#000; color:#8a2be2; font-family:monospace; padding:20px; }
            .card { border:1px solid #8a2be2; padding:15px; margin-bottom:20px; background:#050505; }
            pre { background:#111; padding:15px; color:#0f0; max-height:800px; overflow:auto; white-space:pre-wrap; border:1px solid #222; }
            .del-btn { background:red; color:white; border:none; padding:10px 20px; cursor:pointer; font-weight:bold; }
        </style>
    </head>
    <body>
        <h1 style="border-bottom:2px solid #8a2be2;">H1DD3N PROTECTS: SCRIPT MANAGER</h1>
        <div id="container">`;

    if (scriptDatabase.size === 0) {
        html += `<p style="color:#555;">No active scripts found.</p>`;
    }

    scriptDatabase.forEach((data, id) => {
        html += `
        <div id="card-${id}" class="card">
            <p><strong>ID:</strong> ${id} | <strong>Created:</strong> ${data.time}</p>
            <pre>${data.code}</pre> <button class="del-btn" onclick="deleteScript('${id}')">DELETE & TERMINATE</button>
        </div>`;
    });

    html += `
        </div>
        <script>
            async function deleteScript(id) {
                if(!confirm('Terminate this script?')) return;
                const res = await fetch('/delete-script', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: id })
                });
                if(res.ok) { document.getElementById('card-' + id).remove(); }
            }
        </script>
    </body>
    </html>`;
    res.send(html);
});

// 3. DELETE LOGIC
app.post('/delete-script', (req, res) => {
    const { id } = req.body;
    if (scriptDatabase.has(id)) {
        scriptDatabase.delete(id);
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 4. SECURE RAW LINK (Delivers Scrambled Code)
app.get('/raw/:id', (req, res) => {
    const data = scriptDatabase.get(req.params.id);
    const userAgent = req.headers['user-agent'] || "";

    if (data && userAgent.includes("Roblox")) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(data.protected); // They only get the scrambled version!
    } else {
        res.status(403).send("ACCESS DENIED BY H1DD3N");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("H1DD3N PROTECTS LIVE"));
