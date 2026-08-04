import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const mentorsRouteSource = readFileSync(
  new URL('../pages/app/mentors/index.vue', import.meta.url),
  'utf8',
)

assert.match(
  mentorsRouteSource,
  /EnterpriseMentorWorkspace|app\/admin\/mentors\.vue/,
  'The /app/mentors route should render the enterprise mentor workspace.',
)

assert.doesNotMatch(
  mentorsRouteSource,
  /Find Your Mentor|useMentorsStore|MentorCard/,
  'The /app/mentors route should no longer render the legacy marketplace page directly.',
)

console.log('Enterprise mentors route workspace verified.')
