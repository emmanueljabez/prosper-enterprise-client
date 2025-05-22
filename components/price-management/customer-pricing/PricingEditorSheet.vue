<template>
  <SheetContent class="sm:max-w-md md:max-w-lg w-full overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Edit Price Rule</SheetTitle>
      <SheetDescription>
        Make changes to the price rule for {{ pricingRule.customerName }}
      </SheetDescription>
    </SheetHeader>

    <div class="py-6">
      <div class="space-y-6">
        <!-- Customer & Product Info (Read-only) -->
        <div class="p-4 border rounded-md bg-muted/20 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Customer</p>
              <p class="font-medium">{{ pricingRule.customerName }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Product</p>
              <p class="font-medium">{{ pricingRule.productName }}</p>
            </div>
          </div>
          <div class="text-sm text-muted-foreground">
            <div class="flex items-center">
              <InfoIcon class="h-4 w-4 mr-2" />
              <span>Customer and product details cannot be changed. To create a different customer-product pairing, please create a new price rule.</span>
            </div>
          </div>
        </div>

        <!-- Editable Form -->
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
            <div v-if="!validationErrors.amount" class="text-sm mt-1 text-muted-foreground">
              <span v-if="calculatedPrice !== null">
                Customer price: <span class="font-medium">${{ calculatedPrice }}</span>
                <span v-if="calculateSavings">{{ calculateSavings }}</span>
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
    </div>

    <SheetFooter>
      <div class="flex space-x-2 w-full justify-end">
        <Button variant="outline" @click="$emit('close')">Cancel</Button>
        <Button 
          @click="updatePricing"
          :disabled="isSubmitting || !isValid"
          :class="{ 'opacity-50 cursor-not-allowed': isSubmitting || !isValid }"
        >
          <SaveIcon v-if="!isSubmitting" class="h-4 w-4 mr-2" />
          <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </Button>
      </div>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { format } from 'date-fns'
import { 
  CalendarIcon,
  InfoIcon,
  Loader2Icon,
  SaveIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  pricingRule: {
    type: Object,
    required: true
  },
  customers: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['pricing-updated', 'close'])

// Initialize form with pricing rule data
const form = reactive({
  id: props.pricingRule.id,
  customerId: props.pricingRule.customerId,
  customerName: props.pricingRule.customerName,
  productId: props.pricingRule.productId,
  productName: props.pricingRule.productName,
  productPrice: props.pricingRule.productPrice,
  discountType: props.pricingRule.discountType,
  amount: props.pricingRule.amount.toString(),
  startDate: props.pricingRule.startDate ? new Date(props.pricingRule.startDate) : new Date(),
  endDate: props.pricingRule.endDate ? new Date(props.pricingRule.endDate) : null,
  status: props.pricingRule.status,
  notes: props.pricingRule.notes || ''
})

// Store original values for comparison
const originalValues = reactive({ ...form })

// UI state
const validationErrors = ref({})
const isSubmitting = ref(false)

// Look up product information
const selectedProduct = computed(() => {
  return props.products.find(p => p.id === props.pricingRule.productId) || {
    price: props.pricingRule.productPrice || 0
  }
})

// Calculate customer price based on current inputs
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

// Calculate savings message
const calculateSavings = computed(() => {
  if (!selectedProduct.value || !form.amount) return ''

  const regularPrice = selectedProduct.value.price
  const customerPrice = parseFloat(calculatedPrice.value)
  
  if (customerPrice >= regularPrice) {
    return ''
  }
  
  const savingsAmount = regularPrice - customerPrice
  const savingsPercent = (savingsAmount / regularPrice) * 100

  return ` (Saves $${savingsAmount.toFixed(2)}, ${savingsPercent.toFixed(0)}% off)`
})

// Check if form is valid
const isValid = computed(() => {
  return Object.keys(validationErrors.value).length === 0 && 
         form.amount && 
         form.discountType && 
         form.startDate && 
         form.status
})

// Validate the form
const validateForm = () => {
  const errors = {}

  if (!form.discountType) {
    errors.discountType = 'Discount type is required'
  }

  if (!form.amount) {
    errors.amount = 'Amount is required'
  } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) < 0) {
    errors.amount = 'Amount must be a positive number'
  }
  
  if (form.discountType === 'percentage' && parseFloat(form.amount) > 100) {
    errors.amount = 'Percentage cannot be greater than 100%'
  }

  if (!form.startDate) {
    errors.startDate = 'Start date is required'
  }

  if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
    errors.endDate = 'End date must be after start date'
  }

  if (!form.status) {
    errors.status = 'Status is required'
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

// Watch for changes to validate in real-time
watch([() => form.discountType, () => form.amount, () => form.startDate, () => form.endDate, () => form.status], 
  () => {
    validateForm()
  }
)

// Submit handler
const updatePricing = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // Format dates for API
    const updatedPricing = {
      ...form,
      amount: parseFloat(form.amount),
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      calculatedPrice: calculatedPrice.value ? parseFloat(calculatedPrice.value) : null
    }

    emit('pricing-updated', updatedPricing)
  } catch (error) {
    console.error('Error updating pricing rule:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>