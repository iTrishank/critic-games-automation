FROM mcr.microsoft.com/playwright:v1.62.0-noble

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["sh", "-c", "npm run start -- --port ${PORT}"]