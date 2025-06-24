<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Bulk Edit Units</DialogTitle>
        <DialogDescription>
          Apply changes to {{ selectedUnits.length }} selected unit(s)
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Selected Units Preview -->
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">SELECTED UNITS ({{ selectedUnits.length }})</Label>
          <div class="max-h-32 overflow-y-auto border rounded-md p-3 bg-muted/30">
            <div class="flex flex-wrap gap-2">
              <Badge v-for="unit in selectedUnits" :key="unit.id" variant="secondary" class="text-xs">
                {{ unit.name }} ({{ unit.symbol }})
              </Badge>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Actions to Apply</h3>
          
          <!-- Status Change -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="changeStatus" v-model="actions.changeStatus" />
              <Label for="changeStatus" class="text-sm font-medium">
                Change Status
              </Label>
            </div>
            
            <div v-if="actions.changeStatus" class="ml-6 space-y-2">
              <RadioGroup v-model="bulkData.status" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label for="status-active">Active</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label for="status-inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <!-- Category Change -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="changeCategory" v-model="actions.changeCategory" />
              <Label for="changeCategory" class="text-sm font-medium">
                Change Category
              </Label>
            </div>
            
            <div v-if="actions.changeCategory" class="ml-6">
              <Select v-model="bulkData.category">
                <SelectTrigger>
                  <SelectValue placeholder="Select new category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in uomCategories" :key="category.value" :value="category.value">
                    <div class="flex items-center">
                      <component :is="category.icon" class="h-4 w-4 mr-2" />
                      {{ category.label }}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-amber-600 mt-1">
                ⚠️ Changing category may affect conversions and family relationships
              </p>
            </div>
          </div>

          <!-- Precision Change -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="changePrecision" v-model="actions.changePrecision" />
              <Label for="changePrecision" class="text-sm font-medium">
                Update Decimal Precision
              </Label>
            </div>
            
            <div v-if="actions.changePrecision" class="ml-6">
              <Select v-model="bulkData.decimalPrecision">
                <SelectTrigger>
                  <SelectValue placeholder="Select precision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (Whole numbers)</SelectItem>
                  <SelectItem value="1">1 decimal place</SelectItem>
                  <SelectItem value="2">2 decimal places</SelectItem>
                  <SelectItem value="3">3 decimal places</SelectItem>
                  <SelectItem value="4">4 decimal places</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Fractional Setting -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="changeFractional" v-model="actions.changeFractional" />
              <Label for="changeFractional" class="text-sm font-medium">
                Update Fractional Setting
              </Label>
            </div>
            
            <div v-if="actions.changeFractional" class="ml-6">
              <RadioGroup v-model="bulkData.allowFractional" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="fractional-yes" />
                  <Label for="fractional-yes">Allow fractional values</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="fractional-no" />
                  <Label for="fractional-no">Whole numbers only</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <!-- Add Tags -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="addTags" v-model="actions.addTags" />
              <Label for="addTags" class="text-sm font-medium">
                Add Tags
              </Label>
            </div>
            
            <div v-if="actions.addTags" class="ml-6">
              <TagInput
                v-model="bulkData.tagsToAdd"
                placeholder="Enter tags to add..."
              />
              <p class="text-xs text-muted-foreground mt-1">
                These tags will be added to existing tags on selected units
              </p>
            </div>
          </div>

          <!-- Remove Tags -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Checkbox id="removeTags" v-model="actions.removeTags" />
              <Label for="removeTags" class="text-sm font-medium">
                Remove Tags
              </Label>
            </div>
            
            <div v-if="actions.removeTags" class="ml-6">
              <TagInput
                v-model="bulkData.tagsToRemove"
                placeholder="Enter tags to remove..."
              />
              <p class="text-xs text-muted-foreground mt-1">
                These tags will be removed from selected units (if present)
              </p>
            </div>
          </div>
        </div>

        <!-- Preview Changes -->
        <div v-if="hasActions" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">PREVIEW CHANGES</Label>
          <div class="border rounded-md p-3 bg-muted/30 space-y-2">
            <div v-if="actions.changeStatus" class="text-sm">
              <span class="font-medium">Status:</span> Set to {{ bulkData.status === 'active' ? 'Active' : 'Inactive' }}
            </div>
            <div v-if="actions.changeCategory" class="text-sm">
              <span class="font-medium">Category:</span> Change to {{ getCategoryLabel(bulkData.category) }}
            </div>
            <div v-if="actions.changePrecision" class="text-sm">
              <span class="font-medium">Precision:</span> Set to {{ bulkData.decimalPrecision }} decimal places
            </div>
            <div v-if="actions.changeFractional" class="text-sm">
              <span class="font-medium">Fractional:</span> {{ bulkData.allowFractional === 'true' ? 'Allow' : 'Disallow' }} fractional values
            </div>
            <div v-if="actions.addTags && bulkData.tagsToAdd.length > 0" class="text-sm">
              <span class="font-medium">Add Tags:</span> {{ bulkData.tagsToAdd.join(', ') }}
            </div>
            <div v-if="actions.removeTags && bulkData.tagsToRemove.length > 0" class="text-sm">
              <span class="font-medium">Remove Tags:</span> {{ bulkData.tagsToRemove.join(', ') }}
            </div>
          </div>
        </div>

        <!-- Warnings -->
        <div v-if="hasWarnings" class="p-4 border border-amber-200 rounded-md bg-amber-50">
          <div class="flex items-start space-x-2">
            <AlertTriangleIcon class="h-5 w-5 text-amber-600 mt-0.5" />
            <div class="text-sm">
              <p class="font-medium text-amber-800 mb-2">Important Considerations:</p>
              <ul class="space-y-1 text-amber-700">
                <li v-if="actions.changeCategory">
                  • Changing category may break existing conversions and family relationships
                </li>
                <li v-if="actions.changeStatus && bulkData.status === 'inactive'">
                  • Deactivating units will prevent them from being used in new transactions
                </li>
                <li v-if="unitsInUse.length > 0">
                  • {{ unitsInUse.length }} of the selected units are currently in use
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)" :disabled="isProcessing">
          Cancel
        </Button>
        <Button
          @click="applyBulkChanges"
          :disabled="!hasActions || isProcessing"
        >
          <Loader2Icon v-if="isProcessing" class="h-4 w-4 mr-2 animate-spin" />
          Apply Changes to {{ selectedUnits.length }} Unit(s)
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TagInput from '@/components/common/TagInput.vue'
import { 
  AlertTriangleIcon, Loader2Icon,
  RulerIcon, ScaleIcon, FlaskConicalIcon, ClockIcon, 
  ThermometerIcon, ZapIcon, PackageIcon 
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  selectedUnits: {
    type: Array,
    default: () => []
  },
  baseUnits: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'units-updated'])

const { toast } = useToast()

// Form state
const isProcessing = ref(false)

const actions = ref({
  changeStatus: false,
  changeCategory: false,
  changePrecision: false,
  changeFractional: false,
  addTags: false,
  removeTags: false
})

const bulkData = ref({
  status: 'active',
  category: '',
  decimalPrecision: '2',
  allowFractional: 'true',
  tagsToAdd: [],
  tagsToRemove: []
})

// Static data
const uomCategories = [
  { value: 'length', label: 'Length', icon: RulerIcon },
  { value: 'weight', label: 'Weight', icon: ScaleIcon },
  { value: 'volume', label: 'Volume', icon: FlaskConicalIcon },
  { value: 'time', label: 'Time', icon: ClockIcon },
  { value: 'temperature', label: 'Temperature', icon: ThermometerIcon },
  { value: 'energy', label: 'Energy', icon: ZapIcon },
  { value: 'quantity', label: 'Quantity', icon: PackageIcon }
]

// Computed properties
const hasActions = computed(() => {
  return Object.values(actions.value).some(action => action)
})

const unitsInUse = computed(() => {
  return props.selectedUnits.filter(unit => 
    unit.stats?.productsCount > 0 || unit.stats?.transactionsCount > 0
  )
})

const hasWarnings = computed(() => {
  return actions.value.changeCategory || 
         (actions.value.changeStatus && bulkData.value.status === 'inactive') ||
         unitsInUse.value.length > 0
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function resetForm() {
  actions.value = {
    changeStatus: false,
    changeCategory: false,
    changePrecision: false,
    changeFractional: false,
    addTags: false,
    removeTags: false
  }
  
  bulkData.value = {
    status: 'active',
    category: '',
    decimalPrecision: '2',
    allowFractional: 'true',
    tagsToAdd: [],
    tagsToRemove: []
  }
}

function getCategoryLabel(value) {
  const category = uomCategories.find(cat => cat.value === value)
  return category?.label || value
}

async function applyBulkChanges() {
  if (!hasActions.value) return
  
  try {
    isProcessing.value = true
    
    const changes = {}
    
    if (actions.value.changeStatus) {
      changes.isActive = bulkData.value.status === 'active'
    }
    
    if (actions.value.changeCategory) {
      changes.category = bulkData.value.category
    }
    
    if (actions.value.changePrecision) {
      changes.decimalPrecision = parseInt(bulkData.value.decimalPrecision)
    }
    
    if (actions.value.changeFractional) {
      changes.allowFractional = bulkData.value.allowFractional === 'true'
    }
    
    if (actions.value.addTags) {
      changes.tagsToAdd = bulkData.value.tagsToAdd
    }
    
    if (actions.value.removeTags) {
      changes.tagsToRemove = bulkData.value.tagsToRemove
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast({
      title: "Success",
      description: `Successfully updated ${props.selectedUnits.length} unit(s)`,
    })
    
    emit('units-updated', {
      units: props.selectedUnits,
      changes: changes
    })
    
    updateOpen(false)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update units",
      variant: "destructive",
    })
  } finally {
    isProcessing.value = false
  }
}
</script>
