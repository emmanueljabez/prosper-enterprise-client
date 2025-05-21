// Mock pricing system for product management
import { products } from './mockProducts';
import { attributeUtils, ATTRIBUTE_TYPES } from './mockAttributeData';

// ==========================================
// PRICING STRUCTURE DEFINITIONS
// ==========================================

// Define customer groups
export const customerGroups = [
  {
    id: 'retail',
    name: 'Retail Customers',
    description: 'Standard retail customers',
    isDefault: true,
    pricingTier: 'standard'
  },
  {
    id: 'wholesale',
    name: 'Wholesale',
    description: 'Wholesale business customers',
    isDefault: false,
    pricingTier: 'wholesale',
    minimumOrderAmount: 500,
    minimumOrderQuantity: 10
  },
  {
    id: 'distributor',
    name: 'Distributors',
    description: 'Product distributors and resellers',
    isDefault: false,
    pricingTier: 'distributor',
    minimumOrderAmount: 2000,
    minimumOrderQuantity: 50
  },
  {
    id: 'vip',
    name: 'VIP Customers',
    description: 'Premium customers with loyalty status',
    isDefault: false,
    pricingTier: 'vip'
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Internal employees',
    isDefault: false,
    pricingTier: 'employee'
  }
];

// Define sales channels
export const salesChannels = [
  {
    id: 'webstore',
    name: 'Web Store',
    description: 'Main e-commerce website',
    isDefault: true,
    pricingStrategy: 'standard'
  },
  {
    id: 'pos',
    name: 'In-Store POS',
    description: 'Physical retail locations',
    isDefault: false,
    pricingStrategy: 'standard'
  },
  {
    id: 'marketplace_amazon',
    name: 'Amazon Marketplace',
    description: 'Amazon.com product listings',
    isDefault: false,
    pricingStrategy: 'marketplace',
    platformFee: 0.15
  },
  {
    id: 'marketplace_ebay',
    name: 'eBay Store',
    description: 'eBay product listings',
    isDefault: false,
    pricingStrategy: 'marketplace',
    platformFee: 0.12
  },
  {
    id: 'b2b_portal',
    name: 'B2B Portal',
    description: 'Business customer portal',
    isDefault: false,
    pricingStrategy: 'b2b',
    requiresApproval: true
  }
];

// Define currencies
export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', isDefault: true },
  { code: 'EUR', name: 'Euro', symbol: '€', isDefault: false, exchangeRate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', isDefault: false, exchangeRate: 0.75 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', isDefault: false, exchangeRate: 1.30 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', isDefault: false, exchangeRate: 1.45 }
];

// Define regions/countries
export const regions = [
  {
    id: 'us',
    name: 'United States',
    code: 'US',
    defaultCurrency: 'USD',
    taxRate: 0.0,
    taxIsIncluded: false
  },
  {
    id: 'ca',
    name: 'Canada',
    code: 'CA',
    defaultCurrency: 'CAD',
    taxRate: 0.05,
    taxIsIncluded: false,
    regionalPriceAdjustment: 0.05 // 5% price increase
  },
  {
    id: 'eu',
    name: 'European Union',
    code: 'EU',
    defaultCurrency: 'EUR',
    taxRate: 0.21,
    taxIsIncluded: true,
    regionalPriceAdjustment: 0.10 // 10% price increase
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    code: 'UK',
    defaultCurrency: 'GBP',
    taxRate: 0.20,
    taxIsIncluded: true,
    regionalPriceAdjustment: 0.08 // 8% price increase
  },
  {
    id: 'au',
    name: 'Australia',
    code: 'AU',
    defaultCurrency: 'AUD',
    taxRate: 0.10,
    taxIsIncluded: true,
    regionalPriceAdjustment: 0.15 // 15% price increase
  }
];

// ==========================================
// PRICE CALCULATION STRATEGIES
// ==========================================

// Base price matrix (customer group × sales channel)
export const basePriceMatrix = {
  retail: {
    webstore: 1.0,     // Retail price (standard multiplier)
    pos: 1.0,          // Retail price (standard multiplier)
    marketplace_amazon: 1.1, // 10% higher on Amazon
    marketplace_ebay: 1.05,  // 5% higher on eBay
    b2b_portal: 0.95   // 5% discount for registered retail customers in B2B portal
  },
  wholesale: {
    webstore: 0.8,     // 20% discount for wholesale in web store
    pos: 0.8,          // 20% discount for wholesale in-store
    marketplace_amazon: 0.85, // 15% discount on Amazon
    marketplace_ebay: 0.82,   // 18% discount on eBay
    b2b_portal: 0.75    // 25% discount in B2B portal
  },
  distributor: {
    webstore: 0.7,     // 30% discount
    pos: 0.7,          // 30% discount
    marketplace_amazon: 0.75, // 25% discount
    marketplace_ebay: 0.72,   // 28% discount
    b2b_portal: 0.65    // 35% discount
  },
  vip: {
    webstore: 0.9,     // 10% discount
    pos: 0.85,         // 15% discount
    marketplace_amazon: 0.95, // 5% discount
    marketplace_ebay: 0.92,   // 8% discount
    b2b_portal: 0.85    // 15% discount
  },
  employee: {
    webstore: 0.6,     // 40% discount
    pos: 0.6,          // 40% discount
    marketplace_amazon: 0.65, // 35% discount
    marketplace_ebay: 0.65,   // 35% discount
    b2b_portal: 0.6     // 40% discount
  }
};

// Volume-based tiered pricing rules
export const volumeTiers = [
  {
    id: 'tier-1',
    name: 'Standard Pricing',
    minQuantity: 1,
    maxQuantity: 9,
    discountPercent: 0,
    discountFactor: 1.0,
    applicableGroups: ['retail', 'vip', 'employee']
  },
  {
    id: 'tier-2',
    name: 'Small Bulk',
    minQuantity: 10,
    maxQuantity: 49,
    discountPercent: 5,
    discountFactor: 0.95,
    applicableGroups: ['retail', 'wholesale', 'vip', 'employee']
  },
  {
    id: 'tier-3',
    name: 'Medium Bulk',
    minQuantity: 50,
    maxQuantity: 99,
    discountPercent: 10,
    discountFactor: 0.90,
    applicableGroups: ['retail', 'wholesale', 'distributor', 'vip', 'employee']
  },
  {
    id: 'tier-4',
    name: 'Large Bulk',
    minQuantity: 100,
    maxQuantity: 499,
    discountPercent: 15,
    discountFactor: 0.85,
    applicableGroups: ['wholesale', 'distributor']
  },
  {
    id: 'tier-5',
    name: 'Wholesale Bulk',
    minQuantity: 500,
    maxQuantity: null, // No upper limit
    discountPercent: 20,
    discountFactor: 0.80,
    applicableGroups: ['wholesale', 'distributor']
  }
];

// Special category pricing rules
export const categoryPricingRules = [
  {
    categoryId: 2,  // Network Switches
    margin: 0.35,   // 35% margin
    roundingRule: 'nearest99',  // $XX.99 pricing
    customerGroupAdjustments: {
      wholesale: 0.85,  // 15% discount from standard price
      distributor: 0.75 // 25% discount from standard price
    }
  },
  {
    categoryId: 3,  // Wireless Networking
    margin: 0.40,   // 40% margin
    roundingRule: 'nearest95',  // $XX.95 pricing
    customerGroupAdjustments: {
      wholesale: 0.80,  // 20% discount from standard price
      distributor: 0.70 // 30% discount from standard price
    }
  },
  {
    categoryId: 4,  // Cables & Connectivity
    margin: 0.60,   // 60% margin (high margin category)
    roundingRule: 'nearest50',  // $XX.50 pricing
    customerGroupAdjustments: {
      wholesale: 0.70,  // 30% discount from standard price
      distributor: 0.60 // 40% discount from standard price
    }
  }
];

// ==========================================
// PROMOTIONS AND DISCOUNTS
// ==========================================

// Promotion types
export const PROMOTION_TYPES = {
  PERCENTAGE_DISCOUNT: 'percentage_discount',
  FIXED_AMOUNT_DISCOUNT: 'fixed_amount_discount',
  BUY_X_GET_Y_FREE: 'buy_x_get_y_free',
  BUNDLE_DISCOUNT: 'bundle_discount',
  FIXED_PRICE_PROMOTION: 'fixed_price_promotion',
  FREE_SHIPPING: 'free_shipping',
  FREE_GIFT: 'free_gift',
  MINIMUM_ORDER_DISCOUNT: 'minimum_order_discount'
};

// Example promotions
export const promotions = [
  {
    id: 'promo-001',
    name: 'Summer Sale',
    description: '15% off selected networking equipment',
    type: PROMOTION_TYPES.PERCENTAGE_DISCOUNT,
    value: 15, // 15% discount
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    isActive: true,
    conditions: {
      applicableProductIds: ['prod-1001', 'prod-3001', 'prod-7001'],
      applicableCategories: [1, 3, 8],
      minimumOrderAmount: 0,
      maximumUsesPerCustomer: 1,
      applicableCustomerGroups: ['retail', 'vip'],
      applicableSalesChannels: ['webstore', 'pos']
    },
    priority: 10
  },
  {
    id: 'promo-002',
    name: 'Buy 2 Cables, Get 1 Free',
    description: 'Buy 2 cables and get 1 free of equal or lesser value',
    type: PROMOTION_TYPES.BUY_X_GET_Y_FREE,
    value: {
      buyQuantity: 2,
      getQuantity: 1
    },
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-07-31T23:59:59Z',
    isActive: true,
    conditions: {
      applicableCategories: [4], // Cables & Connectivity
      minimumOrderAmount: 0,
      maximumUsesPerCustomer: 3,
      applicableCustomerGroups: ['retail', 'vip', 'wholesale'],
      applicableSalesChannels: ['webstore', 'pos', 'marketplace_amazon']
    },
    priority: 20
  },
  {
    id: 'promo-003',
    name: 'Fiber Installation Kit Bundle',
    description: 'Save 20% when you buy a complete fiber installation kit',
    type: PROMOTION_TYPES.BUNDLE_DISCOUNT,
    value: 20, // 20% discount
    startDate: '2025-04-15T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    isActive: true,
    conditions: {
      requiredProducts: [
        'prod-2001', // Fiber Optic Media Converter
        'prod-4001', // Fiber Optic Patch Cable
        'prod-5001'  // Network Installation Tool Kit
      ],
      minimumOrderAmount: 0,
      applicableCustomerGroups: ['retail', 'vip', 'wholesale', 'distributor'],
      applicableSalesChannels: ['webstore', 'pos', 'b2b_portal']
    },
    priority: 30
  },
  {
    id: 'promo-004',
    name: 'Free Shipping on Orders Over $100',
    description: 'Get free shipping when you spend $100 or more',
    type: PROMOTION_TYPES.FREE_SHIPPING,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    isActive: true,
    conditions: {
      minimumOrderAmount: 100,
      applicableCustomerGroups: ['retail', 'vip'],
      applicableSalesChannels: ['webstore', 'marketplace_amazon', 'marketplace_ebay'],
      applicableRegions: ['us', 'ca']
    },
    priority: 5
  },
  {
    id: 'promo-005',
    name: 'B2B Welcome Discount',
    description: '10% off first order for new B2B customers',
    type: PROMOTION_TYPES.PERCENTAGE_DISCOUNT,
    value: 10, // 10% discount
    startDate: '2025-01-01T00:00:00Z',
    endDate: null, // No end date
    isActive: true,
    conditions: {
      minimumOrderAmount: 250,
      firstPurchaseOnly: true,
      applicableCustomerGroups: ['wholesale', 'distributor'],
      applicableSalesChannels: ['b2b_portal']
    },
    priority: 50,
    couponCode: 'B2BWELCOME'
  }
];

// Custom pricing overrides for specific products
export const productPricingOverrides = [
  {
    productId: 'prod-3001', // Managed Network Switch 24-Port
    name: 'Special Enterprise Pricing',
    description: 'Special pricing for enterprise switch',
    priceOverrides: {
      wholesale: 299.99,
      distributor: 275.00
    },
    ignoreCategoryRules: true,
    ignorePromotions: false, 
    expirationDate: '2025-12-31T23:59:59Z'
  },
  {
    productId: 'prod-6001', // Enterprise Rack-Mount UPS
    name: 'Power Protection Pricing',
    description: 'Special pricing for UPS units',
    priceOverrides: {
      retail: 649.99,
      wholesale: 599.99,
      distributor: 550.00
    },
    salesChannelOverrides: {
      'marketplace_amazon': 699.99,
      'marketplace_ebay': 679.99
    },
    ignoreCategoryRules: true,
    ignorePromotions: true, 
    expirationDate: '2025-09-30T23:59:59Z'
  }
];

// Price rounding functions
const roundingFunctions = {
  nearest99: (price) => Math.floor(price) + 0.99,
  nearest95: (price) => Math.floor(price) + 0.95,
  nearest50: (price) => Math.floor(price) + 0.50,
  nearest9: (price) => Math.floor(price / 10) * 10 + 9,
  nearest5: (price) => Math.round(price / 5) * 5,
  nearest10: (price) => Math.round(price / 10) * 10,
  whole: (price) => Math.round(price)
};

// ==========================================
// PRICE CALCULATION FUNCTIONS
// ==========================================

/**
 * Calculate the base price for a product based on customer group and sales channel
 * @param {Object} product - Product object
 * @param {String} customerGroupId - Customer group ID
 * @param {String} salesChannelId - Sales channel ID
 * @returns {Number} Calculated price
 */
export function calculateBasePrice(product, customerGroupId = 'retail', salesChannelId = 'webstore') {
  if (!product) return 0;
  
  // Start with the product's base price
  let basePrice = product.price;
  
  // Check for any specific product price override
  const override = productPricingOverrides.find(o => o.productId === product.id);
  if (override) {
    // Check for customer group specific override
    if (override.priceOverrides && override.priceOverrides[customerGroupId] !== undefined) {
      return override.priceOverrides[customerGroupId];
    }
    
    // Check for sales channel specific override
    if (override.salesChannelOverrides && override.salesChannelOverrides[salesChannelId] !== undefined) {
      return override.salesChannelOverrides[salesChannelId];
    }
  }
  
  // Apply customer group and sales channel multipliers
  const priceMatrix = basePriceMatrix[customerGroupId] || basePriceMatrix.retail;
  const channelMultiplier = priceMatrix[salesChannelId] || priceMatrix.webstore;
  
  basePrice *= channelMultiplier;
  
  // Apply category-specific pricing rules if applicable
  if (!override?.ignoreCategoryRules && product.categories && product.categories.length > 0) {
    // Find applicable category rule (use the first matching category)
    const categoryRule = categoryPricingRules.find(rule => 
      product.categories.includes(rule.categoryId)
    );
    
    if (categoryRule) {
      // Apply category-specific customer group adjustments
      if (categoryRule.customerGroupAdjustments && 
          categoryRule.customerGroupAdjustments[customerGroupId]) {
        basePrice = product.price * categoryRule.customerGroupAdjustments[customerGroupId];
      }
      
      // Apply rounding rule
      if (categoryRule.roundingRule && roundingFunctions[categoryRule.roundingRule]) {
        basePrice = roundingFunctions[categoryRule.roundingRule](basePrice);
      }
    }
  }
  
  // Round to 2 decimal places
  return Math.round(basePrice * 100) / 100;
}

/**
 * Calculate volume-based tiered pricing
 * @param {Number} basePrice - Base product price
 * @param {Number} quantity - Order quantity
 * @param {String} customerGroupId - Customer group ID
 * @returns {Object} Tiered pricing information
 */
export function calculateTieredPrice(basePrice, quantity, customerGroupId = 'retail') {
  // Find the applicable tier for the quantity and customer group
  const applicableTier = volumeTiers
    .filter(tier => tier.applicableGroups.includes(customerGroupId))
    .find(tier => 
      quantity >= tier.minQuantity && 
      (tier.maxQuantity === null || quantity <= tier.maxQuantity)
    );
  
  if (!applicableTier) {
    return {
      price: basePrice,
      discountPercent: 0,
      tier: null
    };
  }
  
  const tieredPrice = basePrice * applicableTier.discountFactor;
  
  return {
    price: Math.round(tieredPrice * 100) / 100,
    discountPercent: applicableTier.discountPercent,
    tier: applicableTier
  };
}

/**
 * Convert price to a different currency
 * @param {Number} price - Price in default currency
 * @param {String} targetCurrency - Target currency code
 * @returns {Number} Converted price
 */
export function convertCurrency(price, targetCurrency = 'USD') {
  const currency = currencies.find(c => c.code === targetCurrency);
  
  if (!currency || currency.isDefault) {
    return price;
  }
  
  let convertedPrice = price * currency.exchangeRate;
  // Round to 2 decimal places
  return Math.round(convertedPrice * 100) / 100;
}

/**
 * Apply regional pricing adjustments
 * @param {Number} price - Base price
 * @param {String} regionId - Region ID
 * @param {Boolean} includeTax - Whether to include tax in the price
 * @returns {Object} Adjusted price information
 */
export function applyRegionalPricing(price, regionId = 'us', includeTax = false) {
  const region = regions.find(r => r.id === regionId) || regions[0];
  
  let adjustedPrice = price;
  
  // Apply regional price adjustment
  if (region.regionalPriceAdjustment) {
    adjustedPrice = price * (1 + region.regionalPriceAdjustment);
  }
  
  // Convert to regional currency if needed
  if (region.defaultCurrency !== 'USD') {
    adjustedPrice = convertCurrency(adjustedPrice, region.defaultCurrency);
  }
  
  // Calculate tax amount
  const taxAmount = adjustedPrice * region.taxRate;
  
  // Include tax in price if required
  const finalPrice = includeTax || region.taxIsIncluded ? adjustedPrice + taxAmount : adjustedPrice;
  
  // Round to 2 decimal places
  const roundedPrice = Math.round(finalPrice * 100) / 100;
  
  return {
    basePrice: price,
    adjustedPrice: Math.round(adjustedPrice * 100) / 100,
    finalPrice: roundedPrice,
    taxRate: region.taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    currency: region.defaultCurrency,
    region: region.id
  };
}

/**
 * Find applicable promotions for a product
 * @param {Object} product - Product object
 * @param {Object} context - Pricing context
 * @returns {Array} Applicable promotions
 */
export function findApplicablePromotions(product, context = {}) {
  const {
    customerGroupId = 'retail',
    salesChannelId = 'webstore',
    regionId = 'us',
    quantity = 1,
    orderTotal = 0,
    isFirstPurchase = false,
    date = new Date()
  } = context;
  
  // Check for product override that ignores promotions
  const override = productPricingOverrides.find(o => o.productId === product.id);
  if (override && override.ignorePromotions) {
    return [];
  }
  
  const currentDate = date instanceof Date ? date : new Date();
  
  return promotions
    .filter(promo => {
      // Check if promotion is active
      if (!promo.isActive) return false;
      
      // Check date range
      const startDate = promo.startDate ? new Date(promo.startDate) : null;
      const endDate = promo.endDate ? new Date(promo.endDate) : null;
      
      if (startDate && currentDate < startDate) return false;
      if (endDate && currentDate > endDate) return false;
      
      // Check conditions
      const conditions = promo.conditions || {};
      
      // Check customer group
      if (conditions.applicableCustomerGroups && 
          !conditions.applicableCustomerGroups.includes(customerGroupId)) {
        return false;
      }
      
      // Check sales channel
      if (conditions.applicableSalesChannels && 
          !conditions.applicableSalesChannels.includes(salesChannelId)) {
        return false;
      }
      
      // Check region
      if (conditions.applicableRegions && 
          !conditions.applicableRegions.includes(regionId)) {
        return false;
      }
      
      // Check minimum order amount
      if (conditions.minimumOrderAmount && 
          orderTotal < conditions.minimumOrderAmount) {
        return false;
      }
      
      // Check first purchase only
      if (conditions.firstPurchaseOnly && !isFirstPurchase) {
        return false;
      }
      
      // Check applicable products
      if (conditions.applicableProductIds && 
          !conditions.applicableProductIds.includes(product.id)) {
        return false;
      }
      
      // Check applicable categories
      if (conditions.applicableCategories && 
          !product.categories.some(catId => conditions.applicableCategories.includes(catId))) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Sort by priority (highest first)
}

/**
 * Apply a promotion to a product price
 * @param {Number} basePrice - Base product price
 * @param {Object} promotion - Promotion object
 * @param {Object} context - Pricing context
 * @returns {Object} Price after promotion
 */
export function applyPromotion(basePrice, promotion, context = {}) {
  const { quantity = 1 } = context;
  
  let discountedPrice = basePrice;
  let discountAmount = 0;
  let discountType = '';
  
  switch (promotion.type) {
    case PROMOTION_TYPES.PERCENTAGE_DISCOUNT:
      discountAmount = basePrice * (promotion.value / 100);
      discountedPrice = basePrice - discountAmount;
      discountType = 'percentage';
      break;
      
    case PROMOTION_TYPES.FIXED_AMOUNT_DISCOUNT:
      discountAmount = promotion.value;
      discountedPrice = basePrice - discountAmount;
      discountType = 'fixed';
      break;
      
    case PROMOTION_TYPES.FIXED_PRICE_PROMOTION:
      discountAmount = basePrice - promotion.value;
      discountedPrice = promotion.value;
      discountType = 'fixed_price';
      break;
      
    case PROMOTION_TYPES.BUY_X_GET_Y_FREE:
      if (quantity >= promotion.value.buyQuantity) {
        // Calculate the effective discount per unit
        const totalUnits = quantity;
        const freeUnits = Math.floor(quantity / promotion.value.buyQuantity) * promotion.value.getQuantity;
        const effectiveUnits = totalUnits - Math.min(freeUnits, totalUnits);
        
        if (effectiveUnits < totalUnits) {
          const discountPerUnit = (basePrice * freeUnits) / totalUnits;
          discountAmount = discountPerUnit * quantity;
          discountedPrice = basePrice - discountPerUnit;
        }
      }
      discountType = 'bogo';
      break;
      
    case PROMOTION_TYPES.BUNDLE_DISCOUNT:
      // For bundle discounts, the logic would be applied at the cart level
      // Here we just calculate what the discount would be
      discountAmount = basePrice * (promotion.value / 100);
      discountedPrice = basePrice - discountAmount;
      discountType = 'bundle';
      break;
      
    // Other promotion types would be handled similarly
  }
  
  // Ensure the price doesn't go below 0
  discountedPrice = Math.max(discountedPrice, 0);
  
  return {
    originalPrice: basePrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountType,
    promotion: promotion
  };
}

/**
 * Calculate margin-based price
 * @param {Number} cost - Product cost
 * @param {Number} margin - Desired margin percentage (0-1)
 * @param {String} roundingMethod - Rounding method to apply
 * @returns {Number} Price based on margin
 */
export function calculateMarginBasedPrice(cost, margin = 0.4, roundingMethod = 'nearest99') {
  if (!cost || cost <= 0) return 0;
  
  // Calculate price based on margin
  // Formula: Price = Cost / (1 - Margin)
  const price = cost / (1 - margin);
  
  // Apply rounding if specified
  if (roundingMethod && roundingFunctions[roundingMethod]) {
    return roundingFunctions[roundingMethod](price);
  }
  
  // Round to 2 decimal places
  return Math.round(price * 100) / 100;
}

/**
 * Calculate price for a product variant
 * @param {Object} product - Base product object
 * @param {Object} variant - Variant object
 * @param {Object} context - Pricing context
 * @returns {Object} Calculated variant price
 */
export function calculateVariantPrice(product, variant, context = {}) {
  // Use variant price if available, otherwise use product price
  const basePrice = variant.price || product.price;
  
  // Apply all pricing calculations as with regular products
  return calculateProductPrice({ ...product, price: basePrice }, context);
}

/**
 * Calculate the final price for a product
 * @param {Object} product - Product object
 * @param {Object} context - Pricing context
 * @returns {Object} Comprehensive price information
 */
export function calculateProductPrice(product, context = {}) {
  const {
    customerGroupId = 'retail',
    salesChannelId = 'webstore',
    regionId = 'us',
    quantity = 1,
    orderTotal = 0,
    includeTax = false,
    applyPromotions = true,
    includeAllData = false
  } = context;
  
  // Step 1: Get base price for customer group and sales channel
  const basePrice = calculateBasePrice(product, customerGroupId, salesChannelId);
  
  // Step 2: Apply tiered pricing based on quantity
  const tieredPricing = calculateTieredPrice(basePrice, quantity, customerGroupId);
  
  // Step 3: Apply regional pricing and currency conversion
  const regionalPricing = applyRegionalPricing(tieredPricing.price, regionId, includeTax);
  
  // Step 4: Find and apply applicable promotions
  let promotionalPrice = regionalPricing.finalPrice;
  let appliedPromotion = null;
  let promotionDiscount = 0;
  
  if (applyPromotions) {
    const applicablePromotions = findApplicablePromotions(product, {
      ...context,
      orderTotal: orderTotal || (regionalPricing.finalPrice * quantity)
    });
    
    if (applicablePromotions.length > 0) {
      // Apply the highest priority promotion (already sorted)
      const promotion = applicablePromotions[0];
      const promotionResult = applyPromotion(regionalPricing.finalPrice, promotion, { quantity });
      
      promotionalPrice = promotionResult.discountedPrice;
      appliedPromotion = promotion;
      promotionDiscount = promotionResult.discountAmount;
    }
  }
  
  // Create the final price object with all details
  let finalPrice = {
    finalPrice: promotionalPrice,
    basePrice: basePrice,
    listPrice: product.compareAtPrice || basePrice,
    currency: regionalPricing.currency,
    formattedPrice: formatPrice(promotionalPrice, regionalPricing.currency),
    
    // Information about discounts
    discountedFromList: (product.compareAtPrice && product.compareAtPrice > promotionalPrice)
      ? product.compareAtPrice - promotionalPrice
      : 0,
    percentDiscountFromList: (product.compareAtPrice && product.compareAtPrice > 0)
      ? Math.round(((product.compareAtPrice - promotionalPrice) / product.compareAtPrice) * 100)
      : 0,
      
    // Volume discount
    volumeDiscount: tieredPricing.discountPercent > 0,
    volumeDiscountPercent: tieredPricing.discountPercent,
    volumeDiscountTier: tieredPricing.tier ? tieredPricing.tier.name : null,
    
    // Promotion information
    hasPromotion: !!appliedPromotion,
    promotionName: appliedPromotion ? appliedPromotion.name : null,
    promotionDiscount: promotionDiscount,
    
    // Tax information
    taxRate: regionalPricing.taxRate,
    taxAmount: regionalPricing.taxAmount,
    taxInclusive: includeTax || regions.find(r => r.id === regionId)?.taxIsIncluded || false
  };
  
  // Include extended information if requested
  if (includeAllData) {
    finalPrice.calculations = {
      baseCalculation: {
        customerGroupId,
        salesChannelId,
        price: basePrice
      },
      tieredPricing,
      regionalPricing,
      applicablePromotions: findApplicablePromotions(product, context)
    };
  }
  
  return finalPrice;
}

/**
 * Format a price for display
 * @param {Number} price - Price value
 * @param {String} currencyCode - Currency code
 * @returns {String} Formatted price
 */
export function formatPrice(price, currencyCode = 'USD') {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * Simulate a price change and its impact
 * @param {Array} products - List of products
 * @param {Number} percentChange - Percentage change to apply
 * @param {Object} filters - Filters to select products (category, brand, etc)
 * @returns {Object} Impact analysis
 */
export function simulatePriceChange(products, percentChange, filters = {}) {
  // Clone the products to avoid modifying originals
  const targetProducts = products
    .filter(product => {
      // Apply filters
      if (filters.categoryId && !product.categories.includes(filters.categoryId)) {
        return false;
      }
      
      if (filters.productIds && !filters.productIds.includes(product.id)) {
        return false;
      }
      
      // More filter logic as needed
      
      return true;
    })
    .map(product => ({ ...product }));
    
  // Calculate current metrics
  const currentMetrics = targetProducts.reduce((metrics, product) => {
    metrics.totalRevenue += product.price;
    metrics.totalMargin += (product.price - (product.cost || 0));
    metrics.count += 1;
    return metrics;
  }, { totalRevenue: 0, totalMargin: 0, count: 0 });
  
  // Apply the price change and calculate new metrics
  const newMetrics = targetProducts.reduce((metrics, product) => {
    const newPrice = product.price * (1 + (percentChange / 100));
    metrics.totalRevenue += newPrice;
    metrics.totalMargin += (newPrice - (product.cost || 0));
    metrics.count += 1;
    
    product.simulatedPrice = Math.round(newPrice * 100) / 100;
    product.priceDifference = Math.round((newPrice - product.price) * 100) / 100;
    product.percentChange = percentChange;
    
    return metrics;
  }, { totalRevenue: 0, totalMargin: 0, count: 0 });
  
  return {
    currentMetrics,
    newMetrics,
    affectedProducts: targetProducts,
    revenueImpact: newMetrics.totalRevenue - currentMetrics.totalRevenue,
    marginImpact: newMetrics.totalMargin - currentMetrics.totalMargin,
    percentChangeRevenue: (newMetrics.totalRevenue / currentMetrics.totalRevenue - 1) * 100,
    percentChangeMargin: (newMetrics.totalMargin / currentMetrics.totalMargin - 1) * 100
  };
}

/**
 * Add a new promotion
 * @param {Object} promotionData - New promotion data
 * @returns {Object} Created promotion
 */
export function createPromotion(promotionData) {
  const newPromotion = {
    id: `promo-${Math.random().toString(36).substr(2, 9)}`,
    isActive: true,
    priority: 10,
    ...promotionData,
    startDate: promotionData.startDate || new Date().toISOString()
  };
  
  promotions.push(newPromotion);
  return newPromotion;
}

/**
 * Update an existing promotion
 * @param {String} promotionId - Promotion ID
 * @param {Object} updates - Updated promotion data
 * @returns {Object} Updated promotion
 */
export function updatePromotion(promotionId, updates) {
  const index = promotions.findIndex(p => p.id === promotionId);
  if (index === -1) throw new Error(`Promotion with ID ${promotionId} not found`);
  
  promotions[index] = { ...promotions[index], ...updates };
  return promotions[index];
}

/**
 * Delete a promotion
 * @param {String} promotionId - Promotion ID
 * @returns {Boolean} Success indicator
 */
export function deletePromotion(promotionId) {
  const index = promotions.findIndex(p => p.id === promotionId);
  if (index === -1) throw new Error(`Promotion with ID ${promotionId} not found`);
  
  promotions.splice(index, 1);
  return true;
}

/**
 * Calculate cost and margin for a product
 * @param {Object} product - Product object
 * @param {Object} context - Pricing context
 * @returns {Object} Cost and margin information
 */
export function calculateProductMargin(product, context = {}) {
  if (!product || !product.cost) {
    return {
      cost: 0,
      marginAmount: 0,
      marginPercent: 0
    };
  }
  
  const priceInfo = calculateProductPrice(product, context);
  const cost = product.cost;
  const price = priceInfo.finalPrice;
  
  const marginAmount = price - cost;
  const marginPercent = cost > 0 ? (marginAmount / price) * 100 : 0;
  
  return {
    cost,
    marginAmount,
    marginPercent: Math.round(marginPercent * 100) / 100
  };
}

// Export a mock API for the pricing system
export const mockPricingApi = {
  getBasePrice: (productId, customerGroupId = 'retail', salesChannelId = 'webstore') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          resolve({ success: false, error: 'Product not found' });
          return;
        }
        
        const basePrice = calculateBasePrice(product, customerGroupId, salesChannelId);
        resolve({ success: true, basePrice });
      }, 150);
    });
  },
  
  calculatePrice: (productId, context = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          resolve({ success: false, error: 'Product not found' });
          return;
        }
        
        const priceInfo = calculateProductPrice(product, context);
        resolve({ success: true, priceInfo });
      }, 200);
    });
  },
  
  getApplicablePromotions: (productId, context = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = products.find(p => p.id === productId);
        if (!product) {
          resolve({ success: false, error: 'Product not found' });
          return;
        }
        
        const applicablePromotions = findApplicablePromotions(product, context);
        resolve({ success: true, promotions: applicablePromotions });
      }, 180);
    });
  },
  
  simulatePriceChanges: (productIds, percentChange, filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetProducts = productIds
          ? products.filter(p => productIds.includes(p.id))
          : products;
        
        const simulationResults = simulatePriceChange(targetProducts, percentChange, filters);
        resolve({ success: true, results: simulationResults });
      }, 350);
    });
  },
  
  getCustomerGroups: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, customerGroups });
      }, 120);
    });
  },
  
  getSalesChannels: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, salesChannels });
      }, 120);
    });
  },
  
  getPromotions: (activeOnly = true) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = promotions;
        if (activeOnly) {
          result = promotions.filter(p => p.isActive);
        }
        resolve({ success: true, promotions: result });
      }, 150);
    });
  },
  
  createPromotion: (promotionData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const newPromotion = createPromotion(promotionData);
          resolve({ success: true, promotion: newPromotion });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }, 250);
    });
  },
  
  updatePromotion: (promotionId, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const updatedPromotion = updatePromotion(promotionId, updates);
          resolve({ success: true, promotion: updatedPromotion });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }, 200);
    });
  },
  
  deletePromotion: (promotionId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          deletePromotion(promotionId);
          resolve({ success: true });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }, 150);
    });
  }
};

export default {
  customerGroups,
  salesChannels,
  currencies,
  regions,
  basePriceMatrix,
  volumeTiers,
  categoryPricingRules,
  PROMOTION_TYPES,
  promotions,
  productPricingOverrides,
  calculateBasePrice,
  calculateTieredPrice,
  convertCurrency,
  applyRegionalPricing,
  findApplicablePromotions,
  applyPromotion,
  calculateMarginBasedPrice,
  calculateVariantPrice,
  calculateProductPrice,
  formatPrice,
  simulatePriceChange,
  createPromotion,
  updatePromotion,
  deletePromotion,
  calculateProductMargin,
  mockPricingApi
};