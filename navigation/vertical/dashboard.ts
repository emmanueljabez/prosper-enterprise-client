import type { NavigationItem } from './navigation';
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Wrench,
} from 'lucide-vue-next';

const dashboard: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "",
    icon: LayoutDashboard,
    isActive: false,
    children: [
      {
        title: "Inventory",
        url: "/app/dashboard/inventory",
        icon: ClipboardList,
      },
      {
        title: "Business Intelligence",
        url: "/app/dashboard/business-intelligence",
        icon: AlertTriangle,
      },
      {
        title: "Report Center",
        url: "/app/dashboard/reports",
        icon: Wrench,
      },
    ],
  },
];

export default dashboard;