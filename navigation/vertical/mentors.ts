import type { NavigationItem } from './navigation'
import { Users, Heart, Calendar, UserCheck, BookOpen } from 'lucide-vue-next'

const mentors: NavigationItem[] = [
  {
    title: 'Mentors',
    icon: Users,
    url: '',
    isActive: false,
    children: [
      {
        title: 'Programs',
        url: '/app/mentors/programs',
        icon: BookOpen,
        permission: 'mentors:read'
      },
      {
        title: 'Find Mentors',
        url: '/app/mentors',
        icon: Users,
        permission: 'mentors:read'
      },
      {
        title: 'My Mentors',
        url: '/app/mentors/my-mentors',
        icon: UserCheck,
        permission: 'mentors:read'
      },
      {
        title: 'Sessions',
        url: '/app/mentors/sessions',
        icon: Calendar,
        permission: 'mentors:sessions:read'
      },
      {
        title: 'Favorites',
        url: '/app/mentors/favorites',
        icon: Heart,
        permission: 'mentors:read'
      }
    ]
  }
]

export default mentors 