<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Shipping</h2>
        <p class="text-muted-foreground">Manage orders, create shipments, and track deliveries</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <PlugIcon class="h-4 w-4 mr-2" />
              Carriers
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openProviderSettings('usps')">
              <TruckIcon class="h-4 w-4 mr-2" />
              USPS Settings
            </DropdownMenuItem>
            <DropdownMenuItem @click="openProviderSettings('fedex')">
              <TruckIcon class="h-4 w-4 mr-2" />
              FedEx Settings
            </DropdownMenuItem>
            <DropdownMenuItem @click="openProviderSettings('ups')">
              <TruckIcon class="h-4 w-4 mr-2" />
              UPS Settings
            </DropdownMenuItem>
            <DropdownMenuItem @click="openProviderSettings('dhl')">
              <TruckIcon class="h-4 w-4 mr-2" />
              DHL Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="openAddProviderDialog">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add New Carrier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" @click="openBatchShippingDialog">
          <LayersIcon class="h-4 w-4 mr-2" />
          Batch Processing
        </Button>
        <Button @click="openCreateShipmentDialog">
          <PackageIcon class="h-4 w-4 mr-2" />
          Create Shipment
        </Button>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <ShippingMetricsCard 
        title="Pending Shipments" 
        :value="pendingShipments.length"
        trend="2%"
        trendUp
        icon="package"
      />
      <ShippingMetricsCard 
        title="Shipped Today" 
        :value="shippedToday"
        trend="15%"
        trendUp
        icon="truck"
      />
      <ShippingMetricsCard 
        title="Average Shipping Time" 
        value="1.2 days"
        trend="5%"
        :trendUp="false"
        icon="clock"
      />
      <ShippingMetricsCard 
        title="Shipping Cost" 
        :value="formatCurrency(totalShippingCost)"
        trend="3%"
        trendUp
        icon="dollar-sign"
      />
    </div>

    <!-- Tabs for different views -->
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="processing">Processing</TabsTrigger>
        <TabsTrigger value="shipped">Shipped</TabsTrigger>
        <TabsTrigger value="all">All Shipments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" class="space-y-4">
        <ShipmentsTable 
          :shipments="pendingShipments"
          :carriers="shippingCarriers"
          :loading="isLoading"
          @view-shipment="openShipmentDetails"
          @process-shipment="openProcessShipmentDialog"
          @print-label="openPrintLabelDialog"
          @void-label="handleVoidLabel"
          @cancel-shipment="openCancelShipmentDialog"
          @refresh="fetchShipments"
        />
      </TabsContent>
      
      <TabsContent value="processing" class="space-y-4">
        <ShipmentsTable 
          :shipments="processingShipments"
          :carriers="shippingCarriers"
          :loading="isLoading"
          @view-shipment="openShipmentDetails"
          @print-label="openPrintLabelDialog"
          @void-label="handleVoidLabel"
          @cancel-shipment="openCancelShipmentDialog"
          @refresh="fetchShipments"
        />
      </TabsContent>
      
      <TabsContent value="shipped" class="space-y-4">
        <ShipmentsTable 
          :shipments="shippedShipments"
          :carriers="shippingCarriers"
          :loading="isLoading"
          @view-shipment="openShipmentDetails"
          @track-shipment="openTrackingDialog"
          @create-return="openCreateReturnDialog"
          @refresh="fetchShipments"
        />
      </TabsContent>
      
      <TabsContent value="all" class="space-y-4">
        <ShipmentsTable 
          :shipments="shipments"
          :carriers="shippingCarriers"
          :loading="isLoading"
          @view-shipment="openShipmentDetails"
          @process-shipment="openProcessShipmentDialog"
          @print-label="openPrintLabelDialog"
          @void-label="handleVoidLabel"
          @cancel-shipment="openCancelShipmentDialog"
          @track-shipment="openTrackingDialog"
          @create-return="openCreateReturnDialog"
          @refresh="fetchShipments"
        />
      </TabsContent>
    </Tabs>

    

    <!-- Create Shipment Dialog -->
    <Dialog v-model:open="showCreateShipmentDialog">
      <CreateShipmentDialog
        v-if="showCreateShipmentDialog"
        :carriers="shippingCarriers"
        @shipment-created="handleShipmentCreated"
        @close="showCreateShipmentDialog = false"
      />
    </Dialog>

    <!-- Shipment Details Dialog -->
    <Dialog v-model:open="showShipmentDetailsDialog">
      <ShipmentDetailsDialog
        v-if="showShipmentDetailsDialog"
        :shipment="selectedShipment"
        :carriers="shippingCarriers"
        @print-label="openPrintLabelDialog"
        @void-label="handleVoidLabel"
        @process-shipment="openProcessShipmentDialog"
        @track-shipment="openTrackingDialog"
        @cancel-shipment="openCancelShipmentDialog"
        @close="showShipmentDetailsDialog = false"
      />
    </Dialog>

    <!-- Process Shipment Dialog -->
    <Dialog v-model:open="showProcessShipmentDialog">
      <ProcessShipmentDialog
        v-if="showProcessShipmentDialog"
        :shipment="selectedShipment"
        :carriers="shippingCarriers"
        @shipment-processed="handleShipmentProcessed"
        @close="showProcessShipmentDialog = false"
      />
    </Dialog>

    <!-- Print Label Dialog -->
    <Dialog v-model:open="showPrintLabelDialog">
      <PrintShippingLabelDialog
        v-if="showPrintLabelDialog"
        :shipment="selectedShipment"
        :carriers="shippingCarriers"
        @label-printed="handleLabelPrinted"
        @close="showPrintLabelDialog = false"
      />
    </Dialog>

    <!-- Tracking Dialog -->
    <Dialog v-model:open="showTrackingDialog">
      <TrackingDetailsDialog
        v-if="showTrackingDialog"
        :shipment="selectedShipment"
        @close="showTrackingDialog = false"
      />
    </Dialog>

    <!-- Cancel Shipment Dialog -->
    <Dialog v-model:open="showCancelShipmentDialog">
      <CancelShipmentDialog
        v-if="showCancelShipmentDialog"
        :shipment="selectedShipment"
        @shipment-cancelled="handleShipmentCancelled"
        @close="showCancelShipmentDialog = false"
      />
    </Dialog>

    <!-- Create Return Dialog -->
    <Dialog v-model:open="showCreateReturnDialog">
      <CreateReturnDialog
        v-if="showCreateReturnDialog"
        :shipment="selectedShipment"
        :carriers="shippingCarriers"
        @return-created="handleReturnCreated"
        @close="showCreateReturnDialog = false"
      />
    </Dialog>

    <!-- Batch Shipping Dialog -->
    <Dialog v-model:open="showBatchShippingDialog">
      <BatchShippingDialog
        v-if="showBatchShippingDialog"
        :pendingShipments="pendingShipments"
        :carriers="shippingCarriers"
        @batch-processed="handleBatchProcessed"
        @close="showBatchShippingDialog = false"
      />
    </Dialog>

    <!-- Carrier/Provider Settings Dialog -->
    <Dialog v-model:open="showProviderSettingsDialog">
      <CarrierSettingsDialog
        v-if="showProviderSettingsDialog"
        :carrier="selectedCarrier"
        @settings-updated="handleCarrierSettingsUpdated"
        @close="showProviderSettingsDialog = false"
      />
    </Dialog>

    <!-- Add Provider Dialog -->
    <Dialog v-model:open="showAddProviderDialog">
      <AddCarrierDialog
        v-if="showAddProviderDialog"
        @carrier-added="handleCarrierAdded"
        @close="showAddProviderDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ChevronDown, PlusIcon, PackageIcon, TruckIcon, 
  LayersIcon, PlugIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Components
import ShipmentsTable from '@/components/warehouse/shipping/ShipmentsTable.vue'
import ShippingMetricsCard from '@/components/warehouse/shipping/ShippingMetricsCard.vue'
import CreateShipmentDialog from '@/components/warehouse/shipping/CreateShipmentDialog.vue'
import ShipmentDetailsDialog from '@/components/warehouse/shipping/ShipmentDetailsDialog.vue'
import ProcessShipmentDialog from '@/components/warehouse/shipping/ProcessShipmentDialog.vue'
import PrintShippingLabelDialog from '@/components/warehouse/shipping/PrintShippingLabelDialog.vue'
import TrackingDetailsDialog from '@/components/warehouse/shipping/TrackingDetailsDialog.vue'
import CancelShipmentDialog from '@/components/warehouse/shipping/CancelShipmentDialog.vue'
import CreateReturnDialog from '@/components/warehouse/shipping/CreateReturnDialog.vue'
import BatchShippingDialog from '@/components/warehouse/shipping/BatchShippingDialog.vue'
import CarrierSettingsDialog from '@/components/warehouse/shipping/CarrierSettingsDialog.vue'
import AddCarrierDialog from '@/components/warehouse/shipping/AddCarrierDialog.vue'

// Stores
import { useWarehouseStore } from '@/store/modules/warehouse/warehouse'

// Initialize stores
const warehouseStore = useWarehouseStore()
const { toast } = useToast()

// Access store state through computed properties
const shipments = computed(() => warehouseStore.getShipments || [])
const shippingCarriers = computed(() => warehouseStore.getShippingCarriers || [])
const isLoading = computed(() => warehouseStore.getIsLoading)
const error = computed(() => warehouseStore.getError)

// Derived data
const pendingShipments = computed(() => 
  shipments.value.filter(s => s.status === 'pending')
)
const processingShipments = computed(() => 
  shipments.value.filter(s => s.status === 'processing')
)
const shippedShipments = computed(() => 
  shipments.value.filter(s => s.status === 'shipped' || s.status === 'delivered')
)

const shippedToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return shipments.value.filter(s => {
    if (s.shippedDate) {
      const shippedDate = new Date(s.shippedDate)
      shippedDate.setHours(0, 0, 0, 0)
      return s.status === 'shipped' && shippedDate.getTime() === today.getTime()
    }
    return false
  }).length
})

const totalShippingCost = computed(() => {
  return shipments.value.reduce((total, shipment) => {
    return total + (shipment.shippingCost || 0)
  }, 0)
})

// State management
const activeTab = ref('pending')
const selectedShipment = ref(null)
const selectedCarrier = ref(null)

// UI control
const showCreateShipmentDialog = ref(false)
const showShipmentDetailsDialog = ref(false)
const showProcessShipmentDialog = ref(false)
const showPrintLabelDialog = ref(false)
const showTrackingDialog = ref(false)
const showCancelShipmentDialog = ref(false)
const showCreateReturnDialog = ref(false)
const showBatchShippingDialog = ref(false)
const showProviderSettingsDialog = ref(false)
const showAddProviderDialog = ref(false)

// Format currency helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

// Fetch data from APIs
const fetchShipments = async () => {
  try {
    await warehouseStore.fetchShipments()
  } catch (error) {
    console.error('Error fetching shipments:', error)
    toast({
      title: 'Error',
      description: 'Failed to load shipments. Please try again.',
      variant: 'destructive'
    })
  }
}

const fetchShippingCarriers = async () => {
  try {
    await warehouseStore.fetchShippingCarriers()
  } catch (error) {
    console.error('Error fetching shipping carriers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load shipping carriers. Please try again.',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openCreateShipmentDialog = () => {
  showCreateShipmentDialog.value = true
}

const openShipmentDetails = (shipment) => {
  selectedShipment.value = shipment
  showShipmentDetailsDialog.value = true
}

const openProcessShipmentDialog = (shipment) => {
  selectedShipment.value = shipment
  showProcessShipmentDialog.value = true
}

const openPrintLabelDialog = (shipment) => {
  selectedShipment.value = shipment
  showPrintLabelDialog.value = true
}

const openTrackingDialog = (shipment) => {
  selectedShipment.value = shipment
  showTrackingDialog.value = true
}

const openCancelShipmentDialog = (shipment) => {
  selectedShipment.value = shipment
  showCancelShipmentDialog.value = true
}

const openCreateReturnDialog = (shipment) => {
  selectedShipment.value = shipment
  showCreateReturnDialog.value = true
}

const openBatchShippingDialog = () => {
  showBatchShippingDialog.value = true
}

const openProviderSettings = (carrierId) => {
  const carrier = shippingCarriers.value.find(c => c.id === carrierId)
  
  if (!carrier) {
    toast({
      title: 'Error',
      description: `Could not find carrier with ID ${carrierId}`,
      variant: 'destructive'
    })
    return
  }
  
  selectedCarrier.value = carrier
  showProviderSettingsDialog.value = true
}

const openAddProviderDialog = () => {
  showAddProviderDialog.value = true
}

// Operation handlers
const handleShipmentCreated = async (newShipment) => {
  try {
    await warehouseStore.createShipment(newShipment)
    showCreateShipmentDialog.value = false
    
    toast({
      title: 'Shipment Created',
      description: `Shipment #${newShipment.trackingNumber || 'New'} has been created.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error creating shipment:', error)
    toast({
      title: 'Error',
      description: 'Failed to create shipment. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleShipmentProcessed = async (shipment) => {
  try {
    await warehouseStore.processShipment(shipment.id)
    showProcessShipmentDialog.value = false
    
    toast({
      title: 'Shipment Processed',
      description: `Shipment #${shipment.trackingNumber} has been processed.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error processing shipment:', error)
    toast({
      title: 'Error',
      description: 'Failed to process shipment. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleLabelPrinted = async (shipment) => {
  try {
    await warehouseStore.updateShipmentStatus(shipment.id, 'label_printed')
    showPrintLabelDialog.value = false
    
    toast({
      title: 'Label Printed',
      description: `Shipping label for shipment #${shipment.trackingNumber} has been printed.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error updating shipment:', error)
    toast({
      title: 'Error',
      description: 'Failed to update shipment status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleVoidLabel = async (shipment) => {
  try {
    await warehouseStore.voidShippingLabel(shipment.id)
    
    toast({
      title: 'Label Voided',
      description: `Shipping label for shipment #${shipment.trackingNumber} has been voided.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error voiding label:', error)
    toast({
      title: 'Error',
      description: 'Failed to void shipping label. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleShipmentCancelled = async (shipment) => {
  try {
    await warehouseStore.cancelShipment(shipment.id)
    showCancelShipmentDialog.value = false
    
    toast({
      title: 'Shipment Cancelled',
      description: `Shipment #${shipment.trackingNumber} has been cancelled.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error cancelling shipment:', error)
    toast({
      title: 'Error',
      description: 'Failed to cancel shipment. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleReturnCreated = async (returnInfo) => {
  try {
    await warehouseStore.createReturnLabel(returnInfo)
    showCreateReturnDialog.value = false
    
    toast({
      title: 'Return Created',
      description: `Return label for shipment #${returnInfo.originalShipmentId} has been created.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error creating return:', error)
    toast({
      title: 'Error',
      description: 'Failed to create return label. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBatchProcessed = async (processedShipments) => {
  try {
    for (const shipment of processedShipments) {
      await warehouseStore.processShipment(shipment.id)
    }
    
    showBatchShippingDialog.value = false
    
    toast({
      title: 'Batch Processing Complete',
      description: `${processedShipments.length} shipments have been processed.`,
      variant: 'success'
    })
    
    await fetchShipments()
  } catch (error) {
    console.error('Error in batch processing:', error)
    toast({
      title: 'Error',
      description: 'Failed to complete batch processing. Some shipments may not have been processed.',
      variant: 'destructive'
    })
  }
}

const handleCarrierSettingsUpdated = async (carrier) => {
  try {
    await warehouseStore.updateShippingCarrier(carrier)
    showProviderSettingsDialog.value = false
    
    toast({
      title: 'Carrier Settings Updated',
      description: `Settings for ${carrier.name} have been updated.`,
      variant: 'success'
    })
    
    await fetchShippingCarriers()
  } catch (error) {
    console.error('Error updating carrier settings:', error)
    toast({
      title: 'Error',
      description: 'Failed to update carrier settings. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCarrierAdded = async (carrier) => {
  try {
    await warehouseStore.addShippingCarrier(carrier)
    showAddProviderDialog.value = false
    
    toast({
      title: 'Carrier Added',
      description: `${carrier.name} has been added to your shipping carriers.`,
      variant: 'success'
    })
    
    await fetchShippingCarriers()
  } catch (error) {
    console.error('Error adding carrier:', error)
    toast({
      title: 'Error',
      description: 'Failed to add shipping carrier. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchShipments()
  fetchShippingCarriers()
})
</script>