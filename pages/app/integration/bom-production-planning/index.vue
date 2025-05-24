<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">BOM & Production Planning</h2>
        <p class="text-muted-foreground">Connect inventory to manufacturing BOMs and work orders</p>
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
            <DropdownMenuItem @click="openImportSheet('bom')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Import BOMs
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('workorder')">
              <ClipboardList class="h-4 w-4 mr-2" />
              Import Work Orders
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('erp')">
              <Webhook class="h-4 w-4 mr-2" />
              Connect ERP/MES
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openBomWizard">
          <PlusIcon class="h-4 w-4 mr-2" />
          New BOM
        </Button>
        <Button variant="default" @click="openWorkOrderCreation">
          <ClipboardPlus class="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Active BOMs</CardTitle>
          <CardDescription>
            Bill of Materials ready for production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-4">
            <div class="bg-primary/10 p-3 rounded-full">
              <Layers class="h-6 w-6 text-primary" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ activeBoms }}</div>
              <div class="text-xs text-muted-foreground">
                {{ bomComponents }} total components mapped
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>
            Production orders in process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-4">
            <div class="bg-primary/10 p-3 rounded-full">
              <ClipboardCheck class="h-6 w-6 text-primary" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ activeWorkOrders }}</div>
              <div class="text-xs text-muted-foreground">
                {{ completedWorkOrders }} completed this month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Inventory Allocation</CardTitle>
          <CardDescription>
            Components reserved for production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center space-x-4">
            <div class="bg-primary/10 p-3 rounded-full">
              <PackageCheck class="h-6 w-6 text-primary" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ allocatedItems }}</div>
              <div class="text-xs text-muted-foreground">
                {{ lowStockItems }} items with low stock warnings
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Tabs -->
    <Tabs defaultValue="boms" class="w-full">
      <TabsList>
        <TabsTrigger value="boms">Bills of Materials</TabsTrigger>
        <TabsTrigger value="workorders">Work Orders</TabsTrigger>
        <TabsTrigger value="planning">Production Planning</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <!-- BOMs Tab -->
      <TabsContent value="boms">
        <BomsTable
          :boms="boms"
          :loading="isLoadingBoms"
          @view-bom="openBomDetails"
          @edit-bom="openBomEditor"
          @delete-bom="openDeleteBomDialog"
          @create-work-order="createWorkOrderFromBom"
          @refresh="fetchBoms"
        />
      </TabsContent>

      <!-- Work Orders Tab -->
      <TabsContent value="workorders">
        <WorkOrdersTable
          :workOrders="workOrders"
          :loading="isLoadingWorkOrders"
          @view-work-order="openWorkOrderDetails"
          @edit-work-order="openWorkOrderEditor"
          @delete-work-order="openDeleteWorkOrderDialog"
          @update-status="openUpdateStatusDialog"
          @refresh="fetchWorkOrders"
        />
      </TabsContent>

      <!-- Production Planning Tab -->
      <TabsContent value="planning">
        <Card>
          <CardHeader>
            <div class="flex justify-between items-center">
              <div>
                <CardTitle>Production Schedule</CardTitle>
                <CardDescription>
                  Plan and optimize production capacity
                </CardDescription>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Calendar class="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="isLoadingPlanning" class="py-8 flex justify-center">
              <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <div v-else-if="productionSchedule.length === 0" class="py-12 text-center">
              <Factory class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 class="text-lg font-medium">No Production Schedule</h3>
              <p class="text-sm text-muted-foreground mt-2 mb-4">
                Create work orders to start planning your production
              </p>
              <Button @click="openWorkOrderCreation">
                <PlusIcon class="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
            </div>
            <div v-else>
              <!-- Production Schedule would go here -->
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Analytics Tab -->
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <div class="flex justify-between items-center">
              <div>
                <CardTitle>Production Analytics</CardTitle>
                <CardDescription>
                  Insights into manufacturing efficiency
                </CardDescription>
              </div>
              <div>
                <Select v-model="timeRange">
                  <SelectTrigger class="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last quarter</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="isLoadingAnalytics" class="py-8 flex justify-center">
              <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <div v-else>
              <!-- Analytics charts would go here -->
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- BOM Wizard Dialog -->
    <Sheet v-model:open="showBomWizard" position="right" size="lg">
      <BomCreationWizard
        v-if="showBomWizard"
        :products="products"
        :components="inventory"
        @bom-created="handleBomCreated"
        @close="showBomWizard = false"
      />
    </Sheet>

    <!-- BOM Details Dialog -->
    <Dialog v-model:open="showBomDetailsDialog">
      <BomDetailsDialog
        v-if="showBomDetailsDialog"
        :bom="selectedBom"
        @edit-bom="openBomEditor"
        @close="showBomDetailsDialog = false"
      />
    </Dialog>

    <!-- BOM Editor Sheet -->
    <Sheet v-model:open="showBomEditorSheet" position="right" size="lg">
      <BomEditorSheet
        v-if="showBomEditorSheet"
        :bom="selectedBom"
        :products="products"
        :components="inventory"
        @bom-updated="handleBomUpdated"
        @close="showBomEditorSheet = false"
      />
    </Sheet>

    <!-- Delete BOM Dialog -->
<Dialog v-model:open="showDeleteBomDialog">
  <DeleteBomDialog
    v-if="showDeleteBomDialog"
    :open="showDeleteBomDialog"
    :bom="selectedBom"
    @delete="handleBomDeleted"
    @close="showDeleteBomDialog = false"
    @update:open="showDeleteBomDialog = $event"
  />
</Dialog>
    <!-- Work Order Creation Sheet -->
    <Sheet v-model:open="showWorkOrderCreationSheet" position="right" size="lg">
  <WorkOrderCreationSheet
    v-if="showWorkOrderCreationSheet"
    :open="showWorkOrderCreationSheet"
    :bom="selectedBom"
    :boms="boms"
    @work-order-created="handleWorkOrderCreated"
    @update:open="showWorkOrderCreationSheet = $event"
  />
</Sheet>
    <!-- Work Order Details Dialog -->
    <Dialog v-model:open="showWorkOrderDetailsDialog">
  <WorkOrderDetailsDialog
    v-if="showWorkOrderDetailsDialog"
    :open="showWorkOrderDetailsDialog"
    :workOrder="selectedWorkOrder"
    @edit-work-order="openWorkOrderEditor"
    @update:open="showWorkOrderDetailsDialog = $event"
  />
</Dialog>

    <!-- Work Order Editor Sheet -->
    <Sheet v-model:open="showWorkOrderEditorSheet" position="right" size="lg">
  <WorkOrderEditorSheet
    v-if="showWorkOrderEditorSheet"
    :open="showWorkOrderEditorSheet"
    :workOrder="selectedWorkOrder"
    :boms="boms"
    @work-order-updated="handleWorkOrderUpdated"
    @update:open="showWorkOrderEditorSheet = $event"
  />
</Sheet>

    <!-- Delete Work Order Dialog -->
    <Dialog v-model:open="showDeleteWorkOrderDialog">
      <DeleteWorkOrderDialog
        v-if="showDeleteWorkOrderDialog"
        :workOrder="selectedWorkOrder"
        @delete="handleWorkOrderDeleted"
        @close="showDeleteWorkOrderDialog = false"
      />
    </Dialog>

    <!-- Update Work Order Status Dialog -->
    <Dialog v-model:open="showUpdateStatusDialog">
      <UpdateWorkOrderStatusDialog
        v-if="showUpdateStatusDialog"
        :workOrder="selectedWorkOrder"
        @status-updated="handleStatusUpdated"
        @close="showUpdateStatusDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <ManufacturingImportSheet
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
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet,
  Layers, ClipboardCheck, ClipboardPlus, ClipboardList,
  Webhook, PackageCheck, Loader2, Factory, Calendar,
  Eye, Pencil
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

// Components
import BomsTable from '@/components/integration/bom/BomsTable.vue'
import WorkOrdersTable from '@/components/integration/workorder/WorkOrdersTable.vue'
import BomCreationWizard from '@/components/integration/bom/BomCreationWizard.vue'
import BomDetailsDialog from '@/components/integration/bom/BomDetailsDialog.vue'
import BomEditorSheet from '@/components/integration/bom/BomEditorSheet.vue'
import DeleteBomDialog from '@/components/integration/bom/DeleteBomDialog.vue'
import WorkOrderCreationSheet from '@/components/integration/workorder/WorkOrderCreationSheet.vue'
import WorkOrderDetailsDialog from '@/components/integration/workorder/WorkOrderDetailsDialog.vue'
import WorkOrderEditorSheet from '@/components/integration/workorder/WorkOrderEditorSheet.vue'
import DeleteWorkOrderDialog from '@/components/integration/workorder/DeleteWorkOrderDialog.vue'
import UpdateWorkOrderStatusDialog from '@/components/integration/workorder/UpdateWorkOrderStatusDialog.vue'
import ManufacturingImportSheet from '@/components/integration/ManufacturingImportSheet.vue'

// Stores
import { useBomsStore } from '@/store/modules/integration/bom'
import { useWorkOrdersStore } from '@/store/modules/integration/workOrders'
import { useProductsStore } from '@/store/modules/catalog/products'
import { useInventoryStore } from '@/store/modules/inventory/items'

// Initialize stores
const bomsStore = useBomsStore()
const workOrdersStore = useWorkOrdersStore()
const productsStore = useProductsStore()
const inventoryStore = useInventoryStore()
const { toast } = useToast()

// Access store state through computed properties
const boms = computed(() => bomsStore.getBoms)
const workOrders = computed(() => workOrdersStore.getWorkOrders)
const products = computed(() => productsStore.getProducts)
const inventory = computed(() => inventoryStore.getInventoryItems)
const isLoadingBoms = computed(() => bomsStore.getIsLoading)
const isLoadingWorkOrders = computed(() => workOrdersStore.getIsLoading)

// Dashboard stats
const activeBoms = computed(() => boms.value?.filter(bom => bom.status === 'active').length || 0)
const bomComponents = computed(() => {
  let count = 0
  if (boms.value) {
    boms.value.forEach(bom => {
      count += bom.components?.length || 0
    })
  }
  return count
})
const activeWorkOrders = computed(() => workOrders.value?.filter(wo => wo.status === 'in_progress').length || 0)
const completedWorkOrders = computed(() => workOrders.value?.filter(wo => wo.status === 'completed' && 
  new Date(wo.completedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0)
const allocatedItems = computed(() => {
  let count = 0
  if (workOrders.value) {
    workOrders.value.forEach(wo => {
      if (wo.status === 'planned' || wo.status === 'in_progress') {
        wo.materials?.forEach(material => {
          count += material.allocated || 0
        })
      }
    })
  }
  return count
})
const lowStockItems = computed(() => {
  if (!inventory.value) return 0
  return inventory.value.filter(item => item.stock < item.minStock).length
})

// State management
const selectedBom = ref(null)
const selectedWorkOrder = ref(null)
const isLoadingPlanning = ref(false)
const isLoadingAnalytics = ref(false)
const timeRange = ref('30d')
const productionSchedule = ref([])

// UI control
const showBomWizard = ref(false)
const showBomDetailsDialog = ref(false)
const showBomEditorSheet = ref(false)
const showDeleteBomDialog = ref(false)
const showWorkOrderCreationSheet = ref(false)
const showWorkOrderDetailsDialog = ref(false)
const showWorkOrderEditorSheet = ref(false)
const showDeleteWorkOrderDialog = ref(false)
const showUpdateStatusDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('bom')

// Fetch data from APIs
const fetchBoms = async () => {
  try {
    await bomsStore.fetchBoms()
  } catch (error) {
    console.error('Error fetching BOMs:', error)
    toast({
      title: 'Error',
      description: 'Failed to load Bills of Materials',
      variant: 'destructive'
    })
  }
}

const fetchWorkOrders = async () => {
  try {
    await workOrdersStore.fetchWorkOrders()
  } catch (error) {
    console.error('Error fetching work orders:', error)
    toast({
      title: 'Error',
      description: 'Failed to load work orders',
      variant: 'destructive'
    })
  }
}

const fetchProductionSchedule = async () => {
  isLoadingPlanning.value = true
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    productionSchedule.value = []
  } catch (error) {
    console.error('Error fetching production schedule:', error)
    toast({
      title: 'Error',
      description: 'Failed to load production schedule',
      variant: 'destructive'
    })
  } finally {
    isLoadingPlanning.value = false
  }
}

// Dialog and sheet handlers
const openBomWizard = () => {
  showBomWizard.value = true
}

const openBomDetails = (bom) => {
  selectedBom.value = bom
  showBomDetailsDialog.value = true
}

const openBomEditor = (bom) => {
  selectedBom.value = bom
  showBomEditorSheet.value = true
}

const openDeleteBomDialog = (bom) => {
  selectedBom.value = bom
  showDeleteBomDialog.value = true
}

const openWorkOrderCreation = (bom = null) => {
  selectedBom.value = bom
  showWorkOrderCreationSheet.value = true
}

const createWorkOrderFromBom = (bom) => {
  selectedBom.value = bom
  showWorkOrderCreationSheet.value = true
}

const openWorkOrderDetails = (workOrder) => {
  selectedWorkOrder.value = workOrder
  showWorkOrderDetailsDialog.value = true
}

const openWorkOrderEditor = (workOrder) => {
  selectedWorkOrder.value = workOrder
  showWorkOrderEditorSheet.value = true
}

const openDeleteWorkOrderDialog = (workOrder) => {
  selectedWorkOrder.value = workOrder
  showDeleteWorkOrderDialog.value = true
}

const openUpdateStatusDialog = (workOrder) => {
  selectedWorkOrder.value = workOrder
  showUpdateStatusDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// Format helpers
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
}

// Helper functions for status badge variants
const getBomStatusVariant = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'draft': return 'secondary'
    case 'archived': return 'outline'
    default: return 'default'
  }
}

const getWorkOrderStatusVariant = (status) => {
  switch (status) {
    case 'planned': return 'secondary'
    case 'in_progress': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}

const getMaterialStatusVariant = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'partial': return 'warning'
    case 'unavailable': return 'destructive'
    default: return 'default'
  }
}

const formatWorkOrderStatus = (status) => {
  switch (status) {
    case 'in_progress': return 'In Progress'
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

const formatMaterialStatus = (status) => {
  switch (status) {
    case 'available': return 'Available'
    case 'partial': return 'Partial'
    case 'unavailable': return 'Unavailable'
    default: return status
  }
}

// CRUD operation handlers
const handleBomCreated = async (newBom) => {
  try {
    await bomsStore.createBom(newBom)
    showBomWizard.value = false
    
    toast({
      title: 'BOM Created',
      description: `${newBom.name || 'BOM'} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchBoms()
  } catch (error) {
    console.error('Error creating BOM:', error)
    toast({
      title: 'Error',
      description: 'Failed to create BOM. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBomUpdated = async (updatedBom) => {
  try {
    await bomsStore.updateBom(updatedBom)
    showBomEditorSheet.value = false
    
    toast({
      title: 'BOM Updated',
      description: `${updatedBom.name || 'BOM'} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchBoms()
  } catch (error) {
    console.error('Error updating BOM:', error)
    toast({
      title: 'Error',
      description: 'Failed to update BOM. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBomDeleted = async (bom) => {
  try {
    await bomsStore.deleteBom(bom.id)
    showDeleteBomDialog.value = false
    
    toast({
      title: 'BOM Deleted',
      description: `${bom.name || 'BOM'} has been deleted.`,
      variant: 'success'
    })
    
    await fetchBoms()
  } catch (error) {
    console.error('Error deleting BOM:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete BOM. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleWorkOrderCreated = async (newWorkOrder) => {
  try {
    await workOrdersStore.createWorkOrder(newWorkOrder)
    showWorkOrderCreationSheet.value = false
    
    toast({
      title: 'Work Order Created',
      description: `Work Order #${newWorkOrder.id || ''} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchWorkOrders()
  } catch (error) {
    console.error('Error creating work order:', error)
    toast({
      title: 'Error',
      description: 'Failed to create work order. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleWorkOrderUpdated = async (updatedWorkOrder) => {
  try {
    await workOrdersStore.updateWorkOrder(updatedWorkOrder)
    showWorkOrderEditorSheet.value = false
    
    toast({
      title: 'Work Order Updated',
      description: `Work Order #${updatedWorkOrder.id || ''} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchWorkOrders()
  } catch (error) {
    console.error('Error updating work order:', error)
    toast({
      title: 'Error',
      description: 'Failed to update work order. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleWorkOrderDeleted = async (workOrder) => {
  try {
    await workOrdersStore.deleteWorkOrder(workOrder.id)
    showDeleteWorkOrderDialog.value = false
    
    toast({
      title: 'Work Order Deleted',
      description: `Work Order #${workOrder.id || ''} has been deleted.`,
      variant: 'success'
    })
    
    await fetchWorkOrders()
  } catch (error) {
    console.error('Error deleting work order:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete work order. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStatusUpdated = async ({ workOrder, status, notes }) => {
  try {
    await workOrdersStore.updateWorkOrderStatus(workOrder.id, status, notes)
    showUpdateStatusDialog.value = false
    
    toast({
      title: 'Status Updated',
      description: `Work Order status changed to ${formatWorkOrderStatus(status)}.`,
      variant: 'success'
    })
    
    await fetchWorkOrders()
  } catch (error) {
    console.error('Error updating work order status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update work order status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    const entityType = importType.value === 'bom' ? 'BOMs' : 
                        importType.value === 'workorder' ? 'work orders' : 
                        'integration settings'
    
    toast({
      title: 'Import Complete',
      description: `${result.count} ${entityType} have been imported successfully.`,
      variant: 'success'
    })
    
    if (importType.value === 'bom') {
      await fetchBoms()
    } else if (importType.value === 'workorder') {
      await fetchWorkOrders()
    }
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import data. Please try again.',
      variant: 'destructive'
    })
  }
}

// Watch time range changes
watch(timeRange, async () => {
  isLoadingAnalytics.value = true
  try {
    // In a real app, this would fetch analytics data for the selected time range
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error fetching analytics:', error)
  } finally {
    isLoadingAnalytics.value = false
  }
})

// Initialize component
onMounted(() => {
  fetchBoms()
  fetchWorkOrders()
  fetchProductionSchedule()
})
</script>