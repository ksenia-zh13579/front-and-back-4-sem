const express = require('express');
const { nanoid } = require('nanoid');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

const cors = require("cors");

// middleware с разрешениями политики cors
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
})); 

// массив товаров
let products = [
    {
        id: nanoid(6), 
        name: 'Нитки мулине', 
        category: 'Вышивание',
        description: 'Моток ниток мулине 8 м, цвета в ассортименте',
        price: 90,
        quantity: 100
    },
    {
        id: nanoid(6), 
        name: 'Пряжа шерстяная', 
        category: 'Вязание',
        description: 'Моток пряжи шерстяной 50 м, цвета в ассортименте',
        price: 150,
        quantity: 100
    },
    {
        id: nanoid(6), 
        name: 'Канва Aida 14ct', 
        category: 'Вышивание',
        description: 'Канва 14ct для вышивания крестом нитками мулине',
        price: 350,
        quantity: 80
    },
    {
        id: nanoid(6), 
        name: 'Иглы гобеленовые', 
        category: 'Вышивание',
        description: 'Иглы гобеленовые размера 20-24, подходят для вышивания по плотной ткани и по канве размера 14-16 ct',
        price: 335,
        quantity: 50
    },
    {
        id: nanoid(6), 
        name: 'Пряжа льняная', 
        category: 'Вязание',
        description: 'Моток пряжи шерстяной 50 м, цвета в ассортименте',
        price: 450,
        quantity: 120
    },
    {
        id: nanoid(6), 
        name: 'Набор крючков для вязания', 
        category: 'Вязание',
        description: 'Крючки для вязания 8 шт, подходят для шерстяной и льняной пряжи',
        price: 365,
        quantity: 40
    },
    {
        id: nanoid(6), 
        name: 'Набор спиц', 
        category: 'Вязание',
        description: 'Набор спиц для вязания 10 шт, 5 пар',
        price: 447,
        quantity: 50
    },
    {
        id: nanoid(6), 
        name: 'Шпагат джутовый 1.7 мм', 
        category: 'Плетение',
        description: 'Моток шпагата, 100% джут, ширина 1.7 мм, 10 м, цвет в ассортименте',
        price: 99,
        quantity: 60
    },
    {
        id: nanoid(6), 
        name: 'Шнур вощёный 0.8 мм', 
        category: 'Плетение',
        description: 'Моток шнура вощёного, ширина 0.8 мм, 12 м, цвет в ассортименте',
        price: 165,
        quantity: 65
    },
    {
        id: nanoid(6), 
        name: 'Нитки хлопковые 2 мм', 
        category: 'Плетение',
        description: 'Моток ниток, ширина 2 мм, 100% хлопок, 40 м, цвет в ассортименте',
        price: 149,
        quantity: 110
    }
]

// Swagger definition
// Описание основного API
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API интернет-магазина',
            version: '1.0.0',
            description: 'Простое API для управления товарами в интернет-магазине',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },

    // Путь к файлам, в которых мы будем писать JSDoc-комментарии (наш текущий файл)
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
* @swagger
* components:
*     schemas:
*         Product:
*             type: object
*             required:
*                 - name
*                 - category
*                 - description
*                 - price
*                 - quantity
*             properties:
*                 id:
*                     type: string
*                     description: Автоматически сгенерированный уникальный ID товара
*                 name:
*                     type: string
*                     description: Название товара
*                 category:
*                     type: string 
*                     description: Категория товара
*                 description:
*                     type: string
*                     description: Описание товара
*                 price:
*                     type: number
*                     description: Цена за 1 шт товара
*                 quantity:
*                     type: integer
*                     description: Количество единиц товара в наличии
*             example:
*                 id: "abc123"
*                 name: "Канва Aida 14ct"
*                 category: "Вышивание"
*                 description: "Канва 14ct для вышивания крестом нитками мулине"
*                 price: 350
*                 quantity: 100
*/

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}]
        ${res.statusCode} ${req.path}`);

        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// Функция-помощник для получения товара из списка
function findProductOr404(id, res) {
    const product = products.find(u => u.id == id);

    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }

    return product;
}

// Функция для добавления нового товара
// POST /api/products
/**
* @swagger
* /api/products:
*     post:
*         summary: Создает новый товар
*         tags: [Products]
*         requestBody:
*             required: true
*             content:
*                 application/json:
*                     schema:
*                         type: object
*                         required:
*                             - name
*                             - category
*                             - description
*                             - price
*                             - quantity
*                         properties:
*                             name:
*                                 type: string
*                             category:
*                                 type: string 
*                             description:
*                                 type: string
*                             price:
*                                 type: number
*                             quantity:
*                                 type: integer
*         responses:
*             201:
*                 description: Товар успешно добавлен
*                 content:
*                     application/json:
*                         schema:
*                             $ref: '#/components/schemas/Product'
*             400:
*                 description: Ошибка в теле запроса
*/
app.post("/api/products", (req, res) => {
    const { name, category, description, price, quantity } = req.body;

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        quantity: Number(quantity)
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Функция для получения всех товаров
// GET /api/products

/**
* @swagger
* /api/products:
*     get:
*         summary: Возвращает список всех товаров
*         tags: [Products]
*         responses:
*             200:
*                 description: Список товаров
*                 content:
*                     application/json:
*                         schema:
*                             type: array
*                             items:
*                                 $ref: '#/components/schemas/Product'
*/
app.get("/api/products", (req, res) => {
    res.json(products);
});

// Функция для получения пользователя по id
// GET /api/products/:id

/**
* @swagger
* /api/products/{id}:
*     get:
*         summary: Получает товар по ID
*         tags: [Products]
*         parameters:
*             - in: path
*               name: id
*               schema:
*                   type: string
*               required: true
*               description: ID товара
*         responses:
*             200:
*                 description: Данные товара
*                 content:
*                     application/json:
*                         schema:
*                             $ref: '#/components/schemas/Product'
*             404:
*                 description: Товар не найден
*/
app.get("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);

    if (!product) return;

    res.json(product);
});

// Функция для редактирования информации о товаре по id
// PATCH /api/products/:id

/**
* @swagger
* /api/products/{id}:
*     patch:
*         summary: Обновляет данные товара
*         tags: [Products]
*         parameters:
*             - in: path
*               name: id
*               schema:
*                   type: string
*               required: true
*               description: ID товара
*         requestBody:
*             required: true
*             content:
*                 application/json:
*                     schema:
*                         type: object
*                         properties:
*                             name:
*                                 type: string
*                             category:
*                                 type: string 
*                             description:
*                                 type: string
*                             price:
*                                 type: number
*                             quantity:
*                                 type: integer
*         responses:
*             200:
*                 description: Обновленный товар
*                 content:
*                     application/json:
*                         schema:
*                             $ref: '#/components/schemas/Product'
*             400:
*                 description: Нет данных для обновления
*             404:
*                 description: Товар не найден
*/
app.patch("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const product = findProductOr404(id, res);
    if (!product) return;

    // Нельзя PATCH без полей
    if (req.body?.name === undefined 
        && req.body?.category === undefined 
        && req.body?.description === undefined
        && req.body?.price === undefined
        && req.body?.quantity === undefined) {
        return res.status(400).json({
            error: "Nothing to update",
        });
    }

    const { name, category, description, price, quantity } = req.body;
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    res.json(product);
});

// Функция для удаления товара по id
// DELETE /api/products/:id

/**
* @swagger
* /api/products/{id}:
*     delete:
*         summary: Удаляет товар
*         tags: [Products]
*         parameters:
*             - in: path
*               name: id
*               schema:
*                   type: string
*               required: true
*               description: ID товара
*         responses:
*             204:
*                 description: Товар успешно удален (нет тела ответа)
*             404:
*                 description: Товар не найден
*/
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const exists = products.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });
    products = products.filter((u) => u.id !== id);

    // Правильнее 204 без тела
    res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок (чтобы сервер не падал)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});