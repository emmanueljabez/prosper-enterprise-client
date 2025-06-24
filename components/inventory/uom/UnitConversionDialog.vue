<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-md max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Unit Conversion Calculator</DialogTitle>
        <DialogDescription>
          Convert between different units of measure
        </DialogDescription>
      </DialogHeader>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto flex-1 space-y-4 pr-2">
        <!-- From Unit -->
        <div class="space-y-2">
          <Label>From</Label>
          <div class="flex space-x-2">
            <Input
              v-model="fromValue"
              type="number"
              step="any"
              placeholder="Enter value"
              class="flex-1"
              @input="debouncedConvert"
            />
            <Select v-model="fromUnitId" @update:modelValue="performConversion">
              <SelectTrigger class="w-24">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="unit in units" :key="unit.id" :value="unit.id">
                  {{ unit.code }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Conversion Arrow -->
        <div class="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            @click="swapUnits"
            class="h-8 w-8 p-0 rounded-full"
            :disabled="!fromUnitId || !toUnitId"
          >
            <ArrowUpDownIcon class="h-4 w-4" />
          </Button>
        </div>

        <!-- To Unit -->
        <div class="space-y-2">
          <Label>To</Label>
          <div class="flex space-x-2">
            <Input
              v-model="toValue"
              type="number"
              step="any"
              placeholder="Result"
              class="flex-1"
              readonly
              :class="{ 'bg-muted': toValue }"
            />
            <Select v-model="toUnitId" @update:modelValue="performConversion">
              <SelectTrigger class="w-24">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="unit in units" :key="unit.id" :value="unit.id">
                  {{ unit.code }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-4">
          <Loader2Icon class="h-6 w-6 animate-spin text-primary" />
        </div>

        <!-- Conversion Result -->
        <div v-if="conversionResult && !loading" class="p-3 border rounded-md bg-muted/30">
          <div class="text-sm">
            <div class="font-medium">
              {{ fromValue }} {{ selectedFromUnit?.code }} = 
              <span class="text-primary">{{ conversionResult }}</span> {{ selectedToUnit?.code }}
            </div>
            <div class="text-muted-foreground mt-1">
              {{ selectedFromUnit?.name }} → {{ selectedToUnit?.name }}
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="p-3 border border-destructive/20 rounded-md bg-destructive/5">
          <div class="text-sm text-destructive">
            {{ error }}
          </div>
        </div>

        <!-- Recent Conversions -->
        <div v-if="recentConversions.length > 0" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">RECENT CONVERSIONS</Label>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div 
              v-for="recent in recentConversions.slice(0, 5)" 
              :key="`${recent.fromUnit.id}-${recent.toUnit.id}-${recent.originalQuantity}`"
              class="flex items-center justify-between p-2 border rounded text-xs cursor-pointer hover:bg-muted/50"
              @click="applyRecentConversion(recent)"
            >
              <span>{{ recent.originalQuantity }} {{ recent.fromUnit.code }} → {{ recent.convertedQuantity }} {{ recent.toUnit.code }}</span>
              <ClockIcon class="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <DialogFooter class="border-t pt-4 mt-4">
        <Button variant="outline" @click="updateOpen(false)">Close</Button>
        <Button 
          @click="performConversion"
          :disabled="!fromValue || !fromUnitId || !toUnitId || loading"
        >
          <ArrowRightLeftIcon class="h-4 w-4 mr-2" />
          Convert
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowUpDownIcon, ArrowRightLeftIcon, ClockIcon, Loader2Icon
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'
import { useUomStore } from '@/store/modules/inventory/uom'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  initialFromUnit: {
    type: [Number, String],
    default: null
  },
  initialToUnit: {
    type: [Number, String],
    default: null
  },
  initialValue: {
    type: [Number, String],
    default: 1
  }
})

const emit = defineEmits(['update:open'])

const { toast } = useToast()
const uomStore = useUomStore()

// State
const fromValue = ref('')
const toValue = ref('')
const fromUnitId = ref(null)
const toUnitId = ref(null)
const loading = ref(false)
const error = ref('')
const conversionResult = ref('')

// Computed
const units = computed(() => uomStore.getUnitsList)
const recentConversions = computed(() => uomStore.getConversionHistory)

const selectedFromUnit = computed(() => 
  units.value.find(unit => unit.id === fromUnitId.value)
)

const selectedToUnit = computed(() => 
  units.value.find(unit => unit.id === toUnitId.value)
)

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function resetForm() {
  fromValue.value = ''
  toValue.value = ''
  conversionResult.value = ''
  error.value = ''
}

async function performConversion() {
  if (!fromValue.value || !fromUnitId.value || !toUnitId.value) {
    toValue.value = ''
    conversionResult.value = ''
    return
  }

  // Check if converting from same unit to same unit
  if (fromUnitId.value === toUnitId.value) {
    toValue.value = fromValue.value
    conversionResult.value = fromValue.value
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await uomStore.convertQuantity({
      quantity: parseFloat(fromValue.value),
      fromUnitId: fromUnitId.value,
      toUnitId: toUnitId.value
    })

    conversionResult.value = result
    toValue.value = result

    toast({
      title: "Success",
      description: "Unit conversion completed",
      variant: "default"
    })
  } catch (err) {
    console.error('Conversion error:', err)
    error.value = err.message || 'Failed to convert units'
    toValue.value = ''
    conversionResult.value = ''
    
    toast({
      title: "Error",
      description: error.value,
      variant: "destructive"
    })
  } finally {
    loading.value = false
  }
}

function swapUnits() {
  const tempUnit = fromUnitId.value
  const tempValue = fromValue.value
  
  fromUnitId.value = toUnitId.value
  toUnitId.value = tempUnit
  fromValue.value = toValue.value
  
  if (fromValue.value) {
    performConversion()
  }
}

function applyRecentConversion(recent) {
  fromUnitId.value = recent.fromUnit.id
  toUnitId.value = recent.toUnit.id
  fromValue.value = String(recent.originalQuantity)
  performConversion()
}

// Debounced conversion for input changes
let conversionTimeout = null
function debouncedConvert() {
  if (conversionTimeout) {
    clearTimeout(conversionTimeout)
  }
  conversionTimeout = setTimeout(() => {
    performConversion()
  }, 500)
}

// Initialize on mount
onMounted(async () => {
  // Load units if not already loaded
  if (units.value.length === 0) {
    try {
      await uomStore.fetchUnits()
    } catch (error) {
      console.error('Failed to load units:', error)
    }
  }
})

// Watch for prop changes
watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.initialFromUnit) {
      fromUnitId.value = props.initialFromUnit
    }
    if (props.initialToUnit) {
      toUnitId.value = props.initialToUnit
    }
    if (props.initialValue) {
      fromValue.value = String(props.initialValue)
    }
  }
})
</script>
