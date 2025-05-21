<template>
  <DialogContent class="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <div class="p-2 rounded-full bg-primary/10">
          <ShoppingBagIcon class="h-5 w-5 text-primary" v-if="salesChannel.type === 'online_store'" />
          <StoreIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'retail_store'" />
          <ShoppingCartIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'marketplace'" />
          <PackageIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'dropshipping'" />
          <Users2Icon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'wholesale'" />
          <PhoneIcon class="h-5 w-5 text-primary" v-else-if="salesChannel.type === 'direct_sales'" />
          <GlobeIcon class="h-5 w-5 text-primary" v-else />
        </div>
        <span>{{ salesChannel.name }}</span>
        <Badge :variant="salesChannel.isActive ? 'success' : 'secondary'">
          {{ salesChannel.isActive ? 'Active' : 'Inactive' }}
        </Badge>
      </DialogTitle>
      <DialogDescription>
        {{ salesChannel.description || 'No description available' }}
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Basic Information -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium">Channel Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Channel Type</div>
            <div>{{ formatChannelType(salesChannel.type) }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Channel ID</div>
            <div class="flex items-center space-x-2">
              <code class="bg-muted px-1 py-0.5 rounded text-sm">{{ salesChannel.id }}</code>
              <Button variant="ghost" size="icon" class="h-7 w-7" @click="copyToClipboard(salesChannel.id)">
                <ClipboardCopyIcon class="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Created Date</div>
            <div>{{ formatDate(salesChannel.createdAt) }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Last Updated</div>
            <div>{{ formatDate(salesChannel.updatedAt) }}</div>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Pricing Information -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium">Pricing Configuration</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Pricing Strategy</div>
            <div class="flex items-center space-x-2">
              <Badge variant="outline">{{ formatPricingStrategy(salesChannel.pricingStrategy) }}</Badge>
            </div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Markup Percentage</div>
            <div>{{ salesChannel.markupPercentage || 0 }}%</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Default Currency</div>
            <div>{{ salesChannel.currency || 'USD' }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Platform Fee</div>
            <div>{{ salesChannel.platformFee || 0 }}%</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Minimum Order Amount</div>
            <div>{{ formatCurrency(salesChannel.minimumOrderAmount || 0) }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Tax Inclusive Pricing</div>
            <div>{{ salesChannel.taxInclusivePricing ? 'Yes' : 'No' }}</div>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Customer Groups & Rules -->
      <div class="space-y-3">
        <h3 class="text-lg font-medium">Associated Customer Groups</h3>
        <div v-if="!salesChannel.customerGroups || salesChannel.customerGroups.length === 0" class="text-sm text-muted-foreground">
          No customer groups specifically associated with this channel
        </div>
        <div v-else class="space-y-2">
          <div v-for="group in salesChannel.customerGroups" :key="group.id" class="flex items-center justify-between p-2 border rounded-md">
            <div class="flex items-center space-x-2">
              <Users2Icon class="h-4 w-4 text-muted-foreground" />
              <span>{{ group.name }}</span>
            </div>
            <Badge variant="outline">{{ group.pricingTier || 'Standard' }}</Badge>
          </div>
        </div>
      </div>

      <!-- Performance Metrics (if available) -->
      <div v-if="hasPerformanceMetrics" class="space-y-3">
        <Separator />
        <h3 class="text-lg font-medium">Performance Metrics</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border rounded-md p-3">
            <div class="text-sm text-muted-foreground">Total Orders</div>
            <div class="text-2xl font-semibold">{{ performanceMetrics.totalOrders || 0 }}</div>
          </div>
          <div class="border rounded-md p-3">
            <div class="text-sm text-muted-foreground">Revenue</div>
            <div class="text-2xl font-semibold">{{ formatCurrency(performanceMetrics.revenue || 0) }}</div>
          </div>
          <div class="border rounded-md p-3">
            <div class="text-sm text-muted-foreground">Average Order Value</div>
            <div class="text-2xl font-semibold">{{ formatCurrency(performanceMetrics.averageOrderValue || 0) }}</div>
          </div>
        </div>
      </div>

      <!-- Integration Information (if available) -->
      <div v-if="hasIntegrationDetails" class="space-y-3">
        <Separator />
        <h3 class="text-lg font-medium">Integration Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Integration Type</div>
            <div>{{ integrationDetails.type || 'None' }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">API Status</div>
            <Badge :variant="getApiStatusVariant(integrationDetails.status)">
              {{ integrationDetails.status || 'Not Connected' }}
            </Badge>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Last Sync</div>
            <div>{{ formatDate(integrationDetails.lastSync) || 'Never' }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm font-medium text-muted-foreground">Sync Frequency</div>
            <div>{{ integrationDetails.syncFrequency || 'Manual' }}</div>
          </div>
        </div>
      </div>

      <!-- Additional Settings (if available) -->
      <div v-if="hasAdditionalSettings" class="space-y-3">
        <Separator />
        <h3 class="text-lg font-medium">Additional Settings</h3>
        <div class="grid grid-cols-1 gap-2">
          <div v-for="(value, key) in additionalSettings" :key="key" class="flex justify-between border-b pb-2">
            <div class="text-sm font-medium">{{ formatSettingName(key) }}</div>
            <div class="text-sm">{{ formatSettingValue(key, value) }}</div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <div class="flex space-x-2">
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <Button variant="outline" @click="$emit('edit-channel', salesChannel)">
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit Channel
        </Button>
        <Button @click="$emit('edit-pricing', salesChannel)">
          <SettingsIcon class="h-4 w-4 mr-2" />
          Manage Pricing
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { 
  ClipboardCopyIcon,
  GlobeIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  Users2Icon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const props = defineProps({
  salesChannel: {
    type: Object,
    required: true
  },
  performanceMetrics: {
    type: Object,
    default: () => ({})
  },
  integrationDetails: {
    type: Object,
    default: () => ({})
  },
  additionalSettings: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'edit-channel', 'edit-pricing'])
const { toast } = useToast()

// Computed properties to check if optional sections should be displayed
const hasPerformanceMetrics = computed(() => {
  return props.performanceMetrics && Object.keys(props.performanceMetrics).length > 0
})

const hasIntegrationDetails = computed(() => {
  return props.integrationDetails && Object.keys(props.integrationDetails).length > 0
})

const hasAdditionalSettings = computed(() => {
  return props.additionalSettings && Object.keys(props.additionalSettings).length > 0
})

// Format functions
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return format(date, 'MMM dd, yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

function formatChannelType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'online_store': 'Online Store',
    'marketplace': 'Marketplace',
    'retail_store': 'Retail Store',
    'wholesale': 'Wholesale',
    'dropshipping': 'Dropshipping',
    'direct_sales': 'Direct Sales'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatPricingStrategy(strategy) {
  if (!strategy) return 'Standard'
  
  const strategyMap = {
    'standard': 'Standard',
    'marketplace': 'Marketplace',
    'b2b': 'B2B',
    'wholesale': 'Wholesale',
    'custom': 'Custom'
  }
  
  return strategyMap[strategy] || strategy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatSettingName(key) {
  return key.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
}

function formatSettingValue(key, value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return value
}

function getApiStatusVariant(status) {
  if (!status) return 'secondary'
  
  const variantMap = {
    'connected': 'success',
    'error': 'destructive',
    'disconnected': 'secondary',
    'pending': 'warning'
  }
  
  return variantMap[status.toLowerCase()] || 'outline'
}

// Helper functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast({
      title: 'Copied to clipboard',
      description: 'Channel ID has been copied to your clipboard',
      variant: 'success'
    })
  }).catch(err => {
    console.error('Could not copy text: ', err)
    toast({
      title: 'Copy failed',
      description: 'Could not copy to clipboard',
      variant: 'destructive'
    })
  })
}
</script>