require('dotenv').config();
const express = require('express');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

app.use(express.json());
app.use(express.static('public'));

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/api/qr', async (req, res) => {
    try {
        const url = `${process.env.WEBSITE_URL}/upload`;
        const qr = await QRCode.toDataURL(url, { width: 400, margin: 2 });
        res.json({ qr: qr, url: url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bot-info', async (req, res) => {
    try {
        const me = await bot.getMe();
        res.json({ username: me.username, name: me.first_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file' });
        }

        const filePath = req.file.path;
        const fileSize = (req.file.size / 1024 / 1024).toFixed(2);
        const time = new Date().toLocaleString('en-IN');

        const caption = 
`📄 *New Upload!*

👤 *Name:* ${req.body.userName || 'N/A'}
📧 *Email:* ${req.body.userEmail || 'N/A'}
📱 *Phone:* ${req.body.userPhone || 'N/A'}
📝 *Note:* ${req.body.note || '-'}

📁 *File:* ${req.file.originalname}
📊 *Size:* ${fileSize} MB
🕐 *Time:* ${time}`;

        await bot.sendDocument(process.env.ADMIN_CHAT_ID, filePath, {
            caption: caption,
            parse_mode: 'Markdown'
        });

        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Upload successful!' });
    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});
