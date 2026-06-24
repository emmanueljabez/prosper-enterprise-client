import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const reviewSource = readFileSync(new URL('../pages/app/sessions/review/[id].vue', import.meta.url), 'utf8')
const mentorSource = readFileSync(new URL('../pages/app/mentors/[id].vue', import.meta.url), 'utf8')

assert.match(reviewSource, /DatePicker/, 'Session review should use the shared shadcn date picker for date-time inputs.')
assert.doesNotMatch(reviewSource, /type="datetime-local"/, 'Session review should not render native datetime-local inputs.')
assert.match(reviewSource, /questionnaireResponseItems/, 'Session review should render structured booking questionnaire answers.')
assert.match(reviewSource, /contextDocumentLink/, 'Session review should render uploaded context documents as links.')
assert.match(reviewSource, /Message from Mentee/, 'Questionnaire answers should stay grouped under Message from Mentee.')

assert.match(mentorSource, /canUseSubscriptionDurationForBooking/, 'Mentor booking should only use entitlement duration while the entitlement can book.')
assert.ok(
  mentorSource.includes('bookingSubscriptionContext.value?.canBookSession === true'),
  'Exhausted free trials should not keep driving the booking duration.'
)

console.log('Session review booking flow verified.')
