<template>
  <Sheet :open="open" @update:open="updateOpen">
    <SheetContent
        class="sm:max-w-2xl flex flex-col h-full overflow-hidden"
        position="right"
        size="xl"
        @click.stop
    >
      <SheetHeader class="flex-shrink-0">
        <SheetTitle>Create New Opportunity</SheetTitle>
        <SheetDescription>
          Create a new sales opportunity. Fields marked with an asterisk (*) are required.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto py-6 px-1" @click.stop>
        <Form :validation-schema="schema" @submit="handleSubmit" v-slot="{ errors, isSubmitting }">
          <div class="space-y-6">
            <!-- Lead Selection -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium">Lead Information</h3>

              <div class="space-y-2">
                <Label for="leadId">Lead *</Label>
                <Field name="leadId" v-slot="{ field, handleChange }">
                  <Select
                      :value="field.value"
                      @update:value="handleChange"
                      @click.stop
                  >
                    <SelectTrigger :class="{ 'border-red-500': errors.leadId }">
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                    <SelectContent @click.stop>
                      <div class="flex items-center px-2 pb-1">
                        <Input
                            placeholder="Search leads..."
                            v-model="leadSearch"
                            class="h-8"
                            @click.stop
                        />
                      </div>
                      <SelectItem
                          v-for="lead in filteredLeads"
                          :key="lead.id"
                          :value="lead.id"
                          @click.stop
                      >
                        {{ lead.name }} ({{ lead.type === 'business' ? 'Business' : 'Individual' }})
                      </SelectItem>
                      <div v-if="filteredLeads.length === 0" class="p-2 text-center text-sm text-muted-foreground">
                        No leads found
                      </div>
                    </SelectContent>
                  </Select>
                </Field>
                <p v-if="errors.leadId" class="text-sm text-red-500">{{ errors.leadId }}</p>
              </div>

              <div v-if="selectedLead" class="border rounded-md p-3 bg-muted/20">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-xs text-muted-foreground">Name</p>
                    <p class="text-sm font-medium">{{ selectedLead.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Email</p>
                    <p class="text-sm font-medium">{{ selectedLead.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Phone</p>
                    <p class="text-sm font-medium">{{ selectedLead.phone }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Type</p>
                    <p class="text-sm font-medium">{{ selectedLead.type === 'business' ? 'Business' : 'Individual' }}</p>
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
                      placeholder="e.g. Fiber Installation for Daniel Kipchoge"
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

                <div class="space-y-2">
                  <Label for="probability">Probability % *</Label>
                  <Field name="probability" v-slot="{ field }">
                    <Input
                        type="number"
                        min="0"
                        max="100"
                        v-bind="field"
                        placeholder="e.g. 50"
                        :class="{ 'border-red-500': errors.probability }"
                        @click.stop
                    />
                  </Field>
                  <p v-if="errors.probability" class="text-sm text-red-500">{{ errors.probability }}</p>
                </div>
              </div>
            </div>

            <!-- Products/Services -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">Products & Services *</h3>
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

              <Field name="services" v-slot="{ errorMessage }">
                <div class="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead class="w-[200px]">Service</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead class="w-[120px] text-right">Price</TableHead>
                        <TableHead class="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-if="serviceItems.length === 0">
                        <TableCell colspan="4" class="text-center py-4 text-muted-foreground">
                          No services added. Click "Add Service" to add a service to this opportunity.
                        </TableCell>
                      </TableRow>
                      <TableRow v-for="(item, index) in serviceItems" :key="index">
                        <TableCell>
                          <Select
                              :value="item.service"
                              @update:value="(value) => updateServiceItem(index, value)"
                              @click.stop
                          >
                            <SelectTrigger class="w-full">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent @click.stop>
                              <SelectItem
                                  v-for="service in props.services"
                                  :key="service.id"
                                  :value="service.id"
                              >
                                {{ service.name }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div class="text-sm">
                            {{ getServiceDescription(item.service) }}
                          </div>
                        </TableCell>
                        <TableCell class="text-right">
                          {{ formatCurrency(getServicePrice(item.service)) }}
                        </TableCell>
                        <TableCell>
                          <Button
                              variant="ghost"
                              size="icon"
                              @click="removeServiceItem(index)"
                          >
                            <XIcon class="h-4 w-4" />
                            <span class="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan="2" class="text-right font-medium">
                          Total
                        </TableCell>
                        <TableCell class="text-right">
                          {{ formatCurrency(totalAmount) }}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
                <p v-if="errors.services" class="mt-2 text-sm text-red-500">{{ errors.services }}</p>
              </Field>
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
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <span>Create Opportunity</span>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import * as yup from 'yup'
import { Form, Field } from 'vee-validate'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { PlusIcon, XIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
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

const emit = defineEmits(['update:open', 'opportunity-created'])

// Form state
const leadSearch = ref('')
const serviceItems = ref([])
const isSubmitting = ref(false)

// Validation schema
const schema = yup.object({
  name: yup.string().required('Opportunity name is required'),
  leadId: yup.string().required('Lead is required'),
  stage: yup.string().required('Stage is required'),
  expectedCloseDate: yup.string().required('Expected close date is required'),
  currency: yup.string().required('Currency is required'),
  probability: yup.number()
      .required('Probability is required')
      .min(0, 'Probability must be between 0 and 100')
      .max(100, 'Probability must be between 0 and 100'),
  services: yup.array()
      .min(1, 'At least one service must be selected')
      .required('At least one service must be selected'),
  notes: yup.string()
})

// Computed properties
const filteredLeads = computed(() => {
  if (!leadSearch.value) return props.leads

  const search = leadSearch.value.toLowerCase()
  return props.leads.filter(lead =>
      lead.name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      (lead.company && lead.company.toLowerCase().includes(search))
  )
})

const selectedLead = computed(() => {
  const form = document.querySelector('form')
  if (!form) return null

  const leadId = form.elements.leadId?.value
  if (!leadId) return null

  return props.leads.find(lead => lead.id === leadId)
})

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

function resetForm() {
  leadSearch.value = ''
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

async function handleSubmit() {
  // Validate services
  if (serviceItems.value.length === 0) {
    return
  }

  try {
    isSubmitting.value = true

    // Get form values
    const form = document.querySelector('form')
    const name = form.elements.name.value
    const leadId = form.elements.leadId.value
    const stage = form.elements.stage.value
    const expectedCloseDate = form.elements.expectedCloseDate.value
    const currency = form.elements.currency.value
    const probability = parseInt(form.elements.probability.value)
    const notes = form.elements.notes.value

    // Generate a random opportunity ID with OPP-K prefix for Kenya
    const opportunityId = `OPP-K${Math.floor(10000 + Math.random() * 90000)}`

    // Map selected services to full service objects
    const selectedServices = serviceItems.value
        .filter(item => item.service)
        .map(item => {
          const service = props.services.find(s => s.id === item.service)
          return {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price
          }
        })

    // Create the opportunity object
    const opportunity = {
      id: opportunityId,
      name,
      leadId,
      lead: props.leads.find(lead => lead.id === leadId),
      stage,
      amount: totalAmount.value,
      currency,
      probability,
      expectedCloseDate,
      services: selectedServices,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: 'Current User', // In a real app, this would be the current user
      activities: [
        {
          id: `act-${uuidv4().slice(0, 8)}`,
          type: 'create',
          description: 'Opportunity created',
          date: new Date().toISOString(),
          performer: 'Current User'
        }
      ]
    }

    if (notes) {
      opportunity.notes = notes
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('opportunity-created', opportunity)
    updateOpen(false)
  } catch (error) {
    console.error('Error creating opportunity:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>