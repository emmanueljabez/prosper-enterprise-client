<template>
  <DialogContent class="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create Sync Schedule</DialogTitle>
      <DialogDescription>
        Set up a new schedule for synchronizing inventory data.
        Required fields are marked with an asterisk (*).
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh] py-4">
      <Tabs defaultValue="basic" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="scope">Scope</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <!-- Basic Information Tab -->
        <TabsContent value="basic" class="space-y-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name" class="required">Name</Label>
              <Input
                id="name"
                v-model="scheduleData.name"
                placeholder="Enter schedule name"
                :class="{ 'border-destructive': validationErrors.name }"
              />
              <p v-if="validationErrors.name" class="text-xs text-destructive">
                {{ validationErrors.name }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="scheduleData.description"
                placeholder="Describe the purpose of this sync schedule"
                rows="3"
              />
            </div>

            <div class="space-y-2">
              <Label for="type" class="required">Sync Type</Label>
              <Select v-model="scheduleData.type">
                <SelectTrigger id="type" :class="{ 'border-destructive': validationErrors.type }">
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
              <p v-if="validationErrors.type" class="text-xs text-destructive">
                {{ validationErrors.type }}
              </p>
              <p v-if="scheduleData.type === 'realtime'" class="text-xs text-yellow-600 mt-1">
                Real-time sync may impact system performance
              </p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="active" 
                  v-model:checked="scheduleData.active"
                />
                <Label for="active">Enable this schedule immediately</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- Schedule Tab -->
        <TabsContent value="schedule" class="space-y-4">
          <div v-if="scheduleData.type !== 'manual'" class="space-y-4">
            <div class="space-y-2">
              <Label for="frequency" class="required">Frequency</Label>
              <Select v-model="scheduleData.schedule.frequency">
                <SelectTrigger id="frequency" :class="{ 'border-destructive': validationErrors['schedule.frequency'] }">
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
              <p v-if="validationErrors['schedule.frequency']" class="text-xs text-destructive">
                {{ validationErrors['schedule.frequency'] }}
              </p>
            </div>

            <div v-if="scheduleData.schedule.frequency === 'daily' || 
                      scheduleData.schedule.frequency === 'weekly' || 
                      scheduleData.schedule.frequency === 'monthly'" 
                 class="space-y-2">
              <Label for="time">Time</Label>
              <Input
                id="time"
                type="time"
                v-model="scheduleData.schedule.time"
              />
            </div>

            <div v-if="scheduleData.schedule.frequency === 'weekly'" class="space-y-2">
              <Label for="dayOfWeek">Day of Week</Label>
              <Select v-model="scheduleData.schedule.dayOfWeek">
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

            <div v-if="scheduleData.schedule.frequency === 'monthly'" class="space-y-2">
              <Label for="dayOfMonth">Day of Month</Label>
              <Select v-model="scheduleData.schedule.dayOfMonth">
                <SelectTrigger id="dayOfMonth">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="day in 31" :key="day" :value="day">{{ day }}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="scheduleData.schedule.frequency === 'custom'" class="space-y-2">
              <Label for="customCron" class="required">Cron Expression</Label>
              <Input
                id="customCron"
                v-model="scheduleData.schedule.customCron"
                placeholder="* * * * *"
                :class="{ 'border-destructive': validationErrors['schedule.customCron'] }"
              />
              <p class="text-xs text-muted-foreground">
                Format: minute hour day-of-month month day-of-week
              </p>
              <p v-if="validationErrors['schedule.customCron']" class="text-xs text-destructive">
                {{ validationErrors['schedule.customCron'] }}
              </p>
            </div>
          </div>
          <div v-else class="bg-muted rounded-md p-4">
            <p class="text-sm">
              This is a manual schedule that will only run when triggered by a user.
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="priority">Priority (1-100)</Label>
            <div class="flex items-center space-x-4">
              <Slider
                id="priority"
                v-model="scheduleData.priority"
                :min="1"
                :max="100"
                class="flex-1"
              />
              <span class="w-12 text-center">{{ scheduleData.priority }}</span>
            </div>
            <p class="text-xs text-muted-foreground">
              Higher values run first when multiple schedules are ready
            </p>
          </div>
        </TabsContent>

        <!-- Scope Tab -->
        <TabsContent value="scope" class="space-y-4">
          <div class="space-y-2">
            <Label for="scope" class="required">Scope</Label>
            <Select v-model="scheduleData.scope">
              <SelectTrigger id="scope" :class="{ 'border-destructive': validationErrors.scope }">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (All Items)</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="product">By Product</SelectItem>
                <SelectItem value="item">By Specific Items</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="validationErrors.scope" class="text-xs text-destructive">
              {{ validationErrors.scope }}
            </p>
          </div>

          <!-- Category selection with vue-multiselect -->
          <div v-if="scheduleData.scope === 'category'" class="space-y-2">
            <Label for="categories" class="required">Categories</Label>
            <Multiselect
              id="categories"
              v-model="scheduleData.categoryIds"
              :options="categoryOptions"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select categories"
              label="label"
              track-by="value"
              :preselect-first="false"
              :class="{ 'is-invalid': validationErrors.categoryIds }"
            >
              <template #selection="{ values, search, isOpen }">
                <span class="multiselect__single" v-if="values.length && !isOpen">
                  {{ values.length }} categories selected
                </span>
              </template>
            </Multiselect>
            <p v-if="validationErrors.categoryIds" class="text-xs text-destructive">
              {{ validationErrors.categoryIds }}
            </p>
          </div>

          <!-- Product selection with vue-multiselect -->
          <div v-if="scheduleData.scope === 'product'" class="space-y-2">
            <Label for="products" class="required">Products</Label>
            <Multiselect
              id="products"
              v-model="scheduleData.productIds"
              :options="productOptions"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select products"
              label="label"
              track-by="value"
              :preselect-first="false"
              :class="{ 'is-invalid': validationErrors.productIds }"
            >
              <template #selection="{ values, search, isOpen }">
                <span class="multiselect__single" v-if="values.length && !isOpen">
                  {{ values.length }} products selected
                </span>
              </template>
            </Multiselect>
            <p v-if="validationErrors.productIds" class="text-xs text-destructive">
              {{ validationErrors.productIds }}
            </p>
          </div>

          <!-- Item selection with vue-multiselect -->
          <div v-if="scheduleData.scope === 'item'" class="space-y-2">
            <Label for="items" class="required">Items</Label>
            <Multiselect
              id="items"
              v-model="scheduleData.itemIds"
              :options="itemOptions"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select items"
              label="label"
              track-by="value"
              :preselect-first="false"
              :class="{ 'is-invalid': validationErrors.itemIds }"
            >
              <template #selection="{ values, search, isOpen }">
                <span class="multiselect__single" v-if="values.length && !isOpen">
                  {{ values.length }} items selected
                </span>
              </template>
            </Multiselect>
            <p v-if="validationErrors.itemIds" class="text-xs text-destructive">
              {{ validationErrors.itemIds }}
            </p>
          </div>
        </TabsContent>

        <!-- Advanced Tab -->
        <TabsContent value="advanced" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                v-model="scheduleData.batchSize"
                min="1"
              />
              <p class="text-xs text-muted-foreground">
                Number of items processed in a single batch
              </p>
            </div>

            <div class="space-y-2">
              <Label for="maxRuntime">Max Runtime (seconds)</Label>
              <Input
                id="maxRuntime"
                type="number"
                v-model="scheduleData.maxRuntime"
                min="1"
              />
              <p class="text-xs text-muted-foreground">
                Maximum time allowed for execution
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="retryCount">Retry Count</Label>
            <Input
              id="retryCount"
              type="number"
              v-model="scheduleData.retryCount"
              min="0"
            />
            <p class="text-xs text-muted-foreground">
              Number of times to retry on failure
            </p>
          </div>

          <div class="space-y-2">
            <Label for="conflictResolution">Conflict Resolution</Label>
            <Select v-model="scheduleData.conflictResolution">
              <SelectTrigger id="conflictResolution">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip conflicts</SelectItem>
                <SelectItem value="overwrite">Overwrite existing</SelectItem>
                <SelectItem value="merge">Merge data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Error Handling</Label>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="stopOnError" 
                  v-model:checked="scheduleData.errorHandling.stopOnError"
                />
                <Label for="stopOnError">Stop on error</Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="logErrors" 
                  v-model:checked="scheduleData.errorHandling.logErrors"
                />
                <Label for="logErrors">Log errors</Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="alertOnError" 
                  v-model:checked="scheduleData.errorHandling.alertOnError"
                />
                <Label for="alertOnError">Alert on error</Label>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="tags">Tags</Label>
            <Input
              id="tags"
              v-model="tagsInput"
              placeholder="Enter tags separated by commas"
            />
            <div v-if="scheduleData.tags && scheduleData.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
              <Badge 
                v-for="(tag, index) in scheduleData.tags" 
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
        </TabsContent>
      </Tabs>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        type="submit" 
        @click="submitForm"
        :disabled="isSubmitting"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Create Schedule
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { 
  Loader2Icon,
  XIcon
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

const emit = defineEmits(['schedule-created', 'close'])

// State
const isSubmitting = ref(false)
const validationErrors = ref({})
const tagsInput = ref('')

// Default schedule data
const scheduleData = ref({
  name: '',
  description: '',
  active: true,
  type: '',
  schedule: {
    frequency: 'daily',
    time: '00:00',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    customCron: ''
  },
  scope: 'global',
  categoryIds: [],
  productIds: [],
  itemIds: [],
  batchSize: 100,
  maxRuntime: 300, // 5 minutes
  retryCount: 3,
  priority: 50,
  conflictResolution: 'overwrite',
  errorHandling: {
    stopOnError: false,
    logErrors: true,
    alertOnError: true
  },
  tags: []
})

// Mock data for dropdown options
const categoryOptions = [
  { value: 'cat-001', label: 'Electronics' },
  { value: 'cat-002', label: 'Clothing' },
  { value: 'cat-003', label: 'Home & Garden' },
  { value: 'cat-004', label: 'Toys & Games' },
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

// Process tags input
watch(tagsInput, (newValue) => {
  if (newValue.includes(',')) {
    const tags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag)
    scheduleData.value.tags = [...(scheduleData.value.tags || []), ...tags]
    tagsInput.value = ''
  }
})

function removeTag(index) {
  scheduleData.value.tags.splice(index, 1)
}

// Validation
function validateForm() {
  const errors = {}
  
  // Basic tab validation
  if (!scheduleData.value.name) {
    errors.name = 'Name is required'
  } else if (scheduleData.value.name.length > 100) {
    errors.name = 'Name must be less than 100 characters'
  }
  
  if (!scheduleData.value.type) {
    errors.type = 'Sync type is required'
  }
  
  // Schedule tab validation
  if (scheduleData.value.type !== 'manual') {
    if (!scheduleData.value.schedule.frequency) {
      errors['schedule.frequency'] = 'Frequency is required'
    }
    
    if (scheduleData.value.schedule.frequency === 'custom' && !scheduleData.value.schedule.customCron) {
      errors['schedule.customCron'] = 'Cron expression is required'
    }
  }
  
  // Scope tab validation
  if (!scheduleData.value.scope) {
    errors.scope = 'Scope is required'
  } else {
    if (scheduleData.value.scope === 'category' && 
        (!scheduleData.value.categoryIds || scheduleData.value.categoryIds.length === 0)) {
      errors.categoryIds = 'At least one category must be selected'
    }
    
    if (scheduleData.value.scope === 'product' && 
        (!scheduleData.value.productIds || scheduleData.value.productIds.length === 0)) {
      errors.productIds = 'At least one product must be selected'
    }
    
    if (scheduleData.value.scope === 'item' && 
        (!scheduleData.value.itemIds || scheduleData.value.itemIds.length === 0)) {
      errors.itemIds = 'At least one item must be selected'
    }
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

// Submit form
async function submitForm() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Process final data
    const finalData = { ...scheduleData.value }
    
    // Clean up unnecessary fields based on scope
    if (finalData.scope !== 'category') delete finalData.categoryIds
    if (finalData.scope !== 'product') delete finalData.productIds
    if (finalData.scope !== 'item') delete finalData.itemIds
    
    // Clean up schedule fields based on frequency
    if (finalData.type === 'manual') {
      delete finalData.schedule
    } else {
      const { frequency } = finalData.schedule
      if (frequency !== 'daily' && frequency !== 'weekly' && frequency !== 'monthly') {
        delete finalData.schedule.time
      }
      if (frequency !== 'weekly') delete finalData.schedule.dayOfWeek
      if (frequency !== 'monthly') delete finalData.schedule.dayOfMonth
      if (frequency !== 'custom') delete finalData.schedule.customCron
    }
    
    // If we had a real API, we would submit the data here
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    emit('schedule-created', finalData)
  } catch (error) {
    console.error('Error creating schedule:', error)
    // Handle error (could add error display to UI)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.required::after {
  content: " *";
  color: rgb(var(--destructive));
}
</style>