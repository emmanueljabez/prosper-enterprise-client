import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const deployScript = readFileSync(new URL('../deploy.sh', import.meta.url), 'utf8')

assert.match(
  deployScript,
  /remote_deploy_script="\$\(cat <<'REMOTE_DEPLOY_SCRIPT'/,
  'The remote deployment script should be prepared separately from the sshpass invocation.',
)

assert.match(
  deployScript,
  /printf '%s\\n' "\$remote_deploy_script" \| ssh_cmd "DEPLOY_TARGET_DIR='\$DEPLOY_TARGET_DIR'/,
  'The remote deployment script should be piped into SSH instead of attached to ssh_cmd as a heredoc.',
)

assert.match(
  deployScript,
  /run_with_ssh_retries\(\)/,
  'The deploy script should retry transient SSH transport failures.',
)

assert.match(
  deployScript,
  /run_with_ssh_retries "\$SSHPASS_BIN" -p "\$DEPLOY_PASSWORD" ssh/,
  'Password-based SSH commands should run through the SSH retry wrapper.',
)

assert.match(
  deployScript,
  /run_with_ssh_retries "\$SSHPASS_BIN" -p "\$DEPLOY_PASSWORD" scp -O/,
  'Password-based SCP uploads should run through the SSH retry wrapper.',
)

assert.match(
  deployScript,
  /"\$status" -ne 255/,
  'The SSH retry wrapper should retry only SSH transport failures.',
)

assert.doesNotMatch(
  deployScript,
  /ssh_cmd[\s\S]*<<\s*'EOF'/,
  'sshpass fails against the production host when ssh_cmd receives the remote script through a heredoc.',
)

console.log('Deploy script remote execution verified.')
