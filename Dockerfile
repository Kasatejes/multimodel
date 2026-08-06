# Multistage Dockerfile for Production Deployment
FROM node:20-alpine AS backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=backend-build /app/server/dist ./server/dist
COPY --from=backend-build /app/server/package*.json ./server/
COPY --from=backend-build /app/server/node_modules ./server/node_modules
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 5000
CMD ["node", "server/dist/server.js"]
