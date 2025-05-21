<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Product Variants</h2>
        <p class="text-muted-foreground">Manage product variants, attributes, and inventory levels</p>
      </div>
      <div class="flex items-center space-x-2">
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
        <Button @click="openVariantCreationDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Variant
        </Button>
        <Button variant="outline" @click="openVariantAttributesManager">
          <Settings class="h-4 w-4 mr-2" />
          Manage Attributes
        </Button>
      </div>
    </div>

    <!-- Variants Table -->
    <VariantsTable
      :products="products"
      :variants="flattenedVariants"
      :attributes="variantAttributes"
      :loading="isLoading"
      @view-variant="openVariantDetails"
      @edit-variant="openVariantEditor"
      @delete-variant="openDeleteVariantDialog"
      @update-stock="updateVariantStock"
      @refresh="fetchData"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Variant Creation Dialog -->
    <Dialog v-model:open="showVariantCreationDialog">
      <VariantCreationDialog
        v-if="showVariantCreationDialog"
        :products="products"
        :attributes="variantAttributes"
        @variant-created="handleVariantCreated"
        @close="showVariantCreationDialog = false"
      />
    </Dialog>

    <!-- Variant Details Dialog -->
    <Dialog v-model:open="showVariantDetailsDialog">
      <VariantDetailsDialog
        v-if="showVariantDetailsDialog"
        :variant="selectedVariant"
        :product="selectedVariantProduct"
        :attributes="attributes"
        @edit-variant="openVariantEditor"
        @close="showVariantDetailsDialog = false"
      />
    </Dialog>

    <!-- Variant Editor Dialog -->
    <Sheet v-model:open="showVariantEditorSheet" position="right">
      <VariantEditorSheet
        v-if="showVariantEditorSheet"
        :variant="selectedVariant"
        :product="selectedVariantProduct"
        :attributes="attributes"
        @variant-updated="handleVariantUpdated"
        @close="showVariantEditorSheet = false"
      />
    </Sheet>

    <!-- Delete Variant Dialog -->
    <Dialog v-model:open="showDeleteVariantDialog">
      <DeleteVariantDialog
        v-if="showDeleteVariantDialog"
        :variant="selectedVariant"
        :product="selectedVariantProduct"
        @delete="handleVariantDeleted"
        @close="showDeleteVariantDialog = false"
      />
    </Dialog>

    <!-- Update Stock Dialog -->
    <Dialog v-model:open="showUpdateStockDialog">
      <UpdateStockDialog
        v-if="showUpdateStockDialog"
        :variant="selectedVariant"
        :product="selectedVariantProduct"
        @stock-updated="handleStockUpdated"
        @close="showUpdateStockDialog = false"
      />
    </Dialog>
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditVariantsDialog
        v-if="showBulkEditDialog"
        :selectedVariants="selectedBulkVariants"
        :attributes="variantAttributes"
        @variants-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <VariantImportSheet
        v-if="showImportSheet"
        :importType="importType"
        :products="products"
        :attributes="variantAttributes"
        @import-complete="handleImportComplete"
        @close="showImportSheet = false"
      />
    </Sheet>

    <!-- Variant Attributes Manager -->
    <Sheet v-model:open="showAttributesManager" position="right" size="lg">
      <VariantAttributesManager
        v-if="showAttributesManager"
        :attributes="attributes"
        :variantAttributes="variantAttributes"
        @attributes-updated="handleAttributesUpdated"
        @close="showAttributesManager = false"
      />
    </Sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, Database, FileUp, ChevronDown, FileSpreadsheet,
  Table2, Settings
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
import VariantsTable from '@/components/catalog/variants/VariantsTable.vue'
import VariantCreationDialog from '@/components/catalog/variants/VariantCreationDialog.vue'
import VariantDetailsDialog from '@/components/catalog/variants/VariantDetailsDialog.vue'
import VariantEditorSheet from '@/components/catalog/variants/VariantEditorSheet.vue'
import DeleteVariantDialog from '@/components/catalog/variants/DeleteVariantDialog.vue'
import UpdateStockDialog from '@/components/catalog/variants/UpdateStockDialog.vue'
import BulkEditVariantsDialog from '@/components/catalog/variants/BulkEditVariantsDialog.vue'
import VariantImportSheet from '@/components/catalog/variants/VariantImportSheet.vue'
import VariantAttributesManager from '@/components/catalog/variants/VariantAttributesManager.vue'

// Stores
import { useProductsStore } from '@/store/modules/catalog/products'
import { useAttributesStore } from '@/store/modules/catalog/attributes'

// Initialize stores
const productsStore = useProductsStore()
const attributesStore = useAttributesStore()
const { toast } = useToast()

// Access store state through computed properties
const products = computed(() => productsStore.getProducts)
const attributes = computed(() => attributesStore.getAttributes)
const variantMatrices = computed(() => attributesStore.getVariantMatricesArray);
const isLoading = computed(() => 
  productsStore.getIsLoading || attributesStore.getIsLoading
)
const error = computed(() => 
  productsStore.getError || attributesStore.getError
)

// Get only variant attributes
const variantAttributes = computed(() => 
  attributesStore.getVariantAttributes
)

const flattenedVariants = computed(() => {
  console.log("Computing flattenedVariants...");
  console.log("variantMatrices.value:", variantMatrices.value);
  
  const variants = [];
  
  // Check if variantMatrices.value is an object and convert to array if needed
  const matrices = typeof variantMatrices.value === 'object' && !Array.isArray(variantMatrices.value)
    ? Object.values(variantMatrices.value)
    : Array.isArray(variantMatrices.value) ? variantMatrices.value : [];
  
  console.log("Matrices after conversion:", matrices);
  
  // Now we can safely iterate
  matrices.forEach(matrix => {
    const product = products.value.find(p => p.id === matrix.productId);
    
    if (product) {
      if (Array.isArray(matrix.variants)) {
        matrix.variants.forEach(variant => {
          variants.push({
            ...variant,
            productId: product.id,
            productName: product.name,
            matrixId: matrix.id || matrix.productId // Fallback if id is missing
          });
        });
      }
    } else {
      console.log(`Product not found for matrix with productId: ${matrix.productId}`);
    }
  });
  
  console.log("Total variants found:", variants.length);
  return variants;
});

// State management
const selectedVariant = ref(null)
const selectedVariantProduct = ref(null)
const selectedBulkVariants = ref([])
const usingMockData = ref(true)

// UI control
const showVariantCreationDialog = ref(false)
const showVariantDetailsDialog = ref(false)
const showVariantEditorSheet = ref(false)
const showDeleteVariantDialog = ref(false)
const showUpdateStockDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const showAttributesManager = ref(false)
const importType = ref('csv')

// Toggle between mock data and API data
const toggleDataSource = () => {
  usingMockData.value = !usingMockData.value
  productsStore.setUseMockData(usingMockData.value)
  attributesStore.setUseMockData(usingMockData.value)
  
  // Refresh data
  fetchData()
  
  toast({
    title: usingMockData.value ? 'Using Mock Data' : 'Using API Data',
    description: usingMockData.value 
      ? 'Switched to mock data for testing purposes' 
      : 'Connected to live API endpoints',
    variant: 'default'
  })
}

// Fetch data from APIs
const fetchData = async () => {
  try {
    await productsStore.fetchProducts()
    await attributesStore.fetchAttributes()
  } catch (error) {
    console.error('Error fetching data:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog handlers
const openVariantCreationDialog = () => {
  showVariantCreationDialog.value = true
}

const openVariantDetails = (variant) => {
  selectedVariant.value = variant
  selectedVariantProduct.value = products.value.find(p => p.id === variant.productId)
  showVariantDetailsDialog.value = true
}

const openVariantEditor = (variant) => {
  selectedVariant.value = variant
  selectedVariantProduct.value = products.value.find(p => p.id === variant.productId)
  showVariantEditorSheet.value = true
}

const openDeleteVariantDialog = (variant) => {
  selectedVariant.value = variant
  selectedVariantProduct.value = products.value.find(p => p.id === variant.productId)
  showDeleteVariantDialog.value = true
}

const updateVariantStock = (variant) => {
  selectedVariant.value = variant
  selectedVariantProduct.value = products.value.find(p => p.id === variant.productId)
  showUpdateStockDialog.value = true
}

const openBulkEditDialog = (variants) => {
  selectedBulkVariants.value = variants
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

const openVariantAttributesManager = () => {
  showAttributesManager.value = true
}

// CRUD operation handlers
const handleVariantCreated = async (productId, newVariant) => {
  try {
    // Find the variant matrix for this product
    const matrixIndex = variantMatrices.value.findIndex(m => m.productId === productId)
    
    if (matrixIndex !== -1) {
      // Add variant to existing matrix
      const updatedMatrix = {
        ...variantMatrices.value[matrixIndex],
        variants: [...variantMatrices.value[matrixIndex].variants, newVariant]
      }
      
      await attributesStore.updateVariantMatrix(updatedMatrix.id, updatedMatrix)
    } else {
      // Create a new variant matrix
      const variantAttributeIds = Object.keys(newVariant.attributeValues)
      await attributesStore.createVariantMatrix(productId, variantAttributeIds)
      
      // Then update to add the variant
      const matrix = variantMatrices.value.find(m => m.productId === productId)
      if (matrix) {
        const updatedMatrix = {
          ...matrix,
          variants: [...matrix.variants, newVariant]
        }
        
        await attributesStore.updateVariantMatrix(matrix.id, updatedMatrix)
      }
    }
    
    showVariantCreationDialog.value = false
    
    toast({
      title: 'Variant Created',
      description: `Variant ${newVariant.sku} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchData()
  } catch (error) {
    console.error('Error creating variant:', error)
    toast({
      title: 'Error',
      description: 'Failed to create variant. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleVariantUpdated = async (updatedVariant) => {
  try {
    // Find the matrix this variant belongs to
    const matrix = variantMatrices.value.find(m => m.id === updatedVariant.matrixId)
    
    if (!matrix) {
      throw new Error('Variant matrix not found')
    }
    
    // Update the variant in the matrix
    const updatedVariants = matrix.variants.map(v => 
      v.id === updatedVariant.id ? {
        ...v, 
        ...updatedVariant,
        // Remove fields that were added for the UI but shouldn't be saved in the matrix
        productId: undefined,
        productName: undefined,
        matrixId: undefined
      } : v
    )
    
    const updatedMatrix = {
      ...matrix,
      variants: updatedVariants
    }
    
    await attributesStore.updateVariantMatrix(matrix.id, updatedMatrix)
    showVariantEditorSheet.value = false
    
    toast({
      title: 'Variant Updated',
      description: `Variant ${updatedVariant.sku} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchData()
  } catch (error) {
    console.error('Error updating variant:', error)
    toast({
      title: 'Error',
      description: 'Failed to update variant. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleVariantDeleted = async (variant) => {
  try {
    // Find the matrix this variant belongs to
    const matrix = variantMatrices.value.find(m => m.id === variant.matrixId)
    
    if (!matrix) {
      throw new Error('Variant matrix not found')
    }
    
    // Remove the variant from the matrix
    const updatedVariants = matrix.variants.filter(v => v.id !== variant.id)
    
    const updatedMatrix = {
      ...matrix,
      variants: updatedVariants
    }
    
    await attributesStore.updateVariantMatrix(matrix.id, updatedMatrix)
    showDeleteVariantDialog.value = false
    
    toast({
      title: 'Variant Deleted',
      description: `Variant ${variant.sku} has been deleted.`,
      variant: 'success'
    })
    
    await fetchData()
  } catch (error) {
    console.error('Error deleting variant:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete variant. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStockUpdated = async (variant, newStock) => {
  try {
    // Find the matrix this variant belongs to
    const matrix = variantMatrices.value.find(m => m.id === variant.matrixId)
    
    if (!matrix) {
      throw new Error('Variant matrix not found')
    }
    
    // Update the variant stock in the matrix
    const updatedVariants = matrix.variants.map(v => 
      v.id === variant.id ? { ...v, stock: newStock } : v
    )
    
    const updatedMatrix = {
      ...matrix,
      variants: updatedVariants
    }
    
    await attributesStore.updateVariantMatrix(matrix.id, updatedMatrix)
    showUpdateStockDialog.value = false
    
    toast({
      title: 'Stock Updated',
      description: `Stock for variant ${variant.sku} has been updated to ${newStock}.`,
      variant: 'success'
    })
    
    await fetchData()
  } catch (error) {
    console.error('Error updating stock:', error)
    toast({
      title: 'Error',
      description: 'Failed to update stock. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (variants, updates) => {
  try {
    // Group variants by matrix ID for efficient updates
    const variantsByMatrix = {}
    
    variants.forEach(variant => {
      if (!variantsByMatrix[variant.matrixId]) {
        variantsByMatrix[variant.matrixId] = []
      }
      variantsByMatrix[variant.matrixId].push(variant)
    })
    
    // Update each matrix
    for (const matrixId in variantsByMatrix) {
      const matrix = variantMatrices.value.find(m => m.id === matrixId)
      
      if (matrix) {
        const variantIds = variantsByMatrix[matrixId].map(v => v.id)
        
        // Apply updates to all selected variants in this matrix
        const updatedVariants = matrix.variants.map(v => {
          if (variantIds.includes(v.id)) {
            // Apply updates
            const updated = { ...v }
            
            if (updates.stock !== undefined) {
              updated.stock = updates.stock
            }
            
            if (updates.price !== undefined) {
              updated.price = updates.price
            }
            
            if (updates.priceAdjustment !== undefined) {
              updated.priceAdjustment = updates.priceAdjustment
            }
            
            if (updates.isEnabled !== undefined) {
              updated.isEnabled = updates.isEnabled
            }
            
            return updated
          }
          return v
        })
        
        const updatedMatrix = {
          ...matrix,
          variants: updatedVariants
        }
        
        await attributesStore.updateVariantMatrix(matrix.id, updatedMatrix)
      }
    }
    
    showBulkEditDialog.value = false
    
    toast({
      title: 'Variants Updated',
      description: `${variants.length} variants have been updated.`,
      variant: 'success'
    })
    
    await fetchData()
  } catch (error) {
    console.error('Error bulk updating variants:', error)
    toast({
      title: 'Error',
      description: 'Failed to update variants. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} variants have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchData()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import variants. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleAttributesUpdated = async () => {
  try {
    await fetchData()
    
    toast({
      title: 'Attributes Updated',
      description: 'Variant attributes have been updated successfully.',
      variant: 'success'
    })
    
    showAttributesManager.value = false
  } catch (error) {
    console.error('Error refreshing data after attribute update:', error)
  }
}

// Initialize component
onMounted(() => {
  console.log('Component mounted, calling fetchData()');
  fetchData().then(() => {
    console.log('Data fetched:');
    console.log('Products:', products.value);
    console.log('Attributes:', attributes.value);
    console.log('Variant Matrices:', variantMatrices.value);
    console.log('Flattened Variants:', flattenedVariants.value);
  });
});
</script>