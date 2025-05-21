<template>
  <Sheet :open="open" @update:open="updateOpen">
    <SheetContent
        class="sm:max-w-2xl flex flex-col h-full overflow-hidden"
        position="right"
        size="xl"
        @click.stop
    >
      <SheetHeader class="flex-shrink-0">
        <SheetTitle>Edit Opportunity</SheetTitle>
        <SheetDescription>
          Update the details of this opportunity. Fields marked with an asterisk (*) are required.
        </SheetDescription>
      </SheetHeader>

      <div v-if="opportunity" class="flex-1 overflow-y-auto py-6 px-1" @click.stop>
        <Form :validation-schema="schema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
          <div class="space-y-6">
            <!-- Lead Information (Read-only) -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Lead Information</h3>

              <div class="border rounded-md p-3 bg-muted/20">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-xs text-muted-foreground">Name</p>
                    <p class="text-sm font-medium">{{ opportunity.lead.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Email</p>
                    <p class="text-sm font-medium">{{ opportunity.lead.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Phone</p>
                    <p class="text-sm font-medium">{{ opportunity.lead.phone }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Type</p>
                    <p class="text-sm font-medium">{{ opportunity.lead.type === 'business' ? 'Business' : 'Individual' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Opportunity Details -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Opportunity Details</h3>

              <div class="space-y-2">
                <Label for="name">Opportunity Name *</Label>
                <Field name="name" v-slot="{ field }">
                  <Input
                      id="name"
                      v-bind="field"
                      :placeholder="opportunity.name"
                      :class="{ 'border-red-500': errors.name }"
                      @click.stop
                  />
                </Field>
                <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="stage">Stage *</Label>
                  <Field name="stage" v-slot="{ field, handleChange }">
                    <Select
                        :value="field.value"
                        @update:value="handleChange"
                        @click.stop
                    >
                      <SelectTrigger :class="{ 'border-red-500': errors.stage }">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem value="prospecting">Prospecting</SelectItem>
                        <SelectItem value="qualification">Qualification</SelectItem>
                        <SelectItem value="needs_analysis">Needs Analysis</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <p v-if="errors.stage" class="text-sm text-red-500">{{ errors.stage }}</p>
                </div>

                <div class="space-y-2">
                  <Label for="expectedCloseDate">Expected Close Date *</Label>
                  <Field name="expectedCloseDate" v-slot="{ field }">
                    <Input
                        type="date"
                        v-bind="field"
                        :class="{ 'border-red-500': errors.expectedCloseDate }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.expectedCloseDate" class="text-sm text-red-500">{{ errors.expectedCloseDate }}</p>
                </div>

                <div class="space-y-2">
                  <Label for="probability">Probability (%) *</Label>
                  <Field name="probability" v-slot="{ field }">
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        v-bind="field"
                        :class="{ 'border-red-500': errors.probability }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.probability" class="text-sm text-red-500">{{ errors.probability }}</p>
                </div>

                <div class="space-y-2">
                  <Label for="currency">Currency *</Label>
                  <Field name="currency" v-slot="{ field, handleChange }">
                    <Select
                        :value="field.value"
                        @update:value="handleChange"
                        @click.stop
                    >
                      <SelectTrigger :class="{ 'border-red-500': errors.currency }">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent @click.stop>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <p v-if="errors.currency" class="text-sm text-red-500">{{ errors.currency }}</p>
                </div>
              </div>
            </div>

            <!-- Services -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Products & Services</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="addServiceItem"
                    @click.stop
                >
                  <PlusIcon class="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </div>

              <div v-if="serviceItems.length === 0" class="text-center py-8 border rounded-md bg-muted/20">
                <PackageIcon class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p class="text-sm text-muted-foreground">No services added yet.</p>
                <p class="text-xs text-muted-foreground mt-1">Click "Add Service" to add products or services.</p>
              </div>

              <div v-for="(item, index) in serviceItems" :key="index" class="border rounded-md p-4">
                <div class="flex justify-between items-start mb-4">
                  <Label :for="`service-${index}`" class="text-sm">Service *</Label>
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="removeServiceItem(index)"
                      @click.stop
                      class="h-8 w-8"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>

                <Select
                    :value="item.service"
                    @update:value="(value) => updateServiceItem(index, value)"
                    @click.stop
                >
                  <SelectTrigger :id="`service-${index}`">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent @click.stop>
                    <SelectItem
                        v-for="service in props.services"
                        :key="service.id"
                        :value="service.id"
                        @click.stop
                    >
                      {{ service.name }} ({{ formatCurrency(service.price, opportunity.currency) }})
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div v-if="item.service" class="mt-4 space-y-3">
                  <div>
                    <Label class="text-xs text-muted-foreground">Description</Label>
                    <p class="text-sm">{{ getServiceDescription(item.service) }}</p>
                  </div>
                  <div>
                    <Label class="text-xs text-muted-foreground">Price</Label>
                    <p class="text-sm font-medium">{{ formatCurrency(getServicePrice(item.service), opportunity.currency) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="serviceItems.length > 0" class="border-t pt-4 flex justify-between">
                <span class="font-medium">Total Amount:</span>
                <span class="font-bold">{{ formatCurrency(totalAmount, opportunity.currency) }}</span>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <Label for="notes">Notes</Label>
              <Field name="notes" v-slot="{ field }">
                <Textarea
                    v-bind="field"
                    placeholder="Add any additional notes about this opportunity..."
                    rows="3"
                    @click.stop
                />
              </Field>
            </div>
          </div>
        </Form>
      </div>

      <!-- Fixed footer with buttons -->
      <div class="border-t p-4 flex justify-end space-x-2 flex-shrink-0 bg-background">
        <Button type="button" variant="outline" @click="cancelForm" @click.stop>
          Cancel
        </Button>
        <Button type="submit" @click="handleSubmit" @click.stop>
          <span>Update Opportunity</span>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useForm, Field } from 'vee-validate'
import * as yup from 'yup'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PlusIcon,
  XIcon,
  PackageIcon,
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  opportunity: {
    type: Object,
    default: null
  },
  leads: {
    type: Array,
    default: () => []
  },
  services: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'opportunity-updated'])

// State
const isSubmitting = ref(false)
const serviceItems = ref([])

// Validation schema
const schema = yup.object({
  name: yup.string().required('Opportunity name is required'),
  stage: yup.string().required('Stage is required'),
  expectedCloseDate: yup.string().required('Expected close date is required'),
  probability: yup
      .number()
      .required('Probability is required')
      .min(0, 'Probability must be at least 0%')
      .max(100, 'Probability cannot exceed 100%'),
  currency: yup.string().required('Currency is required'),
  notes: yup.string()
})

// Form
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    stage: '',
    expectedCloseDate: '',
    probability: 0,
    currency: '',
    notes: ''
  }
})

// Computed properties
const totalAmount = computed(() => {
  return serviceItems.value.reduce((sum, item) => {
    const service = props.services.find(s => s.id === item.service)
    return sum + (service?.price || 0)
  }, 0)
})

// Methods
function updateOpen(value) {
  emit('update:open', value)

  if (!value) {
    resetForm()
  }
}

function resetFormData() {
  serviceItems.value = []

  // Reset form fields
  const form = document.querySelector('form')
  if (form) form.reset()
}

function cancelForm() {
  updateOpen(false)
}

function addServiceItem() {
  serviceItems.value.push({ service: '' })
}

function removeServiceItem(index) {
  serviceItems.value.splice(index, 1)
}

function updateServiceItem(index, serviceId) {
  serviceItems.value[index].service = serviceId
}

function getServiceDescription(serviceId) {
  const service = props.services.find(s => s.id === serviceId)
  return service?.description || ''
}

function getServicePrice(serviceId) {
  const service = props.services.find(s => s.id === serviceId)
  return service?.price || 0
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

// Initialize form with opportunity data when it changes
onMounted(() => {
  if (props.opportunity) {
    // Populate form values
    resetForm({
      values: {
        name: props.opportunity.name,
        stage: props.opportunity.stage,
        expectedCloseDate: props.opportunity.expectedCloseDate,
        probability: props.opportunity.probability,
        currency: props.opportunity.currency,
        notes: props.opportunity.notes || ''
      }
    })

    // Populate service items
    serviceItems.value = props.opportunity.services.map(service => ({
      service: service.id
    }))
  }
})
</script>