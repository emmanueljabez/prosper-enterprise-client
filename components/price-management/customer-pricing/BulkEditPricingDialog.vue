<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Price Rules</DialogTitle>
      <DialogDescription>
        Make changes to {{ selectedPricingRules.length }} selected pricing rules at once.
        Only fields you modify will be updated.
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-6 py-4">
      <!-- Info about selection -->
      <div class="rounded-md bg-muted p-3">
        <div class="flex items-center">
          <InfoIcon class="h-5 w-5 mr-2 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">
            Editing {{ selectedPricingRules.length }} price rules. 
            <button 
              type="button" 
              class="underline font-medium hover:text-foreground"
              @click="showSelectionDetails = !showSelectionDetails"
            >
              {{ showSelectionDetails ? 'Hide details' : 'See details' }}
            </button>
          </p>
        </div>
        
        <div v-if="showSelectionDetails" class="mt-2 text-sm space-y-1 max-h-[150px] overflow-y-auto">
          <p v-for="(rule, index) in selectedPricingRules" :key="rule.id" class="text-muted-foreground">
            {{ index + 1 }}. {{ rule.customerName }} - {{ rule.productName }} 
            ({{ formatDiscountType(rule.discountType) }})
          </p>
        </div>
      </div>

      <!-- Edit form -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="col-span-2">
          <div class="flex items-center space-x-2 mb-2">
            <Checkbox v-model:checked="fieldsToUpdate.discountType" id="edit-discount-type" />
            <Label for="edit-discount-type">Discount Type</Label>
          </div>
          <Select
            v-model="form.discountType"
            :disabled="!fieldsToUpdate.discountType"
          >
            <SelectTrigger :class="{ 'opacity-50': !fieldsToUpdate.discountType }">
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage Discount</SelectItem>
              <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
              <SelectItem value="override">Price Override</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="validationErrors.discountType" class="text-destructive text-sm mt-1">
            {{ validationErrors.discountType }}
          </p>
        </div>

        <div class="col-span-2">
          <div class="flex items-center space-x-2 mb-2">
            <Checkbox v-model:checked="fieldsToUpdate.amount" id="edit-amount" />
            <Label for="edit-amount">Amount</Label>
          </div>
          <div class="relative">
            <span v-if="form.discountType === 'percentage'" class="absolute right-3 top-1/2 -translate-y-1/2">
              %
            </span>
            <span v-else class="absolute left-3 top-1/2 -translate-y-1/2">
              $
            </span>
            <Input
              :class="{
                'opacity-50': !fieldsToUpdate.amount,
                'pl-8': form.discountType !== 'percentage',
                'pr-8': form.discountType === 'percentage'
              }"
              type="number"
              step="0.01"
              :disabled="!fieldsToUpdate.amount"
              placeholder="Enter amount"
              v-model="form.amount"
            />
          </div>
          <p v-if="validationErrors.amount" class="text-destructive text-sm mt-1">
            {{ validationErrors.amount }}
          </p>
        </div>

        <div>
          <div class="flex items-center space-x-2 mb-2">
            <Checkbox v-model:checked="fieldsToUpdate.startDate" id="edit-start-date" />
            <Label for="edit-start-date">Start Date</Label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                :class="{ 'opacity-50': !fieldsToUpdate.startDate }"
                :disabled="!fieldsToUpdate.startDate"
                class="w-full justify-start text-left font-normal"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ form.startDate ? format(new Date(form.startDate), 'PPP') : 'Select start date' }}
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
          <p v-if="validationErrors.startDate" class="text-destructive text-sm mt-1">
            {{ validationErrors.startDate }}
          </p>
        </div>

        <div>
          <div class="flex items-center space-x-2 mb-2">
            <Checkbox v-model:checked="fieldsToUpdate.endDate" id="edit-end-date" />
            <Label for="edit-end-date">End Date</Label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                :class="{ 'opacity-50': !fieldsToUpdate.endDate }"
                :disabled="!fieldsToUpdate.endDate"
                class="w-full justify-start text-left font-normal"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ form.endDate ? format(new Date(form.endDate), 'PPP') : 'Select end date (optional)' }}
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
          <p v-if="validationErrors.endDate" class="text-destructive text-sm mt-1">
            {{ validationErrors.endDate }}
          </p>
        </div>

        <div class="col-span-2">
          <div class="flex items-center space-x-2 mb-2">
            <Checkbox v-model:checked="fieldsToUpdate.status" id="edit-status" />
            <Label for="edit-status">Status</Label>
          </div>
          <Select
            v-model="form.status"
            :disabled="!fieldsToUpdate.status"
          >
            <SelectTrigger :class="{ 'opacity-50': !fieldsToUpdate.status }">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="validationErrors.status" class="text-destructive text-sm mt-1">
            {{ validationErrors.status }}
          </p>
        </div>
      </div>
      
      <!-- Note about changes -->
      <div v-if="noFieldsSelected" class="rounded-md bg-destructive/10 border border-destructive/20 p-3">
        <div class="flex items-center">
          <AlertCircleIcon class="h-5 w-5 mr-2 text-destructive" />
          <p class="text-sm text-destructive">
            Please select at least one field to update
          </p>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button 
        @click="handleSubmit" 
        :disabled="isSubmitDisabled"
        :class="{ 'opacity-50 cursor-not-allowed': isSubmitDisabled }"
      >
        <SaveIcon v-if="!isSubmitting" class="h-4 w-4 mr-2" />
        <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
        {{ isSubmitting ? 'Updating...' : 'Update Price Rules' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { format } from 'date-fns'
import { 
  AlertCircleIcon, 
  CalendarIcon, 
  InfoIcon,
  Loader2Icon,
  SaveIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

const props = defineProps({
  selectedPricingRules: {
    type: Array,
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

// UI state
const showSelectionDetails = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref({})

// Form state
const form = reactive({
  discountType: 'percentage',
  amount: '',
  startDate: null,
  endDate: null,
  status: 'active'
})

// Track which fields to update
const fieldsToUpdate = reactive({
  discountType: false,
  amount: false,
  startDate: false,
  endDate: false,
  status: false
})

// Compute if no fields are selected for update
const noFieldsSelected = computed(() => {
  return !Object.values(fieldsToUpdate).some(value => value === true)
})

// Disable submit if no fields selected or validation errors
const isSubmitDisabled = computed(() => {
  return noFieldsSelected.value || 
         Object.keys(validationErrors.value).length > 0 ||
         isSubmitting.value
})

// Format discount type for display
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

// Validate the form
const validateForm = () => {
  const errors = {}

  if (fieldsToUpdate.discountType && !form.discountType) {
    errors.discountType = 'Discount type is required'
  }

  if (fieldsToUpdate.amount) {
    if (!form.amount) {
      errors.amount = 'Amount is required'
    } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) < 0) {
      errors.amount = 'Amount must be a positive number'
    }
    
    if (form.discountType === 'percentage' && parseFloat(form.amount) > 100) {
      errors.amount = 'Percentage cannot be greater than 100%'
    }
  }

  if (fieldsToUpdate.startDate && !form.startDate) {
    errors.startDate = 'Start date is required'
  }

  if (fieldsToUpdate.startDate && fieldsToUpdate.endDate && 
      form.startDate && form.endDate && 
      new Date(form.startDate) > new Date(form.endDate)) {
    errors.endDate = 'End date must be after start date'
  }

  if (fieldsToUpdate.status && !form.status) {
    errors.status = 'Status is required'
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

// Handle field changes to trigger validation
watch([form, fieldsToUpdate], () => {
  validateForm()
}, { deep: true })

// Submit handler
const handleSubmit = async () => {
  if (!validateForm() || noFieldsSelected.value) {
    return
  }

  isSubmitting.value = true

  try {
    // Prepare updates object with only checked fields
    const updates = {}
    for (const key in fieldsToUpdate) {
      if (fieldsToUpdate[key]) {
        updates[key] = form[key]
      }
    }

    // Emit event with selected rules and the updates to apply
    emit('pricing-updated', props.selectedPricingRules, updates)
  } catch (error) {
    console.error('Error preparing bulk update:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>