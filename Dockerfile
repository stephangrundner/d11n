# syntax=docker/dockerfile:1

# =============================================================================
# d11n — single deployable image (Backend + Frontend + Config)
# See docs/architecture/architecture-overview.md ("Deployment Architektur").
#
# The image runs two processes:
#   - Spring Boot (Java 21)  -> internal port 8080
#   - Next.js (SSR server)   -> public port 3000, proxies /api/* to :8080
# =============================================================================


# -----------------------------------------------------------------------------
# Stage 1: build the Spring Boot fat jar
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS backend-build
WORKDIR /build

# Warm the dependency cache first for faster rebuilds.
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

# Build the executable (boot) jar. Tests are run in CI, not in the image build.
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar


# -----------------------------------------------------------------------------
# Stage 2: build the Next.js frontend (standalone output)
# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install workspace dependencies (root app + @d11n/ui) from the lockfile.
COPY frontend/package.json frontend/package-lock.json ./
COPY frontend/packages/ui/package.json ./packages/ui/package.json
RUN npm ci

# Copy sources and build the design-system library before the Next app.
COPY frontend/ ./
RUN npm run build --workspace @d11n/ui \
 && npm run build


# -----------------------------------------------------------------------------
# Stage 3: runtime — Node base + copied Temurin JRE, both processes
# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runtime

# Bring in a self-contained JRE (jammy/glibc 2.35 is compatible with bookworm).
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"
COPY --from=eclipse-temurin:21-jre-jammy /opt/java/openjdk ${JAVA_HOME}

# tini as PID 1 for correct signal handling / zombie reaping.
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Backend artifact ---
COPY --from=backend-build /build/build/libs/*.jar /app/backend/app.jar

# --- Frontend artifact (Next.js standalone) ---
# server.js + minimal node_modules, then the static assets and public/ tree.
COPY --from=frontend-build /app/.next/standalone /app/frontend
COPY --from=frontend-build /app/.next/static /app/frontend/.next/static
COPY --from=frontend-build /app/public /app/frontend/public

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Run as the unprivileged user that ships with the node image.
RUN chown -R node:node /app
USER node

# Runtime configuration (override at deploy time via Dokploy env vars).
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    BACKEND_PORT=8080 \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

EXPOSE 3000

ENTRYPOINT ["/usr/bin/tini", "--", "/app/docker-entrypoint.sh"]
