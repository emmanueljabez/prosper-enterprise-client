<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Conversion Unit</DialogTitle>
        <DialogDescription>
          Create a new unit that converts to {{ baseUnit?.name }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Base Unit Info -->
        <div v-if="baseUnit" class="p-3 border rounded-md bg-muted/30">
          <div class="flex items-center space-x-2">
            <component :is="getCategoryIcon(baseUnit.category)" class="h-4 w-4" />
            <span class="font-medium">{{ baseUnit.name }} ({{ baseUnit.symbol }})</span>
            <Badge variant="default" class="text-xs">Base Unit</Badge>
          </div>
          <p class="text-sm text-muted-foreground mt-1">{{ baseUnit.description }}</p>
        </div>

        <!-- New Unit Information -->
        <div class="space-y-3">
          <div class="space-y-2">
            <Label for="name">Unit Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., Centimeter, Gram, Inch"
              :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-destructive text-sm">{{ errors.name }}</p>
          </div>

          <div class="space-y-2">
            <Label for="symbol">Symbol *</Label>
            <Input
              id="symbol"
              v-model="formData.symbol"
              placeholder="e.g., cm, g, in"
              :class="{ 'border-destructive': errors.symbol }"
            />
            <p v-if="errors.symbol" class="text-destructive text-sm">{{ errors.symbol }}</p>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input
              id="description"
              v-model="formData.description"
              placeholder="Optional description"
            />
          </div>
        </div>

        <!-- Conversion Setup -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium">Conversion Formula</h4>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="factor">Conversion Factor *</Label>
              <Input
                id="factor"
                v-model="formData.conversionFactor"
                type="number"
                step="any"
                placeholder="1.0"
                :class="{ 'border-destructive': errors.conversionFactor }"
                @input="updatePreview"
              />
              <p v-if="errors.conversionFactor" class="text-destructive text-sm">{{ errors.conversionFactor }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="offset">Offset (Optional)</Label>
              <Input
                id="offset"
                v-model="formData.conversionOffset"
                type="number"
                step="any"
                placeholder="0.0"
                @input="updatePreview"
              />
            </div>
          </div>

          <!-- Conversion Preview -->
          <div class="p-3 border rounded-md bg-muted/30">
            <div class="text-sm">
              <div class="font-medium mb-1">Conversion Preview:</div>
              <div class="text-muted-foreground">
                1 {{ formData.symbol || '[symbol]' }} = 
                {{ formData.conversionFactor || 1 }} {{ baseUnit?.symbol || '[base]' }}
                <span v-if="formData.conversionOffset"> + {{ formData.conversionOffset }}</span>
              </div>
              <div class="text-muted-foreground mt-1">
                {{ testValue }} {{ formData.symbol || '[symbol]' }} = 
                {{ calculateConversion(testValue) }} {{ baseUnit?.symbol || '[base]' }}
              </div>
            </div>
          </div>

          <!-- Quick Factor Buttons -->
          <div class="space-y-2">
            <Label class="text-sm">Common Factors:</Label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="factor in commonFactors"
                :key="factor.value"
                variant="outline"
                size="sm"
                @click="setFactor(factor.value)"
                class="h-8 text-xs"
              >
                {{ factor.label }} ({{ factor.value }})
              </Button>
            </div>
          </div>
        </div>

        <!-- Additional Settings -->
        <div class="space-y-3">
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
              <Label for="fractional" class="text-sm">
                Allow fractional values
              </Label>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="active" v-model="formData.isActive" />
              <Label for="active" class="text-sm">
                Active (available for use)
              </Label>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)" :disabled="isCreating">
          Cancel
        </Button>
        <Button @click="createUnit" :disabled="!canCreate || isCreating">
          <Loader2Icon v-if="isCreating" class="h-4 w-4 mr-2 animate-spin" />
          Create Unit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Loader2Icon, RulerIcon, ScaleIcon, FlaskConicalIcon, 
  ClockIcon, ThermometerIcon, ZapIcon, PackageIcon 
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  baseUnit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'created'])

const { toast } = useToast()

// Form state
const isCreating = ref(false)
const testValue = ref(10)

const formData = ref({
  name: '',
  symbol: '',
  description: '',
  conversionFactor: '',
  conversionOffset: '',
  decimalPrecision: '2',
  allowFractional: true,
  isActive: true
})

const errors = ref({})

// Common conversion factors based on category
const commonFactorsByCategory = {
  length: [
    { label: '1/100', value: 0.01 }, // cm to m
    { label: '1/1000', value: 0.001 }, // mm to m
    { label: '1000', value: 1000 }, // km to m
    { label: '0.0254', value: 0.0254 }, // inch to m
    { label: '0.3048', value: 0.3048 }, // foot to m
  ],
  weight: [
    { label: '1/1000', value: 0.001 }, // g to kg
    { label: '1000', value: 1000 }, // ton to kg
    { label: '0.453592', value: 0.453592 }, // lb to kg
    { label: '0.0283495', value: 0.0283495 }, // oz to kg
  ],
  volume: [
    { label: '1/1000', value: 0.001 }, // mL to L
    { label: '3.78541', value: 3.78541 }, // gallon to L
    { label: '0.946353', value: 0.946353 }, // quart to L
  ],
  default: [
    { label: '1/10', value: 0.1 },
    { label: '1/100', value: 0.01 },
    { label: '1/1000', value: 0.001 },
    { label: '10', value: 10 },
    { label: '100', value: 100 },
    { label: '1000', value: 1000 }
  ]
}

// Computed properties
const commonFactors = computed(() => {
  const category = props.baseUnit?.category || 'default'
  return commonFactorsByCategory[category] || commonFactorsByCategory.default
})

const canCreate = computed(() => {
  return formData.value.name && 
         formData.value.symbol && 
         formData.value.conversionFactor &&
         Object.keys(errors.value).length === 0
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function resetForm() {
  formData.value = {
    name: '',
    symbol: '',
    description: '',
    conversionFactor: '',
    conversionOffset: '',
    decimalPrecision: '2',
    allowFractional: true,
    isActive: true
  }
  errors.value = {}
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

function setFactor(value) {
  formData.value.conversionFactor = String(value)
  updatePreview()
}

function updatePreview() {
  // This method can be used to update live preview calculations
}

function calculateConversion(value) {
  const factor = parseFloat(formData.value.conversionFactor) || 1
  const offset = parseFloat(formData.value.conversionOffset) || 0
  const result = value * factor + offset
  return result.toFixed(4)
}

function validateForm() {
  errors.value = {}
  
  if (!formData.value.name) {
    errors.value.name = 'Unit name is required'
  }
  
  if (!formData.value.symbol) {
    errors.value.symbol = 'Symbol is required'
  }
  
  if (!formData.value.conversionFactor) {
    errors.value.conversionFactor = 'Conversion factor is required'
  } else if (isNaN(parseFloat(formData.value.conversionFactor))) {
    errors.value.conversionFactor = 'Conversion factor must be a number'
  } else if (parseFloat(formData.value.conversionFactor) <= 0) {
    errors.value.conversionFactor = 'Conversion factor must be greater than 0'
  }
  
  return Object.keys(errors.value).length === 0
}

async function createUnit() {
  if (!validateForm()) {
    return
  }
  
  try {
    isCreating.value = true
    
    const unitData = {
      name: formData.value.name,
      symbol: formData.value.symbol,
      description: formData.value.description,
      category: props.baseUnit.category,
      unitType: props.baseUnit.unitType,
      isBaseUnit: false,
      baseUnitId: props.baseUnit.id,
      conversionFactor: parseFloat(formData.value.conversionFactor),
      conversionOffset: parseFloat(formData.value.conversionOffset) || 0,
      decimalPrecision: parseInt(formData.value.decimalPrecision),
      allowFractional: formData.value.allowFractional,
      isActive: formData.value.isActive,
      familyId: props.baseUnit.familyId
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Success",
      description: "Conversion unit created successfully",
    })
    
    emit('created', unitData)
    updateOpen(false)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create conversion unit",
      variant: "destructive",
    })
  } finally {
    isCreating.value = false
  }
}

// Watch for base unit changes
watch(() => props.baseUnit, () => {
  if (props.baseUnit) {
    // Auto-fill category-specific description
    const categoryDescriptions = {
      length: `Length unit that converts to ${props.baseUnit.name}`,
      weight: `Weight unit that converts to ${props.baseUnit.name}`,
      volume: `Volume unit that converts to ${props.baseUnit.name}`,
      time: `Time unit that converts to ${props.baseUnit.name}`,
      temperature: `Temperature unit that converts to ${props.baseUnit.name}`,
      energy: `Energy unit that converts to ${props.baseUnit.name}`,
      quantity: `Quantity unit that converts to ${props.baseUnit.name}`
    }
    
    formData.value.description = categoryDescriptions[props.baseUnit.category] || 
      `Unit that converts to ${props.baseUnit.name}`
  }
})
</script>
