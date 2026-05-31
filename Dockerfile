FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && node server.js"]

FROM node:20-alpine AS cron
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY cron.js ./
CMD ["node", "cron.js"]
