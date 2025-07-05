<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <AlertTriangle class="h-5 w-5 text-orange-500" />
        Inventory Alerts
      </DialogTitle>
      <DialogDescription>
        Items requiring immediate attention
      </DialogDescription>
    </DialogHeader>

    <!-- Alert Summary -->
    <div class="grid grid-cols-2 gap-4">
      <Card class="p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ lowStockItems.length }}</div>
          <div class="text-sm text-muted-foreground">Low Stock Items</div>
        </div>
      </Card>
      <Card class="p-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ outOfStockItems.length }}</div>
          <div class="text-sm text-muted-foreground">Out of Stock</div>
        </div>
      </Card>
    </div>

    <!-- Out of Stock Items (Critical) -->
    <div v-if="outOfStockItems.length > 0" class="space-y-3">
      <h3 class="font-medium text-red-600 flex items-center gap-2">
        <XCircle class="h-4 w-4" />
        Out of Stock (Critical)
      </h3>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="item in outOfStockItems"
          :key="item.id"
          class="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20"
        >
          <div class="flex-1">
            <p class="font-medium text-red-800 dark:text-red-200">{{ item.name }}</p>
            <p class="text-sm text-red-600 dark:text-red-400">
              Category: {{ item.category }}
            </p>
            <p class="text-xs text-red-500 dark:text-red-500">
              Last sold: {{ formatRelativeTime(item.lastSold) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="destructive">Out of Stock</Badge>
            <Button
              size="sm"
              variant="outline"
              @click="quickRestock(item)"
            >
              <Plus class="h-3 w-3 mr-1" />
              Restock
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Low Stock Items (Warning) -->
    <div v-if="lowStockItems.length > 0" class="space-y-3">
      <h3 class="font-medium text-orange-600 flex items-center gap-2">
        <AlertTriangle class="h-4 w-4" />
        Low Stock (Warning)
      </h3>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="item in lowStockItems"
          :key="item.id"
          class="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950/20"
        >
          <div class="flex-1">
            <p class="font-medium text-orange-800 dark:text-orange-200">{{ item.name }}</p>
            <p class="text-sm text-orange-600 dark:text-orange-400">
              Current: {{ item.currentStock }} {{ item.unit }}
            </p>
            <p class="text-xs text-orange-500 dark:text-orange-500">
              Minimum: {{ item.minimumStock }} {{ item.unit }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary" class="bg-orange-100 text-orange-800">
              {{ item.currentStock }} left
            </Badge>
            <Button
              size="sm"
              variant="outline"
              @click="quickRestock(item)"
            >
              <Plus class="h-3 w-3 mr-1" />
              Restock
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div v-if="recommendations.length > 0" class="space-y-3">
      <h3 class="font-medium flex items-center gap-2">
        <Lightbulb class="h-4 w-4 text-blue-500" />
        Recommendations
      </h3>
      <div class="space-y-2">
        <div
          v-for="(rec, index) in recommendations"
          :key="index"
          class="p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950/20"
        >
          <p class="text-sm text-blue-800 dark:text-blue-200">{{ rec.message }}</p>
          <Button
            v-if="rec.action"
            size="sm"
            variant="link"
            class="h-auto p-0 text-blue-600"
            @click="executeRecommendation(rec)"
          >
            {{ rec.action }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Quick Restock Form -->
    <Dialog v-model:open="showRestockForm">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Restock</DialogTitle>
          <DialogDescription>
            Add inventory for {{ selectedItem?.name }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>Current Stock</Label>
            <p class="text-sm text-muted-foreground">
              {{ selectedItem?.currentStock || 0 }} {{ selectedItem?.unit }}
            </p>
          </div>
          <div>
            <Label for="restockQuantity">Add Quantity</Label>
            <Input
              id="restockQuantity"
              v-model.number="restockQuantity"
              type="number"
              min="1"
              :placeholder="`Add ${selectedItem?.unit || 'units'}`"
            />
          </div>
          <div>
            <Label for="restockReason">Reason</Label>
            <Select v-model="restockReason">
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery">New Delivery</SelectItem>
                <SelectItem value="transfer">Stock Transfer</SelectItem>
                <SelectItem value="correction">Inventory Correction</SelectItem>
                <SelectItem value="emergency">Emergency Restock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showRestockForm = false">
              Cancel
            </Button>
            <Button @click="processRestock" :disabled="!restockQuantity || !restockReason">
              <Package class="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Action Buttons -->
    <div class="flex justify-between pt-4 border-t">
      <div class="flex gap-2">
        <Button variant="outline" @click="refreshInventory">
          <RotateCcw class="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" @click="viewFullInventory">
          <Package class="mr-2 h-4 w-4" />
          Full Inventory
        </Button>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="acknowledge">
          Acknowledge
        </Button>
        <Button @click="openInventoryManager">
          <Settings class="mr-2 h-4 w-4" />
          Manage Inventory
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  AlertTriangle,
  XCircle,
  Plus,
  Lightbulb,
  Package,
  RotateCcw,
  Settings
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

// Props
const props = defineProps({
  lowStockItems: {
    type: Array,
    default: () => []
  },
  outOfStockItems: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['acknowledge', 'adjust-inventory', 'restock'])

// State
const showRestockForm = ref(false)
const selectedItem = ref(null)
const restockQuantity = ref(0)
const restockReason = ref('')

// Computed
const recommendations = computed(() => {
  const recs = []
  
  // High-priority items that are frequently ordered
  const criticalItems = props.outOfStockItems.filter(item => item.isHighPriority)
  if (criticalItems.length > 0) {
    recs.push({
      message: `${criticalItems.length} high-priority items are out of stock. Consider emergency restocking.`,
      action: 'Contact Suppliers',
      type: 'emergency'
    })
  }
  
  // Items with upcoming events/promotions
  const promotionalItems = [...props.lowStockItems, ...props.outOfStockItems]
    .filter(item => item.hasUpcomingPromotion)
  if (promotionalItems.length > 0) {
    recs.push({
      message: 'Some promotional items are running low before scheduled promotions.',
      action: 'Review Promotions',
      type: 'promotion'
    })
  }
  
  // Seasonal adjustments
  if (props.lowStockItems.length > 5) {
    recs.push({
      message: 'Multiple items are running low. Consider reviewing reorder points.',
      action: 'Adjust Minimums',
      type: 'optimization'
    })
  }
  
  return recs
})

// Methods
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Less than an hour ago'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return 'Yesterday'
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

const quickRestock = (item) => {
  selectedItem.value = item
  restockQuantity.value = 0
  restockReason.value = ''
  showRestockForm.value = true
}

const processRestock = () => {
  if (!restockQuantity.value || !restockReason.value) return
  
  const restockData = {
    itemId: selectedItem.value.id,
    itemName: selectedItem.value.name,
    quantity: restockQuantity.value,
    reason: restockReason.value,
    timestamp: new Date().toISOString(),
    userId: 'current-user' // Get from auth store
  }
  
  emit('restock', restockData)
  
  showRestockForm.value = false
  
  toast({
    title: 'Stock added',
    description: `${restockQuantity.value} ${selectedItem.value.unit} added to ${selectedItem.value.name}`
  })
}

const executeRecommendation = (recommendation) => {
  switch (recommendation.type) {
    case 'emergency':
      // Open supplier contact or emergency restock workflow
      toast({
        title: 'Opening supplier contacts',
        description: 'Emergency restock workflow initiated'
      })
      break
    case 'promotion':
      // Navigate to promotions management
      toast({
        title: 'Opening promotions',
        description: 'Review promotional inventory levels'
      })
      break
    case 'optimization':
      // Open inventory optimization tools
      toast({
        title: 'Opening optimization tools',
        description: 'Review and adjust reorder points'
      })
      break
  }
}

const refreshInventory = () => {
  // Trigger inventory refresh
  emit('refresh-inventory')
  
  toast({
    title: 'Refreshing inventory',
    description: 'Updating stock levels from all sources'
  })
}

const viewFullInventory = () => {
  // Navigate to full inventory view
  navigateTo('/app/inventory')
}

const openInventoryManager = () => {
  // Open inventory management tools
  emit('adjust-inventory')
}

const acknowledge = () => {
  emit('acknowledge')
  
  toast({
    title: 'Alerts acknowledged',
    description: 'Inventory alerts have been acknowledged'
  })
}
</script>

<style scoped>
/* Custom styles for inventory alert dialog */
</style>
