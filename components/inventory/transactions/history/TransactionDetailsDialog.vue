<template>
  <div class="p-6 w-full max-w-lg">
    <h2 class="text-xl font-bold mb-4">Transaction Details</h2>
    <div v-if="transaction" class="space-y-2">
      <div>
        <span class="font-semibold">Reference:</span>
        <span>{{ transaction.referenceNumber || transaction.id }}</span>
      </div>
      <div>
        <span class="font-semibold">Type:</span>
        <span class="capitalize">{{ transaction.type }}</span>
      </div>
      <div>
        <span class="font-semibold">Date:</span>
        <span>{{ formatDate(transaction.createdAt) }}</span>
      </div>
      <div>
        <span class="font-semibold">Location:</span>
        <span>
          {{ locationsMap[transaction.locationId]?.name || '—' }}
        </span>
      </div>
      <div>
        <span class="font-semibold">Total Value:</span>
        <span>{{ formatCurrency(transaction.totalValue) }}</span>
      </div>
      <div>
        <span class="font-semibold">Status:</span>
        <span class="capitalize">{{ transaction.status || '—' }}</span>
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-6">
      <Button variant="outline" @click="$emit('close')">Close</Button>
      <Button variant="outline" @click="$emit('print-document', transaction)">Print</Button>
      <Button variant="destructive" @click="$emit('void-transaction', transaction)">Void</Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

const props = defineProps({
  transaction: { type: Object, required: true },
  locations: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'void-transaction', 'print-document'])

const locationsMap = computed(() => {
  const map = {}
  for (const loc of props.locations) {
    map[loc.id] = loc
  }
  return map
})

function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

function formatCurrency(value) {
  if (typeof value !== 'number') return '—'
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}
</script>