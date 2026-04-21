const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createClient } = require("redis");
const { nanoid } = require("nanoid");

const app = express();
app.use(express.json());

const PORT = 3000;

// Секреты подписи
const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";

// Время жизни токенов
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// Время хранения кэша
const USERS_CACHE_TTL = 60;       // 1 минута
const PRODUCTS_CACHE_TTL = 600;   // 10 минут

// { id, username, passwordHash, role, blocked }
let users = [];

// { id, name, price, description }
let products = [];

// Хранилище refresh-токенов
const refreshTokens = new Set();

// Redis client
const redisClient = createClient({
    url: "redis://127.0.0.1:6379"
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

async function initRedis() {
    await redisClient.connect();
    console.log("Redis connected");
}

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: user.role
        },
        ACCESS_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: user.role
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
}

// Auth middleware
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header",
        });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);

        const user = users.find((u) => u.id === payload.sub);
        if (!user || user.blocked) {
            return res.status(401).json({
                error: "User not found or blocked",
            });
        }

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}

// Role middleware
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }
        next();
    };
}

// Middleware чтения из кэша
function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                return res.json({
                    source: "cache",
                    data: JSON.parse(cachedData)
                });
            }

            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error("Cache read error:", err);
            next();
        }
    };
}

// Сохранение ответа в кэш
async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), {
            EX: ttl
        });
    } catch (err) {
        console.error("Cache save error:", err);
    }
}

// Удаление кэша пользователей
async function invalidateUsersCache(userId = null) {
    try {
        await redisClient.del("users:all");
            if (userId) {
            await redisClient.del(`users:${userId}`);
        }
    } catch (err) {
        console.error("Users cache invalidate error:", err);
    }
}

// Удаление кэша товаров
async function invalidateProductsCache(productId = null) {
    try {
        await redisClient.del("products:all");
            if (productId) {
            await redisClient.del(`products:${productId}`);
        }
    } catch (err) {
        console.error("Products cache invalidate error:", err);
    }
}

// ---------------- AUTH ----------------

app.post("/api/auth/register", async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "username and password are required",
        });
    }

    const exists = users.some((u) => u.username === username);
    if (exists) {
        return res.status(409).json({
            error: "username already exists",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        id: String(users.length + 1),
        username,
        passwordHash,
        role: role || "user",
        blocked: false
    };

    users.push(user);

    res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        blocked: user.blocked
    });
});

app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "username and password are required",
        });
    }

    const user = users.find((u) => u.username === username);
    if (!user || user.blocked) {
        return res.status(401).json({
            error: "Invalid credentials or user is blocked",
        });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({
            error: "Invalid credentials",
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    res.json({
        accessToken,
        refreshToken,
    });
});

app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: "refreshToken is required",
        });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Invalid refresh token",
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find((u) => u.id === payload.sub);
        if (!user || user.blocked) {
            return res.status(401).json({
                error: "User not found or blocked",
            });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
});

app.get("/api/auth/me", authMiddleware, roleMiddleware(["user", "seller", "admin"]), (req, res) => {
    const user = users.find((u) => u.id === req.user.sub);

    res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        blocked: user.blocked
    });
});

// ---------------- USERS ----------------

// Получить список пользователей (кэш 1 минута)
app.get(
    "/api/users",
    authMiddleware,
    roleMiddleware(["admin"]),
    cacheMiddleware(() => "users:all", USERS_CACHE_TTL),
    async (req, res) => {
        const data = users.map((u) => ({
            id: u.id,
            username: u.username,
            role: u.role,
            blocked: u.blocked
        }));

        await saveToCache(req.cacheKey, data, req.cacheTTL);

        res.json({
            source: "server",
            data
        });
    }
);

// Получить пользователя по id (кэш 1 минута)
app.get(
    "/api/users/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL),
    async (req, res) => {
        const user = users.find((u) => u.id === req.params.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const data = {
            id: user.id,
            username: user.username,
            role: user.role,
            blocked: user.blocked
        };

        await saveToCache(req.cacheKey, data, req.cacheTTL);

        res.json({
            source: "server",
            data
        });
    }
);

// Обновить пользователя
app.put("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const { username, role, blocked } = req.body;
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    if (username !== undefined) user.username = username;
    if (role !== undefined) user.role = role;
    if (blocked !== undefined) user.blocked = blocked;

    await invalidateUsersCache(user.id);

    res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        blocked: user.blocked
    });
});

// Заблокировать пользователя
app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    user.blocked = true;

    await invalidateUsersCache(user.id);

    res.json({
        message: "User blocked",
        id: user.id
    });
});

// ---------------- PRODUCTS ----------------

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
app.post(
    "/api/products", 
    authMiddleware, 
    roleMiddleware(["admin", "seller"]),  
    async (req, res) => {
    const { name, category, description, price, quantity } = req.body;

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        quantity: Number(quantity),
    };

    products.push(newProduct);

    await invalidateProductsCache();

    res.status(201).json(newProduct);
});

// Функция для получения всех товаров
app.get(
    "/api/products", 
    authMiddleware, 
    roleMiddleware(["user", "seller", "admin"]), 
    cacheMiddleware(() => "products:all", PRODUCTS_CACHE_TTL),
    async (req, res) => {

        await saveToCache(req.cacheKey, products, req.cacheTTL);

        res.json({
            source: "server",
            data: products
        });
    }
);

// Функция для получения товара по id
app.get(
    "/api/products/:id", 
    authMiddleware, 
    roleMiddleware(["user", "seller", "admin"]), 
    cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
    async (req, res) => {
        const id = req.params.id;
        const product = findProductOr404(id, res);

        if (!product) return;

        await saveToCache(req.cacheKey, product, req.cacheTTL);

        res.json({
            source: "server",
            data: product
        });
    }
);

// Функция для редактирования информации о товаре по id
app.patch(
    "/api/products/:id", 
    authMiddleware, 
    roleMiddleware(["admin", "seller"]), 
    async (req, res) => {
        const id = req.params.id;
        const product = findProductOr404(id, res);
        if (!product) return;

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

        await invalidateProductsCache(product.id);

        res.json(product);
    }
);

// Функция для удаления товара по id
app.delete(
    "/api/products/:id", 
    authMiddleware, 
    roleMiddleware(["admin", "seller"]), 
    async (req, res) => {
    const id = req.params.id;
    const exists = products.some((u) => u.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });
    products = products.filter((u) => u.id !== id);

    await invalidateProductsCache(id);

    res.status(204).send();
});

initRedis().then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
});