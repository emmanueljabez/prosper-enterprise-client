<template>
  <DialogContent class="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle>Review Variances</DialogTitle>
      <DialogDescription>
        Review and resolve inventory count variances for {{ cycleCount.name }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 flex-grow overflow-auto">
      <!-- Overview Card -->
      <div class="bg-muted/30 rounded-md p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-muted-foreground">Location</div>
            <div class="font-medium">{{ getLocationName(cycleCount.locationId) }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Counted On</div>
            <div class="font-medium">{{ formatDate(cycleCount.completedAt || cycleCount.startedAt) }}</div>
          </div>
          <div>
            <div class="text-sm text-muted-foreground">Variance Summary</div>
            <div class="font-medium">
              <span 
                :class="{ 
                  'text-success': totalNetVariance > 0,
                  'text-destructive': totalNetVariance < 0
                }"
              >
                {{ totalNetVariance > 0 ? '+' : '' }}{{ totalNetVariance }} items
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Variance Summary -->
      <div class="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" class="text-success">
          Positive Variances: {{ positiveVariances }}
        </Badge>
        <Badge variant="outline" class="text-destructive">
          Negative Variances: {{ negativeVariances }}
        </Badge>
        <Badge variant="outline">
          Unresolved: {{ unresolvedVariances }}
        </Badge>
      </div>
      
      <!-- Table of Items with Variances -->
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Counted</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead class="min-w-[180px]">Resolution</TableHead>
              <TableHead class="min-w-[200px]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in itemsWithVariance" :key="item.itemId">
              <TableCell>
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-xs text-muted-foreground">{{ item.sku }}</div>
                <div v-if="item.binLocation" class="text-xs text-muted-foreground">
                  Bin: {{ item.binLocation }}
                </div>
              </TableCell>
              <TableCell>{{ item.expectedQuantity }}</TableCell>
              <TableCell>{{ item.countedQuantity }}</TableCell>
              <TableCell>
                <Badge 
                  :variant="item.variance > 0 ? 'success' : 'destructive'"
                  class="min-w-[50px] justify-center"
                >
                  {{ item.variance > 0 ? '+' + item.variance : item.variance }}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  v-model="resolutions[item.itemId]"
                  @update:model-value="updateResolution(item.itemId)"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accept">Accept Variance</SelectItem>
                    <SelectItem value="adjust">Adjust System Qty</SelectItem>
                    <SelectItem value="investigate">Investigate Further</SelectItem>
                    <SelectItem value="recount">Request Recount</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Textarea
                  v-model="notes[item.itemId]"
                  placeholder="Add notes about this variance"
                  rows="2"
                  class="min-h-[60px]"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <!-- Overall Notes -->
      <div class="mt-4 space-y-2">
        <Label for="overall-notes">Additional Notes</Label>
        <Textarea
          id="overall-notes"
          v-model="overallNotes"
          placeholder="Add any additional notes about this count"
          rows="3"
        />
      </div>
    </div>

    <DialogFooter class="flex-shrink-0">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button
        type="button"
        variant="default"
        :disabled="hasUnresolvedVariances || isSubmitting"
        @click="handleSave"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
      <Button
        type="button"
        variant="secondary"
        :disabled="hasUnresolvedVariances || isSubmitting"
        @click="handleApprove"
      >
        <CheckCircleIcon class="mr-2 h-4 w-4" />
        Save & Approve
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { 
  CheckCircleIcon, 
  Loader2Icon 
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const props = defineProps({
  cycleCount: { type: Object, required: true },
  locations: { type: Array, default: () => [] }
})

const emit = defineEmits(['variances-updated', 'count-approved', 'close'])

const isSubmitting = ref(false)
const overallNotes = ref('')
const resolutions = ref({})
const notes = ref({})

// Initialize form data from the cycle count
onMounted(() => {
  if (props.cycleCount.items) {
    props.cycleCount.items.forEach(item => {
      if (item.hasVariance) {
        resolutions.value[item.itemId] = item.varianceResolution || ''
        notes.value[item.itemId] = item.varianceNotes || ''
      }
    })
  }
})

const itemsWithVariance = computed(() => {
  if (!props.cycleCount.items) return []
  return props.cycleCount.items.filter(item => item.hasVariance)
})

const totalNetVariance = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.reduce((total, item) => {
    return total + (item.variance || 0)
  }, 0)
})

const positiveVariances = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.filter(item => (item.variance || 0) > 0).length
})

const negativeVariances = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.filter(item => (item.variance || 0) < 0).length
})

const unresolvedVariances = computed(() => {
  if (!props.cycleCount.items) return 0
  return props.cycleCount.items.filter(item => 
    item.hasVariance && !resolutions.value[item.itemId]
  ).length
})

const hasUnresolvedVariances = computed(() => {
  return unresolvedVariances.value > 0
})

function getLocationName(locationId) {
  const location = props.locations?.find(loc => loc.id === locationId)
  return location ? location.name : locationId
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'MMM d, yyyy')
}

function updateResolution(itemId) {
  // Initialize notes if needed when a resolution is selected
  if (resolutions.value[itemId] && !notes.value[itemId]) {
    notes.value[itemId] = ''
  }
}

async function handleSave() {
  if (hasUnresolvedVariances.value) return

  isSubmitting.value = true

  try {
    const varianceData = {
      items: Object.keys(resolutions.value).map(itemId => ({
        itemId,
        resolution: resolutions.value[itemId],
        notes: notes.value[itemId] || ''
      })),
      notes: overallNotes.value
    }

    emit('variances-updated', props.cycleCount.id, varianceData)
  } catch (error) {
    console.error('Error saving variance resolutions:', error)
  } finally {
    isSubmitting.value = false
  }
}

async function handleApprove() {
  if (hasUnresolvedVariances.value) return

  isSubmitting.value = true

  try {
    // First save the variance resolutions
    const varianceData = {
      items: Object.keys(resolutions.value).map(itemId => ({
        itemId,
        resolution: resolutions.value[itemId],
        notes: notes.value[itemId] || ''
      })),
      notes: overallNotes.value
    }

    await emit('variances-updated', props.cycleCount.id, varianceData)
    
    // Then approve the count
    emit('count-approved', props.cycleCount.id, { notes: overallNotes.value })
  } catch (error) {
    console.error('Error approving count:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>