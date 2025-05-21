<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total Sales Channels
          </CardTitle>
          <ShoppingBagIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ totalChannels }}</div>
          <p class="text-xs text-muted-foreground">
            {{ activeChannels }} active, {{ inactiveChannels }} inactive
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Average Markup
          </CardTitle>
          <PercentIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ averageMarkupPercentage }}%</div>
          <p class="text-xs text-muted-foreground">
            <span :class="markupTrend >= 0 ? 'text-success' : 'text-destructive'">
              <ArrowUpIcon v-if="markupTrend > 0" class="inline h-3 w-3" />
              <ArrowDownIcon v-else-if="markupTrend < 0" class="inline h-3 w-3" />
              <ArrowRightIcon v-else class="inline h-3 w-3" />
              {{ Math.abs(markupTrend) }}%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Channel Revenue
          </CardTitle>
          <DollarSignIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatCurrency(totalRevenue) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="revenueTrend >= 0 ? 'text-success' : 'text-destructive'">
              <ArrowUpIcon v-if="revenueTrend > 0" class="inline h-3 w-3" />
              <ArrowDownIcon v-else-if="revenueTrend < 0" class="inline h-3 w-3" />
              <ArrowRightIcon v-else class="inline h-3 w-3" />
              {{ Math.abs(revenueTrend) }}%
            </span>
            from last period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Most Active Channel
          </CardTitle>
          <ActivityIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold truncate">{{ mostActiveChannel.name || 'N/A' }}</div>
          <p class="text-xs text-muted-foreground">
            {{ mostActiveChannel.type ? formatChannelType(mostActiveChannel.type) : '' }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Channel Distribution Chart -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channel Distribution</CardTitle>
          <CardDescription>Sales channel distribution by type</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SettingsIcon class="h-4 w-4 mr-2" />
              Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="refreshData">
              <RefreshCwIcon class="h-4 w-4 mr-2" />
              Refresh Data
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportChannelData">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div class="h-[300px]">
          <!-- This is where you would integrate a chart library component -->
          <!-- For demonstration, I'll show a simple visual representation -->
          <div v-if="loading" class="flex items-center justify-center h-full">
            <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <div v-else class="flex items-end justify-around h-full">
            <div v-for="(count, type) in channelTypeDistribution" :key="type" class="flex flex-col items-center">
              <div 
                class="bg-primary"
                :style="{
                  height: `${(count/Math.max(...Object.values(channelTypeDistribution)))*240}px`,
                  width: '60px'
                }"
              ></div>
              <div class="mt-2 text-xs font-medium">{{ formatChannelType(type) }}</div>
              <div class="text-xs text-muted-foreground">{{ count }} channels</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Updates -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>Latest changes to sales channels</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-6">
          <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <div v-else-if="recentUpdates.length === 0" class="text-center py-6 text-muted-foreground">
          No recent updates found
        </div>
        <div v-else>
          <div class="space-y-4">
            <div v-for="update in recentUpdates" :key="update.id" class="flex items-start space-x-4">
              <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ActivityIcon v-if="update.type === 'updated'" class="h-5 w-5 text-primary" />
                <PlusIcon v-else-if="update.type === 'created'" class="h-5 w-5 text-success" />
                <Trash2Icon v-else-if="update.type === 'deleted'" class="h-5 w-5 text-destructive" />
                <ToggleLeftIcon v-else-if="update.type === 'status_changed'" class="h-5 w-5 text-warning" />
                <SettingsIcon v-else class="h-5 w-5 text-primary" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">{{ update.title }}</p>
                  <span class="text-xs text-muted-foreground">
                    {{ formatTimeAgo(update.timestamp) }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">{{ update.description }}</p>
                <div v-if="update.channel" class="text-xs">
                  <Button variant="link" size="sm" class="p-0 h-auto" @click="viewChannelDetails(update.channel)">
                    View channel details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Quick Access -->
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card class="col-span-1">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Channel Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold mb-2">{{ healthScore }}%</div>
          <div class="w-full bg-muted rounded-full h-2.5">
            <div class="bg-primary h-2.5 rounded-full" :style="{ width: `${healthScore}%` }"></div>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            Based on pricing consistency and channel activity
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" class="w-full" @click="runHealthCheck">
            <StethoscopeIcon class="h-4 w-4 mr-2" />
            Run Health Check
          </Button>
        </CardFooter>
      </Card>

      <Card class="col-span-1">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Top Performing Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="topPerformingChannel" class="flex items-center space-x-3">
            <div class="p-2 rounded-full bg-primary/10">
              <ShoppingBagIcon class="h-6 w-6 text-primary" v-if="topPerformingChannel.type === 'online_store'" />
              <StoreIcon class="h-6 w-6 text-primary" v-else-if="topPerformingChannel.type === 'retail_store'" />
              <ShoppingCartIcon class="h-6 w-6 text-primary" v-else-if="topPerformingChannel.type === 'marketplace'" />
              <GlobeIcon class="h-6 w-6 text-primary" v-else />
            </div>
            <div>
              <div class="font-medium">{{ topPerformingChannel.name }}</div>
              <div class="text-sm text-muted-foreground">{{ formatCurrency(topPerformingChannel.revenue) }} revenue</div>
            </div>
          </div>
          <div v-else class="text-center py-2 text-muted-foreground">
            No data available
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" class="w-full" @click="topPerformingChannel && viewChannelDetails(topPerformingChannel)">
            <ChartBarIcon class="h-4 w-4 mr-2" />
            View Performance
          </Button>
        </CardFooter>
      </Card>

      <Card class="col-span-1">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Channels Needing Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div v-if="channelsNeedingAttention.length === 0" class="text-center py-2 text-muted-foreground">
              All channels are in good standing
            </div>
            <div v-for="channel in channelsNeedingAttention.slice(0, 2)" :key="channel.id" class="flex items-center justify-between">
              <div class="font-medium text-sm">{{ channel.name }}</div>
              <Badge :variant="getAttentionBadgeVariant(channel.issue)">
                {{ formatIssueType(channel.issue) }}
              </Badge>
            </div>
            <div v-if="channelsNeedingAttention.length > 2" class="text-xs text-muted-foreground text-center">
              +{{ channelsNeedingAttention.length - 2 }} more issues
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" class="w-full" @click="showAllAttentionChannels">
            <AlertTriangleIcon class="h-4 w-4 mr-2" />
            Review All Issues
          </Button>
        </CardFooter>
      </Card>

      <Card class="col-span-1">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <Button variant="outline" size="sm" class="w-full text-left justify-start" @click="$emit('create-channel')">
              <PlusIcon class="h-4 w-4 mr-2" />
              New Sales Channel
            </Button>
            <Button variant="outline" size="sm" class="w-full text-left justify-start" @click="openBulkEditor">
              <ListIcon class="h-4 w-4 mr-2" />
              Bulk Edit Channels
            </Button>
            <Button variant="outline" size="sm" class="w-full text-left justify-start" @click="openBulkPricing">
              <PercentIcon class="h-4 w-4 mr-2" />
              Batch Update Pricing
            </Button>
            <Button variant="outline" size="sm" class="w-full text-left justify-start" @click="exportChannelData">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export Channels Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ChartBarIcon,
  DollarSignIcon,
  DownloadIcon,
  GlobeIcon,
  ListIcon,
  Loader2Icon,
  PackageIcon,
  PercentIcon,
  PhoneIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StethoscopeIcon,
  StoreIcon,
  ToggleLeftIcon,
  Trash2Icon,
  Users2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  salesChannels: {
    type: Array,
    required: true,
    default: () => []
  },
  recentActivity: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-channel',
  'edit-channel',
  'create-channel',
  'bulk-edit',
  'refresh',
  'export-data'
])

// Computed properties for overview metrics
const totalChannels = computed(() => props.salesChannels.length)
const activeChannels = computed(() => props.salesChannels.filter(channel => channel.isActive).length)
const inactiveChannels = computed(() => props.salesChannels.filter(channel => !channel.isActive).length)

const averageMarkupPercentage = computed(() => {
  if (props.salesChannels.length === 0) return 0
  const total = props.salesChannels.reduce((sum, channel) => sum + (channel.markupPercentage || 0), 0)
  return Math.round((total / props.salesChannels.length) * 10) / 10
})

// For demo purposes - in a real app, you'd get this from analytics
const markupTrend = ref(2.5)
const revenueTrend = ref(8.3)
const totalRevenue = ref(384950)
const healthScore = ref(78)

// Sample data for most active and top performing
const mostActiveChannel = computed(() => {
  if (props.salesChannels.length === 0) return {}
  // In a real app, this would be determined by activity metrics
  // For demo, just returning the first active channel or any channel
  return props.salesChannels.find(c => c.isActive) || props.salesChannels[0] || {}
})

const topPerformingChannel = ref(null)

// Channel type distribution 
const channelTypeDistribution = computed(() => {
  const distribution = {}
  props.salesChannels.forEach(channel => {
    const type = channel.type || 'unknown'
    distribution[type] = (distribution[type] || 0) + 1
  })
  return distribution
})

// Recent updates based on activity or mocked data
const recentUpdates = computed(() => {
  if (props.recentActivity && props.recentActivity.length > 0) {
    return props.recentActivity
  }
  
  // Mock data if no real activity provided
  return [
    {
      id: 1,
      type: 'created',
      title: 'New channel created',
      description: 'Online Store channel was created',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      channel: props.salesChannels.find(c => c.type === 'online_store')
    },
    {
      id: 2,
      type: 'updated',
      title: 'Pricing strategy updated',
      description: 'Marketplace pricing strategy changed to dynamic',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      channel: props.salesChannels.find(c => c.type === 'marketplace')
    },
    {
      id: 3,
      type: 'status_changed',
      title: 'Channel activated',
      description: 'Wholesale channel has been activated',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      channel: props.salesChannels.find(c => c.type === 'wholesale')
    }
  ].slice(0, 3) // Limit to 3 updates
})

// Channels needing attention - would come from analytics in a real app
const channelsNeedingAttention = ref([
  { id: 'ch1', name: 'Amazon Marketplace', issue: 'pricing_inconsistency' },
  { id: 'ch2', name: 'B2B Portal', issue: 'low_performance' },
  { id: 'ch3', name: 'Retail POS', issue: 'configuration_issue' }
])

// Initialize component
onMounted(() => {
  if (props.salesChannels.length > 0) {
    // Set a sample top performing channel for demonstration
    topPerformingChannel.value = {
      ...props.salesChannels[0],
      revenue: 128450
    }
  }
})

// Format functions
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function formatTimeAgo(date) {
  if (!date) return ''
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
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

function formatIssueType(issue) {
  const issueMap = {
    'pricing_inconsistency': 'Pricing Issue',
    'low_performance': 'Low Sales',
    'configuration_issue': 'Config Error'
  }
  return issueMap[issue] || issue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getAttentionBadgeVariant(issue) {
  const variantMap = {
    'pricing_inconsistency': 'warning',
    'low_performance': 'destructive',
    'configuration_issue': 'outline'
  }
  return variantMap[issue] || 'secondary'
}

// Action functions
function refreshData() {
  emit('refresh')
}

function viewChannelDetails(channel) {
  emit('view-channel', channel)
}

function openBulkEditor() {
  emit('bulk-edit')
}

function openBulkPricing() {
  emit('bulk-edit', { type: 'pricing' })
}

function exportChannelData() {
  emit('export-data')
}

function runHealthCheck() {
  // In a real app, this would trigger a health check process
  // For demo, just update the health score with a random fluctuation
  const newScore = Math.min(100, Math.max(0, healthScore.value + (Math.random() * 10 - 5)))
  healthScore.value = Math.round(newScore)
}

function showAllAttentionChannels() {
  // Would typically open a dialog or navigate to a page showing all issues
  console.log('Show all channels needing attention')
}
</script>