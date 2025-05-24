import type { NavigationItem } from './navigation';
import { 
  WarehouseIcon,  
  NetworkIcon,  
  GaugeIcon
} from 'lucide-vue-next'

const locations: NavigationItem[] = [
  {
    title: "Locations",
    url: "",
    icon: WarehouseIcon,
    isActive: false,
    children: [
      {
        title: "Location Hierarchy",
        url: "/app/locations/location-hierarchy",
        icon: NetworkIcon,
      },
      {
        title: "Utilization Dashboard",
        url: "/app/locations/utilization-dashboard",
        icon: GaugeIcon,
      },    
    ],
  },
];

export default locations;