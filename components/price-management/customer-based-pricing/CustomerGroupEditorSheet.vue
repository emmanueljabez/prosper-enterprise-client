<template>
  <Sheet :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <SheetContent class="sm:max-w-md md:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ isEditMode ? 'Edit Customer Group' : 'Create Customer Group' }}</SheetTitle>
        <SheetDescription>
          {{ isEditMode ? 'Update the customer group details below.' : 'Set up a new customer group for pricing.' }}
        </SheetDescription>
      </SheetHeader>
      
      <div class="py-6">
        <Tabs v-model="selectedTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="details">Group Details</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" class="space-y-6 pt-4">
            <!-- Group Details -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="group-name">Group Name <span class="text-destructive">*</span></Label>
                <Input 
                  id="group-name"
                  v-model="formData.name"
                  placeholder="E.g., VIP Customers"
                  :disabled="isProcessing"
                />
                <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
              </div>
              
              <div class="space-y-2">
                <Label for="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  v-model="formData.description"
                  placeholder="Describe this customer group"
                  rows="3"
                  :disabled="isProcessing"
                />
              </div>
              
              <Separator />
              
              <div class="space-y-4">
                <h3 class="text-sm font-medium">Pricing Settings</h3>
                
                <div class="space-y-2">
                  <Label for="discount-type">Discount Type</Label>
                  <Select 
                    v-model="formData.discountType"
                    :disabled="isProcessing"
                  >
                    <SelectTrigger id="discount-type">
                      <SelectValue placeholder="Select a discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Discount</SelectItem>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div v-if="formData.discountType === 'percentage'" class="space-y-2">
                  <Label for="discount-percentage">Discount Percentage</Label>
                  <div class="relative">
                    <Input
                      id="discount-percentage"
                      v-model="formData.discountValue"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Enter discount percentage"
                      :disabled="isProcessing"
                      class="pr-8"
                    />
                    <span class="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                  <p v-if="errors.discountValue" class="text-sm text-destructive">{{ errors.discountValue }}</p>
                </div>
                
                <div v-if="formData.discountType === 'fixed_amount'" class="space-y-2">
                  <Label for="discount-amount">Discount Amount</Label>
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="discount-amount"
                      v-model="formData.discountValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter discount amount"
                      :disabled="isProcessing"
                      class="pl-8"
                    />
                  </div>
                  <p v-if="errors.discountValue" class="text-sm text-destructive">{{ errors.discountValue }}</p>
                </div>
                
                <div class="space-y-2">
                  <Label for="pricing-tier">Pricing Tier</Label>
                  <Select 
                    v-model="formData.pricingTier"
                    :disabled="isProcessing"
                  >
                    <SelectTrigger id="pricing-tier">
                      <SelectValue placeholder="Select a pricing tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Default Tier</SelectItem>
                      <SelectItem 
                        v-for="tier in pricingTiers" 
                        :key="tier.id" 
                        :value="tier.id"
                      >
                        {{ tier.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div class="space-y-2">
                  <Label for="minimum-order">Minimum Order Amount</Label>
                  <div class="relative">
                    <span class="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="minimum-order"
                      v-model="formData.minimumOrderAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="No minimum"
                      :disabled="isProcessing"
                      class="pl-8"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <Switch
                    id="group-active"
                    v-model="formData.isActive"
                    :disabled="formData.isDefault || isProcessing"
                  />
                  <Label for="group-active">Group is active</Label>
                </div>
                <p v-if="formData.isDefault" class="text-xs text-muted-foreground">
                  The default group cannot be deactivated.
                </p>
              </div>
              
              <div class="space-y-2" v-if="!formData.isDefault">
                <div class="flex items-center space-x-2">
                  <Switch
                    id="set-as-default"
                    v-model="formData.isDefault"
                    :disabled="isProcessing"
                  />
                  <Label for="set-as-default">Set as default group</Label>
                </div>
                <p class="text-xs text-muted-foreground">
                  New customers will be automatically assigned to the default group.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" class="space-y-6 pt-4">
            <!-- Customer Assignment -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Customers in this Group</h3>
                <div v-if="selectedCustomers.length" class="text-sm text-muted-foreground">
                  {{ selectedCustomers.length }} customers selected
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="relative">
                  <Input
                    placeholder="Search customers by name, email or company..."
                    v-model="customerSearchQuery"
                    class="pr-10"
                  />
                  <Button 
                    v-if="customerSearchQuery" 
                    variant="ghost" 
                    size="icon"
                    class="absolute right-0 top-0 h-full"
                    @click="customerSearchQuery = ''"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
                
                <div v-if="isSearchingCustomers" class="flex justify-center py-4">
                  <Loader2Icon class="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
                
                <div v-else-if="filteredCustomers.length > 0" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <Checkbox 
                        id="select-all-customers"
                        :checked="isAllFiltered"
                        :indeterminate="isSomeFiltered && !isAllFiltered"
                        @update:checked="toggleAllFilteredCustomers"
                      />
                      <Label for="select-all-customers">Select all</Label>
                    </div>
                    
                    <Button 
                      v-if="filteredCustomers.length > 10"
                      variant="link" 
                      size="sm"
                      @click="showAllResults = !showAllResults"
                    >
                      {{ showAllResults ? 'Show fewer' : 'Show all results' }}
                    </Button>
                  </div>
                  
                  <ScrollArea :class="{ 'h-[250px]': filteredCustomers.length > 5 }" class="rounded-md border p-2">
                    <div class="space-y-1">
                      <div 
                        v-for="customer in displayedCustomers" 
                        :key="customer.id"
                        class="flex items-center space-x-2 rounded-md p-2 hover:bg-accent"
                      >
                        <Checkbox 
                          :id="`customer-${customer.id}`"
                          :checked="selectedCustomers.includes(customer.id)"
                          @update:checked="toggleCustomer(customer.id)"
                        />
                        <div>
                          <Label 
                            :for="`customer-${customer.id}`"
                            class="text-sm font-medium leading-none cursor-pointer"
                          >
                            {{ customer.firstName }} {{ customer.lastName }}
                          </Label>
                          <p class="text-xs text-muted-foreground">{{ customer.email }}</p>
                          <p v-if="customer.company" class="text-xs text-muted-foreground">{{ customer.company }}</p>
                        </div>
                        <Badge 
                          v-if="getCustomerGroupName(customer) && customer.groupId !== (props.editingGroup?.id || '')"
                          variant="outline" 
                          class="ml-auto text-xs"
                        >
                          {{ getCustomerGroupName(customer) }}
                        </Badge>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
                
                <div v-else-if="customerSearchQuery" class="py-4 text-center text-sm text-muted-foreground">
                  No customers found matching "{{ customerSearchQuery }}"
                </div>
                
                <div v-else class="py-4 text-center text-sm text-muted-foreground">
                  Search for customers to add them to this group
                </div>
              </div>
              
              <Alert v-if="isEditMode && selectedCustomers.length > 0">
                <AlertCircleIcon class="h-4 w-4" />
                <AlertTitle>Customer assignments will be updated</AlertTitle>
                <AlertDescription>
                  When you save changes, customers will be immediately moved to this group
                  and their pricing may change based on this group's settings.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <SheetFooter>
        <div class="w-full flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            @click="$emit('update:isOpen', false)"
            :disabled="isProcessing"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            @click="saveGroup"
            :disabled="isProcessing"
          >
            <Loader2Icon
              v-if="isProcessing"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ isEditMode ? 'Update Group' : 'Create Group' }}
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { 
  Loader2Icon,
  XIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  editingGroup: {
    type: Object,
    default: null
  },
  customers: {
    type: Array,
    default: () => []
  },
  customerGroups: {
    type: Array,
    default: () => []
  },
  pricingTiers: {
    type: Array,
    default: () => []
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:isOpen',
  'save',
  'search-customers'
])

// Form tabs
const selectedTab = ref('details')

// Empty form structure
const emptyForm = {
  name: '',
  description: '',
  discountType: 'none',
  discountValue: '',
  pricingTier: '',
  minimumOrderAmount: '',
  isActive: true,
  isDefault: false
}

// Form data
const formData = reactive({...emptyForm})

// Form validation errors
const errors = ref({})

// Customer selection
const selectedCustomers = ref([])

// Search
const customerSearchQuery = ref('')
const isSearchingCustomers = ref(false)
const showAllResults = ref(false)

// Computed properties
const isEditMode = computed(() => !!props.editingGroup)

const filteredCustomers = computed(() => {
  if (!customerSearchQuery.value) {
    // If in edit mode and no search, show customers already in this group
    if (isEditMode.value) {
      return props.customers.filter(customer => 
        customer.groupId === props.editingGroup.id || selectedCustomers.value.includes(customer.id)
      )
    }
    return props.customers.slice(0, 10)
  }
  
  const query = customerSearchQuery.value.toLowerCase()
  return props.customers.filter(customer => {
    return (
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.company && customer.company.toLowerCase().includes(query))
    )
  }).slice(0, 100) // Limit results
})

const displayedCustomers = computed(() => {
  if (showAllResults.value) {
    return filteredCustomers.value
  }
  return filteredCustomers.value.slice(0, 10)
})

const isAllFiltered = computed(() => {
  return filteredCustomers.value.length > 0 && 
    filteredCustomers.value.every(customer => selectedCustomers.value.includes(customer.id))
})

const isSomeFiltered = computed(() => {
  return filteredCustomers.value.some(customer => selectedCustomers.value.includes(customer.id))
})

// Methods
function getCustomerGroupName(customer) {
  if (!customer.groupId) return null
  
  const group = props.customerGroups.find(g => g.id === customer.groupId)
  return group ? group.name : null
}

function toggleCustomer(customerId) {
  const index = selectedCustomers.value.indexOf(customerId)
  if (index === -1) {
    selectedCustomers.value.push(customerId)
  } else {
    selectedCustomers.value.splice(index, 1)
  }
}

function toggleAllFilteredCustomers(checked) {
  if (checked) {
    // Add all filtered customers to selection (if not already selected)
    filteredCustomers.value.forEach(customer => {
      if (!selectedCustomers.value.includes(customer.id)) {
        selectedCustomers.value.push(customer.id)
      }
    })
  } else {
    // Remove all filtered customers from selection
    selectedCustomers.value = selectedCustomers.value.filter(
      id => !filteredCustomers.value.some(customer => customer.id === id)
    )
  }
}

function resetForm() {
  Object.assign(formData, {...emptyForm})
  selectedCustomers.value = []
  errors.value = {}
  selectedTab.value = 'details'
  customerSearchQuery.value = ''
  showAllResults.value = false
}

function validateForm() {
  const newErrors = {}
  
  // Required fields validation
  if (!formData.name) {
    newErrors.name = 'Group name is required'
  }
  
  if ((formData.discountType === 'percentage' || formData.discountType === 'fixed_amount') && !formData.discountValue) {
    newErrors.discountValue = 'Discount value is required when a discount type is selected'
  }
  
  if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
    newErrors.discountValue = 'Percentage must be between 0 and 100'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function prepareFormData() {
  const result = { ...formData }
  
  // Set customer IDs
  result.customerIds = [...selectedCustomers.value]
  
  // Convert string values to numbers where needed
  if (result.discountValue) {
    result.discountValue = parseFloat(result.discountValue)
  }
  
  if (result.minimumOrderAmount) {
    result.minimumOrderAmount = parseFloat(result.minimumOrderAmount)
  } else {
    result.minimumOrderAmount = 0
  }
  
  // Ensure default groups are always active
  if (result.isDefault) {
    result.isActive = true
  }
  
  return result
}

function saveGroup() {
  if (!validateForm()) {
    // Switch to the tab with errors
    if (errors.value.name || errors.value.discountValue) {
      selectedTab.value = 'details'
    }
    return
  }
  
  const finalData = prepareFormData()
  
  // Add ID if in edit mode
  if (isEditMode.value) {
    finalData.id = props.editingGroup.id
  }
  
  emit('save', finalData)
}

// Watch for search queries to trigger search
watch(customerSearchQuery, (query) => {
  if (query.length > 2) {
    isSearchingCustomers.value = true
    emit('search-customers', query)
    // Simulate search completion
    setTimeout(() => {
      isSearchingCustomers.value = false
    }, 500)
  }
})

// Watch for prop changes to populate form
watch(() => props.editingGroup, (group) => {
  if (group) {
    // Reset form and populate with group data
    resetForm()
    
    // Basic details
    formData.name = group.name || ''
    formData.description = group.description || ''
    formData.discountType = group.discountType || 'none'
    formData.discountValue = group.discountValue || ''
    formData.pricingTier = group.pricingTier || ''
    formData.minimumOrderAmount = group.minimumOrderAmount || ''
    formData.isActive = group.isActive !== undefined ? group.isActive : true
    formData.isDefault = group.isDefault !== undefined ? group.isDefault : false
    
    // Find customers that belong to this group
    const groupCustomers = props.customers
      .filter(customer => customer.groupId === group.id)
      .map(customer => customer.id)
    
    selectedCustomers.value = [...groupCustomers]
  } else {
    // Reset form when not in edit mode
    resetForm()
  }
}, { immediate: true, deep: true })

// Reset form when dialog is opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.editingGroup) {
    resetForm()
  }
})
</script>