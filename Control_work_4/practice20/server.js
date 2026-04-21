const mongoose = require('mongoose');
const express = require('express');
const app = express();

// Подключение к MongoDB
mongoose.connect('mongodb://YourMongoAdmin:1234@localhost:27017/admin')

.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

app.use(express.json());

const userSchema = new mongoose.Schema({
    ID: { type: Number, unique: true, default: Date.now() },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, required: true },
    created_at: { type: Date, default: Date.now() },
    updated_at: { type: Date, default: Date.now() }
});

const User = mongoose.model('User', userSchema);

app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ ID: req.params.id });
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { ID: req.params.id },
            req.body,
            { returnDocument: 'after' } // Возвращает обновленный документ
        );
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ ID: req.params.id });
        if (!user) return res.status(404).send('User not found');
        res.send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});