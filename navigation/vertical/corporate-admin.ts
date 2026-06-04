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
} from 'lucide-vue-next'

export const corporateAdminNavigation: NavigationItem[] = [
  {
    title: 'Core',
    children: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/app/admin',
        permission: null,
      },
      {
        title: 'Mentees',
        icon: Users,
        url: '/app/admin/employees',
        permission: 'admin:users',
      },
      {
        title: 'Programs',
        icon: BookOpen,
        url: '/app/admin/programs',
        permission: 'admin:programs',
      },
      {
        title: 'Billing',
        icon: CreditCard,
        url: '/app/admin/billing',
        permission: 'admin:billing',
      },
      {
        title: 'Mentors',
        icon: UserCheck,
        url: '/app/admin/mentors',
        permission: 'admin:mentors',
      },
      {
        title: 'Sessions',
        icon: CalendarCheck2,
        url: '/app/admin/sessions',
        permission: 'admin:reports',
      },
      {
        title: 'Journey Templates',
        icon: Route,
        url: '/app/admin/journey-templates',
        permission: 'admin:programs',
      },
      {
        title: 'Mentor Matching',
        icon: GitBranch,
        url: '/app/admin/matches',
        permission: 'admin:programs',
      },
    ],
  },
  {
    title: 'Administration',
    children: [
      {
        title: 'Reports',
        icon: BarChart3,
        url: '/app/admin/reports',
        permission: 'admin:reports',
      },
      {
        title: 'Settings',
        icon: Settings,
        url: '/app/admin/settings',
        permission: 'admin:settings',
      },
    ],
  },
]
