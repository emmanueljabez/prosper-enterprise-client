<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogDescription>
          Assign a technician to installation #{{ installation?.installationNumber }}.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <Form @submit="assignTechnician" class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="technician">Select Technician *</Label>
              <Select v-model="selectedTechnicianId">
                <SelectTrigger id="technician" :class="{ 'border-red-500': errors.technician }">
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent @click.stop>
                  <SelectItem v-for="tech in technicians" :key="tech.id" :value="tech.id">
                    <div class="flex items-center">
                      <Avatar class="h-6 w-6 mr-2">
                        <AvatarImage :src="tech.avatar" alt="Avatar" />
                        <AvatarFallback>{{ tech.initials }}</AvatarFallback>
                      </Avatar>
                      <span>{{ tech.name }}</span>
                      <Badge v-if="tech.specialization" variant="outline" class="ml-2">
                        {{ tech.specialization }}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.technician" class="text-sm text-red-500">{{ errors.technician }}</p>
            </div>

            <div v-if="selectedTechnician" class="space-y-2 border rounded-md p-4 bg-muted/10">
              <div class="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage :src="selectedTechnician.avatar" alt="Avatar" />
                  <AvatarFallback>{{ selectedTechnician.initials }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-medium">{{ selectedTechnician.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedTechnician.email }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <p class="text-xs text-muted-foreground">Phone</p>
                  <p class="text-sm">{{ selectedTechnician.phone }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Specialization</p>
                  <p class="text-sm">{{ selectedTechnician.specialization || 'General' }}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Experience</p>
                  <p class="text-sm">{{ selectedTechnician.experience }} years</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Rating</p>
                  <div class="flex items-center">
                    <StarIcon class="h-3.5 w-3.5 fill-primary text-primary" />
                    <span class="text-sm ml-1">{{ selectedTechnician.rating || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="notes">Assignment Notes</Label>
              <Textarea
                  id="notes"
                  v-model="notes"
                  rows="3"
                  placeholder="Enter any notes for this assignment..."
                  @click.stop
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="sendNotification" v-model="sendNotification" />
                <Label for="sendNotification" class="text-sm">Send notification to technician</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="updateOpen(false)">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Assign Technician
            </Button>
          </DialogFooter>
        </Form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2Icon, StarIcon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  installation: {
    type: Object,
    default: null
  },
  technicians: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'technician-assigned'])

// Form data
const selectedTechnicianId = ref('')
const notes = ref('')
const sendNotification = ref(true)
const errors = ref({})
const isSubmitting = ref(false)

// Computed property to get the selected technician details
const selectedTechnician = computed(() => {
  if (!selectedTechnicianId.value) return null
  return props.technicians.find(tech => tech.id === selectedTechnicianId.value)
})

function updateOpen(value) {
  if (value && props.installation) {
    // Initialize form with current values when opening
    initializeForm()
  } else {
    // Reset form when closing
    resetForm()
  }
  emit('update:open', value)
}

function initializeForm() {
  if (props.installation && props.installation.technician) {
    selectedTechnicianId.value = props.installation.technician.id
  } else {
    selectedTechnicianId.value = ''
  }
  notes.value = ''
  sendNotification.value = true
}

function resetForm() {
  selectedTechnicianId.value = ''
  notes.value = ''
  sendNotification.value = true
  errors.value = {}
}

function validate() {
  let isValid = true
  errors.value = {}

  if (!selectedTechnicianId.value) {
    errors.value.technician = 'A technician must be selected'
    isValid = false
  }

  return isValid
}

async function assignTechnician() {
  if (!validate()) {
    return
  }

  try {
    isSubmitting.value = true

    // Create assignment data
    const assignmentData = {
      installation: props.installation,
      technician: selectedTechnician.value,
      notes: notes.value || null,
      sendNotification: sendNotification.value,
      assignedAt: new Date().toISOString()
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('technician-assigned', assignmentData)
    updateOpen(false)
  } catch (error) {
    console.error('Error assigning technician:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>