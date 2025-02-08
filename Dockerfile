# Stage 1: Building the code
FROM node:18-alpine AS builder

WORKDIR /cuotas-socios

RUN apk add --no-cache yarn

# Install dependencies for building
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# Stage 2: Run the built code
FROM node:18-alpine AS runner
WORKDIR /cuotas-socios

# Set to production
ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /cuotas-socios/public ./public
COPY --from=builder /cuotas-socios/package.json ./package.json
COPY --from=builder /cuotas-socios/yarn.lock ./yarn.lock

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /cuotas-socios/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /cuotas-socios/.next/static ./.next/static

# Set user
USER nextjs

# Expose and run
EXPOSE 3046
ENV PORT 3046

CMD ["node", "server.js"]
