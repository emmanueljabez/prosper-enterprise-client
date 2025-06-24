<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Unit of Measure Statistics</DialogTitle>
        <DialogDescription>
          Comprehensive analytics and usage statistics for units of measure
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Overview Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 border rounded-md">
            <div class="text-3xl font-bold text-primary">{{ stats.totalUnits }}</div>
            <div class="text-sm text-muted-foreground">Total Units</div>
          </div>
          <div class="text-center p-4 border rounded-md">
            <div class="text-3xl font-bold text-green-600">{{ stats.activeUnits }}</div>
            <div class="text-sm text-muted-foreground">Active Units</div>
          </div>
          <div class="text-center p-4 border rounded-md">
            <div class="text-3xl font-bold text-blue-600">{{ stats.totalFamilies }}</div>
            <div class="text-sm text-muted-foreground">Unit Families</div>
          </div>
          <div class="text-center p-4 border rounded-md">
            <div class="text-3xl font-bold text-purple-600">{{ stats.totalCategories }}</div>
            <div class="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Category Distribution -->
          <div class="space-y-3">
            <h3 class="text-base font-medium">Units by Category</h3>
            <div class="border rounded-md p-4 h-64 flex items-center justify-center bg-muted/30">
              <div class="text-center space-y-2">
                <PieChartIcon class="h-12 w-12 mx-auto text-muted-foreground" />
                <p class="text-sm text-muted-foreground">Category Distribution Chart</p>
                <div class="space-y-1 text-xs">
                  <div v-for="category in categoryStats" :key="category.name" class="flex justify-between">
                    <span>{{ category.name }}:</span>
                    <span class="font-medium">{{ category.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Trends -->
          <div class="space-y-3">
            <h3 class="text-base font-medium">Usage Trends (Last 30 Days)</h3>
            <div class="border rounded-md p-4 h-64 flex items-center justify-center bg-muted/30">
              <div class="text-center space-y-2">
                <TrendingUpIcon class="h-12 w-12 mx-auto text-muted-foreground" />
                <p class="text-sm text-muted-foreground">Usage Trends Chart</p>
                <div class="text-xs">
                  <p>Total Conversions: {{ stats.totalConversions }}</p>
                  <p>Avg. Daily Usage: {{ stats.avgDailyUsage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Used Units -->
        <div class="space-y-3">
          <h3 class="text-base font-medium">Most Used Units</h3>
          <div class="border rounded-md">
            <table class="w-full text-sm">
              <thead class="border-b bg-muted/30">
                <tr>
                  <th class="text-left p-3">Rank</th>
                  <th class="text-left p-3">Unit</th>
                  <th class="text-left p-3">Category</th>
                  <th class="text-left p-3">Products</th>
                  <th class="text-left p-3">Transactions</th>
                  <th class="text-left p-3">Last Used</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(unit, index) in topUsedUnits" 
                  :key="unit.id"
                  class="border-b hover:bg-muted/50"
                >
                  <td class="p-3">
                    <Badge 
                      :variant="index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'"
                      class="text-xs"
                    >
                      #{{ index + 1 }}
                    </Badge>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center space-x-2">
                      <component :is="getCategoryIcon(unit.category)" class="h-4 w-4" />
                      <span class="font-medium">{{ unit.name }}</span>
                      <span class="font-mono text-muted-foreground">({{ unit.symbol }})</span>
                    </div>
                  </td>
                  <td class="p-3">{{ formatCategory(unit.category) }}</td>
                  <td class="p-3">{{ unit.productsCount }}</td>
                  <td class="p-3">{{ unit.transactionsCount }}</td>
                  <td class="p-3">{{ formatDate(unit.lastUsed) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Unit Families Statistics -->
        <div class="space-y-3">
          <h3 class="text-base font-medium">Unit Families</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="family in familyStats" 
              :key="family.id"
              class="border rounded-md p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium">{{ family.name }}</h4>
                <Badge variant="outline" class="text-xs">{{ family.category }}</Badge>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Members:</span>
                  <span class="font-medium">{{ family.memberCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Base Unit:</span>
                  <span class="font-medium">{{ family.baseUnit }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Total Usage:</span>
                  <span class="font-medium">{{ family.totalUsage }}</span>
                </div>
              </div>
              
              <div class="mt-3 pt-3 border-t">
                <div class="text-xs text-muted-foreground mb-2">Members:</div>
                <div class="flex flex-wrap gap-1">
                  <Badge 
                    v-for="member in family.members.slice(0, 3)" 
                    :key="member"
                    variant="secondary" 
                    class="text-xs"
                  >
                    {{ member }}
                  </Badge>
                  <Badge v-if="family.members.length > 3" variant="secondary" class="text-xs">
                    +{{ family.members.length - 3 }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="space-y-3">
          <h3 class="text-base font-medium">Recent Activity</h3>
          <div class="border rounded-md max-h-48 overflow-y-auto">
            <div class="space-y-1 p-3">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <component :is="getActivityIcon(activity.type)" class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm">{{ activity.description }}</p>
                    <p class="text-xs text-muted-foreground">{{ activity.unit }} • {{ activity.user }}</p>
                  </div>
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ formatDateTime(activity.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="space-y-3 pt-4 border-t">
          <h3 class="text-base font-medium">Export Statistics</h3>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" @click="exportStats('csv')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" @click="exportStats('excel')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" @click="exportStats('pdf')">
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Close</Button>
        <Button @click="refreshStats">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PieChartIcon, TrendingUpIcon, DownloadIcon, RefreshCwIcon,
  RulerIcon, ScaleIcon, FlaskConicalIcon, ClockIcon, 
  ThermometerIcon, ZapIcon, PackageIcon,
  PlusIcon, EditIcon, TrashIcon, FileTextIcon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:open'])

const { toast } = useToast()

// Mock statistics data
const stats = ref({
  totalUnits: 127,
  activeUnits: 115,
  totalFamilies: 12,
  totalCategories: 7,
  totalConversions: 45823,
  avgDailyUsage: 1527
})

const categoryStats = ref([
  { name: 'Length', count: 25 },
  { name: 'Weight', count: 18 },
  { name: 'Volume', count: 15 },
  { name: 'Time', count: 12 },
  { name: 'Temperature', count: 8 },
  { name: 'Energy', count: 6 },
  { name: 'Other', count: 43 }
])

const topUsedUnits = ref([
  {
    id: '1',
    name: 'Kilogram',
    symbol: 'kg',
    category: 'weight',
    productsCount: 1234,
    transactionsCount: 5678,
    lastUsed: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Meter',
    symbol: 'm',
    category: 'length',
    productsCount: 987,
    transactionsCount: 4321,
    lastUsed: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    name: 'Liter',
    symbol: 'L',
    category: 'volume',
    productsCount: 654,
    transactionsCount: 3210,
    lastUsed: '2024-01-19T16:45:00Z'
  },
  {
    id: '4',
    name: 'Piece',
    symbol: 'pcs',
    category: 'quantity',
    productsCount: 543,
    transactionsCount: 2109,
    lastUsed: '2024-01-19T14:20:00Z'
  },
  {
    id: '5',
    name: 'Gram',
    symbol: 'g',
    category: 'weight',
    productsCount: 432,
    transactionsCount: 1876,
    lastUsed: '2024-01-18T11:10:00Z'
  }
])

const familyStats = ref([
  {
    id: '1',
    name: 'Metric Length',
    category: 'length',
    memberCount: 6,
    baseUnit: 'Meter (m)',
    totalUsage: 12567,
    members: ['m', 'km', 'cm', 'mm', 'μm', 'nm']
  },
  {
    id: '2',
    name: 'Metric Weight',
    category: 'weight',
    memberCount: 5,
    baseUnit: 'Kilogram (kg)',
    totalUsage: 9876,
    members: ['kg', 'g', 'mg', 't', 'μg']
  },
  {
    id: '3',
    name: 'Imperial Length',
    category: 'length',
    memberCount: 4,
    baseUnit: 'Foot (ft)',
    totalUsage: 3456,
    members: ['ft', 'in', 'yd', 'mi']
  },
  {
    id: '4',
    name: 'Metric Volume',
    category: 'volume',
    memberCount: 4,
    baseUnit: 'Liter (L)',
    totalUsage: 6789,
    members: ['L', 'mL', 'm³', 'cm³']
  }
])

const recentActivity = ref([
  {
    id: '1',
    type: 'create',
    description: 'Created new unit',
    unit: 'Nanometer (nm)',
    user: 'John Doe',
    timestamp: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    type: 'edit',
    description: 'Updated conversion factor',
    unit: 'Centimeter (cm)',
    user: 'Jane Smith',
    timestamp: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    type: 'delete',
    description: 'Deleted unused unit',
    unit: 'Old Unit (ou)',
    user: 'Admin',
    timestamp: '2024-01-19T16:45:00Z'
  },
  {
    id: '4',
    type: 'create',
    description: 'Added to family',
    unit: 'Micrometer (μm)',
    user: 'John Doe',
    timestamp: '2024-01-19T14:20:00Z'
  },
  {
    id: '5',
    type: 'edit',
    description: 'Updated precision settings',
    unit: 'Kilogram (kg)',
    user: 'Jane Smith',
    timestamp: '2024-01-18T11:10:00Z'
  }
])

// Methods
function updateOpen(value) {
  emit('update:open', value)
}

function getCategoryIcon(category) {
  const iconMap = {
    length: RulerIcon,
    weight: ScaleIcon,
    volume: FlaskConicalIcon,
    time: ClockIcon,
    temperature: ThermometerIcon,
    energy: ZapIcon,
    quantity: PackageIcon
  }
  return iconMap[category] || PackageIcon
}

function getActivityIcon(type) {
  const iconMap = {
    create: PlusIcon,
    edit: EditIcon,
    delete: TrashIcon,
    export: FileTextIcon
  }
  return iconMap[type] || FileTextIcon
}

function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function formatDate(date) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}

function formatDateTime(date) {
  return new Date(date).toLocaleString()
}

function refreshStats() {
  // Simulate stats refresh
  stats.value.totalConversions += Math.floor(Math.random() * 100)
  stats.value.avgDailyUsage = Math.floor(stats.value.totalConversions / 30)
  
  toast({
    title: "Statistics Refreshed",
    description: "Latest statistics have been loaded",
  })
}

function exportStats(format) {
  // Simulate export
  const data = {
    stats: stats.value,
    categories: categoryStats.value,
    topUnits: topUsedUnits.value,
    families: familyStats.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uom-statistics.${format}`
  a.click()
  URL.revokeObjectURL(url)
  
  toast({
    title: "Export Complete",
    description: `Statistics exported as ${format.toUpperCase()}`,
  })
}
</script>
