import type { NavigationItem } from './navigation';
import { 
  Layers, 
  ClipboardCheck, 
  Network,
  Factory 
} from 'lucide-vue-next'

const integration: NavigationItem[] = [
  {
    title: "Production",
    url: "",
    icon: Network,
    isActive: false,
    children: [
      {
        title: "BOM & Production Planning",
        url: "/app/integration/bom-production-planning",
        icon: Layers,
      },
      // {
      //   title: "Work Order Tracker",
      //   url: "/app/integration/trigger-configuration",
      //   icon: ClipboardCheck,
      // },      
    ],
  },
];

export default integration;