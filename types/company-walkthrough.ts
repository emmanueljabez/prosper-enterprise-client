export type CompanyWalkthroughTaskId =
  | 'review_dashboard'
  | 'fund_session_wallet'
  | 'invite_mentees'
  | 'create_program'
  | 'match_mentors'
  | 'review_analytics'

export type CompanyWalkthroughTourId =
  | 'admin-dashboard-overview'
  | 'admin-wallet-overview'
  | 'admin-mentees-overview'
  | 'admin-programs-overview'
  | 'admin-matches-overview'
  | 'admin-analytics-overview'

export interface CompanyWalkthroughTask {
  id: CompanyWalkthroughTaskId
  tourId: CompanyWalkthroughTourId
  title: string
  description: string
  route: string
  ctaLabel: string
}

export interface CompanyWalkthroughProgress {
  version: string
  companyId: string
  userId: string
  introDismissed: boolean
  completedTaskIds: CompanyWalkthroughTaskId[]
  completedTourIds: CompanyWalkthroughTourId[]
  lastSeenAt: string | null
}

export const COMPANY_ADMIN_WALKTHROUGH_VERSION = '2026-08-company-admin-v1'

export const COMPANY_ADMIN_WALKTHROUGH_TASKS: CompanyWalkthroughTask[] = [
  {
    id: 'review_dashboard',
    tourId: 'admin-dashboard-overview',
    title: 'Review dashboard',
    description: 'Understand program health, activity, and intervention signals.',
    route: '/app/admin',
    ctaLabel: 'Start dashboard tour',
  },
  {
    id: 'fund_session_wallet',
    tourId: 'admin-wallet-overview',
    title: 'Check session wallet',
    description: 'See company-funded session balance and billing entry points.',
    route: '/app/admin',
    ctaLabel: 'Review wallet',
  },
  {
    id: 'invite_mentees',
    tourId: 'admin-mentees-overview',
    title: 'Add mentees',
    description: 'Invite or import employees who will participate in mentoring.',
    route: '/app/admin/employees',
    ctaLabel: 'Open mentees',
  },
  {
    id: 'create_program',
    tourId: 'admin-programs-overview',
    title: 'Create a program',
    description: 'Set up the company program that organizes mentees and outcomes.',
    route: '/app/admin/programs',
    ctaLabel: 'Open programs',
  },
  {
    id: 'match_mentors',
    tourId: 'admin-matches-overview',
    title: 'Review mentor matches',
    description: 'Assign mentors to participants and monitor matching coverage.',
    route: '/app/admin/matches',
    ctaLabel: 'Open matches',
  },
  {
    id: 'review_analytics',
    tourId: 'admin-analytics-overview',
    title: 'Review analytics',
    description: 'Track adoption, session outcomes, pulses, and reporting signals.',
    route: '/app/admin/analytics',
    ctaLabel: 'Open analytics',
  },
]
