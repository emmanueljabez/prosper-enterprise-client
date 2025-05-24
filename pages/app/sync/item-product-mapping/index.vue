<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Item ↔ Product Mapping</h2>
        <p class="text-muted-foreground">Link inventory items with catalog products for seamless synchronization</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileDown class="h-4 w-4 mr-2" />
              Export
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportMappings('csv')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportMappings('excel')">
              <Table2 class="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportMappings('json')">
              <Code class="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openMappingWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          Create Mapping
        </Button>
      </div>
    </div>

    <!-- Mapping Table -->
    <MappingTable
      :mappings="mappings"
      :items="items"
      :products="products"
      :loading="isLoading"
      @view-mapping="openMappingDetails"
      @edit-mapping="openMappingEditor"
      @delete-mapping="openDeleteMappingDialog"
      @sync-mapping="handleSyncMapping"
      @bulk-edit="openBulkEditDialog"
      @refresh="fetchMappings"
    />

    <!-- Mapping Wizard Dialog -->
    <Sheet v-model:open="showMappingWizard" position="right" size="md">
      <MappingCreationWizard
        v-if="showMappingWizard"
        :items="unmappedItems"
        :products="unmappedProducts"
        @mapping-created="handleMappingCreated"
        @close="showMappingWizard = false"
      />
    </Sheet>

    <!-- Mapping Details Dialog -->
    <Dialog v-model:open="showMappingDetailsDialog">
      <MappingDetailsDialog
        v-if="showMappingDetailsDialog"
        :mapping="selectedMapping"
        :item="getItemById(selectedMapping?.itemId)"
        :product="getProductById(selectedMapping?.productId)"
        @edit-mapping="openMappingEditor"
        @sync-mapping="handleSyncMapping"
        @close="showMappingDetailsDialog = false"
      />
    </Dialog>

    <!-- Mapping Editor Sheet -->
    <Sheet v-model:open="showMappingEditorSheet" position="right" size="md">
      <MappingEditorSheet
        v-if="showMappingEditorSheet"
        :mapping="selectedMapping"
        :items="items"
        :products="products"
        @mapping-updated="handleMappingUpdated"
        @close="showMappingEditorSheet = false"
      />
    </Sheet>

    <!-- Delete Mapping Dialog -->
    <Dialog v-model:open="showDeleteMappingDialog">
      <DeleteMappingDialog
        v-if="showDeleteMappingDialog"
        :mapping="selectedMapping"
        :item="getItemById(selectedMapping?.itemId)"
        :product="getProductById(selectedMapping?.productId)"
        @delete="handleMappingDeleted"
        @close="showDeleteMappingDialog = false"
      />
    </Dialog>
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditMappingDialog
        v-if="showBulkEditDialog"
        :selectedMappings="selectedBulkMappings"
        @mappings-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Unmapped Items Dialog -->
    <Dialog v-model:open="showUnmappedItemsDialog">
      <UnmappedItemsDialog
        v-if="showUnmappedItemsDialog"
        :items="unmappedItems"
        :products="products"
        @create-mapping="handleQuickMapping"
        @close="showUnmappedItemsDialog = false"
      />
    </Dialog>

    <!-- Sync Conflict Resolution Dialog -->
    <Dialog v-model:open="showSyncConflictDialog">
      <SyncConflictDialog
        v-if="showSyncConflictDialog"
        :mapping="selectedMapping"
        :item="getItemById(selectedMapping?.itemId)"
        :product="getProductById(selectedMapping?.productId)"
        :conflicts="syncConflicts"
        @resolve="handleConflictResolution"
        @close="showSyncConflictDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileDown, ChevronDown, FileSpreadsheet,
  Table2, Code
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
import MappingTable from '@/components/sync/mappings/MappingTable.vue'
import MappingCreationWizard from '@/components/sync/mappings/MappingCreationWizard.vue'
import MappingDetailsDialog from '@/components/sync/mappings/MappingDetailsDialog.vue'
import MappingEditorSheet from '@/components/sync/mappings/MappingEditorSheet.vue'
import DeleteMappingDialog from '@/components/sync/mappings/DeleteMappingDialog.vue'
import BulkEditMappingDialog from '@/components/sync/mappings/BulkEditMappingDialog.vue'
import UnmappedItemsDialog from '@/components/sync/mappings/UnmappedItemsDialog.vue'
import SyncConflictDialog from '@/components/sync/mappings/SyncConflictDialog.vue'

// Stores - Using the inventory store instead of a dedicated mappings store
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useProductsStore } from '@/store/modules/catalog/products'

// Initialize stores
const inventoryStore = useInventoryStore()
const productsStore = useProductsStore()
const { toast } = useToast()

// Access store state through computed properties
const mappings = computed(() => inventoryStore.getMappings)
const items = computed(() => inventoryStore.getItems)
const products = computed(() => productsStore.getProducts)
const isLoading = computed(() => inventoryStore.getIsLoading)
const syncConflicts = computed(() => inventoryStore.getSyncConflicts || [])

// Computed properties for unmapped items and products
const unmappedItems = computed(() => {
  const mappedItemIds = mappings.value.map(m => m.itemId)
  return items.value.filter(item => !mappedItemIds.includes(item.id))
})

const unmappedProducts = computed(() => {
  const mappedProductIds = mappings.value.map(m => m.productId)
  return products.value.filter(product => !mappedProductIds.includes(product.id))
})

// State management
const selectedMapping = ref(null)
const selectedBulkMappings = ref([])

// UI control
const showMappingWizard = ref(false)
const showMappingDetailsDialog = ref(false)
const showMappingEditorSheet = ref(false)
const showDeleteMappingDialog = ref(false)
const showBulkEditDialog = ref(false)
const showUnmappedItemsDialog = ref(false)
const showSyncConflictDialog = ref(false)

// Helper functions
const getItemById = (itemId) => {
  if (!itemId) return null
  return items.value.find(item => item.id === itemId)
}

const getProductById = (productId) => {
  if (!productId) return null
  return products.value.find(product => product.id === productId)
}

// Fetch data from APIs
const fetchMappings = async () => {
  try {
    await inventoryStore.fetchMappings()
  } catch (error) {
    console.error('Error fetching mappings:', error)
    toast({
      title: 'Error',
      description: 'Failed to load item-product mappings',
      variant: 'destructive'
    })
  }
}

const fetchItems = async () => {
  try {
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Error fetching items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory items',
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
      description: 'Failed to load catalog products',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openMappingWizard = () => {
  showMappingWizard.value = true
}

const openMappingDetails = (mapping) => {
  selectedMapping.value = mapping
  showMappingDetailsDialog.value = true
}

const openMappingEditor = (mapping) => {
  selectedMapping.value = mapping
  showMappingEditorSheet.value = true
}

const openDeleteMappingDialog = (mapping) => {
  selectedMapping.value = mapping
  showDeleteMappingDialog.value = true
}

const openBulkEditDialog = (mappings) => {
  selectedBulkMappings.value = mappings
  showBulkEditDialog.value = true
}

const openUnmappedItemsDialog = () => {
  showUnmappedItemsDialog.value = true
}

// CRUD operation handlers
const handleMappingCreated = async (newMapping) => {
  try {
    await inventoryStore.createMapping(newMapping)
    showMappingWizard.value = false
    
    toast({
      title: 'Mapping Created',
      description: 'Item-product mapping has been created successfully.',
      variant: 'success'
    })
    
    await fetchMappings()
  } catch (error) {
    console.error('Error creating mapping:', error)
    toast({
      title: 'Error',
      description: 'Failed to create mapping. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleMappingUpdated = async (updatedMapping) => {
  try {
    await inventoryStore.updateMapping(updatedMapping)
    showMappingEditorSheet.value = false
    
    toast({
      title: 'Mapping Updated',
      description: 'Item-product mapping has been updated successfully.',
      variant: 'success'
    })
    
    await fetchMappings()
  } catch (error) {
    console.error('Error updating mapping:', error)
    toast({
      title: 'Error',
      description: 'Failed to update mapping. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleMappingDeleted = async (mapping) => {
  try {
    await inventoryStore.deleteMapping(mapping.id)
    showDeleteMappingDialog.value = false
    
    toast({
      title: 'Mapping Deleted',
      description: 'Item-product mapping has been deleted.',
      variant: 'success'
    })
    
    await fetchMappings()
  } catch (error) {
    console.error('Error deleting mapping:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete mapping. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleSyncMapping = async (mapping) => {
  try {
    const conflicts = await inventoryStore.syncMapping(mapping.id)
    
    if (conflicts && conflicts.length > 0) {
      selectedMapping.value = mapping
      showSyncConflictDialog.value = true
    } else {
      toast({
        title: 'Sync Complete',
        description: 'Item-product mapping has been synchronized successfully.',
        variant: 'success'
      })
    }
    
    await fetchMappings()
  } catch (error) {
    console.error('Error syncing mapping:', error)
    toast({
      title: 'Sync Failed',
      description: 'Failed to synchronize item and product. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (mappings, updates) => {
  try {
    await inventoryStore.bulkUpdateMappings(mappings.map(m => m.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Mappings Updated',
      description: `${mappings.length} mappings have been updated.`,
      variant: 'success'
    })
    
    await fetchMappings()
  } catch (error) {
    console.error('Error bulk updating mappings:', error)
    toast({
      title: 'Error',
      description: 'Failed to update mappings. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleQuickMapping = async (itemId, productId) => {
  try {
    await inventoryStore.createMapping({
      itemId,
      productId,
      mappingType: 'manual',
      syncOptions: {
        inventory: true,
        pricing: true,
        metadata: false,
        bidirectional: false
      }
    })
    
    toast({
      title: 'Quick Mapping Created',
      description: 'Item-product mapping has been created successfully.',
      variant: 'success'
    })
    
    await fetchMappings()
  } catch (error) {
    console.error('Error creating quick mapping:', error)
    toast({
      title: 'Error',
      description: 'Failed to create mapping. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleConflictResolution = async (resolution) => {
  try {
    await inventoryStore.resolveSyncConflict(selectedMapping.value.id, resolution)
    showSyncConflictDialog.value = false
    
    toast({
      title: 'Conflict Resolved',
      description: 'Synchronization conflict has been resolved successfully.',
      variant: 'success'
    })
    
    await fetchMappings()
  } catch (error) {
    console.error('Error resolving conflict:', error)
    toast({
      title: 'Error',
      description: 'Failed to resolve conflict. Please try again.',
      variant: 'destructive'
    })
  }
}

const exportMappings = async (format) => {
  try {
    await inventoryStore.exportMappings(format)
    
    toast({
      title: 'Export Complete',
      description: `Mappings have been exported in ${format.toUpperCase()} format.`,
      variant: 'success'
    })
  } catch (error) {
    console.error('Error exporting mappings:', error)
    toast({
      title: 'Export Failed',
      description: 'Failed to export mappings. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchMappings()
  fetchItems()
  fetchProducts()
})
</script>