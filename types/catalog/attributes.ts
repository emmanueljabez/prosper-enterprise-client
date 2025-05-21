// Types
export interface AttributeOption {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isDefault?: boolean;
  metadata?: {
    color?: string;
    image?: string;
    [key: string]: any;
  };
}

export interface AttributeValidation {
  type: string;
  params: any;
  message: string;
}

export interface Attribute {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  options?: AttributeOption[];
  isRequired: boolean;
  isVariant: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isVisibleOnProductPage: boolean;
  isGlobal: boolean;
  groupId?: string;
  sortOrder: number;
  defaultValue?: any;
  unit?: string;
  validations?: AttributeValidation[];
  metadata?: Record<string, any>;
}

export interface AttributeGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isCollapsible: boolean;
  isExpanded: boolean;
  attributes?: string[]; // Array of attribute IDs
}

export interface AttributeSet {
  id: string;
  code: string;
  name: string;
  description?: string;
  attributeGroups: Array<{
    groupId: string;
    attributes: string[]; // Array of attribute IDs
  }>;
  isDefault: boolean;
}

export interface VariantMatrix {
  id: string;
  productId: string;
  variantAttributes: string[]; // Array of attribute IDs
  excludedCombinations: Record<string, string>[];
  variants: Array<{
    id: string;
    sku: string;
    attributeValues: Record<string, any>;
    price?: number;
    priceAdjustment?: number;
    stock: number;
    images?: string[];
    isEnabled: boolean;
  }>;
}

export interface AttributeDependencyRule {
  id: string;
  name: string;
  description?: string;
  if: {
    attributeId: string;
    condition: string;
    value: any;
  };
  then: {
    attributeId: string;
    action: string; // 'enable', 'disable', 'require', 'hide', 'show', 'setOptions', 'setValue'
    value?: any;
  };
}

export interface AttributesState {
  attributes: Attribute[];
  attributeGroups: AttributeGroup[];
  attributeSets: AttributeSet[];
  variantMatrices: VariantMatrix[];
  attributeDependencyRules: AttributeDependencyRule[];
  attributeTypes: Record<string, string>;
  validationTypes: Record<string, string>;
  loading: boolean;
  error: string | null;
  useMockData: boolean;
}