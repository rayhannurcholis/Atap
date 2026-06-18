FROM oven/bun:1

WORKDIR /app

# Copy manifest + schema dulu supaya layer install ter-cache
# (postinstall menjalankan `prisma generate`, jadi schema harus ada lebih dulu)
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma

RUN bun install --frozen-lockfile

# Baru copy sisa source code
COPY . .

# Pastikan prisma client ter-generate untuk source terbaru
RUN bunx prisma generate

EXPOSE 8080

# migrate deploy dijalankan saat startup (butuh DATABASE_URL), bukan saat build
# pakai `sh` eksplisit agar tidak bergantung pada bit executable file
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
