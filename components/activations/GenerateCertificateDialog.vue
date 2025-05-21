<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Generate System Certificate</DialogTitle>
        <DialogDescription>
          Generate certificate for activation #{{ activation?.activationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="generateCertificate" class="space-y-6 py-4">
        <div class="space-y-4">
          <!-- Certificate Preview -->
          <div class="border rounded-md bg-muted/30 p-6 space-y-4">
            <div class="text-center space-y-1">
              <h3 class="text-xl font-bold">CERTIFICATE OF WATER SYSTEM</h3>
              <p class="text-sm text-muted-foreground">Professional Water Treatment Solutions</p>
            </div>

            <div class="space-y-1 text-center mt-4">
              <p>This certifies that the water system installed at:</p>
              <p class="font-medium">{{ activation?.location?.address }}</p>
              <p>For customer: <span class="font-medium">{{ activation?.customer?.name }}</span></p>
            </div>

            <div class="space-y-1 text-center mt-4">
              <p>System Type: <span class="font-medium">{{ formatSystemType(activation?.system?.type) }}</span></p>
              <p>System Model: <span class="font-medium">{{ activation?.system?.name }}</span></p>
            </div>

            <div class="space-y-1 text-center mt-4">
              <p>Has been installed and activated according to manufacturer specifications</p>
              <p>and has passed all required quality and safety tests.</p>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p class="text-xs text-muted-foreground">Certificate Number</p>
                <p>{{ certificateNumber || 'CERT-0000' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Issue Date</p>
                <p>{{ formatDate(new Date()) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Expiry Date</p>
                <p>{{ formatDate(expiryDate) }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Certified By</p>
                <p>{{ signedBy }}</p>
              </div>
            </div>
          </div>

          <!-- Certificate Details Form -->
          <div class="space-y-2">
            <Label for="certificateNumber" required>Certificate Number</Label>
            <Input
                id="certificateNumber"
                v-model="certificateNumber"
                placeholder="Enter certificate number"
                :class="{ 'border-red-500': errors.certificateNumber }"
            />
            <p v-if="errors.certificateNumber" class="text-sm text-red-500">{{ errors.certificateNumber }}</p>
          </div>

          <div class="space-y-2">
            <Label for="expiryDate" required>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                    id="expiryDate"
                    variant="outline"
                    :class="[
                    'w-full justify-start text-left font-normal',
                    !expiryDate && 'text-muted-foreground',
                    errors.expiryDate && 'border-red-500'
                  ]"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ expiryDate ? formatDate(expiryDate) : 'Select date' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" @click.stop>
                <Calendar v-model="expiryDate" :disabled-dates="{ before: new Date() }" />
              </PopoverContent>
            </Popover>
            <p v-if="errors.expiryDate" class="text-sm text-red-500">{{ errors.expiryDate }}</p>
          </div>

          <div class="space-y-2">
            <Label for="signedBy" required>Certified By</Label>
            <Input
                id="signedBy"
                v-model="signedBy"
                placeholder="Enter name of certifying technician"
                :class="{ 'border-red-500': errors.signedBy }"
            />
            <p v-if="errors.signedBy" class="text-sm text-red-500">{{ errors.signedBy }}</p>
          </div>

          <div class="space-y-2">
            <Label for="notes">Additional Notes</Label>
            <Textarea
                id="notes"
                v-model="notes"
                placeholder="Add any additional notes for the certificate"
                rows="2"
                @click.stop
            />
          </div>

          <!-- Notification Options -->
          <div class="space-y-2">
            <Label class="text-base">Notification Options</Label>
            <div class="flex items-center space-x-2">
              <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
              <Label for="notifyCustomer" class="font-normal">Send certificate to customer by email</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Generate Certificate
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, addYears } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  activation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'certificate-generated'])

// Form state
const certificateNumber = ref('')
const expiryDate = ref(null)
const signedBy = ref('')
const notes = ref('')
const notifyCustomer = ref(true)
const errors = ref({})
const isSubmitting = ref(false)

// Watch for dialog open to initialize form
watch(() => props.open, (value) => {
  if (value) {
    initializeForm()
  }
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function initializeForm() {
  // Generate a random certificate number
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  certificateNumber.value = `CERT-${randomNum}`

  // Set expiry date to 1 year from now
  expiryDate.value = addYears(new Date(), 1)

  // Default signer
  signedBy.value = 'Water System Technician'

  notes.value = ''
  notifyCustomer.value = true
  errors.value = {}
}

function resetForm() {
  certificateNumber.value = ''
  expiryDate.value = null
  signedBy.value = ''
  notes.value = ''
  notifyCustomer.value = true
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!certificateNumber.value) {
    errors.value.certificateNumber = 'Certificate number is required'
    isValid = false
  }

  if (!expiryDate.value) {
    errors.value.expiryDate = 'Expiry date is required'
    isValid = false
  }

  if (!signedBy.value) {
    errors.value.signedBy = 'Certified by field is required'
    isValid = false
  }

  return isValid
}

function formatDate(date) {
  return date ? format(date, 'dd MMMM yyyy') : ''
}

function formatSystemType(type) {
  const typeMap = {
    'filtration': 'Water Filtration System',
    'purification': 'Water Purification System',
    'reverse_osmosis': 'Reverse Osmosis System',
    'commercial': 'Commercial Water Treatment System',
    'industrial': 'Industrial Water Management System'
  }

  return typeMap[type] || type
}

async function generateCertificate() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create certificate data
    const certificateData = {
      activation: props.activation,
      certificateDetails: {
        certificateNumber: certificateNumber.value,
        issueDate: new Date().toISOString(),
        expiryDate: expiryDate.value.toISOString(),
        signedBy: signedBy.value,
        notes: notes.value || null
      },
      notifyCustomer: notifyCustomer.value
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('certificate-generated', certificateData)
    updateOpen(false)
  } catch (error) {
    console.error('Error generating certificate:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>