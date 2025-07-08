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
      // {
      //   title: "Sales Channel Pricing",
      //   url: "/app/price-management/sales-channels",
      //   icon: StoreIcon, 
      // },
      {
        title: "Promotions & Discounts",
        url: "/app/price-management/discounts-and-promotions",
        icon: BadgePercentIcon,
      }, 
      {
        title: "Customer Pricing",
        url: "/app/price-management/customer-based-pricing",
        icon: UsersIcon,         
      },
          
    ],
  },
];

export default pricing;