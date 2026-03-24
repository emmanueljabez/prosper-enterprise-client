import type { NavigationItem } from './navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
  FileText,
  BookOpen,
  GitBranch
} from 'lucide-vue-next'

export const corporateAdminNavigation: NavigationItem[] = [
  {
    title: 'Overview',
    children: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/app/admin',
        permission: null
      }
    ]
  },

  {
    title: 'Program Management',
    children: [
      {
        title: 'Company Programs',
        icon: BookOpen,
        url: '/app/admin/programs',
        permission: 'admin:programs'
      },
      {
        title: 'Employees',
        icon: Users,
        url: '/app/admin/participants',
        permission: 'admin:users'
      },
      {
        title: 'Mentor Matches',
        icon: GitBranch,
        url: '/app/admin/matches',
        permission: 'admin:programs'
      },
      {
        title: 'Mentors',
        icon: UserCheck,
        url: '/app/admin/mentors',
        permission: 'admin:mentors'
      },
      {
        title: 'Sessions',
        icon: FileText,
        url: '/app/admin/sessions',
        permission: 'admin:reports'
      }
    ]
  },

  {
    title: 'Insights',
    children: [
      {
        title: 'Analytics',
        icon: BarChart3,
        url: '/app/admin/analytics',
        permission: 'admin:reports'
      }
    ]
  },

  {
    title: 'Finance',
    children: [
      {
        title: 'Billing',
        icon: CreditCard,
        url: '/app/admin/billing',
        permission: 'admin:billing'
      }
    ]
  },

  {
    title: 'Governance',
    children: [
      {
        title: 'Trust & Safety',
        icon: Shield,
        url: '/app/admin/trust',
        permission: 'admin:settings'
      },
      {
        title: 'Settings',
        icon: Settings,
        url: '/app/admin/settings',
        permission: 'admin:settings'
      }
    ]
  }
] 
