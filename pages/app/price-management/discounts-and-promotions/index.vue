<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Discounts & Promotions</h2>
        <p class="text-muted-foreground">Manage special offers, discounts, and promotional pricing</p>
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
        <Button @click="openPromotionWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Promotion
        </Button>
      </div>
    </div>

    <!-- Promotions Table -->
    <PromotionsTable
      :promotions="promotions"
      :products="products"
      :loading="isLoading"
      @view-promotion="openPromotionDetails"
      @edit-promotion="openPromotionEditor"
      @duplicate-promotion="handleDuplicatePromotion"
      @delete-promotion="openDeletePromotionDialog"
      @update-status="openUpdateStatusDialog"
      @refresh="fetchPromotions"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Promotion Creation Wizard Dialog -->
    <Sheet v-model:open="showPromotionWizard" position="right" size="lg">
      <PromotionCreationWizard
        v-if="showPromotionWizard"
        :products="products"
        :customer-groups="customerGroups"
        :sales-channels="salesChannels"
        @promotion-created="handlePromotionCreated"
        @close="showPromotionWizard = false"
      />
    </Sheet>

    <!-- Promotion Details Dialog -->
    <Dialog v-model:open="showPromotionDetailsDialog">
      <PromotionDetailsDialog
        v-if="showPromotionDetailsDialog"
        :promotion="selectedPromotion"
        @edit-promotion="openPromotionEditor"
        @duplicate-promotion="handleDuplicatePromotion"
        @delete-promotion="openDeletePromotionDialog"
        @update-status="openUpdateStatusDialog"
        @close="showPromotionDetailsDialog = false"
      />
    </Dialog>

    <!-- Promotion Editor Sheet -->
    <Sheet v-model:open="showPromotionEditorSheet" position="right" size="lg">
      <PromotionEditorSheet
        v-if="showPromotionEditorSheet"
        :promotion="selectedPromotion"
        :products="products"
        :customer-groups="customerGroups"
        :sales-channels="salesChannels"
        @promotion-updated="handlePromotionUpdated"
        @close="showPromotionEditorSheet = false"
      />
    </Sheet>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="showStatusDialog">
      <UpdatePromotionStatusDialog
        v-if="showStatusDialog"
        :promotion="selectedPromotion"
        @status-updated="handleStatusUpdated"
        @close="showStatusDialog = false"
      />
    </Dialog>

    <!-- Delete Promotion Dialog -->
    <Dialog v-model:open="showDeletePromotionDialog">
      <DeletePromotionDialog
        v-if="showDeletePromotionDialog"
        :promotion="selectedPromotion"
        @delete="handlePromotionDeleted"
        @close="showDeletePromotionDialog = false"
      />
    </Dialog>
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditPromotionsDialog
        v-if="showBulkEditDialog"
        :selected-promotions="selectedBulkPromotions"
        :products="products"
        :customer-groups="customerGroups"
        @promotions-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <PromotionImportSheet
        v-if="showImportSheet"
        :import-type="importType"
        @import-complete="handleImportComplete"
        @close="showImportSheet = false"
      />
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
import PromotionsTable from '@/components/price-management/promotions/PromotionsTable.vue'
import PromotionCreationWizard from '@/components/price-management/promotions/PromotionCreationWizard.vue'
import PromotionDetailsDialog from '@/components/price-management/promotions/PromotionDetailsDialog.vue'
import PromotionEditorSheet from '@/components/price-management/promotions/PromotionEditorSheet.vue'
import UpdatePromotionStatusDialog from '@/components/price-management/promotions/UpdatePromotionStatusDialog.vue'
import DeletePromotionDialog from '@/components/price-management/promotions/DeletePromotionDialog.vue'
import BulkEditPromotionsDialog from '@/components/price-management/promotions/BulkEditPromotionsDialog.vue'
import PromotionImportSheet from '@/components/price-management/promotions/PromotionImportSheet.vue'

// Stores
import { usePricingStore } from '@/store/modules/price-mangement/pricing'
import { useProductsStore } from '@/store/modules/catalog/products'

// Initialize stores
const pricingStore = usePricingStore()
const productsStore = useProductsStore()
const { toast } = useToast()

// Access store state through computed properties
const promotions = computed(() => pricingStore.getPromotions)
const customerGroups = computed(() => pricingStore.getCustomerGroups)
const salesChannels = computed(() => pricingStore.getSalesChannels)
const products = computed(() => productsStore.getProducts)
const isLoading = computed(() => pricingStore.getIsLoading)
const error = computed(() => pricingStore.getError)

// State management
const selectedPromotion = ref(null)
const selectedBulkPromotions = ref([])

// UI control
const showPromotionWizard = ref(false)
const showPromotionDetailsDialog = ref(false)
const showPromotionEditorSheet = ref(false)
const showStatusDialog = ref(false)
const showDeletePromotionDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Fetch data from APIs
const fetchPromotions = async () => {
  try {
    await pricingStore.fetchPromotions()
  } catch (error) {
    console.error('Error fetching promotions:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchCustomerGroups = async () => {
  try {
    await pricingStore.fetchCustomerGroups()
  } catch (error) {
    console.error('Error fetching customer groups:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customer groups',
      variant: 'destructive'
    })
  }
}

const fetchSalesChannels = async () => {
  try {
    await pricingStore.fetchSalesChannels()
  } catch (error) {
    console.error('Error fetching sales channels:', error)
    toast({
      title: 'Error',
      description: 'Failed to load sales channels',
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

// Dialog and sheet handlers
const openPromotionWizard = () => {
  showPromotionWizard.value = true
}

const openPromotionDetails = (promotion) => {
  selectedPromotion.value = promotion
  showPromotionDetailsDialog.value = true
}

const openPromotionEditor = (promotion) => {
  selectedPromotion.value = promotion
  showPromotionEditorSheet.value = true
}

const openUpdateStatusDialog = (promotion) => {
  selectedPromotion.value = promotion
  showStatusDialog.value = true
}

const openDeletePromotionDialog = (promotion) => {
  selectedPromotion.value = promotion
  showDeletePromotionDialog.value = true
}

const openBulkEditDialog = (promotions) => {
  selectedBulkPromotions.value = promotions
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handlePromotionCreated = async (newPromotion) => {
  try {
    await pricingStore.createPromotion(newPromotion)
    showPromotionWizard.value = false
    
    toast({
      title: 'Promotion Created',
      description: `${newPromotion.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } catch (error) {
    console.error('Error creating promotion:', error)
    toast({
      title: 'Error',
      description: 'Failed to create promotion. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePromotionUpdated = async (updatedPromotion) => {
  try {
    await pricingStore.updatePromotion(updatedPromotion)
    showPromotionEditorSheet.value = false
    
    toast({
      title: 'Promotion Updated',
      description: `${updatedPromotion.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } catch (error) {
    console.error('Error updating promotion:', error)
    toast({
      title: 'Error',
      description: 'Failed to update promotion. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStatusUpdated = async ({ promotion, status, reason }) => {
  try {
    await pricingStore.updatePromotionStatus(promotion.id, status, reason)
    showStatusDialog.value = false
    
    toast({
      title: 'Status Updated',
      description: `Promotion status changed to ${status}.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } catch (error) {
    console.error('Error updating promotion status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update promotion status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePromotionDeleted = async (promotion) => {
  try {
    await pricingStore.deletePromotion(promotion.id)
    showDeletePromotionDialog.value = false
    
    toast({
      title: 'Promotion Deleted',
      description: `${promotion.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } catch (error) {
    console.error('Error deleting promotion:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete promotion. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicatePromotion = async (promotion) => {
  try {
    await pricingStore.duplicatePromotion(promotion.id)
    
    toast({
      title: 'Promotion Duplicated',
      description: `A copy of ${promotion.name} has been created.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } catch (error) {
    console.error('Error duplicating promotion:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate promotion. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (promotions, updates) => {
  try {
    await pricingStore.bulkUpdatePromotions(promotions.map(p => p.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Promotions Updated',
      description: `${promotions.length} promotions have been updated.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } catch (error) {
    console.error('Error bulk updating promotions:', error)
    toast({
      title: 'Error',
      description: 'Failed to update promotions. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} promotions have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchPromotions()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import promotions. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchPromotions()
  fetchCustomerGroups()
  fetchSalesChannels()
  fetchProducts()
})
</script>