<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle>Stock Flow Visualization</CardTitle>
      <CardDescription>
        {{ getVisualizationDescription }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex items-center justify-center h-80">
        <div class="flex flex-col items-center">
          <Loader2Icon class="h-12 w-12 animate-spin text-muted-foreground" />
          <p class="mt-4 text-sm text-muted-foreground">Loading visualization data...</p>
        </div>
      </div>
      
      <div v-else-if="!hasData" class="flex items-center justify-center h-80 border rounded-md border-dashed p-8">
        <div class="flex flex-col items-center text-center max-w-md">
          <BarChart4 class="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 class="text-lg font-medium mb-2">No data available</h3>
          <p class="text-sm text-muted-foreground">
            There's no stock flow data matching your current filter criteria. Try adjusting your filters or selecting a different time range.
          </p>
        </div>
      </div>
      
      <div v-else>
        <!-- Timeline Visualization -->
        <div v-if="visualizationType === 'timeline'" class="h-80">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <Badge variant="outline" class="bg-primary/10 border-primary/25 text-primary hover:bg-primary/20 cursor-pointer" @click="toggleLegendItem('receipt')">
                  <div class="h-2 w-2 rounded-full bg-primary mr-1"></div>
                  Receipts
                </Badge>
              </div>
              <div class="flex items-center">
                <Badge variant="outline" class="bg-destructive/10 border-destructive/25 text-destructive hover:bg-destructive/20 cursor-pointer" @click="toggleLegendItem('issue')">
                  <div class="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                  Issues
                </Badge>
              </div>
              <div class="flex items-center">
                <Badge variant="outline" class="bg-warning/10 border-warning/25 text-warning hover:bg-warning/20 cursor-pointer" @click="toggleLegendItem('adjustment')">
                  <div class="h-2 w-2 rounded-full bg-warning mr-1"></div>
                  Adjustments
                </Badge>
              </div>
              <div class="flex items-center">
                <Badge variant="outline" class="bg-info/10 border-info/25 text-info hover:bg-info/20 cursor-pointer" @click="toggleLegendItem('transfer')">
                  <div class="h-2 w-2 rounded-full bg-info mr-1"></div>
                  Transfers
                </Badge>
              </div>
            </div>
            <div>
              <Select v-model="selectedTimelineSeries" class="w-40">
                <SelectTrigger>
                  <SelectValue placeholder="Select data series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock-level">Stock Level</SelectItem>
                  <SelectItem value="transaction-volume">Transaction Volume</SelectItem>
                  <SelectItem value="transaction-value">Transaction Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Placeholder for timeline chart - would be replaced with actual chart component -->
          <div class="h-64 border rounded-md bg-muted/20 relative">
            <!-- This would be replaced with an actual chart component -->
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="text-muted-foreground">Timeline chart would render here</p>
            </div>
            
            <!-- Tooltip that would appear on hover -->
            <div v-if="false" class="absolute bg-background border rounded-md shadow-md p-3 w-64 z-10">
              <div class="text-sm font-medium mb-1">Jan 15, 2025</div>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Stock Level:</span>
                  <span>45 units</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Receipt:</span>
                  <span class="text-primary">+10 units</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Issue:</span>
                  <span class="text-destructive">-5 units</span>
                </div>
                <div class="border-t my-1"></div>
                <div class="flex justify-between font-medium">
                  <span>Net Change:</span>
                  <span>+5 units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Flow Diagram Visualization -->
        <div v-else-if="visualizationType === 'flowchart'" class="h-80">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <Button variant="outline" size="sm" :class="{'bg-muted': flowViewMode === 'location'}" @click="flowViewMode = 'location'">
                <MapPinIcon class="h-4 w-4 mr-2" />
                By Location
              </Button>
              <Button variant="outline" size="sm" :class="{'bg-muted': flowViewMode === 'category'}" @click="flowViewMode = 'category'">
                <TagIcon class="h-4 w-4 mr-2" />
                By Category
              </Button>
              <Button variant="outline" size="sm" :class="{'bg-muted': flowViewMode === 'item'}" @click="flowViewMode = 'item'">
                <PackageIcon class="h-4 w-4 mr-2" />
                By Item
              </Button>
            </div>
            <div>
              <Select v-model="flowMetric" class="w-40">
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Transaction Count</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Placeholder for flow diagram - would be replaced with actual diagram component -->
          <div class="h-64 border rounded-md bg-muted/20 relative">
            <!-- This would be replaced with an actual flow diagram component -->
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="text-muted-foreground">Flow diagram would render here</p>
            </div>
          </div>
        </div>
        
        <!-- Heatmap Visualization -->
        <div v-else-if="visualizationType === 'heatmap'" class="h-80">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <Button variant="outline" size="sm" :class="{'bg-muted': heatmapDimension === 'location-time'}" @click="heatmapDimension = 'location-time'">
                Location × Time
              </Button>
              <Button variant="outline" size="sm" :class="{'bg-muted': heatmapDimension === 'item-time'}" @click="heatmapDimension = 'item-time'">
                Item × Time
              </Button>
              <Button variant="outline" size="sm" :class="{'bg-muted': heatmapDimension === 'category-location'}" @click="heatmapDimension = 'category-location'">
                Category × Location
              </Button>
            </div>
            <div>
              <Select v-model="heatmapMetric" class="w-40">
                <SelectTrigger>
                  <SelectValue placeholder="Select heatmap metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction-count">Transaction Count</SelectItem>
                  <SelectItem value="stock-level">Stock Level</SelectItem>
                  <SelectItem value="turnover-rate">Turnover Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Placeholder for heatmap - would be replaced with actual heatmap component -->
          <div class="h-64 border rounded-md bg-muted/20 relative">
            <!-- This would be replaced with an actual heatmap component -->
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="text-muted-foreground">Heatmap would render here</p>
            </div>
          </div>
        </div>
        
        <!-- Sankey Diagram Visualization -->
        <div v-else-if="visualizationType === 'sankey'" class="h-80">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <Select v-model="sankeyDetail" class="w-40">
                <SelectTrigger>
                  <SelectValue placeholder="Select detail level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Detail</SelectItem>
                  <SelectItem value="medium">Medium Detail</SelectItem>
                  <SelectItem value="low">Low Detail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select v-model="sankeyMetric" class="w-40">
                <SelectTrigger>
                  <SelectValue placeholder="Select flow metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="transaction-count">Transaction Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Placeholder for sankey diagram - would be replaced with actual diagram component -->
          <div class="h-64 border rounded-md bg-muted/20 relative">
            <!-- This would be replaced with an actual sankey diagram component -->
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="text-muted-foreground">Sankey diagram would render here</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter v-if="hasData" class="border-t pt-4 flex justify-between">
      <Button variant="ghost" size="sm" @click="downloadChart">
        <DownloadIcon class="h-4 w-4 mr-2" />
        Download Chart
      </Button>
      <div class="text-xs text-muted-foreground">
        {{ statusMessage }}
      </div>
    </CardFooter>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Loader2Icon, BarChart4, MapPinIcon, TagIcon, PackageIcon,
  DownloadIcon
} from 'lucide-vue-next'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  itemsData: {
    type: Array,
    default: () => []
  },
  transactionsData: {
    type: Array,
    default: () => []
  },
  mappingsData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  visualizationType: {
    type: String,
    default: 'timeline'
  },
  location: {
    type: Object,
    default: null
  },
  thresholds: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'view-item',
  'view-transaction'
])

// Local state for different visualization types
const selectedTimelineSeries = ref('stock-level')
const flowViewMode = ref('location')
const flowMetric = ref('volume')
const heatmapDimension = ref('location-time')
const heatmapMetric = ref('transaction-count')
const sankeyDetail = ref('medium')
const sankeyMetric = ref('quantity')
const activeTransactionTypes = ref(['receipt', 'issue', 'adjustment', 'transfer'])

// Compute if we have data to display
const hasData = computed(() => {
  return props.itemsData.length > 0 && props.transactionsData.length > 0
})

// Display different descriptions based on visualization type
const getVisualizationDescription = computed(() => {
  const locationName = props.location ? props.location.name : 'all locations'
  
  switch (props.visualizationType) {
    case 'timeline':
      return `Showing stock level changes over time for ${locationName}`
    case 'flowchart':
      return `Visualizing inventory flow between locations and categories`
    case 'heatmap':
      return `Heatmap visualization of stock activity across ${locationName}`
    case 'sankey':
      return `Sankey diagram showing stock movement through the supply chain`
    default:
      return 'Select a visualization type to begin'
  }
})

// Status message shown in footer
const statusMessage = computed(() => {
  const itemCount = props.itemsData.length
  const transactionCount = props.transactionsData.length
  
  return `Displaying data for ${itemCount} items and ${transactionCount} transactions`
})

// Methods
function toggleLegendItem(type) {
  const index = activeTransactionTypes.value.indexOf(type)
  if (index === -1) {
    activeTransactionTypes.value.push(type)
  } else {
    activeTransactionTypes.value.splice(index, 1)
  }
  // This would trigger the chart to update in a real implementation
}

function downloadChart() {
  // This would be implemented to export the current visualization
  // For now, just log the action
  console.log('Downloading chart:', props.visualizationType)
}

// Methods to handle item and transaction clicks
function handleItemClick(item) {
  emit('view-item', item)
}

function handleTransactionClick(transaction) {
  emit('view-transaction', transaction)
}

// Watch for visualization type changes
watch(() => props.visualizationType, (newType) => {
  // Reset the appropriate settings when visualization type changes
  if (newType === 'timeline') {
    selectedTimelineSeries.value = 'stock-level'
  } else if (newType === 'flowchart') {
    flowViewMode.value = 'location'
    flowMetric.value = 'volume'
  } else if (newType === 'heatmap') {
    heatmapDimension.value = 'location-time'
    heatmapMetric.value = 'transaction-count'
  } else if (newType === 'sankey') {
    sankeyDetail.value = 'medium'
    sankeyMetric.value = 'quantity'
  }
})
</script>

<style scoped>
/* Custom theme-specific colors */
:deep(.text-warning) {
  color: hsl(38, 92%, 50%);
}

:deep(.bg-warning\/10) {
  background-color: hsla(38, 92%, 50%, 0.1);
}

:deep(.border-warning\/25) {
  border-color: hsla(38, 92%, 50%, 0.25);
}

:deep(.text-info) {
  color: hsl(214, 100%, 60%);
}

:deep(.bg-info\/10) {
  background-color: hsla(214, 100%, 60%, 0.1);
}

:deep(.border-info\/25) {
  border-color: hsla(214, 100%, 60%, 0.25);
}
</style>