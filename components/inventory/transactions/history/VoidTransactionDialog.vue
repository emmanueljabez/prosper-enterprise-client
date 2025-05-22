<template>
  <div class="p-6 w-full max-w-md">
    <h2 class="text-xl font-bold mb-4">Void Transaction</h2>
    <div class="mb-4">
      <p>Are you sure you want to void transaction <span class="font-semibold">{{ transaction.referenceNumber || transaction.id }}</span>?</p>
      <textarea
        v-model="reason"
        class="mt-4 w-full border rounded p-2 text-sm"
        rows="3"
        placeholder="Reason for voiding (required)"
      />
    </div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button variant="destructive" :disabled="!reason" @click="confirmVoid">Void</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  transaction: { type: Object, required: true }
})

const emit = defineEmits(['void-confirmed', 'close'])

const reason = ref('')

function confirmVoid() {
  emit('void-confirmed', props.transaction.id, reason.value)
}
</script>