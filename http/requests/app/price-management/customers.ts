import axiosInstance from "~/http/axios";
import type { Customer, CustomerGroup, CustomerPriceOverride, CustomerPricingTier } from "@/types/price-management/customers";

export default {
  // Customers
  fetchCustomers(params = {}) {
    return axiosInstance.get('/price-management/customers', { params });
  },

  getCustomerById(customerId: string) {
    return axiosInstance.get(`/price-management/customers/${customerId}`);
  },

  createCustomer(customer: Partial<Customer>) {
    return axiosInstance.post('/price-management/customers', customer);
  },

  updateCustomer(customerId: string, customer: Partial<Customer>) {
    return axiosInstance.put(`/price-management/customers/${customerId}`, customer);
  },

  deleteCustomer(customerId: string) {
    return axiosInstance.delete(`/price-management/customers/${customerId}`);
  },

  updateCustomerStatus(customerId: string, status: string, reason?: string) {
    return axiosInstance.patch(`/price-management/customers/${customerId}/status`, {
      status,
      reason
    });
  },

  bulkUpdateCustomers(customerIds: string[], updates: Partial<Customer>) {
    return axiosInstance.patch('/price-management/customers/bulk-update', {
      customerIds,
      updates
    });
  },

  // Customer search and filtering
  searchCustomers(query: string, params = {}) {
    return axiosInstance.get('/price-management/customers/search', {
      params: {
        query,
        ...params
      }
    });
  },

  getCustomersByTag(tag: string, params = {}) {
    return axiosInstance.get('/price-management/customers/by-tag', {
      params: {
        tag,
        ...params
      }
    });
  },

  // Customer Groups
  fetchCustomerGroups(params = {}) {
    return axiosInstance.get('/price-management/customer-groups', { params });
  },

  getCustomerGroupById(groupId: string) {
    return axiosInstance.get(`/price-management/customer-groups/${groupId}`);
  },

  createCustomerGroup(group: Partial<CustomerGroup>) {
    return axiosInstance.post('/price-management/customer-groups', group);
  },

  updateCustomerGroup(groupId: string, updates: Partial<CustomerGroup>) {
    return axiosInstance.put(`/price-management/customer-groups/${groupId}`, updates);
  },

  deleteCustomerGroup(groupId: string) {
    return axiosInstance.delete(`/price-management/customer-groups/${groupId}`);
  },

  setDefaultCustomerGroup(groupId: string) {
    return axiosInstance.patch(`/price-management/customer-groups/${groupId}/set-default`);
  },

  getCustomerGroupMembers(groupId: string, params = {}) {
    return axiosInstance.get(`/price-management/customer-groups/${groupId}/members`, { params });
  },

  assignCustomersToGroup(customerIds: string[], groupId: string) {
    return axiosInstance.post(`/price-management/customer-groups/${groupId}/assign-customers`, {
      customerIds
    });
  },

  removeCustomersFromGroup(customerIds: string[], groupId: string) {
    return axiosInstance.post(`/price-management/customer-groups/${groupId}/remove-customers`, {
      customerIds
    });
  },

  // Customer Price Overrides
  getCustomerPricingOverrides(customerId: string, params = {}) {
    return axiosInstance.get(`/price-management/customers/${customerId}/price-overrides`, { params });
  },

  createCustomerPricingOverride(override: Partial<CustomerPriceOverride>) {
    return axiosInstance.post('/price-management/customer-price-overrides', override);
  },

  updateCustomerPricingOverride(overrideId: string, updates: Partial<CustomerPriceOverride>) {
    return axiosInstance.put(`/price-management/customer-price-overrides/${overrideId}`, updates);
  },

  deleteCustomerPricingOverride(overrideId: string) {
    return axiosInstance.delete(`/price-management/customer-price-overrides/${overrideId}`);
  },

  bulkCreateCustomerPriceOverrides(overrides: Partial<CustomerPriceOverride>[]) {
    return axiosInstance.post('/price-management/customer-price-overrides/bulk', overrides);
  },

  // Customer Pricing Tiers
  getCustomerPricingTiers() {
    return axiosInstance.get('/price-management/customer-pricing-tiers');
  },

  createCustomerPricingTier(tier: Partial<CustomerPricingTier>) {
    return axiosInstance.post('/price-management/customer-pricing-tiers', tier);
  },

  updateCustomerPricingTier(tierId: string, tier: Partial<CustomerPricingTier>) {
    return axiosInstance.put(`/price-management/customer-pricing-tiers/${tierId}`, tier);
  },

  deleteCustomerPricingTier(tierId: string) {
    return axiosInstance.delete(`/price-management/customer-pricing-tiers/${tierId}`);
  },

  assignCustomersToPricingTier(customerIds: string[], tierId: string) {
    return axiosInstance.post(`/price-management/customer-pricing-tiers/${tierId}/assign-customers`, {
      customerIds
    });
  },

  // Customer Specific Reports
  getCustomerPurchaseHistory(customerId: string, params = {}) {
    return axiosInstance.get(`/price-management/customers/${customerId}/purchase-history`, { params });
  },

  getCustomerPricingAnalysis(customerId: string, params = {}) {
    return axiosInstance.get(`/price-management/customers/${customerId}/pricing-analysis`, { params });
  },

  getCustomerDiscountReport(customerId: string, params = {}) {
    return axiosInstance.get(`/price-management/customers/${customerId}/discount-report`, { params });
  },

  // Import/Export functionality
  exportCustomers(format: string = 'csv', filters = {}) {
    return axiosInstance.post(`/price-management/customers/export/${format}`, filters, {
      responseType: 'blob'
    });
  },

  importCustomers(formData: FormData) {
    return axiosInstance.post('/price-management/customers/import', formData, {
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

  exportCustomerPricingOverrides(format: string = 'csv', filters = {}) {
    return axiosInstance.post(`/price-management/customer-price-overrides/export/${format}`, filters, {
      responseType: 'blob'
    });
  },

  importCustomerPricingOverrides(formData: FormData) {
    return axiosInstance.post('/price-management/customer-price-overrides/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Customer payment terms management
  getCustomerPaymentTerms(customerId: string) {
    return axiosInstance.get(`/price-management/customers/${customerId}/payment-terms`);
  },

  updateCustomerPaymentTerms(customerId: string, paymentTerms: any) {
    return axiosInstance.put(`/price-management/customers/${customerId}/payment-terms`, paymentTerms);
  },

  // Credit management
  updateCustomerCreditLimit(customerId: string, creditLimit: number) {
    return axiosInstance.patch(`/price-management/customers/${customerId}/credit-limit`, {
      creditLimit
    });
  },

  getCustomerCreditHistory(customerId: string, params = {}) {
    return axiosInstance.get(`/price-management/customers/${customerId}/credit-history`, { params });
  },

  // Customer tags management
  getAvailableCustomerTags() {
    return axiosInstance.get('/price-management/customer-tags');
  },

  addTagsToCustomer(customerId: string, tags: string[]) {
    return axiosInstance.post(`/price-management/customers/${customerId}/tags`, { tags });
  },

  removeTagsFromCustomer(customerId: string, tags: string[]) {
    return axiosInstance.delete(`/price-management/customers/${customerId}/tags`, {
      data: { tags }
    });
  },

  // Customer address management
  addCustomerAddress(customerId: string, address: any) {
    return axiosInstance.post(`/price-management/customers/${customerId}/addresses`, address);
  },

  updateCustomerAddress(customerId: string, addressId: string, address: any) {
    return axiosInstance.put(`/price-management/customers/${customerId}/addresses/${addressId}`, address);
  },

  deleteCustomerAddress(customerId: string, addressId: string) {
    return axiosInstance.delete(`/price-management/customers/${customerId}/addresses/${addressId}`);
  },

  setDefaultAddress(customerId: string, addressId: string, addressType: 'billing' | 'shipping') {
    return axiosInstance.patch(`/price-management/customers/${customerId}/addresses/${addressId}/set-default`, {
      addressType
    });
  }
};