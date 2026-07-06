#!/usr/bin/env bash
# Start backend and frontend together. If either exits, the container exits so
# the orchestrator (Dokploy) can restart it.
set -euo pipefail

# --- Backend: Spring Boot on ${BACKEND_PORT} (internal) ---
java ${JAVA_OPTS:-} \
  -Dserver.port="${BACKEND_PORT:-8080}" \
  -jar /app/backend/app.jar &
backend_pid=$!

# --- Frontend: Next.js standalone server on ${PORT} (public) ---
node /app/frontend/server.js &
frontend_pid=$!

# Forward termination signals to both children for a graceful shutdown.
terminate() {
  kill -TERM "$backend_pid" "$frontend_pid" 2>/dev/null || true
}
trap terminate TERM INT

# Exit as soon as either process stops.
wait -n "$backend_pid" "$frontend_pid"
exit_code=$?
terminate
exit "$exit_code"
