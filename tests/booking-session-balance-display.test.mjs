import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mentorPage = readFileSync(resolve('pages/app/mentors/[id].vue'), 'utf8')
const calendarComponent = readFileSync(resolve('components/ui/mentors/MentorAvailabilityCalendar.vue'), 'utf8')

assert.doesNotMatch(
  mentorPage,
  /<p class="mentor-booking-balance-value">\{\{\s*bookingDisplayAssigned\s*\}\}<\/p>/,
  'company session allocation must not fall back to personal package or credit balances',
)

assert.doesNotMatch(
  mentorPage,
  /bookingDisplayLeft/,
  'company sessions-left counter must not be backed by personal package or credit balances',
)

assert.match(
  mentorPage,
  /Personal Session Balance/,
  'mentor booking dialog should show a separate personal package balance when available',
)

assert.match(
  mentorPage,
  /bookingPersonalBalanceDescription/,
  'mentor booking dialog should describe personal package usage separately from company allocation',
)

assert.match(
  mentorPage,
  /bookingHasUsableSessionBalance[\s\S]*bookingSessionsLeft\.value > 0[\s\S]*bookingPersonalBalanceLeft\.value > 0/,
  'mentor booking dialog should treat company allocation and personal package balance as usable booking balance',
)

assert.match(
  mentorPage,
  /bookingSubmitButtonLabel[\s\S]*Book Session[\s\S]*Proceed To Pay/,
  'mentor booking dialog should say Book Session when a usable session balance exists',
)

assert.match(
  mentorPage,
  /\{\{\s*isBookingSession \? 'Processing\.\.\.' : bookingSubmitButtonLabel\s*\}\}/,
  'mentor booking submit button should render the balance-aware label',
)

assert.match(
  mentorPage,
  /bookingSubscriptionContext\.value\?\.subscription/,
  'personal booking balance should use the individual subscription object, not the corporate active source',
)

assert.match(
  calendarComponent,
  /useSubscriptionsStore/,
  'shared mentor availability booking dialog should load the subscription store',
)

assert.match(
  calendarComponent,
  /fetchActiveSubscription/,
  'shared mentor availability booking dialog should refresh personal package balance at booking time',
)

assert.match(
  calendarComponent,
  /Personal Session Balance/,
  'shared mentor availability booking dialog should show personal package balance separately',
)

assert.match(
  calendarComponent,
  /bookingPersonalBalanceDescription/,
  'shared mentor availability booking dialog should describe personal package usage separately from company allocation',
)

assert.match(
  calendarComponent,
  /bookingHasUsableSessionBalance[\s\S]*bookingSessionsLeft\.value > 0[\s\S]*bookingPersonalBalanceLeft\.value > 0/,
  'shared mentor availability dialog should treat company allocation and personal package balance as usable booking balance',
)

assert.match(
  calendarComponent,
  /bookingSubmitButtonLabel[\s\S]*Book Session[\s\S]*Proceed To Pay/,
  'shared mentor availability submit button should say Book Session when a usable session balance exists',
)

assert.match(
  calendarComponent,
  /\{\{\s*props\.isLoading \|\| isSubmittingBooking \? 'Processing\.\.\.' : bookingSubmitButtonLabel\s*\}\}/,
  'shared mentor availability submit button should render the balance-aware label',
)
