<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)" class="max-w-4xl">
    <DialogContent class="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>{{ article.title }}</DialogTitle>
        <DialogDescription class="flex justify-between items-center">
          <Badge variant="outline">{{ article.category }}</Badge>
          <span class="text-xs">Updated {{ formatDate(article.lastUpdated) }}</span>
        </DialogDescription>
      </DialogHeader>

      <div class="overflow-y-auto py-4 px-1 flex-1">
        <div class="prose prose-sm max-w-none dark:prose-invert">
          <!-- Simple rendering of content with basic paragraph support -->
          <div v-if="article.content">
            <p v-for="(paragraph, index) in formatContent" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter class="flex justify-between items-center">
        <div class="flex space-x-2">
          <Button variant="outline" size="sm" @click="copyArticleLink">
            <LinkIcon class="h-4 w-4 mr-1" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" @click="printArticle">
            <PrinterIcon class="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
        <div>
          <Button @click="$emit('add-to-ticket', article)">
            <PlusCircleIcon class="h-4 w-4 mr-1" />
            Add to Ticket
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LinkIcon, PrinterIcon, PlusCircleIcon } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  article: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update:open', 'add-to-ticket'])

const {toast} = useToast()

// Simple content formatting - split by newlines
const formatContent = computed(() => {
  if (!props.article.content) return []
  return props.article.content.split('\n\n').filter(p => p.trim() !== '')
})

// Format date
function formatDate(dateString) {
  return format(new Date(dateString), 'MMM d, yyyy')
}

// Copy article link
function copyArticleLink() {
  // In a real app, this would be a shareable URL
  const articleLink = `kb://${props.article.id}`

  try {
    navigator.clipboard.writeText(articleLink)
    toast({
      title: "Link Copied",
      description: "Article link has been copied to clipboard"
    })
  } catch (err) {
    toast({
      title: "Failed to Copy",
      description: "Could not copy to clipboard",
      variant: "destructive"
    })
  }
}

// Print article
function printArticle() {
  const printWindow = window.open('', '_blank')

  // Create paragraphs from content
  const contentHtml = props.article.content
      ? props.article.content
          .split('\n\n')
          .filter(p => p.trim() !== '')
          .map(p => `<p>${p}</p>`)
          .join('')
      : ''

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${props.article.title}</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .meta { color: #666; font-size: 0.875rem; margin-bottom: 2rem; display: flex; justify-content: space-between; }
        .content { margin-bottom: 2rem; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 0.25rem; overflow: auto; }
        code { font-family: monospace; }
        .footer { color: #666; font-size: 0.75rem; text-align: center; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem; }
      </style>
    </head>
    <body>
      <h1>${props.article.title}</h1>
      <div class="meta">
        <div>Category: ${props.article.category}</div>
        <div>Updated: ${formatDate(props.article.lastUpdated)}</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        Knowledge Base Article #${props.article.id}
      </div>
    </body>
    </html>
  `

  printWindow.document.write(content)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
  }, 500)
}
</script>