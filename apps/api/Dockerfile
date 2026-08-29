FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @revloop/db generate
RUN pnpm --filter @revloop/api build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3001
CMD ["node", "apps/api/dist/server.js"]
