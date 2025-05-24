export interface BaseRule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type RuleScope = 'global' | 'category' | 'product' | 'item';

export type VisibilityAction = 
  | 'hide' 
  | 'show' 
  | 'show_with_label' 
  | 'show_with_message' 
  | 'redirect';

export interface StockThreshold {
  type: 'absolute' | 'percentage';
  value: number;
}

export interface StockVisibilityRule extends BaseRule {
  scope: RuleScope;
  categoryIds?: string[];
  productIds?: string[];
  itemIds?: string[];
  stockThreshold?: StockThreshold;
  action: VisibilityAction;
  message?: string;
  redirectProductId?: string;
  displayOrder?: number;
  tags?: string[];
  conditions?: RuleCondition[];
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export type BackorderAllowance = 'none' | 'all' | 'partial';

export interface BackorderSetting extends BaseRule {
  scope: RuleScope;
  categoryIds?: string[];
  productIds?: string[];
  itemIds?: string[];
  allowBackorders: BackorderAllowance;
  maxBackorderQuantity?: number;
  maxBackorderDays?: number;
  expectedRestockDate?: string;
  message?: string;
  displayInSearch: boolean;
  allowDiscounts: boolean;
  requireApproval: boolean;
  conditions?: RuleCondition[];
}

export type AlternativeRelationship = 'substitute' | 'accessory' | 'complementary' | 'upgraded_version';

export interface ProductAlternative extends BaseRule {
  primaryProductId: string;
  alternativeProductId: string;
  relationship: AlternativeRelationship;
  conversionRate?: number; // For items sold in different units
  displayOrder: number;
  automaticSubstitution: boolean;
  displayOnProductPage: boolean;
  displayInCart: boolean;
  displayWhenOutOfStock: boolean;
  tags?: string[];
}

export interface VisibilityRulesState {
  stockVisibilityRules: StockVisibilityRule[];
  backorderSettings: BackorderSetting[];
  productAlternatives: ProductAlternative[];
  isLoading: boolean;
  error: string | null;
}