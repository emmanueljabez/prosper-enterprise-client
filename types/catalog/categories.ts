// Types
export interface CategoryImage {
  icon?: string;
  thumbnail?: string;
  banner?: string;
  heroImage?: string;
}

export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  structuredData?: any;
}

export interface CategoryVisibility {
  webstore: boolean;
  b2bPortal: boolean;
  pos: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CategoryAccessControl {
  roles: string[];
}

export interface CategoryAnalytics {
  revenue: number;
  unitsSold: number;
  viewCount: number;
  conversion: number;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  code: string;
  type: string;
  values: string[];
  isInherited: boolean;
}

export interface CategoryMetadata {
  seo?: CategorySEO;
  visibility?: CategoryVisibility;
  accessControl?: CategoryAccessControl;
  analytics?: CategoryAnalytics;
  attributes?: CategoryAttribute[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  level: number;
  position: number;
  isActive: boolean;
  isDefault: boolean;
  isFeatured: boolean;
  path: string;
  images: CategoryImage;
  metadata?: CategoryMetadata;
  children?: Category[];
}

export interface CategoriesState {
  categories: Category[];
  flattenedCategories: Category[];
  loading: boolean;
  error: string | null;
  useMockData: boolean;
}
