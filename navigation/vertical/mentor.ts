import type { NavigationItem } from './navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  Clock,
  Star,
  Settings,
  BarChart3,
  FileText
} from 'lucide-vue-next'

export const mentorNavigation: NavigationItem[] = [
  {
    title: 'Overview',
    children: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/app/dashboard',
        permission: 'dashboard:view'
      },
      {
        title: 'Analytics',
        icon: BarChart3,
        url: '/app/mentor/analytics',
        permission: 'mentoring:earnings'
      }
    ]
  },
  {
    title: 'Mentoring',
    children: [
      {
        title: 'My Mentees',
        icon: Users,
        url: '/app/mentees',
        permission: 'mentoring:accept'
      },
      {
        title: 'Session Schedule',
        icon: Calendar,
        url: '/app/sessions',
        permission: 'sessions:view'
      },
      {
        title: 'Availability',
        icon: Clock,
        url: '/app/mentor/availability',
        permission: 'mentoring:availability'
      },
      {
        title: 'Session History',
        icon: FileText,
        url: '/app/mentor/sessions/history',
        permission: 'sessions:manage'
      }
    ]
  },
  {
    title: 'Business',
    children: [
      {
        title: 'Earnings',
        icon: DollarSign,
        url: '/app/mentor/earnings',
        permission: 'mentoring:earnings'
      },
      {
        title: 'Reviews & Ratings',
        icon: Star,
        url: '/app/mentor/reviews',
        permission: 'mentoring:accept'
      }
    ]
  },
  {
    title: 'Communication',
    children: [
      {
        title: 'Messages',
        icon: MessageSquare,
        url: '/app/messages',
        permission: 'communication:send'
      }
    ]
  },
  {
    title: 'Personal',
    children: [
      {
        title: 'My Profile',
        icon: User,
        url: '/app/profile',
        permission: 'profile:view'
      },
      {
        title: 'Settings',
        icon: Settings,
        url: '/app/mentor/settings',
        permission: 'profile:edit'
      }
    ]
  }
] 