export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  isDefault: boolean;
  sortOrder?: number;
}

export interface ProductStock {
  quantity: number;
  reserved: number;
  available: number;
  backorder: boolean;
  lowStockThreshold?: number;
}

export interface ProductSeo {
  title: string;
  metaDescription: string;
  slug: string;
  keywords?: string[];
  structuredData?: Record<string, any>;
}

export interface ProductVisibility {
  webstore: boolean;
  b2bPortal: boolean;
  marketplace: boolean;
  inStore?: boolean;
  procurement?: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: number;
  cost: number;
  attributes: Record<string, any>;
  stock: ProductStock;
  images?: ProductImage[];
}

export interface BundleItem {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  isRequired: boolean;
  price?: number;
  discount?: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
  type: 'simple' | 'configurable' | 'bundle';
  categories: number[];
  images: ProductImage[];
  stock: ProductStock;
  attributes: Record<string, any>;
  seo: ProductSeo;
  createdAt: string;
  updatedAt: string;
  visibility: ProductVisibility;
  variants?: ProductVariant[];
  bundleItems?: BundleItem[];
  tax?: {
    class: string;
    rate: number;
  };
  dimensions?: {
    weight: number;
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  shipping?: {
    requiresShipping: boolean;
    freeShipping: boolean;
    shippingClass: string;
  };
  statusReason?: string;
  tags?: string[];
  barcode?: string;
  customFields?: Record<string, any>;
  relatedProducts?: number[];
  crossSellProducts?: number[];
  manufacturer?: string;
  warrantyInfo?: string;
  downloadable?: {
    isDownloadable: boolean;
    files: Array<{
      id: number;
      name: string;
      url: string;
      size: number;
    }>;
    downloadLimit?: number;
    downloadExpiry?: number;
  };
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  useMockData: boolean;
  selectedProduct?: Product | null;
  filters?: {
    category?: number;
    status?: string;
    search?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
  };
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface ProductSummary {
  id: number;
  name: string;
  sku: string;
  price: number;
  status: string;
  type: string;
  stock: {
    available: number;
    backorder: boolean;
  };
  categories: number[];
  primaryImage?: string;
}

export interface ProductAnalytics {
  id: number;
  views: number;
  conversions: number;
  conversionRate: number;
  avgRating: number;
  reviewCount: number;
  returns: number;
  returnRate: number;
}

export interface ProductHistoryEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  changes: Record<string, {
    old: any;
    new: any;
  }>;
}

export type ProductExportFormat = 'csv' | 'xlsx' | 'json';

export interface ProductFilterOptions {
  categories: Array<{
    id: number;
    name: string;
  }>;
  statuses: string[];
  types: string[];
  attributes: Record<string, any[]>;
}