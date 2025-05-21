import type { Product } from '../catalog/products';

// Bundle item option definition for variable bundle items
export interface BundleItemOption {
  variantId: number | string;
  label: string;
}

// Variable options configuration for bundle items
export interface VariableOptions {
  attributeId: string;
  options: BundleItemOption[];
}

// Individual item in a bundle
export interface BundleItem {
  productId: string;
  variantId?: number | string;
  quantity: number;
  isRequired: boolean;
  isVariable: boolean;
  variableOptions?: VariableOptions;
}

// Bundle inventory status
export interface BundleInventory {
  available: number;
  isAvailable: boolean;
  isLowStock: boolean;
}

// Bundle inventory configuration
export interface BundleInventoryConfig {
  dynamicStock: boolean;
  minComponentQuantity: number;
  lowStockThreshold: number;
}

// SEO metadata for bundles
export interface BundleSeo {
  title: string;
  metaDescription: string;
  slug: string;
}

// Visibility channels for bundles
export interface BundleVisibility {
  webstore: boolean;
  b2bPortal: boolean;
  marketplace: boolean;
}

// Image definition for bundles
export interface BundleImage {
  id: number | string;
  url: string;
  alt: string;
  isDefault: boolean;
}

// Main bundle entity
export interface Bundle {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  statusReason?: string;
  type: 'bundle';
  categories: (number | string)[];
  images: BundleImage[];
  bundleItems: BundleItem[];
  attributes?: Record<string, any>;
  seo: BundleSeo;
  createdAt: string;
  updatedAt: string;
  visibility: BundleVisibility;
  inventory: BundleInventoryConfig;
}

// Detailed bundle component with product information
export interface BundleComponent {
  bundleItem: BundleItem;
  product: Product;
  variant?: any; // Using any for variant since it depends on your product types
  stock: any;
  price: number;
  options: VariableOptions | null;
}

// Store state for bundles
export interface BundlesState {
  bundles: Bundle[];
  bundleInventory: Record<string, BundleInventory>;
  loading: boolean;
  error: string | null;
  useMockData: boolean;
}

// Bundle price calculation options
export interface BundlePriceOptions {
  [productId: string]: number | string; // productId -> selected variantId
}

// Bundle API response format
export interface BundleResponse {
  data: {
    data: Bundle | Bundle[] | { content: Bundle[] };
    success?: boolean;
    updatedBundles?: string[];
  };
}