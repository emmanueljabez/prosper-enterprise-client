<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Product Categories</h2>
        <p class="text-muted-foreground">Manage your product organization and taxonomy</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- <Button variant="outline" @click="toggleDataSource">
          <Database class="h-4 w-4 mr-2" />
          {{ usingMockData ? 'Using Mock Data' : 'Using API Data' }}
        </Button> -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileUp class="h-4 w-4 mr-2" />
              Import
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openImportSheet('csv')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Import CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('excel')">
              <Table2 class="h-4 w-4 mr-2" />
              Import Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openCategoryCreationDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>
    </div>

    <!-- Categories Table -->
    <CategoriesTable
      :categories="categories"
      :loading="isLoading"
      @view-category="openCategoryDetails"
      @edit-category="openCategoryEditor"
      @delete-category="openDeleteCategoryDialog"
      @refresh="fetchCategories"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Category Creation Dialog -->
    <Dialog v-model:open="showCategoryCreationDialog">
      <CategoryCreationDialog
        v-if="showCategoryCreationDialog"
        :categories="categories"
        @category-created="handleCategoryCreated"
        @close="showCategoryCreationDialog = false"
      />
    </Dialog>

    <!-- Category Details Dialog -->
    <Dialog v-model:open="showCategoryDetailsDialog">
      <CategoryDetailsDialog
        v-if="showCategoryDetailsDialog"
        :category="selectedCategory"
        @edit-category="openCategoryEditor"
        @close="showCategoryDetailsDialog = false"
      />
    </Dialog>

    <!-- Category Editor Dialog -->
    <Dialog v-model:open="showCategoryEditorDialog">
      <CategoryEditorDialog
        v-if="showCategoryEditorDialog"
        :category="selectedCategory"
        :categories="categories"
        @category-updated="handleCategoryUpdated"
        @close="showCategoryEditorDialog = false"
      />
    </Dialog>

    <!-- Delete Category Dialog -->
    <Dialog v-model:open="showDeleteCategoryDialog">
      <DeleteCategoryDialog
        v-if="showDeleteCategoryDialog"
        :category="selectedCategory"
        @delete="handleCategoryDeleted"
        @close="showDeleteCategoryDialog = false"
      />
    </Dialog>

    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditCategoriesDialog
        v-if="showBulkEditDialog"
        :selectedCategories="selectedBulkCategories"
        :categories="categories"
        @categories-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <CategoryImportSheet
        v-if="showImportSheet"
        :importType="importType"
        @import-complete="handleImportComplete"
        @close="showImportSheet = false"
      />
    </Sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, Database, FileUp, ChevronDown, FileSpreadsheet,
  Table2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Components
import CategoriesTable from '@/components/catalog/categories/CategoriesTable.vue'
import CategoryCreationDialog from '@/components/catalog/categories/CategoryCreationDialog.vue'
import CategoryDetailsDialog from '@/components/catalog/categories/CategoryDetailsDialog.vue'
import CategoryEditorDialog from '@/components/catalog/categories/CategoryEditorDialog.vue'
import DeleteCategoryDialog from '@/components/catalog/categories/DeleteCategoryDialog.vue'
import BulkEditCategoriesDialog from '@/components/catalog/categories/BulkEditCategoriesDialog.vue'
import CategoryImportSheet from '@/components/catalog/categories/CategoryImportSheet.vue'

// Stores
import { useCategoriesStore } from '@/store/modules/catalog/categories'

// Initialize stores
const categoriesStore = useCategoriesStore()
const { toast } = useToast()

// Access store state through computed properties
const categories = computed(() => categoriesStore.getCategories)
const isLoading = computed(() => categoriesStore.getIsLoading)
const error = computed(() => categoriesStore.getError)

// State management
const selectedCategory = ref(null)
const selectedBulkCategories = ref([])
const usingMockData = ref(true)

// UI control
const showCategoryCreationDialog = ref(false)
const showCategoryDetailsDialog = ref(false)
const showCategoryEditorDialog = ref(false)
const showDeleteCategoryDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Toggle between mock data and API data
const toggleDataSource = () => {
  usingMockData.value = !usingMockData.value
  categoriesStore.setUseMockData(usingMockData.value)
  
  // Refresh data
  fetchCategories()
  
  toast({
    title: usingMockData.value ? 'Using Mock Data' : 'Using API Data',
    description: usingMockData.value 
      ? 'Switched to mock data for testing purposes' 
      : 'Connected to live API endpoints',
    variant: 'default'
  })
}

// Fetch data from APIs
const fetchCategories = async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog handlers
const openCategoryCreationDialog = () => {
  showCategoryCreationDialog.value = true
}

const openCategoryDetails = (category) => {
  selectedCategory.value = category
  showCategoryDetailsDialog.value = true
}

const openCategoryEditor = (category) => {
  selectedCategory.value = category
  showCategoryEditorDialog.value = true
}

const openDeleteCategoryDialog = (category) => {
  selectedCategory.value = category
  showDeleteCategoryDialog.value = true
}

const openBulkEditDialog = (categories) => {
  selectedBulkCategories.value = categories
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleCategoryCreated = async (newCategory) => {
  try {
    await categoriesStore.createCategory(newCategory)
    showCategoryCreationDialog.value = false
    
    toast({
      title: 'Category Created',
      description: `${newCategory.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchCategories()
  } catch (error) {
    console.error('Error creating category:', error)
    toast({
      title: 'Error',
      description: 'Failed to create category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCategoryUpdated = async (updatedCategory) => {
  try {
    await categoriesStore.updateCategory(updatedCategory)
    showCategoryEditorDialog.value = false
    
    toast({
      title: 'Category Updated',
      description: `${updatedCategory.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchCategories()
  } catch (error) {
    console.error('Error updating category:', error)
    toast({
      title: 'Error',
      description: 'Failed to update category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCategoryDeleted = async (category) => {
  try {
    await categoriesStore.deleteCategory(category.id)
    showDeleteCategoryDialog.value = false
    
    toast({
      title: 'Category Deleted',
      description: `${category.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (categories, updates) => {
  try {
    await categoriesStore.bulkUpdateCategories(categories.map(c => c.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Categories Updated',
      description: `${categories.length} categories have been updated.`,
      variant: 'success'
    })
    
    await fetchCategories()
  } catch (error) {
    console.error('Error bulk updating categories:', error)
    toast({
      title: 'Error',
      description: 'Failed to update categories. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} categories have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchCategories()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import categories. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchCategories()
})
</script>