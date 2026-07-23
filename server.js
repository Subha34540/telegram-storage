const express = require('express');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

// Multer with memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 4.5 * 1024 * 1024 }
});

// ==================== API ROUTES ====================

// QR Code API
app.get('/api/qr', async (req, res) => {
    try {
        const url = `${process.env.WEBSITE_URL}/upload`;
        const qr = await QRCode.toDataURL(url, { width: 400, margin: 2 });
        res.json({ qr, url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bot Info API
app.get('/api/bot-info', async (req, res) => {
    try {
        const me = await bot.getMe();
        res.json({ username: me.username || 'bot', name: me.first_name || 'Storage Bot' });
    } catch (err) {
        console.error('Bot info error:', err.message);
        res.json({ username: 'storage_bot', name: 'Storage Bot' });
    }
});

// Upload API
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file selected' });
        }

        const fileSize = (req.file.size / 1024 / 1024).toFixed(2);
        const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const caption = 
`📄 *New Upload!*

👤 *Name:* ${req.body.userName || 'N/A'}
📧 *Email:* ${req.body.userEmail || 'N/A'}
📱 *Phone:* ${req.body.userPhone || 'N/A'}
📝 *Note:* ${req.body.note || '-'}

📁 *File:* ${req.file.originalname}
📊 *Size:* ${fileSize} MB
🕐 *Time:* ${time}`;

        await bot.sendDocument(
            process.env.ADMIN_CHAT_ID,
            req.file.buffer,
            {
                caption: caption,
                parse_mode: 'Markdown',
                filename: req.file.originalname
            }
        );

        res.json({ success: true, message: 'File uploaded successfully! Admin ko mil gaya.' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== HTML PAGES (with inline CSS/JS) ====================

// HOME PAGE
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Telegram Storage</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container { width: 100%; max-width: 480px; }
        .card {
            background: white;
            border-radius: 24px;
            padding: 35px 30px;
            box-shadow: 0 25px 70px rgba(0,0,0,0.3);
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .header { text-align: center; margin-bottom: 25px; }
        .logo {
            width: 70px; height: 70px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 35px;
            margin-bottom: 12px;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        h1 { color: #2d3748; font-size: 24px; font-weight: 700; margin-bottom: 6px; }
        .subtitle { color: #718096; font-size: 13px; line-height: 1.5; }
        .info-box {
            background: linear-gradient(135deg, #f0f4ff, #e0e7ff);
            padding: 12px; border-radius: 12px;
            text-align: center; margin-bottom: 20px;
            font-size: 14px; color: #4a5568;
        }
        .info-box strong { color: #667eea; }
        .qr-section { text-align: center; margin: 20px 0; }
        .qr-section h3 { color: #2d3748; margin-bottom: 12px; font-size: 15px; }
        .qr-box {
            background: white; padding: 15px;
            border-radius: 12px; display: inline-block;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .qr-box img { max-width: 100%; display: block; }
        .url {
            margin-top: 10px; font-size: 11px; color: #718096;
            word-break: break-all; background: #f7fafc;
            padding: 6px 10px; border-radius: 6px;
        }
        .steps { background: #f7fafc; padding: 18px; border-radius: 12px; margin: 20px 0; }
        .steps h3 { color: #2d3748; margin-bottom: 10px; font-size: 14px; }
        .steps ol { padding-left: 18px; color: #4a5568; font-size: 13px; }
        .steps li { margin: 6px 0; }
        .btn {
            width: 100%; padding: 14px; border: none;
            border-radius: 12px; font-size: 15px;
            font-weight: 600; cursor: pointer;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; transition: 0.3s;
            box-shadow: 0 6px 15px rgba(102, 126, 234, 0.3);
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5); }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">🚀</div>
                <h1>Telegram Storage</h1>
                <p class="subtitle">QR Code scan karo aur files seedha Telegram pe!</p>
            </div>
            <div class="info-box">🤖 Bot: <strong id="botName">Loading...</strong></div>
            <div class="qr-section">
                <h3>📷 Scan This QR Code</h3>
                <div class="qr-box" id="qrBox"><p>Loading QR...</p></div>
                <p class="url" id="urlText"></p>
            </div>
            <div class="steps">
                <h3>📋 Kaise kaam karta hai:</h3>
                <ol>
                    <li>QR Code scan karo</li>
                    <li>Upload page khulega</li>
                    <li>Apni details bharo</li>
                    <li>File select karo (Max 4MB)</li>
                    <li>Upload button dabao</li>
                    <li>File seedha Telegram pe! ✅</li>
                </ol>
            </div>
            <button onclick="downloadQR()" class="btn">📥 Download QR Code</button>
        </div>
    </div>
    <script>
        fetch('/api/qr')
            .then(r => r.json())
            .then(data => {
                document.getElementById('qrBox').innerHTML = '<img src="' + data.qr + '" alt="QR">';
                document.getElementById('urlText').textContent = data.url;
                window.qrUrl = data.qr;
            }).catch(err => {
                document.getElementById('qrBox').innerHTML = '<p>QR load failed</p>';
            });

        fetch('/api/bot-info')
            .then(r => r.json())
            .then(data => {
                document.getElementById('botName').textContent = '@' + (data.username || 'bot');
            }).catch(err => {
                document.getElementById('botName').textContent = '@storage_bot';
            });

        function downloadQR() {
            if (!window.qrUrl) { alert('Wait 2 sec...'); return; }
            const a = document.createElement('a');
            a.href = window.qrUrl;
            a.download = 'qr-code.png';
            a.click();
        }
    </script>
</body>
</html>
    `);
});

// UPLOAD PAGE
app.get('/upload', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📤 Upload Document</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container { width: 100%; max-width: 480px; }
        .card {
            background: white;
            border-radius: 24px;
            padding: 35px 30px;
            box-shadow: 0 25px 70px rgba(0,0,0,0.3);
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .header { text-align: center; margin-bottom: 25px; }
        .logo {
            width: 70px; height: 70px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 35px;
            margin-bottom: 12px;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        h1 { color: #2d3748; font-size: 24px; font-weight: 700; margin-bottom: 6px; }
        .subtitle { color: #718096; font-size: 13px; line-height: 1.5; }
        .form-group { margin-bottom: 16px; }
        .form-group label {
            display: block; margin-bottom: 6px;
            color: #2d3748; font-weight: 600;
            font-size: 12px; text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .form-group input, .form-group textarea {
            width: 100%; padding: 12px 14px;
            border: 2px solid #e2e8f0; border-radius: 10px;
            font-size: 14px; font-family: inherit;
            transition: 0.3s;
        }
        .form-group input:focus, .form-group textarea:focus {
            outline: none; border-color: #667eea;
        }
        .form-group textarea { resize: vertical; min-height: 50px; }
        .drop-zone {
            border: 2px dashed #cbd5e0; border-radius: 12px;
            padding: 30px 20px; text-align: center;
            cursor: pointer; background: #f7fafc;
            transition: 0.3s;
        }
        .drop-zone:hover, .drop-zone.drag {
            border-color: #667eea; background: #f0f4ff;
        }
        .drop-zone.file-selected {
            border-color: #48bb78; background: #f0fff4; border-style: solid;
        }
        .icon { font-size: 40px; margin-bottom: 8px; }
        .file-info { color: #4a5568; font-size: 13px; }
        .filename { color: #667eea; font-weight: 600; margin-top: 6px; font-size: 12px; word-break: break-all; }
        .btn {
            width: 100%; padding: 14px; border: none;
            border-radius: 12px; font-size: 15px;
            font-weight: 600; cursor: pointer;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; transition: 0.3s;
            box-shadow: 0 6px 15px rgba(102, 126, 234, 0.3);
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
        }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner {
            display: inline-block; width: 14px; height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white; border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .progress {
            margin-top: 16px; height: 28px;
            background: #e2e8f0; border-radius: 14px;
            position: relative; overflow: hidden;
        }
        .bar {
            height: 100%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            width: 0%; transition: 0.3s;
        }
        .progress span {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-weight: 700; font-size: 12px; color: #2d3748;
        }
        .ok, .err {
            padding: 18px; border-radius: 12px;
            margin-top: 16px; text-align: center;
        }
        .ok { background: #c6f6d5; color: #22543d; border: 1px solid #68d391; }
        .err { background: #fed7d7; color: #742a2a; border: 1px solid #fc8181; }
        .success-icon { font-size: 40px; margin-bottom: 8px; }
        .ok h3 { color: #22543d; margin-bottom: 5px; font-size: 16px; }
        .ok p { color: #2f855a; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">📤</div>
                <h1>Upload Document</h1>
                <p class="subtitle">Apni details bharo aur file upload karo.<br>Admin ko turant mil jayega!</p>
            </div>
            <form id="form" enctype="multipart/form-data">
                <div class="form-group">
                    <label>👤 Apna Naam *</label>
                    <input type="text" name="userName" required placeholder="Apna naam likho">
                </div>
                <div class="form-group">
                    <label>📧 Email Address</label>
                    <input type="email" name="userEmail" placeholder="email@example.com">
                </div>
                <div class="form-group">
                    <label>📱 Phone Number</label>
                    <input type="tel" name="userPhone" placeholder="+91 9999999999">
                </div>
                <div class="form-group">
                    <label>📝 Note (Optional)</label>
                    <textarea name="note" placeholder="Kuch likhna ho toh yahan likho..."></textarea>
                </div>
                <div class="form-group">
                    <label>📁 Select File * (Max 4MB)</label>
                    <div class="drop-zone" id="dropZone">
                        <div class="icon">📁</div>
                        <p class="file-info" id="fileTxt">Click karo ya file yahan drop karo</p>
                        <p class="filename" id="fileName"></p>
                    </div>
                    <input type="file" id="fileInp" name="file" required style="display:none">
                </div>
                <button type="submit" id="btn" class="btn">🚀 Upload File</button>
                <div class="progress" id="prog" style="display:none">
                    <div class="bar" id="bar"></div>
                    <span id="pct">0%</span>
                </div>
            </form>
            <div id="result"></div>
        </div>
    </div>
    <script>
        const fileInp = document.getElementById('fileInp');
        const dropZone = document.getElementById('dropZone');
        const fileTxt = document.getElementById('fileTxt');
        const fileName = document.getElementById('fileName');
        const form = document.getElementById('form');
        const btn = document.getElementById('btn');
        const prog = document.getElementById('prog');
        const bar = document.getElementById('bar');
        const pct = document.getElementById('pct');
        const result = document.getElementById('result');

        dropZone.onclick = function() { fileInp.click(); };

        fileInp.onchange = function(e) {
            if (e.target.files[0]) {
                const f = e.target.files[0];
                const size = (f.size / 1024 / 1024).toFixed(2);
                fileTxt.textContent = 'Ready! ✅';
                fileName.textContent = f.name + ' (' + size + ' MB)';
                dropZone.classList.add('file-selected');
            }
        };

        dropZone.ondragover = function(e) { e.preventDefault(); dropZone.classList.add('drag'); };
        dropZone.ondragleave = function() { dropZone.classList.remove('drag'); };
        dropZone.ondrop = function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag');
            if (e.dataTransfer.files[0]) {
                fileInp.files = e.dataTransfer.files;
                const f = e.dataTransfer.files[0];
                const size = (f.size / 1024 / 1024).toFixed(2);
                fileTxt.textContent = 'Ready! ✅';
                fileName.textContent = f.name + ' (' + size + ' MB)';
                dropZone.classList.add('file-selected');
            }
        };

        form.onsubmit = function(e) {
            e.preventDefault();
            if (!fileInp.files[0]) {
                result.innerHTML = '<div class="err">❌ Pehle file select karo!</div>';
                return;
            }
            const file = fileInp.files[0];
            if (file.size > 4.5 * 1024 * 1024) {
                result.innerHTML = '<div class="err">❌ File 4MB se badi hai!</div>';
                return;
            }
            const data = new FormData(form);
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Uploading...';
            prog.style.display = 'block';
            result.innerHTML = '';

            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const p = Math.round((e.loaded / e.total) * 100);
                    bar.style.width = p + '%';
                    pct.textContent = p + '%';
                }
            };
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const r = JSON.parse(xhr.responseText);
                        result.innerHTML = '<div class="ok"><div class="success-icon">✅</div><h3>Upload Successful!</h3><p>' + r.message + '</p></div>';
                        form.reset();
                        fileTxt.textContent = 'Click karo ya file yahan drop karo';
                        fileName.textContent = '';
                        dropZone.classList.remove('file-selected');
                    } catch (err) {
                        result.innerHTML = '<div class="err">❌ Response error</div>';
                    }
                } else {
                    let msg = 'Upload failed';
                    try { const r = JSON.parse(xhr.responseText); msg = r.error || msg; } catch (e) {}
                    result.innerHTML = '<div class="err">❌ ' + msg + '</div>';
                }
                btn.disabled = false;
                btn.innerHTML = '🚀 Upload File';
                prog.style.display = 'none';
            };
            xhr.onerror = function() {
                result.innerHTML = '<div class="err">❌ Network error!</div>';
                btn.disabled = false;
                btn.innerHTML = '🚀 Upload File';
                prog.style.display = 'none';
            };
            xhr.open('POST', '/api/upload');
            xhr.send(data);
        };
    </script>
</body>
</html>
    `);
});

module.exports = app;
