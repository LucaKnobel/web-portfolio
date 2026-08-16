# syntax=docker/dockerfile:1

# Shared Node.js base image for build and runtime stages.
FROM node:24-bookworm-slim AS base

WORKDIR /app


# Install production dependencies separately to keep the runtime image minimal.
FROM base AS production-dependencies

COPY package.json package-lock.json ./

# Cache the npm package cache between builds to speed up dependency installation.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


# Install all dependencies and build the Astro application.
FROM base AS build

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npm run build


# Create the final production image containing only runtime dependencies
# and the compiled Astro server.
FROM base AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321 \
    DATABASE_URL=/app/data/portfolio.db

# Create the SQLite data directory and grant ownership to the non-root user.
RUN mkdir -p /app/data && chown node:node /app/data

# Copy only the dependencies and build artifacts required at runtime.
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

# Run the application as the unprivileged Node.js user.
USER node

EXPOSE 4321

# Start the Astro standalone Node.js server.
CMD ["node", "./dist/server/entry.mjs"]