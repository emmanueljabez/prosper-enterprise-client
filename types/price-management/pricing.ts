export interface CustomerGroup {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  pricingTier: string;
  minimumOrderAmount?: number;
  minimumOrderQuantity?: number;
}

export interface SalesChannel {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  pricingStrategy: string;
  platformFee?: number;
  requiresApproval?: boolean;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  defaultCurrency: string;
  taxRate: number;
  taxIsIncluded: boolean;
  regionalPriceAdjustment?: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
  exchangeRate?: number;
}

export interface PromotionConditions {
  applicableProductIds?: string[];
  applicableCategories?: number[];
  minimumOrderAmount?: number;
  maximumUsesPerCustomer?: number;
  applicableCustomerGroups?: string[];
  applicableSalesChannels?: string[];
  applicableRegions?: string[];
  requiredProducts?: string[];
  firstPurchaseOnly?: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: string;
  value?: number | { buyQuantity: number; getQuantity: number };
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  conditions: PromotionConditions;
  priority: number;
  couponCode?: string;
}

export interface PriceInfo {
  finalPrice: number;
  basePrice: number;
  listPrice: number;
  currency: string;
  formattedPrice: string;
  discountedFromList: number;
  percentDiscountFromList: number;
  volumeDiscount: boolean;
  volumeDiscountPercent: number;
  volumeDiscountTier: string | null;
  hasPromotion: boolean;
  promotionName: string | null;
  promotionDiscount: number;
  taxRate: number;
  taxAmount: number;
  taxInclusive: boolean;
}

export interface PriceCalculationContext {
  customerGroupId?: string;
  salesChannelId?: string;
  regionId?: string;
  quantity?: number;
  orderTotal?: number;
  includeTax?: boolean;
  applyPromotions?: boolean;
  includeAllData?: boolean;
  isFirstPurchase?: boolean;
  date?: Date | string;
}

export interface PricingRule {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  productPrice: number;
  discountType: 'percentage' | 'fixed' | 'override';
  amount: number;
  calculatedPrice: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'inactive' | 'scheduled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingState {
  customerGroups: CustomerGroup[];
  salesChannels: SalesChannel[];
  promotions: Promotion[];
  regions: any[];
  currencies: any[];
  pricingRules: PricingRule[];
  loading: boolean;
  error: string | null;
  useMockData: boolean;
}