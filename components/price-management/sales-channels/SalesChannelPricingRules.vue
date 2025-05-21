<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">Pricing Rules</h3>
      <Button variant="outline" size="sm" @click="openCreateRuleDialog">
        <PlusIcon class="h-4 w-4 mr-2" />
        Add Rule
      </Button>
    </div>

    <!-- Rules Overview -->
    <div v-if="loading" class="flex justify-center py-6">
      <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
    
    <div v-else-if="rules.length === 0" class="border rounded-md p-8 text-center">
      <RulerIcon class="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <h3 class="text-lg font-medium mb-1">No Pricing Rules</h3>
      <p class="text-sm text-muted-foreground mb-4">
        Create pricing rules to customize how products are priced in this sales channel.
      </p>
      <Button @click="openCreateRuleDialog">
        <PlusIcon class="h-4 w-4 mr-2" />
        Create First Rule
      </Button>
    </div>
    
    <div v-else class="space-y-4">
      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          @click="activeFilter = 'all'"
          :class="{ 'bg-primary/10': activeFilter === 'all' }"
        >
          All
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="activeFilter = 'active'"
          :class="{ 'bg-primary/10': activeFilter === 'active' }"
        >
          Active
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="activeFilter = 'scheduled'"
          :class="{ 'bg-primary/10': activeFilter === 'scheduled' }"
        >
          Scheduled
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="activeFilter = 'customer_group'"
          :class="{ 'bg-primary/10': activeFilter === 'customer_group' }"
        >
          Customer Group
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="activeFilter = 'category'"
          :class="{ 'bg-primary/10': activeFilter === 'category' }"
        >
          Category
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          @click="activeFilter = 'product'"
          :class="{ 'bg-primary/10': activeFilter === 'product' }"
        >
          Product
        </Button>
      </div>

      <!-- Rules List -->
      <div class="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Adjustment</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead class="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="rule in filteredRules" :key="rule.id">
              <TableCell>
                <div class="font-medium">{{ rule.name }}</div>
                <div class="text-xs text-muted-foreground">{{ formatDate(rule.updatedAt) }}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ formatRuleType(rule.type) }}</Badge>
              </TableCell>
              <TableCell>
                <div class="font-medium">
                  {{ formatRuleAdjustment(rule) }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-col gap-1">
                  <Badge v-for="condition in formatRuleConditions(rule)" :key="condition" variant="secondary" class="max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {{ condition }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="rule.active ? 'success' : 'secondary'">
                  {{ rule.active ? 'Active' : 'Inactive' }}
                </Badge>
              </TableCell>
              <TableCell>
                {{ rule.priority }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Button variant="ghost" size="icon" @click="editRule(rule)">
                    <PencilIcon class="h-4 w-4" />
                    <span class="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" @click="toggleRuleStatus(rule)">
                    <PowerIcon class="h-4 w-4" />
                    <span class="sr-only">Toggle Status</span>
                  </Button>
                  <Button variant="ghost" size="icon" @click="confirmDeleteRule(rule)">
                    <TrashIcon class="h-4 w-4" />
                    <span class="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Rule Editor Dialog -->
    <Dialog v-model:open="showRuleEditor">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? 'Edit Pricing Rule' : 'Create Pricing Rule' }}</DialogTitle>
          <DialogDescription>
            {{ isEditMode ? 'Update the pricing rule for this sales channel' : 'Create a new pricing rule for this sales channel' }}
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="saveRule" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="rule-name">Rule Name</Label>
            <Input 
              id="rule-name" 
              v-model="ruleForm.name" 
              placeholder="Enter rule name" 
              :disabled="isSubmitting"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="rule-type">Rule Type</Label>
            <Select 
              v-model="ruleForm.type" 
              :disabled="isSubmitting || isEditMode"
            >
              <SelectTrigger id="rule-type">
                <SelectValue placeholder="Select rule type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                <SelectItem value="fixed_amount_discount">Fixed Amount Discount</SelectItem>
                <SelectItem value="customer_group_pricing">Customer Group Pricing</SelectItem>
                <SelectItem value="category_pricing">Category Pricing</SelectItem>
                <SelectItem value="product_pricing">Product Pricing</SelectItem>
                <SelectItem value="volume_pricing">Volume Pricing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="rule-adjustment">
              {{ getAdjustmentLabel() }}
            </Label>
            <div class="relative">
              <div v-if="['fixed_amount_discount', 'product_pricing'].includes(ruleForm.type)" class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span class="text-muted-foreground">$</span>
              </div>
              <Input 
                id="rule-adjustment" 
                type="number" 
                v-model="ruleForm.adjustment" 
                :placeholder="getAdjustmentPlaceholder()" 
                :disabled="isSubmitting"
                :class="{'pl-7': ['fixed_amount_discount', 'product_pricing'].includes(ruleForm.type)}"
                step="0.01"
              />
              <div v-if="['percentage_discount', 'customer_group_pricing', 'category_pricing'].includes(ruleForm.type)" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span class="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          
          <!-- Conditional Form Fields Based on Rule Type -->
          <div v-if="ruleForm.type === 'customer_group_pricing'" class="space-y-2">
            <Label for="customer-group">Customer Group</Label>
            <Select 
              v-model="ruleForm.conditions.customerGroupId" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="customer-group">
                <SelectValue placeholder="Select customer group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="group in customerGroups" 
                  :key="group.id" 
                  :value="group.id"
                >
                  {{ group.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div v-if="ruleForm.type === 'category_pricing'" class="space-y-2">
            <Label for="category">Category</Label>
            <Select 
              v-model="ruleForm.conditions.categoryId" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="category in categories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div v-if="ruleForm.type === 'product_pricing'" class="space-y-2">
            <Label for="product">Product</Label>
            <Select 
              v-model="ruleForm.conditions.productId" 
              :disabled="isSubmitting"
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="product in products" 
                  :key="product.id" 
                  :value="product.id"
                >
                  {{ product.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div v-if="ruleForm.type === 'volume_pricing'" class="space-y-2">
            <Label for="min-quantity">Minimum Quantity</Label>
            <Input 
              id="min-quantity" 
              type="number" 
              v-model="ruleForm.conditions.minQuantity" 
              placeholder="Enter minimum quantity" 
              :disabled="isSubmitting"
              min="1"
              step="1"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="space-y-2">
              <Label for="start-date">Start Date</Label>
              <Input 
                id="start-date" 
                type="date" 
                v-model="ruleForm.startDate" 
                :disabled="isSubmitting"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="end-date">End Date (Optional)</Label>
              <Input 
                id="end-date" 
                type="date" 
                v-model="ruleForm.endDate" 
                :disabled="isSubmitting"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="rule-priority">Priority</Label>
            <Input 
              id="rule-priority" 
              type="number" 
              v-model="ruleForm.priority" 
              placeholder="Enter priority (higher numbers = higher priority)" 
              :disabled="isSubmitting"
              min="0"
              step="1"
            />
            <p class="text-xs text-muted-foreground">
              Rules with higher priority will be applied first when multiple rules match
            </p>
          </div>
          
          <div class="flex items-center space-x-2 mt-4">
            <Switch id="rule-active" v-model="ruleForm.active" :disabled="isSubmitting" />
            <Label for="rule-active">Active</Label>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              @click="showRuleEditor = false" 
              :disabled="isSubmitting"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              :disabled="isSubmitting || !isFormValid"
            >
              <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
              {{ isEditMode ? 'Update Rule' : 'Create Rule' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteConfirmation">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Pricing Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this pricing rule? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="selectedRule" class="py-4">
          <div class="font-medium">{{ selectedRule.name }}</div>
          <div class="text-sm text-muted-foreground">{{ formatRuleType(selectedRule.type) }}</div>
          
          <Alert variant="destructive" class="mt-4">
            <AlertCircleIcon class="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Deleting this rule will immediately affect pricing for the applicable products.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showDeleteConfirmation = false" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            @click="deleteRule" 
            :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
            Delete Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  AlertCircleIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RulerIcon,
  TrashIcon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'

const props = defineProps({
  salesChannelId: {
    type: String,
    required: true
  },
  rules: {
    type: Array,
    default: () => []
  },
  customerGroups: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create-rule', 'update-rule', 'delete-rule'])
const { toast } = useToast()

// State
const activeFilter = ref('all')
const showRuleEditor = ref(false)
const showDeleteConfirmation = ref(false)
const isSubmitting = ref(false)
const selectedRule = ref(null)
const isEditMode = ref(false)

// Form state
const defaultRuleForm = {
  name: '',
  type: 'percentage_discount',
  adjustment: 0,
  conditions: {
    customerGroupId: '',
    categoryId: '',
    productId: '',
    minQuantity: 1
  },
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  priority: 0,
  active: true
}

const ruleForm = ref({ ...defaultRuleForm })

// Computed properties
const filteredRules = computed(() => {
  let result = [...props.rules]
  
  if (activeFilter.value === 'active') {
    result = result.filter(rule => rule.active)
  } else if (activeFilter.value === 'scheduled') {
    const now = new Date()
    result = result.filter(rule => {
      const startDate = rule.startDate ? new Date(rule.startDate) : null
      const endDate = rule.endDate ? new Date(rule.endDate) : null
      
      return (startDate && startDate > now) || (endDate && endDate > now)
    })
  } else if (activeFilter.value === 'customer_group') {
    result = result.filter(rule => rule.type === 'customer_group_pricing')
  } else if (activeFilter.value === 'category') {
    result = result.filter(rule => rule.type === 'category_pricing')
  } else if (activeFilter.value === 'product') {
    result = result.filter(rule => rule.type === 'product_pricing')
  }
  
  // Sort by priority
  result.sort((a, b) => b.priority - a.priority)
  
  return result
})

const isFormValid = computed(() => {
  if (!ruleForm.value.name) return false
  
  switch (ruleForm.value.type) {
    case 'customer_group_pricing':
      return !!ruleForm.value.conditions.customerGroupId
    case 'category_pricing':
      return !!ruleForm.value.conditions.categoryId
    case 'product_pricing':
      return !!ruleForm.value.conditions.productId
    case 'volume_pricing':
      return ruleForm.value.conditions.minQuantity > 0
    default:
      return true
  }
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return format(date, 'MMM dd, yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatRuleType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'percentage_discount': 'Percentage Discount',
    'fixed_amount_discount': 'Fixed Amount Discount',
    'customer_group_pricing': 'Customer Group',
    'category_pricing': 'Category',
    'product_pricing': 'Product',
    'volume_pricing': 'Volume'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatRuleAdjustment(rule) {
  if (!rule) return ''
  
  const adjustment = parseFloat(rule.adjustment) || 0
  
  switch (rule.type) {
    case 'percentage_discount':
    case 'customer_group_pricing':
    case 'category_pricing':
      return `${adjustment}%`
    case 'fixed_amount_discount':
    case 'product_pricing':
      return `$${adjustment.toFixed(2)}`
    case 'volume_pricing':
      return `${adjustment}% (min qty: ${rule.conditions.minQuantity})`
    default:
      return `${adjustment}`
  }
}

function formatRuleConditions(rule) {
  if (!rule || !rule.conditions) return []
  
  const conditions = []
  
  if (rule.conditions.customerGroupId) {
    const group = props.customerGroups.find(g => g.id === rule.conditions.customerGroupId)
    if (group) {
      conditions.push(`Group: ${group.name}`)
    }
  }
  
  if (rule.conditions.categoryId) {
    const category = props.categories.find(c => c.id === rule.conditions.categoryId)
    if (category) {
      conditions.push(`Category: ${category.name}`)
    }
  }
  
  if (rule.conditions.productId) {
    const product = props.products.find(p => p.id === rule.conditions.productId)
    if (product) {
      conditions.push(`Product: ${product.name}`)
    }
  }
  
  if (rule.conditions.minQuantity) {
    conditions.push(`Min Qty: ${rule.conditions.minQuantity}`)
  }
  
  if (rule.startDate) {
    conditions.push(`From: ${formatDate(rule.startDate)}`)
  }
  
  if (rule.endDate) {
    conditions.push(`Until: ${formatDate(rule.endDate)}`)
  }
  
  return conditions
}

function getAdjustmentLabel() {
  switch (ruleForm.value.type) {
    case 'percentage_discount':
      return 'Discount Percentage'
    case 'fixed_amount_discount':
      return 'Discount Amount'
    case 'customer_group_pricing':
      return 'Price Adjustment'
    case 'category_pricing':
      return 'Category Adjustment'
    case 'product_pricing':
      return 'Product Price'
    case 'volume_pricing':
      return 'Volume Discount'
    default:
      return 'Adjustment'
  }
}

function getAdjustmentPlaceholder() {
  switch (ruleForm.value.type) {
    case 'percentage_discount':
    case 'customer_group_pricing':
    case 'category_pricing':
    case 'volume_pricing':
      return '0'
    case 'fixed_amount_discount':
    case 'product_pricing':
      return '0.00'
    default:
      return '0'
  }
}

// Action functions
function openCreateRuleDialog() {
  isEditMode.value = false
  ruleForm.value = { ...defaultRuleForm }
  showRuleEditor.value = true
}

function editRule(rule) {
  isEditMode.value = true
  selectedRule.value = rule
  
  // Deep copy rule to form
  ruleForm.value = {
    ...defaultRuleForm,
    ...JSON.parse(JSON.stringify(rule))
  }
  
  showRuleEditor.value = true
}

function toggleRuleStatus(rule) {
  const updatedRule = {
    ...rule,
    active: !rule.active,
    updatedAt: new Date().toISOString()
  }
  
  emit('update-rule', updatedRule)
  
  toast({
    title: `Rule ${updatedRule.active ? 'activated' : 'deactivated'}`,
    description: `"${rule.name}" has been ${updatedRule.active ? 'activated' : 'deactivated'}`,
    variant: updatedRule.active ? 'success' : 'default'
  })
}

function confirmDeleteRule(rule) {
  selectedRule.value = rule
  showDeleteConfirmation.value = true
}

async function saveRule() {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    const formData = {
      ...ruleForm.value,
      salesChannelId: props.salesChannelId,
      updatedAt: new Date().toISOString()
    }
    
    if (isEditMode.value) {
      formData.id = selectedRule.value.id
      emit('update-rule', formData)
      
      toast({
        title: 'Rule updated',
        description: `"${formData.name}" has been updated successfully`,
        variant: 'success'
      })
    } else {
      formData.id = `rule_${Date.now()}`
      formData.createdAt = new Date().toISOString()
      emit('create-rule', formData)
      
      toast({
        title: 'Rule created',
        description: `"${formData.name}" has been created successfully`,
        variant: 'success'
      })
    }
    
    showRuleEditor.value = false
  } catch (error) {
    console.error('Error saving rule:', error)
    
    toast({
      title: 'Error',
      description: 'There was an error saving the pricing rule',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function deleteRule() {
  if (!selectedRule.value) return
  
  isSubmitting.value = true
  
  try {
    emit('delete-rule', selectedRule.value)
    
    toast({
      title: 'Rule deleted',
      description: `"${selectedRule.value.name}" has been deleted successfully`,
      variant: 'default'
    })
    
    showDeleteConfirmation.value = false
  } catch (error) {
    console.error('Error deleting rule:', error)
    
    toast({
      title: 'Error',
      description: 'There was an error deleting the pricing rule',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when rule type changes
watch(() => ruleForm.value.type, () => {
  ruleForm.value.conditions = {
    customerGroupId: '',
    categoryId: '',
    productId: '',
    minQuantity: 1
  }
})
</script>