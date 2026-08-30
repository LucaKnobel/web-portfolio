# syntax=docker/dockerfile:1

# Declared before the first FROM so it can be re-declared in any stage that needs it.
ARG APP_VERSION=dev

# Shared Node.js base image for build and runtime stages.
FROM node:24-trixie-slim AS base

WORKDIR /app


# Install production dependencies separately to keep the runtime image minimal.
FROM base AS production-dependencies

COPY package.json package-lock.json ./

# Cache the npm package cache between builds to speed up dependency installation.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


# Install all dependencies and build the Astro application.
FROM base AS build

# Astro validates the APP_VERSION env schema during `astro build`, so it must
# be set here too, not just in the runtime stage.
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

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
    PORT=4321

# Copy only the dependencies and build artifacts required at runtime.
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

# Run the application as the unprivileged Node.js user.
USER node

# Re-declared here so the running container reports the same version baked into the build stage.
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

EXPOSE 4321

# Verify that the Astro server is responding inside the container.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:4321/').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# Start the Astro standalone Node.js server.
CMD ["node", "./dist/server/entry.mjs"]