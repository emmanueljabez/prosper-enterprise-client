<template>
  <div>
    <div v-if="documents.length === 0" class="text-center text-muted-foreground py-8">
      No documents found for this transaction.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="rounded-lg border bg-card p-4 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2">
          <FileTextIcon class="h-5 w-5 text-muted-foreground" />
          <span class="font-medium truncate">{{ doc.name }}</span>
        </div>
        <div class="text-xs text-muted-foreground">{{ doc.type }}</div>
        <div class="text-xs text-muted-foreground">{{ formatDate(doc.createdAt) }}</div>
        <div class="flex gap-2 mt-2">
          <Button size="sm" @click="$emit('view-document', doc)">View</Button>
          <Button size="sm" variant="outline" @click="$emit('download-document', doc)">Download</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import { FileTextIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps({
  documents: { type: Array, required: true }
})

const emit = defineEmits(['view-document', 'download-document'])

function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}
</script>