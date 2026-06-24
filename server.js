const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let esp32Socket = null; 

wss.on('connection', (ws) => {
    console.log('Co thiet bi ket noi vao Server...');
    ws.on('message', (message) => {
        const msgStr = message.toString();
        if (msgStr === 'ESP32_STATION_ACTIVE') {
            esp32Socket = ws;
            console.log('ESP32 cua ban da ket noi thanh cong!');
        }
    });
    ws.on('close', () => {
        if (esp32Socket === ws) esp32Socket = null;
        console.log('ESP32 da mat ket noi.');
    });
});

app.get('/api/change-pass', (req, res) => {
    const newPass = req.query.newpass;
    if (!newPass) return res.status(400).send('Thieu mat khau moi!');
    if (esp32Socket) {
        esp32Socket.send(`CHANGE_PASS:${newPass}`);
        return res.send(`Da doi mat khau sinh vien thanh: ${newPass}`);
    } else {
        return res.status(500).send('ESP32 dang ngoai tuyen (Offline)!');
    }
});

app.get('/api/change-token', (req, res) => {
    const newToken = req.query.newtoken;
    if (!newToken) return res.status(400).send('Thieu Token moi!');
    if (esp32Socket) {
        esp32Socket.send(`CHANGE_TOKEN:${newToken}`);
        return res.send(`Da doi Token MMO thanh: ${newToken}`);
    } else {
        return res.status(500).send('ESP32 dang ngoai tuyen (Offline)!');
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log('Server dang chay tren cong: ' + PORT);
});
