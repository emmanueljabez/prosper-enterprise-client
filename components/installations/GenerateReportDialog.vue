<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Generate Installation Report</DialogTitle>
        <DialogDescription>
          Create a detailed report for installation #{{ installation?.installationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <Form @submit="generateReport" class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="reportType">Report Type *</Label>
              <Select v-model="reportType">
                <SelectTrigger id="reportType" :class="{ 'border-red-500': errors.reportType }">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="standard">Standard Installation Report</SelectItem>
                  <SelectItem value="detailed">Detailed Technical Report</SelectItem>
                  <SelectItem value="customer">Customer Handover Report</SelectItem>
                  <SelectItem value="compliance">Compliance & Certification Report</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.reportType" class="text-sm text-red-500">{{ errors.reportType }}</p>
            </div>

            <div class="space-y-2">
              <Label for="reportDate">Report Date *</Label>
              <Input
                  id="reportDate"
                  v-model="reportDate"
                  type="date"
                  :class="{ 'border-red-500': errors.reportDate }"
                  @click.stop
              />
              <p v-if="errors.reportDate" class="text-sm text-red-500">{{ errors.reportDate }}</p>
            </div>

            <div class="space-y-2">
              <Label>Report Sections</Label>
              <div class="border rounded-md p-3 space-y-2">
                <div class="flex items-center space-x-2" v-for="section in reportSections" :key="section.id">
                  <Checkbox
                      :id="section.id"
                      v-model="section.selected"
                  />
                  <Label :for="section.id" class="text-sm font-normal">{{ section.name }}</Label>
                </div>
              </div>
              <p v-if="errors.sections" class="text-sm text-red-500">{{ errors.sections }}</p>
            </div>

            <div class="space-y-2">
              <Label for="includePhotos">Include Photos</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="includePhotos" v-model="includePhotos" />
                <Label for="includePhotos" class="text-sm font-normal">
                  Include installation photos in the report
                </Label>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="additionalNotes">Additional Notes</Label>
              <Textarea
                  id="additionalNotes"
                  v-model="additionalNotes"
                  rows="3"
                  placeholder="Enter any additional notes for the report..."
                  @click.stop
              />
            </div>

            <div class="space-y-2">
              <Label>Report Format</Label>
              <RadioGroup v-model="reportFormat">
                <div class="flex flex-wrap gap-4">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label for="pdf" class="text-sm font-normal">PDF</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="docx" id="docx" />
                    <Label for="docx" class="text-sm font-normal">Word (DOCX)</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem value="xlsx" id="xlsx" />
                    <Label for="xlsx" class="text-sm font-normal">Excel (XLSX)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="sendToCustomer" v-model="sendToCustomer" />
                <Label for="sendToCustomer" class="text-sm">Email report to customer</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Generate Report
            </Button>
          </DialogFooter>
        </Form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Form } from 'vee-validate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  installation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'report-generated'])

// Form data
const reportType = ref('standard')
const reportDate = ref(new Date().toISOString().slice(0, 10))
const reportSections = ref([
  { id: 'customer_info', name: 'Customer Information', selected: true },
  { id: 'installation_details', name: 'Installation Details', selected: true },
  { id: 'technical_specs', name: 'Technical Specifications', selected: true },
  { id: 'materials_used', name: 'Materials Used', selected: true },
  { id: 'testing_results', name: 'Testing & Commissioning Results', selected: false },
  { id: 'maintenance_instructions', name: 'Maintenance Instructions', selected: false },
  { id: 'warranty_info', name: 'Warranty Information', selected: true },
  { id: 'technician_notes', name: 'Technician Notes', selected: true }
])
const includePhotos = ref(true)
const additionalNotes = ref('')
const reportFormat = ref('pdf')
const sendToCustomer = ref(false)
const errors = ref({})
const isSubmitting = ref(false)

function updateOpen(value) {
  if (!value) {
    // Reset form when closing
    resetForm()
  }
  emit('update:open', value)
}

function resetForm() {
  reportType.value = 'standard'
  reportDate.value = new Date().toISOString().slice(0, 10)
  reportSections.value.forEach(section => {
    if (['customer_info', 'installation_details', 'technical_specs', 'materials_used', 'warranty_info', 'technician_notes'].includes(section.id)) {
      section.selected = true
    } else {
      section.selected = false
    }
  })
  includePhotos.value = true
  additionalNotes.value = ''
  reportFormat.value = 'pdf'
  sendToCustomer.value = false
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!reportType.value) {
    errors.value.reportType = 'Report type is required'
    isValid = false
  }

  if (!reportDate.value) {
    errors.value.reportDate = 'Report date is required'
    isValid = false
  }

  // Check if at least one section is selected
  const hasSelectedSection = reportSections.value.some(section => section.selected)
  if (!hasSelectedSection) {
    errors.value.sections = 'At least one report section must be selected'
    isValid = false
  }

  return isValid
}

async function generateReport() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Get selected section IDs
    const selectedSections = reportSections.value
        .filter(section => section.selected)
        .map(section => section.id)

    // Create report data
    const reportData = {
      installation: props.installation,
      reportType: reportType.value,
      reportDate: reportDate.value,
      sections: selectedSections,
      includePhotos: includePhotos.value,
      notes: additionalNotes.value || null,
      format: reportFormat.value,
      sendToCustomer: sendToCustomer.value,
      generatedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    emit('report-generated', reportData)
    updateOpen(false)
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>