<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Complete Installation</DialogTitle>
        <DialogDescription>
          Mark installation #{{ installation?.installationNumber }} as completed.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <Form @submit="completeInstallation" class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="completionDate">Completion Date *</Label>
              <Input
                  id="completionDate"
                  v-model="completionDate"
                  type="date"
                  :class="{ 'border-red-500': errors.completionDate }"
                  @click.stop
              />
              <p v-if="errors.completionDate" class="text-sm text-red-500">{{ errors.completionDate }}</p>
            </div>

            <div class="space-y-2">
              <Label for="installationTime">Installation Time (hours) *</Label>
              <Input
                  id="installationTime"
                  v-model="installationTime"
                  type="number"
                  min="1"
                  step="0.5"
                  :class="{ 'border-red-500': errors.installationTime }"
                  @click.stop
              />
              <p v-if="errors.installationTime" class="text-sm text-red-500">{{ errors.installationTime }}</p>
            </div>

            <div class="space-y-2">
              <Label for="materialsUsed">Materials Used *</Label>
              <div class="space-y-2">
                <div v-for="(material, index) in materialsUsed" :key="index" class="flex space-x-2">
                  <Input
                      v-model="materialsUsed[index]"
                      placeholder="Enter material"
                      @click.stop
                  />
                  <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      @click="removeMaterial(index)"
                  >
                    <XIcon class="h-4 w-4" />
                  </Button>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="addMaterial"
                    class="mt-2"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
              <p v-if="errors.materialsUsed" class="text-sm text-red-500">{{ errors.materialsUsed }}</p>
            </div>

            <div class="space-y-2">
              <Label for="customerFeedback">Customer Feedback</Label>
              <Select v-model="customerFeedback">
                <SelectTrigger id="customerFeedback">
                  <SelectValue placeholder="Select customer feedback" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Not Available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="notes">Completion Notes *</Label>
              <Textarea
                  id="notes"
                  v-model="notes"
                  rows="3"
                  placeholder="Enter completion notes..."
                  :class="{ 'border-red-500': errors.notes }"
                  @click.stop
              />
              <p v-if="errors.notes" class="text-sm text-red-500">{{ errors.notes }}</p>
            </div>

            <div class="space-y-2">
              <Label for="photoUpload">Completion Photos (Optional)</Label>
              <div class="border border-dashed p-4 rounded-md">
                <div class="flex flex-col items-center justify-center gap-2">
                  <CameraIcon class="h-8 w-8 text-muted-foreground" />
                  <div class="text-sm text-center text-muted-foreground">
                    Drag and drop photos here or click to upload
                  </div>
                  <Button type="button" variant="secondary" size="sm">
                    <UploadIcon class="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="customerSignature">Customer Sign-off</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="customerSignature" v-model="customerSignature" />
                <Label for="customerSignature" class="text-sm">Customer has signed off on the installation</Label>
              </div>
              <p v-if="errors.customerSignature" class="text-sm text-red-500">{{ errors.customerSignature }}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Complete Installation
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
  PlusIcon,
  XIcon,
  Loader2Icon,
  CameraIcon,
  UploadIcon
} from 'lucide-vue-next'

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

const emit = defineEmits(['update:open', 'installation-completed'])

// Form data
const completionDate = ref(new Date().toISOString().slice(0, 10))
const installationTime = ref(2)
const materialsUsed = ref(['', ''])
const customerFeedback = ref('Good')
const notes = ref('')
const customerSignature = ref(false)
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
  completionDate.value = new Date().toISOString().slice(0, 10)
  installationTime.value = 2
  materialsUsed.value = ['', '']
  customerFeedback.value = 'Good'
  notes.value = ''
  customerSignature.value = false
  errors.value = {}
}

function addMaterial() {
  materialsUsed.value.push('')
}

function removeMaterial(index) {
  if (materialsUsed.value.length > 1) {
    materialsUsed.value.splice(index, 1)
  }
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!completionDate.value) {
    errors.value.completionDate = 'Completion date is required'
    isValid = false
  }

  if (!installationTime.value || installationTime.value <= 0) {
    errors.value.installationTime = 'Valid installation time is required'
    isValid = false
  }

  // Filter out empty material entries
  const filledMaterials = materialsUsed.value.filter(m => m.trim())
  if (filledMaterials.length === 0) {
    errors.value.materialsUsed = 'At least one material must be specified'
    isValid = false
  }

  if (!notes.value.trim()) {
    errors.value.notes = 'Notes are required'
    isValid = false
  }

  if (!customerSignature.value) {
    errors.value.customerSignature = 'Customer sign-off is required to complete the installation'
    isValid = false
  }

  return isValid
}

async function completeInstallation() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Filter out empty material entries
    const filledMaterials = materialsUsed.value.filter(m => m.trim())

    // Create completion data
    const completionData = {
      installation: props.installation,
      completionDate: completionDate.value,
      completionDetails: {
        installationTime: Number(installationTime.value),
        materialsUsed: filledMaterials,
        customerFeedback: customerFeedback.value,
        notes: notes.value,
        customerSignOff: customerSignature.value,
        completedBy: props.installation.technician ? props.installation.technician.id : null,
        completedAt: new Date().toISOString()
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('installation-completed', completionData)
    updateOpen(false)
  } catch (error) {
    console.error('Error completing installation:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>