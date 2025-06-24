<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 min-h-0">
      <div class="space-y-4 pb-4">
        <h3 class="text-lg font-semibold">Create Unit of Measure</h3>
        
        <!-- Unit Type Selection -->
        <div class="space-y-2">
          <Label>Unit Type *</Label>
          <Select v-model="formData.unitType">
            <SelectTrigger :class="{ 'border-destructive': errors.unitType }">
              <SelectValue placeholder="Select unit type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base Unit</SelectItem>
              <SelectItem value="conversion">Conversion Unit</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.unitType" class="text-destructive text-sm">{{ errors.unitType }}</p>
          <p class="text-xs text-muted-foreground">
            {{ formData.unitType === 'base' ? 'A base unit is the fundamental unit in its category (e.g., Kilogram, Meter)' : 'A conversion unit converts from a base unit (e.g., Gram from Kilogram)' }}
          </p>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="code">Code *</Label>
            <Input
              id="code"
              v-model="formData.code"
              placeholder="e.g., KG, M, PCS"
              :class="{ 'border-destructive': errors.code }"
            />
            <p v-if="errors.code" class="text-destructive text-sm">{{ errors.code }}</p>
          </div>

          <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., Kilogram, Meter, Piece"
              :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-destructive text-sm">{{ errors.name }}</p>
          </div>
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
          <Label>Category *</Label>
          <Select v-model="formData.category">
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
          <p v-if="errors.category" class="text-destructive text-sm">{{ errors.category }}</p>
        </div>

        <!-- Conversion Unit Fields -->
        <div v-if="formData.unitType === 'conversion'" class="space-y-4">
          <div class="space-y-2">
            <Label>Base Unit *</Label>
            <Select v-model="formData.baseUnitOfMeasureId">
              <SelectTrigger :class="{ 'border-destructive': errors.baseUnitOfMeasureId }">
                <SelectValue placeholder="Select base unit" />
              </SelectTrigger>              <SelectContent>
                <SelectItem v-for="unit in baseUnits" :key="unit.id" :value="String(unit.id)">
                  {{ unit.name }} ({{ unit.code }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.baseUnitOfMeasureId" class="text-destructive text-sm">{{ errors.baseUnitOfMeasureId }}</p>
          </div>

          <div class="space-y-2">
            <Label for="conversionFactor">Conversion Factor *</Label>
            <Input
              id="conversionFactor"
              v-model="formData.conversionFactor"
              type="number"
              step="any"
              placeholder="e.g., 0.001 (for grams to kg)"
              :class="{ 'border-destructive': errors.conversionFactor }"
            />
            <p v-if="errors.conversionFactor" class="text-destructive text-sm">{{ errors.conversionFactor }}</p>
            <p class="text-xs text-muted-foreground">
              How much of the base unit equals 1 of this unit (e.g., 1 gram = 0.001 kilogram)
            </p>
          </div>

          <!-- Conversion Preview -->
          <div v-if="formData.conversionFactor && selectedBaseUnit" class="p-3 border rounded-md bg-muted/30">
            <div class="text-sm font-medium mb-1">Conversion Preview</div>
            <div class="text-sm text-muted-foreground">
              1 {{ formData.code || 'unit' }} = {{ formData.conversionFactor }} {{ selectedBaseUnit?.code }}
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox id="isActive" v-model="formData.isActive" />
            <Label for="isActive" class="text-sm font-medium">
              Active (available for use)
            </Label>
          </div>
        </div>

        <!-- Summary for Review -->
        <div v-if="isFormValid" class="border rounded-md p-4 bg-muted/30 space-y-2">
          <div class="text-sm font-medium">Unit Summary</div>
          <div class="text-sm space-y-1">
            <div><strong>Type:</strong> {{ formData.unitType === 'base' ? 'Base Unit' : 'Conversion Unit' }}</div>
            <div><strong>Code:</strong> {{ formData.code }}</div>
            <div><strong>Name:</strong> {{ formData.name }}</div>
            <div><strong>Category:</strong> {{ selectedCategory?.label }}</div>
            <div v-if="formData.unitType === 'conversion' && selectedBaseUnit">
              <strong>Converts from:</strong> {{ selectedBaseUnit.name }} (1 {{ formData.code }} = {{ formData.conversionFactor }} {{ selectedBaseUnit.code }})
            </div>
          </div>
        </div>
      </div>
    </div>    <div class="border-t px-6 py-4 flex-shrink-0 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
      <div class="flex justify-end space-x-2">
        <Button variant="outline" @click="$emit('update:open', false)" :disabled="isCreating">
          Cancel
        </Button>
        <Button 
          @click="createUnit"
          :disabled="!isFormValid || isCreating"
        >
          <Loader2Icon v-if="isCreating" class="h-4 w-4 mr-2 animate-spin" />
          Create Unit
        </Button>
      </div>
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
import { 
  RulerIcon, ScaleIcon, ClockIcon, ThermometerIcon, ZapIcon, 
  FlaskConicalIcon, PackageIcon, Loader2Icon 
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
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

const emit = defineEmits(['update:open', 'created'])

const { toast } = useToast()

// Form state
const isCreating = ref(false)

const formData = ref({
  code: '',
  name: '',
  description: '',
  unitType: '',
  category: '',
  baseUnitOfMeasureId: null,
  conversionFactor: null,
  isActive: true
})

const errors = ref({})

// Static data
const defaultCategories = [
  { value: 'length', label: 'Length', icon: RulerIcon },
  { value: 'weight', label: 'Weight', icon: ScaleIcon },
  { value: 'volume', label: 'Volume', icon: FlaskConicalIcon },
  { value: 'time', label: 'Time', icon: ClockIcon },
  { value: 'temperature', label: 'Temperature', icon: ThermometerIcon },
  { value: 'energy', label: 'Energy', icon: ZapIcon },
  { value: 'quantity', label: 'Quantity', icon: PackageIcon }
]

const uomCategories = computed(() => {
  // If props.categories is array of strings, convert to objects
  if (props.categories.length > 0 && typeof props.categories[0] === 'string') {
    return props.categories.map(cat => 
      defaultCategories.find(def => def.value === cat) || { value: cat, label: cat, icon: PackageIcon }
    )
  }
  // If props.categories is already array of objects, use it
  if (props.categories.length > 0 && typeof props.categories[0] === 'object') {
    return props.categories
  }
  // Fallback to default categories
  return defaultCategories
})

// Use baseUnits from props instead of mock data
const baseUnits = computed(() => props.baseUnits)

// Computed properties
const selectedCategory = computed(() => 
  uomCategories.find(cat => cat.value === formData.value.category)
)

const selectedBaseUnit = computed(() => 
  baseUnits.value.find(unit => String(unit.id) === formData.value.baseUnitOfMeasureId)
)

const isFormValid = computed(() => {
  const hasBasicInfo = formData.value.code && formData.value.name && formData.value.unitType && formData.value.category
  
  if (formData.value.unitType === 'base') {
    return hasBasicInfo
  } else if (formData.value.unitType === 'conversion') {
    return hasBasicInfo && formData.value.baseUnitOfMeasureId && formData.value.conversionFactor
  }
  
  return false
})

// Methods
function validateForm() {
  errors.value = {}
  
  if (!formData.value.code) {
    errors.value.code = 'Code is required'
  }
  if (!formData.value.name) {
    errors.value.name = 'Name is required'
  }
  if (!formData.value.unitType) {
    errors.value.unitType = 'Unit type is required'
  }
  if (!formData.value.category) {
    errors.value.category = 'Category is required'
  }
  
  if (formData.value.unitType === 'conversion') {
    if (!formData.value.baseUnitOfMeasureId) {
      errors.value.baseUnitOfMeasureId = 'Base unit is required for conversion units'
    }
    if (!formData.value.conversionFactor) {
      errors.value.conversionFactor = 'Conversion factor is required'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function createUnit() {
  if (!validateForm()) {
    return
  }

  try {
    isCreating.value = true
    
    // Prepare API data based on unit type
    const apiData = {
      code: formData.value.code,
      name: formData.value.name,
      description: formData.value.description,
      category: formData.value.category,
      isActive: formData.value.isActive
    }

    // Add type-specific fields
    if (formData.value.unitType === 'base') {
      apiData.baseUnit = true
    } else {
      apiData.baseUnit = false
      apiData.baseUnitOfMeasureId = Number(formData.value.baseUnitOfMeasureId)
      apiData.conversionFactor = parseFloat(formData.value.conversionFactor)
    }
    
    // Emit to parent component to handle via store
    emit('created', apiData)
    
  } catch (error) {
    console.error('Failed to prepare unit creation:', error)
    toast({
      title: "Error",
      description: error.message || "Failed to prepare unit creation",
      variant: "destructive",
    })
  } finally {
    isCreating.value = false
  }
}

function resetForm() {
  formData.value = {
    code: '',
    name: '',
    description: '',
    unitType: '',
    category: '',
    baseUnitOfMeasureId: null,
    conversionFactor: null,
    isActive: true
  }
  errors.value = {}
}

// Watch for dialog close to reset form
watch(() => props.open, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>
