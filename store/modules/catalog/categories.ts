import { defineStore } from 'pinia';
import categoriesApi from '@/http/requests/app/catalog/categories';
import { categoriesData, categoryUtils } from '@/mock/mockCategoriesData';
import type { Category, CategoriesState } from '@/types/catalog/categories';
import { v4 as uuidv4 } from 'uuid';


// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    flattenedCategories: [],
    loading: false,
    error: null,
    useMockData: isDev // Default to mock data in development
  }),

  getters: {
    getCategories: (state) => state.categories,
    getFlattenedCategories: (state) => state.flattenedCategories,
    getIsLoading: (state) => state.loading,
    getError: (state) => state.error,

    // Get category by ID
    getCategoryById: (state) => (id: string) => 
      state.flattenedCategories.find(cat => cat.id === id),
      
    // Get category by slug
    getCategoryBySlug: (state) => (slug: string) => 
      state.flattenedCategories.find(cat => cat.slug === slug),
    
    // Get root categories
    getRootCategories: (state) => 
      state.categories.filter(category => !category.parentId),
    
    // Get active categories
    getActiveCategories: (state) => 
      state.flattenedCategories.filter(cat => cat.isActive),
    
    // Get featured categories
    getFeaturedCategories: (state) => 
      state.flattenedCategories.filter(cat => cat.isFeatured),
    
    // Get category path (breadcrumbs)
    getCategoryPath: (state) => (categoryId: string) => {
      const result: Category[] = [];
      let current = state.flattenedCategories.find(c => c.id === categoryId);
      
      while (current) {
        result.unshift(current);
        if (!current.parentId) break;
        current = state.flattenedCategories.find(c => c.id === current?.parentId);
      }
      
      return result;
    },
    
    // Get categories by channel visibility
    getCategoriesByChannel: (state) => (channel: 'webstore' | 'b2bPortal' | 'pos') => 
      state.flattenedCategories.filter(cat => 
        cat.metadata?.visibility && cat.metadata.visibility[channel] === true
      ),
    
    // Get categories accessible by a specific role
    getCategoriesByRole: (state) => (role: string) => 
      state.flattenedCategories.filter(cat => {
        if (!cat.metadata?.accessControl?.roles) return true; // Default to accessible
        return cat.metadata.accessControl.roles.includes(role);
      }),
    
    // Get categories with specific attribute
    getCategoriesWithAttribute: (state) => (attributeCode: string) => 
      state.flattenedCategories.filter(cat => {
        if (!cat.metadata?.attributes) return false;
        return cat.metadata.attributes.some(attr => attr.code === attributeCode);
      }),
    
    // Check if a category is active now (considering date range)
    isCategoryActiveNow: () => (category: Category) => {
      if (!category.isActive) return false;
      
      const now = new Date();
      const startDate = category.metadata?.visibility?.startDate 
        ? new Date(category.metadata.visibility.startDate) 
        : null;
      const endDate = category.metadata?.visibility?.endDate 
        ? new Date(category.metadata.visibility.endDate) 
        : null;
      
      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
      
      return true;
    }
  },

  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    // Helper method to flatten the category tree
    flattenCategoryTree(categories: Category[] = this.categories) {
      let result: Category[] = [];
      
      const flatten = (items: Category[]) => {
        items.forEach(item => {
          // Create a copy without the children array to avoid circular references
          const category = { ...item };
          const children = category.children;
          delete category.children;
          
          result.push(category);
          
          if (children && children.length > 0) {
            flatten(children);
          }
        });
      };
      
      flatten(categories);
      return result;
    },

    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock category data");
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          this.categories = JSON.parse(JSON.stringify(categoriesData)); // Deep clone
        } else {
          // Use real API
          console.log("Using API category data");
          response = await categoriesApi.fetchCategories();
          this.categories = response.data.data;
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return this.categories;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while fetching categories.';
        throw error;
      }
    },

    async createCategory(category: Omit<Category, 'id' | 'children'>) {
      this.loading = true;
      this.error = null;
      
      try {
        // Create a new category with an ID
        const newCategory: Category = {
          ...category,
          id: uuidv4(),
          children: []
        };
        
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for category creation");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Add the category to the appropriate place in the tree
          if (newCategory.parentId) {
            // Add as a child of an existing category
            this.addChildCategory(newCategory);
          } else {
            // Add as a root category
            this.categories.push(newCategory);
          }
          
          response = { data: { data: newCategory } };
        } else {
          // Use real API
          response = await categoriesApi.createCategory(newCategory);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while creating category.';
        throw error;
      }
    },
    
    // Helper method to add a child category to the tree
    addChildCategory(category: Category) {
      const findAndAddChild = (categories: Category[], parentId: string | null) => {
        for (const cat of categories) {
          if (cat.id === parentId) {
            if (!cat.children) {
              cat.children = [];
            }
            cat.children.push(category);
            return true;
          }
          
          if (cat.children && cat.children.length > 0) {
            if (findAndAddChild(cat.children, parentId)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      if (category.parentId) {
        findAndAddChild(this.categories, category.parentId);
      }
    },

    async updateCategory(categoryId: string, categoryData: Partial<Category>) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for category update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update the category in the tree
          this.updateCategoryInTree(categoryId, categoryData);
          
          // Get the updated category
          const updatedCategory = this.flattenedCategories.find(cat => cat.id === categoryId);
          response = { data: { data: updatedCategory } };
        } else {
          // Use real API
          response = await categoriesApi.updateCategory(categoryId, categoryData);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating category.';
        throw error;
      }
    },
    
    // Helper method to update a category in the tree
    updateCategoryInTree(categoryId: string, categoryData: Partial<Category>) {
      const updateCategory = (categories: Category[]) => {
        for (let i = 0; i < categories.length; i++) {
          if (categories[i].id === categoryId) {
            categories[i] = { ...categories[i], ...categoryData };
            return true;
          }
          
          if (categories[i].children && categories[i].children.length > 0) {
            if (updateCategory(categories[i].children!)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      updateCategory(this.categories);
    },

    async deleteCategory(categoryId: string) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for category deletion");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Check if the category has children
          const categoryToDelete = this.flattenedCategories.find(cat => cat.id === categoryId);
          const hasChildren = this.flattenedCategories.some(cat => cat.parentId === categoryId);
          
          if (hasChildren) {
            throw new Error('Cannot delete a category that has subcategories');
          }
          
          // Remove the category from the tree
          this.removeCategoryFromTree(categoryId);
          
          response = { data: { success: true } };
        } else {
          // Use real API
          response = await categoriesApi.deleteCategory(categoryId);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while deleting category.';
        throw error;
      }
    },
    
    // Helper method to remove a category from the tree
    removeCategoryFromTree(categoryId: string) {
      const removeCategory = (categories: Category[]) => {
        for (let i = 0; i < categories.length; i++) {
          if (categories[i].id === categoryId) {
            categories.splice(i, 1);
            return true;
          }
          
          if (categories[i].children && categories[i].children.length > 0) {
            if (removeCategory(categories[i].children!)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      removeCategory(this.categories);
    },

    async moveCategory(categoryId: string, newParentId: string | null) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for category move");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Find the category to move
          const categoryToMove = this.flattenedCategories.find(cat => cat.id === categoryId);
          
          if (!categoryToMove) {
            throw new Error(`Category with ID ${categoryId} not found`);
          }
          
          // Check for circular reference
          if (newParentId !== null) {
            let parent = this.flattenedCategories.find(cat => cat.id === newParentId);
            while (parent) {
              if (parent.id === categoryId) {
                throw new Error('Cannot create circular category reference');
              }
              parent = parent.parentId ? this.flattenedCategories.find(cat => cat.id === parent?.parentId) : null;
            }
          }
          
          // Remove the category from its current parent
          this.removeCategoryFromTree(categoryId);
          
          // Update the parentId
          categoryToMove.parentId = newParentId;
          
          // Update the path and level
          if (newParentId === null) {
            categoryToMove.path = categoryToMove.slug;
            categoryToMove.level = 0;
          } else {
            const newParent = this.flattenedCategories.find(cat => cat.id === newParentId);
            if (newParent) {
              categoryToMove.path = `${newParent.path}/${categoryToMove.slug}`;
              categoryToMove.level = newParent.level + 1;
            }
          }
          
          // Add the category to its new parent
          if (newParentId === null) {
            this.categories.push(categoryToMove);
          } else {
            this.addChildCategory(categoryToMove);
          }
          
          response = { data: { data: categoryToMove } };
        } else {
          // Use real API
          response = await categoriesApi.moveCategory(categoryId, newParentId);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while moving category.';
        throw error;
      }
    },

    async reorderCategories(parentId: string | null, categoryIds: string[]) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for category reordering");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update positions for the categories
          const updatePositions = (categories: Category[]) => {
            // Find the parent category or work with root categories
            let targetCategories: Category[] = [];
            
            if (parentId === null) {
              targetCategories = this.categories;
            } else {
              const findParent = (cats: Category[]): Category[] | null => {
                for (const cat of cats) {
                  if (cat.id === parentId) {
                    return cat.children || [];
                  }
                  
                  if (cat.children && cat.children.length > 0) {
                    const result = findParent(cat.children);
                    if (result) return result;
                  }
                }
                
                return null;
              };
              
              const parentChildren = findParent(this.categories);
              if (parentChildren) {
                targetCategories = parentChildren;
              }
            }
            
            // Reorder the categories
            const reordered = categoryIds.map((id, index) => {
              const category = targetCategories.find(cat => cat.id === id);
              if (category) {
                return {
                  ...category,
                  position: index + 1
                };
              }
              return null;
            }).filter(Boolean) as Category[];
            
            // Update the parent's children or root categories
            if (parentId === null) {
              this.categories = [...reordered];
            } else {
              const updateParentChildren = (cats: Category[]) => {
                for (let i = 0; i < cats.length; i++) {
                  if (cats[i].id === parentId) {
                    cats[i].children = [...reordered];
                    return true;
                  }
                  
                  if (cats[i].children && cats[i].children.length > 0) {
                    if (updateParentChildren(cats[i].children!)) {
                      return true;
                    }
                  }
                }
                
                return false;
              };
              
              updateParentChildren(this.categories);
            }
          };
          
          updatePositions(this.categories);
          
          response = { data: { success: true } };
        } else {
          // Use real API
          response = await categoriesApi.reorderCategories(parentId, categoryIds);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while reordering categories.';
        throw error;
      }
    },

    async updateCategoryStatus(categoryId: string, isActive: boolean) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for category status update");
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Update the category status
          this.updateCategoryInTree(categoryId, { isActive });
          
          // Get the updated category
          const updatedCategory = this.flattenedCategories.find(cat => cat.id === categoryId);
          response = { data: { data: updatedCategory } };
        } else {
          // Use real API
          response = await categoriesApi.updateCategoryStatus(categoryId, isActive);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred while updating category status.';
        throw error;
      }
    },

    async bulkUpdateCategories(categoryIds: string[], updates: Partial<Category>) {
      this.loading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Use mock data
          console.log("Using mock data for bulk category update");
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          // Update each category
          categoryIds.forEach(id => {
            this.updateCategoryInTree(id, updates);
          });
          
          response = { data: { success: true } };
        } else {
          // Use real API
          response = await categoriesApi.bulkUpdateCategories(categoryIds, updates);
          
          // Refresh categories to get the updated tree
          await this.fetchCategories();
        }
        
        // Update flattened categories
        this.flattenedCategories = this.flattenCategoryTree(this.categories);
        
        this.loading = false;
        return response;
      } catch (error: any) {
        this.loading = false;
        this.error = error.response?.data?.message || 'An error occurred during bulk update.';
        throw error;
      }
    }
  }
});