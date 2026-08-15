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
  /run_with_ssh_retries\(\)/,
  'The deploy script should retry transient SSH transport failures.',
)

assert.match(
  deployScript,
  /ssh_once\(\)/,
  'The deploy script should separate one-shot SSH execution from retry orchestration.',
)

assert.match(
  deployScript,
  /ssh_script\(\)/,
  'The deploy script should retry remote scripts by re-sending stdin on every attempt.',
)

assert.match(
  deployScript,
  /printf '%s\\n' "\$script" \| ssh_once "\$@"/,
  'Remote script retries should pipe a fresh copy of the script into each SSH attempt.',
)

assert.match(
  deployScript,
  /run_with_ssh_retries scp_once/,
  'Password-based SCP uploads should run through the SSH retry wrapper.',
)

assert.match(
  deployScript,
  /"\$status" -ne 255/,
  'The SSH retry wrapper should retry only SSH transport failures.',
)

assert.doesNotMatch(
  deployScript,
  /printf '%s\\n' "\$remote_deploy_script" \| ssh_cmd/,
  'Remote deploy script execution should not use the generic ssh_cmd retry wrapper because it can consume stdin before retrying.',
)

assert.match(
  deployScript,
  /ssh_script "\$remote_deploy_script" "DEPLOY_TARGET_DIR='\$DEPLOY_TARGET_DIR'/,
  'The remote deploy block should use the stdin-aware SSH script runner.',
)

assert.doesNotMatch(
  deployScript,
  /ssh_cmd[\s\S]*<<\s*'EOF'/,
  'sshpass fails against the production host when ssh_cmd receives the remote script through a heredoc.',
)

console.log('Deploy script remote execution verified.')
