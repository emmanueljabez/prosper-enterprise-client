import axiosInstance from "~/http/axios";
import type { Product } from "@/types/catalog/products";

export default {
  // Fetch all products with optional filters
  fetchProducts(params = {}) {
    return axiosInstance.get('/catalog/products', { params });
  },

  // Fetch a single product by ID
  fetchProduct(id: number) {
    return axiosInstance.get(`/catalog/products/${id}`);
  },

  // Create a new product
  createProduct(product: Product) {
    return axiosInstance.post('/catalog/products', product);
  },

  // Update an existing product
  updateProduct(id: number, product: Product) {
    return axiosInstance.put(`/catalog/products/${id}`, product);
  },

  // Delete a product
  deleteProduct(id: number) {
    return axiosInstance.delete(`/catalog/products/${id}`);
  },

  // Update product status
  updateProductStatus(id: number, status: string, reason?: string) {
    return axiosInstance.patch(`/catalog/products/${id}/status`, { status, reason });
  },

  // Duplicate a product
  duplicateProduct(id: number) {
    return axiosInstance.post(`/catalog/products/${id}/duplicate`);
  },

  // Update product variants
  updateProductVariants(id: number, variants: any[]) {
    return axiosInstance.put(`/catalog/products/${id}/variants`, { variants });
  },

  // Bulk update products
  bulkUpdateProducts(productIds: number[], updates: any) {
    return axiosInstance.patch('/catalog/products/bulk', { ids: productIds, updates });
  },

  // Export products
  exportProducts(format: string, filters = {}) {
    return axiosInstance.get(`/catalog/products/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },

  // Import products
  importProducts(formData: FormData) {
    return axiosInstance.post('/catalog/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}