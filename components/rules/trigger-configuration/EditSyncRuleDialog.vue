<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="px-6 pt-6">
      <DialogTitle>Edit Sync Rule</DialogTitle>
      <DialogDescription>
        Update configuration for when and how inventory changes are synchronized
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto px-6">
      <form @submit.prevent="submitForm" id="edit-rule-form" class="py-4">
        <div class="grid gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Rule Name</Label>
              <Input 
                id="name" 
                v-model="formData.name" 
                placeholder="Enter rule name"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea 
                id="description" 
                v-model="formData.description" 
                placeholder="Enter rule description"
                rows="2"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="priority">Priority</Label>
                <Input 
                  id="priority" 
                  type="number" 
                  v-model.number="formData.priority" 
                  placeholder="100"
                  :class="{ 'border-red-500': errors.priority }"
                />
                <p v-if="errors.priority" class="text-xs text-red-500">{{ errors.priority }}</p>
                <p class="text-xs text-muted-foreground">
                  Higher priority rules take precedence
                </p>
              </div>
              
              <div class="space-y-2">
                <Label for="active">Status</Label>
                <div class="flex items-center space-x-2 pt-2">
                  <Switch id="active" v-model="formData.active" />
                  <Label for="active">{{ formData.active ? 'Active' : 'Inactive' }}</Label>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <!-- Rule Configuration -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Rule Configuration</h3>
            
            <div class="space-y-2">
              <Label for="scope">Rule Scope</Label>
              <Select 
                v-model="formData.scope" 
                @update:modelValue="handleScopeChange"
                :class="{ 'border-red-500': errors.scope }"
              >
                <SelectTrigger id="scope">
                  <SelectValue placeholder="Select rule scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Products)</SelectItem>
                  <SelectItem value="category">Category Based</SelectItem>
                  <SelectItem value="product">Product Based</SelectItem>
                  <SelectItem value="item">Item Based</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.scope" class="text-xs text-red-500">{{ errors.scope }}</p>
            </div>
            
            <!-- Category Selection (when scope is category) -->
            <div v-if="formData.scope === 'category'" class="space-y-2">
              <Label for="categories">Categories</Label>
              <Multiselect
                v-model="formData.categoryIds"
                :options="categoriesOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select categories"
                label="label"
                track-by="value"
                :preselect-first="false"
                :class="{ 'multiselect-error': errors.categoryIds }"
              >
                <template #selection="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} categories selected
                  </span>
                </template>
              </Multiselect>
              <p v-if="errors.categoryIds" class="text-xs text-red-500">{{ errors.categoryIds }}</p>
            </div>
            
            <!-- Product Selection (when scope is product) -->
            <div v-if="formData.scope === 'product'" class="space-y-2">
              <Label for="products">Products</Label>
              <Multiselect
                v-model="formData.productIds"
                :options="productsOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select products"
                label="label"
                track-by="value"
                :preselect-first="false"
                :class="{ 'multiselect-error': errors.productIds }"
              >
                <template #selection="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} products selected
                  </span>
                </template>
              </Multiselect>
              <p v-if="errors.productIds" class="text-xs text-red-500">{{ errors.productIds }}</p>
            </div>
            
            <!-- Item Selection (when scope is item) -->
            <div v-if="formData.scope === 'item'" class="space-y-2">
              <Label for="items">Items</Label>
              <Multiselect
                v-model="formData.itemIds"
                :options="itemsOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select items"
                label="label"
                track-by="value"
                :preselect-first="false"
                :class="{ 'multiselect-error': errors.itemIds }"
              >
                <template #selection="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} items selected
                  </span>
                </template>
              </Multiselect>
              <p v-if="errors.itemIds" class="text-xs text-red-500">{{ errors.itemIds }}</p>
            </div>
            
            <!-- Trigger Configuration -->
            <div class="space-y-2">
              <Label for="triggerType">Trigger Type</Label>
              <Select 
                v-model="formData.triggerType"
                @update:modelValue="handleTriggerTypeChange"
                :class="{ 'border-red-500': errors.triggerType }"
              >
                <SelectTrigger id="triggerType">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_change">Stock Change</SelectItem>
                  <SelectItem value="threshold">Threshold</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.triggerType" class="text-xs text-red-500">{{ errors.triggerType }}</p>
            </div>
            
            <!-- Threshold Configuration (when triggerType is threshold) -->
            <div v-if="formData.triggerType === 'threshold'" class="space-y-4 border p-4 rounded-md">
              <h4 class="text-sm font-medium">Threshold Configuration</h4>
              
              <div class="space-y-2">
                <Label for="thresholdType">Threshold Type</Label>
                <Select v-model="formData.thresholdCondition.type">
                  <SelectTrigger id="thresholdType">
                    <SelectValue placeholder="Select threshold type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">Absolute (Number)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="thresholdOperator">Operator</Label>
                <Select v-model="formData.thresholdCondition.operator">
                  <SelectTrigger id="thresholdOperator">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
                    <SelectItem value="less_than_equal">Less Than or Equal (≤)</SelectItem>
                    <SelectItem value="equal">Equal (=)</SelectItem>
                    <SelectItem value="greater_than_equal">Greater Than or Equal (≥)</SelectItem>
                    <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="thresholdValue">Threshold Value</Label>
                <Input 
                  id="thresholdValue" 
                  type="number" 
                  v-model.number="formData.thresholdCondition.value" 
                  placeholder="Enter threshold value"
                  :min="0"
                  :max="formData.thresholdCondition.type === 'percentage' ? 100 : undefined"
                  :class="{ 'border-red-500': errors.thresholdValue }"
                />
                <p v-if="errors.thresholdValue" class="text-xs text-red-500">{{ errors.thresholdValue }}</p>
              </div>
            </div>
            
            <!-- Schedule Configuration (when triggerType is scheduled) -->
            <div v-if="formData.triggerType === 'scheduled'" class="space-y-4 border p-4 rounded-md">
              <h4 class="text-sm font-medium">Schedule Configuration</h4>
              
              <div class="space-y-2">
                <Label for="frequency">Frequency</Label>
                <Select 
                  v-model="formData.scheduleConfig.frequency"
                  @update:modelValue="handleFrequencyChange"
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <!-- Time selection for daily, weekly, monthly -->
              <div v-if="['daily', 'weekly', 'monthly'].includes(formData.scheduleConfig.frequency)" class="space-y-2">
                <Label for="scheduleTime">Time</Label>
                <Input 
                  id="scheduleTime" 
                  type="time" 
                  v-model="formData.scheduleConfig.time" 
                />
              </div>
              
              <!-- Day of week for weekly -->
              <div v-if="formData.scheduleConfig.frequency === 'weekly'" class="space-y-2">
                <Label for="dayOfWeek">Day of Week</Label>
                <Select v-model="formData.scheduleConfig.dayOfWeek">
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
              
              <!-- Day of month for monthly -->
              <div v-if="formData.scheduleConfig.frequency === 'monthly'" class="space-y-2">
                <Label for="dayOfMonth">Day of Month</Label>
                <Input 
                  id="dayOfMonth" 
                  type="number" 
                  v-model.number="formData.scheduleConfig.dayOfMonth" 
                  min="1"
                  max="31"
                />
              </div>
              
              <!-- Custom cron for custom -->
              <div v-if="formData.scheduleConfig.frequency === 'custom'" class="space-y-2">
                <Label for="customCron">Custom Cron Expression</Label>
                <Input 
                  id="customCron" 
                  v-model="formData.scheduleConfig.customCron" 
                  placeholder="e.g., 0 0 * * *"
                  :class="{ 'border-red-500': errors.customCron }"
                />
                <p v-if="errors.customCron" class="text-xs text-red-500">{{ errors.customCron }}</p>
                <p class="text-xs text-muted-foreground">
                  Use cron syntax (minute hour day-of-month month day-of-week)
                </p>
              </div>
            </div>
            
            <!-- Action Configuration -->
            <div class="space-y-2">
              <Label for="action">Action</Label>
              <Select 
                v-model="formData.action"
                @update:modelValue="handleActionChange"
                :class="{ 'border-red-500': errors.action }"
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update_inventory">Update Inventory</SelectItem>
                  <SelectItem value="notify_only">Notify Only</SelectItem>
                  <SelectItem value="hide_product">Hide Product</SelectItem>
                  <SelectItem value="show_product">Show Product</SelectItem>
                  <SelectItem value="change_status">Change Status</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.action" class="text-xs text-red-500">{{ errors.action }}</p>
            </div>
            
            <!-- Status Selection (when action is change_status) -->
            <div v-if="formData.action === 'change_status'" class="space-y-2">
              <Label for="status">New Status</Label>
              <Select v-model="formData.actionConfig.status">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="backordered">Backordered</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="limited">Limited Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <!-- Additional Action Options -->
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="notifyStaff" class="cursor-pointer">Notify Staff</Label>
                  <Switch id="notifyStaff" v-model="formData.actionConfig.notifyStaff" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Send notifications to staff when this rule is triggered
                </p>
              </div>
              
              <div v-if="['update_inventory', 'show_product', 'hide_product'].includes(formData.action)" class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="updateDisplayed" class="cursor-pointer">Update Display Status</Label>
                  <Switch id="updateDisplayed" v-model="formData.actionConfig.updateDisplayed" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Update the display status in the catalog
                </p>
              </div>
              
              <div v-if="formData.action === 'hide_product'" class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="redirectToAlternative" class="cursor-pointer">Redirect to Alternative</Label>
                  <Switch id="redirectToAlternative" v-model="formData.actionConfig.redirectToAlternative" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Redirect customers to an alternative product
                </p>
              </div>
              
              <!-- Alternative Product Selection -->
              <div v-if="formData.action === 'hide_product' && formData.actionConfig.redirectToAlternative" class="space-y-2">
                <Label for="alternativeProductId">Alternative Product</Label>
                <Select v-model="formData.actionConfig.alternativeProductId">
                  <SelectTrigger id="alternativeProductId">
                    <SelectValue placeholder="Select alternative product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="product in props.products" 
                      :key="product.id" 
                      :value="product.id"
                    >
                      {{ product.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <!-- Notification Configuration -->
          <div v-if="formData.actionConfig.notifyStaff" class="space-y-4">
            <h3 class="text-sm font-medium">Notification Configuration</h3>
            
            <div class="space-y-2">
              <Label>Notification Channels</Label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <Checkbox id="emailChannel" v-model="emailChannel" />
                  <Label for="emailChannel" class="cursor-pointer">Email</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox id="smsChannel" v-model="smsChannel" />
                  <Label for="smsChannel" class="cursor-pointer">SMS</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox id="pushChannel" v-model="pushChannel" />
                  <Label for="pushChannel" class="cursor-pointer">Push Notification</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox id="webhookChannel" v-model="webhookChannel" />
                  <Label for="webhookChannel" class="cursor-pointer">Webhook</Label>
                </div>
              </div>
            </div>
            
            <!-- Webhook URL -->
            <div v-if="webhookChannel" class="space-y-2">
              <Label for="webhookUrl">Webhook URL</Label>
              <Input 
                id="webhookUrl" 
                v-model="formData.notifications.webhookUrl" 
                placeholder="https://example.com/webhook"
                :class="{ 'border-red-500': errors.webhookUrl }"
              />
              <p v-if="errors.webhookUrl" class="text-xs text-red-500">{{ errors.webhookUrl }}</p>
            </div>
          </div>
          
          <!-- Tags -->
          <div class="space-y-2">
            <Label for="tags">Tags</Label>
            <TagsInput 
              v-model="formData.tags" 
              placeholder="Add tags (press Enter to add)"
            />
            <p class="text-xs text-muted-foreground">
              Optional tags for categorizing and filtering rules
            </p>
          </div>
          
          <!-- Metadata -->
          <div class="text-xs text-muted-foreground space-y-1">
            <p>ID: {{ props.rule.id }}</p>
            <p>Created: {{ formatDate(props.rule.createdAt) }}</p>
            <p>Last Updated: {{ formatDate(props.rule.updatedAt) }}</p>
            <p v-if="props.rule.createdBy">Created By: {{ props.rule.createdBy }}</p>
            <p v-if="props.rule.updatedBy">Updated By: {{ props.rule.updatedBy }}</p>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="px-6 py-4 border-t">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" form="edit-rule-form" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import { Loader2Icon } from 'lucide-vue-next'
import Multiselect from 'vue-multiselect'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagsInput } from '@/components/ui/tags-input'

const props = defineProps({
  rule: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['rule-updated', 'close'])

// Form data (initialized with existing rule)
const formData = ref({
  name: '',
  description: '',
  active: true,
  priority: 100,
  scope: 'global',
  categoryIds: [],
  productIds: [],
  itemIds: [],
  triggerType: 'stock_change',
  thresholdCondition: {
    type: 'absolute',
    value: 0,
    operator: 'less_than_equal'
  },
  scheduleConfig: {
    frequency: 'daily',
    time: '00:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    customCron: ''
  },
  action: 'update_inventory',
  actionConfig: {
    status: 'out_of_stock',
    notifyStaff: true,
    updateDisplayed: true,
    redirectToAlternative: false,
    alternativeProductId: ''
  },
  notifications: {
    enabled: true,
    channels: ['email'],
    recipients: [],
    webhookUrl: ''
  },
  tags: []
})

// Initialize form data from props.rule
onMounted(() => {
  initializeFormData()
})

function initializeFormData() {
  // Deep clone the rule to avoid reference issues
  const rule = JSON.parse(JSON.stringify(props.rule))
  
  // Set basic fields
  formData.value.name = rule.name || ''
  formData.value.description = rule.description || ''
  formData.value.active = rule.active !== undefined ? rule.active : true
  formData.value.priority = rule.priority !== undefined ? rule.priority : 100
  formData.value.scope = rule.scope || 'global'
  formData.value.categoryIds = rule.categoryIds || []
  formData.value.productIds = rule.productIds || []
  formData.value.itemIds = rule.itemIds || []
  formData.value.triggerType = rule.triggerType || 'stock_change'
  formData.value.action = rule.action || 'update_inventory'
  formData.value.tags = rule.tags || []
  
  // Initialize complex objects
  if (rule.thresholdCondition) {
    formData.value.thresholdCondition = { ...rule.thresholdCondition }
  }
  
  if (rule.scheduleConfig) {
    formData.value.scheduleConfig = { ...rule.scheduleConfig }
  } else {
    formData.value.scheduleConfig = {
      frequency: 'daily',
      time: '00:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      customCron: ''
    }
  }
  
  if (rule.actionConfig) {
    formData.value.actionConfig = { ...rule.actionConfig }
  } else {
    formData.value.actionConfig = {
      status: 'out_of_stock',
      notifyStaff: true,
      updateDisplayed: true,
      redirectToAlternative: false,
      alternativeProductId: ''
    }
  }
  
  if (rule.notifications) {
    formData.value.notifications = { ...rule.notifications }
    
    // Initialize channel checkboxes
    emailChannel.value = rule.notifications.channels?.includes('email') || false
    smsChannel.value = rule.notifications.channels?.includes('sms') || false
    pushChannel.value = rule.notifications.channels?.includes('push') || false
    webhookChannel.value = rule.notifications.channels?.includes('webhook') || false
  } else {
    formData.value.notifications = {
      enabled: true,
      channels: ['email'],
      recipients: [],
      webhookUrl: ''
    }
    emailChannel.value = true
    smsChannel.value = false
    pushChannel.value = false
    webhookChannel.value = false
  }
}

// Notification channel checkboxes
const emailChannel = ref(true)
const smsChannel = ref(false)
const pushChannel = ref(false)
const webhookChannel = ref(false)

// Update channels when checkboxes change
watch([emailChannel, smsChannel, pushChannel, webhookChannel], () => {
  const channels = []
  if (emailChannel.value) channels.push('email')
  if (smsChannel.value) channels.push('sms')
  if (pushChannel.value) channels.push('push')
  if (webhookChannel.value) channels.push('webhook')
  formData.value.notifications.channels = channels
})

// Form state
const errors = ref({})
const isSubmitting = ref(false)

// Computed properties for multiselect options
const categoriesOptions = computed(() => {
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
})

const productsOptions = computed(() => {
  return props.products.map(product => ({
    label: product.name,
    value: product.id
  }))
})

const itemsOptions = computed(() => {
  return props.items.map(item => ({
    label: item.sku || item.name,
    value: item.id
  }))
})

// Event handlers
function handleScopeChange(scope) {
  // Reset the corresponding IDs when scope changes
  if (scope !== 'category') formData.value.categoryIds = []
  if (scope !== 'product') formData.value.productIds = []
  if (scope !== 'item') formData.value.itemIds = []
}

function handleTriggerTypeChange(triggerType) {
  // Reset related configurations when trigger type changes
  if (triggerType !== 'threshold') {
    formData.value.thresholdCondition = {
      type: 'absolute',
      value: 0,
      operator: 'less_than_equal'
    }
  }
  
  if (triggerType !== 'scheduled') {
    formData.value.scheduleConfig = {
      frequency: 'daily',
      time: '00:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      customCron: ''
    }
  }
}

function handleActionChange(action) {
  // Preserve notify staff setting
  const notifyStaff = formData.value.actionConfig.notifyStaff
  
  // Reset actionConfig when action changes
  formData.value.actionConfig = {
    notifyStaff,
    updateDisplayed: ['update_inventory', 'show_product', 'hide_product'].includes(action),
    redirectToAlternative: false,
    alternativeProductId: ''
  }
  
  if (action === 'change_status') {
    formData.value.actionConfig.status = 'out_of_stock'
  }
}

function handleFrequencyChange(frequency) {
  // Reset relevant schedule fields when frequency changes
  if (frequency !== 'weekly') formData.value.scheduleConfig.dayOfWeek = 1
  if (frequency !== 'monthly') formData.value.scheduleConfig.dayOfMonth = 1
  if (frequency !== 'custom') formData.value.scheduleConfig.customCron = ''
}

// Form validation
function validateForm() {
  const newErrors = {}
  
  // Required fields
  if (!formData.value.name.trim()) {
    newErrors.name = 'Rule name is required'
  }
  
  if (formData.value.priority === null || formData.value.priority === undefined) {
    newErrors.priority = 'Priority is required'
  }
  
  if (!formData.value.scope) {
    newErrors.scope = 'Scope is required'
  }
  
  // Conditional validation based on scope
  if (formData.value.scope === 'category' && (!formData.value.categoryIds || formData.value.categoryIds.length === 0)) {
    newErrors.categoryIds = 'At least one category must be selected'
  }
  
  if (formData.value.scope === 'product' && (!formData.value.productIds || formData.value.productIds.length === 0)) {
    newErrors.productIds = 'At least one product must be selected'
  }
  
  if (formData.value.scope === 'item' && (!formData.value.itemIds || formData.value.itemIds.length === 0)) {
    newErrors.itemIds = 'At least one item must be selected'
  }
  
  if (!formData.value.triggerType) {
    newErrors.triggerType = 'Trigger type is required'
  }
  
  // Threshold validation
  if (formData.value.triggerType === 'threshold') {
    if (formData.value.thresholdCondition.value === null || formData.value.thresholdCondition.value === undefined) {
      newErrors.thresholdValue = 'Threshold value is required'
    }
    
    if (formData.value.thresholdCondition.type === 'percentage' && 
        (formData.value.thresholdCondition.value < 0 || formData.value.thresholdCondition.value > 100)) {
      newErrors.thresholdValue = 'Percentage must be between 0 and 100'
    }
  }
  
  // Scheduled validation
  if (formData.value.triggerType === 'scheduled' && formData.value.scheduleConfig.frequency === 'custom') {
    if (!formData.value.scheduleConfig.customCron.trim()) {
      newErrors.customCron = 'Custom cron expression is required'
    }
  }
  
  if (!formData.value.action) {
    newErrors.action = 'Action is required'
  }
  
  // Webhook validation
  if (formData.value.actionConfig.notifyStaff && 
      webhookChannel.value && 
      (!formData.value.notifications.webhookUrl || !formData.value.notifications.webhookUrl.trim())) {
    newErrors.webhookUrl = 'Webhook URL is required when webhook channel is selected'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Form submission
async function submitForm() {
  if (!validateForm()) {
    // Scroll to the first error
    const firstErrorEl = document.querySelector('.border-red-500')
    if (firstErrorEl) {
      firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Prepare the updated rule (including ID)
    const updatedRule = {
      id: props.rule.id,
      ...formData.value
    }
    
    // Emit the rule updated event with the form data
    emit('rule-updated', updatedRule)
  } catch (error) {
    console.error('Error updating rule:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Helper function for date formatting
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}
</script>

<style scoped>
/* Additional styling for multiselect */
:deep(.multiselect) {
  min-height: 40px;
}

:deep(.multiselect__tags) {
  min-height: 40px;
  padding: 6px 40px 0 8px;
  border-radius: 4px;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--background));
}

:deep(.multiselect--active) {
  z-index: 50;
}

:deep(.multiselect-error) {
  --ms-border-color-active: rgb(239, 68, 68);
  --ms-border-color: rgb(239, 68, 68);
}
</style>