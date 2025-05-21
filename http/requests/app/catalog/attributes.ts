import axiosInstance from "~/http/axios";
import type { Attribute, AttributeGroup, AttributeSet, VariantMatrix, AttributeDependencyRule } from "@/types/catalog/attributes";

export default {
  // Fetch all attributes with related data
  fetchAttributes(params = {}) {
    return axiosInstance.get('/catalog/attributes', { params });
  },

  // Fetch a single attribute by ID
  fetchAttribute(id: string) {
    return axiosInstance.get(`/catalog/attributes/${id}`);
  },

  // Create a new attribute
  createAttribute(attribute: Attribute) {
    return axiosInstance.post('/catalog/attributes', attribute);
  },

  // Update an existing attribute
  updateAttribute(id: string, attribute: Partial<Attribute>) {
    return axiosInstance.put(`/catalog/attributes/${id}`, attribute);
  },

  // Delete an attribute
  deleteAttribute(id: string) {
    return axiosInstance.delete(`/catalog/attributes/${id}`);
  },

  // Update attribute options
  updateAttributeOptions(id: string, options: any[]) {
    return axiosInstance.patch(`/catalog/attributes/${id}/options`, { options });
  },

  // Update attribute validations
  updateAttributeValidations(id: string, validations: any[]) {
    return axiosInstance.patch(`/catalog/attributes/${id}/validations`, { validations });
  },

  // Get attributes by type
  getAttributesByType(type: string) {
    return axiosInstance.get(`/catalog/attributes/by-type/${type}`);
  },

  // Get filterable attributes
  getFilterableAttributes() {
    return axiosInstance.get('/catalog/attributes/filterable');
  },

  // Get variant attributes
  getVariantAttributes() {
    return axiosInstance.get('/catalog/attributes/variant');
  },

  // Attribute Groups
  // ---------------

  // Fetch all attribute groups
  fetchAttributeGroups() {
    return axiosInstance.get('/catalog/attribute-groups');
  },

  // Fetch a single attribute group
  fetchAttributeGroup(id: string) {
    return axiosInstance.get(`/catalog/attribute-groups/${id}`);
  },

  // Create a new attribute group
  createAttributeGroup(group: AttributeGroup) {
    return axiosInstance.post('/catalog/attribute-groups', group);
  },

  // Update an attribute group
  updateAttributeGroup(id: string, group: Partial<AttributeGroup>) {
    return axiosInstance.put(`/catalog/attribute-groups/${id}`, group);
  },

  // Delete an attribute group
  deleteAttributeGroup(id: string) {
    return axiosInstance.delete(`/catalog/attribute-groups/${id}`);
  },

  // Attribute Sets
  // -------------

  // Fetch all attribute sets
  fetchAttributeSets() {
    return axiosInstance.get('/catalog/attribute-sets');
  },

  // Fetch a single attribute set
  fetchAttributeSet(id: string) {
    return axiosInstance.get(`/catalog/attribute-sets/${id}`);
  },

  // Create a new attribute set
  createAttributeSet(set: AttributeSet) {
    return axiosInstance.post('/catalog/attribute-sets', set);
  },

  // Update an attribute set
  updateAttributeSet(id: string, set: Partial<AttributeSet>) {
    return axiosInstance.put(`/catalog/attribute-sets/${id}`, set);
  },

  // Delete an attribute set
  deleteAttributeSet(id: string) {
    return axiosInstance.delete(`/catalog/attribute-sets/${id}`);
  },

  // Get the default attribute set
  getDefaultAttributeSet() {
    return axiosInstance.get('/catalog/attribute-sets/default');
  },

  // Assign attributes to a group in a set
  assignAttributesToGroup(setId: string, groupId: string, attributeIds: string[]) {
    return axiosInstance.post(`/catalog/attribute-sets/${setId}/groups/${groupId}/attributes`, {
      attributeIds
    });
  },

  // Variant Matrices
  // ---------------

  // Fetch all variant matrices
  fetchVariantMatrices() {
    return axiosInstance.get('/catalog/variant-matrices');
  },

  // Fetch a variant matrix by product ID
  fetchVariantMatrixByProduct(productId: string) {
    return axiosInstance.get(`/catalog/variant-matrices/product/${productId}`);
  },

  // Create a variant matrix
  createVariantMatrix(productId: string, variantAttributes: string[]) {
    return axiosInstance.post('/catalog/variant-matrices', {
      productId,
      variantAttributes
    });
  },

  // Update a variant matrix
  updateVariantMatrix(id: string, matrix: Partial<VariantMatrix>) {
    return axiosInstance.put(`/catalog/variant-matrices/${id}`, matrix);
  },

  // Delete a variant matrix
  deleteVariantMatrix(id: string) {
    return axiosInstance.delete(`/catalog/variant-matrices/${id}`);
  },

  // Update variants in a matrix
  updateVariants(matrixId: string, variants: any[]) {
    return axiosInstance.patch(`/catalog/variant-matrices/${matrixId}/variants`, {
      variants
    });
  },

  // Add excluded combinations to a matrix
  addExcludedCombinations(matrixId: string, combinations: any[]) {
    return axiosInstance.post(`/catalog/variant-matrices/${matrixId}/excluded-combinations`, {
      combinations
    });
  },

  // Generate all possible variant combinations
  generateVariantCombinations(attributeIds: string[], excludedCombinations: any[] = []) {
    return axiosInstance.post('/catalog/variant-matrices/generate-combinations', {
      attributeIds,
      excludedCombinations
    });
  },

  // Dependency Rules
  // ---------------

  // Fetch all dependency rules
  fetchDependencyRules() {
    return axiosInstance.get('/catalog/dependency-rules');
  },

  // Create a dependency rule
  createDependencyRule(rule: AttributeDependencyRule) {
    return axiosInstance.post('/catalog/dependency-rules', rule);
  },

  // Update a dependency rule
  updateDependencyRule(id: string, rule: Partial<AttributeDependencyRule>) {
    return axiosInstance.put(`/catalog/dependency-rules/${id}`, rule);
  },

  // Delete a dependency rule
  deleteDependencyRule(id: string) {
    return axiosInstance.delete(`/catalog/dependency-rules/${id}`);
  },

  // Validate if a combination follows dependency rules
  validateCombination(combination: Record<string, any>) {
    return axiosInstance.post('/catalog/dependency-rules/validate', { combination });
  },

  // Bulk Operations
  // --------------

  // Bulk update attributes
  bulkUpdateAttributes(attributeIds: string[], updates: any) {
    return axiosInstance.patch('/catalog/attributes/bulk', {
      ids: attributeIds,
      updates
    });
  },

  // Import & Export
  // --------------

  // Export attributes
  exportAttributes(format: string = 'csv', filters = {}) {
    return axiosInstance.get(`/catalog/attributes/export/${format}`, {
      params: filters,
      responseType: 'blob'
    });
  },

  // Import attributes
  importAttributes(formData: FormData) {
    return axiosInstance.post('/catalog/attributes/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Export attribute sets
  exportAttributeSets(format: string = 'csv') {
    return axiosInstance.get(`/catalog/attribute-sets/export/${format}`, {
      responseType: 'blob'
    });
  },

  // Import attribute sets
  importAttributeSets(formData: FormData) {
    return axiosInstance.post('/catalog/attribute-sets/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}