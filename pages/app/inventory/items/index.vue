<template>
  <div class="p-6 space-y-6">
    <!-- Breadcrumb Navigation -->
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <HomeIcon class="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon class="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Inventory</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRightIcon class="h-4 w-4" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Items</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Inventory Items</h1>
        <p class="text-muted-foreground">
          Manage your inventory items, stock levels, and item configurations.
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="openStatisticsDialog">
          <FileTextIcon class="mr-2 h-4 w-4" />
          Statistics
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileUp class="mr-2 h-4 w-4" />
              Import
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openImportSheet('csv')">
              <FileSpreadsheet class="mr-2 h-4 w-4" />
              Import CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('excel')">
              <FileSpreadsheet class="mr-2 h-4 w-4" />
              Import Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <DownloadIcon class="mr-2 h-4 w-4" />
              Export
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportItems('CSV')">
              <FileSpreadsheet class="mr-2 h-4 w-4" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportItems('EXCEL')">
              <FileSpreadsheet class="mr-2 h-4 w-4" />
              Export Excel
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportItems('JSON')">
              <FileTextIcon class="mr-2 h-4 w-4" />
              Export JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openItemWizard">
          <PlusIcon class="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>

    <!-- View Mode Selector -->
    <div class="flex items-center justify-between border-b">
      <div class="flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          <TableIcon class="mr-2 h-4 w-4" />
          Table View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'cards' }"
          @click="viewMode = 'cards'"
        >
          <FileTextIcon class="mr-2 h-4 w-4" />
          Card View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'analytics' }"
          @click="viewMode = 'analytics'"
        >
          <BarChartIcon class="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </div>
      <div v-if="viewMode === 'table'" class="text-sm text-muted-foreground">
        Showing {{ paginatedItems?.content?.length || 0 }} of {{ paginatedItems?.page?.totalElements || 0 }} items
      </div>
      <div v-else-if="viewMode === 'cards'" class="text-sm text-muted-foreground">
        {{ items.length }} items loaded
      </div>
      <div v-else class="text-sm text-muted-foreground">
        Analytics view
      </div>
    </div>

    <!-- Table View -->
    <InventoryItemsTable
      v-if="viewMode === 'table'"
      :items="paginatedItems?.content || []"
      :categories="categories"
      :units="units"
      :pagination="pagination"
      :loading="isLoading"
      @view-item="openItemDetails"
      @edit-item="openItemEditor"
      @duplicate-item="handleDuplicateItem"
      @delete-item="openDeleteItemDialog"
      @activate-item="handleActivateItem"
      @deactivate-item="handleDeactivateItem"
      @adjust-stock="openStockAdjustmentDialog"
      @view-stock-history="openStockHistoryDialog"
      @refresh="refreshItems"
      @bulk-edit="openBulkEditDialog"
      @search="handleSearch"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- Card View -->
    <InventoryItemsGrid
      v-else-if="viewMode === 'cards'"
      :items="paginatedItems?.content || []"
      :categories="categories"
      :units="units"
      :pagination="pagination"
      :loading="isLoading"
      @view-item="openItemDetails"
      @edit-item="openItemEditor"
      @duplicate-item="handleDuplicateItem"
      @delete-item="openDeleteItemDialog"
      @activate-item="handleActivateItem"
      @deactivate-item="handleDeactivateItem"
      @adjust-stock="openStockAdjustmentDialog"
      @search="handleSearch"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
      @load-more="handleLoadMore"
      @refresh="refreshItems"
    />

    <!-- Analytics View -->
    <InventoryAnalyticsView
      v-else-if="viewMode === 'analytics'"
      :summary="itemSummary"
      :low-stock-items="lowStockItems"
      :reorder-items="reorderItems"
      :loading="isLoading"
      @view-low-stock="switchToLowStockView"
      @view-reorder-required="switchToReorderView"
      @refresh="refreshItems"
    />
    
    <!-- Item Creation Wizard Dialog -->
    <Sheet v-model:open="showItemWizard" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Create New Item</SheetTitle>
          <SheetDescription>
            Add a new inventory item with complete configuration.
          </SheetDescription>
        </SheetHeader>
        <ItemCreationWizard
          :categories="categories"
          :units="units"
          :is-uploading="fileUploadStore.getIsUploading"
          :upload-error="fileUploadStore.getError"
          :image-url="fileUploadStore.getUploadedUrl"
          @item-created="handleItemCreated"
          @close="showItemWizard = false"
          @upload-image="handleImageUpload"
          @remove-image="handleImageRemove"
        />
      </SheetContent>
    </Sheet>
    
    <!-- Item Details Dialog -->
    <ItemDetailsDialog
      :open="showItemDetailsDialog"
      :item="selectedItem"
      :categories="categories"
      :units="units"
      :is-uploading="fileUploadStore.getIsUploading"
      :upload-error="fileUploadStore.getError"
      @update:open="showItemDetailsDialog = $event"
      @edit="openItemEditor"
      @duplicate="handleDuplicateItem"
      @adjust-stock="openStockAdjustmentDialog"
      @image-updated="handleItemImageUpdate"
      @upload-image="handleImageUpload"
      @remove-image="handleImageRemove"
    />    
    
    <!-- Item Editor Sheet -->
    <Sheet v-model:open="showItemEditorSheet" position="right" size="lg">
      <SheetContent class="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Edit Item</SheetTitle>
          <SheetDescription>
            Update item information and configuration.
          </SheetDescription>
        </SheetHeader>
        <ItemEditorSheet
          :item="selectedItem"
          :categories="categories"
          :units="units"
          :is-uploading="fileUploadStore.getIsUploading"
          :upload-error="fileUploadStore.getError"
          :image-url="selectedItem?.imageUrl"
          @item-updated="handleItemUpdated"
          @close="showItemEditorSheet = false"
          @upload-image="handleImageUpload"
          @remove-image="handleImageRemove"
        />
      </SheetContent>
    </Sheet>

    <!-- Stock Adjustment Dialog -->
    <Dialog v-model:open="showStockAdjustmentDialog">
      <StockAdjustmentDialog
        :item="selectedItem"
        :purchase-orders="purchaseOrders"
        :warehouses="warehouses"
        :purchase-orders-loading="purchaseOrdersLoading"
        :warehouses-loading="warehousesLoading"
        :purchase-orders-pagination-meta="purchaseOrdersPaginationMeta"
        @transaction-created="handleStockTransaction"
        @load-purchase-orders="loadPurchaseOrdersForDialog"
        @close="showStockAdjustmentDialog = false"
      />
    </Dialog>

    <!-- Stock History Dialog -->
    <Dialog v-model:open="showStockHistoryDialog" class="sm:max-w-[900px]">
      <StockHistoryDialog
        :item="selectedItem"
        @close="showStockHistoryDialog = false"
      />
    </Dialog>

    <!-- Delete Item Dialog -->
    <Dialog v-model:open="showDeleteItemDialog">
      <DeleteItemDialog
        :item="itemToDelete"
        :units="units"
        @item-deleted="handleItemDeleted"
        @close="showDeleteItemDialog = false; itemToDelete = null"
      />
    </Dialog>
      
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditItemsDialog
        :items="selectedBulkItems"
        :categories="categories"
        :units="units"
        @items-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>    
    
    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <SheetContent class="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader class="px-6 py-4 border-b">
          <SheetTitle>Import Items</SheetTitle>
          <SheetDescription>
            Import inventory items from {{ importType.toUpperCase() }} file.
          </SheetDescription>
        </SheetHeader>
        <ItemImportSheet
          :import-type="importType"
          :categories="categories"
          :units="units"
          @import-complete="handleImportComplete"
          @close="showImportSheet = false"
        />
      </SheetContent>
    </Sheet>

    <!-- Item Statistics Dialog -->
    <Dialog v-model:open="showStatisticsDialog" class="sm:max-w-[800px]">
      <ItemStatisticsDialog
        :summary="itemSummary"
        :loading="isLoading"
        @close="showStatisticsDialog = false"
      />
    </Dialog>

    <!-- Low Stock Filter View -->
    <Dialog v-model:open="showLowStockDialog" class="sm:max-w-[1000px]">
      <LowStockItemsDialog
        :items="lowStockItems"
        :loading="isLoading"
        @close="showLowStockDialog = false"
        @reorder-item="handleReorderItem"
      />
    </Dialog>

    <!-- Reorder Required Dialog -->
    <Dialog v-model:open="showReorderDialog" class="sm:max-w-[1000px]">
      <ReorderRequiredDialog
        :items="reorderItems"
        :loading="isLoading"
        @close="showReorderDialog = false"
        @create-purchase-order="handleCreatePurchaseOrder"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { navigateTo } from 'nuxt/app'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet, Table2, FileTextIcon,
  DownloadIcon, RefreshCwIcon, HomeIcon, SettingsIcon, ChevronRightIcon,
  PackageIcon, TableIcon, BarChartIcon
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
import InventoryItemsTable from '@/components/inventory/items/InventoryItemsTable.vue'
import InventoryItemsGrid from '@/components/inventory/items/InventoryItemsGrid.vue'
import InventoryAnalyticsView from '@/components/inventory/items/InventoryAnalyticsView.vue'
import ItemCreationWizard from '@/components/inventory/items/ItemCreationWizard.vue'
import ItemDetailsDialog from '@/components/inventory/items/ItemDetailsDialog.vue'
import ItemEditorSheet from '@/components/inventory/items/ItemEditorSheet.vue'
import StockAdjustmentDialog from '@/components/inventory/items/StockAdjustmentDialog.vue'
import StockHistoryDialog from '@/components/inventory/items/StockHistoryDialog.vue'
import DeleteItemDialog from '@/components/inventory/items/DeleteItemDialog.vue'
import BulkEditItemsDialog from '@/components/inventory/items/BulkEditItemsDialog.vue'
import ItemImportSheet from '@/components/inventory/items/ItemImportSheet.vue'
import ItemStatisticsDialog from '@/components/inventory/items/ItemStatisticsDialog.vue'
import LowStockItemsDialog from '@/components/inventory/items/LowStockItemsDialog.vue'
import ReorderRequiredDialog from '@/components/inventory/items/ReorderRequiredDialog.vue'

// Stores
import { useInventoryItemsStore } from '@/store/modules/inventory/inventory-items'
import { useItemCategoriesStore } from '@/store/modules/inventory/item-categories'
import { useUomStore } from '@/store/modules/inventory/uom'
import { useFileUploadStore } from '@/store/modules/utility/file-upload/upload'
import { usePurchaseOrdersStore } from '@/store/modules/purchase-orders/purchase-orders'
import { useLocationsStore } from '@/store/modules/inventory/locations'

// Initialize stores
const inventoryItemsStore = useInventoryItemsStore()
const itemCategoriesStore = useItemCategoriesStore()
const uomStore = useUomStore()
const fileUploadStore = useFileUploadStore()
const purchaseOrdersStore = usePurchaseOrdersStore()
const locationsStore = useLocationsStore()
const { toast } = useToast()

// Access store state through computed properties
const items = computed(() => inventoryItemsStore.getItems)
const paginatedItems = computed(() => inventoryItemsStore.getPaginatedItems)
const selectedItem = computed(() => inventoryItemsStore.getSelectedItem)
const lowStockItems = computed(() => inventoryItemsStore.getLowStockItems)
const reorderItems = computed(() => inventoryItemsStore.getReorderItems)
const itemSummary = computed(() => inventoryItemsStore.getItemSummary)
const searchResults = computed(() => inventoryItemsStore.getSearchResults)
const isLoading = computed(() => inventoryItemsStore.getIsLoading)
const error = computed(() => inventoryItemsStore.getError)
const pagination = computed(() => inventoryItemsStore.getPagination)

// Categories store state
const categories = computed(() => itemCategoriesStore.getActiveCategories)
const categoriesLoading = computed(() => itemCategoriesStore.getIsLoading)

// UOM store state
const units = computed(() => uomStore.getActiveUnits)
const unitsLoading = computed(() => uomStore.getIsLoading)

// Purchase orders store state
const purchaseOrders = computed(() => purchaseOrdersStore.getOrders)
const purchaseOrdersLoading = computed(() => purchaseOrdersStore.getIsLoading)
const purchaseOrdersPagination = computed(() => purchaseOrdersStore.getPagination)

// Purchase orders pagination metadata for dialog
const purchaseOrdersPaginationMeta = computed(() => ({
  page: purchaseOrdersPagination.value.page,
  totalPages: purchaseOrdersPagination.value.totalPages,
  hasMore: purchaseOrdersPagination.value.page < purchaseOrdersPagination.value.totalPages - 1
}))

// Locations store state
const warehouses = computed(() => locationsStore.getActiveWarehouses)
const warehousesLoading = computed(() => locationsStore.getIsLoading)

// State management
const selectedBulkItems = ref([])
const itemToDelete = ref(null)

// UI control
const viewMode = ref('table')
const showItemWizard = ref(false)
const showItemDetailsDialog = ref(false)
const showItemEditorSheet = ref(false)
const showStockAdjustmentDialog = ref(false)
const showStockHistoryDialog = ref(false)
const showDeleteItemDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const showStatisticsDialog = ref(false)
const showLowStockDialog = ref(false)
const showReorderDialog = ref(false)
const importType = ref('csv')

// Fetch data from APIs
const refreshItems = async () => {
  try {
    if (viewMode.value === 'analytics') {
      await inventoryItemsStore.refreshAllData()
    } else {
      await inventoryItemsStore.fetchItems({ 
        page: pagination.value.page, 
        size: pagination.value.size 
      })
    }
  } catch (error) {
    console.error('Error refreshing items:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openItemWizard = () => {
  showItemWizard.value = true
}

const openItemDetails = async (item) => {
  try {
    await inventoryItemsStore.fetchItemById(item.id)
    fileUploadStore.clearError()
    showItemDetailsDialog.value = true
  } catch (error) {
    console.error('Error fetching item details:', error)
    toast({
      title: 'Error',
      description: 'Failed to load item details',
      variant: 'destructive'
    })
  }
}

const openItemEditor = async (item) => {
  try {
    // Ensure categories and units are loaded before opening the editor
    if (categories.value.length === 0) {
      await itemCategoriesStore.fetchAllCategories()
    }
    if (units.value.length === 0) {
      await uomStore.fetchUnits()
    }
    
    console.log('Opening item editor for item:', item)
    console.log('Available categories when opening editor:', categories.value)
    console.log('Available units when opening editor:', units.value)
    
    inventoryItemsStore.setSelectedItem(item)
    showItemEditorSheet.value = true
  } catch (error) {
    console.error('Error preparing item editor:', error)
    toast({
      title: 'Error',
      description: 'Failed to load required data for editing',
      variant: 'destructive'
    })
  }
}

const openStockAdjustmentDialog = (item) => {
  inventoryItemsStore.setSelectedItem(item)
  showStockAdjustmentDialog.value = true
}

const handleItemImageUpdate = async (data) => {
  try {
    // Update the selected item's image URL
    if (selectedItem.value && selectedItem.value.id === data.itemId) {
      selectedItem.value.imageUrl = data.imageUrl
    }
    
    // Update the item in the store if it exists in the items list
    const itemInList = inventoryItemsStore.items.find(item => item.id === data.itemId)
    if (itemInList) {
      itemInList.imageUrl = data.imageUrl
    }
    
    // TODO: Call API to update the item's image URL when backend supports it
    // await inventoryItemsStore.updateItem({
    //   id: data.itemId,
    //   imageUrl: data.imageUrl
    // })
    
    toast({
      title: 'Success',
      description: data.imageUrl ? 'Item image updated successfully' : 'Item image removed successfully'
    })
  } catch (error) {
    console.error('Error updating item image:', error)
    toast({
      title: 'Error',
      description: 'Failed to update item image',
      variant: 'destructive'
    })
  }
}

const handleImageUpload = async (data) => {
  try {
    if (data.error) {
      fileUploadStore.error = data.error
      return
    }
    if (!data.file) return
    console.log('Uploading image file:', data.file)
    // Upload the file using the store
    const result = await fileUploadStore.uploadFile(data.file)
    if (result.success && result.data?.url) {
      if (data.itemId) {
        // Editing existing item
        await handleItemImageUpdate({
          itemId: data.itemId,
          imageUrl: result.data.url
        })
      } else {
        // Creating new item: set uploaded URL in store for wizard
        fileUploadStore.setUploadedUrl(result.data.url)
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    toast({
      title: 'Error',
      description: 'Failed to upload image',
      variant: 'destructive'
    })
  }
}

const handleImageRemove = async (data) => {
  try {
    // Clear any existing upload errors
    fileUploadStore.clearError()
    
    // Update the item to remove the image URL
    await handleItemImageUpdate({
      itemId: data.itemId,
      imageUrl: null
    })
  } catch (error) {
    console.error('Error removing image:', error)
    toast({
      title: 'Error',
      description: 'Failed to remove image',
      variant: 'destructive'
    })
  }
}

const openStockHistoryDialog = (item) => {
  inventoryItemsStore.setSelectedItem(item)
  showStockHistoryDialog.value = true
}

const openDeleteItemDialog = (item) => {
  console.log('Opening delete dialog for item:', item)
  console.log('Item ID:', item?.id)
  itemToDelete.value = item
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

const openStatisticsDialog = async () => {
  try {
    await inventoryItemsStore.fetchStatistics()
    showStatisticsDialog.value = true
  } catch (error) {
    console.error('Error fetching statistics:', error)
    toast({
      title: 'Error',
      description: 'Failed to load statistics',
      variant: 'destructive'
    })
  }
}

const switchToLowStockView = async () => {
  try {
    await inventoryItemsStore.fetchLowStockItems()
    showLowStockDialog.value = true
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load low stock items',
      variant: 'destructive'
    })
  }
}

const switchToReorderView = async () => {
  try {
    await inventoryItemsStore.fetchReorderRequiredItems()
    showReorderDialog.value = true
  } catch (error) {
    console.error('Error fetching reorder required items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load reorder required items',
      variant: 'destructive'
    })
  }
}

// CRUD operation handlers
const handleItemCreated = async (newItem) => {
  try {
    await inventoryItemsStore.createItem(newItem)
    showItemWizard.value = false
    
    toast({
      title: 'Success',
      description: 'Item created successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error creating item:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create item',
      variant: 'destructive'
    })
  }
}

const handleItemUpdated = async (updateData) => {
  try {
    const itemId = selectedItem.value?.id
    if (!itemId) return
    
    await inventoryItemsStore.updateItem(itemId, updateData)
    showItemEditorSheet.value = false
    
    toast({
      title: 'Success',
      description: 'Item updated successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error updating item:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update item',
      variant: 'destructive'
    })
  }
}

const handleItemDeleted = async (deleteData) => {
  try {
    // Extract the itemId from the deleteData object
    const itemId = deleteData.itemId || deleteData.id
    console.log('Deleting item with ID:', itemId)
    
    await inventoryItemsStore.deleteItem(itemId)
    showDeleteItemDialog.value = false
    itemToDelete.value = null
    
    toast({
      title: 'Success',
      description: 'Item deleted successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete item',
      variant: 'destructive'
    })
  }
}

const handleDuplicateItem = async (item) => {
  try {
    const newItemCode = `${item.itemCode}_COPY`
    
    await inventoryItemsStore.duplicateItem(item.id, newItemCode)
    
    toast({
      title: 'Success',
      description: 'Item duplicated successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error duplicating item:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to duplicate item',
      variant: 'destructive'
    })
  }
}

const handleActivateItem = async (item) => {
  try {
    await inventoryItemsStore.activateItem(item.id)
    
    toast({
      title: 'Success',
      description: 'Item activated successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error activating item:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to activate item',
      variant: 'destructive'
    })
  }
}

const handleDeactivateItem = async (item) => {
  try {
    await inventoryItemsStore.deactivateItem(item.id)
    
    toast({
      title: 'Success',
      description: 'Item deactivated successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error deactivating item:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to deactivate item',
      variant: 'destructive'
    })
  }
}

const handleStockAdjustment = async (adjustmentData) => {
  try {
    await inventoryItemsStore.adjustStock(adjustmentData)
    showStockAdjustmentDialog.value = false
    
    toast({
      title: 'Success',
      description: 'Stock adjustment created successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error creating stock adjustment:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create stock adjustment',
      variant: 'destructive'
    })
  }
}

const handleStockTransaction = async (transactionData) => {
  try {
    console.log('Creating stock transaction:', transactionData)
    
    // Here you would call your stock transaction API
    // await inventoryItemsStore.createStockTransaction(transactionData)
    
    showStockAdjustmentDialog.value = false
    
    toast({
      title: 'Success',
      description: 'Stock transaction created successfully',
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error creating stock transaction:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'An error occurred while creating stock transaction.',
      variant: 'destructive'
    })
  }
}

const loadPurchaseOrdersForDialog = async (options = {}) => {
  try {
    const { page = 0, append = false } = options
    
    const params = {
      page,
      pageSize: 10,
      startCreatedDate: 'all',
      endCreatedDate: 'all',
      raisedById: 0,
      vendorId: 0,
      status: 'all',
      startDueDate: 'all',
      paymentTermsId: 0,
      endDueDate: 'all',
    }
    
    if (append && page > 0) {
      // For pagination, we need to append to existing orders
      // The store should handle this logic
      await purchaseOrdersStore.fetchMoreOrders(params)
    } else {
      // For initial load, fetch fresh data
      await purchaseOrdersStore.fetchOrders(params)
    }
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    toast({
      title: 'Error',
      description: 'Failed to load purchase orders',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (items, updates) => {
  try {
    const itemIds = items.map(item => item.id)
    await inventoryItemsStore.bulkUpdateItems(itemIds, updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Success',
      description: `${items.length} items updated successfully`,
      variant: 'success'
    })
    
    await refreshItems()
  } catch (error) {
    console.error('Error bulk updating items:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update items',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Success',
      description: `${result.importedCount} items imported successfully`,
      variant: 'success'
    })
    
    await refreshItems()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import items',
      variant: 'destructive'
    })
  }
}

const handlePageChange = async (newPage) => {
  try {
    await inventoryItemsStore.fetchItems({ 
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
    await inventoryItemsStore.fetchItems({ 
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

// New filter and search handlers
const currentFilters = ref({})

const handleSearch = async (searchTerm) => {
  try {
    const params = {
      ...currentFilters.value,
      searchTerm: searchTerm || undefined,
      page: 0, // Reset to first page when searching
      size: pagination.value.size
    }
    await inventoryItemsStore.fetchItems(params)
  } catch (error) {
    console.error('Error searching items:', error)
    toast({
      title: 'Error',
      description: 'Failed to search items. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleFilterChange = async (filters) => {
  try {
    // Merge new filters with existing ones
    currentFilters.value = { ...currentFilters.value, ...filters }
    
    // Remove null/undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(currentFilters.value).filter(([key, value]) => value !== null && value !== undefined)
    )
    
    const params = {
      ...cleanFilters,
      page: 0, // Reset to first page when filtering
      size: pagination.value.size
    }
    await inventoryItemsStore.fetchItems(params)
  } catch (error) {
    console.error('Error filtering items:', error)
    toast({
      title: 'Error',
      description: 'Failed to apply filters. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleSortChange = async (sortOptions) => {
  try {
    const params = {
      ...currentFilters.value,
      sortBy: sortOptions.sortBy || undefined,
      sortDirection: sortOptions.sortDirection || 'ASC',
      page: 0, // Reset to first page when sorting
      size: pagination.value.size
    }
    await inventoryItemsStore.fetchItems(params)
  } catch (error) {
    console.error('Error sorting items:', error)
    toast({
      title: 'Error',
      description: 'Failed to sort items. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleLoadMore = async () => {
  try {
    const nextPage = pagination.value.page + 1
    const params = {
      ...currentFilters.value,
      page: nextPage,
      size: pagination.value.size
    }
    
    // For load more, we would typically append to existing items
    // But since our store replaces items, we'll just navigate to next page
    await inventoryItemsStore.fetchItems(params)
  } catch (error) {
    console.error('Error loading more items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load more items. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleReorderItem = async (item) => {
  // Navigate to purchase order creation or handle reorder logic
  await navigateTo(`/app/purchasing/orders/create?reorderItem=${item.id}`)
}

const handleCreatePurchaseOrder = async (items) => {
  // Navigate to purchase order creation with multiple items
  const itemIds = items.map(item => item.id).join(',')
  await navigateTo(`/app/purchasing/orders/create?reorderItems=${itemIds}`)
}

// Export functionality
const exportItems = async (format) => {
  try {
    const blob = await inventoryItemsStore.exportItems({ format })
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventory-items-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Items exported successfully',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error exporting items:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to export items',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(async () => {
  try {
    console.log('Initializing inventory items page...')
    
    // Fetch categories, units, warehouses, and items in parallel
    await Promise.all([
      itemCategoriesStore.fetchAllCategories(),
      uomStore.fetchUnits(),
      locationsStore.fetchAllWarehouses()
    ])
    
    console.log('Categories loaded:', categories.value)
    console.log('Units loaded:', units.value)
    console.log('Warehouses loaded:', warehouses.value)
    
    await refreshItems()
  } catch (error) {
    console.error('Error initializing inventory items page:', error)
    toast({
      title: 'Error',
      description: 'Failed to load initial data',
      variant: 'destructive'
    })
  }
})
</script>
