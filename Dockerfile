# syntax = docker/dockerfile:1
ARG NODE_VERSION=26.5.0
FROM --platform=linux/amd64 node:${NODE_VERSION}-slim AS base
LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ARG PNPM_VERSION=10.34.5
RUN npm install -g pnpm@$PNPM_VERSION --force

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install node modules
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Build application
RUN pnpm build

# Remove development dependencies
RUN pnpm prune --prod

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Setup sqlite3 on a separate volume
RUN mkdir -p /data
VOLUME /data

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
ENV DATABASE_URL="file:///data/sqlite.db"
ENV TI4_LAB_DATABASE_PATH="file:///data/sqlite.db"
CMD [ "pnpm", "start" ]