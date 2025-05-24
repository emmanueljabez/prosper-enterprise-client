<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="px-6 pt-6">
      <DialogTitle>Rule Details</DialogTitle>
      <DialogDescription>
        View configuration for this inventory sync rule
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto px-6">
      <div class="py-4 space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold">{{ rule.name }}</h3>
            <p class="text-sm text-muted-foreground">{{ rule.description || 'No description provided' }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-medium">Priority</div>
              <div>{{ rule.priority }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Status</div>
              <Badge :variant="rule.active ? 'success' : 'secondary'">
                {{ rule.active ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <!-- Rule Configuration -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Rule Configuration</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-medium">Scope</div>
              <div>{{ formatScope(rule.scope) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Trigger Type</div>
              <Badge :variant="getTriggerBadgeVariant(rule.triggerType)">
                {{ formatTriggerType(rule.triggerType) }}
              </Badge>
            </div>
          </div>
          
          <!-- Scope Details -->
          <div v-if="rule.scope === 'category' && rule.categoryIds?.length" class="space-y-2">
            <div class="text-sm font-medium">Categories</div>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="catId in rule.categoryIds" :key="catId" variant="outline">
                {{ getCategoryName(catId) }}
              </Badge>
            </div>
          </div>
          
          <div v-if="rule.scope === 'product' && rule.productIds?.length" class="space-y-2">
            <div class="text-sm font-medium">Products</div>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="prodId in rule.productIds" :key="prodId" variant="outline">
                {{ getProductName(prodId) }}
              </Badge>
            </div>
          </div>
          
          <div v-if="rule.scope === 'item' && rule.itemIds?.length" class="space-y-2">
            <div class="text-sm font-medium">Items</div>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="itemId in rule.itemIds" :key="itemId" variant="outline">
                {{ getItemName(itemId) }}
              </Badge>
            </div>
          </div>
          
          <!-- Threshold Details -->
          <div v-if="rule.triggerType === 'threshold' && rule.thresholdCondition" class="space-y-2 border p-4 rounded-md">
            <div class="text-sm font-medium">Threshold Configuration</div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <div class="text-xs text-muted-foreground">Type</div>
                <div>{{ formatThresholdType(rule.thresholdCondition.type) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Operator</div>
                <div>{{ formatOperator(rule.thresholdCondition.operator) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Value</div>
                <div>
                  {{ rule.thresholdCondition.value }}{{ rule.thresholdCondition.type === 'percentage' ? '%' : '' }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Schedule Details -->
          <div v-if="rule.triggerType === 'scheduled' && rule.scheduleConfig" class="space-y-2 border p-4 rounded-md">
            <div class="text-sm font-medium">Schedule Configuration</div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-muted-foreground">Frequency</div>
                <div class="capitalize">{{ rule.scheduleConfig.frequency }}</div>
              </div>
              
              <div v-if="['daily', 'weekly', 'monthly'].includes(rule.scheduleConfig.frequency)">
                <div class="text-xs text-muted-foreground">Time</div>
                <div>{{ formatTime(rule.scheduleConfig.time) }}</div>
              </div>
              
              <div v-if="rule.scheduleConfig.frequency === 'weekly'">
                <div class="text-xs text-muted-foreground">Day of Week</div>
                <div>{{ formatDayOfWeek(rule.scheduleConfig.dayOfWeek) }}</div>
              </div>
              
              <div v-if="rule.scheduleConfig.frequency === 'monthly'">
                <div class="text-xs text-muted-foreground">Day of Month</div>
                <div>{{ rule.scheduleConfig.dayOfMonth }}</div>
              </div>
              
              <div v-if="rule.scheduleConfig.frequency === 'custom'" class="col-span-2">
                <div class="text-xs text-muted-foreground">Custom Cron</div>
                <code class="text-xs bg-muted p-1 rounded">{{ rule.scheduleConfig.customCron }}</code>
              </div>
            </div>
          </div>
          
          <!-- Action Details -->
          <div class="space-y-2">
            <div class="text-sm font-medium">Action</div>
            <Badge>{{ formatAction(rule.action) }}</Badge>
            
            <div v-if="rule.action === 'change_status' && rule.actionConfig?.status" class="mt-2">
              <div class="text-xs text-muted-foreground">New Status</div>
              <div class="capitalize">{{ formatStatus(rule.actionConfig.status) }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mt-2">
              <div v-if="rule.actionConfig?.notifyStaff !== undefined">
                <div class="text-xs text-muted-foreground">Notify Staff</div>
                <Badge variant="outline" :class="rule.actionConfig.notifyStaff ? 'text-green-500' : 'text-muted-foreground'">
                  {{ rule.actionConfig.notifyStaff ? 'Yes' : 'No' }}
                </Badge>
              </div>
              
              <div v-if="rule.actionConfig?.updateDisplayed !== undefined">
                <div class="text-xs text-muted-foreground">Update Display Status</div>
                <Badge variant="outline" :class="rule.actionConfig.updateDisplayed ? 'text-green-500' : 'text-muted-foreground'">
                  {{ rule.actionConfig.updateDisplayed ? 'Yes' : 'No' }}
                </Badge>
              </div>
              
              <div v-if="rule.actionConfig?.redirectToAlternative !== undefined">
                <div class="text-xs text-muted-foreground">Redirect to Alternative</div>
                <Badge variant="outline" :class="rule.actionConfig.redirectToAlternative ? 'text-green-500' : 'text-muted-foreground'">
                  {{ rule.actionConfig.redirectToAlternative ? 'Yes' : 'No' }}
                </Badge>
              </div>
              
              <div v-if="rule.actionConfig?.alternativeProductId && rule.actionConfig.redirectToAlternative">
                <div class="text-xs text-muted-foreground">Alternative Product</div>
                <div>{{ getProductName(rule.actionConfig.alternativeProductId) }}</div>
              </div>
            </div>
          </div>
          
          <!-- Notifications -->
          <div v-if="rule.notifications && rule.actionConfig?.notifyStaff" class="space-y-2">
            <div class="text-sm font-medium">Notification Configuration</div>
            
            <div v-if="rule.notifications.channels?.length" class="space-y-1">
              <div class="text-xs text-muted-foreground">Channels</div>
              <div class="flex flex-wrap gap-2">
                <Badge v-for="channel in rule.notifications.channels" :key="channel" variant="outline">
                  {{ formatChannel(channel) }}
                </Badge>
              </div>
            </div>
            
            <div v-if="rule.notifications.webhookUrl" class="space-y-1">
              <div class="text-xs text-muted-foreground">Webhook URL</div>
              <code class="text-xs bg-muted p-1 rounded break-all">{{ rule.notifications.webhookUrl }}</code>
            </div>
          </div>
          
          <!-- Tags -->
          <div v-if="rule.tags?.length" class="space-y-2">
            <div class="text-sm font-medium">Tags</div>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="tag in rule.tags" :key="tag" variant="secondary">
                {{ tag }}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <!-- Metadata -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-xs text-muted-foreground">Created</div>
            <div>{{ formatDate(rule.createdAt) }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Last Updated</div>
            <div>{{ formatDate(rule.updatedAt) }}</div>
          </div>
          <div v-if="rule.createdBy">
            <div class="text-xs text-muted-foreground">Created By</div>
            <div>{{ rule.createdBy }}</div>
          </div>
          <div v-if="rule.updatedBy">
            <div class="text-xs text-muted-foreground">Updated By</div>
            <div>{{ rule.updatedBy }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter class="px-6 py-4 border-t">
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
      <Button @click="$emit('edit-rule', rule)">
        Edit Rule
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { format } from 'date-fns'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

const emit = defineEmits(['edit-rule', 'close'])

// Utility functions for formatting
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatTime(timeString) {
  if (!timeString) return 'Not specified'
  
  try {
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}`
  } catch (e) {
    return timeString
  }
}

function formatScope(scope) {
  switch (scope) {
    case 'global':
      return 'Global (All Products)'
    case 'category':
      return 'Category Based'
    case 'product':
      return 'Product Based'
    case 'item':
      return 'Item Based'
    default:
      return scope
  }
}

function formatTriggerType(triggerType) {
  switch (triggerType) {
    case 'stock_change':
      return 'Stock Change'
    case 'threshold':
      return 'Threshold'
    case 'scheduled':
      return 'Scheduled'
    case 'manual':
      return 'Manual'
    default:
      return triggerType
  }
}

function formatThresholdType(type) {
  return type === 'absolute' ? 'Absolute (Number)' : 'Percentage (%)'
}

function formatOperator(operator) {
  switch (operator) {
    case 'less_than':
      return 'Less Than (<)'
    case 'less_than_equal':
      return 'Less Than or Equal (≤)'
    case 'equal':
      return 'Equal (=)'
    case 'greater_than_equal':
      return 'Greater Than or Equal (≥)'
    case 'greater_than':
      return 'Greater Than (>)'
    default:
      return operator
  }
}

function formatDayOfWeek(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day] || day
}

function formatAction(action) {
  switch (action) {
    case 'update_inventory':
      return 'Update Inventory'
    case 'notify_only':
      return 'Notify Only'
    case 'hide_product':
      return 'Hide Product'
    case 'show_product':
      return 'Show Product'
    case 'change_status':
      return 'Change Status'
    default:
      return action
  }
}

function formatStatus(status) {
  switch (status) {
    case 'in_stock':
      return 'In Stock'
    case 'out_of_stock':
      return 'Out of Stock'
    case 'backordered':
      return 'Backordered'
    case 'discontinued':
      return 'Discontinued'
    case 'limited':
      return 'Limited Stock'
    default:
      return status
  }
}

function formatChannel(channel) {
  switch (channel) {
    case 'email':
      return 'Email'
    case 'sms':
      return 'SMS'
    case 'push':
      return 'Push Notification'
    case 'webhook':
      return 'Webhook'
    default:
      return channel
  }
}

function getTriggerBadgeVariant(triggerType) {
  switch (triggerType) {
    case 'stock_change':
      return 'default'
    case 'threshold':
      return 'warning'
    case 'scheduled':
      return 'info'
    case 'manual':
      return 'secondary'
    default:
      return 'outline'
  }
}

// Helper functions to get related entity names
function getCategoryName(categoryId) {
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : productId
}

function getItemName(itemId) {
  const item = props.items.find(i => i.id === itemId)
  return item ? (item.sku || item.name) : itemId
}
</script>