FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Ensure guests.json exists
RUN if [ ! -f guests.json ]; then echo '[]' > guests.json; fi

EXPOSE 3000

CMD ["node", "server.js"]