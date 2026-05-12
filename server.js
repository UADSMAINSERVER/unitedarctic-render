const WebSocket = require('ws');
const http = require('http');

const TARGET_URL = 'wss://with-scout-witness-stud.trycloudflare.com
';

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', client => {
    console.log('Client connected');

    const target = new WebSocket(TARGET_URL);

    target.on('open', () => {
        console.log('Connected to local tunnel');
    });

    client.on('message', msg => {
        if (target.readyState === WebSocket.OPEN) {
            target.send(msg);
        }
    });

    target.on('message', msg => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });

    client.on('close', () => {
        console.log('Client disconnected');
        target.close();
    });

    target.on('close', () => {
        console.log('Tunnel closed');
        client.close();
    });

    target.on('error', err => {
        console.error('Tunnel error:', err.message);
        client.close();
    });

    client.on('error', err => {
        console.error('Client error:', err.message);
        target.close();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Render bridge listening on port ${PORT}`);
});
