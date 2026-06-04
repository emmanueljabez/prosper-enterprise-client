#!/bin/bash

set -euo pipefail

echo "🚀 Starting deployment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

load_deploy_env() {
    local candidate
    for candidate in \
        "$SCRIPT_DIR/.deploy/prod.env" \
        "$SCRIPT_DIR/deploy.env" \
        "/Users/macbookpro/IdeaProjects/ProsperMentor/.deploy/prod.env"; do
        if [ -f "$candidate" ]; then
            set -a
            # shellcheck disable=SC1090
            source "$candidate"
            set +a
            return 0
        fi
    done
    return 0
}

load_deploy_env

DEPLOY_SERVER="${DEPLOY_SERVER:-109.123.250.133}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_TARGET_DIR="${DEPLOY_TARGET_DIR:-/var/www/html/prosper_enterprise}"

SSHPASS_BIN="$(command -v sshpass || true)"
if [ -z "$SSHPASS_BIN" ]; then
    for candidate in /opt/homebrew/bin/sshpass /usr/local/bin/sshpass; do
        if [ -x "$candidate" ]; then
            SSHPASS_BIN="$candidate"
            break
        fi
    done
fi

SSH_OPTS=(
    -o StrictHostKeyChecking=no
    -o UserKnownHostsFile=/dev/null
    -o LogLevel=ERROR
    -o PreferredAuthentications=password
    -o PubkeyAuthentication=no
    -o NumberOfPasswordPrompts=1
    -o ConnectTimeout=30
)

ssh_cmd() {
    if [ -n "${DEPLOY_PASSWORD:-}" ] && [ -n "$SSHPASS_BIN" ]; then
        "$SSHPASS_BIN" -p "$DEPLOY_PASSWORD" ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_SERVER" "$@"
    else
        ssh "$DEPLOY_USER@$DEPLOY_SERVER" "$@"
    fi
}

scp_cmd() {
    if [ -n "${DEPLOY_PASSWORD:-}" ] && [ -n "$SSHPASS_BIN" ]; then
        "$SSHPASS_BIN" -p "$DEPLOY_PASSWORD" scp "${SSH_OPTS[@]}" "$@"
    else
        scp "$@"
    fi
}

cleanup() {
    if [ -n "${LOCAL_PREVIEW_PID:-}" ]; then
        kill "$LOCAL_PREVIEW_PID" >/dev/null 2>&1 || true
        wait "$LOCAL_PREVIEW_PID" >/dev/null 2>&1 || true
    fi
    rm -f deployment.tar.gz
    rm -f "${LOCAL_HEALTH_HTML:-}" "${LOCAL_PREVIEW_LOG:-}"
}

trap cleanup EXIT

stop_local_nuxt_dev_processes() {
    echo "🔎 Checking for local Nuxt dev processes..."

    if ! command -v node >/dev/null 2>&1; then
        echo "⚠️  Node is unavailable locally; skipping local Nuxt dev cleanup"
        return 0
    fi

    local local_dev_pids
    local_dev_pids=$(ps -Ao pid=,command= | node -e '
const fs = require("fs")
const scriptDir = process.argv[1]
const input = fs.readFileSync(0, "utf8")

for (const rawLine of input.split("\n")) {
  const line = rawLine.trim()
  if (!line) continue

  const match = line.match(/^(\d+)\s+(.*)$/)
  if (!match) continue

  const [, pid, command] = match
  const inWorkspace = command.includes(scriptDir)
  const isNuxtDev =
    command.includes("npm run dev") ||
    command.includes("yarn dev") ||
    command.includes("pnpm dev") ||
    /\b(?:nuxt|nuxi)\b.*\bdev\b/.test(command)

  if (inWorkspace && isNuxtDev) {
    console.log(pid)
  }
}
' "$SCRIPT_DIR")

    if [ -z "$local_dev_pids" ]; then
        echo "✅ No local Nuxt dev processes found"
        return 0
    fi

    echo "🧹 Stopping local Nuxt dev process(es): $local_dev_pids"
    kill $local_dev_pids >/dev/null 2>&1 || true
    sleep 2

    local still_running
    still_running=$(ps -p $local_dev_pids -o pid= 2>/dev/null | xargs || true)
    if [ -n "$still_running" ]; then
        echo "🧹 Force stopping local Nuxt dev process(es): $still_running"
        kill -9 $still_running >/dev/null 2>&1 || true
        sleep 1
    fi
}

verify_local_build_artifact() {
    LOCAL_HEALTH_HTML="$(mktemp -t prosper-enterprise-local-build.XXXXXX.html)"
    LOCAL_PREVIEW_LOG="$(mktemp -t prosper-enterprise-local-preview.XXXXXX.log)"

    local port=3100
    if command -v lsof >/dev/null 2>&1; then
        while lsof -ti "tcp:${port}" -sTCP:LISTEN >/dev/null 2>&1; do
            port=$((port + 1))
        done
    fi

    echo "🔍 Verifying local production build on port ${port}..."
    NODE_ENV=production HOST=127.0.0.1 PORT="$port" node .output/server/index.mjs >"$LOCAL_PREVIEW_LOG" 2>&1 &
    LOCAL_PREVIEW_PID=$!

    local max_attempts=6
    local attempt=1
    local asset_path=""

    while [ $attempt -le $max_attempts ]; do
        if curl -f -sS --max-time 10 "http://127.0.0.1:${port}/" -o "$LOCAL_HEALTH_HTML"; then
            if grep -Eq '@vite/client|WebstormProjects|/_nuxt/Users/' "$LOCAL_HEALTH_HTML"; then
                echo "❌ Local production build is still serving dev-only Nuxt assets"
                sed -n '1,20p' "$LOCAL_HEALTH_HTML"
                return 1
            fi

            asset_path=$(grep -oE '/_nuxt/[^" ]+\.js' "$LOCAL_HEALTH_HTML" | head -1 || true)
            if [ -n "$asset_path" ] && curl -f -sS -I --max-time 10 "http://127.0.0.1:${port}${asset_path}" >/dev/null; then
                echo "✅ Local production build is serving production Nuxt assets"
                return 0
            fi
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    echo "❌ Local production build verification failed"
    if [ -f "$LOCAL_PREVIEW_LOG" ]; then
        tail -20 "$LOCAL_PREVIEW_LOG" || true
    fi
    return 1
}

# Build the application
echo "📦 Building application..."
stop_local_nuxt_dev_processes
rm -rf .nuxt .output
if ! NODE_ENV=production npm run build; then
    echo "❌ Build failed!"
    exit 1
fi

if ! verify_local_build_artifact; then
    echo "❌ Aborting deployment because the local build artifact is not production-safe"
    exit 1
fi

# Create deployment package
echo "📁 Creating deployment package..."
tar -czf deployment.tar.gz .output package.json package-lock.json

# Upload to server
echo "⬆️  Uploading to server..."
if ! scp_cmd deployment.tar.gz "$DEPLOY_USER@$DEPLOY_SERVER:$DEPLOY_TARGET_DIR/"; then
    echo "❌ Upload failed!"
    exit 1
fi

# Deploy on server
echo "🔄 Deploying on server..."
ssh_cmd << 'EOF'
set -euo pipefail

cd /var/www/html/prosper_enterprise
echo "📂 Extracting files..."
rm -rf .output
tar -xzf deployment.tar.gz
echo "📦 Installing dependencies..."
npm ci --omit=dev --ignore-scripts

delete_stale_pm2_apps() {
    echo "🔎 Checking PM2 for stale app processes..."

    if ! command -v pm2 >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
        echo "⚠️  PM2 or node is unavailable; skipping PM2 metadata cleanup"
        return 0
    fi

    local stale_ids
    stale_ids=$(pm2 jlist | node -e '
const fs = require("fs")
const cwd = process.cwd()
const apps = JSON.parse(fs.readFileSync(0, "utf8"))

for (const app of apps) {
  const env = app.pm2_env || {}
  const name = app.name || ""
  const appCwd = env.pm_cwd || ""
  const execPath = env.pm_exec_path || ""
  const args = Array.isArray(env.args) ? env.args.join(" ") : String(env.args || "")

  if (
    name === "nuxt-app" ||
    appCwd === cwd ||
    execPath.includes("/node_modules/.bin/nuxt") ||
    args.includes("nuxt dev") ||
    args.includes("nuxt start")
  ) {
    console.log(app.pm_id)
  }
}
' || true)

    if [ -n "$stale_ids" ]; then
        echo "🧹 Deleting stale PM2 app id(s): $stale_ids"
        for id in $stale_ids; do
            pm2 delete "$id" >/dev/null 2>&1 || true
        done
    fi
}

stop_port_3000_listener() {
    echo "🔎 Checking for existing listeners on port 3000..."

    if command -v lsof >/dev/null 2>&1; then
        local pids
        pids=$(lsof -ti tcp:3000 -sTCP:LISTEN || true)

        if [ -n "$pids" ]; then
            echo "🧹 Stopping stale port 3000 listener(s): $pids"
            kill $pids >/dev/null 2>&1 || true
            sleep 2

            pids=$(lsof -ti tcp:3000 -sTCP:LISTEN || true)
            if [ -n "$pids" ]; then
                echo "🧹 Force stopping stale port 3000 listener(s): $pids"
                kill -9 $pids >/dev/null 2>&1 || true
                sleep 1
            fi
        fi
    elif command -v fuser >/dev/null 2>&1; then
        if fuser 3000/tcp >/dev/null 2>&1; then
            echo "🧹 Stopping stale port 3000 listener with fuser"
            fuser -k 3000/tcp >/dev/null 2>&1 || true
            sleep 2
        fi
    else
        echo "⚠️  Neither lsof nor fuser is available; cannot pre-clear port 3000"
    fi
}

echo "🔄 Recreating production PM2 process..."
delete_stale_pm2_apps
stop_port_3000_listener
NODE_ENV=production HOST=127.0.0.1 PORT=3000 pm2 start .output/server/index.mjs --name "nuxt-app" --interpreter node --update-env
pm2 save
echo "⏳ Waiting for application to start..."
sleep 10
echo "🔍 Checking application health..."

# Health check function
check_health() {
    local max_attempts=6
    local attempt=1
    local wait_time=10
    local html_file="/tmp/prosper-enterprise-health.html"

    verify_production_html() {
        local base_url="$1"
        local label="$2"

        if ! curl -f -sS --max-time 10 "$base_url/" -o "$html_file"; then
            echo "⚠️  $label is not responding to HTTP requests"
            return 1
        fi

        if grep -Eq '@vite/client|WebstormProjects|/_nuxt/Users/' "$html_file"; then
            echo "❌ $label is serving dev-only Nuxt assets"
            sed -n '1,20p' "$html_file"
            return 1
        fi

        local asset_path
        asset_path=$(grep -oE '/_nuxt/[^" ]+\.js' "$html_file" | head -1 || true)
        if [ -z "$asset_path" ]; then
            echo "⚠️  $label HTML did not expose a production JS asset"
            return 1
        fi

        if ! curl -f -sS -I --max-time 10 "${base_url%/}$asset_path" >/dev/null; then
            echo "⚠️  $label production JS asset is not reachable: $asset_path"
            return 1
        fi

        echo "✅ $label is serving production Nuxt assets"
        return 0
    }
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Health check attempt $attempt/$max_attempts..."
        
        # Check if PM2 process is running
        if pm2 list | grep -q "nuxt-app.*online"; then
            echo "✅ PM2 process is running"
            
            if verify_production_html "http://127.0.0.1:3000" "Local app" && \
               verify_production_html "https://enterprise.prospermentor.com" "Public domain"; then
                echo "🎉 Health check passed!"
                return 0
            fi
        else
            echo "❌ PM2 process is not running properly"
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            echo "⏳ Waiting ${wait_time}s before next attempt..."
            sleep $wait_time
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "❌ Health check failed after $max_attempts attempts"
    echo "📊 PM2 Status:"
    pm2 status nuxt-app
    echo "📋 Recent logs:"
    pm2 logs nuxt-app --lines 20 --nostream
    return 1
}

# Run health check
if check_health; then
    echo "✅ Application is healthy and running!"
else
    echo "❌ Application health check failed!"
    echo "🔧 Deployment failed because application is not serving production assets"
    exit 1
fi

echo "🧹 Cleaning up..."
rm deployment.tar.gz
echo "✅ Server deployment completed!"
EOF

echo "🎉 Deployment completed successfully!"
echo "🌐 Your site should be updated at: https://enterprise.prospermentor.com"
