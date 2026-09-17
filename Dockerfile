# ============ Stage 1: Build React frontend ============
FROM node:22-alpine AS web-build
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ .
RUN npm run build

# ============ Stage 2: Install production deps ============
FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# ============ Stage 3: Runtime ============
FROM node:22-alpine
RUN apk add --no-cache curl sqlite
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=web-build /web/dist ./web/dist

ENV PORT=8410
EXPOSE 8410

CMD ["node", "server.js"]
