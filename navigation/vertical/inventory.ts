import type { NavigationItem } from './navigation';
import {  Box, 
  Layers, 
  Package, 
  ClipboardList, 
  Calculator, 
  Send, 
  RefreshCcw,
  CreditCard} from 'lucide-vue-next'

const inventory: NavigationItem[] = [
  {
    title: "Inventory Management",
    url: "",
    icon: Box,
    isActive: false,
    children: [
      {
        title: "Items",
        url: "/app/inventory/items",
        icon: Package,
      },
      {
        title: "Transaction Center",
        url: "/app/inventory/transactions",
        icon: Layers,
      }, 
      {
        title: "Transaction History",
        url: "/app/inventory/transactions/transaction-history",
        icon: ClipboardList,
      }, 
      {
        title: "Cycle Counts",
        url: "/app/inventory/cycle-counts", 
        icon: Calculator,
      },   
      {
        title: "Transfers",
        url: "/app/inventory/transfers", 
        icon: Send,
      },   
      {
        title: "Reorder Automation",
        url: "/app/inventory/reorder-automation", 
        icon: RefreshCcw,
      }, 
      {
        title: 'POS',
        url: '/app/inventory/pos',
        icon: CreditCard,
      } 
    ],
  },
];

export default inventory;