import type { NavigationItem } from './navigation';
import { 
  Warehouse, 
  TruckIcon, 
  PackageCheck, 
  GitBranch, 
  Send,
  ClipboardList,
  ShoppingCart
} from 'lucide-vue-next'

const warehouse: NavigationItem[] = [
  {
    title: "Warehouse",
    url: "",
    icon: Warehouse,
    isActive: false,
    children: [
      {
        title: "Receiving Dashboard",
        url: "/app/warehouse/receiving-dashboard",
        icon: TruckIcon,
      },
      {
        title: "Picking & Packing",
        url: "/app/warehouse/picking-packing",
        icon: ClipboardList,
      },
      {
        title: "Shipping Panel",
        url: "/app/warehouse/shipping-panel",
        icon: Send,
      },      
    ],
  },
];

export default warehouse;