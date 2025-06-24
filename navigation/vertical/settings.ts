import type { NavigationItem } from './navigation';
import { Settings as SettingsIcon, Cog } from 'lucide-vue-next'

const Settings: NavigationItem[] = [
  {
    title: "Settings",
    url: "",
    icon: SettingsIcon,
    isActive: false,
    children: [
      {
        title: "Settings",
        url: "/app/settings",
        icon: Cog,
      },     
    ],
  },
];

export default Settings;