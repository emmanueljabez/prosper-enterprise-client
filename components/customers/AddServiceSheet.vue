<template>
  <SheetContent class="sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Add Service</SheetTitle>
      <SheetDescription>
        Add a new service for {{ customer?.name }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="addService" class="space-y-4 py-6">
      <!-- Service Type -->
      <div class="space-y-2">
        <Label for="serviceType" required>Service Type</Label>
        <Select v-model="formData.type">
          <SelectTrigger id="serviceType" :class="{ 'border-destructive': errors.type }">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fiber">Fiber Internet</SelectItem>
            <SelectItem value="lte">LTE Wireless</SelectItem>
            <SelectItem value="wimax">WiMAX</SelectItem>
            <SelectItem value="dsl">DSL</SelectItem>
            <SelectItem value="business">Business Dedicated</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
          </SelectContent>
        </Select>
        <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
      </div>

      <!-- Service Plan -->
      <div class="space-y-2">
        <Label for="plan" required>Service Plan</Label>
        <Select v-model="formData.plan">
          <SelectTrigger id="plan" :class="{ 'border-destructive': errors.plan }">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup v-if="formData.type === 'fiber'">
              <SelectLabel>Fiber Plans</SelectLabel>
              <SelectItem value="fiber_basic">Basic (10 Mbps)</SelectItem>
              <SelectItem value="fiber_standard">Standard (30 Mbps)</SelectItem>
              <SelectItem value="fiber_premium">Premium (100 Mbps)</SelectItem>
            </SelectGroup>
            <SelectGroup v-else-if="formData.type === 'lte'">
              <SelectLabel>LTE Plans</SelectLabel>
              <SelectItem value="lte_basic">Basic (5 Mbps)</SelectItem>
              <SelectItem value="lte_standard">Standard (10 Mbps)</SelectItem>
              <SelectItem value="lte_premium">Premium (20 Mbps)</SelectItem>
            </SelectGroup>
            <SelectGroup v-else-if="formData.type === 'wimax'">
              <SelectLabel>WiMAX Plans</SelectLabel>
              <SelectItem value="wimax_basic">Basic (2 Mbps)</SelectItem>
              <SelectItem value="wimax_standard">Standard (5 Mbps)</SelectItem>
              <SelectItem value="wimax_premium">Premium (10 Mbps)</SelectItem>
            </SelectGroup>
            <SelectGroup v-else-if="formData.type === 'dsl'">
              <SelectLabel>DSL Plans</SelectLabel>
              <SelectItem value="dsl_basic">Basic (1 Mbps)</SelectItem>
              <SelectItem value="dsl_standard">Standard (2 Mbps)</SelectItem>
              <SelectItem value="dsl_premium">Premium (4 Mbps)</SelectItem>
            </SelectGroup>
            <SelectGroup v-else-if="formData.type === 'business'">
              <SelectLabel>Business Plans</SelectLabel>
              <SelectItem value="business_basic">Basic (50 Mbps)</SelectItem>
              <SelectItem value="business_standard">Standard (100 Mbps)</SelectItem>
              <SelectItem value="business_premium">Premium (500 Mbps)</SelectItem>
            </SelectGroup>
            <SelectGroup v-else-if="formData.type === 'satellite'">
              <SelectLabel>Satellite Plans</SelectLabel>
              <SelectItem value="satellite_basic">Basic (2 Mbps)</SelectItem>
              <SelectItem value="satellite_standard">Standard (5 Mbps)</SelectItem>
              <SelectItem value="satellite_premium">Premium (10 Mbps)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p v-if="errors.plan" class="text-sm text-destructive">{{ errors.plan }}</p>
      </div>

      <!-- Monthly Cost -->
      <div class="space-y-2">
        <Label for="monthlyCost" required>Monthly Cost (KES)</Label>
        <Input
            id="monthlyCost"
            v-model="formData.monthlyCost"
            type="number"
            placeholder="e.g. 3,000"
            :class="{ 'border-destructive': errors.monthlyCost }"
        />
        <p v-if="errors.monthlyCost" class="text-sm text-destructive">{{ errors.monthlyCost }}</p>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <Label for="notes">Notes</Label>
        <Textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Enter any additional information about this service"
        />
      </div>

      <SheetFooter class="pt-4">
        <Button
            type="button"
            variant="outline"
            @click="$emit('close')"
            :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
            type="submit"
            :disabled="isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          <span>Add Service</span>
        </Button>
      </SheetFooter>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['service-added', 'close'])

const formData = ref({
  type: '',
  plan: '',
  monthlyCost: '',
  notes: ''
})
const errors = ref({})
const isSubmitting = ref(false)

// Reset plan when type changes
watch(() => formData.value.type, () => {
  formData.value.plan = ''

  // Set default prices based on service type
  if (formData.value.type) {
    const basePrices = {
      'fiber': 3000,
      'lte': 2500,
      'wimax': 2000,
      'dsl': 1500,
      'business': 10000,
      'satellite': 5000
    }
    formData.value.monthlyCost = basePrices[formData.value.type] || 2000
  }
})

// Validation
function validate() {
  errors.value = {}
  let isValid = true

  if (!formData.value.type) {
    errors.value.type = 'Service type is required'
    isValid = false
  }

  if (!formData.value.plan) {
    errors.value.plan = 'Service plan is required'
    isValid = false
  }

  if (!formData.value.monthlyCost) {
    errors.value.monthlyCost = 'Monthly cost is required'
    isValid = false
  } else if (isNaN(formData.value.monthlyCost) || Number(formData.value.monthlyCost) <= 0) {
    errors.value.monthlyCost = 'Please enter a valid amount'
    isValid = false
  }

  return isValid
}

async function addService() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Get plan name from the plan value
    const planName = getPlanNameFromValue(formData.value.plan)

    // Prepare service data
    const serviceData = {
      id: `service${Date.now()}`,
      type: formData.value.type,
      plan: planName,
      monthlyCost: Number(formData.value.monthlyCost),
      notes: formData.value.notes,
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('service-added', {
      customer: props.customer,
      service: serviceData
    })

    emit('close')
  } catch (error) {
    console.error('Error adding service:', error)
  } finally {
    isSubmitting.value = false
  }
}

function getPlanNameFromValue(planValue) {
  // Map plan values to human-readable names
  const planTypes = {
    'basic': 'Basic',
    'standard': 'Standard',
    'premium': 'Premium'
  }

  const serviceTypes = {
    'fiber': 'Fiber Internet',
    'lte': 'LTE Wireless',
    'wimax': 'WiMAX',
    'dsl': 'DSL',
    'business': 'Business Dedicated',
    'satellite': 'Satellite'
  }

  if (!planValue) return ''

  const [serviceType, planType] = planValue.split('_')

  return `${serviceTypes[serviceType] || serviceType} ${planTypes[planType] || planType}`
}
</script>