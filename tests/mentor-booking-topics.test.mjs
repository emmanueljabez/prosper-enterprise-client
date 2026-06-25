import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mentorPage = readFileSync(resolve('pages/app/mentors/[id].vue'), 'utf8')

assert.match(
  mentorPage,
  /const FALLBACK_MENTOR_SESSION_TOPICS = \[[\s\S]*'General Career Guidance'[\s\S]*'Professional Development'[\s\S]*'Personal Growth'[\s\S]*'Other'[\s\S]*\]/,
  'Enterprise mentor booking should use the same generic fallback topics as B2C.',
)

assert.match(
  mentorPage,
  /const canonicalTopics = normalizeMentorTopics\(mentor\.value\?\.mentorSkillTopics\)[\s\S]*if \(canonicalTopics\.length\) \{[\s\S]*return canonicalTopics/,
  'Mentor booking should prefer canonical backend mentorSkillTopics before fallback topics.',
)

assert.match(
  mentorPage,
  /mentorSkillTopics:\s*mentorProfile\.mentorSkillTopics \|\| mentorProfile\.topics \|\| \[\]/,
  'Mentor API mapping should preserve canonical mentorSkillTopics from the backend response.',
)

assert.match(
  mentorPage,
  /topics:\s*mentorProfile\.topics \|\| mentorProfile\.mentorSkillTopics \|\| \[\]/,
  'Mentor API mapping should preserve explicit backend topics for compatibility.',
)

assert.match(
  mentorPage,
  /const fallbackTopics = normalizeMentorTopics\(FALLBACK_MENTOR_SESSION_TOPICS\)[\s\S]*return fallbackTopics/,
  'Mentor booking should keep the session topic selector usable when a mentor has no configured topics.',
)
