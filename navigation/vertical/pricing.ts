import type { NavigationItem } from './navigation';
import { 
  CoinsIcon,
  StoreIcon, 
  UsersIcon, 
  BadgePercentIcon
} from 'lucide-vue-next'

const pricing: NavigationItem[] = [
  {
    title: "Price Management",
    url: "",
    icon: CoinsIcon,
    isActive: false,
    children: [
      {
        title: "Sales Channel Pricing",
        url: "/app/price-management/sales-channels",
        icon: StoreIcon, 
      },
      {
        title: "Customer Pricing",
        url: "/app/price-management/customer-based-pricing",
        icon: UsersIcon,         
      },
      {
        title: "Promotions & Discounts",
        url: "/app/price-management/promotions",
        icon: BadgePercentIcon,
      },     
    ],
  },
];

export default pricing;