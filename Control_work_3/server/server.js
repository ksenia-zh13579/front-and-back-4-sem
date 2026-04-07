const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const vapidKeys = {
    publicKey: 'BM1z2pJ1dpUBDcBK9GcBPT6fJSHsLXrN2h-FaKSRn8rKEhwSd9TAAXrp3EcfuspPIRp7OgMlAjQJ0uPdPOZ6Fy0',
    privateKey: 'uosJhMscDj5aleCvA1Lq8VTB75WfmGrhmFx4HFe2JGs'
};

webpush.setVapidDetails(
    'mailto:ksenia.zh13579@mail.ru', // укажите свой email
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

// Хранилище подписок
let subscriptions = [];

const server = http.createServer(app);

const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Клиент подключён:', socket.id);

    // Обработка события 'newTask' от клиента
    socket.on('newTask', (task) => {
        // Рассылаем событие всем подключённым клиентам, включая отправителя
        io.emit('taskAdded', task);

        // Формируем payload для push-уведомления
        const payload = JSON.stringify({
            title: 'Новая задача',
            body: task.text
        });

        // Отправляем уведомление всем подписанным клиентам
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload)
                .catch(err => console.error('Push error:', err));
        });
    });

    socket.on('taskAdded', (task) => {
        console.log('Задача от другого клиента:', task);

        const notification = document.createElement('div');
        notification.textContent = `Новая задача: ${task.text}`;
        notification.style.cssText = `
        position: fixed; top: 10px; right: 10px;
        background: #4285f4; color: white; padding: 1rem;
        border-radius: 5px; z-index: 1000;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

// Эндпоинты для управления push-подписками
app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'Подписка удалена' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Сервер запущен на https://localhost:${PORT}`);
});