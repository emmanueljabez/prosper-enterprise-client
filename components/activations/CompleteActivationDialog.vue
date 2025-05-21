<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Complete Service Activation</DialogTitle>
        <DialogDescription>
          Finalize activation #{{ activation?.activationNumber }} for {{ activation?.customer?.name }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="completeActivation" class="space-y-6 py-4">
        <div class="space-y-4">
          <!-- Activation Time -->
          <div class="space-y-2">
            <Label for="activationTime" required>Activation Time (hours)</Label>
            <Input
                id="activationTime"
                v-model="activationTime"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Enter total activation time in hours"
                :class="{ 'border-red-500': errors.activationTime }"
            />
            <p v-if="errors.activationTime" class="text-sm text-red-500">{{ errors.activationTime }}</p>
          </div>

          <!-- Network Information -->
          <div class="space-y-2">
            <Label for="ipAddress" required>Assigned IP Address</Label>
            <Input
                id="ipAddress"
                v-model="ipAddress"
                placeholder="e.g., 192.168.1.1"
                :class="{ 'border-red-500': errors.ipAddress }"
            />
            <p v-if="errors.ipAddress" class="text-sm text-red-500">{{ errors.ipAddress }}</p>
          </div>

          <!-- Equipment Information -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="routerMac">Router MAC Address</Label>
              <Input
                  id="routerMac"
                  v-model="routerMac"
                  placeholder="e.g., 00:1A:2B:3C:4D:5E"
              />
            </div>
            <div class="space-y-2">
              <Label for="equipmentSerialNumber">Equipment Serial Number</Label>
              <Input
                  id="equipmentSerialNumber"
                  v-model="equipmentSerialNumber"
                  placeholder="Serial number"
              />
            </div>
          </div>

          <!-- Final Tests Confirmation -->
          <div class="space-y-2">
            <Label class="text-base">Final Verification</Label>
            <div class="border rounded-md p-4 space-y-2">
              <div class="flex justify-between items-center text-sm">
                <div>All verification tests completed</div>
                <div>
                  <Badge v-if="allTestsCompleted" variant="success">Completed</Badge>
                  <Badge v-else variant="destructive">Incomplete</Badge>
                </div>
              </div>

              <!-- Missing Tests Warning -->
              <div v-if="!allTestsCompleted" class="text-sm text-destructive">
                <AlertCircleIcon class="h-4 w-4 inline-block mr-1" />
                <span>Warning: Not all required verification tests are completed.</span>
              </div>

              <!-- Action button -->
              <Button
                  v-if="!allTestsCompleted"
                  type="button"
                  variant="outline"
                  size="sm"
                  class="mt-2"
                  @click="$emit('run-diagnostics', activation)"
              >
                <ActivityIcon class="h-4 w-4 mr-2" />
                Run Verification Tests
              </Button>
            </div>
          </div>

          <!-- Customer Sign-off -->
          <div class="space-y-2">
            <Label for="customerSignoff" required>Customer Sign-off</Label>
            <div class="flex items-center space-x-2">
              <Checkbox id="customerSignoff" v-model="customerSignoff" :class="{ 'border-red-500': errors.customerSignoff }" />
              <Label for="customerSignoff" class="font-normal">Customer has confirmed service is working</Label>
            </div>
            <p v-if="errors.customerSignoff" class="text-sm text-red-500">{{ errors.customerSignoff }}</p>
          </div>

          <!-- Completion Notes -->
          <div class="space-y-2">
            <Label for="completionNotes">Completion Notes</Label>
            <Textarea
                id="completionNotes"
                v-model="completionNotes"
                placeholder="Add any final notes about the activation"
                rows="3"
                @click.stop
            />
          </div>

          <!-- Customer Education -->
          <div class="space-y-2">
            <Label class="text-base">Customer Education Checklist</Label>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="wifiSetup" v-model="educationChecklist.wifiSetup" />
                <Label for="wifiSetup" class="font-normal">Wi-Fi setup explained</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="troubleshooting" v-model="educationChecklist.troubleshooting" />
                <Label for="troubleshooting" class="font-normal">Basic troubleshooting explained</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="billingInfo" v-model="educationChecklist.billingInfo" />
                <Label for="billingInfo" class="font-normal">Billing information explained</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="supportContact" v-model="educationChecklist.supportContact" />
                <Label for="supportContact" class="font-normal">Support contact information provided</Label>
              </div>
            </div>
          </div>

          <!-- Notification Option -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="notifyCustomer" v-model="notifyCustomer" />
              <Label for="notifyCustomer" class="font-normal">Send completion confirmation to customer</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Complete Activation
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon, AlertCircleIcon, ActivityIcon } from 'lucide-vue-next'

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

const emit = defineEmits(['update:open', 'activation-completed', 'run-diagnostics'])

// Form state
const activationTime = ref(1)
const ipAddress = ref('')
const routerMac = ref('')
const equipmentSerialNumber = ref('')
const customerSignoff = ref(false)
const completionNotes = ref('')
const educationChecklist = ref({
  wifiSetup: false,
  troubleshooting: false,
  billingInfo: false,
  supportContact: false
})
const notifyCustomer = ref(true)
const errors = ref({})
const isSubmitting = ref(false)

// Computed properties
const allTestsCompleted = computed(() => {
  if (!props.activation) return false

  // Check if there are diagnostic tests with passing results
  const tests = props.activation.diagnosticTests || []
  return tests.some(test => test.result === 'pass')
})

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
  activationTime.value = 1
  ipAddress.value = props.activation?.ipAddress || ''
  routerMac.value = ''
  equipmentSerialNumber.value = ''
  customerSignoff.value = false
  completionNotes.value = ''
  educationChecklist.value = {
    wifiSetup: false,
    troubleshooting: false,
    billingInfo: false,
    supportContact: false
  }
  notifyCustomer.value = true
  errors.value = {}
}

function resetForm() {
  activationTime.value = 1
  ipAddress.value = ''
  routerMac.value = ''
  equipmentSerialNumber.value = ''
  customerSignoff.value = false
  completionNotes.value = ''
  educationChecklist.value = {
    wifiSetup: false,
    troubleshooting: false,
    billingInfo: false,
    supportContact: false
  }
  notifyCustomer.value = true
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!activationTime.value || activationTime.value <= 0) {
    errors.value.activationTime = 'Activation time is required'
    isValid = false
  }

  if (!ipAddress.value) {
    errors.value.ipAddress = 'IP address is required'
    isValid = false
  }

  if (!customerSignoff.value) {
    errors.value.customerSignoff = 'Customer sign-off is required to complete activation'
    isValid = false
  }

  return isValid
}

async function completeActivation() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create completion data
    const completionData = {
      activation: props.activation,
      activationTime: parseFloat(activationTime.value) || 0,
      ipAddress: ipAddress.value,
      networkDetails: {
        routerMac: routerMac.value || null,
        equipmentSerialNumber: equipmentSerialNumber.value || null
      },
      customerSignoff: customerSignoff.value,
      completionNotes: completionNotes.value || null,
      educationChecklist: educationChecklist.value,
      notifyCustomer: notifyCustomer.value,
      completedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('activation-completed', completionData)
    updateOpen(false)
  } catch (error) {
    console.error('Error completing activation:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>