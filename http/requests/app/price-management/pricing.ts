import axiosInstance from "~/http/axios";
import type { Promotion, CustomerGroup, SalesChannel, PriceCalculationContext } from "@/types/price-management/pricing";

export default {
  // Customer Groups
  getCustomerGroups() {
    return axiosInstance.get('/price-management/customer-groups');
  },

  getCustomerGroup(id: string) {
    return axiosInstance.get(`/price-management/customer-groups/${id}`);
  },

  createCustomerGroup(customerGroup: Partial<CustomerGroup>) {
    return axiosInstance.post('/price-management/customer-groups', customerGroup);
  },

  updateCustomerGroup(id: string, customerGroup: Partial<CustomerGroup>) {
    return axiosInstance.put(`/price-management/customer-groups/${id}`, customerGroup);
  },

  deleteCustomerGroup(id: string) {
    return axiosInstance.delete(`/price-management/customer-groups/${id}`);
  },

  // Sales Channels
  getSalesChannels() {
    return axiosInstance.get('/price-management/sales-channels');
  },

  getSalesChannel(id: string) {
    return axiosInstance.get(`/price-management/sales-channels/${id}`);
  },

  createSalesChannel(salesChannel: Partial<SalesChannel>) {
    return axiosInstance.post('/price-management/sales-channels', salesChannel);
  },

  updateSalesChannel(id: string, salesChannel: Partial<SalesChannel>) {
    return axiosInstance.put(`/price-management/sales-channels/${id}`, salesChannel);
  },

  deleteSalesChannel(id: string) {
    return axiosInstance.delete(`/price-management/sales-channels/${id}`);
  },

  // Promotions
  getPromotions(activeOnly: boolean = false) {
    return axiosInstance.get('/price-management/promotions', {
      params: { activeOnly }
    });
  },

  getPromotion(id: string) {
    return axiosInstance.get(`/price-management/promotions/${id}`);
  },

  createPromotion(promotion: Partial<Promotion>) {
    return axiosInstance.post('/price-management/promotions', promotion);
  },

  updatePromotion(id: string, promotion: Partial<Promotion>) {
    return axiosInstance.put(`/price-management/promotions/${id}`, promotion);
  },

  deletePromotion(id: string) {
    return axiosInstance.delete(`/price-management/promotions/${id}`);
  },

  // Price Calculations
  calculatePrice(productId: string, context: PriceCalculationContext) {
    return axiosInstance.post(`/price-management/calculate-price/${productId}`, context);
  },

  getApplicablePromotions(productId: string, context: PriceCalculationContext) {
    return axiosInstance.post(`/price-management/applicable-promotions/${productId}`, context);
  },

  simulatePriceChanges(productIds: string[], percentChange: number, filters = {}) {
    return axiosInstance.post('/price-management/simulate-price-changes', {
      productIds,
      percentChange,
      filters
    });
  },

  // Regional Pricing
  getRegions() {
    return axiosInstance.get('/price-management/regions');
  },

  getCurrencies() {
    return axiosInstance.get('/price-management/currencies');
  },

  // Volume Pricing Tiers
  getVolumeTiers() {
    return axiosInstance.get('/price-management/volume-tiers');
  },

  createVolumeTier(volumeTier: any) {
    return axiosInstance.post('/price-management/volume-tiers', volumeTier);
  },

  updateVolumeTier(id: string, volumeTier: any) {
    return axiosInstance.put(`/price-management/volume-tiers/${id}`, volumeTier);
  },

  deleteVolumeTier(id: string) {
    return axiosInstance.delete(`/price-management/volume-tiers/${id}`);
  },

  // Product-specific Price Overrides
  getPriceOverrides(productId: string) {
    return axiosInstance.get(`/price-management/price-overrides/${productId}`);
  },

  createPriceOverride(priceOverride: any) {
    return axiosInstance.post('/price-management/price-overrides', priceOverride);
  },

  updatePriceOverride(id: string, priceOverride: any) {
    return axiosInstance.put(`/price-management/price-overrides/${id}`, priceOverride);
  },

  deletePriceOverride(id: string) {
    return axiosInstance.delete(`/price-management/price-overrides/${id}`);
  },

  // Category Pricing Rules
  getCategoryPricingRules() {
    return axiosInstance.get('/price-management/category-pricing-rules');
  },

  createCategoryPricingRule(rule: any) {
    return axiosInstance.post('/price-management/category-pricing-rules', rule);
  },

  updateCategoryPricingRule(id: string, rule: any) {
    return axiosInstance.put(`/price-management/category-pricing-rules/${id}`, rule);
  },

  deleteCategoryPricingRule(id: string) {
    return axiosInstance.delete(`/price-management/category-pricing-rules/${id}`);
  },

  // Bulk Operations
  bulkUpdatePromotions(promotionIds: string[], updates: any) {
    return axiosInstance.patch('/price-management/promotions/bulk', {
      ids: promotionIds,
      updates
    });
  },

  // Import/Export
  exportPromotions(format: string = 'csv') {
    return axiosInstance.get(`/price-management/promotions/export/${format}`, {
      responseType: 'blob'
    });
  },

  importPromotions(formData: FormData) {
    return axiosInstance.post('/price-management/promotions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  exportCustomerGroups(format: string = 'csv') {
    return axiosInstance.get(`/price-management/customer-groups/export/${format}`, {
      responseType: 'blob'
    });
  },

  importCustomerGroups(formData: FormData) {
    return axiosInstance.post('/price-management/customer-groups/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Price Matrix
  getPriceMatrix() {
    return axiosInstance.get('/price-management/price-matrix');
  },

  updatePriceMatrix(matrix: any) {
    return axiosInstance.put('/price-management/price-matrix', matrix);
  },

  // Report Generation
  generatePricingReport(params: any) {
    return axiosInstance.post('/price-management/reports/pricing', params);
  },

  generatePromotionPerformanceReport(params: any) {
    return axiosInstance.post('/price-management/reports/promotion-performance', params);
  },

  generateMarginReport(params: any) {
    return axiosInstance.post('/price-management/reports/margin', params);
  },

  // Coupon Code Management
  validateCouponCode(code: string, context: any) {
    return axiosInstance.post('/price-management/coupons/validate', {
      code,
      ...context
    });
  },

  generateCouponCodes(promotionId: string, quantity: number, options: any = {}) {
    return axiosInstance.post(`/price-management/promotions/${promotionId}/generate-coupons`, {
      quantity,
      ...options
    });
  }
};