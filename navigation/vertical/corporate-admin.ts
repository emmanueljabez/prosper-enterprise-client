import type { NavigationItem } from './navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  BarChart3,
  Settings,
  CreditCard,
  Palette,
  Download,
  Building2,
  MessageSquare,
  Shield,
  FileText,
  Database,
  Briefcase,
  TrendingUp
} from 'lucide-vue-next'

export const corporateAdminNavigation: NavigationItem[] = [
  {
    title: 'Overview',
    children: [
      {
        title: 'Admin Dashboard',
        icon: LayoutDashboard,
        url: '/app/dashboard/corporate-admin',
        permission: 'admin:dashboard:view'
      }
    ]
  },
  {
    title: 'User Management',
    children: [
      {
        title: 'Employees',
        icon: Users,
        url: '/app/admin/users',
        permission: 'admin:users'
      },
      {
        title: 'Mentors',
        icon: UserCheck,
        url: '/app/admin/mentors',
        permission: 'admin:mentors'
      },
      {
        title: 'Role Management',
        icon: Shield,
        url: '/app/admin/roles',
        permission: 'admin:users'
      }
    ]
  },
  {
    title: 'Financial',
    children: [
      {
        title: 'Payments',
        icon: CreditCard,
        url: '/app/admin/billing/payments',
        permission: 'admin:billing'
      },
      {
        title: 'Invoices',
        icon: FileText,
        url: '/app/admin/billing/invoices',
        permission: 'admin:billing'
      }
    ]
  },
  {
    title: 'Program Management',
    children: [
      {
        title: 'Session Monitoring',
        icon: FileText,
        url: '/app/admin/sessions',
        permission: 'admin:reports'
      },
      {
        title: 'Announcements',
        icon: MessageSquare,
        url: '/app/admin/announcements',
        permission: 'communication:broadcast'
      }
    ]
  },
  {
    title: 'Company Settings',
    children: [
      {
        title: 'Organization',
        icon: Building2,
        url: '/app/admin/company',
        permission: 'admin:company'
      },
      {
        title: 'Platform Settings',
        icon: Settings,
        url: '/app/admin/settings',
        permission: 'admin:settings'
      }
    ]
  }
] 