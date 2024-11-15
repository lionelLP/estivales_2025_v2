# Base image
FROM node:20-alpine AS base

# Install git for repository cloning
RUN apk add --no-cache git

WORKDIR /app

# Clone stage
FROM base AS source
ARG GITLAB_TOKEN
ARG GITLAB_REPO_URL

RUN git clone https://${GITLAB_TOKEN}@${GITLAB_REPO_URL} .

# Dependencies
FROM base AS deps
COPY --from=source /app/package.json /app/package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=source /app .
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]