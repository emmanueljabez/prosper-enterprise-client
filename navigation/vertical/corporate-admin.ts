import type { NavigationItem } from './navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  CreditCard,
  CalendarCheck2,
  BookOpen,
  GitBranch,
  Route,
  Layers3,
  Wallet,
} from 'lucide-vue-next'

export const corporateAdminNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    children: [
      {
        title: 'Overview',
        icon: LayoutDashboard,
        url: '/app/admin',
        permission: null,
      },
    ],
  },
  {
    title: 'People',
    children: [
      {
        title: 'Mentees',
        icon: Users,
        url: '/app/admin/employees',
        permission: 'admin:users',
      },
      {
        title: 'Mentors',
        icon: UserCheck,
        url: '/app/admin/mentors',
        permission: 'admin:mentors',
      },
    ],
  },
  {
    title: 'People Management',
    children: [
      {
        title: 'Cohorts & Circles',
        icon: Users,
        url: '/app/admin/cohorts',
        permission: 'admin:programs',
      },
      {
        title: 'Alumni',
        icon: UserCheck,
        url: '/app/admin/alumni',
        permission: 'admin:users',
      },
    ],
  },
  {
    title: 'Program Management',
    children: [
      {
        title: 'Programs',
        icon: BookOpen,
        url: '/app/admin/programs',
        permission: 'admin:programs',
      },
      {
        title: 'Topics',
        icon: Layers3,
        url: '/app/admin/topics',
        permission: 'admin:programs',
      },
      {
        title: 'Program Content',
        icon: BookOpen,
        url: '/app/admin/content',
        permission: 'admin:programs',
      },
    ],
  },
  {
    title: 'Session Management',
    children: [
      {
        title: 'Plenary Sessions',
        icon: CalendarCheck2,
        url: '/app/admin/sessions/plenary',
        permission: 'admin:reports',
      },
      {
        title: 'Group Sessions',
        icon: CalendarCheck2,
        url: '/app/admin/sessions/group',
        permission: 'admin:reports',
      },
      {
        title: 'One-to-One Sessions',
        icon: CalendarCheck2,
        url: '/app/admin/sessions/one-to-one',
        permission: 'admin:reports',
      },
    ],
  },
  {
    title: 'Mentors & Matching',
    children: [
      {
        title: 'One-to-One Matching',
        icon: GitBranch,
        url: '/app/admin/matches',
        permission: 'admin:programs',
      },
      {
        title: 'Bulk Matching',
        icon: GitBranch,
        url: '/app/admin/matches/bulk',
        permission: 'admin:programs',
      },
    ],
  },
  {
    title: 'Finance',
    children: [
      {
        title: 'Billing',
        icon: CreditCard,
        url: '/app/admin/billing',
        permission: 'admin:billing',
      },
      {
        title: 'Session Wallet',
        icon: Wallet,
        url: '/app/admin/billing/wallet',
        permission: 'admin:billing',
      },
    ],
  },
  {
    title: 'Reports',
    children: [
      {
        title: 'Tracking',
        icon: BarChart3,
        url: '/app/admin/reports',
        permission: 'admin:reports',
      },
    ],
  },
  {
    title: 'Resources',
    children: [
      {
        title: 'Journey Templates',
        icon: Route,
        url: '/app/admin/journey-templates',
        permission: 'admin:programs',
      },
    ],
  },
  {
    title: 'Administration',
    children: [
      {
        title: 'Settings',
        icon: Settings,
        url: '/app/admin/settings',
        permission: 'admin:settings',
      },
    ],
  },
]
