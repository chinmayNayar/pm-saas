FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

RUN apk add --no-cache netcat-openbsd

# Wait for Postgres (service name 'db') before starting the Node.js server.
# This is useful both in docker-compose and production deployments where the
# database might take a few seconds to become ready.
CMD ["sh", "-c", "until nc -z db 5432; do echo 'Waiting for Postgres...'; sleep 2; done; node dist/server.js"]

