<template>
  <SheetContent class="sm:max-w-md overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'New Lead Source' : 'Edit Lead Source' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Create a new lead acquisition source.' : 'Update lead source details.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitLeadSource" class="space-y-6 py-6">
      <div class="space-y-4">
        <!-- Name -->
        <div class="space-y-2">
          <Label for="name" required>Name</Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="Website, Referral, Cold Call, etc."
            required
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Provide details about this lead source"
            rows="3"
          />
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <Label for="status" required>Status</Label>
          <Select v-model="formData.status" required>
            <SelectTrigger id="status" :class="{ 'border-destructive': errors.status }">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="NOT_ACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-2">
        <Button type="button" variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ mode === 'add' ? 'Create Lead Source' : 'Update Lead Source' }}
        </Button>
      </div>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
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
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add', 
    validator: (value) => ['add', 'edit'].includes(value)
  },
  leadSource: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'leadSource-added',
  'leadSource-updated',
  'close'
])

// Form state
const isSubmitting = ref(false)
const errors = ref({})

// Initialize form data
const formData = ref({
  name: '',
  description: '',
  status: 'ACTIVE'
})

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    status: 'ACTIVE'
  }
  errors.value = {}
  isSubmitting.value = false
}

// If editing, populate form with lead source data
if (props.mode === 'edit' && props.leadSource) {
  formData.value = {
    name: props.leadSource.name,
    description: props.leadSource.description || '',
    status: props.leadSource.status
  }
}

// Validate form
function validateForm() {
  const newErrors = {}

  if (!formData.value.name || formData.value.name.trim() === '') {
    newErrors.name = 'Name is required'
  }

  if (!formData.value.status) {
    newErrors.status = 'Status is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit form
async function submitLeadSource() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    if (props.mode === 'add') {
      emit('leadSource-added', formData.value)
    } else {
      emit('leadSource-updated', {
        id: props.leadSource.id,
        name: formData.value.name,
        description: formData.value.description,
        status: formData.value.status
      })
    }

    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error submitting lead source:', error)
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  resetForm()
  emit('close')
}

</script>