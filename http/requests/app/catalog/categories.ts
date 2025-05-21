import axiosInstance from "~/http/axios";
import type { Category } from "@/types/catalog/categories";

export default {
  // Fetch all categories with optional filters
  fetchCategories(params = {}) {
    return axiosInstance.get('/catalog/categories', { params });
  },

  // Fetch a single category by ID
  fetchCategory(id: string) {
    return axiosInstance.get(`/catalog/categories/${id}`);
  },

  // Create a new category
  createCategory(category: Category) {
    return axiosInstance.post('/catalog/categories', category);
  },

  // Update an existing category
  updateCategory(id: string, category: Partial<Category>) {
    return axiosInstance.put(`/catalog/categories/${id}`, category);
  },

  // Delete a category
  deleteCategory(id: string) {
    return axiosInstance.delete(`/catalog/categories/${id}`);
  },

  // Update category status (active/inactive)
  updateCategoryStatus(id: string, isActive: boolean) {
    return axiosInstance.patch(`/catalog/categories/${id}/status`, { isActive });
  },

  // Move a category (change parent)
  moveCategory(id: string, parentId: string | null) {
    return axiosInstance.patch(`/catalog/categories/${id}/move`, { parentId });
  },

  // Reorder categories within the same parent
  reorderCategories(parentId: string | null, categoryIds: string[]) {
    return axiosInstance.post(`/catalog/categories/reorder`, { parentId, categoryIds });
  },

  // Bulk update categories
  bulkUpdateCategories(categoryIds: string[], updates: any) {
    return axiosInstance.patch('/catalog/categories/bulk', { ids: categoryIds, updates });
  },

  // Get categories with product counts
  getCategoriesWithProductCounts() {
    return axiosInstance.get('/catalog/categories/with-product-counts');
  },

  // Export categories
  exportCategories(format: string = 'csv', filters = {}) {
    return axiosInstance.get(`/catalog/categories/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },

  // Import categories
  importCategories(formData: FormData) {
    return axiosInstance.post('/catalog/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Update category attributes
  updateCategoryAttributes(id: string, attributes: any[]) {
    return axiosInstance.patch(`/catalog/categories/${id}/attributes`, { attributes });
  },

  // Update category SEO metadata
  updateCategorySEO(id: string, seoData: any) {
    return axiosInstance.patch(`/catalog/categories/${id}/seo`, seoData);
  },

  // Upload category image (icon, thumbnail, banner, hero)
  uploadCategoryImage(id: string, imageType: string, formData: FormData) {
    return axiosInstance.post(`/catalog/categories/${id}/images/${imageType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete category image
  deleteCategoryImage(id: string, imageType: string) {
    return axiosInstance.delete(`/catalog/categories/${id}/images/${imageType}`);
  }
}