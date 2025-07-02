<template>
  <div class="space-y-2">
    <!-- Current Node -->
    <div class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
         :class="(isHighlighted || idsMatch(node.id, highlightedLocationId)) ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-background'">
      
      <div class="flex items-center space-x-2 flex-1">
        <!-- Level Indentation -->
        <div class="flex items-center" :style="{ marginLeft: `${level * 24}px` }">
          <!-- Tree Lines -->
          <div v-if="level > 0" class="w-6 h-6 flex items-center justify-center">
            <div class="w-3 h-px bg-border"></div>
          </div>
          
          <!-- Node Icon -->
          <component :is="getNodeIcon(node.locationType)" 
            class="h-5 w-5 flex-shrink-0" 
            :class="getNodeIconColor(node.locationType)" 
          />
        </div>
        
        <!-- Node Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h4 class="font-medium text-sm truncate">{{ node.name }}</h4>
            <Badge variant="outline" class="text-xs">{{ node.code }}</Badge>
            <Badge :variant="node.isActive ? 'default' : 'secondary'" class="text-xs">
              {{ node.isActive ? 'Active' : 'Inactive' }}
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground mt-1">{{ node.path }}</p>
        </div>
        
        <!-- Capacity Info -->
        <div class="text-right text-xs">
          <div class="font-medium">{{ formatNumber(node.currentCapacity) }}/{{ formatNumber(node.maxCapacity) }}</div>
          <div class="text-muted-foreground">{{ Math.round((node.capacityUtilization || 0) * 100) }}% used</div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-1">
          <Button size="sm" variant="ghost" @click="$emit('view-location', transformNodeToLocation(node))">
            <EyeIcon class="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontalIcon class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <!-- <DropdownMenuContent align="end">
              <DropdownMenuItem @click="$emit('edit-location', transformNodeToLocation(node))">
                <PencilIcon class="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem @click="$emit('create-location', transformNodeToLocation(node))" v-if="canHaveChildren(node.locationType)">
                <PlusIcon class="h-4 w-4 mr-2" />
                Add {{ getChildType(node.locationType) }}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive">
                <TrashIcon class="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent> -->
          </DropdownMenu>
        </div>
      </div>
    </div>
    
    <!-- Children Nodes -->
    <div v-if="node.children && node.children.length > 0" class="space-y-2">
      <HierarchyTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :is-highlighted="idsMatch(child.id, highlightedLocationId)"
        :highlighted-location-id="highlightedLocationId"
        @view-location="$emit('view-location', $event)"
        @edit-location="$emit('edit-location', $event)"
        @create-location="$emit('create-location', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { 
  LayoutGridIcon,
  AlignJustifyIcon,
  PackageIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  MoreHorizontalIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  highlightedLocationId: {
    type: [Number, String],
    default: null
  }
})

// Emits
const emit = defineEmits(['view-location', 'edit-location', 'create-location'])

// Helper functions
const getNodeIcon = (locationType) => {
  switch (locationType) {
    case 'ZONE': return LayoutGridIcon
    case 'AISLE': return AlignJustifyIcon
    case 'SHELF': return PackageIcon
    default: return PackageIcon
  }
}

const getNodeIconColor = (locationType) => {
  switch (locationType) {
    case 'ZONE': return 'text-purple-600'
    case 'AISLE': return 'text-amber-600' 
    case 'SHELF': return 'text-green-600'
    default: return 'text-muted-foreground'
  }
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const canHaveChildren = (locationType) => {
  return locationType !== 'SHELF' // Shelves cannot have children
}

const getChildType = (locationType) => {
  switch (locationType) {
    case 'ZONE': return 'Aisle'
    case 'AISLE': return 'Shelf'
    default: return 'Location'
  }
}

// Transform node data to match location format expected by parent components
const transformNodeToLocation = (node) => {
  return {
    id: node.id,
    name: node.name,
    code: node.code,
    description: node.description,
    type: node.locationType.toLowerCase(), // Convert ZONE -> zone, etc.
    status: node.isActive ? 'active' : 'inactive',
    isActive: node.isActive,
    path: node.path,
    maxCapacity: node.maxCapacity,
    currentCapacity: node.currentCapacity,
    availableCapacity: node.availableCapacity,
    capacityUtilization: node.capacityUtilization,
    canReceive: node.canReceive,
    pickable: node.pickable,
    barcode: node.barcode,
    parentLocationId: node.parentLocationId,
    parentLocationName: node.parentLocationName,
    created: node.created,
    updated: node.updated,
    children: node.children || []
  }
}

// Helper function to extract numeric ID from string IDs like "zone-1"
const extractNumericId = (id) => {
  if (typeof id === 'number') return id
  if (typeof id === 'string') {
    // Extract number from strings like "zone-1", "aisle-2", "shelf-3"
    const match = id.match(/(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }
  return null
}

// Helper function to check if two IDs match (handles string/number comparison)
const idsMatch = (id1, id2) => {
  const numId1 = extractNumericId(id1)
  const numId2 = extractNumericId(id2)
  return numId1 !== null && numId2 !== null && numId1 === numId2
}
</script>
