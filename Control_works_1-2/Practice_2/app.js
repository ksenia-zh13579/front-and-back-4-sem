const express = require('express');
const app = express();
const port = 3000;

let products = [
    {
        id: 1, 
        title: 'Ручка синяя шариковая',
        cost: 110
    },
    {
        id: 2, 
        title: 'Карандаш простой',
        cost: 60
    },
    {
        id: 3, 
        title: 'Бумага для принтера',
        cost: 350
    }
]

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Главная страница');
});

app.post('/products', (req, res) => {
    const { title, cost } = req.body;
    const newProduct = {
        id: Date.now(),
        title,
        cost
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/products', (req, res) => {
    res.send(JSON.stringify(products));
});

app.get('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);

    if (product === undefined)
    {
        res.status(404).send('ERROR NOT FOUND');
        return;
    }
    
    res.send(JSON.stringify(product));
});

app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    const { title, cost } = req.body;
    if (title !== undefined) product.title = title;
    if (cost !== undefined) product.cost = cost;
    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    if (products.find(p => p.id == req.params.id) === undefined)
    {
        res.status(404).send('ERROR NOT FOUND');
        return;
    }
    products = products.filter(p => p.id != req.params.id);
    res.send('Ok');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});