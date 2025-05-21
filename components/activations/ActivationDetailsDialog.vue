<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Activation Details</DialogTitle>
        <DialogDescription>
          View details for activation #{{ activation?.activationNumber }}
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <!-- Loading State -->
        <div v-if="!activation" class="flex justify-center py-8">
          <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div v-else class="space-y-6">
          <!-- Status Badge and Actions -->
          <div class="flex justify-between items-center">
            <Badge :variant="getStatusVariant(activation.status)" class="text-sm py-1 px-3">
              {{ formatStatus(activation.status) }}
            </Badge>

            <div class="flex space-x-2">
              <Button v-if="activation.status === 'pending'" variant="outline" size="sm" @click="$emit('schedule-activation', activation)">
                <CalendarIcon class="h-4 w-4 mr-2" /> Schedule Activation
              </Button>

              <Button v-if="['scheduled', 'in_progress', 'pending_test', 'test_failed'].includes(activation.status)"
                      variant="outline" size="sm" @click="$emit('perform-test', activation)">
                <FlaskConicalIcon class="h-4 w-4 mr-2" /> Perform Test
              </Button>

              <Button v-if="['test_passed', 'awaiting_customer'].includes(activation.status)"
                      variant="outline" size="sm" @click="$emit('complete-activation', activation)">
                <CheckCircleIcon class="h-4 w-4 mr-2" /> Complete Activation
              </Button>

              <Button v-if="activation.status === 'completed' && !activation.certificateGenerated"
                      variant="outline" size="sm" @click="$emit('generate-certificate', activation)">
                <AwardIcon class="h-4 w-4 mr-2" /> Generate Certificate
              </Button>

              <Button variant="outline" size="sm" @click="$emit('update-status', activation)">
                <ActivityIcon class="h-4 w-4 mr-2" /> Update Status
              </Button>
            </div>
          </div>

          <!-- Main Info Sections -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- System Information -->
              <div class="space-y-3">
                <h3 class="text-lg font-medium">System Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div class="text-muted-foreground">Installation ID</div>
                    <div>{{ activation.installationId }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">System Type</div>
                    <div>{{ activation.system.name }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="text-muted-foreground">System Details</div>
                    <div>{{ formatSystemType(activation.system.type) }}</div>
                  </div>
                </div>
              </div>

              <!-- Customer Information -->
              <div class="space-y-3">
                <h3 class="text-lg font-medium">Customer Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div class="text-muted-foreground">Name</div>
                    <div>{{ activation.customer.name }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Phone</div>
                    <div>{{ activation.customer.phone }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="text-muted-foreground">Email</div>
                    <div>{{ activation.customer.email }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="text-muted-foreground">Location</div>
                    <div>{{ activation.location.address }}</div>
                  </div>
                </div>
              </div>

              <!-- Schedule Information -->
              <div class="space-y-3">
                <h3 class="text-lg font-medium">Schedule Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div class="text-muted-foreground">Created Date</div>
                    <div>{{ formatDate(activation.createdAt) }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Scheduled Date</div>
                    <div>{{ formatDate(activation.scheduledDate) || 'Not scheduled' }}</div>
                  </div>
                  <div v-if="activation.scheduledDate">
                    <div class="text-muted-foreground">Time Slot</div>
                    <div>{{ formatTimeSlot(activation.timeSlot) }}</div>
                  </div>
                  <div v-if="activation.completionDate">
                    <div class="text-muted-foreground">Completion Date</div>
                    <div>{{ formatDate(activation.completionDate) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Test Results -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium">Test Results</h3>
                  <Button v-if="canPerformTest" variant="ghost" size="sm" @click="$emit('perform-test', activation)">
                    <PlusIcon class="h-4 w-4 mr-1" /> Add Test
                  </Button>
                </div>

                <div v-if="!activation.tests || activation.tests.length === 0"
                     class="text-sm text-muted-foreground border rounded-md p-4 text-center">
                  No tests have been performed yet
                </div>

                <div v-else class="space-y-3">
                  <div v-for="(test, index) in activation.tests" :key="test.id"
                       class="border rounded-md p-3 space-y-2">
                    <div class="flex justify-between items-start">
                      <div>
                        <Badge :variant="test.result === 'pass' ? 'success' : 'destructive'">
                          {{ test.result === 'pass' ? 'Pass' : 'Fail' }}
                        </Badge>
                        <span class="ml-2 text-sm font-medium">{{ formatTestType(test.testType) }}</span>
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ formatDate(test.testDate) }}
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div v-for="(value, key) in test.parameters" :key="key">
                        <span class="text-muted-foreground">{{ formatParameterName(key) }}:</span>
                        <span>{{ value }} {{ getParameterUnit(key) }}</span>
                      </div>
                    </div>

                    <div v-if="test.notes" class="text-xs">
                      <span class="text-muted-foreground">Notes:</span>
                      <p>{{ test.notes }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Completion Details -->
              <div v-if="activation.completionDetails" class="space-y-3">
                <h3 class="text-lg font-medium">Completion Details</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div class="text-muted-foreground">Completed By</div>
                    <div>{{ activation.completionDetails.technician }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Activation Time</div>
                    <div>{{ activation.completionDetails.activationTime }} hours</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Customer Signoff</div>
                    <div>{{ activation.completionDetails.customerSignoff ? 'Yes' : 'No' }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="text-muted-foreground">Notes</div>
                    <div>{{ activation.completionDetails.notes || 'No notes provided' }}</div>
                  </div>
                </div>
              </div>

              <!-- Certificate Information -->
              <div v-if="activation.certificateDetails" class="space-y-3">
                <h3 class="text-lg font-medium">Certificate Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div class="text-muted-foreground">Certificate Number</div>
                    <div>{{ activation.certificateDetails.certificateNumber }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Issue Date</div>
                    <div>{{ formatDate(activation.certificateDetails.issueDate) }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Expiry Date</div>
                    <div>{{ formatDate(activation.certificateDetails.expiryDate) }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Signed By</div>
                    <div>{{ activation.certificateDetails.signedBy }}</div>
                  </div>
                </div>

                <div class="text-center">
                  <Button variant="outline" @click="viewCertificate">
                    <FileTextIcon class="h-4 w-4 mr-2" /> View Certificate
                  </Button>
                </div>
              </div>

              <!-- General Notes -->
              <div class="space-y-3">
                <h3 class="text-lg font-medium">Notes</h3>
                <div class="border rounded-md p-3 text-sm">
                  {{ activation.notes || 'No notes available' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button @click="updateOpen(false)">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon, FlaskConicalIcon, CheckCircleIcon, AwardIcon, ActivityIcon,
  Loader2Icon, PlusIcon, FileTextIcon
} from 'lucide-vue-next'

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

const emit = defineEmits([
  'update:open',
  'perform-test',
  'update-status',
  'schedule-activation',
  'complete-activation',
  'generate-certificate'
])

// Computed
const canPerformTest = computed(() => {
  return ['scheduled', 'in_progress', 'pending_test', 'test_failed'].includes(props.activation?.status)
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatTimeSlot(timeSlot) {
  const timeSlotMap = {
    'morning': 'Morning (8:00 AM - 12:00 PM)',
    'afternoon': 'Afternoon (1:00 PM - 5:00 PM)'
  }

  return timeSlotMap[timeSlot] || timeSlot
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'pending_test': 'Pending Test',
    'test_failed': 'Test Failed',
    'test_passed': 'Test Passed',
    'awaiting_customer': 'Awaiting Customer',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
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

function formatTestType(type) {
  const typeMap = {
    'water_quality': 'Water Quality Test',
    'pressure': 'Pressure Test',
    'flow_rate': 'Flow Rate Test',
    'system_integrity': 'System Integrity Test',
    'electrical': 'Electrical System Test',
    'final': 'Final Inspection Test'
  }

  return typeMap[type] || type
}

function formatParameterName(parameter) {
  const parameterMap = {
    'ph': 'pH Level',
    'tds': 'TDS',
    'turbidity': 'Turbidity',
    'pressure': 'Pressure',
    'flowRate': 'Flow Rate',
    'chlorine': 'Chlorine Level',
    'hardness': 'Water Hardness',
    'temperature': 'Temperature'
  }

  return parameterMap[parameter] || parameter
}

function getParameterUnit(parameter) {
  const unitMap = {
    'ph': '',
    'tds': 'ppm',
    'turbidity': 'NTU',
    'pressure': 'PSI',
    'flowRate': 'L/min',
    'chlorine': 'ppm',
    'hardness': 'mg/L',
    'temperature': '°C'
  }

  return unitMap[parameter] || ''
}

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'scheduled': 'warning',
    'in_progress': 'primary',
    'pending_test': 'secondary',
    'test_failed': 'destructive',
    'test_passed': 'success',
    'awaiting_customer': 'warning',
    'completed': 'success',
    'cancelled': 'destructive'
  }

  return variantMap[status] || 'default'
}

function viewCertificate() {
  if (!props.activation.certificateDetails) return

  // In a real app, this would open a PDF or navigate to a certificate view
  alert(`Certificate #${props.activation.certificateDetails.certificateNumber} would open in a new window`)
}
</script>