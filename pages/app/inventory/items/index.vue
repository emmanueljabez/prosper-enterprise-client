<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Items</h2>
        <p class="text-muted-foreground">Manage your inventory items, stock levels, and location assignments</p>
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
            <DropdownMenuItem @click="openImportSheet('api')">
              <Webhook class="h-4 w-4 mr-2" />
              Import via API
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openItemWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>
    </div>

    <!-- Items Table -->
    <InventoryItemsTable
      :items="items"
      :locations="locations"
      :loading="isLoading"
      @view-item="openItemDetails"
      @edit-item="openItemEditor"
      @duplicate-item="handleDuplicateItem"
      @delete-item="openDeleteItemDialog"
      @update-status="openUpdateStatusDialog"
      @adjust-stock="openStockAdjustmentDialog"
      @refresh="fetchItems"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Item Creation Wizard Dialog -->
    <Sheet v-model:open="showItemWizard" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <ItemCreationWizard
          v-if="showItemWizard"
          :locations="locations"
          :categories="categories"
          @item-created="handleItemCreated"
          @close="showItemWizard = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Item Details Dialog -->
    <Dialog v-model:open="showItemDetailsDialog">
      <ItemDetailsDialog
        v-if="showItemDetailsDialog"
        :item="selectedItem"
        @edit-item="openItemEditor"
        @duplicate-item="handleDuplicateItem"
        @delete-item="openDeleteItemDialog"
        @update-status="openUpdateStatusDialog"
        @adjust-stock="openStockAdjustmentDialog"
        @close="showItemDetailsDialog = false"
      />
    </Dialog>

    <!-- Item Editor Sheet -->
    <Sheet v-model:open="showItemEditorSheet" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl">
        <ItemEditorSheet
          v-if="showItemEditorSheet"
          :item="selectedItem"
          :locations="locations"
          :categories="categories"
          @item-updated="handleItemUpdated"
          @close="showItemEditorSheet = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Stock Adjustment Dialog -->
    <Dialog v-model:open="showStockAdjustmentDialog">
      <StockAdjustmentDialog
        v-if="showStockAdjustmentDialog"
        :item="selectedItem"
        :locations="locations"
        @adjustment-saved="handleStockAdjustment"
        @close="showStockAdjustmentDialog = false"
      />
    </Dialog>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="showStatusDialog">
      <UpdateItemStatusDialog
        v-if="showStatusDialog"
        :item="selectedItem"
        @status-updated="handleStatusUpdated"
        @close="showStatusDialog = false"
      />
    </Dialog>

    <!-- Delete Item Dialog -->
    <Dialog v-model:open="showDeleteItemDialog">
      <DeleteItemDialog
        v-if="showDeleteItemDialog"
        :item="selectedItem"
        @delete="handleItemDeleted"
        @close="showDeleteItemDialog = false"
      />
    </Dialog>
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditItemsDialog
        v-if="showBulkEditDialog"
        :selected-items="selectedBulkItems"
        :locations="locations"
        :categories="categories"
        @items-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <SheetContent class="w-full sm:max-w-lg">
        <ItemImportSheet
          v-if="showImportSheet"
          :import-type="importType"
          :categories="categories"
          @import-complete="handleImportComplete"
          @close="showImportSheet = false"
        />
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet,
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
import InventoryItemsTable from '@/components/inventory/items/InventoryItemsTable.vue'
import ItemCreationWizard from '@/components/inventory/items/ItemCreationWizard.vue'
import ItemDetailsDialog from '@/components/inventory/items/ItemDetailsDialog.vue'
import ItemEditorSheet from '@/components/inventory/items/ItemEditorSheet.vue'
import StockAdjustmentDialog from '@/components/inventory/items/StockAdjustmentDialog.vue'
import UpdateItemStatusDialog from '@/components/inventory/items/UpdateItemStatusDialog.vue'
import DeleteItemDialog from '@/components/inventory/items/DeleteItemDialog.vue'
import BulkEditItemsDialog from '@/components/inventory/items/BulkEditItemsDialog.vue'
import ItemImportSheet from '@/components/inventory/items/ItemImportSheet.vue'

// Stores
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useCategoriesStore } from '@/store/modules/catalog/categories'

// Initialize stores
const inventoryStore = useInventoryStore()
const locationsStore = useLocationsStore()
const categoriesStore = useCategoriesStore()
const { toast } = useToast()

// Access store state through computed properties
const items = computed(() => inventoryStore.getItems)
const locations = computed(() => locationsStore.getLocations)
const categories = computed(() => categoriesStore.getCategories)
const isLoading = computed(() => inventoryStore.getIsLoading)
const error = computed(() => inventoryStore.getError)

// State management
const selectedItem = ref(null)
const selectedBulkItems = ref([])

// UI control
const showItemWizard = ref(false)
const showItemDetailsDialog = ref(false)
const showItemEditorSheet = ref(false)
const showStockAdjustmentDialog = ref(false)
const showStatusDialog = ref(false)
const showDeleteItemDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Fetch data from APIs
const fetchItems = async () => {
  try {
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchLocations = async () => {
  try {
    await locationsStore.fetchLocations()
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load locations',
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
      description: 'Failed to load categories',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openItemWizard = () => {
  showItemWizard.value = true
}

const openItemDetails = (item) => {
  selectedItem.value = item
  showItemDetailsDialog.value = true
}

const openItemEditor = (item) => {
  selectedItem.value = item
  showItemEditorSheet.value = true
}

const openStockAdjustmentDialog = (item) => {
  selectedItem.value = item
  showStockAdjustmentDialog.value = true
}

const openUpdateStatusDialog = (item) => {
  selectedItem.value = item
  showStatusDialog.value = true
}

const openDeleteItemDialog = (item) => {
  selectedItem.value = item
  showDeleteItemDialog.value = true
}

const openBulkEditDialog = (items) => {
  selectedBulkItems.value = items
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleItemCreated = async (newItem) => {
  try {
    await inventoryStore.createItem(newItem)
    showItemWizard.value = false
    
    toast({
      title: 'Item Created',
      description: `${newItem.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error creating item:', error)
    toast({
      title: 'Error',
      description: 'Failed to create item. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleItemUpdated = async (updatedItem) => {
  try {
    await inventoryStore.updateItem(updatedItem)
    showItemEditorSheet.value = false
    
    toast({
      title: 'Item Updated',
      description: `${updatedItem.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error updating item:', error)
    toast({
      title: 'Error',
      description: 'Failed to update item. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStockAdjustment = async (adjustment) => {
  try {
    await inventoryStore.adjustItemStock(adjustment)
    showStockAdjustmentDialog.value = false
    
    toast({
      title: 'Stock Adjusted',
      description: `Stock level has been adjusted successfully.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error adjusting stock:', error)
    toast({
      title: 'Error',
      description: 'Failed to adjust stock. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStatusUpdated = async ({ item, status, reason }) => {
  try {
    await inventoryStore.updateItemStatus(item.id, status, reason)
    showStatusDialog.value = false
    
    toast({
      title: 'Status Updated',
      description: `Item status changed to ${status}.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error updating item status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update item status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleItemDeleted = async (item) => {
  try {
    await inventoryStore.deleteItem(item.id)
    showDeleteItemDialog.value = false
    
    toast({
      title: 'Item Deleted',
      description: `${item.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete item. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicateItem = async (item) => {
  try {
    await inventoryStore.duplicateItem(item.id)
    
    toast({
      title: 'Item Duplicated',
      description: `A copy of ${item.name} has been created.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error duplicating item:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate item. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (items, updates) => {
  try {
    await inventoryStore.bulkUpdateItems(items.map(i => i.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Items Updated',
      description: `${items.length} items have been updated.`,
      variant: 'success'
    })
    
    await fetchItems()
  } catch (error) {
    console.error('Error bulk updating items:', error)
    toast({
      title: 'Error',
      description: 'Failed to update items. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} items have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchItems()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import items. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchItems()
  fetchLocations()
  fetchCategories()
})
</script>