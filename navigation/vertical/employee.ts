import type { NavigationItem } from './navigation'
import {
  House,
  Calendar,
  User,
  BookOpen,
  Target,
  Users,
  GitBranch,
  MessageSquare,
  SlidersHorizontal
} from 'lucide-vue-next'

export const employeeNavigation: NavigationItem[] = [
  {
    title: 'Overview',
    children: [
      {
        title: 'Dashboard',
        icon: House,
        url: '/app/dashboard',
        permission: 'dashboard:view'
      }
    ]
  },
  {
    title: 'My Mentorship',
    children: [
      {
        title: 'My Programs',
        icon: BookOpen,
        url: '/app/employee/programs',
        permission: 'mentors:view'
      },
      {
        title: 'My Journey',
        icon: Target,
        url: '/app/employee/journey',
        permission: 'sessions:view'
      },
      {
        title: 'Mentor Matches',
        icon: GitBranch,
        url: '/app/employee/matches',
        permission: 'mentors:view'
      },
      {
        title: 'My Mentor',
        icon: Users,
        url: '/app/employee/mentor',
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
    title: 'Growth',
    children: [
      {
        title: 'Goals',
        icon: Target,
        url: '/app/employee/goals',
        permission: 'profile:view'
      },
      {
        title: 'Feedback & Pulses',
        icon: MessageSquare,
        url: '/app/employee/pulses',
        permission: 'profile:view'
      }
    ]
  },
  {
    title: 'Settings',
    children: [
      {
        title: 'My Profile',
        icon: User,
        url: '/app/profile',
        permission: 'profile:view'
      },
      {
        title: 'Preferences',
        icon: SlidersHorizontal,
        url: '/app/employee/preferences',
        permission: 'profile:view'
      }
    ]
  }
] 
