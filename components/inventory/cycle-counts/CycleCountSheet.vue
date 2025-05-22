<template>
  <SheetContent class="sm:max-w-md md:max-w-xl overflow-hidden flex flex-col h-full">
    <SheetHeader class="border-b pb-4">
      <SheetTitle>{{ pageTitle }}</SheetTitle>
      <SheetDescription>
        {{ cycleCount.locationName || cycleCount.locationId }} - {{ formatDate(cycleCount.startDate) }}
      </SheetDescription>
    </SheetHeader>
    
    <div class="flex-grow overflow-y-auto py-4">
      <!-- Count Information -->
      <div class="flex justify-between items-center mb-4">
        <div>
          <Badge :variant="getStatusVariant(cycleCount.status)">
            {{ formatStatus(cycleCount.status) }}
          </Badge>
          <h3 class="mt-2 font-semibold">{{ cycleCount.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ cycleCount.description }}</p>
        </div>
        
        <div class="text-right">
          <div class="text-sm text-muted-foreground">Count Progress</div>
          <div class="font-medium">{{ countedItems }} / {{ totalItems }}</div>
          <Progress 
            class="mt-1 h-2 w-32" 
            :value="progressPercentage" 
          />
        </div>
      </div>
      
      <!-- Search and Filter -->
      <div class="mb-4">
        <div class="relative">
          <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            class="pl-8"
            placeholder="Search items by name or SKU..."
            v-model="searchQuery"
          />
        </div>
      </div>
      
      <!-- Items List -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
      
      <div v-else-if="filteredItems.length === 0" class="flex flex-col items-center justify-center py-12">
        <PackageSearchIcon class="h-12 w-12 text-muted-foreground" />
        <h3 class="mt-4 text-lg font-medium">No items found</h3>
        <p class="text-sm text-muted-foreground">
          No items match your search or filter criteria.
        </p>
      </div>
      
      <div v-else class="space-y-4">
        <Card 
          v-for="item in filteredItems" 
          :key="item.itemId" 
          class="transition-all"
          :class="{ 
            'border-primary': isFocusedItem(item),
            'bg-muted/20': item.countedQuantity !== null 
          }"
        >
          <CardContent class="p-3 space-y-3">
            <div class="flex justify-between">
              <div>
                <h4 class="font-medium">{{ item.name }}</h4>
                <div class="text-xs text-muted-foreground">SKU: {{ item.sku }}</div>
                <div v-if="item.binLocation" class="text-xs text-muted-foreground">
                  Bin: {{ item.binLocation }}
                </div>
              </div>
              
              <div class="flex flex-col items-end space-y-1">
                <Badge variant="outline">Expected: {{ item.expectedQuantity }}</Badge>
                <Badge v-if="hasVariance(item)" :variant="getVarianceColor(item)">
                  Variance: {{ getVarianceText(item) }}
                </Badge>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="space-y-1 flex-grow">
                <Label :for="`countedQty-${item.itemId}`">Counted Quantity</Label>
                <Input
                  :id="`countedQty-${item.itemId}`"
                  type="number"
                  min="0"
                  v-model="countData[item.itemId].countedQuantity"
                  @focus="focusedItemId = item.itemId"
                  :class="{ 'border-primary': isFocusedItem(item) }"
                />
              </div>
              
              <div class="space-y-1">
                <Label :for="`notes-${item.itemId}`">Notes</Label>
                <Textarea
                  :id="`notes-${item.itemId}`"
                  v-model="countData[item.itemId].notes"
                  placeholder="Add notes"
                  rows="1"
                  @focus="focusedItemId = item.itemId"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    <SheetFooter class="border-t pt-4 gap-2">
      <div class="flex justify-between w-full">
        <Button variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        
        <div class="space-x-2">
          <Button variant="outline" @click="handleSave" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting && saveType === 'save'" class="mr-2 h-4 w-4 animate-spin" />
            Save Progress
          </Button>
          
          <Button @click="handleComplete" :disabled="!canComplete || isSubmitting">
            <Loader2Icon v-if="isSubmitting && saveType === 'complete'" class="mr-2 h-4 w-4 animate-spin" />
            Complete Count
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import {
  CheckCircleIcon,
  Loader2Icon,
  PackageSearchIcon,
  SearchIcon
} from 'lucide-vue-next'
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent
} from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  cycleCount: { 
    type: Object, 
    required: true 
  },
  mode: { 
    type: String, 
    default: 'start',
    validator: (value) => ['start', 'continue'].includes(value)
  }
})

const emit = defineEmits(['count-completed', 'count-saved', 'close'])
const { toast } = useToast()

// Local state
const isLoading = ref(false)
const isSubmitting = ref(false)
const saveType = ref(null) // 'save' or 'complete'
const searchQuery = ref('')
const focusedItemId = ref(null)
const countData = ref({})

// Computed properties
const pageTitle = computed(() => {
  return props.mode === 'start' ? 'Start Cycle Count' : 'Continue Cycle Count'
})

const countItems = computed(() => {
  return props.cycleCount.items || []
})

const totalItems = computed(() => countItems.value.length)

const countedItems = computed(() => {
  return Object.values(countData.value).filter(item => 
    item.countedQuantity !== null && item.countedQuantity !== ''
  ).length
})

const progressPercentage = computed(() => {
  if (totalItems.value === 0) return 0
  return (countedItems.value / totalItems.value) * 100
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return countItems.value
  
  const query = searchQuery.value.toLowerCase()
  return countItems.value.filter(item => 
    item.name.toLowerCase().includes(query) || 
    item.sku.toLowerCase().includes(query) ||
    (item.binLocation && item.binLocation.toLowerCase().includes(query))
  )
})

const canComplete = computed(() => {
  // Only allow completion if all items have been counted
  return countedItems.value === totalItems.value
})

// Initialize the count data
function initializeCountData() {
  isLoading.value = true
  
  const newCountData = {}
  
  if (props.cycleCount.items) {
    props.cycleCount.items.forEach(item => {
      // If continuing a count, use the existing data
      // If starting, initialize with null
      newCountData[item.itemId] = {
        itemId: item.itemId,
        sku: item.sku,
        name: item.name,
        expectedQuantity: item.expectedQuantity,
        countedQuantity: props.mode === 'continue' ? item.countedQuantity : null,
        notes: item.notes || ''
      }
    })
  }
  
  countData.value = newCountData
  isLoading.value = false
}

// Helper functions
function isFocusedItem(item) {
  return focusedItemId.value === item.itemId
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'MMM d, yyyy')
}

function formatStatus(status) {
  if (!status) return '—'
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusVariant(status) {
  switch (status) {
    case 'scheduled': return 'outline'
    case 'in_progress': return 'secondary'
    case 'pending_approval': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function hasVariance(item) {
  const counted = countData.value[item.itemId]?.countedQuantity
  return counted !== null && counted !== '' && parseInt(counted) !== item.expectedQuantity
}

function getVarianceColor(item) {
  const counted = parseInt(countData.value[item.itemId]?.countedQuantity)
  if (counted > item.expectedQuantity) return 'success'
  return 'destructive'
}

function getVarianceText(item) {
  const counted = parseInt(countData.value[item.itemId]?.countedQuantity)
  const variance = counted - item.expectedQuantity
  return variance > 0 ? `+${variance}` : variance
}

// Event handlers
async function handleSave() {
  if (countedItems.value === 0) {
    toast({
      title: 'Nothing to save',
      description: 'Please count at least one item before saving.',
      variant: 'destructive'
    })
    return
  }
  
  saveType.value = 'save'
  isSubmitting.value = true
  
  try {
    // Prepare the data for API
    const items = props.cycleCount.items.map(item => {
      const countedItem = countData.value[item.itemId]
      return {
        ...item,
        countedQuantity: countedItem.countedQuantity !== null && countedItem.countedQuantity !== '' 
          ? parseInt(countedItem.countedQuantity) 
          : null,
        notes: countedItem.notes
      }
    })
    
    emit('count-saved', props.cycleCount.id, { items })
  } catch (error) {
    console.error('Error saving count progress:', error)
    toast({
      title: 'Error',
      description: 'Failed to save count progress. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
    saveType.value = null
  }
}

async function handleComplete() {
  if (!canComplete.value) {
    toast({
      title: 'Cannot complete',
      description: 'Please count all items before completing.',
      variant: 'destructive'
    })
    return
  }
  
  saveType.value = 'complete'
  isSubmitting.value = true
  
  try {
    // Prepare the data for API with variances calculated
    const items = props.cycleCount.items.map(item => {
      const countedItem = countData.value[item.itemId]
      const countedQty = parseInt(countedItem.countedQuantity)
      const variance = countedQty - item.expectedQuantity
      
      return {
        ...item,
        countedQuantity: countedQty,
        variance: variance,
        hasVariance: variance !== 0,
        notes: countedItem.notes
      }
    })
    
    emit('count-completed', props.cycleCount.id, { items })
  } catch (error) {
    console.error('Error completing count:', error)
    toast({
      title: 'Error',
      description: 'Failed to complete count. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
    saveType.value = null
  }
}

// Lifecycle hooks
onMounted(() => {
  initializeCountData()
})

watch(() => props.cycleCount, () => {
  initializeCountData()
}, { deep: true })
</script>