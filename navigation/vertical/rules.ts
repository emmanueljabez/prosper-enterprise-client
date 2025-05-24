import type { NavigationItem } from './navigation';
import { Sliders, Eye, Webhook, CalendarClock, BookOpen } from 'lucide-vue-next'

const rules: NavigationItem[] = [
  {
    title: "Business Rules & Settings",
    url: "",
    icon: Sliders,
    isActive: false,
    children: [
      {
        title: "Visibility",
        url: "/app/rules/visibility",
        icon: Eye,
      },
      {
        title: "Trigger Configuration",
        url: "/app/rules/trigger-configuration",
        icon: Webhook,
      },
      {
        title: "Sync Schedules",
        url: "/app/rules/sync-schedules",
        icon: CalendarClock,
      },      
    ],
  },
];

export default rules;