<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <component :is="getCategoryIcon(unit?.category)" class="h-5 w-5" />
          <span>{{ unit?.name }} Details</span>
        </DialogTitle>
        <DialogDescription>
          View detailed information about this unit of measure
        </DialogDescription>
      </DialogHeader>

      <div v-if="unit" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground">BASIC INFORMATION</Label>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm">Name:</span>
                  <span class="text-sm font-medium">{{ unit.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Symbol:</span>
                  <span class="text-sm font-medium font-mono bg-muted px-2 py-1 rounded">{{ unit.symbol }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Type:</span>
                  <Badge variant="secondary">{{ formatUnitType(unit.unitType) }}</Badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Category:</span>
                  <Badge variant="outline">{{ formatCategory(unit.category) }}</Badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Status:</span>
                  <Badge :variant="unit.isActive ? 'default' : 'secondary'">
                    {{ unit.isActive ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </div>
            </div>

            <div v-if="unit.description" class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground">DESCRIPTION</Label>
              <p class="text-sm">{{ unit.description }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Conversion Information -->
            <div class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground">CONVERSION</Label>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm">Base Unit:</span>
                  <span class="text-sm font-medium">
                    {{ unit.isBaseUnit ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div v-if="!unit.isBaseUnit && unit.baseUnit" class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm">Converts To:</span>
                    <span class="text-sm font-medium">{{ unit.baseUnit.name }} ({{ unit.baseUnit.symbol }})</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm">Factor:</span>
                    <span class="text-sm font-medium">{{ unit.conversionFactor }}</span>
                  </div>
                  <div v-if="unit.conversionOffset" class="flex justify-between">
                    <span class="text-sm">Offset:</span>
                    <span class="text-sm font-medium">{{ unit.conversionOffset }}</span>
                  </div>
                  <div class="p-3 bg-muted/30 rounded text-sm">
                    <strong>Formula:</strong><br>
                    1 {{ unit.symbol }} = {{ unit.conversionFactor }} {{ unit.baseUnit.symbol }}
                    <span v-if="unit.conversionOffset"> + {{ unit.conversionOffset }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Precision Settings -->
            <div class="space-y-2">
              <Label class="text-sm font-medium text-muted-foreground">PRECISION</Label>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm">Decimal Places:</span>
                  <span class="text-sm font-medium">{{ unit.decimalPrecision }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm">Fractional Values:</span>
                  <span class="text-sm font-medium">{{ unit.allowFractional ? 'Allowed' : 'Not Allowed' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Family Information -->
        <div v-if="unit.family" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">UNIT FAMILY</Label>
          <div class="border rounded-md p-4 bg-muted/30">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium">{{ unit.family.name }}</h4>
              <Badge variant="outline">{{ unit.family.units?.length || 0 }} units</Badge>
            </div>
            
            <div v-if="unit.family.units" class="space-y-2">
              <Label class="text-xs font-medium text-muted-foreground">FAMILY MEMBERS</Label>
              <div class="grid grid-cols-2 gap-2">
                <div 
                  v-for="familyUnit in unit.family.units" 
                  :key="familyUnit.id"
                  class="flex items-center justify-between p-2 bg-background rounded border text-sm"
                  :class="{ 'border-primary bg-primary/5': familyUnit.id === unit.id }"
                >
                  <span class="font-medium">{{ familyUnit.name }}</span>
                  <span class="font-mono text-muted-foreground">{{ familyUnit.symbol }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversion Examples -->
        <div v-if="!unit.isBaseUnit && unit.baseUnit" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">CONVERSION EXAMPLES</Label>
          <div class="grid grid-cols-2 gap-4">
            <div 
              v-for="example in conversionExamples" 
              :key="example.from"
              class="p-3 border rounded-md bg-muted/30 text-sm"
            >
              <div class="font-medium">{{ example.from }} {{ unit.symbol }}</div>
              <div class="text-muted-foreground">= {{ example.to }} {{ unit.baseUnit.symbol }}</div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="unit.tags && unit.tags.length > 0" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">TAGS</Label>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="tag in unit.tags" :key="tag" variant="secondary" class="text-xs">
              {{ tag }}
            </Badge>
          </div>
        </div>

        <!-- Usage Statistics -->
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">USAGE STATISTICS</Label>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-3 border rounded-md">
              <div class="text-2xl font-bold text-primary">{{ unit.stats?.productsCount || 0 }}</div>
              <div class="text-xs text-muted-foreground">Products</div>
            </div>
            <div class="text-center p-3 border rounded-md">
              <div class="text-2xl font-bold text-primary">{{ unit.stats?.transactionsCount || 0 }}</div>
              <div class="text-xs text-muted-foreground">Transactions</div>
            </div>
            <div class="text-center p-3 border rounded-md">
              <div class="text-2xl font-bold text-primary">{{ formatDate(unit.lastUsed) || 'Never' }}</div>
              <div class="text-xs text-muted-foreground">Last Used</div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="pt-4 border-t">
          <div class="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span class="font-medium">Created:</span> {{ formatDateTime(unit.createdAt) }}
              <span v-if="unit.createdBy"> by {{ unit.createdBy }}</span>
            </div>
            <div>
              <span class="font-medium">Modified:</span> {{ formatDateTime(unit.updatedAt) }}
              <span v-if="unit.updatedBy"> by {{ unit.updatedBy }}</span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)">Close</Button>
        <Button @click="$emit('edit', unit)">
          <EditIcon class="h-4 w-4 mr-2" />
          Edit Unit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  EditIcon, RulerIcon, ScaleIcon, ClockIcon, ThermometerIcon, 
  ZapIcon, FlaskConicalIcon, PackageIcon 
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  unit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'edit'])

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
  return iconMap[category] || RulerIcon
}

function formatUnitType(type) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Standard'
}

function formatCategory(category) {
  return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General'
}

function formatDate(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString()
}

function formatDateTime(date) {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleString()
}

// Computed conversion examples
const conversionExamples = computed(() => {
  if (!props.unit || props.unit.isBaseUnit || !props.unit.conversionFactor) {
    return []
  }
  
  const factor = props.unit.conversionFactor
  const offset = props.unit.conversionOffset || 0
  
  return [
    { from: 1, to: (1 * factor + offset).toFixed(4) },
    { from: 10, to: (10 * factor + offset).toFixed(4) },
    { from: 100, to: (100 * factor + offset).toFixed(4) },
    { from: 1000, to: (1000 * factor + offset).toFixed(4) }
  ]
})
</script>
