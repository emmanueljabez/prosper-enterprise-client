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
  /pm2 delete "\$id"/,
  'Deployment should delete stale PM2 process ids to replace stale dev commands.',
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
  /stop_port_3000_listener/,
  'Deployment should stop stale unmanaged processes that are still bound to port 3000.',
)

assert.match(
  source,
  /delete_stale_pm2_apps/,
  'Deployment should remove stale PM2 processes for this app before starting production.',
)

assert.match(
  source,
  /pm2 jlist/,
  'Deployment should inspect PM2 process metadata instead of only deleting by process name.',
)

assert.match(
  source,
  /lsof -ti tcp:3000|fuser -k 3000\/tcp/,
  'Deployment should identify and clear the process serving port 3000 before PM2 starts.',
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

console.log('Deploy script production start verified.')
