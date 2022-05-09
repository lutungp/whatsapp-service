const { Client, LocalAuth } = require('whatsapp-web.js');
var qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client({ puppeteer: { headless: true }, authStrategy: new LocalAuth() });

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
	if(message.body === '!ping') {
		message.reply('pong');
	}
});

client.on('authenticated', () => {
    
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);

    client.destroy();
    client.initialize();
});

client.initialize();