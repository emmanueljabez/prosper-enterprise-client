<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Schedule Details</DialogTitle>
      <DialogDescription>
        View information about this sync schedule
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh] py-4">
      <!-- Basic Information -->
      <div class="space-y-6">
        <!-- Header with Status Badge -->
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold">{{ schedule.name }}</h3>
            <p v-if="schedule.description" class="text-sm text-muted-foreground mt-1">
              {{ schedule.description }}
            </p>
          </div>
          <Badge :variant="schedule.active ? 'success' : 'secondary'">
            {{ schedule.active ? 'Active' : 'Inactive' }}
          </Badge>
        </div>

        <!-- Type and Performance Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <h4 class="text-sm font-medium">Sync Type</h4>
            <div class="flex items-center">
              <Badge :variant="getTypeBadgeVariant(schedule.type)">
                {{ formatType(schedule.type) }}
              </Badge>
              <span v-if="schedule.optimizationSuggested" class="ml-2 text-xs text-yellow-600">
                {{ schedule.optimizationMessage }}
              </span>
            </div>
          </div>
          <div class="space-y-2">
            <h4 class="text-sm font-medium">Priority</h4>
            <div class="flex items-center space-x-2">
              <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full" :style="{ width: `${schedule.priority}%` }"></div>
              </div>
              <span class="text-xs whitespace-nowrap">{{ schedule.priority }}</span>
            </div>
          </div>
        </div>

        <!-- Schedule Information -->
        <Card>
          <CardHeader className="py-3">
            <CardTitle>Schedule Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm font-medium mb-1">Frequency</div>
                <div>{{ formatFrequency(schedule.schedule) }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Next Run</div>
                <div>{{ formatNextRun(schedule.nextRunAt) }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Last Run</div>
                <div>{{ formatDateTime(schedule.lastRunAt) || 'Never run' }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Last Run Status</div>
                <div>
                  <Badge v-if="schedule.lastRunStatus" :variant="getStatusBadgeVariant(schedule.lastRunStatus)">
                    {{ formatStatus(schedule.lastRunStatus) }}
                  </Badge>
                  <span v-else class="text-muted-foreground">Never Run</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Scope Configuration -->
        <Card>
          <CardHeader className="py-3">
            <CardTitle>Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium mb-1">Scope Type</div>
                <div>{{ formatScopeType(schedule.scope) }}</div>
              </div>

              <div v-if="schedule.scope === 'category' && schedule.categoryIds?.length">
                <div class="text-sm font-medium mb-1">Categories ({{ schedule.categoryIds.length }})</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="categoryId in schedule.categoryIds.slice(0, 5)" 
                    :key="categoryId" 
                    variant="secondary"
                  >
                    {{ getCategoryName(categoryId) }}
                  </Badge>
                  <Badge 
                    v-if="schedule.categoryIds.length > 5" 
                    variant="outline"
                  >
                    +{{ schedule.categoryIds.length - 5 }} more
                  </Badge>
                </div>
              </div>

              <div v-if="schedule.scope === 'product' && schedule.productIds?.length">
                <div class="text-sm font-medium mb-1">Products ({{ schedule.productIds.length }})</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="productId in schedule.productIds.slice(0, 5)" 
                    :key="productId" 
                    variant="secondary"
                  >
                    {{ getProductName(productId) }}
                  </Badge>
                  <Badge 
                    v-if="schedule.productIds.length > 5" 
                    variant="outline"
                  >
                    +{{ schedule.productIds.length - 5 }} more
                  </Badge>
                </div>
              </div>

              <div v-if="schedule.scope === 'item' && schedule.itemIds?.length">
                <div class="text-sm font-medium mb-1">Items ({{ schedule.itemIds.length }})</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="itemId in schedule.itemIds.slice(0, 5)" 
                    :key="itemId" 
                    variant="secondary"
                  >
                    {{ getItemName(itemId) }}
                  </Badge>
                  <Badge 
                    v-if="schedule.itemIds.length > 5" 
                    variant="outline"
                  >
                    +{{ schedule.itemIds.length - 5 }} more
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Advanced Settings -->
        <Card>
          <CardHeader className="py-3">
            <CardTitle>Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <div class="text-sm font-medium mb-1">Batch Size</div>
                <div>{{ schedule.batchSize || 'Default' }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Max Runtime</div>
                <div>{{ schedule.maxRuntime ? `${schedule.maxRuntime} seconds` : 'Unlimited' }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Retry Count</div>
                <div>{{ schedule.retryCount || '0' }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Conflict Resolution</div>
                <div>{{ formatConflictResolution(schedule.conflictResolution) }}</div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Error Handling</div>
                <div class="space-y-1">
                  <div class="flex items-center">
                    <CheckIcon 
                      v-if="schedule.errorHandling?.stopOnError" 
                      class="h-4 w-4 text-green-500 mr-1"
                    />
                    <XIcon 
                      v-else 
                      class="h-4 w-4 text-muted-foreground mr-1"
                    />
                    <span class="text-sm">Stop on error</span>
                  </div>
                  <div class="flex items-center">
                    <CheckIcon 
                      v-if="schedule.errorHandling?.logErrors" 
                      class="h-4 w-4 text-green-500 mr-1"
                    />
                    <XIcon 
                      v-else 
                      class="h-4 w-4 text-muted-foreground mr-1"
                    />
                    <span class="text-sm">Log errors</span>
                  </div>
                  <div class="flex items-center">
                    <CheckIcon 
                      v-if="schedule.errorHandling?.alertOnError" 
                      class="h-4 w-4 text-green-500 mr-1"
                    />
                    <XIcon 
                      v-else 
                      class="h-4 w-4 text-muted-foreground mr-1"
                    />
                    <span class="text-sm">Alert on error</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Notifications</div>
                <div>
                  <Badge v-if="!schedule.notifications?.enabled" variant="outline">
                    Disabled
                  </Badge>
                  <div v-else class="space-y-1">
                    <div class="flex items-center space-x-1">
                      <span class="text-sm">Channels:</span>
                      <div class="flex flex-wrap gap-1">
                        <Badge 
                          v-for="channel in schedule.notifications.channels" 
                          :key="channel" 
                          variant="secondary"
                        >
                          {{ channel }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Metadata -->
        <Card>
          <CardHeader className="py-3">
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <div class="text-sm font-medium mb-1">Tags</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge 
                    v-for="tag in schedule.tags" 
                    :key="tag" 
                    variant="secondary"
                  >
                    {{ tag }}
                  </Badge>
                  <span v-if="!schedule.tags || schedule.tags.length === 0" class="text-muted-foreground text-sm">
                    No tags
                  </span>
                </div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Created</div>
                <div class="text-sm">{{ formatDateTime(schedule.createdAt) }}</div>
                <div v-if="schedule.createdBy" class="text-xs text-muted-foreground">
                  by {{ schedule.createdBy }}
                </div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">Last Updated</div>
                <div class="text-sm">{{ formatDateTime(schedule.updatedAt) }}</div>
                <div v-if="schedule.updatedBy" class="text-xs text-muted-foreground">
                  by {{ schedule.updatedBy }}
                </div>
              </div>
              <div>
                <div class="text-sm font-medium mb-1">ID</div>
                <div class="text-sm font-mono">{{ schedule.id }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Close</Button>
      <Button @click="runNow">Run Now</Button>
      <Button variant="default" @click="$emit('edit-schedule', schedule)">Edit</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns'
import { CheckIcon, XIcon } from 'lucide-vue-next'
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  schedule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit-schedule', 'run-schedule'])
const { toast } = useToast()

// Mock data for lookup functions
const categoryOptions = [
  { value: 'cat-001', label: 'Electronics' },
  { value: 'cat-002', label: 'Clothing' },
  { value: 'cat-003', label: 'Home & Garden' },
  { value: 'cat-004', label: 'Raw Materials' },
  { value: 'cat-005', label: 'Sports & Outdoors' }
]

const productOptions = [
  { value: 'prod-001', label: 'Smartphone X1' },
  { value: 'prod-002', label: 'Laptop Pro 15"' },
  { value: 'prod-003', label: 'Wireless Headphones' },
  { value: 'prod-004', label: 'Smart Watch V2' },
  { value: 'prod-005', label: 'Bluetooth Speaker' }
]

const itemOptions = [
  { value: 'item-001', label: 'Smartphone X1 - Black' },
  { value: 'item-002', label: 'Smartphone X1 - White' },
  { value: 'item-003', label: 'Laptop Pro 15" - i7/16GB/512GB' },
  { value: 'item-004', label: 'Laptop Pro 15" - i5/8GB/256GB' },
  { value: 'item-005', label: 'Wireless Headphones - Black' }
]

// Helper functions
function formatDateTime(dateTime) {
  if (!dateTime) return null
  
  try {
    const date = parseISO(dateTime)
    if (!isValid(date)) return dateTime
    
    return format(date, 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateTime
  }
}

function formatType(type) {
  switch (type) {
    case 'realtime': return 'Real-time'
    case 'batch_high': return 'High Frequency'
    case 'batch_medium': return 'Medium Frequency'
    case 'batch_low': return 'Low Frequency'
    case 'manual': return 'Manual'
    default: return type
  }
}

function getTypeBadgeVariant(type) {
  switch (type) {
    case 'realtime': return 'default'
    case 'batch_high': return 'info'
    case 'batch_medium': return 'secondary'
    case 'batch_low': return 'outline'
    case 'manual': return 'warning'
    default: return 'outline'
  }
}

function formatFrequency(scheduleConfig) {
  if (!scheduleConfig) return 'Not set'
  
  const { frequency, time, dayOfWeek, dayOfMonth, customCron } = scheduleConfig
  
  switch (frequency) {
    case 'hourly': return 'Every hour'
    case 'daily': return time ? `Daily at ${time.substring(0, 5)}` : 'Daily'
    case 'weekly': {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = dayOfWeek !== undefined ? days[dayOfWeek] : 'Monday'
      return time ? `Weekly on ${day} at ${time.substring(0, 5)}` : `Weekly on ${day}`
    }
    case 'monthly': {
      const day = dayOfMonth || 1
      return time ? `Monthly on day ${day} at ${time.substring(0, 5)}` : `Monthly on day ${day}`
    }
    case 'custom': return customCron ? `Custom (${customCron})` : 'Custom'
    default: return frequency
  }
}

function formatNextRun(nextRunAt) {
  if (!nextRunAt) return 'Not scheduled'
  
  try {
    const date = parseISO(nextRunAt)
    if (!isValid(date)) return 'Invalid date'
    
    const now = new Date()
    if (date < now) return 'Overdue'
    
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (e) {
    return nextRunAt
  }
}

function formatStatus(status) {
  switch (status) {
    case 'success': return 'Success'
    case 'partial': return 'Partial'
    case 'failed': return 'Failed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

function getStatusBadgeVariant(status) {
  switch (status) {
    case 'success': return 'success'
    case 'partial': return 'warning'
    case 'failed': return 'destructive'
    case 'cancelled': return 'secondary'
    default: return 'outline'
  }
}

function formatScopeType(scope) {
  switch (scope) {
    case 'global': return 'Global (All Items)'
    case 'category': return 'By Category'
    case 'product': return 'By Product'
    case 'item': return 'By Specific Items'
    default: return scope
  }
}

function formatConflictResolution(resolution) {
  switch (resolution) {
    case 'skip': return 'Skip conflicts'
    case 'overwrite': return 'Overwrite existing'
    case 'merge': return 'Merge data'
    default: return resolution || 'Default'
  }
}

function getCategoryName(categoryId) {
  const category = categoryOptions.find(c => c.value === categoryId)
  return category ? category.label : categoryId
}

function getProductName(productId) {
  const product = productOptions.find(p => p.value === productId)
  return product ? product.label : productId
}

function getItemName(itemId) {
  const item = itemOptions.find(i => i.value === itemId)
  return item ? item.label : itemId
}

function runNow() {
  emit('run-schedule', props.schedule)
  toast({
    title: 'Schedule triggered',
    description: `${props.schedule.name} has been triggered to run.`,
    duration: 3000
  })
}
</script>