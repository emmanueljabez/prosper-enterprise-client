<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Add Note</DialogTitle>
      <DialogDescription>
        Add a note to this lead to track important information.
      </DialogDescription>
    </DialogHeader>

    <div v-if="lead" class="py-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium">{{ getLeadName() }}</h3>
        <p class="text-xs text-muted-foreground">{{ lead.id }}</p>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="noteContent">Note Content <span class="text-destructive">*</span></Label>
          <Textarea
              id="noteContent"
              v-model="noteContent"
              placeholder="Enter your note here..."
              rows="5"
              :class="{ 'border-destructive': contentError }"
          />
          <p v-if="contentError" class="text-sm text-destructive">
            {{ contentError }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="noteType">Note Type</Label>
          <Select v-model="noteType">
            <SelectTrigger id="noteType">
              <SelectValue placeholder="Select note type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="call">Call Summary</SelectItem>
              <SelectItem value="meeting">Meeting Notes</SelectItem>
              <SelectItem value="email">Email Follow-up</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="emit('close')">
        Cancel
      </Button>
      <Button
          type="submit"
          :disabled="!noteContent || isSubmitting"
          @click="addNoteToLead"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <span>Add Note</span>
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

const emit = defineEmits(['note-added', 'close'])

const noteContent = ref('')
const noteType = ref('general')
const contentError = ref('')
const isSubmitting = ref(false)

// Helper function to get lead name
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
  noteContent.value = ''
  noteType.value = 'general'
  contentError.value = ''
  isSubmitting.value = false
}

async function addNoteToLead() {
  if (!props.lead) {
    return
  }

  // Validate note content
  if (!noteContent.value.trim()) {
    contentError.value = 'Note content is required'
    return
  }

  try {
    isSubmitting.value = true
    contentError.value = ''

    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800))

    const newNote = {
      id: `NOTE-${Math.floor(Math.random() * 10000)}`,
      content: noteContent.value,
      type: noteType.value,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: 'CURRENT_USER',
        name: 'Current User'
      }
    }

    emit('note-added', {
      lead: props.lead,
      note: newNote
    })

    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error adding note:', error)
    contentError.value = 'An error occurred while adding the note'
  } finally {
    isSubmitting.value = false
  }
}
</script>