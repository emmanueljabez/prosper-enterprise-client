<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Assign Lead</DialogTitle>
      <DialogDescription>
        Assign this lead to a team member for follow-up.
      </DialogDescription>
    </DialogHeader>

    <div v-if="lead" class="py-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium">{{ getLeadName() }}</h3>
        <p class="text-xs text-muted-foreground">{{ lead.id }}</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Currently Assigned To</Label>
          <div>
            <span class="text-sm">{{ lead.assignedUser ? lead.assignedUser.name : 'Unassigned' }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="assignTo">Assign To</Label>
          <Select v-model="assignTo">
            <SelectTrigger id="assignTo">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassign</SelectItem>
              <SelectItem
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
              >
                {{ user.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="assignmentNote">Assignment Note (Optional)</Label>
          <Textarea
              id="assignmentNote"
              v-model="assignmentNote"
              placeholder="Add a note about this assignment..."
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
          :disabled="assignTo === (lead?.assignedUser?.id || '') || isSubmitting"
          @click="assignLeadToUser"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <span>Assign Lead</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'lead-assigned'])

const assignTo = ref('')
const assignmentNote = ref('')
const isSubmitting = ref(false)

// Initialize assignTo when lead changes
watch(() => props.lead, (newLead) => {
  if (newLead && newLead.assignedUser) {
    assignTo.value = newLead.assignedUser.id || ''
  } else {
    assignTo.value = ''
  }
  assignmentNote.value = ''
}, { immediate: true })

function resetForm() {
  assignTo.value = ''
  assignmentNote.value = ''
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

const selectedUser = computed(() => {
  if (!assignTo.value) return null
  return props.users.find(user => user.id === assignTo.value) || null
})

async function assignLeadToUser() {
  if (!props.lead || assignTo.value === (props.lead.assignedUser?.id || '')) {
    return
  }

  try {
    isSubmitting.value = true

    await new Promise(resolve => setTimeout(resolve, 800))

    emit('lead-assigned', {
      lead: props.lead,
      userId: assignTo.value || null,
      userName: selectedUser.value ? selectedUser.value.name : 'Unassigned'
    })

    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error assigning lead:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>