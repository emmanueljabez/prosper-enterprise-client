<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Perform System Test</DialogTitle>
        <DialogDescription>
          Record test results for activation #{{ activation?.activationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="submitTestResults" class="space-y-6 py-4">
        <div class="space-y-4">
          <!-- Test Type -->
          <div class="space-y-2">
            <Label for="testType" required>Test Type</Label>
            <Select v-model="testType">
              <SelectTrigger id="testType" :class="{ 'border-red-500': errors.testType }">
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent @click.stop>
                <SelectItem value="water_quality">Water Quality Test</SelectItem>
                <SelectItem value="pressure">Pressure Test</SelectItem>
                <SelectItem value="flow_rate">Flow Rate Test</SelectItem>
                <SelectItem value="system_integrity">System Integrity Test</SelectItem>
                <SelectItem value="electrical">Electrical System Test</SelectItem>
                <SelectItem value="final">Final Inspection Test</SelectItem>
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

            <div class="grid grid-cols-2 gap-4" v-if="testType === 'water_quality'">
              <!-- pH Level -->
              <div class="space-y-2">
                <Label for="ph">pH Level</Label>
                <div class="relative">
                  <Input id="ph" v-model="parameters.ph" type="number" step="0.1" min="0" max="14" />
                </div>
                <p class="text-xs text-muted-foreground">Normal range: 6.5-8.5</p>
              </div>

              <!-- TDS -->
              <div class="space-y-2">
                <Label for="tds">TDS (ppm)</Label>
                <div class="relative">
                  <Input id="tds" v-model="parameters.tds" type="number" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Normal range: 50-500 ppm</p>
              </div>

              <!-- Turbidity -->
              <div class="space-y-2">
                <Label for="turbidity">Turbidity (NTU)</Label>
                <div class="relative">
                  <Input id="turbidity" v-model="parameters.turbidity" type="number" step="0.01" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Target: < 1.0 NTU</p>
              </div>

              <!-- Chlorine -->
              <div class="space-y-2">
                <Label for="chlorine">Chlorine (ppm)</Label>
                <div class="relative">
                  <Input id="chlorine" v-model="parameters.chlorine" type="number" step="0.1" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Target: < 2.0 ppm</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" v-if="testType === 'pressure' || testType === 'flow_rate'">
              <!-- Pressure -->
              <div class="space-y-2">
                <Label for="pressure">System Pressure (PSI)</Label>
                <div class="relative">
                  <Input id="pressure" v-model="parameters.pressure" type="number" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Normal range: 40-80 PSI</p>
              </div>

              <!-- Flow Rate -->
              <div class="space-y-2">
                <Label for="flowRate">Flow Rate (L/min)</Label>
                <div class="relative">
                  <Input id="flowRate" v-model="parameters.flowRate" type="number" step="0.1" min="0" />
                </div>
                <p class="text-xs text-muted-foreground">Target: > 5.0 L/min</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4" v-if="testType === 'system_integrity' || testType === 'electrical' || testType === 'final'">
              <div class="space-y-2">
                <Label for="systemParams">Parameter Notes</Label>
                <Textarea
                    id="systemParams"
                    v-model="parameters.notes"
                    placeholder="Enter test parameter details"
                    rows="2"
                    @click.stop
                />
              </div>
            </div>
          </div>

          <!-- Failure Reason (if failed) -->
          <div v-if="testResult === 'fail'" class="space-y-2">
            <Label for="failureReason" required>Failure Reason</Label>
            <Textarea
                id="failureReason"
                v-model="failureReason"
                placeholder="Describe the reason for test failure"
                rows="2"
                :class="{ 'border-red-500': errors.failureReason }"
                @click.stop
            />
            <p v-if="errors.failureReason" class="text-sm text-red-500">{{ errors.failureReason }}</p>
          </div>

          <!-- Recommended Actions (if failed) -->
          <div v-if="testResult === 'fail'" class="space-y-2">
            <Label for="recommendedActions">Recommended Actions</Label>
            <Textarea
                id="recommendedActions"
                v-model="recommendedActions"
                placeholder="List recommended actions to resolve the issue"
                rows="2"
                @click.stop
            />
          </div>

          <!-- General Notes -->
          <div class="space-y-2">
            <Label for="notes">Additional Notes</Label>
            <Textarea
                id="notes"
                v-model="notes"
                placeholder="Add any additional notes about this test"
                rows="3"
                @click.stop
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Record Test Results
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const emit = defineEmits(['update:open', 'test-completed'])

// Form state
const testType = ref('')
const testResult = ref('pass')
const parameters = reactive({
  ph: 7.0,
  tds: 150,
  turbidity: 0.5,
  chlorine: 0.5,
  pressure: 60,
  flowRate: 7.5,
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
  // Determine most appropriate test type based on status and previous tests
  const tests = props.activation?.tests || []
  if (tests.length === 0) {
    testType.value = 'water_quality'
  } else if (!tests.some(test => test.testType === 'water_quality')) {
    testType.value = 'water_quality'
  } else if (!tests.some(test => test.testType === 'pressure')) {
    testType.value = 'pressure'
  } else {
    testType.value = 'final'
  }

  testResult.value = 'pass'
  resetParameters()
  failureReason.value = ''
  recommendedActions.value = ''
  notes.value = ''
  errors.value = {}
}

function resetParameters() {
  parameters.ph = 7.0
  parameters.tds = 150
  parameters.turbidity = 0.5
  parameters.chlorine = 0.5
  parameters.pressure = 60
  parameters.flowRate = 7.5
  parameters.notes = ''
}

function resetForm() {
  testType.value = ''
  testResult.value = 'pass'
  resetParameters()
  failureReason.value = ''
  recommendedActions.value = ''
  notes.value = ''
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!testType.value) {
    errors.value.testType = 'Test type is required'
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

  return isValid
}

function getTestParameters() {
  // Return only relevant parameters based on test type
  if (testType.value === 'water_quality') {
    return {
      ph: parseFloat(parameters.ph) || 7.0,
      tds: parseInt(parameters.tds) || 150,
      turbidity: parseFloat(parameters.turbidity) || 0.5,
      chlorine: parseFloat(parameters.chlorine) || 0.5
    }
  } else if (testType.value === 'pressure' || testType.value === 'flow_rate') {
    return {
      pressure: parseInt(parameters.pressure) || 60,
      flowRate: parseFloat(parameters.flowRate) || 7.5
    }
  } else {
    return {
      notes: parameters.notes || 'Standard test parameters applied'
    }
  }
}

async function submitTestResults() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create test data
    const testData = {
      activation: props.activation,
      test: {
        id: `test${Date.now()}`,
        testType: testType.value,
        testDate: new Date().toISOString(),
        result: testResult.value,
        parameters: getTestParameters(),
        failureReason: testResult.value === 'fail' ? failureReason.value : null,
        recommendedActions: testResult.value === 'fail' ? recommendedActions.value : null,
        notes: notes.value || null
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('test-completed', testData)
    updateOpen(false)
  } catch (error) {
    console.error('Error recording test results:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>