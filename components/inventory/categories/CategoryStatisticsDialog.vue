<template>
  <DialogContent class="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <BarChart3Icon class="h-5 w-5" />
        <span>Category Statistics</span>
      </DialogTitle>
      <DialogDescription>
        Comprehensive statistics and analytics for your category structure
      </DialogDescription>
    </DialogHeader>

    <div v-if="statistics" class="space-y-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card class="p-4">
          <div class="flex items-center space-x-2">
            <FolderIcon class="h-6 w-6 text-primary" />
            <div>
              <div class="text-2xl font-bold">{{ statistics.totalCategories }}</div>
              <div class="text-sm text-muted-foreground">Total Categories</div>
            </div>
          </div>
        </Card>
        <Card class="p-4">
          <div class="flex items-center space-x-2">
            <FolderTreeIcon class="h-6 w-6 text-primary" />
            <div>
              <div class="text-2xl font-bold">{{ statistics.rootCategories }}</div>
              <div class="text-sm text-muted-foreground">Root Categories</div>
            </div>
          </div>
        </Card>
        <Card class="p-4">
          <div class="flex items-center space-x-2">
            <NetworkIcon class="h-6 w-6 text-primary" />
            <div>
              <div class="text-2xl font-bold">{{ statistics.maxDepth }}</div>
              <div class="text-sm text-muted-foreground">Max Depth</div>
            </div>
          </div>
        </Card>
        <Card class="p-4">
          <div class="flex items-center space-x-2">
            <PackageIcon class="h-6 w-6 text-primary" />
            <div>
              <div class="text-2xl font-bold">{{ statistics.totalItems }}</div>
              <div class="text-sm text-muted-foreground">Total Items</div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Distribution Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Categories by Level -->
        <Card class="p-4">
          <h3 class="font-semibold mb-4">Categories by Level</h3>
          <div class="space-y-3">
            <div 
              v-for="level in statistics.categoriesByLevel" 
              :key="level.level"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full bg-primary" 
                     :style="{ opacity: 1 - (level.level * 0.2) }"></div>
                <span class="text-sm">Level {{ level.level }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium">{{ level.count }}</span>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-primary rounded-full"
                    :style="{ width: `${(level.count / statistics.totalCategories) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Status Distribution -->
        <Card class="p-4">
          <h3 class="font-semibold mb-4">Status Distribution</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full bg-green-500"></div>
                <span class="text-sm">Active</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium">{{ statistics.activeCategories }}</span>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-500 rounded-full"
                    :style="{ width: `${(statistics.activeCategories / statistics.totalCategories) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full bg-gray-400"></div>
                <span class="text-sm">Inactive</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium">{{ statistics.inactiveCategories }}</span>
                <div class="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gray-400 rounded-full"
                    :style="{ width: `${(statistics.inactiveCategories / statistics.totalCategories) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Top Categories -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Most Used Categories -->
        <Card class="p-4">
          <h3 class="font-semibold mb-4">Most Used Categories</h3>
          <div class="space-y-2">
            <div 
              v-for="category in statistics.topByItems" 
              :key="category.id"
              class="flex items-center justify-between p-2 rounded hover:bg-muted/50"
            >
              <div class="flex items-center space-x-2">
                <FolderIcon class="h-4 w-4 text-muted-foreground" />
                <span class="font-medium">{{ category.name }}</span>
                <Badge variant="outline" class="text-xs">{{ category.code }}</Badge>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm">{{ category.itemsCount }}</span>
                <PackageIcon class="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        </Card>

        <!-- Largest Hierarchies -->
        <Card class="p-4">
          <h3 class="font-semibold mb-4">Largest Hierarchies</h3>
          <div class="space-y-2">
            <div 
              v-for="category in statistics.topBySubcategories" 
              :key="category.id"
              class="flex items-center justify-between p-2 rounded hover:bg-muted/50"
            >
              <div class="flex items-center space-x-2">
                <FolderTreeIcon class="h-4 w-4 text-muted-foreground" />
                <span class="font-medium">{{ category.name }}</span>
                <Badge variant="outline" class="text-xs">{{ category.code }}</Badge>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm">{{ category.subcategoriesCount }}</span>
                <FolderIcon class="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Health Indicators -->
      <Card class="p-4">
        <h3 class="font-semibold mb-4">Category Health</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ statistics.emptyCategories }}</div>
            <div class="text-sm text-muted-foreground">Empty Categories</div>
            <div class="text-xs text-muted-foreground mt-1">Categories with no items</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ statistics.averageItemsPerCategory }}</div>
            <div class="text-sm text-muted-foreground">Avg Items/Category</div>
            <div class="text-xs text-muted-foreground mt-1">Average distribution</div>
          </div>
          <div class="text-center p-3 bg-muted/50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ statistics.utilizationRate }}%</div>
            <div class="text-sm text-muted-foreground">Utilization Rate</div>
            <div class="text-xs text-muted-foreground mt-1">Categories with items</div>
          </div>
        </div>
      </Card>

      <!-- Recent Activity -->
      <Card class="p-4">
        <h3 class="font-semibold mb-4">Recent Activity</h3>
        <div class="space-y-2">
          <div 
            v-for="activity in statistics.recentActivity" 
            :key="activity.id"
            class="flex items-center justify-between p-2 border rounded"
          >
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full"
                   :class="{
                     'bg-green-500': activity.type === 'created',
                     'bg-blue-500': activity.type === 'updated',
                     'bg-red-500': activity.type === 'deleted'
                   }"></div>
              <span class="text-sm">{{ activity.description }}</span>
            </div>
            <span class="text-xs text-muted-foreground">{{ formatDate(activity.timestamp) }}</span>
          </div>
        </div>
      </Card>

      <!-- Export Options -->
      <Card class="p-4">
        <h3 class="font-semibold mb-4">Export Statistics</h3>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" @click="exportStatistics('csv')">
            <FileSpreadsheet class="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" @click="exportStatistics('excel')">
            <Table2 class="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" @click="exportStatistics('pdf')">
            <FileTextIcon class="h-4 w-4 mr-2" />
            Export PDF Report
          </Button>
        </div>
      </Card>
    </div>

    <div v-else class="text-center py-8">
      <Loader2Icon class="h-8 w-8 animate-spin mx-auto mb-4" />
      <p class="text-muted-foreground">Loading statistics...</p>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import {
  BarChart3Icon, FolderIcon, FolderTreeIcon, NetworkIcon, PackageIcon,
  FileSpreadsheet, Table2, FileTextIcon, Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

// Props
const props = defineProps({
  statistics: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close'])

// Mock statistics if not provided
const mockStatistics = {
  totalCategories: 45,
  rootCategories: 8,
  maxDepth: 4,
  totalItems: 1250,
  activeCategories: 42,
  inactiveCategories: 3,
  emptyCategories: 12,
  averageItemsPerCategory: 28,
  utilizationRate: 73,
  categoriesByLevel: [
    { level: 0, count: 8 },
    { level: 1, count: 18 },
    { level: 2, count: 15 },
    { level: 3, count: 4 }
  ],
  topByItems: [
    { id: 1, name: 'Electronics', code: 'ELEC', itemsCount: 156 },
    { id: 2, name: 'Clothing', code: 'CLOT', itemsCount: 134 },
    { id: 3, name: 'Tools', code: 'TOOL', itemsCount: 98 },
    { id: 4, name: 'Books', code: 'BOOK', itemsCount: 87 },
    { id: 5, name: 'Home & Garden', code: 'HOME', itemsCount: 76 }
  ],
  topBySubcategories: [
    { id: 1, name: 'Electronics', code: 'ELEC', subcategoriesCount: 8 },
    { id: 2, name: 'Clothing', code: 'CLOT', subcategoriesCount: 6 },
    { id: 3, name: 'Home & Garden', code: 'HOME', subcategoriesCount: 5 },
    { id: 4, name: 'Sports', code: 'SPRT', subcategoriesCount: 4 },
    { id: 5, name: 'Tools', code: 'TOOL', subcategoriesCount: 3 }
  ],
  recentActivity: [
    { id: 1, type: 'created', description: 'Category "Smart Watches" created', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, type: 'updated', description: 'Category "Electronics" updated', timestamp: '2024-01-15T09:15:00Z' },
    { id: 3, type: 'created', description: 'Category "Gaming Accessories" created', timestamp: '2024-01-14T16:45:00Z' },
    { id: 4, type: 'deleted', description: 'Category "Obsolete Items" deleted', timestamp: '2024-01-14T14:20:00Z' },
    { id: 5, type: 'updated', description: 'Category "Tools" status changed to active', timestamp: '2024-01-14T11:10:00Z' }
  ]
}

// Computed
const displayStatistics = computed(() => {
  return props.statistics || mockStatistics
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const exportStatistics = async (format) => {
  try {
    // Mock export functionality
    const data = {
      csv: 'category,items,subcategories,status\nElectronics,156,8,active\n...',
      excel: 'statistics.xlsx',
      pdf: 'statistics.pdf'
    }
    
    const content = data[format]
    const blob = new Blob([content], { 
      type: format === 'csv' ? 'text/csv' : 'application/octet-stream'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `category-statistics.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting statistics:', error)
  }
}
</script>
