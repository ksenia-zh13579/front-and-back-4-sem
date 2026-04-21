const { Pool } = require('pg');
const express = require('express');

const { Sequelize, DataTypes } = require('sequelize');

const app = express();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'soft_dev_CW4',
    password: '!XieQingcheng!',
    port: 5432,
});

app.use(express.json());

const sequelize = new Sequelize('soft_dev_CW4', 'postgres', '!XieQingcheng!', {
    host: 'localhost',
    dialect: 'postgres',
});

// Проверка подключения
sequelize.authenticate()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error:', err));

const User = sequelize.define(
    'User', {
        ID: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        first_name: { type: DataTypes.STRING, allowNull: false },
        last_name: { type: DataTypes.STRING, allowNull: false },
        age: {type: DataTypes.INTEGER, allowNull: false}
    }, 
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// Синхронизация с БД
sequelize.sync({ force: true }); // Опция `force` пересоздает таблицы

app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { ID: req.params.id }
        });
        if (user !== null)
            res.send(user);
        res.status(404).send('User Not Found');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/users', async (req, res) => {
    try {
        
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.update(req.body, {
            where: { ID: req.params.id },
            returning: true, // Для PostgreSQL (возвращает обновленную запись)
        });
        res.send(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: { ID: req.params.id } });
        res.send({ message: 'User deleted' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});