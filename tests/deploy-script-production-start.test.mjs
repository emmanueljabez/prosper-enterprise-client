import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../deploy.sh', import.meta.url), 'utf8')

assert.doesNotMatch(
  source,
  /pm2 restart nuxt-app/,
  'Deployment must not preserve an existing PM2 command with pm2 restart.',
)

assert.match(
  source,
  /DEPLOY_TARGET_DIR="\$\{DEPLOY_TARGET_DIR:-\/opt\/prosper\/frontend\}"/,
  'Deployment should default to the live systemd-served frontend directory.',
)

assert.match(
  source,
  /FRONTEND_SERVICE="\$\{FRONTEND_SERVICE:-prosper-frontend\}"/,
  'Deployment should default to the live prosper-frontend systemd service.',
)

assert.match(
  source,
  /\.output\/server\/index\.mjs/,
  'Deployment should run the production Nitro server directly.',
)

assert.match(
  source,
  /NODE_ENV=production/,
  'Deployment should start the server with NODE_ENV=production.',
)

assert.match(
  source,
  /stop_local_nuxt_dev_processes/,
  'Deployment should stop local Nuxt dev processes before building to avoid shipping polluted artifacts.',
)

assert.match(
  source,
  /rm -rf \.nuxt \.output/,
  'Deployment should clean Nuxt build directories before the production build starts.',
)

assert.match(
  source,
  /verify_local_build_artifact/,
  'Deployment should verify the local build artifact before uploading it to the server.',
)

assert.match(
  source,
  /ps -Ao pid=,command= \| node -e/,
  'Deployment should parse the process list via node -e so stdin remains available for ps output.',
)

assert.match(
  source,
  /@vite\/client/,
  'Deployment health check should reject dev-only Vite client HTML.',
)

assert.match(
  source,
  /WebstormProjects|\/Users\//,
  'Deployment health check should reject local filesystem paths in HTML.',
)

assert.match(
  source,
  /systemctl restart "\$FRONTEND_SERVICE"/,
  'Deployment should restart the live systemd frontend service.',
)

assert.doesNotMatch(
  source,
  /\/var\/www\/html\/prosper_enterprise/,
  'Deployment should not default to the legacy PM2 document root.',
)

assert.doesNotMatch(
  source,
  /\bpm2\b/,
  'Deployment should not manage the current frontend through PM2.',
)

console.log('Deploy script production start verified.')
