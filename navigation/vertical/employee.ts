import type { NavigationItem } from './navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  TrendingUp,
  User,
  MessageSquare,
  Search,
  BookOpen,
  Target
} from 'lucide-vue-next'

export const employeeNavigation: NavigationItem[] = [
  {
    title: 'Overview',
    children: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/app/dashboard',
        permission: 'dashboard:view'
      }
    ]
  },
  {
    title: 'Mentorship',
    children: [
      {
        title: 'Programs',
        icon: BookOpen,
        url: '/app/mentors/programs',
        permission: 'mentors:view'
      },
      {
        title: 'Find Mentors',
        icon: Search,
        url: '/app/mentors',
        permission: 'mentors:view'
      },
      {
        title: 'My Sessions',
        icon: Calendar,
        url: '/app/sessions',
        permission: 'sessions:view'
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
      }
    ]
  }
] 