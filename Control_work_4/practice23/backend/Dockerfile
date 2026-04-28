# Упрощенный рабочий Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev)
RUN npm install

# Копируем исходный код
COPY . .

EXPOSE 3000
ENV PORT=3000

CMD ["node", "app.js"]