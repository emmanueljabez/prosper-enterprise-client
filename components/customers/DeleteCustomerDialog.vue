<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this customer? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div class="border rounded-md p-4 mb-4 bg-muted/30">
          <div class="flex items-center">
            <AlertTriangleIcon class="h-5 w-5 text-destructive mr-2" />
            <p class="text-sm font-medium">You are about to delete the following customer:</p>
          </div>
          <div class="mt-2 space-y-1 text-sm">
            <p>
              <span class="font-medium">Name:</span> {{ customer?.name }}
              <span v-if="customer?.company && customer?.company !== customer?.name">
                ({{ customer.company }})
              </span>
            </p>
            <p><span class="font-medium">Email:</span> {{ customer?.email }}</p>
            <p><span class="font-medium">Phone:</span> {{ customer?.phone }}</p>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          Deleting this customer will remove all their information from the system, including service history,
          billing records, and any associated data. This cannot be recovered once deleted.
        </p>

        <!-- Confirmation Checkbox -->
        <div class="flex items-center space-x-2 mt-4">
          <Checkbox id="confirm-delete" v-model="confirmDelete" />
          <Label for="confirm-delete" class="text-sm font-medium">
            I understand that this action cannot be undone
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Cancel</Button>
        <Button
            variant="destructive"
            :disabled="!confirmDelete || isDeleting"
            @click="handleDelete"
        >
          <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
          Delete Customer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'delete'])

const confirmDelete = ref(false)
const isDeleting = ref(false)

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    confirmDelete.value = false
  }
}

async function handleDelete() {
  if (!confirmDelete.value) return

  try {
    isDeleting.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('delete', props.customer)
    updateOpen(false)
  } catch (error) {
    console.error('Error deleting customer:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>