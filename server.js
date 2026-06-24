const express = require('express');
const app = express();

let currentPass = "doan2026"; // Mật khẩu mặc định ban đầu
let esp32Response = null;

app.use(express.json());

// 1. Cổng dành cho ESP32 kết nối liên tục 24/7 để chờ nhận mật khẩu mới
app.get('/esp32-connect', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log('ESP32 nhà bạn đã kết nối thành công!');
    esp32Response = res;

    // Gửi mật khẩu hiện tại xuống cho mạch ngay khi vừa kết nối
    res.write(`data: ${currentPass}\n\n`);

    req.on('close', () => {
        esp32Response = null;
        console.log('ESP32 đã ngắt kết nối.');
    });
});

// 2. Link gọi đổi mật khẩu từ xa từ điện thoại của bạn: /api/change-pass?newpass=xxx
app.get('/api/change-pass', (req, res) => {
    const newPass = req.query.newpass;
    if (!newPass) return res.status(400).send('Thieu mat khau moi!');
    
    currentPass = newPass;
    if (esp32Response) {
        esp32Response.write(`data: ${newPass}\n\n`); // Bắn thẳng mật khẩu mới xuống mạch ở nhà
        return res.send(`Da doi mat khau sinh vien thanh: ${newPass}`);
    } else {
        return res.send(`Đã lưu mật khẩu mới, nhưng ESP32 ở nhà đang ngoại tuyến (Offline)!`);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Server dang chay tren cong: ' + PORT);
});
