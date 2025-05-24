<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Sync Schedules</DialogTitle>
      <DialogDescription>
        Edit multiple sync schedules at once. Only checked fields will be updated.
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh] py-4">
      <!-- Selected Schedules Summary -->
      <div class="bg-muted rounded-lg p-4 mb-6">
        <h3 class="font-medium mb-2">Selected Schedules ({{ schedules.length }})</h3>
        <div class="flex flex-wrap gap-2">
          <Badge 
            v-for="schedule in schedules.slice(0, 5)" 
            :key="schedule.id" 
            variant="outline"
          >
            {{ schedule.name }}
          </Badge>
          <Badge 
            v-if="schedules.length > 5" 
            variant="outline"
          >
            +{{ schedules.length - 5 }} more
          </Badge>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="space-y-6">
        <!-- Status Section -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updateActive" 
              v-model:checked="fieldsToUpdate.active"
            />
            <Label for="updateActive" class="font-medium">Status</Label>
          </div>

          <div class="pl-6" v-show="fieldsToUpdate.active">
            <div class="flex items-center space-x-2">
              <Switch 
                id="activeValue" 
                v-model="formData.active"
              />
              <Label for="activeValue">{{ formData.active ? 'Active' : 'Inactive' }}</Label>
            </div>
          </div>
        </div>

        <!-- Sync Type Section -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updateType" 
              v-model:checked="fieldsToUpdate.type"
            />
            <Label for="updateType" class="font-medium">Sync Type</Label>
          </div>

          <div class="pl-6" v-show="fieldsToUpdate.type">
            <Select v-model="formData.type">
              <SelectTrigger id="type">
                <SelectValue placeholder="Select sync type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
                <SelectItem value="batch_high">High Frequency (5 min)</SelectItem>
                <SelectItem value="batch_medium">Medium Frequency (15 min)</SelectItem>
                <SelectItem value="batch_low">Low Frequency (Hourly)</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="formData.type === 'realtime'" class="text-xs text-yellow-600 mt-1">
              Real-time sync may impact system performance
            </p>
          </div>
        </div>

        <!-- Priority Section -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updatePriority" 
              v-model:checked="fieldsToUpdate.priority"
            />
            <Label for="updatePriority" class="font-medium">Priority</Label>
          </div>

          <div class="pl-6" v-show="fieldsToUpdate.priority">
            <div class="flex items-center space-x-4">
              <Slider
                id="priority"
                v-model="formData.priority"
                :min="1"
                :max="100"
                class="flex-1"
              />
              <span class="w-12 text-center">{{ formData.priority }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              Higher values run first when multiple schedules are ready
            </p>
          </div>
        </div>

        <!-- Schedule Frequency Section (only if not manual) -->
        <div class="space-y-3" v-if="formData.type !== 'manual'">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updateFrequency" 
              v-model:checked="fieldsToUpdate.schedule"
            />
            <Label for="updateFrequency" class="font-medium">Schedule Frequency</Label>
          </div>

          <div class="pl-6 space-y-3" v-show="fieldsToUpdate.schedule">
            <Select v-model="formData.schedule.frequency">
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom (Cron)</SelectItem>
              </SelectContent>
            </Select>

            <div v-if="formData.schedule.frequency === 'daily' || 
                      formData.schedule.frequency === 'weekly' || 
                      formData.schedule.frequency === 'monthly'">
              <Label for="time">Time</Label>
              <Input
                id="time"
                type="time"
                v-model="formData.schedule.time"
                class="mt-1"
              />
            </div>

            <div v-if="formData.schedule.frequency === 'weekly'">
              <Label for="dayOfWeek">Day of Week</Label>
              <Select v-model="formData.schedule.dayOfWeek" class="mt-1">
                <SelectTrigger id="dayOfWeek">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="0">Sunday</SelectItem>
                  <SelectItem :value="1">Monday</SelectItem>
                  <SelectItem :value="2">Tuesday</SelectItem>
                  <SelectItem :value="3">Wednesday</SelectItem>
                  <SelectItem :value="4">Thursday</SelectItem>
                  <SelectItem :value="5">Friday</SelectItem>
                  <SelectItem :value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="formData.schedule.frequency === 'monthly'">
              <Label for="dayOfMonth">Day of Month</Label>
              <Select v-model="formData.schedule.dayOfMonth" class="mt-1">
                <SelectTrigger id="dayOfMonth">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="day in 31" :key="day" :value="day">{{ day }}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="formData.schedule.frequency === 'custom'">
              <Label for="customCron">Cron Expression</Label>
              <Input
                id="customCron"
                v-model="formData.schedule.customCron"
                placeholder="* * * * *"
                class="mt-1"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Format: minute hour day-of-month month day-of-week
              </p>
            </div>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updateTags" 
              v-model:checked="fieldsToUpdate.tags"
            />
            <Label for="updateTags" class="font-medium">Tags</Label>
          </div>

          <div class="pl-6 space-y-2" v-show="fieldsToUpdate.tags">
            <div class="flex items-center space-x-2">
              <RadioGroup v-model="tagUpdateMode">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label for="replace">Replace all tags</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label for="add">Add to existing tags</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove" />
                  <Label for="remove">Remove selected tags</Label>
                </div>
              </RadioGroup>
            </div>

            <Input
              v-model="tagsInput"
              placeholder="Enter tags separated by commas"
            />
            
            <div v-if="formData.tags && formData.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
              <Badge 
                v-for="(tag, index) in formData.tags" 
                :key="index" 
                variant="secondary"
                class="flex items-center gap-1"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="hover:text-destructive">
                  <XIcon class="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </div>
        </div>

        <!-- Error Handling Section -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updateErrorHandling" 
              v-model:checked="fieldsToUpdate.errorHandling"
            />
            <Label for="updateErrorHandling" class="font-medium">Error Handling</Label>
          </div>

          <div class="pl-6 space-y-2" v-show="fieldsToUpdate.errorHandling">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="stopOnError" 
                v-model:checked="formData.errorHandling.stopOnError"
              />
              <Label for="stopOnError">Stop on error</Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="logErrors" 
                v-model:checked="formData.errorHandling.logErrors"
              />
              <Label for="logErrors">Log errors</Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="alertOnError" 
                v-model:checked="formData.errorHandling.alertOnError"
              />
              <Label for="alertOnError">Alert on error</Label>
            </div>
          </div>
        </div>

        <!-- Notifications Section -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="updateNotifications" 
              v-model:checked="fieldsToUpdate.notifications"
            />
            <Label for="updateNotifications" class="font-medium">Notifications</Label>
          </div>

          <div class="pl-6 space-y-2" v-show="fieldsToUpdate.notifications">
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="enableNotifications" 
                v-model:checked="formData.notifications.enabled"
              />
              <Label for="enableNotifications">Enable notifications</Label>
            </div>
            
            <div v-if="formData.notifications.enabled" class="space-y-2">
              <Label for="notificationChannels">Channels</Label>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="emailChannel" 
                    :checked="isChannelSelected('email')"
                    @update:checked="toggleChannel('email', $event)"
                  />
                  <Label for="emailChannel">Email</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="smsChannel" 
                    :checked="isChannelSelected('sms')"
                    @update:checked="toggleChannel('sms', $event)"
                  />
                  <Label for="smsChannel">SMS</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="pushChannel" 
                    :checked="isChannelSelected('push')"
                    @update:checked="toggleChannel('push', $event)"
                  />
                  <Label for="pushChannel">Push</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    id="webhookChannel" 
                    :checked="isChannelSelected('webhook')"
                    @update:checked="toggleChannel('webhook', $event)"
                  />
                  <Label for="webhookChannel">Webhook</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <div class="w-full flex justify-between items-center sm:justify-end sm:space-x-2">
        <p class="text-sm text-muted-foreground sm:mr-4">
          Updating {{ schedules.length }} schedules
        </p>
        <div>
          <Button variant="outline" @click="$emit('close')" class="mr-2">Cancel</Button>
          <Button 
            type="submit" 
            @click="submitBulkUpdate"
            :disabled="!hasSelectedFields || isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Update All
          </Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  XIcon,
  Loader2Icon
} from 'lucide-vue-next'
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  schedules: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['update-confirmed', 'close'])

// State
const isSubmitting = ref(false)
const tagsInput = ref('')
const tagUpdateMode = ref('replace')

// Track which fields to update
const fieldsToUpdate = ref({
  active: false,
  type: false,
  priority: false,
  schedule: false,
  tags: false,
  errorHandling: false,
  notifications: false
})

// Form data with default values
const formData = ref({
  active: true,
  type: 'batch_medium',
  priority: 50,
  schedule: {
    frequency: 'daily',
    time: '00:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    customCron: ''
  },
  tags: [],
  errorHandling: {
    stopOnError: false,
    logErrors: true,
    alertOnError: true
  },
  notifications: {
    enabled: false,
    channels: []
  }
})

// Initialize with common values if all selected schedules have the same value
const initializeCommonValues = () => {
  if (props.schedules.length === 0) return

  // Check if all schedules have the same value for each field
  const allSameActive = props.schedules.every(s => s.active === props.schedules[0].active)
  const allSameType = props.schedules.every(s => s.type === props.schedules[0].type)
  const allSamePriority = props.schedules.every(s => s.priority === props.schedules[0].priority)
  
  // Set common values
  if (allSameActive) formData.value.active = props.schedules[0].active
  if (allSameType) formData.value.type = props.schedules[0].type
  if (allSamePriority) formData.value.priority = props.schedules[0].priority
}

// Initialize values on component mount
initializeCommonValues()

// Computed property to check if any fields are selected for update
const hasSelectedFields = computed(() => {
  return Object.values(fieldsToUpdate.value).some(value => value)
})

// Process tags input
watch(tagsInput, (newValue) => {
  if (newValue.includes(',')) {
    const tags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag)
    formData.value.tags = [...(formData.value.tags || []), ...tags]
    tagsInput.value = ''
  }
})

// Remove a tag from the list
function removeTag(index) {
  formData.value.tags.splice(index, 1)
}

// Notification channel helpers
function isChannelSelected(channel) {
  return formData.value.notifications?.channels?.includes(channel) || false
}

function toggleChannel(channel, checked) {
  if (!formData.value.notifications) {
    formData.value.notifications = { enabled: true, channels: [] }
  }
  
  if (!formData.value.notifications.channels) {
    formData.value.notifications.channels = []
  }
  
  if (checked) {
    if (!formData.value.notifications.channels.includes(channel)) {
      formData.value.notifications.channels.push(channel)
    }
  } else {
    formData.value.notifications.channels = 
      formData.value.notifications.channels.filter(c => c !== channel)
  }
}

// Submit the bulk update
async function submitBulkUpdate() {
  if (!hasSelectedFields.value) return
  
  isSubmitting.value = true
  
  try {
    // Build update object with only the selected fields
    const updates = {}
    
    if (fieldsToUpdate.value.active) {
      updates.active = formData.value.active
    }
    
    if (fieldsToUpdate.value.type) {
      updates.type = formData.value.type
    }
    
    if (fieldsToUpdate.value.priority) {
      updates.priority = formData.value.priority
    }
    
    if (fieldsToUpdate.value.schedule && formData.value.type !== 'manual') {
      // Clean up schedule fields based on frequency
      const schedule = { ...formData.value.schedule }
      const { frequency } = schedule
      
      if (frequency !== 'daily' && frequency !== 'weekly' && frequency !== 'monthly') {
        delete schedule.time
      }
      
      if (frequency !== 'weekly') delete schedule.dayOfWeek
      if (frequency !== 'monthly') delete schedule.dayOfMonth
      if (frequency !== 'custom') delete schedule.customCron
      
      updates.schedule = schedule
    }
    
    if (fieldsToUpdate.value.tags) {
      // Handle different tag update modes
      updates.tagUpdateMode = tagUpdateMode.value
      updates.tags = formData.value.tags
    }
    
    if (fieldsToUpdate.value.errorHandling) {
      updates.errorHandling = formData.value.errorHandling
    }
    
    if (fieldsToUpdate.value.notifications) {
      updates.notifications = formData.value.notifications
    }
    
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    emit('update-confirmed', {
      scheduleIds: props.schedules.map(schedule => schedule.id),
      updates
    })
  } catch (error) {
    console.error('Error updating schedules:', error)
    // Would handle error here
  } finally {
    isSubmitting.value = false
  }
}
</script>