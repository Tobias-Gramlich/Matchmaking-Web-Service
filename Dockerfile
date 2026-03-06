FROM node:20-alpine

WORKDIR /app

# Dependencies
COPY src/package*.json ./
RUN npm ci --only=production

COPY src/ ./

# Port
EXPOSE 3001

CMD ["npm", "start"]
