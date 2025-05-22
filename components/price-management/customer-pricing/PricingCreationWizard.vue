<template>
  <SheetContent class="sm:max-w-md md:max-w-lg w-full overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Create New Price Rule</SheetTitle>
      <SheetDescription>
        Set up special pricing for a specific customer
      </SheetDescription>
    </SheetHeader>

    <div class="py-6">
      <!-- Wizard Steps -->
      <div class="mb-8">
        <nav aria-label="Progress" class="w-full">
          <ol role="list" class="space-y-4 md:flex md:space-x-8 md:space-y-0">
            <li v-for="(step, index) in steps" :key="index" class="md:flex-1">
              <div 
                :class="[
                  'group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                  currentStep > index
                    ? 'border-primary'
                    : currentStep === index
                      ? 'border-primary'
                      : 'border-muted'
                ]"
              >
                <span 
                  :class="[
                    'text-sm font-medium',
                    currentStep > index
                      ? 'text-primary'
                      : currentStep === index
                        ? 'text-primary'
                        : 'text-muted-foreground'
                  ]"
                >
                  Step {{ index + 1 }}
                </span>
                <span class="text-sm font-medium">{{ step.name }}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Step Content -->
      <div class="space-y-6">
        <!-- Step 1: Customer Selection -->
        <div v-if="currentStep === 0">
          <div class="space-y-4">
            <div>
              <Label for="customer-search">Search Customer</Label>
              <div class="relative">
                <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-search"
                  v-model="searchQuery"
                  class="pl-8"
                  placeholder="Search by name, email, or ID"
                />
              </div>
            </div>

            <div class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[40px]"></TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="filteredCustomers.length === 0">
                    <TableCell :colspan="4" class="h-24 text-center">
                      <p class="text-muted-foreground">No customers found.</p>
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    v-for="customer in filteredCustomers" 
                    :key="customer.id"
                    :class="{ 'bg-muted/50': selectedCustomer?.id === customer.id }"
                    @click="selectCustomer(customer)"
                    class="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell>
                      <RadioGroup v-model="form.customerId">
                        <RadioGroupItem :value="customer.id" />
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <div class="font-medium">{{ customer.name }}</div>
                      <div class="text-xs text-muted-foreground">ID: {{ customer.id }}</div>
                    </TableCell>
                    <TableCell>{{ customer.email }}</TableCell>
                    <TableCell>
                      <Badge>{{ customer.type }}</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div v-if="validationErrors.customerId" class="text-destructive text-sm">
              {{ validationErrors.customerId }}
            </div>
          </div>
        </div>

        <!-- Step 2: Product Selection -->
        <div v-if="currentStep === 1">
          <div class="space-y-4">
            <div>
              <Label for="product-search">Search Product</Label>
              <div class="relative">
                <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  v-model="productSearchQuery"
                  class="pl-8"
                  placeholder="Search by name, SKU, or ID"
                />
              </div>
            </div>

            <div class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[40px]"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Regular Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="filteredProducts.length === 0">
                    <TableCell :colspan="4" class="h-24 text-center">
                      <p class="text-muted-foreground">No products found.</p>
                    </TableCell>
                  </TableRow>
                  <TableRow 
                    v-for="product in filteredProducts" 
                    :key="product.id"
                    :class="{ 'bg-muted/50': selectedProduct?.id === product.id }"
                    @click="selectProduct(product)"
                    class="cursor-pointer hover:bg-muted/30"
                  >
                    <TableCell>
                      <RadioGroup v-model="form.productId">
                        <RadioGroupItem :value="product.id" />
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <div class="font-medium">{{ product.name }}</div>
                      <div class="text-xs text-muted-foreground">ID: {{ product.id }}</div>
                    </TableCell>
                    <TableCell>{{ product.sku }}</TableCell>
                    <TableCell>${{ product.price.toFixed(2) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div v-if="validationErrors.productId" class="text-destructive text-sm">
              {{ validationErrors.productId }}
            </div>
          </div>
        </div>

        <!-- Step 3: Pricing Details -->
        <div v-if="currentStep === 2">
          <div class="space-y-6">
            <div>
              <Label for="discount-type">Discount Type</Label>
              <Select v-model="form.discountType">
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Discount</SelectItem>
                  <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
                  <SelectItem value="override">Price Override</SelectItem>
                </SelectContent>
              </Select>
              <div v-if="validationErrors.discountType" class="text-destructive text-sm mt-1">
                {{ validationErrors.discountType }}
              </div>
            </div>

            <div>
              <Label for="amount">
                {{ form.discountType === 'percentage' ? 'Percentage (%)' : 
                  form.discountType === 'fixed' ? 'Discount Amount' : 'Price Override' }}
              </Label>
              <div class="relative">
                <span v-if="form.discountType === 'percentage'" class="absolute right-3 top-1/2 -translate-y-1/2">
                  %
                </span>
                <span v-else class="absolute left-3 top-1/2 -translate-y-1/2">
                  $
                </span>
                <Input
                  id="amount"
                  v-model="form.amount"
                  type="number"
                  step="0.01"
                  :class="{
                    'pl-8': form.discountType !== 'percentage',
                    'pr-8': form.discountType === 'percentage'
                  }"
                  :placeholder="form.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 5.99'"
                />
              </div>
              <div v-if="validationErrors.amount" class="text-destructive text-sm mt-1">
                {{ validationErrors.amount }}
              </div>
              <div v-if="selectedProduct && !validationErrors.amount" class="text-sm mt-1 text-muted-foreground">
                <span v-if="calculatedPrice !== null">
                  Customer price: <span class="font-medium">${{ calculatedPrice }}</span>
                  ({{ calculateSavings }})
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label for="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      class="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ form.startDate ? format(new Date(form.startDate), 'PPP') : 'Select date' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar
                      mode="single"
                      v-model="form.startDate"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div v-if="validationErrors.startDate" class="text-destructive text-sm mt-1">
                  {{ validationErrors.startDate }}
                </div>
              </div>

              <div>
                <Label for="endDate">End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      class="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ form.endDate ? format(new Date(form.endDate), 'PPP') : 'No end date' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar
                      mode="single"
                      v-model="form.endDate"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div v-if="validationErrors.endDate" class="text-destructive text-sm mt-1">
                  {{ validationErrors.endDate }}
                </div>
              </div>
            </div>

            <div>
              <Label for="status">Status</Label>
              <Select v-model="form.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <div v-if="validationErrors.status" class="text-destructive text-sm mt-1">
                {{ validationErrors.status }}
              </div>
            </div>

            <div>
              <Label for="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                v-model="form.notes"
                placeholder="Add any additional information or context"
                rows="3"
              />
            </div>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="currentStep === 3">
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Review Your Price Rule</h3>
            
            <div class="rounded-md border p-4 space-y-4">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-sm text-muted-foreground">Customer</p>
                  <p class="font-medium">{{ selectedCustomer?.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Product</p>
                  <p class="font-medium">{{ selectedProduct?.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Discount Type</p>
                  <p class="font-medium">{{ formatDiscountType(form.discountType) }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Amount</p>
                  <p class="font-medium">
                    {{ form.discountType === 'percentage' ? `${form.amount}%` : `$${parseFloat(form.amount).toFixed(2)}` }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Regular Price</p>
                  <p class="font-medium">${{ selectedProduct?.price.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Customer Price</p>
                  <p class="font-medium text-primary">${{ calculatedPrice }}</p>
                  <p class="text-xs text-muted-foreground">{{ calculateSavings }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Start Date</p>
                  <p class="font-medium">{{ form.startDate ? format(new Date(form.startDate), 'PPP') : '—' }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">End Date</p>
                  <p class="font-medium">{{ form.endDate ? format(new Date(form.endDate), 'PPP') : 'No end date' }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Status</p>
                  <Badge :variant="getStatusBadgeVariant(form.status)">{{ form.status }}</Badge>
                </div>
              </div>
              
              <div v-if="form.notes">
                <p class="text-sm text-muted-foreground">Notes</p>
                <p>{{ form.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SheetFooter>
      <div class="flex justify-between w-full">
        <Button 
          v-if="currentStep > 0" 
          variant="outline" 
          @click="currentStep--"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Back
        </Button>
        <div v-else></div>
        
        <div class="flex space-x-2">
          <Button variant="outline" @click="$emit('close')">Cancel</Button>
          <Button 
            v-if="currentStep < steps.length - 1" 
            @click="nextStep"
          >
            Next
            <ArrowRightIcon class="h-4 w-4 ml-2" />
          </Button>
          <Button 
            v-else 
            @click="createPriceRule"
            :disabled="isSubmitting"
          >
            <SaveIcon v-if="!isSubmitting" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            {{ isSubmitting ? 'Creating...' : 'Create Price Rule' }}
          </Button>
        </div>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { format } from 'date-fns'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  Loader2Icon,
  SaveIcon,
  SearchIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const props = defineProps({
  customers: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['pricing-created', 'close'])

// Wizard steps
const steps = [
  { name: 'Customer' },
  { name: 'Product' },
  { name: 'Pricing' },
  { name: 'Review' }
]

// Form state
const form = reactive({
  customerId: '',
  customerName: '',
  productId: '',
  productName: '',
  productPrice: 0,
  discountType: 'percentage',
  amount: '',
  startDate: new Date(), // Default to today
  endDate: null,
  status: 'active',
  notes: ''
})

// UI state
const currentStep = ref(0)
const searchQuery = ref('')
const productSearchQuery = ref('')
const validationErrors = ref({})
const isSubmitting = ref(false)
const selectedCustomer = ref(null)
const selectedProduct = ref(null)

// Computed properties
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return props.customers.slice(0, 10) // Show first 10 by default

  const query = searchQuery.value.toLowerCase()
  return props.customers.filter(customer => 
    customer.name.toLowerCase().includes(query) || 
    (customer.email && customer.email.toLowerCase().includes(query)) ||
    customer.id.toString().includes(query)
  )
})

const filteredProducts = computed(() => {
  if (!productSearchQuery.value) return props.products.slice(0, 10) // Show first 10 by default

  const query = productSearchQuery.value.toLowerCase()
  return props.products.filter(product => 
    product.name.toLowerCase().includes(query) || 
    (product.sku && product.sku.toLowerCase().includes(query)) ||
    product.id.toString().includes(query)
  )
})

const calculatedPrice = computed(() => {
  if (!selectedProduct.value || !form.amount) return null

  const regularPrice = selectedProduct.value.price
  
  if (form.discountType === 'percentage') {
    const discount = regularPrice * (parseFloat(form.amount) / 100)
    return (regularPrice - discount).toFixed(2)
  } else if (form.discountType === 'fixed') {
    return (regularPrice - parseFloat(form.amount)).toFixed(2)
  } else { // override
    return parseFloat(form.amount).toFixed(2)
  }
})

const calculateSavings = computed(() => {
  if (!selectedProduct.value || !form.amount) return ''

  const regularPrice = selectedProduct.value.price
  const customerPrice = parseFloat(calculatedPrice.value)
  
  if (customerPrice >= regularPrice) {
    return ''
  }
  
  const savingsAmount = regularPrice - customerPrice
  const savingsPercent = (savingsAmount / regularPrice) * 100

  return `Saves $${savingsAmount.toFixed(2)} (${savingsPercent.toFixed(0)}%)`
})

// Methods
const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  form.customerId = customer.id
  form.customerName = customer.name
}

const selectProduct = (product) => {
  selectedProduct.value = product
  form.productId = product.id
  form.productName = product.name
  form.productPrice = product.price
}

const formatDiscountType = (type) => {
  switch (type) {
    case 'percentage':
      return 'Percentage Discount'
    case 'fixed':
      return 'Fixed Amount'
    case 'override':
      return 'Price Override'
    default:
      return type
  }
}

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'scheduled':
      return 'warning'
    default:
      return 'outline'
  }
}

// Validate current step
const validateCurrentStep = () => {
  const errors = {}

  if (currentStep.value === 0) {
    if (!form.customerId) {
      errors.customerId = 'Please select a customer'
    }
  }

  if (currentStep.value === 1) {
    if (!form.productId) {
      errors.productId = 'Please select a product'
    }
  }

  if (currentStep.value === 2) {
    if (!form.discountType) {
      errors.discountType = 'Please select a discount type'
    }

    if (!form.amount) {
      errors.amount = 'Please enter an amount'
    } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) < 0) {
      errors.amount = 'Amount must be a positive number'
    }
    
    if (form.discountType === 'percentage' && parseFloat(form.amount) > 100) {
      errors.amount = 'Percentage cannot be greater than 100%'
    }

    if (!form.startDate) {
      errors.startDate = 'Please select a start date'
    }

    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      errors.endDate = 'End date must be after start date'
    }

    if (!form.status) {
      errors.status = 'Please select a status'
    }
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

// Navigation
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
  }
}

// Create price rule
const createPriceRule = async () => {
  if (!validateCurrentStep()) {
    return
  }

  isSubmitting.value = true

  try {
    // Format the data for the API
    const pricingRule = {
      customerId: form.customerId,
      customerName: form.customerName,
      productId: form.productId,
      productName: form.productName,
      productPrice: form.productPrice,
      discountType: form.discountType,
      amount: parseFloat(form.amount),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      status: form.status,
      notes: form.notes || '',
      calculatedPrice: calculatedPrice.value ? parseFloat(calculatedPrice.value) : null
    }

    emit('pricing-created', pricingRule)
  } catch (error) {
    console.error('Error creating pricing rule:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>