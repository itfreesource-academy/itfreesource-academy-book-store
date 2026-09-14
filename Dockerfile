# Multi-stage Dockerfile for ITFreeSource Academy Book Store
FROM node:22-alpine AS builder

WORKDIR /app

# Build Server
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server ./server
RUN cd server && npm run build

# Build Client
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

# Runtime Stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/server/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist ./public

EXPOSE 5000

CMD ["node", "dist/index.js"]
