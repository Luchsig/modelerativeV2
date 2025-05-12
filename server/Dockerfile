FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 1234

ENV HOST=0.0.0.0

CMD ["npx", "y-websocket", "--port", "1234"]