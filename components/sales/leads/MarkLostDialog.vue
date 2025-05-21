<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Mark Lead as Lost</DialogTitle>
      <DialogDescription>
        Mark this lead as lost and record the reason.
      </DialogDescription>
    </DialogHeader>

    <div v-if="lead" class="py-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium">{{ getLeadName() }}</h3>
        <p class="text-xs text-muted-foreground">{{ lead.id }}</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="lostReason">Reason <span class="text-destructive">*</span></Label>
          <Select v-model="lostReason" :class="{ 'border-destructive': reasonError }">
            <SelectTrigger id="lostReason">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price too high</SelectItem>
              <SelectItem value="competitor">Chose competitor</SelectItem>
              <SelectItem value="no-response">No response</SelectItem>
              <SelectItem value="no-need">No longer needed</SelectItem>
              <SelectItem value="service-unavailable">Service unavailable in area</SelectItem>
              <SelectItem value="budget">Budget constraints</SelectItem>
              <SelectItem value="timeline">Timeline issues</SelectItem>
              <SelectItem value="other">Other reason</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="reasonError" class="text-sm text-destructive">
            {{ reasonError }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="competitorName">Competitor Name (if applicable)</Label>
          <Input
              id="competitorName"
              v-model="competitorName"
              placeholder="Name of competitor"
          />
        </div>

        <div class="space-y-2">
          <Label for="lostDetails">Additional Details</Label>
          <Textarea
              id="lostDetails"
              v-model="lostDetails"
              placeholder="More information about why the lead was lost..."
              rows="3"
          />
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="emit('close')">
        Cancel
      </Button>
      <Button
          type="submit"
          variant="destructive"
          :disabled="!lostReason || isSubmitting"
          @click="markLeadAsLost"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <span>Mark as Lost</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  lead: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'lead-lost'])

const lostReason = ref('')
const competitorName = ref('')
const lostDetails = ref('')
const reasonError = ref('')
const isSubmitting = ref(false)

function getLeadName() {
  if (!props.lead) return '';
  
  let name = '';
  if (props.lead.firstName) name += props.lead.firstName;
  if (props.lead.lastName) name += (name ? ' ' : '') + props.lead.lastName;
  if (props.lead.companyName && props.lead.leadType === 'BUSINESS') {
    name += ` (${props.lead.companyName})`;
  }
  return name || 'Unnamed Lead';
}

function resetForm() {
  lostReason.value = ''
  competitorName.value = ''
  lostDetails.value = ''
  reasonError.value = ''
  isSubmitting.value = false
}

async function markLeadAsLost() {
  if (!props.lead) {
    return
  }

  // Validate reason
  if (!lostReason.value) {
    reasonError.value = 'Please select a reason'
    return
  }

  try {
    isSubmitting.value = true
    reasonError.value = ''

    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('lead-lost', {
      lead: props.lead,
      reason: lostReason.value,
      competitor: competitorName.value || null,
      details: lostDetails.value || null
    })

    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error marking lead as lost:', error)
    reasonError.value = 'An error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>