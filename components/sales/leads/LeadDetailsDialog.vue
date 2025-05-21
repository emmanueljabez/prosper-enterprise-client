<template>
  <DialogContent class="sm:max-w-3xl overflow-hidden">
    <DialogHeader class="pb-4 border-b">
      <DialogTitle class="text-xl">Lead Details</DialogTitle>
      <DialogDescription class="flex items-center text-sm">
        <span class="font-medium">Lead #{{ lead?.leadNumber || 'N/A' }}</span>
      </DialogDescription>
    </DialogHeader>

    <div v-if="lead" class="mt-6 space-y-6 max-h-[calc(80vh-120px)] overflow-y-auto pr-2">
      <!-- Lead Header -->
      <div class="flex justify-between items-start bg-muted/20 p-4 rounded-lg">
        <div>
          <h3 class="text-xl font-semibold text-primary">{{ lead.firstName }} {{ lead.lastName }}</h3>
          <p v-if="lead.companyName" class="text-sm font-medium mt-1 text-muted-foreground">{{ lead.companyName }}</p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <Badge :variant="getStatusVariant(lead.status)" class="px-3 py-1 text-sm font-medium">
            {{ formatStatus(lead.status) }}
          </Badge>
          <p v-if="lead.score !== null" class="text-sm bg-secondary/10 px-2 py-1 rounded-md">
            <span class="text-muted-foreground">Score:</span> 
            <span class="font-semibold">{{ lead.score }}</span>
          </p>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium flex items-center gap-2 text-primary">
          <span class="p-1 rounded-full bg-primary/10">
            <UserIcon class="h-4 w-4" />
          </span>
          Contact Information
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 border rounded-lg bg-card shadow-sm">
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Email</p>
            <p class="font-medium flex items-center gap-2">
              <MailIcon class="h-4 w-4 text-muted-foreground" />
              {{ lead.email || 'Not provided' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Phone</p>
            <p class="font-medium flex items-center gap-2">
              <PhoneIcon class="h-4 w-4 text-muted-foreground" />
              {{ lead.phone || 'Not provided' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Address</p>
            <p class="font-medium flex items-start gap-2">
              <MapPinIcon class="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{{ formatAddress(lead.address) }}</span>
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Lead Source</p>
            <div class="font-medium flex items-center gap-2">
              <SourceIcon class="h-4 w-4 text-muted-foreground" />
              <Badge v-if="!lead.leadSource" variant="outline" class="font-normal">
                Unassigned
              </Badge>
              <p v-else>{{ lead.leadSource.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lead Details -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium flex items-center gap-2 text-primary">
          <span class="p-1 rounded-full bg-primary/10">
            <ClipboardIcon class="h-4 w-4" />
          </span>
          Lead Details
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 border rounded-lg bg-card shadow-sm">
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Created</p>
            <p class="font-medium flex items-center gap-2">
              <CalendarIcon class="h-4 w-4 text-muted-foreground" />
              {{ formatDate(lead.created) }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Last Activity</p>
            <p class="font-medium flex items-center gap-2">
              <ClockIcon class="h-4 w-4 text-muted-foreground" />
              {{ formatDate(lead.lastActivityDate) }}
            </p>
          </div>
          <!-- lead type -->
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Lead Type</p>
            <p class="font-medium flex items-center gap-2">
              <TagIcon class="h-4 w-4 text-muted-foreground" />
              <Badge :variant="getLeadTypeVariant(lead.leadType)" class="px-3 py-1 text-sm font-medium">
                {{ formatLeadType(lead.leadType) }}
              </Badge>
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Assigned To</p>
            <p class="font-medium flex items-center gap-2">
              <UserCircleIcon class="h-4 w-4 text-muted-foreground" />
              {{ lead.assignedTo?.name || 'Unassigned' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Territory</p>
            <p class="font-medium flex items-center gap-2">
              <MapIcon class="h-4 w-4 text-muted-foreground" />
              {{ lead.territory?.name || 'None' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Status Changed</p>
            <p class="font-medium flex items-center gap-2">
              <RefreshCwIcon class="h-4 w-4 text-muted-foreground" />
              {{ formatDate(lead.statusChangedAt) || 'N/A' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium flex items-center gap-2 text-primary">
          <span class="p-1 rounded-full bg-primary/10">
            <InfoIcon class="h-4 w-4" />
          </span>
          Additional Information
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 border rounded-lg bg-card shadow-sm">
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Follow-up Eligible</p>
            <p class="font-medium flex items-center gap-2">
              <CheckCircleIcon v-if="lead.followUpEligible" class="h-4 w-4 text-success" />
              <XCircleIcon v-else class="h-4 w-4 text-muted-foreground" />
              {{ lead.followUpEligible ? 'Yes' : 'No' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Follow-up Date</p>
            <p class="font-medium flex items-center gap-2">
              <CalendarClockIcon class="h-4 w-4 text-muted-foreground" />
              {{ formatDate(lead.followUpDate) || 'Not scheduled' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Preferred Service Type</p>
            <p class="font-medium flex items-center gap-2">
              <ServerIcon class="h-4 w-4 text-muted-foreground" />
              {{ lead.preferredServiceType || 'Not specified' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Preferred Connection Type</p>
            <p class="font-medium flex items-center gap-2">
              <WifiIcon class="h-4 w-4 text-muted-foreground" />
              {{ lead.preferredConnectionType || 'Not specified' }}
            </p>
          </div>
          <div class="col-span-1 md:col-span-2 space-y-1.5">
            <p class="text-xs font-medium uppercase text-muted-foreground">Status Change Reason</p>
            <p class="font-medium flex items-start gap-2">
              <FileTextIcon class="h-4 w-4 text-muted-foreground mt-0.5" />
              <span class="bg-muted/30 p-2 rounded-md w-full">{{ lead.statusChangeReason || 'None provided' }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="mt-6 pt-4 border-t gap-2">
      <Button variant="outline" class="gap-1" @click="closeDialog">
        <XIcon class="h-4 w-4" />
        Close
      </Button>
      <Button variant="default" class="gap-1" @click="editLead">
        <PencilIcon class="h-4 w-4" />
        Edit Lead
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClipboardIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  MapIcon,
  InfoIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarClockIcon,
  ServerIcon,
  WifiIcon,
  FileTextIcon,
  XIcon,
  PencilIcon,
  RefreshCwIcon
} from 'lucide-vue-next'

// Custom component for source icon
const SourceIcon = defineComponent({
  setup() {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg', 
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '12', y1: '8', x2: '12', y2: '16' }),
      h('line', { x1: '8', y1: '12', x2: '16', y2: '12' })
    ])
  }
})

const props = defineProps({
  lead: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['edit-lead', 'close'])

function closeDialog() {
  emit('close')
}

function editLead() {
  emit('edit-lead', props.lead)
}

function formatLeadType(type) {
  if (!type) return 'Unknown'
  const types = {
    'INDIVIDUAL': 'Individual',
    'BUSINESS': 'Business'
  }
  return types[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
  
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatDate(dateString) {
  if (!dateString) return null
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return format(date, 'dd MMM yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatAddress(address) {
  if (!address) return 'No address provided'
  
  const parts = [
    address.streetLine1,
    address.streetLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].filter(Boolean)
  
  return parts.join(', ') || 'No address provided'
}

function getStatusVariant(status) {
  const variants = {
    'NEW': 'default',
    'CONTACTED': 'secondary',
    'QUALIFIED': 'success',
    'UNQUALIFIED': 'destructive',
    'PROPOSAL': 'warning',
    'NEGOTIATION': 'warning',
    'WON': 'success',
    'LOST': 'outline'
  }
  return variants[status] || 'default'
}

function getLeadTypeVariant(type) {
  const variants = {
    'INDIVIDUAL': 'pink',
    'BUSINESS': 'teal'
  }
  return variants[type] || 'default'
}
</script>