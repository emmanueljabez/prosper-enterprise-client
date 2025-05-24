<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle>Stock Levels by Location</CardTitle>
        <CardDescription>
          Current inventory status across all warehouse and storage locations
        </CardDescription>
      </div>
      <Button variant="outline" size="sm" @click="$emit('configure-thresholds')">
        <Settings2Icon class="h-4 w-4 mr-2" />
        Configure Thresholds
      </Button>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex items-center justify-center h-56">
        <div class="flex flex-col items-center">
          <Loader2Icon class="h-10 w-10 animate-spin text-muted-foreground" />
          <p class="mt-4 text-sm text-muted-foreground">Loading location data...</p>
        </div>
      </div>
      
      <div v-else-if="locationStockLevels.length === 0" class="flex items-center justify-center h-56 border rounded-md border-dashed p-8">
        <div class="flex flex-col items-center text-center max-w-md">
          <MapPinOffIcon class="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 class="text-lg font-medium mb-2">No location data available</h3>
          <p class="text-sm text-muted-foreground">
            There are no active locations with stock data to display.
          </p>
        </div>
      </div>
      
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="locationData in locationStockLevels" :key="locationData.id" class="shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" @click="viewLocation(locationData)">
            <CardContent class="p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="p-2 rounded-md" :class="getLocationTypeClass(locationData.type)">
                    <WarehouseIcon v-if="locationData.type === 'warehouse'" class="h-5 w-5" />
                    <StoreIcon v-else-if="locationData.type === 'retail'" class="h-5 w-5" />
                    <HomeIcon v-else-if="locationData.type === 'zone'" class="h-5 w-5" />
                    <LayersIcon v-else class="h-5 w-5" />
                  </div>
                  <div class="ml-3">
                    <h3 class="font-medium">{{ locationData.name }}</h3>
                    <p class="text-xs text-muted-foreground">{{ locationData.code }}</p>
                  </div>
                </div>
                <Badge :variant="getStatusVariant(locationData.status)">
                  {{ formatLocationStatus(locationData.status) }}
                </Badge>
              </div>
              
              <div class="grid grid-cols-3 gap-2 mb-3">
                <div class="flex flex-col items-center p-2 rounded-md bg-muted/50">
                  <span class="text-sm font-medium">{{ locationData.totalItems }}</span>
                  <span class="text-xs text-muted-foreground">Items</span>
                </div>
                <div class="flex flex-col items-center p-2 rounded-md bg-muted/50">
                  <span class="text-sm font-medium">{{ locationData.uniqueItems }}</span>
                  <span class="text-xs text-muted-foreground">Unique</span>
                </div>
                <div class="flex flex-col items-center p-2 rounded-md bg-muted/50">
                  <span class="text-sm font-medium">{{ formatPercentage(locationData.capacityUsed) }}%</span>
                  <span class="text-xs text-muted-foreground">Capacity</span>
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span>Stock Status</span>
                  <span>{{ locationData.inStock }} / {{ locationData.lowStock }} / {{ locationData.criticalStock }}</span>
                </div>
                <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div class="flex h-full">
                    <div class="bg-success h-full" :style="`width: ${getStockPercentage(locationData.inStock, locationData.totalItems)}%`"></div>
                    <div class="bg-warning h-full" :style="`width: ${getStockPercentage(locationData.lowStock, locationData.totalItems)}%`"></div>
                    <div class="bg-destructive h-full" :style="`width: ${getStockPercentage(locationData.criticalStock, locationData.totalItems)}%`"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <div class="flex items-center">
                    <div class="h-2 w-2 rounded-full bg-success mr-1"></div>
                    <span>In Stock</span>
                  </div>
                  <div class="flex items-center">
                    <div class="h-2 w-2 rounded-full bg-warning mr-1"></div>
                    <span>Low Stock</span>
                  </div>
                  <div class="flex items-center">
                    <div class="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Settings2Icon, Loader2Icon, MapPinOffIcon, 
  WarehouseIcon, StoreIcon, HomeIcon, LayersIcon 
} from 'lucide-vue-next'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  thresholds: {
    type: Object,
    default: () => ({
      default: {
        inStock: 10,
        lowStock: 5,
        criticalStock: 2
      },
      byLocation: {},
      byCategory: {}
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-location', 'configure-thresholds'])

// Compute stock levels for each location
const locationStockLevels = computed(() => {
  return props.locations
    .filter(location => location.status === 'active')
    .map(location => {
      // Find all items stored at this location
      const locationItems = props.items.filter(item => 
        item.locations.some(loc => loc.id === location.id)
      )
      
      // Get counts for each stock level
      const inStock = locationItems.filter(item => {
        const threshold = getThresholdForItem(item, location.id)
        return item.stockAvailable >= threshold.inStock
      }).length
      
      const lowStock = locationItems.filter(item => {
        const threshold = getThresholdForItem(item, location.id)
        return item.stockAvailable < threshold.inStock && 
               item.stockAvailable >= threshold.lowStock
      }).length
      
      const criticalStock = locationItems.filter(item => {
        const threshold = getThresholdForItem(item, location.id)
        return item.stockAvailable < threshold.lowStock && 
               item.stockAvailable > 0
      }).length
      
      const outOfStock = locationItems.filter(item => 
        item.stockAvailable <= 0
      ).length
      
      // Calculate total quantity of items at this location
      const totalItems = locationItems.reduce((sum, item) => {
        const locationData = item.locations.find(loc => loc.id === location.id)
        return sum + (locationData ? locationData.quantity : 0)
      }, 0)
      
      // Calculate capacity used percentage
      const capacityUsed = location.capacity ? 
        (totalItems / location.capacity) * 100 : 0
      
      return {
        ...location,
        totalItems,
        uniqueItems: locationItems.length,
        capacityUsed,
        inStock,
        lowStock,
        criticalStock,
        outOfStock
      }
    })
    .sort((a, b) => b.totalItems - a.totalItems) // Sort by item count
})

// Get the appropriate thresholds for a specific item and location
function getThresholdForItem(item, locationId) {
  // Check if we have location-specific thresholds
  if (props.thresholds.byLocation[locationId]) {
    return props.thresholds.byLocation[locationId]
  }
  
  // Check if we have category-specific thresholds
  if (item.categoryId && props.thresholds.byCategory[item.categoryId]) {
    return props.thresholds.byCategory[item.categoryId]
  }
  
  // Fall back to default thresholds
  return props.thresholds.default
}

// Calculate percentage for stock level visualization
function getStockPercentage(count, total) {
  if (total === 0) return 0
  return (count / total) * 100
}

// Format percentage to show at most 1 decimal place
function formatPercentage(value) {
  return Math.round(value * 10) / 10
}

// Get appropriate CSS classes for location type
function getLocationTypeClass(type) {
  switch (type) {
    case 'warehouse':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    case 'retail':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    case 'zone':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    case 'manufacturing':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Get appropriate badge variant for location status
function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    default:
      return 'outline'
  }
}

// Format location status for display
function formatLocationStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Handle location card click
function viewLocation(location) {
  emit('view-location', location)
}
</script>