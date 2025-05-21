<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Run Network Diagnostics</DialogTitle>
        <DialogDescription>
          Test network connectivity for activation #{{ activation?.activationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="submitDiagnosticResults" class="space-y-6 py-4">
        <div class="space-y-4">
          <!-- Test Type -->
          <div class="space-y-2">
            <Label for="testType" required>Diagnostic Type</Label>
            <Select v-model="testType">
              <SelectTrigger id="testType" :class="{ 'border-red-500': errors.testType }">
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem value="connection">Basic Connectivity</SelectItem>
                <SelectItem value="speed">Speed Test</SelectItem>
                <SelectItem value="signal">Signal Strength</SelectItem>
                <SelectItem value="latency">Latency & Packet Loss</SelectItem>
                <SelectItem value="config">Configuration Verification</SelectItem>
                <SelectItem value="full">Full Network Diagnostic</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.testType" class="text-sm text-red-500">{{ errors.testType }}</p>
          </div>

          <!-- Test Result -->
          <div class="space-y-2">
            <Label for="testResult" required>Test Result</Label>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <RadioGroup v-model="testResult">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="pass" id="result-pass" />
                    <Label for="result-pass" class="font-normal">Pass</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="fail" id="result-fail" />
                    <Label for="result-fail" class="font-normal">Fail</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <p v-if="errors.testResult" class="text-sm text-red-500">{{ errors.testResult }}</p>
          </div>

          <!-- Parameters Section -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Test Parameters</h3>

            <div class="grid grid-cols-2 gap-4" v-if="testType === 'connection' || testType === 'full'">
              <!-- Router Connectivity -->
              <div class="space-y-2">
                <Label for="routerConnectivity">Router Connectivity</Label>
                <Select v-model="parameters.routerConnectivity">
                  <SelectTrigger id="routerConnectivity">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent @click.stop>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="intermittent">Intermittent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- WAN Status -->
              <div class="space-y-2">
                <Label for="wanStatus">WAN Status</Label>
                <Select v-model="parameters.wanStatus">
                  <SelectTrigger id="wanStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent @click.stop>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" v-if="testType === 'speed' || testType === 'full'">
              <!-- Download Speed -->
              <div class="space-y-2">
                <Label for="downloadSpeed">Download Speed (Mbps)</Label>
                <div class="relative">
                  <Input id="downloadSpeed" v-model="parameters.downloadSpeed" type="number" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Expected: {{ activation?.service?.speed }}</p>
              </div>

              <!-- Upload Speed -->
              <div class="space-y-2">
                <Label for="uploadSpeed">Upload Speed (Mbps)</Label>
                <div class="relative">
                  <Input id="uploadSpeed" v-model="parameters.uploadSpeed" type="number" min="0" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" v-if="testType === 'latency' || testType === 'full'">
              <!-- Latency -->
              <div class="space-y-2">
                <Label for="latency">Latency (ms)</Label>
                <div class="relative">
                  <Input id="latency" v-model="parameters.latency" type="number" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Good: < 50ms</p>
              </div>

              <!-- Packet Loss -->
              <div class="space-y-2">
                <Label for="packetLoss">Packet Loss (%)</Label>
                <div class="relative">
                  <Input id="packetLoss" v-model="parameters.packetLoss" type="number" step="0.1" min="0" max="100" />
                </div>
                <p class="text-xs text-muted-foreground">Good: < 1%</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" v-if="testType === 'signal' || testType === 'full'">
              <!-- Signal Strength -->
              <div class="space-y-2">
                <Label for="signalStrength">Signal Strength (dBm)</Label>
                <div class="relative">
                  <Input id="signalStrength" v-model="parameters.signalStrength" type="number" step="0.1" />
                </div>
                <p class="text-xs text-muted-foreground">Good: > -65 dBm</p>
              </div>

              <!-- Signal to Noise Ratio -->
              <div class="space-y-2">
                <Label for="snr">Signal-to-Noise Ratio (dB)</Label>
                <div class="relative">
                  <Input id="snr" v-model="parameters.snr" type="number" step="0.1" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Good: > 20 dB</p>
              </div>
            </div>

            <div v-if="testType === 'config' || testType === 'full'">
              <!-- IP Configuration -->
              <div class="space-y-2">
                <Label for="ipAddress">IP Address</Label>
                <Input id="ipAddress" v-model="parameters.ipAddress" placeholder="e.g., 192.168.1.1" />
              </div>

              <!-- DNS Configuration -->
              <div class="space-y-2 mt-2">
                <Label for="dnsServers">DNS Servers</Label>
                <Input id="dnsServers" v-model="parameters.dnsServers" placeholder="e.g., 8.8.8.8, 8.8.4.4" />
              </div>

              <!-- MAC Address -->
              <div class="space-y-2 mt-2">
                <Label for="macAddress">MAC Address</Label>
                <Input id="macAddress" v-model="parameters.macAddress" placeholder="e.g., 00:1A:2B:3C:4D:5E" />
              </div>
            </div>
          </div>

          <!-- Failure Information (conditional) -->
          <div v-if="testResult === 'fail'" class="space-y-4 border-t pt-4">
            <h3 class="text-sm font-medium">Failure Information</h3>

            <!-- Failure Reason -->
            <div class="space-y-2">
              <Label for="failureReason" required>Failure Reason</Label>
              <Select v-model="failureReason">
                <SelectTrigger id="failureReason" :class="{ 'border-red-500': errors.failureReason }">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="no_signal">No Signal</SelectItem>
                  <SelectItem value="weak_signal">Weak Signal</SelectItem>
                  <SelectItem value="speed_low">Speed Below Minimum</SelectItem>
                  <SelectItem value="packet_loss">Excessive Packet Loss</SelectItem>
                  <SelectItem value="connection_dropped">Connection Drops</SelectItem>
                  <SelectItem value="equipment_fault">Equipment Fault</SelectItem>
                  <SelectItem value="line_fault">Line Fault</SelectItem>
                  <SelectItem value="ip_conflict">IP Conflict</SelectItem>
                  <SelectItem value="config_error">Configuration Error</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.failureReason" class="text-sm text-red-500">{{ errors.failureReason }}</p>
            </div>

            <!-- Recommended Actions -->
            <div class="space-y-2">
              <Label for="recommendedActions" required>Recommended Actions</Label>
              <Textarea
                  id="recommendedActions"
                  v-model="recommendedActions"
                  placeholder="Detail actions needed to resolve the issue"
                  rows="3"
                  :class="{ 'border-red-500': errors.recommendedActions }"
                  @click.stop
              />
              <p v-if="errors.recommendedActions" class="text-sm text-red-500">{{ errors.recommendedActions }}</p>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="notes">Additional Notes</Label>
            <Textarea
                id="notes"
                v-model="notes"
                placeholder="Add any additional details about the diagnostic test"
                rows="3"
                @click.stop
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Submit Results
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2Icon } from 'lucide-vue-next'

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

const emit = defineEmits(['update:open', 'diagnostics-completed'])

// Form state
const testType = ref('')
const testResult = ref('pass')
const parameters = ref({
  // Connection parameters
  routerConnectivity: 'online',
  wanStatus: 'connected',

  // Speed parameters
  downloadSpeed: '',
  uploadSpeed: '',

  // Latency parameters
  latency: '',
  packetLoss: '',

  // Signal parameters
  signalStrength: '',
  snr: '',

  // Config parameters
  ipAddress: '',
  dnsServers: '',
  macAddress: '',

  notes: ''
})
const failureReason = ref('')
const recommendedActions = ref('')
const notes = ref('')
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
  // Set default values based on diagnostic type
  testType.value = ''
  testResult.value = 'pass'
  parameters.value = {
    routerConnectivity: 'online',
    wanStatus: 'connected',
    downloadSpeed: '',
    uploadSpeed: '',
    latency: '',
    packetLoss: '',
    signalStrength: '',
    snr: '',
    ipAddress: '',
    dnsServers: '',
    macAddress: '',
    notes: ''
  }
  failureReason.value = ''
  recommendedActions.value = ''
  notes.value = ''
  errors.value = {}
}

function resetForm() {
  testType.value = ''
  testResult.value = 'pass'
  parameters.value = {
    routerConnectivity: 'online',
    wanStatus: 'connected',
    downloadSpeed: '',
    uploadSpeed: '',
    latency: '',
    packetLoss: '',
    signalStrength: '',
    snr: '',
    ipAddress: '',
    dnsServers: '',
    macAddress: '',
    notes: ''
  }
  failureReason.value = ''
  recommendedActions.value = ''
  notes.value = ''
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!testType.value) {
    errors.value.testType = 'Diagnostic type is required'
    isValid = false
  }

  if (!testResult.value) {
    errors.value.testResult = 'Test result is required'
    isValid = false
  }

  if (testResult.value === 'fail' && !failureReason.value) {
    errors.value.failureReason = 'Failure reason is required for failed tests'
    isValid = false
  }

  if (testResult.value === 'fail' && !recommendedActions.value) {
    errors.value.recommendedActions = 'Recommended actions are required for failed tests'
    isValid = false
  }

  return isValid
}

function getDiagnosticParameters() {
  // Return relevant parameters based on test type
  let relevantParams = {}

  if (testType.value === 'connection' || testType.value === 'full') {
    relevantParams = {
      ...relevantParams,
      routerConnectivity: parameters.value.routerConnectivity,
      wanStatus: parameters.value.wanStatus
    }
  }

  if (testType.value === 'speed' || testType.value === 'full') {
    relevantParams = {
      ...relevantParams,
      downloadSpeed: parseFloat(parameters.value.downloadSpeed) || 0,
      uploadSpeed: parseFloat(parameters.value.uploadSpeed) || 0
    }
  }

  if (testType.value === 'latency' || testType.value === 'full') {
    relevantParams = {
      ...relevantParams,
      latency: parseFloat(parameters.value.latency) || 0,
      packetLoss: parseFloat(parameters.value.packetLoss) || 0
    }
  }

  if (testType.value === 'signal' || testType.value === 'full') {
    relevantParams = {
      ...relevantParams,
      signalStrength: parseFloat(parameters.value.signalStrength) || 0,
      snr: parseFloat(parameters.value.snr) || 0
    }
  }

  if (testType.value === 'config' || testType.value === 'full') {
    relevantParams = {
      ...relevantParams,
      ipAddress: parameters.value.ipAddress || '',
      dnsServers: parameters.value.dnsServers || '',
      macAddress: parameters.value.macAddress || ''
    }
  }

  return relevantParams
}

async function submitDiagnosticResults() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create diagnostic data
    const diagnosticData = {
      activation: props.activation,
      test: {
        id: `diag${Date.now()}`,
        testType: testType.value,
        testDate: new Date().toISOString(),
        result: testResult.value,
        parameters: getDiagnosticParameters(),
        failureReason: testResult.value === 'fail' ? failureReason.value : null,
        recommendedActions: testResult.value === 'fail' ? recommendedActions.value : null,
        notes: notes.value || null
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('diagnostics-completed', diagnosticData)
    updateOpen(false)
  } catch (error) {
    console.error('Error recording diagnostic results:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>