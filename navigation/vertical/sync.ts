import type { NavigationItem } from './navigation';
import { 
  RefreshCwIcon,
  LinkIcon,
  LayoutDashboardIcon
} from 'lucide-vue-next'

const sync: NavigationItem[] = [
  {
    title: "Catalog ↔ Inventory Sync",
    url: "",
    icon: RefreshCwIcon,
    isActive: false,
    children: [
      {
        title: "Item ↔ Product Mapping",
        url: "/app/sync/item-product-mapping",
        icon: LinkIcon,
      },
      {
        title: "Sync Dashboard",
        url: "/app/sync/sync-dashboard",
        icon: LayoutDashboardIcon,
      },    
    ],
  },
];

export default sync;