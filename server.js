const express = require('express');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

app.use(express.json());
app.use(express.static('public'));

// Multer - memory storage (Vercel ke liye)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 4.5 * 1024 * 1024 } // Vercel 4.5MB limit
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload page
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// QR Code
app.get('/api/qr', async (req, res) => {
    try {
        const url = `${process.env.WEBSITE_URL}/upload`;
        const qr = await QRCode.toDataURL(url, { width: 400, margin: 2 });
        res.json({ qr, url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bot info
app.get('/api/bot-info', async (req, res) => {
    try {
        const me = await bot.getMe();
        res.json({ username: me.username, name: me.first_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// File upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file' });
        }

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

        // Send to Telegram using buffer
        await bot.sendDocument(
            process.env.ADMIN_CHAT_ID,
            req.file.buffer,
            {
                caption: caption,
                parse_mode: 'Markdown',
                filename: req.file.originalname
            }
        );

        res.json({ success: true, message: 'Upload successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Export for Vercel
module.exports = app;
