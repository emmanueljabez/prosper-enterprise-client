<template>
  <div class="p-6 space-y-6">
    <!-- Breadcrumb Navigation -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            @click="() => navigateTo('/app')" 
            class="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
          >
            <HomeIcon class="h-4 w-4" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon class="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink 
            @click="() => navigateTo('/app/settings')" 
            class="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
          >
            <SettingsIcon class="h-4 w-4" />
            Settings
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon class="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage class="flex items-center gap-1">
            <FolderIcon class="h-4 w-4" />
            Item Categories
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Item Categories</h2>
        <p class="text-muted-foreground">Organize your inventory with hierarchical categories and subcategories</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="refreshCategories" :disabled="isLoading">
          <RefreshCwIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
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
            <DropdownMenuItem @click="openImportSheet('json')">
              <FileTextIcon class="h-4 w-4 mr-2" />
              Import JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportCategories('csv')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportCategories('excel')">
              <Table2 class="h-4 w-4 mr-2" />
              Export Excel
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportCategories('json')">
              <FileTextIcon class="h-4 w-4 mr-2" />
              Export JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openCategoryWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>
    </div>

    <!-- View Mode Selector -->
    <div class="flex items-center justify-between border-b">
      <div class="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          @click="switchToTableView"
          :class="{ 'bg-muted': viewMode === 'table' }"
        >
          <TableIcon class="h-4 w-4 mr-2" />
          Table View
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          @click="switchToHierarchyView"
          :class="{ 'bg-muted': viewMode === 'hierarchy' }"
        >
          <NetworkIcon class="h-4 w-4 mr-2" />
          Category Hierarchy
        </Button>
      </div>
      <div v-if="viewMode === 'table'" class="text-sm text-muted-foreground">
        {{ categories.length }} categories • {{ rootCategories.length }} root categories
      </div>
      <div v-else class="text-sm text-muted-foreground">
        {{ rootCategories.length }} root categories • {{ categories.length - rootCategories.length }} subcategories
      </div>
    </div>

    <!-- Table View -->
    <ItemCategoriesTable
      v-if="viewMode === 'table'"
      :categories="categories"
      :root-categories="rootCategories"
      :loading="isLoading"
      :pagination="pagination"
      @view-category="openCategoryDetails"
      @edit-category="openCategoryEditor"
      @duplicate-category="handleDuplicateCategory"
      @delete-category="openDeleteCategoryDialog"
      @activate-category="handleActivateCategory"
      @deactivate-category="handleDeactivateCategory"
      @view-hierarchy="switchToHierarchyView"
      @view-subcategories="openSubcategoriesDialog"
      @add-subcategory="openSubcategoryWizard"
      @refresh="refreshCategories"
      @bulk-edit="openBulkEditDialog"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- Hierarchy View -->
    <CategoryHierarchyViewer
      v-else-if="viewMode === 'hierarchy'"
      :categories="categories"
      :hierarchy="hierarchy"
      :loading="isLoading"
      :error="error"
      @view-category="openCategoryDetails"
      @edit-category="openCategoryEditor"
      @duplicate-category="handleDuplicateCategory"
      @delete-category="openDeleteCategoryDialog"
      @create-category="openCategoryWizard"
      @refresh="refreshCategories"
      @load-subcategories="handleLoadSubcategories"
    />
    
    <!-- Category Creation Wizard Dialog -->
    <Sheet v-model:open="showCategoryWizard" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>
            {{ selectedParentCategory ? 'Create Subcategory' : 'Create Item Category' }}
          </SheetTitle>
          <SheetDescription>
            {{ selectedParentCategory 
              ? `Create a new subcategory under ${selectedParentCategory.name}` 
              : 'Create a new category with hierarchy and attributes' 
            }}
          </SheetDescription>
        </SheetHeader>
        <div class="flex-1 min-h-0">
          <CategoryCreationWizard
            v-if="showCategoryWizard"
            :open="showCategoryWizard"
            :mode="selectedParentCategory ? 'subcategory' : 'auto'"
            :parent-category="selectedParentCategory"
            @update:open="showCategoryWizard = $event"
            @created="handleCategoryCreated"
          />
        </div>
      </SheetContent>
    </Sheet>
    
    <!-- Category Details Dialog -->
    <CategoryDetailsDialog
      :open="showCategoryDetailsDialog"
      :category="selectedCategory"
      :category-tree="selectedCategoryTree"
      @update:open="showCategoryDetailsDialog = $event"
      @edit="openCategoryEditor"
    />    
    
    <!-- Category Editor Sheet -->
    <Sheet v-model:open="showCategoryEditorSheet" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Edit Item Category</SheetTitle>
          <SheetDescription>
            Update category information and settings
          </SheetDescription>
        </SheetHeader>        
        <div class="flex-1 min-h-0">
          <CategoryEditorSheet
            :open="showCategoryEditorSheet"
            :category="selectedCategory"
            :parent-categories="categories"
            @update:open="showCategoryEditorSheet = $event"
            @updated="handleCategoryUpdated"
          />
        </div>
      </SheetContent>
    </Sheet>

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
        :open="showBulkEditDialog"
        :selected-categories="selectedBulkCategories"
        :parent-categories="categories"
        @update:open="showBulkEditDialog = $event"
        @categories-updated="handleBulkUpdate"
      />
    </Dialog>    
    
    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <SheetContent class="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Import Item Categories</SheetTitle>
          <SheetDescription>
            Import categories from CSV, Excel, or template files
          </SheetDescription>
        </SheetHeader>
        <div class="flex-1 min-h-0">
          <CategoryImportSheet
            v-if="showImportSheet"
            :import-type="importType"
            @import-complete="handleImportComplete"
            @close="showImportSheet = false"
          />
        </div>
      </SheetContent>
    </Sheet>

    <!-- Category Templates Dialog -->
    <Dialog v-model:open="showTemplatesDialog" class="sm:max-w-[700px]">
      <CategoryTemplatesDialog
        v-if="showTemplatesDialog"
        @template-applied="handleTemplateApplied"
        @close="showTemplatesDialog = false"
      />
    </Dialog>

    <!-- Category Statistics Dialog -->
    <Dialog v-model:open="showStatisticsDialog" class="sm:max-w-[600px]">
      <CategoryStatisticsDialog
        v-if="showStatisticsDialog"
        :statistics="statistics"
        @close="showStatisticsDialog = false"
      />
    </Dialog>
    
    <!-- Subcategories Dialog -->
    <SubcategoriesDialog
      :open="showSubcategoriesDialog"
      :parent-category="selectedCategoryForSubcategories"
      :subcategories="subcategoriesForDialog"
      :all-categories="categories"
      :loading="isLoadingSubcategories"
      :error="subcategoriesError"
      @update:open="showSubcategoriesDialog = $event"
      @view-category="openCategoryDetails"
      @edit-category="openCategoryEditor"
      @duplicate-category="handleDuplicateCategory"
      @delete-category="openDeleteCategoryDialog"
      @create-subcategory="openCategoryWizard"
      @load-subcategories="handleLoadSubcategories"
      @refresh="refreshSubcategories"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo } from 'nuxt/app'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet, Table2, FileTextIcon,
  DownloadIcon, RefreshCwIcon, HomeIcon, SettingsIcon, ChevronRightIcon,
  FolderIcon, TableIcon, NetworkIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Components
import ItemCategoriesTable from '@/components/inventory/categories/ItemCategoriesTable.vue'
import CategoryHierarchyViewer from '@/components/inventory/categories/CategoryHierarchyViewer.vue'
import CategoryCreationWizard from '@/components/inventory/categories/CategoryCreationWizard.vue'
import CategoryDetailsDialog from '@/components/inventory/categories/CategoryDetailsDialog.vue'
import CategoryEditorSheet from '@/components/inventory/categories/CategoryEditorSheet.vue'
import DeleteCategoryDialog from '@/components/inventory/categories/DeleteCategoryDialog.vue'
import BulkEditCategoriesDialog from '@/components/inventory/categories/BulkEditCategoriesDialog.vue'
import CategoryImportSheet from '@/components/inventory/categories/CategoryImportSheet.vue'
import CategoryTemplatesDialog from '@/components/inventory/categories/CategoryTemplatesDialog.vue'
import CategoryStatisticsDialog from '@/components/inventory/categories/CategoryStatisticsDialog.vue'
import SubcategoriesDialog from '@/components/inventory/categories/SubcategoriesDialog.vue'

// Stores
import { useItemCategoriesStore } from '@/store/modules/inventory/item-categories'

// Initialize stores
const categoriesStore = useItemCategoriesStore()
const { toast } = useToast()

// Access store state through computed properties
const categories = computed(() => categoriesStore.getCategories)
const rootCategories = computed(() => categoriesStore.getTopLevelCategories)
const hierarchy = computed(() => categoriesStore.getHierarchy)
const statistics = computed(() => categoriesStore.getStatistics)
const isLoading = computed(() => categoriesStore.getIsLoading)
const error = computed(() => categoriesStore.getError)
const pagination = computed(() => categoriesStore.getPagination)

// State management
const selectedCategory = ref(null)
const selectedCategoryTree = ref(null)
const selectedBulkCategories = ref([])

// UI control
const viewMode = ref('table')
const showCategoryWizard = ref(false)
const showCategoryDetailsDialog = ref(false)
const showCategoryEditorSheet = ref(false)
const showDeleteCategoryDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const showTemplatesDialog = ref(false)
const showStatisticsDialog = ref(false)
const showSubcategoriesDialog = ref(false)
const importType = ref('csv')
const selectedParentCategory = ref(null)

// Subcategories dialog state
const selectedCategoryForSubcategories = ref(null)
const subcategoriesForDialog = ref([])
const isLoadingSubcategories = ref(false)
const subcategoriesError = ref(null)

// Fetch data from APIs
const refreshCategories = async () => {
  try {
    if (viewMode.value === 'hierarchy') {
      await categoriesStore.refreshCategories()
    } else {
      await categoriesStore.fetchPaginatedCategories({ 
        page: pagination.value.page, 
        size: pagination.value.size 
      })
    }
  } catch (error) {
    console.error('Error refreshing categories:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Pagination handlers
const handlePageChange = async (newPage) => {
  try {
    await categoriesStore.fetchPaginatedCategories({ 
      page: newPage, 
      size: pagination.value.size 
    })
  } catch (error) {
    console.error('Error changing page:', error)
    toast({
      title: 'Error',
      description: 'Failed to load page. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleSizeChange = async (newSize) => {
  try {
    await categoriesStore.fetchPaginatedCategories({ 
      page: 0, 
      size: newSize 
    })
  } catch (error) {
    console.error('Error changing page size:', error)
    toast({
      title: 'Error',
      description: 'Failed to change page size. Please try again.',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openCategoryWizard = () => {
  showCategoryWizard.value = true
}

const openSubcategoryWizard = (parentCategory) => {
  selectedParentCategory.value = parentCategory
  showCategoryWizard.value = true
}

const openCategoryDetails = async (category) => {
  try {
    const updatedCategory = await categoriesStore.fetchCategoryById(category.id)
    selectedCategory.value = updatedCategory

    const tree = await categoriesStore.fetchCategoryTree(category.id)
    selectedCategoryTree.value = tree
    
    showCategoryDetailsDialog.value = true
  } catch (error) {
    console.error('Error fetching category details:', error)
    selectedCategory.value = category
    selectedCategoryTree.value = null
    showCategoryDetailsDialog.value = true
  }
}

const openCategoryEditor = (category) => {
  selectedCategory.value = category
  showCategoryEditorSheet.value = true
}

const switchToTableView = async () => {
  viewMode.value = 'table'
  // Refresh data when switching to table view
  await refreshCategories()
}

const switchToHierarchyView = async (rootCategory = null) => {
  viewMode.value = 'hierarchy'
  
  // Always refresh data when switching to hierarchy view
  await refreshCategories()

  try {
    await Promise.all([
      categoriesStore.fetchCategoryHierarchy(),
      categoriesStore.fetchTopLevelCategories()
    ])

    if (rootCategory) {
      const tree = await categoriesStore.fetchCategoryTree(rootCategory.id)
      selectedCategoryTree.value = tree
      
      toast({
        title: 'Info',
        description: 'Switched to hierarchy view to show category tree.',
        variant: 'default'
      })
    }
  } catch (error) {
    console.error('Error fetching hierarchy data:', error)
    toast({
      title: 'Error',
      description: 'Failed to load hierarchy view. Please try again.',
      variant: 'destructive'
    })
  }
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

const openTemplatesDialog = () => {
  showTemplatesDialog.value = true
}

const openStatisticsDialog = async () => {
  try {
    await categoriesStore.fetchStatistics()
    showStatisticsDialog.value = true
  } catch (error) {
    console.error('Error fetching statistics:', error)
    toast({
      title: 'Error',
      description: 'Failed to load statistics. Please try again.',
      variant: 'destructive'
    })
  }
}

const openSubcategoriesDialog = async (parentCategory) => {
  selectedCategoryForSubcategories.value = parentCategory
  subcategoriesError.value = null
  subcategoriesForDialog.value = []
  showSubcategoriesDialog.value = true
  
  // Load subcategories for the selected parent
  await loadSubcategoriesForDialog(parentCategory.id)
}

const loadSubcategoriesForDialog = async (parentId) => {
  try {
    isLoadingSubcategories.value = true
    subcategoriesError.value = null
    
    // Get subcategories from store using the getSubcategories getter
    const subcats = categoriesStore.getSubcategories(parentId)
    
    if (subcats.length === 0) {
      // Try to fetch from API if not in store
      await categoriesStore.fetchSubcategories(parentId)
      subcategoriesForDialog.value = categoriesStore.getSubcategories(parentId)
    } else {
      subcategoriesForDialog.value = subcats
    }
    
    isLoadingSubcategories.value = false
  } catch (error) {
    console.error('Error loading subcategories for dialog:', error)
    subcategoriesError.value = 'Failed to load subcategories. Please try again.'
    isLoadingSubcategories.value = false
  }
}

const refreshSubcategories = async () => {
  if (selectedCategoryForSubcategories.value) {
    await loadSubcategoriesForDialog(selectedCategoryForSubcategories.value.id)
  }
}

// Dynamic loading handler
const handleLoadSubcategories = async (parentId) => {
  try {
    console.log(`Loading subcategories for parent ID: ${parentId}`)
    
    // Call the store action to fetch subcategories
    await categoriesStore.fetchSubcategories(parentId)
    
    // Also refresh the hierarchy to update the tree structure
    if (viewMode.value === 'hierarchy') {
      await categoriesStore.fetchCategoryHierarchy()
    }
    
    console.log(`Successfully loaded subcategories for parent ${parentId}`)
    
    toast({
      title: 'Subcategories Loaded',
      description: `Loaded subcategories successfully`,
      variant: 'default'
    })
  } catch (error) {
    console.error('Error loading subcategories:', error)
    toast({
      title: 'Error',
      description: 'Failed to load subcategories. Please try again.',
      variant: 'destructive'
    })
  }
}

// CRUD operation handlers
const handleCategoryCreated = async (newCategory) => {
  try {
    showCategoryWizard.value = false
    selectedParentCategory.value = null
    
    toast({
      title: 'Category Created',
      description: `${newCategory.name} has been created successfully.`,
      variant: 'success'
    })
    
    await refreshCategories()
  } catch (error) {
    console.error('Error creating category:', error)
    toast({
      title: 'Error',
      description: 'Failed to create category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCategoryUpdated = async (updateData) => {
  try {
    await categoriesStore.updateCategory(selectedCategory.value.id, updateData)
    showCategoryEditorSheet.value = false
    
    toast({
      title: 'Category Updated',
      description: `${updateData.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await refreshCategories()
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
    
    await refreshCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicateCategory = async (category) => {
  try {
    const newName = `${category.name} (Copy)`
    
    await categoriesStore.cloneCategory(category.id, { name: newName })
    
    toast({
      title: 'Category Duplicated',
      description: `A copy of ${category.name} has been created.`,
      variant: 'success'
    })
    
    await refreshCategories()
  } catch (error) {
    console.error('Error duplicating category:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleActivateCategory = async (category) => {
  try {
    await categoriesStore.activateCategory(category.id)
    
    toast({
      title: 'Category Activated',
      description: `${category.name} has been activated.`,
      variant: 'success'
    })
    
    await refreshCategories()
  } catch (error) {
    console.error('Error activating category:', error)
    toast({
      title: 'Error',
      description: 'Failed to activate category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDeactivateCategory = async (category) => {
  try {
    await categoriesStore.deactivateCategory(category.id)
    
    toast({
      title: 'Category Deactivated',
      description: `${category.name} has been deactivated.`,
      variant: 'success'
    })
    
    await refreshCategories()
  } catch (error) {
    console.error('Error deactivating category:', error)
    toast({
      title: 'Error',
      description: 'Failed to deactivate category. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (categories, updates) => {
  try {
    const updateRequests = categories.map(category => ({
      id: category.id,
      category: updates
    }))
    
    await categoriesStore.bulkUpdateCategories(updateRequests)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Categories Updated',
      description: `${categories.length} categories have been updated.`,
      variant: 'success'
    })
    
    await refreshCategories()
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
      description: `${result.imported} categories imported, ${result.skipped} skipped.`,
      variant: 'success'
    })
    
    await refreshCategories()
  } else {
    toast({
      title: 'Import Failed',
      description: result.errors?.join(', ') || 'Failed to import categories. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTemplateApplied = async (template) => {
  try {
    await categoriesStore.applyTemplate(template.name)
    showTemplatesDialog.value = false
    
    toast({
      title: 'Template Applied',
      description: `${template.name} template has been applied successfully.`,
      variant: 'success'
    })
    
    await refreshCategories()
  } catch (error) {
    console.error('Error applying template:', error)
    toast({
      title: 'Error',
      description: 'Failed to apply template. Please try again.',
      variant: 'destructive'
    })
  }
}

// Export functionality
const exportCategories = async (format) => {
  try {
    const blob = await categoriesStore.exportCategories(format)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `item-categories-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Export Complete',
      description: `Categories exported in ${format.toUpperCase()} format.`,
      variant: 'success'
    })
  } catch (error) {
    console.error('Error exporting categories:', error)
    toast({
      title: 'Error',
      description: 'Failed to export categories. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(async () => {
  // Load initial data - use store's refresh method to get all necessary data
  try {
    await Promise.all([
      categoriesStore.fetchPaginatedCategories({ 
        page: 0, 
        size: 10 
      }),
      categoriesStore.refreshCategories()
    ])
  } catch (error) {
    console.error('Error loading initial data:', error)
    toast({
      title: 'Error',
      description: 'Failed to load categories. Please refresh the page.',
      variant: 'destructive'
    })
  }
})

// Clear selected parent category when wizard is closed
watch(() => showCategoryWizard.value, (isOpen) => {
  if (!isOpen) {
    selectedParentCategory.value = null
  }
})
</script>
