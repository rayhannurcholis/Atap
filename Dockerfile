FROM oven/bun:1

WORKDIR /app

COPY . .

RUN bun install

RUN bunx prisma generate
RUN bunx prisma migrate deploy

EXPOSE 8080

CMD ["bun", "run", "src/index.js"]