<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Sync Schedules</h2>
        <p class="text-muted-foreground">Configure when and how inventory data syncs with your product catalog</p>
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
        <Button @click="openCreateScheduleDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Sync Schedule
        </Button>
      </div>
    </div>

    <!-- Performance Dashboard -->
    <Card>
      <CardHeader>
        <CardTitle>Sync Performance</CardTitle>
        <CardDescription>
          Monitor and optimize your sync operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-muted rounded-lg p-4">
            <div class="text-sm font-medium mb-2">Active Schedules</div>
            <div class="flex justify-between items-center">
              <div class="text-2xl font-bold">{{ activeSchedulesCount }}</div>
              <Badge variant="outline">{{ percentageActive }}% of total</Badge>
            </div>
          </div>
          <div class="bg-muted rounded-lg p-4">
            <div class="text-sm font-medium mb-2">Average Sync Time</div>
            <div class="flex justify-between items-center">
              <div class="text-2xl font-bold">1.3s</div>
              <Badge variant="outline" class="text-green-500">-12% from last week</Badge>
            </div>
          </div>
          <div class="bg-muted rounded-lg p-4">
            <div class="text-sm font-medium mb-2">Sync Distribution</div>
            <div class="flex items-center space-x-2">
              <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full" :style="{ width: `${realTimePercentage}%` }"></div>
              </div>
              <span class="text-xs text-muted-foreground whitespace-nowrap">
                {{ realTimePercentage }}% real-time
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sync Strategy Settings -->
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Sync Strategy</CardTitle>
        <CardDescription>
          Balance between real-time updates and system performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <div class="space-y-1.5">
            <Label for="syncStrategy">Global Sync Strategy</Label>
            <Select v-model="syncStrategy">
              <SelectTrigger id="syncStrategy" class="w-[250px]">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
                <SelectItem value="high">High Frequency (5 min)</SelectItem>
                <SelectItem value="medium">Medium Frequency (15 min)</SelectItem>
                <SelectItem value="low">Low Frequency (Hourly)</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Applies to all sync operations without specific overrides
            </p>
          </div>
          
          <Separator orientation="vertical" class="h-14 hidden md:block" />
          
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Switch id="optimizePerformance" v-model="optimizeForPerformance" />
              <div>
                <Label for="optimizePerformance">Optimize for Performance</Label>
                <p class="text-xs text-muted-foreground">
                  Prioritize system performance over real-time updates
                </p>
              </div>
            </div>
          </div>
          
          <Separator orientation="vertical" class="h-14 hidden md:block" />
          
          <div class="space-y-1.5">
            <div class="text-sm font-medium">Peak Hours Protection</div>
            <div class="flex items-center space-x-2">
              <Switch id="reducePeakSync" v-model="reducePeakSync" />
              <div>
                <Label for="reducePeakSync">Reduce sync frequency during peak hours</Label>
                <p class="text-xs text-muted-foreground">
                  {{ reducePeakSync ? 'Enabled' : 'Disabled' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sync Schedules Table -->
    <SyncSchedulesTable
      :schedules="filteredSchedules"
      :loading="isLoading"
      @view-schedule="openScheduleDetailsDialog"
      @edit-schedule="openEditScheduleDialog"
      @duplicate-schedule="handleDuplicateSchedule"
      @delete-schedule="openDeleteScheduleDialog"
      @toggle-status="toggleScheduleStatus"
      @refresh="fetchSchedules"
      @bulk-edit="openBulkEditDialog"
      @bulk-delete="openBulkDeleteDialog"
    />

    <!-- Create Schedule Dialog -->
    <Dialog v-model:open="showCreateScheduleDialog">
      <CreateSyncScheduleDialog
        v-if="showCreateScheduleDialog"
        @schedule-created="handleScheduleCreated"
        @close="showCreateScheduleDialog = false"
      />
    </Dialog>

    <!-- View Schedule Details Dialog -->
    <Dialog v-model:open="showScheduleDetailsDialog">
      <SyncScheduleDetailsDialog
        v-if="showScheduleDetailsDialog"
        :schedule="selectedSchedule"
        @edit-schedule="openEditScheduleDialog"
        @close="showScheduleDetailsDialog = false"
      />
    </Dialog>

    <!-- Edit Schedule Dialog -->
    <Dialog v-model:open="showEditScheduleDialog">
      <EditSyncScheduleDialog
        v-if="showEditScheduleDialog"
        :schedule="selectedSchedule"
        @schedule-updated="handleScheduleUpdated"
        @close="showEditScheduleDialog = false"
      />
    </Dialog>

    <!-- Delete Schedule Dialog -->
    <Dialog v-model:open="showDeleteScheduleDialog">
      <DeleteSyncScheduleDialog
        v-if="showDeleteScheduleDialog"
        :schedule="selectedSchedule"
        @delete-confirmed="handleScheduleDeleted"
        @close="showDeleteScheduleDialog = false"
      />
    </Dialog>

    <!-- Bulk Edit Dialog -->
    <Dialog v-model:open="showBulkEditDialog" class="sm:max-w-[900px]">
      <BulkEditSyncSchedulesDialog
        v-if="showBulkEditDialog"
        :schedules="selectedBulkSchedules"
        @update-confirmed="handleBulkUpdate"
        @close="showBulkEditDialog = false"
      />
    </Dialog>

    <!-- Import Sheet -->
    <Sheet v-model:open="showImportSheet" position="right">
      <SyncSchedulesImportSheet
        v-if="showImportSheet"
        :importType="importType"
        @import-complete="handleImportComplete"
        @close="showImportSheet = false"
      />
    </Sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet,
  Table2, Clock, Bell, Database 
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'

// Components
import SyncSchedulesTable from '@/components/rules/sync-schedules/SyncSchedulesTable.vue'
import CreateSyncScheduleDialog from '@/components/rules/sync-schedules/CreateSyncScheduleDialog.vue'
import SyncScheduleDetailsDialog from '@/components/rules/sync-schedules/SyncScheduleDetailsDialog.vue'
import EditSyncScheduleDialog from '@/components/rules/sync-schedules/EditSyncScheduleDialog.vue'
import DeleteSyncScheduleDialog from '@/components/rules/sync-schedules/DeleteSyncScheduleDialog.vue'
import BulkEditSyncSchedulesDialog from '@/components/rules/sync-schedules/BulkEditSyncSchedulesDialog.vue'
import SyncSchedulesImportSheet from '@/components/rules/sync-schedules/SyncSchedulesImportSheet.vue'

// Store
import { useInventorySyncStore } from '@/store/modules/rules/sync'
import { useProductsStore } from '@/store/modules/catalog/products'

// Initialize stores
const syncSchedulesStore = useInventorySyncStore()
const productsStore = useProductsStore()
const { toast } = useToast()

// Access store state through computed properties
const schedules = computed(() => syncSchedulesStore.getSchedules)
const products = computed(() => productsStore.getProducts)
const isLoading = computed(() => syncSchedulesStore.getIsLoading)
const error = computed(() => syncSchedulesStore.getError)

// State management
const selectedSchedule = ref(null)
const selectedBulkSchedules = ref([])
const syncStrategy = ref('medium')
const optimizeForPerformance = ref(false)
const reducePeakSync = ref(true)
const usingMockData = ref(true)

// UI control
const showCreateScheduleDialog = ref(false)
const showScheduleDetailsDialog = ref(false)
const showEditScheduleDialog = ref(false)
const showDeleteScheduleDialog = ref(false)
const showBulkEditDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Computed stats for dashboard
const activeSchedulesCount = computed(() => {
  return schedules.value?.filter(schedule => schedule.active)?.length || 0
})

const percentageActive = computed(() => {
  if (!schedules.value || schedules.value.length === 0) return 0
  return Math.round((activeSchedulesCount.value / schedules.value.length) * 100)
})

const realTimePercentage = computed(() => {
  if (!schedules.value || schedules.value.length === 0) return 0
  const realTimeSchedules = schedules.value.filter(schedule => schedule.type === 'realtime')
  return Math.round((realTimeSchedules.length / schedules.value.length) * 100)
})

// Filter schedules based on optimization settings
const filteredSchedules = computed(() => {
  if (!schedules.value) return []
  
  if (!optimizeForPerformance.value) {
    return schedules.value
  }
  
  // When optimizing for performance, suggest batch sync for real-time schedules
  return schedules.value.map(schedule => {
    if (schedule.type === 'realtime' && !schedule.optimizationReviewed) {
      return {
        ...schedule,
        optimizationSuggested: true,
        optimizationMessage: 'Consider changing to scheduled sync for better performance'
      }
    }
    return schedule
  })
})

// Watch for changes in sync strategy
watch(syncStrategy, (newStrategy) => {
  if (newStrategy === 'realtime') {
    toast({
      title: 'Real-time Sync Enabled',
      description: 'All eligible items will sync immediately when inventory changes.',
      variant: 'default'
    })
  } else if (newStrategy === 'manual') {
    toast({
      title: 'Manual Sync Enabled',
      description: 'Sync operations will only occur when manually triggered.',
      variant: 'warning'
    })
  } else {
    const frequencyMap = {
      high: '5 minutes',
      medium: '15 minutes',
      low: '60 minutes'
    }
    
    toast({
      title: 'Scheduled Sync Enabled',
      description: `Sync operations will run every ${frequencyMap[newStrategy]}.`,
      variant: 'default'
    })
  }
})

// Fetch data from API
const fetchSchedules = async () => {
  try {
    await syncSchedulesStore.fetchSyncSchedules()
  } catch (error) {
    console.error('Error fetching sync schedules:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openCreateScheduleDialog = () => {
  showCreateScheduleDialog.value = true
}

const openScheduleDetailsDialog = (schedule) => {
  selectedSchedule.value = schedule
  showScheduleDetailsDialog.value = true
}

const openEditScheduleDialog = (schedule) => {
  selectedSchedule.value = schedule
  showEditScheduleDialog.value = true
}

const openDeleteScheduleDialog = (schedule) => {
  selectedSchedule.value = schedule
  showDeleteScheduleDialog.value = true
}

const openBulkEditDialog = (schedules) => {
  selectedBulkSchedules.value = schedules
  showBulkEditDialog.value = true
}

const openBulkDeleteDialog = (schedules) => {
  if (confirm(`Are you sure you want to delete ${schedules.length} schedules? This action cannot be undone.`)) {
    handleBulkDelete(schedules)
  }
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleScheduleCreated = async (newSchedule) => {
  try {
    await syncSchedulesStore.createSyncSchedule(newSchedule)
    showCreateScheduleDialog.value = false
    
    toast({
      title: 'Sync Schedule Created',
      description: `${newSchedule.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error creating sync schedule:', error)
    toast({
      title: 'Error',
      description: 'Failed to create sync schedule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleScheduleUpdated = async (updatedSchedule) => {
  try {
    await syncSchedulesStore.updateSyncSchedule(updatedSchedule)
    showEditScheduleDialog.value = false
    
    toast({
      title: 'Sync Schedule Updated',
      description: `${updatedSchedule.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error updating sync schedule:', error)
    toast({
      title: 'Error',
      description: 'Failed to update sync schedule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleScheduleDeleted = async (schedule) => {
  try {
    await syncSchedulesStore.deleteSyncSchedule(schedule.id)
    showDeleteScheduleDialog.value = false
    
    toast({
      title: 'Sync Schedule Deleted',
      description: `${schedule.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error deleting sync schedule:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete sync schedule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDuplicateSchedule = async (schedule) => {
  try {
    await syncSchedulesStore.duplicateSyncSchedule(schedule.id)
    
    toast({
      title: 'Sync Schedule Duplicated',
      description: `A copy of ${schedule.name} has been created.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error duplicating sync schedule:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate sync schedule. Please try again.',
      variant: 'destructive'
    })
  }
}

const toggleScheduleStatus = async (schedule) => {
  try {
    const updatedSchedule = { ...schedule, active: !schedule.active }
    await syncSchedulesStore.updateSyncSchedule(updatedSchedule)
    
    toast({
      title: schedule.active ? 'Schedule Deactivated' : 'Schedule Activated',
      description: `${schedule.name} has been ${schedule.active ? 'deactivated' : 'activated'}.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error toggling schedule status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update schedule status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkUpdate = async (updates) => {
  try {
    await syncSchedulesStore.bulkUpdateSyncSchedules(updates)
    showBulkEditDialog.value = false
    
    toast({
      title: 'Sync Schedules Updated',
      description: `${updates.scheduleIds.length} schedules have been updated.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error bulk updating sync schedules:', error)
    toast({
      title: 'Error',
      description: 'Failed to update sync schedules. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBulkDelete = async (schedules) => {
  try {
    const scheduleIds = schedules.map(schedule => schedule.id)
    await syncSchedulesStore.bulkDeleteSyncSchedules(scheduleIds)
    
    toast({
      title: 'Sync Schedules Deleted',
      description: `${schedules.length} schedules have been deleted.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } catch (error) {
    console.error('Error bulk deleting sync schedules:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete sync schedules. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} sync schedules have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchSchedules()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import sync schedules. Please try again.',
      variant: 'destructive'
    })
  }
}

// Toggle between mock data and API data
const toggleDataSource = () => {
  usingMockData.value = !usingMockData.value
  syncSchedulesStore.setUseMockData(usingMockData.value)
  
  // Refresh data
  fetchSchedules()
  
  toast({
    title: usingMockData.value ? 'Using Mock Data' : 'Using API Data',
    description: usingMockData.value 
      ? 'Switched to mock data for testing purposes' 
      : 'Connected to live API endpoints',
    variant: 'default'
  })
}

// Initialize component
onMounted(() => {
  fetchSchedules()
})
</script>