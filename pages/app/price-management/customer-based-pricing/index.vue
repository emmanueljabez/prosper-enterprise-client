<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Customer-Based Pricing</h2>
        <p class="text-muted-foreground">Manage special prices and discounts for specific customers</p>
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
        <Button @click="openPricingWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Price Rule
        </Button>
      </div>
    </div>

    <!-- Customer Pricing Table -->
    <CustomerPricingTable
      :pricing-rules="pricingRules"
      :customers="customers"
      :products="products"
      :loading="isLoading"
      @view-pricing="openPricingDetails"
      @edit-pricing="openPricingEditor"
      @duplicate-pricing="handleDuplicatePricing"
      @delete-pricing="openDeletePricingDialog"
      @update-status="openUpdateStatusDialog"
      @refresh="fetchPricingRules"
      @bulk-edit="openBulkEditDialog"
    />

    <!-- Pricing Rule Wizard Dialog -->
    <Sheet v-model:open="showPricingWizard" position="right" size="lg">
      <PricingCreationWizard
        v-if="showPricingWizard"
        :customers="customers"
        :products="products"
        @pricing-created="handlePricingCreated"
        @close="showPricingWizard = false"
      />
    </Sheet>

    <!-- Pricing Details Dialog -->
    <Dialog v-model:open="showPricingDetailsDialog">
      <PricingDetailsDialog
        v-if="showPricingDetailsDialog"
        :pricing-rule="selectedPricing"
        @edit-pricing="openPricingEditor"
        @close="showPricingDetailsDialog = false"
      />
    </Dialog>

    <!-- Pricing Editor Sheet -->
    <Sheet v-model:open="showPricingEditorSheet" position="right" size="lg">
      <PricingEditorSheet
        v-if="showPricingEditorSheet"
        :pricing-rule="selectedPricing"
        :customers="customers"
        :products="products"
        @pricing-updated="handlePricingUpdated"
        @close="showPricingEditorSheet = false"
      />
    </Sheet>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="showStatusDialog">
      <UpdatePricingStatusDialog
        v-if="showStatusDialog"
        :pricing-rule="selectedPricing"
        @status-updated="handleStatusUpdated"
        @close="showStatusDialog = false"
      />
    </Dialog>

    <Dialog v-model:open="showDeletePricingDialog">
      <DeletePricingDialog
        v-if="showDeletePricingDialog"
        :pricing-rule="selectedPricing"
        @delete="handlePricingDeleted"
        @close="showDeletePricingDialog = false"
      />
    </Dialog>
    
    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditPricingDialog
        v-if="showBulkEditDialog"
        :selected-pricing-rules="selectedBulkPricing"
        :customers="customers"
        :products="products"
        @pricing-updated="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <PricingImportSheet
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
import CustomerPricingTable from '@/components/price-management/customer-pricing/CustomerPricingTable.vue'
import PricingCreationWizard from '@/components/price-management/customer-pricing/PricingCreationWizard.vue'
import PricingDetailsDialog from '@/components/price-management/customer-pricing/PricingDetailsDialog.vue'
import PricingEditorSheet from '@/components/price-management/customer-pricing/PricingEditorSheet.vue'
import UpdatePricingStatusDialog from '@/components/price-management/customer-pricing/UpdatePricingStatusDialog.vue'
import DeletePricingDialog from '@/components/price-management/customer-pricing/DeletePricingDialog.vue'
import BulkEditPricingDialog from '@/components/price-management/customer-pricing/BulkEditPricingDialog.vue'
import PricingImportSheet from '@/components/price-management/customer-pricing/PricingImportSheet.vue'

// Stores
import { usePricingStore } from '@/store/modules/price-mangement/pricing'
import { useCustomersStore } from '@/store/modules/price-mangement/customers'
import { useProductsStore } from '@/store/modules/catalog/products'

// Initialize stores
const pricingStore = usePricingStore()
const customersStore = useCustomersStore()
const productsStore = useProductsStore()
const { toast } = useToast()

// Access store state through computed properties
const pricingRules = computed(() => pricingStore.getPricingRules)
const customers = computed(() => customersStore.getCustomers)
const products = computed(() => productsStore.getProducts)
const isLoading = computed(() => pricingStore.getIsLoading)
const error = computed(() => pricingStore.getError)

// State management
const selectedPricing = ref(null)
const selectedBulkPricing = ref([])

// UI control
const showPricingWizard = ref(false)
const showPricingDetailsDialog = ref(false)
const showPricingEditorSheet = ref(false)
const showStatusDialog = ref(false)
const showDeletePricingDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Fetch data from APIs
const fetchPricingRules = async () => {
  try {
    await pricingStore.fetchPricingRules()
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchCustomers = async () => {
  try {
    await customersStore.fetchCustomers()
  } catch (error) {
    console.error('Error fetching customers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customers',
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
const openPricingWizard = () => {
  showPricingWizard.value = true
}

const openPricingDetails = (pricing) => {
  selectedPricing.value = pricing
  showPricingDetailsDialog.value = true
}

const openPricingEditor = (pricing) => {
  selectedPricing.value = pricing
  showPricingEditorSheet.value = true
}

const openUpdateStatusDialog = (pricing) => {
  selectedPricing.value = pricing
  showStatusDialog.value = true
}

const openDeletePricingDialog = (pricing) => {
  selectedPricing.value = pricing
  showDeletePricingDialog.value = true
}

const openBulkEditDialog = (pricingRules) => {
  selectedBulkPricing.value = pricingRules
  showBulkEditDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handlePricingCreated = async (newPricing) => {
  try {
    await pricingStore.createPricingRule(newPricing)
    showPricingWizard.value = false
    
    toast({
      title: 'Price Rule Created',
      description: `Price rule for ${newPricing.customerName} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } catch (error) {
    console.error('Error creating price rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to create price rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePricingUpdated = async (updatedPricing) => {
  try {
    await pricingStore.updatePricingRule(updatedPricing)
    showPricingEditorSheet.value = false
    
    toast({
      title: 'Price Rule Updated',
      description: `Price rule for ${updatedPricing.customerName} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } catch (error) {
    console.error('Error updating price rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to update price rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStatusUpdated = async ({ pricingRule, status, reason }) => {
  try {
    await pricingStore.updatePricingStatus(pricingRule.id, status, reason)
    showStatusDialog.value = false
    
    toast({
      title: 'Status Updated',
      description: `Price rule status changed to ${status}.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } catch (error) {
    console.error('Error updating price rule status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update price rule status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePricingDeleted = async (pricingRule) => {
  try {
    await pricingStore.deletePricingRule(pricingRule.id)
    showDeletePricingDialog.value = false
    
    toast({
      title: 'Price Rule Deleted',
      description: `Price rule for ${pricingRule.customerName} has been deleted.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } catch (error) {
    console.error('Error deleting price rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete price rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicatePricing = async (pricingRule) => {
  try {
    await pricingStore.duplicatePricingRule(pricingRule.id)
    
    toast({
      title: 'Price Rule Duplicated',
      description: `A copy of price rule for ${pricingRule.customerName} has been created.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } catch (error) {
    console.error('Error duplicating price rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate price rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (pricingRules, updates) => {
  try {
    await pricingStore.bulkUpdatePricingRules(pricingRules.map(p => p.id), updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Price Rules Updated',
      description: `${pricingRules.length} price rules have been updated.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } catch (error) {
    console.error('Error bulk updating price rules:', error)
    toast({
      title: 'Error',
      description: 'Failed to update price rules. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} price rules have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchPricingRules()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import price rules. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchPricingRules()
  fetchCustomers()
  fetchProducts()
})
</script>