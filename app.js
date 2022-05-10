const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
var qrcode = require('qrcode');
const fs = require('fs');
const http = require('http');

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const PORT = process.env.PORT || 3000; //Line 3

var path = require('path');
const { url } = require('inspector');
const { response } = require('express');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
});

app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const message = req.body.message;

    client.sendMessage(number, message).then(response => {
        res.status(200).json({
            status: true,
            response: response
        });
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        });
    });
});

const client = new Client({ puppeteer: { headless: true }, authStrategy: new LocalAuth() });

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('authenticated', () => {
    
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);

    client.destroy();
    client.initialize();
});

client.initialize();

// Socket IO
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('message', 'Connecting ...');

    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'QR Code received, scan please!')
        });

        client.on('ready', () => {
            socket.emit('message', 'Whatsapp is ready!')
        });
    });
});

server.listen(PORT, function() {
    console.log(`app running on ${PORT}`);
});