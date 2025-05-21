<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Product Bundles</h2>
        <p class="text-muted-foreground">Manage your bundles, component products, and pricing</p>
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
            <DropdownMenuItem @click="openImportSheet('api')">
              <Webhook class="h-4 w-4 mr-2" />
              Import via API
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openBundleWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Bundle
        </Button>
      </div>
    </div>

    <!-- Bundles Table -->
    <BundlesTable
      :bundles="bundles"
      :products="products"
      :categories="categories"
      :loading="isLoading"
      @view-bundle="openBundleDetails"
      @edit-bundle="openBundleEditor"
      @duplicate-bundle="handleDuplicateBundle"
      @delete-bundle="openDeleteBundleDialog"
      @update-status="openUpdateStatusDialog"
      @manage-bundle-items="openBundleItemsManager"
      @refresh="fetchBundles"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Bundle Wizard Dialog -->
    <Sheet v-model:open="showBundleWizard" position="right" size="lg">
      <BundleCreationWizard
        v-if="showBundleWizard"
        :categories="categories"
        :products="products"
        @bundle-created="handleBundleCreated"
        @close="showBundleWizard = false"
      />
    </Sheet>

    <!-- Bundle Details Dialog -->
    <Dialog v-model:open="showBundleDetailsDialog">
      <BundleDetailsDialog
        v-if="showBundleDetailsDialog"
        :bundle="selectedBundle"
        :products="products"
        @edit-bundle="openBundleEditor"
        @close="showBundleDetailsDialog = false"
      />
    </Dialog>

    <!-- Bundle Editor Sheet -->
    <Sheet v-model:open="showBundleEditorSheet" position="right" size="lg">
      <BundleEditorSheet
        v-if="showBundleEditorSheet"
        :bundle="selectedBundle"
        :categories="categories"
        :products="products"
        @bundle-updated="handleBundleUpdated"
        @close="showBundleEditorSheet = false"
      />
    </Sheet>

    <!-- Bundle Items Manager Dialog -->
    <Dialog v-model:open="showBundleItemsManagerDialog" class="sm:max-w-[900px]">
      <BundleItemsManagerDialog
        v-if="showBundleItemsManagerDialog"
        :bundle="selectedBundle"
        :products="products"
        @items-updated="handleBundleItemsUpdated"
        @close="showBundleItemsManagerDialog = false"
      />
    </Dialog>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="showStatusDialog">
      <UpdateBundleStatusDialog
        v-if="showStatusDialog"
        :bundle="selectedBundle"
        @status-updated="handleStatusUpdated"
        @close="showStatusDialog = false"
      />
    </Dialog>

    <Dialog v-model:open="showDeleteBundleDialog">
      <DeleteBundleDialog
        v-if="showDeleteBundleDialog"
        :bundle="selectedBundle"
        @delete="handleBundleDeleted"
        @close="showDeleteBundleDialog = false"
      />
    </Dialog>
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditBundlesDialog
        v-if="showBulkEditDialog"
        :selectedBundles="selectedBulkBundles"
        :categories="categories"
        @bundles-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right" size="md">
      <BundleImportSheet
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
  Table2, Webhook
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
import BundlesTable from '@/components/catalog/bundles/BundlesTable.vue'
import BundleCreationWizard from '@/components/catalog/bundles/BundleCreationWizard.vue'
import BundleDetailsDialog from '@/components/catalog/bundles/BundleDetailsDialog.vue'
import BundleEditorSheet from '@/components/catalog/bundles/BundleEditorSheet.vue'
import BundleItemsManagerDialog from '@/components/catalog/bundles/BundleItemsManagerDialog.vue'
import UpdateBundleStatusDialog from '@/components/catalog/bundles/UpdateBundleStatusDialog.vue'
import DeleteBundleDialog from '@/components/catalog/bundles/DeleteBundleDialog.vue'
import BulkEditBundlesDialog from '@/components/catalog/bundles/BulkEditBundlesDialog.vue'
import BundleImportSheet from '@/components/catalog/bundles/BundleImportSheet.vue'

// Stores
import { useBundlesStore } from '@/store/modules/catalog/bundles'
import { useProductsStore } from '@/store/modules/catalog/products'
import { useCategoriesStore } from '@/store/modules/catalog/categories'

// Initialize stores
const bundlesStore = useBundlesStore()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const { toast } = useToast()

// Access store state through computed properties
const bundles = computed(() => bundlesStore.getBundles)
const products = computed(() => productsStore.getProducts)
const categories = computed(() => categoriesStore.getCategories)
const isLoading = computed(() => bundlesStore.getIsLoading)
const error = computed(() => bundlesStore.getError)

// State management
const selectedBundle = ref(null)
const selectedBulkBundles = ref([])
const usingMockData = ref(true)

// UI control
const showBundleWizard = ref(false)
const showBundleDetailsDialog = ref(false)
const showBundleEditorSheet = ref(false)
const showBundleItemsManagerDialog = ref(false)
const showStatusDialog = ref(false)
const showDeleteBundleDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Toggle between mock data and API data
const toggleDataSource = () => {
  usingMockData.value = !usingMockData.value
  bundlesStore.setUseMockData(usingMockData.value)
  productsStore.setUseMockData(usingMockData.value)
  categoriesStore.setUseMockData(usingMockData.value)
  
  // Refresh data
  fetchBundles()
  fetchProducts()
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
const fetchBundles = async () => {
  try {
    await bundlesStore.fetchBundles()
  } catch (error) {
    console.error('Error fetching bundles:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchProducts = async () => {
  try {
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    toast({
      title: 'Error',
      description: 'Failed to load products',
      variant: 'destructive'
    })
  }
}

const fetchCategories = async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    toast({
      title: 'Error',
      description: 'Failed to load product categories',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openBundleWizard = () => {
  showBundleWizard.value = true
}

const openBundleDetails = (bundle) => {
  selectedBundle.value = bundle
  showBundleDetailsDialog.value = true
}

const openBundleEditor = (bundle) => {
  selectedBundle.value = bundle
  showBundleEditorSheet.value = true
}

const openBundleItemsManager = (bundle) => {
  selectedBundle.value = bundle
  showBundleItemsManagerDialog.value = true
}

const openUpdateStatusDialog = (bundle) => {
  selectedBundle.value = bundle
  showStatusDialog.value = true
}

const openDeleteBundleDialog = (bundle) => {
  selectedBundle.value = bundle
  showDeleteBundleDialog.value = true
}

const openBulkEditDialog = (bundles) => {
  selectedBulkBundles.value = bundles
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleBundleCreated = async (newBundle) => {
  try {
    await bundlesStore.createBundle(newBundle)
    showBundleWizard.value = false
    
    toast({
      title: 'Bundle Created',
      description: `${newBundle.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error creating bundle:', error)
    toast({
      title: 'Error',
      description: 'Failed to create bundle. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBundleUpdated = async (updatedBundle) => {
  try {
    await bundlesStore.updateBundle(updatedBundle)
    showBundleEditorSheet.value = false
    
    toast({
      title: 'Bundle Updated',
      description: `${updatedBundle.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error updating bundle:', error)
    toast({
      title: 'Error',
      description: 'Failed to update bundle. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBundleItemsUpdated = async (bundleId, items) => {
  try {
    await bundlesStore.updateBundleItems(bundleId, items)
    showBundleItemsManagerDialog.value = false
    
    toast({
      title: 'Bundle Items Updated',
      description: `Bundle components have been updated successfully.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error updating bundle items:', error)
    toast({
      title: 'Error',
      description: 'Failed to update bundle components. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStatusUpdated = async ({ bundle, status, reason }) => {
  try {
    await bundlesStore.updateBundleStatus(bundle.id, status, reason)
    showStatusDialog.value = false
    
    toast({
      title: 'Status Updated',
      description: `Bundle status changed to ${status}.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error updating bundle status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update bundle status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBundleDeleted = async (bundle) => {
  try {
    await bundlesStore.deleteBundle(bundle.id)
    showDeleteBundleDialog.value = false
    
    toast({
      title: 'Bundle Deleted',
      description: `${bundle.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error deleting bundle:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete bundle. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicateBundle = async (bundle) => {
  try {
    await bundlesStore.duplicateBundle(bundle.id)
    
    toast({
      title: 'Bundle Duplicated',
      description: `A copy of ${bundle.name} has been created.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error duplicating bundle:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate bundle. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (bundles, updates) => {
  try {
    await bundlesStore.bulkUpdateBundles(bundles.map(b => b.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Bundles Updated',
      description: `${bundles.length} bundles have been updated.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } catch (error) {
    console.error('Error bulk updating bundles:', error)
    toast({
      title: 'Error',
      description: 'Failed to update bundles. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} bundles have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchBundles()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import bundles. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchBundles()
  fetchProducts()
  fetchCategories()
})
</script>