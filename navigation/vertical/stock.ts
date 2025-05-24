import type { NavigationItem } from './navigation';
import { 
  PackageIcon,
  ArrowRightLeftIcon,
  ClipboardCheckIcon
} from 'lucide-vue-next'

const stock: NavigationItem[] = [
  {
    title: "Stock",
    url: "",
    icon: PackageIcon,
    isActive: false,
    children: [
      {
        title: "Stock Flow",
        url: "/app/stock/stock-flow",
        icon: ArrowRightLeftIcon,
      },
      {
        title: "Stock Reservation",
        url: "/app/stock/stock-reservation",
        icon: ClipboardCheckIcon,
      },    
    ],
  },
];

export default stock;