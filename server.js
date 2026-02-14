const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Memory storage for scripts
let scriptDatabase = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. GENERATOR
app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");
    
    const id = crypto.randomBytes(4).toString('hex');
    // Store script with a timestamp
    scriptDatabase.set(id, {
        code: userLua,
        time: new Date().toLocaleString()
    });
    res.json({ id: id });
});

// 2. ADMIN DASHBOARD - Manage and Delete Scripts
app.get('/h1dd3n-admin', (req, res) => {
    let html = `
    <html>
    <head><title>H1DD3N MANAGEMENT</title></head>
    <body style="background:#000;color:#8a2be2;font-family:monospace;padding:20px;">
        <h1 style="border-bottom:2px solid #8a2be2;padding-bottom:10px;">H1DD3N PROTECTS: SCRIPT MANAGER</h1>
        <div id="container">`;

    if (scriptDatabase.size === 0) {
        html += `<p style="color:#555;">No active scripts found.</p>`;
    }

    scriptDatabase.forEach((data, id) => {
        html += `
        <div id="card-${id}" style="border:1px solid #333;padding:15px;margin-bottom:10px;background:#050505;">
            <p><strong>ID:</strong> ${id} | <strong>Created:</strong> ${data.time}</p>
            <pre style="background:#111;padding:10px;color:#0f0;max-height:100px;overflow:auto;">${data.code.substring(0, 500)}...</pre>
            <button onclick="deleteScript('${id}')" style="background:red;color:white;border:none;padding:10px;cursor:pointer;font-weight:bold;">DELETE & TERMINATE</button>
        </div>`;
    });

    html += `
        </div>
        <script>
            async function deleteScript(id) {
                if(!confirm('Terminate this script? Roblox execution will stop immediately.')) return;
                const res = await fetch('/delete-script', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: id })
                });
                if(res.ok) {
                    document.getElementById('card-' + id).style.display = 'none';
                }
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
        scriptDatabase.delete(id); // Removes it from memory forever
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 4. SECURE RAW LINK (Roblox Only)
app.get('/raw/:id', (req, res) => {
    const data = scriptDatabase.get(req.params.id);
    const userAgent = req.headers['user-agent'] || "";

    if (data && userAgent.includes("Roblox")) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(data.code);
    } else {
        // If script was deleted, this will trigger even for Roblox
        res.status(403).send("ACCESS DENIED BY H1DD3N");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("H1DD3N PROTECTS LIVE"));
