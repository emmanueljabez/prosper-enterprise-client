import type { NavigationItem } from './navigation';
import { Box, Layers, Package, PackagePlus, Tags } from 'lucide-vue-next'

const catalog: NavigationItem[] = [
  {
    title: "Catalog",
    url: "",
    icon: Box,
    isActive: false,
    children: [
      {
        title: "Products",
        url: "/app/catalog/products",
        icon: Package,
      },
      {
        title: "Product Categories",
        url: "/app/catalog/product-categories",
        icon: Tags,
      },
      {
        title: "Product Variants",
        url: "/app/catalog/product-variants",
        icon: Layers,
      },
      {
        title: "Product Bundles",
        url: "/app/catalog/product-bundles",
        icon: PackagePlus,
      },      
    ],
  },
];

export default catalog;