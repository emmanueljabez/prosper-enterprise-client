<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Opportunity Details</DialogTitle>
        <DialogDescription>
          Detailed information about this sales opportunity.
        </DialogDescription>
      </DialogHeader>

      <div v-if="opportunity" class="py-4">
        <!-- Opportunity Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold">{{ opportunity.name }}</h3>
            <p class="text-sm text-muted-foreground">{{ opportunity.id }}</p>
          </div>
          <Badge :variant="getStageVariant(opportunity.stage)">
            {{ formatStageName(opportunity.stage) }}
          </Badge>
        </div>

        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-muted/30 p-4 rounded-md">
            <p class="text-sm text-muted-foreground">Deal Value</p>
            <p class="text-2xl font-bold">{{ formatCurrency(opportunity.amount, opportunity.currency) }}</p>
          </div>
          <div class="bg-muted/30 p-4 rounded-md">
            <p class="text-sm text-muted-foreground">Probability</p>
            <div class="flex items-center space-x-2">
              <div class="w-24 h-3 bg-muted rounded-full overflow-hidden">
                <div
                    class="h-full bg-primary"
                    :style="{ width: `${opportunity.probability}%` }"
                ></div>
              </div>
              <p class="text-2xl font-bold">{{ opportunity.probability }}%</p>
            </div>
          </div>
          <div class="bg-muted/30 p-4 rounded-md">
            <p class="text-sm text-muted-foreground">Expected Close</p>
            <p class="text-2xl font-bold">{{ formatDate(opportunity.expectedCloseDate) }}</p>
          </div>
        </div>

        <!-- Lead and Opportunity Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h4 class="text-sm font-medium">Lead Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium">{{ opportunity.lead.name }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Email:</span>
                <span class="font-medium">{{ opportunity.lead.email }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Phone:</span>
                <span class="font-medium">{{ opportunity.lead.phone }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Type:</span>
                <span class="font-medium">{{ opportunity.lead.type === 'business' ? 'Business' : 'Individual' }}</span>
              </div>
              <div v-if="opportunity.lead.company" class="flex justify-between text-sm">
                <span class="text-muted-foreground">Company:</span>
                <span class="font-medium">{{ opportunity.lead.company }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-medium">Opportunity Information</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Created:</span>
                <span class="font-medium">{{ formatDate(opportunity.createdAt) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Last Updated:</span>
                <span class="font-medium">{{ formatDate(opportunity.updatedAt) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Assigned To:</span>
                <span class="font-medium">{{ opportunity.assignedTo }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Notes:</span>
                <span class="font-medium">{{ opportunity.notes || 'None' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div class="space-y-4 mb-6">
          <h4 class="text-sm font-medium">Products & Services</h4>
          <div class="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead class="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="service in opportunity.services" :key="service.id">
                  <TableCell class="font-medium">{{ service.name }}</TableCell>
                  <TableCell>{{ service.description }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(service.price, opportunity.currency) }}</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan="2">Total</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(opportunity.amount, opportunity.currency) }}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <!-- Activities Timeline -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium">Activities</h4>
          <div class="space-y-4">
            <div v-if="opportunity.activities && opportunity.activities.length > 0">
              <div v-for="activity in opportunity.activities" :key="activity.id" class="flex items-start space-x-4 pb-4">
                <div class="mt-1">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    <PhoneIcon v-if="activity.type === 'call'" class="h-4 w-4" />
                    <CalendarIcon v-else-if="activity.type === 'meeting'" class="h-4 w-4" />
                    <MailIcon v-else-if="activity.type === 'email'" class="h-4 w-4" />
                    <MessageSquareIcon v-else-if="activity.type === 'note'" class="h-4 w-4" />
                    <ClipboardIcon v-else-if="activity.type === 'task'" class="h-4 w-4" />
                    <PlusCircleIcon v-else-if="activity.type === 'create'" class="h-4 w-4" />
                    <PencilIcon v-else-if="activity.type === 'update'" class="h-4 w-4" />
                    <ActivityIcon v-else class="h-4 w-4" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm">{{ activity.description }}</p>
                  <div class="flex items-center mt-1 space-x-2">
                    <p class="text-xs text-muted-foreground">{{ formatDateTime(activity.date) }}</p>
                    <span class="text-xs text-muted-foreground">•</span>
                    <p class="text-xs text-muted-foreground">{{ activity.performer }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted-foreground">
              No activities recorded for this opportunity yet.
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { format, parseISO } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  PhoneIcon,
  CalendarIcon,
  MailIcon,
  MessageSquareIcon,
  ClipboardIcon,
  PlusCircleIcon,
  PencilIcon,
  ActivityIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  opportunity: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open'])

function updateOpen(value) {
  emit('update:open', value)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  return format(parseISO(dateString), 'dd MMM yyyy, HH:mm')
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

function formatStageName(stage) {
  const stageMap = {
    'prospecting': 'Prospecting',
    'qualification': 'Qualification',
    'needs_analysis': 'Needs Analysis',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  }

  return stageMap[stage] || stage
}

function getStageVariant(stage) {
  const variantMap = {
    'prospecting': 'secondary',
    'qualification': 'secondary',
    'needs_analysis': 'default',
    'proposal': 'default',
    'negotiation': 'primary',
    'closed_won': 'success',
    'closed_lost': 'destructive'
  }

  return variantMap[stage] || 'default'
}
</script>