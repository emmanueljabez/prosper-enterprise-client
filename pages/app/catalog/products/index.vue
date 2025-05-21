<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Products</h2>
        <p class="text-muted-foreground">Manage your product catalog, variants, and inventory</p>
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
        <Button @click="openProductWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>
    </div>

    <!-- Products Table -->
    <ProductsTable
      :products="products"
      :categories="categories"
      :loading="isLoading"
      @view-product="openProductDetails"
      @edit-product="openProductEditor"
      @duplicate-product="handleDuplicateProduct"
      @delete-product="openDeleteProductDialog"
      @update-status="openUpdateStatusDialog"
      @manage-variants="openVariantManager"
      @refresh="fetchProducts"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Product Wizard Dialog -->
    <Sheet v-model:open="showProductWizard" position="right" size="lg">
      <ProductCreationWizard
        v-if="showProductWizard"
        :categories="categories"
        :attributes="attributes"
        @product-created="handleProductCreated"
        @close="showProductWizard = false"
      />
    </Sheet>

    <!-- Product Details Dialog -->
    <Dialog v-model:open="showProductDetailsDialog">
      <ProductDetailsDialog
        v-if="showProductDetailsDialog"
        :product="selectedProduct"
        @edit-product="openProductEditor"
        @close="showProductDetailsDialog = false"
      />
    </Dialog>

    <!-- Product Editor Sheet -->
    <Sheet v-model:open="showProductEditorSheet" position="right" size="lg">
      <ProductEditorSheet
        v-if="showProductEditorSheet"
        :product="selectedProduct"
        :categories="categories"
        :attributes="attributes"
        @product-updated="handleProductUpdated"
        @close="showProductEditorSheet = false"
      />
    </Sheet>

    <!-- Variant Manager Dialog -->
    <Dialog v-model:open="showVariantManagerDialog" class="sm:max-w-[900px]">
      <VariantManagerDialog
        v-if="showVariantManagerDialog"
        :product="selectedProduct"
        :attributes="attributes"
        @variants-updated="handleVariantsUpdated"
        @close="showVariantManagerDialog = false"
      />
    </Dialog>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="showStatusDialog">
      <UpdateProductStatusDialog
        v-if="showStatusDialog"
        :product="selectedProduct"
        @status-updated="handleStatusUpdated"
        @close="showStatusDialog = false"
      />
    </Dialog>

    <Dialog v-model:open="showDeleteProductDialog">
  <DeleteProductDialog
    v-if="showDeleteProductDialog"
    :product="selectedProduct"
    @delete="handleProductDeleted"
    @close="showDeleteProductDialog = false"
  />
</Dialog>

    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditDialog
        v-if="showBulkEditDialog"
        :selectedProducts="selectedBulkProducts"
        :categories="categories"
        @products-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <ProductImportSheet
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
import ProductsTable from '@/components/catalog/products/ProductsTable.vue'
import ProductCreationWizard from '@/components/catalog/products/ProductCreationWizard.vue'
import ProductDetailsDialog from '@/components/catalog/products/ProductDetailsDialog.vue'
import ProductEditorSheet from '@/components/catalog/products/ProductEditorSheet.vue'
import VariantManagerDialog from '@/components/catalog/products/VariantManagerDialog.vue'
import UpdateProductStatusDialog from '@/components/catalog/products/UpdateProductStatusDialog.vue'
import DeleteProductDialog from '@/components/catalog/products/DeleteProductDialog.vue'
import BulkEditDialog from '@/components/catalog/products/BulkEditDialog.vue'
import ProductImportSheet from '@/components/catalog/products/ProductImportSheet.vue'

// Stores
import { useProductsStore } from '@/store/modules/catalog/products'
import { useCategoriesStore } from '@/store/modules/catalog/categories'
import { useAttributesStore } from '@/store/modules/catalog/attributes'

// Initialize stores
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const attributesStore = useAttributesStore()
const { toast } = useToast()

// Access store state through computed properties
const products = computed(() => productsStore.getProducts)
const categories = computed(() => categoriesStore.getCategories)
const attributes = computed(() => attributesStore.getAttributes)
const isLoading = computed(() => productsStore.getIsLoading)
const error = computed(() => productsStore.getError)

// State management
const selectedProduct = ref(null)
const selectedBulkProducts = ref([])
const usingMockData = ref(true)

// UI control
const showProductWizard = ref(false)
const showProductDetailsDialog = ref(false)
const showProductEditorSheet = ref(false)
const showVariantManagerDialog = ref(false)
const showStatusDialog = ref(false)
const showDeleteProductDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Toggle between mock data and API data
const toggleDataSource = () => {
  usingMockData.value = !usingMockData.value
  productsStore.setUseMockData(usingMockData.value)
  categoriesStore.setUseMockData(usingMockData.value)
  attributesStore.setUseMockData(usingMockData.value)
  
  // Refresh data
  fetchProducts()
  fetchCategories()
  fetchAttributes()
  
  toast({
    title: usingMockData.value ? 'Using Mock Data' : 'Using API Data',
    description: usingMockData.value 
      ? 'Switched to mock data for testing purposes' 
      : 'Connected to live API endpoints',
    variant: 'default'
  })
}

// Fetch data from APIs
const fetchProducts = async () => {
  try {
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
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

const fetchAttributes = async () => {
  try {
    await attributesStore.fetchAttributes()
  } catch (error) {
    console.error('Error fetching attributes:', error)
    toast({
      title: 'Error',
      description: 'Failed to load product attributes',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openProductWizard = () => {
  showProductWizard.value = true
}

const openProductDetails = (product) => {
  selectedProduct.value = product
  showProductDetailsDialog.value = true
}

const openProductEditor = (product) => {
  selectedProduct.value = product
  showProductEditorSheet.value = true
}

const openVariantManager = (product) => {
  selectedProduct.value = product
  showVariantManagerDialog.value = true
}

const openUpdateStatusDialog = (product) => {
  selectedProduct.value = product
  showStatusDialog.value = true
}

const openDeleteProductDialog = (product) => {
  selectedProduct.value = product
  showDeleteProductDialog.value = true
}

const openBulkEditDialog = (products) => {
  selectedBulkProducts.value = products
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleProductCreated = async (newProduct) => {
  try {
    await productsStore.createProduct(newProduct)
    showProductWizard.value = false
    
    toast({
      title: 'Product Created',
      description: `${newProduct.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error creating product:', error)
    toast({
      title: 'Error',
      description: 'Failed to create product. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleProductUpdated = async (updatedProduct) => {
  try {
    await productsStore.updateProduct(updatedProduct)
    showProductEditorSheet.value = false
    
    toast({
      title: 'Product Updated',
      description: `${updatedProduct.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error updating product:', error)
    toast({
      title: 'Error',
      description: 'Failed to update product. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleVariantsUpdated = async (productId, variants) => {
  try {
    await productsStore.updateProductVariants(productId, variants)
    showVariantManagerDialog.value = false
    
    toast({
      title: 'Variants Updated',
      description: `Product variants have been updated successfully.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error updating variants:', error)
    toast({
      title: 'Error',
      description: 'Failed to update product variants. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStatusUpdated = async ({ product, status, reason }) => {
  try {
    await productsStore.updateProductStatus(product.id, status, reason)
    showStatusDialog.value = false
    
    toast({
      title: 'Status Updated',
      description: `Product status changed to ${status}.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error updating product status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update product status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleProductDeleted = async (product) => {
  try {
    await productsStore.deleteProduct(product.id)
    showDeleteProductDialog.value = false
    
    toast({
      title: 'Product Deleted',
      description: `${product.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete product. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicateProduct = async (product) => {
  try {
    await productsStore.duplicateProduct(product.id)
    
    toast({
      title: 'Product Duplicated',
      description: `A copy of ${product.name} has been created.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error duplicating product:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate product. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (products, updates) => {
  try {
    await productsStore.bulkUpdateProducts(products.map(p => p.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Products Updated',
      description: `${products.length} products have been updated.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } catch (error) {
    console.error('Error bulk updating products:', error)
    toast({
      title: 'Error',
      description: 'Failed to update products. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} products have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchProducts()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import products. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchAttributes()
})
</script>