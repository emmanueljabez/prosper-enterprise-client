<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Create New Ticket</SheetTitle>
        <SheetDescription>
          Create a new support ticket for a customer
        </SheetDescription>
      </SheetHeader>

      <div class="mt-6 space-y-6">
        <!-- Customer Selection -->
        <div class="space-y-2">
          <Label for="customerSearch">Customer</Label>
          <div class="relative">
            <Input
                id="customerSearch"
                v-model="customerSearch"
                placeholder="Search for a customer..."
                @input="handleCustomerSearch"
            />
            <div
                v-if="customerSearchResults.length > 0"
                class="absolute z-10 w-full mt-1 bg-popover shadow-md rounded-md border overflow-hidden"
            >
              <div
                  v-for="customer in customerSearchResults"
                  :key="customer.id"
                  class="p-2 hover:bg-muted cursor-pointer"
                  @click="selectCustomer(customer)"
              >
                <div class="font-medium">{{ customer.name }}</div>
                <div class="text-xs text-muted-foreground">ID: {{ customer.id }} | {{ customer.email }}</div>
              </div>
            </div>
          </div>
          <div v-if="selectedCustomer" class="p-2 bg-muted/50 rounded-md mt-2">
            <div class="flex justify-between">
              <div>
                <div class="font-medium">{{ selectedCustomer.name }}</div>
                <div class="text-xs text-muted-foreground">ID: {{ selectedCustomer.id }}</div>
              </div>
              <Button variant="ghost" size="icon" @click="selectedCustomer = null">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div class="flex items-center">
                <PhoneIcon class="h-3 w-3 mr-1 text-muted-foreground" />
                {{ selectedCustomer.phone }}
              </div>
              <div class="flex items-center">
                <MailIcon class="h-3 w-3 mr-1 text-muted-foreground" />
                {{ selectedCustomer.email }}
              </div>
              <div class="flex items-center col-span-2">
                <MapPinIcon class="h-3 w-3 mr-1 text-muted-foreground" />
                {{ selectedCustomer.address }}
              </div>
            </div>
          </div>
        </div>

        <!-- Ticket Title -->
        <div class="space-y-2">
          <Label for="ticketTitle">Ticket Title</Label>
          <Input id="ticketTitle" v-model="ticketTitle" placeholder="Brief description of the issue" />
        </div>

        <!-- Ticket Description -->
        <div class="space-y-2">
          <Label for="ticketDescription">Description</Label>
          <Textarea
              id="ticketDescription"
              v-model="ticketDescription"
              placeholder="Detailed description of the issue..."
              rows="4"
          />
        </div>

        <!-- Type and Priority -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="ticketType">Ticket Type</Label>
            <Select v-model="ticketType">
              <SelectTrigger id="ticketType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connectivity">Connectivity Issue</SelectItem>
                <SelectItem value="speed">Speed Problem</SelectItem>
                <SelectItem value="installation">New Installation</SelectItem>
                <SelectItem value="billing">Billing Question</SelectItem>
                <SelectItem value="equipment">Equipment Issue</SelectItem>
                <SelectItem value="service_change">Service Change</SelectItem>
                <SelectItem value="intermittent">Intermittent Service</SelectItem>
                <SelectItem value="outage">Outage Related</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="ticketPriority">Priority</Label>
            <Select v-model="ticketPriority">
              <SelectTrigger id="ticketPriority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Equipment Selection (if equipment issue) -->
        <div v-if="selectedCustomer && ticketType === 'equipment'" class="space-y-2">
          <Label>Customer Equipment</Label>
          <div class="bg-muted/50 rounded-md p-2 space-y-2">
            <div v-for="(item, index) in customerEquipment" :key="index" class="flex items-center">
              <input
                  type="radio"
                  :id="`equipment-${index}`"
                  :value="item"
                  v-model="selectedEquipment"
                  class="mr-2"
              />
              <label :for="`equipment-${index}`" class="text-sm cursor-pointer flex-1">
                {{ item.type }} - {{ item.model }} (S/N: {{ item.serialNumber }})
              </label>
            </div>
            <div v-if="customerEquipment.length === 0" class="text-sm text-muted-foreground">
              No equipment found for this customer
            </div>
          </div>
        </div>

        <!-- Additional Notes -->
        <div class="space-y-2">
          <Label for="additionalNotes">Additional Notes</Label>
          <Textarea
              id="additionalNotes"
              v-model="additionalNotes"
              placeholder="Any additional information..."
              rows="2"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="createTicket" :disabled="!isFormValid">Create Ticket</Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  XIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  customerData: {
    type: Array,
    required: true,
    default: () => []
  },
  equipmentData: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'submit'])

// Form state
const customerSearch = ref('')
const selectedCustomer = ref(null)
const ticketTitle = ref('')
const ticketDescription = ref('')
const ticketType = ref('')
const ticketPriority = ref('medium')
const selectedEquipment = ref(null)
const additionalNotes = ref('')

// Customer search results
const customerSearchResults = ref([])

// Get equipment for selected customer
const customerEquipment = computed(() => {
  if (!selectedCustomer.value) return []

  const customerData = props.equipmentData.find(c => c.customerId === selectedCustomer.value.id)
  return customerData ? customerData.equipment : []
})

// Form validation
const isFormValid = computed(() => {
  return (
      selectedCustomer.value &&
      ticketTitle.value.trim() !== '' &&
      ticketDescription.value.trim() !== '' &&
      ticketType.value !== ''
  )
})

// Handle customer search
function handleCustomerSearch() {
  if (customerSearch.value.trim().length < 2) {
    customerSearchResults.value = []
    return
  }

  const query = customerSearch.value.toLowerCase()
  customerSearchResults.value = props.customerData.filter(customer => {
    return (
        customer.name.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
    )
  }).slice(0, 5) // Limit to 5 results
}

// Select a customer from search results
function selectCustomer(customer) {
  selectedCustomer.value = customer
  customerSearch.value = ''
  customerSearchResults.value = []
}

// Create the ticket
function createTicket() {
  if (!isFormValid.value) return

  const ticketData = {
    title: ticketTitle.value,
    description: ticketDescription.value,
    type: ticketType.value,
    priority: ticketPriority.value,
    customer: selectedCustomer.value,
    equipment: selectedEquipment.value,
    additionalNotes: additionalNotes.value
  }

  emit('submit', ticketData)
  emit('update:open', false)

  // Reset form
  selectedCustomer.value = null
  ticketTitle.value = ''
  ticketDescription.value = ''
  ticketType.value = ''
  ticketPriority.value = 'medium'
  selectedEquipment.value = null
  additionalNotes.value = ''
}
</script>