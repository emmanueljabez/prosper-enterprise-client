<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Update Lead Status</DialogTitle>
      <DialogDescription>
        Change the status of this lead to track its progress in the sales pipeline.
      </DialogDescription>
    </DialogHeader>

    <div v-if="lead" class="py-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium">{{ getLeadName() }}</h3>
        <p class="text-xs text-muted-foreground">{{ lead.id }}</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Current Status</Label>
          <div>
            <Badge :variant="getStatusVariant(lead.status)">
              {{ formatStatus(lead.status) }}
            </Badge>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="newStatus">New Status</Label>
          <Select v-model="newStatus">
            <SelectTrigger id="newStatus">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="status in statuses" :key="status.value" :value="status.value">
                {{ status.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="statusNote">Status Note (Optional)</Label>
          <Textarea
              id="statusNote"
              v-model="statusNote"
              placeholder="Add a note about this status change..."
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
          :disabled="!newStatus || newStatus === lead?.status || isSubmitting"
          @click="updateLeadStatus"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <span>Update Status</span>
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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

const emit = defineEmits(['close', 'status-updated'])

const newStatus = ref('')
const statusNote = ref('')
const isSubmitting = ref(false)

// Status options with uppercase values to match API
const statuses = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'UNQUALIFIED', label: 'Unqualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' }
]

function resetForm() {
  newStatus.value = ''
  statusNote.value = ''
  isSubmitting.value = false
}

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

function formatStatus(status) {
  if (!status) return 'New'
  
  // Map statuses to readable formats
  const statusMap = {
    'NEW': 'New', 
    'CONTACTED': 'Contacted',
    'QUALIFIED': 'Qualified',
    'UNQUALIFIED': 'Unqualified',
    'PROPOSAL': 'Proposal',
    'NEGOTIATION': 'Negotiation',
    'WON': 'Won',
    'LOST': 'Lost'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusVariant(status) {
  const variants = {
    'NEW': 'default',
    'CONTACTED': 'secondary',
    'QUALIFIED': 'primary',
    'UNQUALIFIED': 'destructive',
    'PROPOSAL': 'warning',
    'NEGOTIATION': 'warning',
    'WON': 'success',
    'LOST': 'outline'
  }
  return variants[status] || 'default'
}

async function updateLeadStatus() {
  if (!props.lead || !newStatus.value || newStatus.value === props.lead.status) {
    return
  }

  try {
    isSubmitting.value = true

    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // Emit event with the format expected by the parent
    emit('status-updated', {
      lead: props.lead,
      status: newStatus.value,
      reason: statusNote.value || null
    })

    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error updating lead status:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>