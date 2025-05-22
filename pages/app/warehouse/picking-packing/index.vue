#i<!-- filepath: c:\Users\user\Documents\pcash-inventory\pcash-inventory\pages\app\warehouse\picking-packing\index.vue -->
<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Picking & Packing</h2>
        <p class="text-muted-foreground">Manage picking tasks, optimize pick paths, and track packing operations</p>
      </div>
      <div class="flex items-center space-x-2">
        <!-- Tab navigation - only use this for switching the active tab -->
        <Tabs v-model="activeTab" class="w-[400px]">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="picking">Picking</TabsTrigger>
            <TabsTrigger value="packing">Packing</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <!-- Actions buttons -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Plus class="h-4 w-4 mr-2" />
              Create New
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openTaskCreationSheet('pick')">
              <ListTodo class="h-4 w-4 mr-2" />
              New Pick Task
            </DropdownMenuItem>
            <DropdownMenuItem @click="openTaskCreationSheet('pack')">
              <Package class="h-4 w-4 mr-2" />
              New Pack Task
            </DropdownMenuItem>
            <DropdownMenuItem @click="openPickPathWizard">
              <RouteIcon class="h-4 w-4 mr-2" />
              New Pick Path
            </DropdownMenuItem>
            <DropdownMenuItem @click="openBatchPickingWizard">
              <ClipboardList class="h-4 w-4 mr-2" />
              Start Batch Picking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openOptimizePickPathDialog">
          <RouteIcon class="h-4 w-4 mr-2" />
          Optimize Pick Paths
        </Button>
      </div>
    </div>

    <!-- Tab content - wrap each tab content in a div with v-show instead of using TabsContent -->
    <div class="mt-6">
      <div v-show="activeTab === 'picking'">
        <!-- Picking Tasks Table -->
        <PickingTasksTable
          :pickingTasks="pickingTasks"
          :pickPaths="pickPaths"
          :loading="isLoading"
          @view-task="openTaskDetails"
          @start-task="handleStartTask"
          @complete-task="openCompleteTaskDialog"
          @assign-task="openAssignTaskDialog"
          @optimize-path="openOptimizePickPathDialog"
          @refresh="fetchPickingTasks"
          @batch-pick="openBatchPickingWizard"
        />
      </div>
      
      <div v-show="activeTab === 'packing'" class="space-y-8">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin h-12 w-12 text-primary mb-4">
            <Loader2Icon />
          </div>
          <p class="text-muted-foreground">Loading packing data...</p>
        </div>

        <!-- Content when loaded -->
        <div v-else class="space-y-8 animate-in fade-in duration-300">
          <!-- Packing Tasks Section -->
          <div class="rounded-lg border border-border bg-card shadow-sm">
            <div class="p-4 border-b bg-muted/50">
              <h3 class="text-lg font-medium">Packing Tasks</h3>
              <p class="text-sm text-muted-foreground">
                Process and fulfill orders ready for shipping
              </p>
            </div>
            <div class="p-0">
              <PackingTasksTable
                :packingTasks="packingTasks || []"
                :packingStations="packingStations || []"
                :loading="isLoading"
                @view-task="openPackTaskDetails"
                @start-task="handleStartPackTask"
                @complete-task="openCompletePackTaskDialog"
                @assign-station="openAssignStationDialog"
                @print-label="handlePrintLabel"
                @refresh="fetchPackingTasks"
              />
            </div>
          </div>

          <!-- Packing Stations Section -->
          <div class="rounded-lg border border-border bg-card shadow-sm">
            <div class="p-4 border-b bg-muted/50">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium">Packing Stations</h3>
                  <p class="text-sm text-muted-foreground">
                    Manage and monitor packing stations in the warehouse
                  </p>
                </div>
                <Button variant="outline" size="sm" @click="fetchPackingStations">
                  <RefreshCwIcon class="h-4 w-4 mr-2" />
                  Refresh Stations
                </Button>
              </div>
            </div>
            <div class="p-4">
              <PackingStationsGrid
                :packingStations="packingStations || []"
                :packingTasks="packingTasks || []"
                @assign-task="openAssignStationDialog"
                @view-station="openStationDetails"
                @update-status="updateStationStatus"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Optimize Pick Path Dialog -->
    <Dialog v-model:open="showOptimizePickPathDialog">
      <OptimizePickPathDialog
        v-if="showOptimizePickPathDialog"
        :pickPaths="pickPaths || []"
        :pickingTasks="pickingTasks || []"
        @paths-optimized="handlePathsOptimized"
        @close="showOptimizePickPathDialog = false"
      />
    </Dialog>

    <!-- Task Creation Sheet -->
    <Sheet v-model:open="showTaskCreationSheet" position="right" size="lg">
      <TaskCreationSheet
        v-if="showTaskCreationSheet"
        :taskType="taskCreationType"
        :pickPaths="pickPaths"
        :packingStations="packingStations"
        @task-created="handleTaskCreated"
        @close="showTaskCreationSheet = false"
      />
    </Sheet>

    <!-- Pick Path Wizard -->
    <Sheet v-model:open="showPickPathWizard" position="right" size="lg">
      <PickPathWizard
        v-if="showPickPathWizard"
        @path-created="handlePickPathCreated"
        @close="showPickPathWizard = false"
      />
    </Sheet>

    <!-- Task Details Dialog -->
    <Dialog v-model:open="showTaskDetailsDialog">
      <PickTaskDetailsDialog
        v-if="showTaskDetailsDialog && selectedTask && taskType === 'pick'"
        :task="selectedTask"
        @start-task="handleStartTask"
        @complete-task="openCompleteTaskDialog"
        @assign-task="openAssignTaskDialog"
        @close="showTaskDetailsDialog = false"
      />
      
      <PackTaskDetailsDialog
        v-if="showTaskDetailsDialog && selectedTask && taskType === 'pack'"
        :task="selectedTask"
        @start-task="handleStartPackTask"
        @complete-task="openCompletePackTaskDialog"
        @assign-station="openAssignStationDialog"
        @close="showTaskDetailsDialog = false"
      />
    </Dialog>

    <!-- Complete Task Dialog -->
    <Dialog v-model:open="showCompleteTaskDialog">
      <CompletePickTaskDialog
        v-if="showCompleteTaskDialog && taskType === 'pick'"
        :task="selectedTask"
        @task-completed="handleTaskCompleted"
        @close="showCompleteTaskDialog = false"
      />
      
      <CompletePackTaskDialog
        v-if="showCompleteTaskDialog && taskType === 'pack'"
        :task="selectedTask"
        :packagingMaterials="packagingMaterials"
        :shippingCarriers="shippingCarriers"
        @task-completed="handlePackTaskCompleted"
        @shipping-rates="fetchShippingRates"
        @close="showCompleteTaskDialog = false"
      />
    </Dialog>

    <!-- Assign Task Dialog -->
    <Dialog v-model:open="showAssignTaskDialog">
      <AssignPickTaskDialog
        v-if="showAssignTaskDialog && taskType === 'pick'"
        :task="selectedTask"
        @task-assigned="handleTaskAssigned"
        @close="showAssignTaskDialog = false"
      />
    </Dialog>

    <!-- Assign Station Dialog -->
    <Dialog v-model:open="showAssignStationDialog">
      <AssignPackingStationDialog
        v-if="showAssignStationDialog"
        :task="selectedTask"
        :packingStations="packingStations"
        @station-assigned="handleStationAssigned"
        @close="showAssignStationDialog = false"
      />
    </Dialog>

    <!-- Batch Picking Wizard -->
    <Sheet v-model:open="showBatchPickingWizard" position="right" size="lg">
      <BatchPickingWizard
        v-if="showBatchPickingWizard"
        :pickingTasks="pendingPickTasks"
        :pickPaths="pickPaths"
        @batch-created="handleBatchCreated"
        @close="showBatchPickingWizard = false"
      />
    </Sheet>

    <!-- Station Details Dialog -->
    <Dialog v-model:open="showStationDetailsDialog">
      <PackingStationDetailsDialog
        v-if="showStationDetailsDialog"
        :station="selectedStation"
        :assignedTasks="getStationTasks(selectedStation?.id)"
        @update-status="updateStationStatus"
        @close="showStationDetailsDialog = false"
      />
    </Dialog>
    
    <!-- Print Label Dialog -->
    <Dialog v-model:open="showPrintLabelDialog">
      <PrintShippingLabelDialog
        v-if="showPrintLabelDialog"
        :task="selectedTask"
        :shippingCarriers="shippingCarriers"
        @label-printed="handleLabelPrinted"
        @close="showPrintLabelDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, ChevronDown, ClipboardList, Package, ListTodo, RouteIcon
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
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Components
import PickingTasksTable from '@/components/warehouse/picking/PickingTasksTable.vue'
import PackingTasksTable from '@/components/warehouse/packing/PackingTasksTable.vue'
import OptimizePickPathDialog from '@/components/warehouse/picking/OptimizePickPathDialog.vue'
import TaskCreationSheet from '@/components/warehouse/TaskCreationSheet.vue'
import PickPathWizard from '@/components/warehouse/picking/PickPathWizard.vue'
import PickTaskDetailsDialog from '@/components/warehouse/picking/PickTaskDetailsDialog.vue'
import PackTaskDetailsDialog from '@/components/warehouse/packing/PackTaskDetailsDialog.vue'
import CompletePickTaskDialog from '@/components/warehouse/picking/CompletePickTaskDialog.vue'
import CompletePackTaskDialog from '@/components/warehouse/packing/CompletePackTaskDialog.vue'
import AssignPickTaskDialog from '@/components/warehouse/picking/AssignPickTaskDialog.vue'
import AssignPackingStationDialog from '@/components/warehouse/packing/AssignPackingStationDialog.vue'
import BatchPickingWizard from '@/components/warehouse/picking/BatchPickingWizard.vue'
import PackingStationsGrid from '@/components/warehouse/packing/PackingStationsGrid.vue'
import PackingStationDetailsDialog from '@/components/warehouse/packing/PackingStationDetailsDialog.vue'
import PrintShippingLabelDialog from '@/components/warehouse/shipping/PrintShippingLabelDialog.vue'

// Stores
import { useWarehouseStore } from '@/store/modules/warehouse/warehouse'

// Initialize store
const warehouseStore = useWarehouseStore()
const { toast } = useToast()

// Access store state through computed properties
const pickingTasks = computed(() => warehouseStore.getPickingTasks)
const pendingPickTasks = computed(() => warehouseStore.getPendingPickTasks)
const packingTasks = computed(() => warehouseStore.getPackingTasks)
const packingStations = computed(() => warehouseStore.getPackingStations)
const packagingMaterials = computed(() => warehouseStore.getPackagingMaterials)
const pickPaths = computed(() => warehouseStore.getPickPaths)
const shippingCarriers = computed(() => warehouseStore.getShippingCarriers)
const isLoading = computed(() => warehouseStore.isLoading)
const error = computed(() => warehouseStore.error)

// State management
const selectedTask = ref(null)
const selectedStation = ref(null)
const taskType = ref('pick')
const taskCreationType = ref('pick')
const activeTab = ref('picking')

// UI control
const showOptimizePickPathDialog = ref(false)
const showTaskCreationSheet = ref(false)
const showPickPathWizard = ref(false)
const showTaskDetailsDialog = ref(false)
const showCompleteTaskDialog = ref(false)
const showAssignTaskDialog = ref(false)
const showAssignStationDialog = ref(false)
const showBatchPickingWizard = ref(false)
const showStationDetailsDialog = ref(false)
const showPrintLabelDialog = ref(false)

// Fetch data from APIs
const fetchPickingTasks = async () => {
  try {
    await warehouseStore.fetchPickingTasks()
  } catch (error) {
    console.error('Error fetching picking tasks:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchPackingTasks = async () => {
  try {
    await warehouseStore.fetchPackingTasks()
  } catch (error) {
    console.error('Error fetching packing tasks:', error)
    toast({
      title: 'Error',
      description: 'Failed to load packing tasks',
      variant: 'destructive'
    })
  }
}

const fetchPickPaths = async () => {
  try {
    await warehouseStore.fetchPickPaths()
  } catch (error) {
    console.error('Error fetching pick paths:', error)
    toast({
      title: 'Error',
      description: 'Failed to load pick paths',
      variant: 'destructive'
    })
  }
}

const fetchPackingStations = async () => {
  try {
    await warehouseStore.fetchPackingStations()
  } catch (error) {
    console.error('Error fetching packing stations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load packing stations',
      variant: 'destructive'
    })
  }
}

const fetchPackagingMaterials = async () => {
  try {
    await warehouseStore.fetchPackagingMaterials()
  } catch (error) {
    console.error('Error fetching packaging materials:', error)
    toast({
      title: 'Error',
      description: 'Failed to load packaging materials',
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
      description: 'Failed to load shipping carriers',
      variant: 'destructive'
    })
  }
}

const fetchShippingRates = async (packageData) => {
  try {
    return await warehouseStore.getShippingRates(packageData)
  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    toast({
      title: 'Error',
      description: 'Failed to load shipping rates',
      variant: 'destructive'
    })
    return { success: false, error: 'Failed to get shipping rates' }
  }
}

// Dialog and sheet handlers
const openOptimizePickPathDialog = () => {
  showOptimizePickPathDialog.value = true
}

const openTaskCreationSheet = (type) => {
  taskCreationType.value = type
  showTaskCreationSheet.value = true
}

const openPickPathWizard = () => {
  showPickPathWizard.value = true
}

const openTaskDetails = (task) => {
  selectedTask.value = task
  taskType.value = 'pick'
  showTaskDetailsDialog.value = true
}

const openPackTaskDetails = (task) => {
  selectedTask.value = task
  taskType.value = 'pack'
  showTaskDetailsDialog.value = true
}

const openCompleteTaskDialog = (task) => {
  selectedTask.value = task
  taskType.value = 'pick'
  showCompleteTaskDialog.value = true
}

const openCompletePackTaskDialog = (task) => {
  selectedTask.value = task
  taskType.value = 'pack'
  showCompleteTaskDialog.value = true
}

const openAssignTaskDialog = (task) => {
  selectedTask.value = task
  showAssignTaskDialog.value = true
}

const openAssignStationDialog = (task) => {
  selectedTask.value = task
  showAssignStationDialog.value = true
}

const openBatchPickingWizard = () => {
  showBatchPickingWizard.value = true
}

const openStationDetails = (station) => {
  selectedStation.value = station
  showStationDetailsDialog.value = true
}

const openPrintLabelDialog = (task) => {
  selectedTask.value = task
  showPrintLabelDialog.value = true
}

// Actions handlers
const handleStartTask = async (task) => {
  try {
    await warehouseStore.startPickTask(task.id)
    
    toast({
      title: 'Task Started',
      description: `Picking task #${task.id} has been started.`,
      variant: 'success'
    })
    
    await fetchPickingTasks()
  } catch (error) {
    console.error('Error starting task:', error)
    toast({
      title: 'Error',
      description: 'Failed to start picking task. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStartPackTask = async (task) => {
  try {
    await warehouseStore.startPackTask(task.id)
    
    toast({
      title: 'Task Started',
      description: `Packing task #${task.id} has been started.`,
      variant: 'success'
    })
    
    await fetchPackingTasks()
  } catch (error) {
    console.error('Error starting task:', error)
    toast({
      title: 'Error',
      description: 'Failed to start packing task. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTaskCompleted = async (task, completionData) => {
  try {
    await warehouseStore.completePickTask(task.id, completionData)
    showCompleteTaskDialog.value = false
    
    toast({
      title: 'Task Completed',
      description: `Picking task #${task.id} has been completed.`,
      variant: 'success'
    })
    
    await fetchPickingTasks()
    await fetchPackingTasks() // Refresh packing tasks in case a new one was created
  } catch (error) {
    console.error('Error completing task:', error)
    toast({
      title: 'Error',
      description: 'Failed to complete picking task. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePackTaskCompleted = async (task, completionData) => {
  try {
    await warehouseStore.completePackingTask(task.id, completionData)
    showCompleteTaskDialog.value = false
    
    toast({
      title: 'Task Completed',
      description: `Packing task #${task.id} has been completed.`,
      variant: 'success'
    })
    
    await fetchPackingTasks()
  } catch (error) {
    console.error('Error completing task:', error)
    toast({
      title: 'Error',
      description: 'Failed to complete packing task. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTaskAssigned = async (task, assigneeId) => {
  try {
    await warehouseStore.assignPickTask(task.id, assigneeId)
    showAssignTaskDialog.value = false
    
    toast({
      title: 'Task Assigned',
      description: `Picking task has been assigned successfully.`,
      variant: 'success'
    })
    
    await fetchPickingTasks()
  } catch (error) {
    console.error('Error assigning task:', error)
    toast({
      title: 'Error',
      description: 'Failed to assign picking task. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleStationAssigned = async (task, stationId) => {
  try {
    await warehouseStore.assignPackTask(task.id, stationId)
    showAssignStationDialog.value = false
    
    toast({
      title: 'Station Assigned',
      description: `Packing task has been assigned to station successfully.`,
      variant: 'success'
    })
    
    await fetchPackingTasks()
  } catch (error) {
    console.error('Error assigning station:', error)
    toast({
      title: 'Error',
      description: 'Failed to assign packing station. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePathsOptimized = async (optimizedPaths) => {
  try {
    // Assuming the store has a method to update multiple paths
    for (const path of optimizedPaths) {
      await warehouseStore.updatePickPath(path.id, path)
    }
    
    showOptimizePickPathDialog.value = false
    
    toast({
      title: 'Pick Paths Optimized',
      description: `${optimizedPaths.length} pick paths have been optimized.`,
      variant: 'success'
    })
    
    await fetchPickPaths()
  } catch (error) {
    console.error('Error optimizing paths:', error)
    toast({
      title: 'Error',
      description: 'Failed to optimize pick paths. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePickPathCreated = async (newPath) => {
  try {
    await warehouseStore.createPickPath(newPath)
    showPickPathWizard.value = false
    
    toast({
      title: 'Pick Path Created',
      description: `${newPath.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchPickPaths()
  } catch (error) {
    console.error('Error creating pick path:', error)
    toast({
      title: 'Error',
      description: 'Failed to create pick path. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleTaskCreated = async (newTask) => {
  try {
    if (taskCreationType.value === 'pick') {
      await warehouseStore.createPickTask(newTask)
      toast({
        title: 'Picking Task Created',
        description: `New picking task has been created successfully.`,
        variant: 'success'
      })
      await fetchPickingTasks()
    } else {
      await warehouseStore.createPackTask(newTask)
      toast({
        title: 'Packing Task Created',
        description: `New packing task has been created successfully.`,
        variant: 'success'
      })
      await fetchPackingTasks()
    }
    
    showTaskCreationSheet.value = false
  } catch (error) {
    console.error('Error creating task:', error)
    toast({
      title: 'Error',
      description: `Failed to create ${taskCreationType.value} task. Please try again.`,
      variant: 'destructive'
    })
  }
}

const handleBatchCreated = async (batchConfig) => {
  try {
    // This could involve creating a batch picking session or
    // updating multiple picking tasks to be part of a batch
    await warehouseStore.createBatchPickSession(batchConfig)
    showBatchPickingWizard.value = false
    
    toast({
      title: 'Batch Picking Started',
      description: `Batch picking session has been created for ${batchConfig.taskIds.length} tasks.`,
      variant: 'success'
    })
    
    await fetchPickingTasks()
  } catch (error) {
    console.error('Error creating batch picking session:', error)
    toast({
      title: 'Error',
      description: 'Failed to create batch picking session. Please try again.',
      variant: 'destructive'
    })
  }
}

const updateStationStatus = async (stationId, status) => {
  try {
    await warehouseStore.updatePackingStationStatus(stationId, status)
    
    if (showStationDetailsDialog.value) {
      showStationDetailsDialog.value = false
    }
    
    toast({
      title: 'Station Updated',
      description: `Packing station status changed to ${status}.`,
      variant: 'success'
    })
    
    await fetchPackingStations()
  } catch (error) {
    console.error('Error updating station status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update packing station status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePrintLabel = (task) => {
  openPrintLabelDialog(task)
}

const handleLabelPrinted = async (task, packageId, shippingData) => {
  try {
    await warehouseStore.createShippingLabel(task.id, packageId, shippingData)
    showPrintLabelDialog.value = false
    
    toast({
      title: 'Label Printed',
      description: `Shipping label has been created and printed.`,
      variant: 'success'
    })
    
    await fetchPackingTasks()
  } catch (error) {
    console.error('Error printing shipping label:', error)
    toast({
      title: 'Error',
      description: 'Failed to create and print shipping label. Please try again.',
      variant: 'destructive'
    })
  }
}

// Helper functions
const getStationTasks = (stationId) => {
  if (!stationId) return []
  return packingTasks.value.filter(task => task.assignedStation === stationId)
}

// Initialize component
onMounted(() => {
  warehouseStore.initialize()
  fetchPickingTasks()
  fetchPackingTasks()
  fetchPickPaths()
  fetchPackingStations()
  fetchPackagingMaterials()
  fetchShippingCarriers()
})
</script>