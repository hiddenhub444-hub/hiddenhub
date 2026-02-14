const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const scriptDatabase = new Map();
// Add your Discord ID here as the first whitelisted user
let whitelistedIDs = ["YOUR_DISCORD_ID"]; 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. GENERATOR
app.post('/generate', (req, res) => {
    const userLua = req.body.lua;
    if (!userLua) return res.status(400).send("No code");
    const id = crypto.randomBytes(4).toString('hex');
    scriptDatabase.set(id, userLua);
    res.json({ id: id });
});

// 2. ADMIN DASHBOARD (Check if user is whitelisted)
app.get('/dashboard', (req, res) => {
    const userId = req.query.id; // Access via ?id=123456
    
    if (!whitelistedIDs.includes(userId)) {
        return res.status(403).send('<body style="background:black;color:red;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h1>ACCESS DENIED BY H1DD3N</h1></body>');
    }

    res.send(`
        <body style="background:#000;color:#8a2be2;font-family:monospace;padding:20px;">
            <h1>H1DD3N ADMIN PANEL</h1>
            <hr border="1px solid #8a2be2">
            <h3>WHITELIST A USER</h3>
            <input type="text" id="wInput" placeholder="/whitelist @12345" style="width:300px;background:#111;color:#0f0;border:1px solid #8a2be2;padding:10px;">
            <button onclick="addWL()" style="padding:10px;background:#8a2be2;color:white;border:none;cursor:pointer;">EXECUTE</button>
            <p id="msg"></p>

            <script>
                async function addWL() {
                    const val = document.getElementById('wInput').value;
                    const id = val.split('@')[1];
                    if(!id) return alert("Use format: /whitelist @ID");
                    
                    const res = await fetch('/add-whitelist', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ adminId: "${userId}", newId: id })
                    });
                    if(res.ok) { document.getElementById('msg').innerText = "USER " + id + " WHITELISTED"; }
                }
            </script>
        </body>
    `);
});

// 3. WHITELIST LOGIC
app.post('/add-whitelist', (req, res) => {
    const { adminId, newId } = req.body;
    if (whitelistedIDs.includes(adminId)) {
        whitelistedIDs.push(newId);
        res.sendStatus(200);
    } else {
        res.sendStatus(403);
    }
});

// 4. SECURE RAW LINK
app.get('/raw/:id', (req, res) => {
    const script = scriptDatabase.get(req.params.id);
    if (script && (req.headers['user-agent'] || "").includes("Roblox")) {
        res.set({'Content-Type': 'text/plain', 'Cache-Control': 'no-cache'});
        res.send(script);
    } else {
        res.status(403).send("ACCESS DENIED BY H1DD3N");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("H1DD3N PROTECTS ACTIVE"));
