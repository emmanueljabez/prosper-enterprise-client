<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Inventory Transfers</h2>
        <p class="text-muted-foreground">Move inventory between locations, track transfers, and manage approvals</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowDownUpIcon class="h-4 w-4 mr-2" />
              Transfer Type
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openTransferWizard('standard')">
              <ArrowRightIcon class="h-4 w-4 mr-2" />
              Standard Transfer
            </DropdownMenuItem>
            <DropdownMenuItem @click="openTransferWizard('return')">
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              Return Transfer
            </DropdownMenuItem>
            <DropdownMenuItem @click="openTransferWizard('adjustment')">
              <ScaleIcon class="h-4 w-4 mr-2" />
              Inventory Adjustment
            </DropdownMenuItem>
            <DropdownMenuItem @click="openTransferWizard('bulk')">
              <PackageIcon class="h-4 w-4 mr-2" />
              Bulk Transfer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button @click="openCreateTransferDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <TransferStatCards :stats="stats" />

    <!-- Filters -->
    <TransferFilters 
      v-model:status="filters.status"
      v-model:from-location="filters.fromLocation"
      v-model:to-location="filters.toLocation"
      v-model:date-range="filters.dateRange"
      :locations="locations"
      @filter-change="fetchTransfers"
    />

    <!-- Transfers Table -->
    <TransfersTable
      :transfers="transfers"
      :locations="locations"
      :loading="isLoading"
      @view-transfer="openTransferDetails"
      @approve-transfer="openApprovalDialog"
      @receive-transfer="openReceiveDialog"
      @cancel-transfer="openCancelDialog"
      @print-transfer="handlePrintTransfer"
      @refresh="fetchTransfers"
    />

    <!-- Create Transfer Dialog -->
    <Dialog v-model:open="showCreateTransferDialog">
      <CreateTransferDialog
        v-if="showCreateTransferDialog"
        :locations="locations"
        :items="inventoryItems"
        @transfer-created="handleTransferCreated"
        @close="showCreateTransferDialog = false"
      />
    </Dialog>

    <!-- Transfer Details Dialog -->
    <Dialog v-model:open="showTransferDetailsDialog">
      <TransferDetailsDialog
        v-if="showTransferDetailsDialog"
        :transfer="selectedTransfer"
        :locations="locations"
        @approve-transfer="openApprovalDialog"
        @receive-transfer="openReceiveDialog"
        @cancel-transfer="openCancelDialog"
        @close="showTransferDetailsDialog = false"
      />
    </Dialog>

    <!-- Transfer Wizard Sheet -->
    <Sheet v-model:open="showTransferWizard" position="right" size="lg">
      <TransferWizard
        v-if="showTransferWizard"
        :transfer-type="transferType"
        :locations="locations"
        :items="inventoryItems"
        @transfer-created="handleWizardComplete"
        @close="showTransferWizard = false"
      />
    </Sheet>

    <!-- Approval Dialog -->
    <Dialog v-model:open="showApprovalDialog">
      <TransferApprovalDialog
        v-if="showApprovalDialog"
        :transfer="selectedTransfer"
        @transfer-approved="handleTransferApproved"
        @close="showApprovalDialog = false"
      />
    </Dialog>

    <!-- Receive Transfer Dialog -->
    <Dialog v-model:open="showReceiveDialog">
      <ReceiveTransferDialog
        v-if="showReceiveDialog"
        :transfer="selectedTransfer"
        @transfer-received="handleTransferReceived"
        @close="showReceiveDialog = false"
      />
    </Dialog>

    <!-- Cancel Transfer Dialog -->
    <Dialog v-model:open="showCancelDialog">
      <CancelTransferDialog
        v-if="showCancelDialog"
        :transfer="selectedTransfer"
        @transfer-cancelled="handleTransferCancelled"
        @close="showCancelDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  ChevronDown, 
  ArrowDownUpIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  ScaleIcon,
  PackageIcon
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
import TransferStatCards from '@/components/inventory/transfers/TransferStatCards.vue'
import TransferFilters from '@/components/inventory/transfers/TransferFilters.vue'
import TransfersTable from '@/components/inventory/transfers/TransfersTable.vue'
import CreateTransferDialog from '@/components/inventory/transfers/CreateTransferDialog.vue'
import TransferDetailsDialog from '@/components/inventory/transfers/TransferDetailsDialog.vue'
import TransferWizard from '@/components/inventory/transfers/TransferWizard.vue'
import TransferApprovalDialog from '@/components/inventory/transfers/TransferApprovalDialog.vue'
import ReceiveTransferDialog from '@/components/inventory/transfers/ReceiveTransferDialog.vue'
import CancelTransferDialog from '@/components/inventory/transfers/CancelTransferDialog.vue'

// Stores
import { useInventoryTransactionsStore } from '@/store/modules/inventory/transactions'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useInventoryStore } from '@/store/modules/inventory/items'

// Initialize stores
const transactionStore = useInventoryTransactionsStore()
const locationsStore = useLocationsStore()
const inventoryStore = useInventoryStore()
const { toast } = useToast()

// Access store state through computed properties
const transfers = computed(() => transactionStore.getTransfers)
const locations = computed(() => locationsStore.getLocations)
const inventoryItems = computed(() => inventoryStore.getInventoryItems)
const isLoading = computed(() => transactionStore.getIsLoading)
const error = computed(() => transactionStore.getError)

// Stats computed from transfers
const stats = computed(() => {
  return {
    pending: transfers.value.filter(transfer => transfer.status === 'pending').length,
    inTransit: transfers.value.filter(transfer => transfer.status === 'in_transit').length,
    awaitingReceipt: transfers.value.filter(transfer => transfer.status === 'awaiting_receipt').length,
    completedThisMonth: transfers.value.filter(transfer => {
      return transfer.status === 'completed' && 
        new Date(transfer.completedAt).getMonth() === new Date().getMonth()
    }).length
  }
})

// Local state
const selectedTransfer = ref(null)
const filters = ref({
  status: 'all',
  fromLocation: 'all',
  toLocation: 'all',
  dateRange: 'all'
})

// UI control
const showCreateTransferDialog = ref(false)
const showTransferDetailsDialog = ref(false)
const showTransferWizard = ref(false)
const showApprovalDialog = ref(false)
const showReceiveDialog = ref(false)
const showCancelDialog = ref(false)
const transferType = ref('standard')

// Dialog and sheet handlers
const openCreateTransferDialog = () => {
  showCreateTransferDialog.value = true
}

const openTransferDetails = (transfer) => {
  selectedTransfer.value = transfer
  showTransferDetailsDialog.value = true
}

const openTransferWizard = (type) => {
  transferType.value = type
  showTransferWizard.value = true
}

const openApprovalDialog = (transfer) => {
  selectedTransfer.value = transfer
  showApprovalDialog.value = true
}

const openReceiveDialog = (transfer) => {
  selectedTransfer.value = transfer
  showReceiveDialog.value = true
}

const openCancelDialog = (transfer) => {
  selectedTransfer.value = transfer
  showCancelDialog.value = true
}

// Fetch data from APIs
const fetchTransfers = async () => {
  try {
    await transactionStore.fetchTransfers({
      status: filters.value.status !== 'all' ? filters.value.status : undefined,
      fromLocationId: filters.value.fromLocation !== 'all' ? filters.value.fromLocation : undefined,
      toLocationId: filters.value.toLocation !== 'all' ? filters.value.toLocation : undefined,
      dateRange: filters.value.dateRange !== 'all' ? filters.value.dateRange : undefined
    })
  } catch (error) {
    console.error('Error fetching transfers:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load transfers',
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
      description: 'Failed to load inventory locations',
      variant: 'destructive'
    })
  }
}

const fetchInventoryItems = async () => {
  try {
    await inventoryStore.fetchItems(); // Changed from fetchInventoryItems to fetchItems
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory items',
      variant: 'destructive'
    })
  }
}

// Action handlers
const handleTransferCreated = async (newTransfer) => {
  try {
    await transactionStore.createTransfer(newTransfer)
    showCreateTransferDialog.value = false
    
    toast({
      title: 'Transfer Created',
      description: `Transfer #${newTransfer.referenceNumber || 'New'} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchTransfers()
  } catch (error) {
    console.error('Error creating transfer:', error)
    toast({
      title: 'Error',
      description: 'Failed to create transfer. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleWizardComplete = async (newTransfer) => {
  try {
    await transactionStore.createTransfer(newTransfer)
    showTransferWizard.value = false
    
    toast({
      title: 'Transfer Created',
      description: `Transfer #${newTransfer.referenceNumber || 'New'} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchTransfers()
  } catch (error) {
    console.error('Error creating transfer:', error)
    toast({
      title: 'Error',
      description: 'Failed to create transfer. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTransferApproved = async (transferId, approvalData) => {
  try {
    await transactionStore.approveTransfer(transferId, approvalData)
    showApprovalDialog.value = false
    
    toast({
      title: 'Transfer Approved',
      description: 'Transfer has been approved and is now in transit.',
      variant: 'success'
    })
    
    await fetchTransfers()
  } catch (error) {
    console.error('Error approving transfer:', error)
    toast({
      title: 'Error',
      description: 'Failed to approve transfer. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTransferReceived = async (transferId, receiptData) => {
  try {
    await transactionStore.receiveTransfer(transferId, receiptData)
    showReceiveDialog.value = false
    
    toast({
      title: 'Transfer Received',
      description: 'Transfer has been received and inventory has been updated.',
      variant: 'success'
    })
    
    await fetchTransfers()
  } catch (error) {
    console.error('Error receiving transfer:', error)
    toast({
      title: 'Error',
      description: 'Failed to receive transfer. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTransferCancelled = async (transferId, reason) => {
  try {
    await transactionStore.cancelTransfer(transferId, reason)
    showCancelDialog.value = false
    
    toast({
      title: 'Transfer Cancelled',
      description: 'Transfer has been cancelled.',
      variant: 'success'
    })
    
    await fetchTransfers()
  } catch (error) {
    console.error('Error cancelling transfer:', error)
    toast({
      title: 'Error',
      description: 'Failed to cancel transfer. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePrintTransfer = async (transfer) => {
  try {
    await transactionStore.generateTransferDocument(transfer.id)
    
    toast({
      title: 'Transfer Document Generated',
      description: 'Transfer document has been generated and is ready for printing.',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error generating transfer document:', error)
    toast({
      title: 'Error',
      description: 'Failed to generate transfer document. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchTransfers()
  fetchLocations()
  fetchInventoryItems()
})
</script>