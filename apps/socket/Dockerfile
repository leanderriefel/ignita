# ┌─────────── Base image (common to all stages) ───────────┐
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript files
ENV NODE_ENV=production
RUN bun run build

# Switch to non-root user
USER bun

# tell Docker that the container listens on port 3000
EXPOSE 3000/tcp

# Run the compiled JavaScript file
CMD ["bun", "run", "start"]
