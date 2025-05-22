<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Cycle Counts</h2>
        <p class="text-muted-foreground">Manage scheduled physical counts, variance reconciliation, and approval workflows</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <CalendarIcon class="h-4 w-4 mr-2" />
              Schedule
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openScheduleDialog('weekly')">
              <CalendarDaysIcon class="h-4 w-4 mr-2" />
              Weekly Count
            </DropdownMenuItem>
            <DropdownMenuItem @click="openScheduleDialog('monthly')">
              <CalendarIcon class="h-4 w-4 mr-2" />
              Monthly Count
            </DropdownMenuItem>
            <DropdownMenuItem @click="openScheduleDialog('quarterly')">
              <CalendarRangeIcon class="h-4 w-4 mr-2" />
              Quarterly Count
            </DropdownMenuItem>
            <DropdownMenuItem @click="openScheduleDialog('annual')">
              <CalendarClockIcon class="h-4 w-4 mr-2" />
              Annual Inventory
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button @click="openCreateCountDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Count
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <CycleCountStatCards :stats="stats" />

    <!-- Filters -->
    <CycleCountFilters 
      v-model:status="filters.status"
      v-model:location="filters.location"
      v-model:date-range="filters.dateRange"
      :locations="locations"
      @filter-change="fetchCycleCounts"
    />

    <!-- Cycle Counts Table -->
    <CycleCountsTable
      :cycleCounts="cycleCounts"
      :locations="locations"
      :loading="isLoading"
      @view-count="openCountDetails"
      @start-count="handleStartCount"
      @continue-count="handleContinueCount"
      @review-variances="openVarianceReview"
      @approve-count="openApprovalDialog"
      @cancel-count="openCancelDialog"
      @print-count="handlePrintCount"
      @refresh="fetchCycleCounts"
    />

    <!-- Create Cycle Count Dialog -->
    <Dialog v-model:open="showCreateCountDialog">
      <CreateCycleCountDialog
        v-if="showCreateCountDialog"
        :locations="locations"
        @count-created="handleCountCreated"
        @close="showCreateCountDialog = false"
      />
    </Dialog>

    <!-- Cycle Count Details Dialog -->
    <Dialog v-model:open="showCountDetailsDialog">
      <CycleCountDetailsDialog
        v-if="showCountDetailsDialog"
        :cycleCount="selectedCount"
        :locations="locations"
        @start-count="handleStartCount"
        @continue-count="handleContinueCount"
        @review-variances="openVarianceReview"
        @approve-count="openApprovalDialog"
        @close="showCountDetailsDialog = false"
      />
    </Dialog>

    <!-- Schedule Cycle Count Dialog -->
    <Dialog v-model:open="showScheduleDialog">
      <ScheduleCycleCountDialog
        v-if="showScheduleDialog"
        :scheduleType="scheduleType"
        :locations="locations"
        @schedule-created="handleScheduleCreated"
        @close="showScheduleDialog = false"
      />
    </Dialog>

    <!-- Variance Review Dialog -->
    <Dialog v-model:open="showVarianceReviewDialog" class="sm:max-w-[900px]">
      <VarianceReviewDialog
        v-if="showVarianceReviewDialog"
        :cycleCount="selectedCount"
        @variances-updated="handleVariancesUpdated"
        @count-approved="handleCountApproved"
        @close="showVarianceReviewDialog = false"
      />
    </Dialog>

    <!-- Approval Dialog -->
    <Dialog v-model:open="showApprovalDialog">
      <ApprovalDialog
        v-if="showApprovalDialog"
        :cycleCount="selectedCount"
        @count-approved="handleCountApproved"
        @close="showApprovalDialog = false"
      />
    </Dialog>

    <!-- Cancel Count Dialog -->
    <Dialog v-model:open="showCancelDialog">
      <CancelCycleCountDialog
        v-if="showCancelDialog"
        :cycleCount="selectedCount"
        @count-cancelled="handleCountCancelled"
        @close="showCancelDialog = false"
      />
    </Dialog>

    <!-- Count Sheet -->
    <Sheet v-model:open="showCountSheet" position="right" size="xl">
      <CycleCountSheet
        v-if="showCountSheet"
        :cycleCount="selectedCount"
        :mode="countSheetMode"
        @count-completed="handleCountCompleted"
        @count-saved="handleCountSaved"
        @close="showCountSheet = false"
      />
    </Sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, CalendarIcon, ChevronDown, CalendarDaysIcon,
  CalendarRangeIcon, CalendarClockIcon
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
import CycleCountStatCards from '@/components/inventory/cycle-counts/CycleCountStatCards.vue'
import CycleCountFilters from '@/components/inventory/cycle-counts/CycleCountFilters.vue'
import CycleCountsTable from '@/components/inventory/cycle-counts/CycleCountsTable.vue'
import CreateCycleCountDialog from '@/components/inventory/cycle-counts/CreateCycleCountDialog.vue'
import CycleCountDetailsDialog from '@/components/inventory/cycle-counts/CycleCountDetailsDialog.vue'
import ScheduleCycleCountDialog from '@/components/inventory/cycle-counts/ScheduleCycleCountDialog.vue'
import VarianceReviewDialog from '@/components/inventory/cycle-counts/VarianceReviewDialog.vue'
import ApprovalDialog from '@/components/inventory/cycle-counts/ApprovalDialog.vue'
import CancelCycleCountDialog from '@/components/inventory/cycle-counts/CancelCycleCountDialog.vue'
import CycleCountSheet from '@/components/inventory/cycle-counts/CycleCountSheet.vue'

// Stores
import { useCycleCountsStore } from '@/store/modules/inventory/cycleCounts'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useInventoryStore } from '@/store/modules/inventory/items'

// Initialize stores
const cycleCountsStore = useCycleCountsStore()
const locationsStore = useLocationsStore()
const itemsStore = useInventoryStore()
const { toast } = useToast()

// Access store state through computed properties
const cycleCounts = computed(() => cycleCountsStore.getCycleCounts)
const locations = computed(() => locationsStore.getLocations)
const isLoading = computed(() => cycleCountsStore.getIsLoading)
const error = computed(() => cycleCountsStore.getError)

// Stats computed from cycle counts
const stats = computed(() => {
  return {
    scheduled: cycleCounts.value.filter(count => count.status === 'scheduled').length,
    inProgress: cycleCounts.value.filter(count => count.status === 'in_progress').length,
    pendingApproval: cycleCounts.value.filter(count => count.status === 'pending_approval').length,
    completedThisMonth: cycleCounts.value.filter(count => {
      return count.status === 'completed' && 
        new Date(count.completedAt).getMonth() === new Date().getMonth()
    }).length
  }
})

// Local state
const selectedCount = ref(null)
const filters = ref({
  status: 'all',
  location: 'all',
  dateRange: 'all'
})

// UI control
const showCreateCountDialog = ref(false)
const showCountDetailsDialog = ref(false)
const showScheduleDialog = ref(false)
const showVarianceReviewDialog = ref(false)
const showApprovalDialog = ref(false)
const showCancelDialog = ref(false)
const showCountSheet = ref(false)
const scheduleType = ref('weekly')
const countSheetMode = ref('start') // 'start' or 'continue'

// Dialog and sheet handlers
const openCreateCountDialog = () => {
  showCreateCountDialog.value = true
}

const openCountDetails = (count) => {
  selectedCount.value = count
  showCountDetailsDialog.value = true
}

const openScheduleDialog = (type) => {
  scheduleType.value = type
  showScheduleDialog.value = true
}

const openVarianceReview = (count) => {
  selectedCount.value = count
  showVarianceReviewDialog.value = true
}

const openApprovalDialog = (count) => {
  selectedCount.value = count
  showApprovalDialog.value = true
}

const openCancelDialog = (count) => {
  selectedCount.value = count
  showCancelDialog.value = true
}

// Fetch data from APIs
const fetchCycleCounts = async () => {
  try {
    await cycleCountsStore.fetchCycleCounts({
      status: filters.value.status !== 'all' ? filters.value.status : undefined,
      locationId: filters.value.location !== 'all' ? filters.value.location : undefined,
      dateRange: filters.value.dateRange !== 'all' ? filters.value.dateRange : undefined
    })
  } catch (error) {
    console.error('Error fetching cycle counts:', error)
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load cycle counts',
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

// Action handlers
const handleStartCount = (count) => {
  selectedCount.value = count
  countSheetMode.value = 'start'
  showCountSheet.value = true
}

const handleContinueCount = (count) => {
  selectedCount.value = count
  countSheetMode.value = 'continue'
  showCountSheet.value = true
}

const handleCountCreated = async (newCount) => {
  try {
    await cycleCountsStore.createCycleCount(newCount)
    showCreateCountDialog.value = false
    
    toast({
      title: 'Cycle Count Created',
      description: `${newCount.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error creating cycle count:', error)
    toast({
      title: 'Error',
      description: 'Failed to create cycle count. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleScheduleCreated = async (schedule) => {
  try {
    await cycleCountsStore.scheduleRecurringCount(schedule)
    showScheduleDialog.value = false
    
    toast({
      title: 'Cycle Count Scheduled',
      description: `${schedule.name} has been scheduled successfully.`,
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error scheduling cycle count:', error)
    toast({
      title: 'Error',
      description: 'Failed to schedule cycle count. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCountCompleted = async (countId, countData) => {
  try {
    await cycleCountsStore.completeCycleCount(countId, countData)
    showCountSheet.value = false
    
    toast({
      title: 'Count Completed',
      description: 'Physical count has been completed and is now ready for review.',
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error completing cycle count:', error)
    toast({
      title: 'Error',
      description: 'Failed to complete count. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCountSaved = async (countId, countData) => {
  try {
    await cycleCountsStore.saveCycleCountProgress(countId, countData)
    showCountSheet.value = false
    
    toast({
      title: 'Progress Saved',
      description: 'Your count progress has been saved.',
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error saving cycle count progress:', error)
    toast({
      title: 'Error',
      description: 'Failed to save count progress. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleVariancesUpdated = async (countId, varianceData) => {
  try {
    await cycleCountsStore.updateVariances(countId, varianceData)
    
    toast({
      title: 'Variances Updated',
      description: 'Count variances have been updated successfully.',
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error updating variances:', error)
    toast({
      title: 'Error',
      description: 'Failed to update variances. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCountApproved = async (countId, approvalData) => {
  try {
    await cycleCountsStore.approveCycleCount(countId, approvalData)
    showApprovalDialog.value = false
    showVarianceReviewDialog.value = false
    
    toast({
      title: 'Count Approved',
      description: 'Cycle count has been approved and inventory has been updated.',
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error approving cycle count:', error)
    toast({
      title: 'Error',
      description: 'Failed to approve count. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCountCancelled = async (countId, reason) => {
  try {
    await cycleCountsStore.cancelCycleCount(countId, reason)
    showCancelDialog.value = false
    
    toast({
      title: 'Count Cancelled',
      description: 'Cycle count has been cancelled.',
      variant: 'success'
    })
    
    await fetchCycleCounts()
  } catch (error) {
    console.error('Error cancelling cycle count:', error)
    toast({
      title: 'Error',
      description: 'Failed to cancel count. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePrintCount = async (count) => {
  try {
    await cycleCountsStore.generateCountSheet(count.id)
    
    toast({
      title: 'Count Sheet Generated',
      description: 'Count sheet has been generated and is ready for printing.',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error generating count sheet:', error)
    toast({
      title: 'Error',
      description: 'Failed to generate count sheet. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchCycleCounts()
  fetchLocations()
})
</script>