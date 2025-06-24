<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 min-h-0">
      <div class="space-y-4 pb-4">
      <!-- Basic Information -->
      <div class="space-y-4">
        <h3 class="text-base font-medium">Basic Information</h3>
        
        <div class="space-y-2">
          <Label for="name">Unit Name *</Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="e.g., Kilogram, Meter, Piece"
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-destructive text-sm">{{ errors.name }}</p>
        </div>        <div class="space-y-2">
          <Label for="symbol">Code *</Label>
          <Input
            id="symbol"
            v-model="formData.symbol"
            placeholder="e.g., kg, m, pcs"
            :class="{ 'border-destructive': errors.symbol }"
          />
          <p v-if="errors.symbol" class="text-destructive text-sm">{{ errors.symbol }}</p>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Optional description of the unit"
            rows="3"
          />
        </div>

        <div class="space-y-2">
          <Label>Category</Label>
          <Select v-model="formData.category" :disabled="hasUsage">
            <SelectTrigger :class="{ 'border-destructive': errors.category }">
              <SelectValue placeholder="Select a category" />
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
          <p v-if="hasUsage" class="text-xs text-muted-foreground">
            Category cannot be changed as this unit is already in use
          </p>
          <p v-if="errors.category" class="text-destructive text-sm">{{ errors.category }}</p>
        </div>
      </div>

      <!-- Conversion Settings -->
      <div class="space-y-4">
        <h3 class="text-base font-medium">Conversion Settings</h3>
        
        <div class="space-y-2">
          <div class="flex items-center space-x-2">            <Checkbox 
              id="baseUnit" 
              v-model="formData.isBaseUnit" 
              :disabled="hasUsage && !unit?.baseUnit"
            />
            <Label for="baseUnit" class="text-sm font-medium">
              This is a base unit (no conversion needed)
            </Label>
          </div>
          <p v-if="hasUsage && !unit?.baseUnit" class="text-xs text-muted-foreground">
            Cannot change to base unit as this unit is already in use with conversions
          </p>
        </div>

        <div v-if="!formData.isBaseUnit" class="space-y-4">          <div class="space-y-2">
            <Label>Convert From</Label>
            <Select v-model="formData.baseUnitId" :disabled="hasUsage">
              <SelectTrigger :class="{ 'border-destructive': errors.baseUnitId }">
                <SelectValue placeholder="Select base unit" />
              </SelectTrigger>              <SelectContent>
                <SelectItem v-for="unit in (baseUnits || [])" :key="unit.id" :value="String(unit.id)">
                  {{ unit.name }} ({{ unit.code }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="hasUsage" class="text-xs text-muted-foreground">
              Base unit cannot be changed as this unit is already in use
            </p>
            <p v-if="errors.baseUnitId" class="text-destructive text-sm">{{ errors.baseUnitId }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">            <div class="space-y-2">
              <Label for="factor">Conversion Factor *</Label>
              <Input
                id="factor"
                v-model="formData.conversionFactor"
                type="number"
                step="any"
                placeholder="1.0"
                :disabled="hasUsage"
                :class="{ 'border-destructive': errors.conversionFactor }"
              />
              <p v-if="hasUsage" class="text-xs text-muted-foreground">
                Cannot change conversion factor as this unit is in use
              </p>
              <p v-if="errors.conversionFactor" class="text-destructive text-sm">{{ errors.conversionFactor }}</p>
            </div>
            <div class="space-y-2">
              <Label for="offset">Offset</Label>
              <Input
                id="offset"
                v-model="formData.conversionOffset"
                type="number"
                step="any"
                placeholder="0.0"
                :disabled="hasUsage"
              />
            </div>
          </div>

          <div v-if="formData.conversionFactor" class="p-3 border rounded-md bg-muted/30">
            <div class="text-sm font-medium mb-2">Conversion Preview</div>            <div class="text-sm text-muted-foreground">
              1 {{ formData.symbol || 'unit' }} = {{ formData.conversionFactor || 1 }} {{ selectedBaseUnit?.code || 'base' }}
              <span v-if="formData.conversionOffset"> + {{ formData.conversionOffset }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Settings -->
      <div class="space-y-4">
        <h3 class="text-base font-medium">Additional Settings</h3>
        
        <div class="space-y-2">
          <Label for="precision">Decimal Precision</Label>
          <Select v-model="formData.decimalPrecision">
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

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox id="fractional" v-model="formData.allowFractional" />
            <Label for="fractional" class="text-sm font-medium">
              Allow fractional values
            </Label>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox id="active" v-model="formData.isActive" />
            <Label for="active" class="text-sm font-medium">
              Active (available for use)
            </Label>
          </div>
          <p v-if="!formData.isActive" class="text-xs text-amber-600">
            Deactivating this unit will prevent it from being used in new transactions
          </p>
        </div>

        <div class="space-y-2">
          <Label for="tags">Tags</Label>
          <TagInput
            v-model="formData.tags"
            placeholder="Add tags..."
          />
        </div>
      </div>      <!-- Warning Messages -->
      <div v-if="hasUsage" class="p-4 border border-amber-200 rounded-md bg-amber-50">
        <div class="flex items-start space-x-2">
          <AlertTriangleIcon class="h-5 w-5 text-amber-600 mt-0.5" />
          <div class="text-sm">
            <p class="font-medium text-amber-800">Unit In Use</p>
            <p class="text-amber-700 mt-1">
              This unit is currently being used in {{ unit?.stats?.productsCount || 0 }} products and 
              {{ unit?.stats?.transactionsCount || 0 }} transactions. Some settings cannot be modified 
              to maintain data integrity.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>

    <div class="border-t px-6 py-4 flex justify-end space-x-2 flex-shrink-0 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
      <Button variant="outline" @click="$emit('update:open', false)" :disabled="isSaving">
        Cancel
      </Button>
      <Button @click="saveChanges" :disabled="!hasChanges || isSaving">
        <Loader2Icon v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
        Save Changes
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TagInput from '@/components/common/TagInput.vue'
import { AlertTriangleIcon, Loader2Icon, RulerIcon, ScaleIcon, FlaskConicalIcon, ClockIcon, ThermometerIcon, ZapIcon, PackageIcon } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  unit: {
    type: Object,
    default: null
  },
  baseUnits: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:open', 'updated'])

const { toast } = useToast()

// Form state
const isSaving = ref(false)
const formData = ref({
  name: '',
  symbol: '',
  description: '',
  category: '',
  isBaseUnit: false,
  baseUnitId: null,
  conversionFactor: 1,
  conversionOffset: 0,
  decimalPrecision: '2',
  allowFractional: true,
  isActive: true,
  tags: []
})

const originalData = ref({})
const errors = ref({})

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

// Mock data - replace with actual API calls
const baseUnits = computed(() => props.baseUnits || [])

// Computed properties
const hasUsage = computed(() => {
  return props.unit?.stats?.productsCount > 0 || props.unit?.stats?.transactionsCount > 0
})

const selectedBaseUnit = computed(() => 
  (baseUnits.value || []).find(unit => String(unit.id) === formData.value.baseUnitId)
)

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Methods
function loadUnitData() {
  if (props.unit) {
    const data = {
      name: props.unit.name || '',
      symbol: props.unit.code || '',
      description: props.unit.description || '',
      category: props.unit.category || '',
      isBaseUnit: props.unit.baseUnit || false,
      baseUnitId: props.unit.baseUnitOfMeasure?.id ? String(props.unit.baseUnitOfMeasure.id) : null,
      conversionFactor: props.unit.conversionFactor || 1,
      conversionOffset: props.unit.conversionOffset || 0,
      decimalPrecision: String(props.unit.decimalPrecision || 2),
      allowFractional: props.unit.allowFractional !== false,
      isActive: props.unit.isActive !== false,
      tags: props.unit.tags || []
    }
    
    formData.value = { ...data }
    originalData.value = { ...data }
  }
}

function validateForm() {
  errors.value = {}
  
  if (!formData.value.name?.trim()) {
    errors.value.name = 'Unit name is required'
  }
    if (!formData.value.symbol?.trim()) {
    errors.value.symbol = 'Code is required'
  }
  
  if (!formData.value.category) {
    errors.value.category = 'Category is required'
  }
  
  if (!formData.value.isBaseUnit) {
    if (!formData.value.baseUnitId) {
      errors.value.baseUnitId = 'Base unit is required for conversion units'
    }
    
    if (!formData.value.conversionFactor || formData.value.conversionFactor <= 0) {
      errors.value.conversionFactor = 'Conversion factor must be greater than 0'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function saveChanges() {
  if (!validateForm()) {
    return
  }
  
  try {
    isSaving.value = true    // Prepare update data - only send fields that match UpdateUnitOfMeasureRequest
    const updateData = {
      code: formData.value.symbol,
      name: formData.value.name,
      description: formData.value.description,
      category: formData.value.category,
      baseUnit: formData.value.isBaseUnit,
      conversionFactor: Number(formData.value.conversionFactor),
      isActive: formData.value.isActive
    }
    
    // Only add baseUnitOfMeasureId if it's a conversion unit
    if (!formData.value.isBaseUnit && formData.value.baseUnitId) {
      updateData.baseUnitOfMeasureId = Number(formData.value.baseUnitId)
    }
      // Emit the update to parent component to handle via store
    emit('updated', updateData)
  } catch (error) {
    console.error('Failed to prepare unit update:', error)
    toast({
      title: "Error",
      description: error.message || "Failed to prepare unit update",
      variant: "destructive",
    })
  } finally {
    isSaving.value = false
  }
}

// Watch for unit changes
watch(() => props.unit, () => {
  if (props.unit) {
    loadUnitData()
  }
}, { immediate: true })

// Watch for dialog close to reset form
watch(() => props.open, (newValue) => {
  if (newValue && props.unit) {
    loadUnitData()
  }
})
</script>
