<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Unit Templates</DialogTitle>
        <DialogDescription>
          Browse and apply pre-configured unit templates
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Template Categories -->
        <div class="space-y-2">
          <Label>Template Categories</Label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="category in templateCategories"
              :key="category.value"
              variant="outline"
              size="sm"
              :class="{ 'bg-primary text-primary-foreground': selectedCategory === category.value }"
              @click="selectedCategory = category.value"
            >
              <component :is="category.icon" class="h-4 w-4 mr-2" />
              {{ category.label }}
            </Button>
          </div>
        </div>

        <!-- Search -->
        <div class="space-y-2">
          <Label>Search Templates</Label>
          <div class="relative">
            <SearchIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Search templates..."
              class="pl-10"
            />
          </div>
        </div>

        <!-- Template Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium text-muted-foreground">
              AVAILABLE TEMPLATES ({{ filteredTemplates.length }})
            </Label>
            <Button variant="outline" size="sm" @click="refreshTemplates">
              <RefreshCwIcon class="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div 
              v-for="template in filteredTemplates" 
              :key="template.id"
              class="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              :class="{ 'ring-2 ring-primary': selectedTemplate?.id === template.id }"
              @click="selectTemplate(template)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <component :is="getCategoryIcon(template.category)" class="h-5 w-5" />
                  <h3 class="font-medium">{{ template.name }}</h3>
                </div>
                <Badge :variant="template.type === 'system' ? 'default' : 'secondary'" class="text-xs">
                  {{ template.type }}
                </Badge>
              </div>
              
              <p class="text-sm text-muted-foreground mb-3">{{ template.description }}</p>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Units:</span>
                  <span class="font-medium">{{ template.units.length }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Families:</span>
                  <span class="font-medium">{{ template.families?.length || 0 }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Category:</span>
                  <span class="font-medium">{{ formatCategory(template.category) }}</span>
                </div>
              </div>

              <!-- Preview Units -->
              <div class="mt-3 pt-3 border-t">
                <div class="text-xs text-muted-foreground mb-2">Preview:</div>
                <div class="flex flex-wrap gap-1">
                  <Badge 
                    v-for="unit in template.units.slice(0, 4)" 
                    :key="unit.symbol"
                    variant="outline" 
                    class="text-xs"
                  >
                    {{ unit.symbol }}
                  </Badge>
                  <Badge v-if="template.units.length > 4" variant="outline" class="text-xs">
                    +{{ template.units.length - 4 }} more
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Template Details -->
        <div v-if="selectedTemplate" class="space-y-4">
          <div class="border-t pt-4">
            <Label class="text-sm font-medium text-muted-foreground">TEMPLATE DETAILS</Label>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h3 class="font-medium mb-2">{{ selectedTemplate.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ selectedTemplate.description }}</p>
              </div>
              
              <div class="space-y-2">
                <div class="text-sm">
                  <span class="font-medium">Category:</span> {{ formatCategory(selectedTemplate.category) }}
                </div>
                <div class="text-sm">
                  <span class="font-medium">Type:</span> {{ selectedTemplate.type }}
                </div>
                <div class="text-sm">
                  <span class="font-medium">Version:</span> {{ selectedTemplate.version }}
                </div>
                <div class="text-sm">
                  <span class="font-medium">Last Updated:</span> {{ formatDate(selectedTemplate.updatedAt) }}
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <Label class="text-sm font-medium mb-2 block">Units ({{ selectedTemplate.units.length }})</Label>
                <div class="max-h-32 overflow-y-auto space-y-1">
                  <div 
                    v-for="unit in selectedTemplate.units" 
                    :key="unit.symbol"
                    class="flex items-center justify-between text-sm p-2 border rounded"
                  >
                    <div class="flex items-center space-x-2">
                      <span class="font-medium">{{ unit.name }}</span>
                      <span class="font-mono text-muted-foreground">{{ unit.symbol }}</span>
                    </div>
                    <Badge v-if="unit.isBaseUnit" variant="default" class="text-xs">Base</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Import Options -->
          <div class="space-y-3 pt-4 border-t">
            <Label class="text-sm font-medium">Import Options</Label>
            
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="skipExisting" v-model="importOptions.skipExisting" />
                <Label for="skipExisting" class="text-sm">
                  Skip units that already exist
                </Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox id="createFamilies" v-model="importOptions.createFamilies" />
                <Label for="createFamilies" class="text-sm">
                  Create unit families from template
                </Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox id="setAsActive" v-model="importOptions.setAsActive" />
                <Label for="setAsActive" class="text-sm">
                  Set all units as active
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)" :disabled="isApplying">
          Cancel
        </Button>
        <Button 
          @click="applyTemplate"
          :disabled="!selectedTemplate || isApplying"
        >
          <Loader2Icon v-if="isApplying" class="h-4 w-4 mr-2 animate-spin" />
          Apply Template
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  SearchIcon, RefreshCwIcon, Loader2Icon,
  RulerIcon, ScaleIcon, FlaskConicalIcon, ClockIcon, 
  ThermometerIcon, ZapIcon, PackageIcon, GlobeIcon 
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:open', 'applied'])

const { toast } = useToast()

// Form state
const selectedCategory = ref('all')
const searchQuery = ref('')
const selectedTemplate = ref(null)
const isApplying = ref(false)

const importOptions = ref({
  skipExisting: true,
  createFamilies: true,
  setAsActive: true
})

// Static data
const templateCategories = [
  { value: 'all', label: 'All', icon: GlobeIcon },
  { value: 'length', label: 'Length', icon: RulerIcon },
  { value: 'weight', label: 'Weight', icon: ScaleIcon },
  { value: 'volume', label: 'Volume', icon: FlaskConicalIcon },
  { value: 'time', label: 'Time', icon: ClockIcon },
  { value: 'temperature', label: 'Temperature', icon: ThermometerIcon },
  { value: 'energy', label: 'Energy', icon: ZapIcon }
]

// Mock template data
const templates = ref([
  {
    id: '1',
    name: 'Metric Length Units',
    description: 'Complete set of metric length units with conversions',
    category: 'length',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Metric Length'],
    units: [
      { name: 'Meter', symbol: 'm', isBaseUnit: true },
      { name: 'Kilometer', symbol: 'km', isBaseUnit: false },
      { name: 'Centimeter', symbol: 'cm', isBaseUnit: false },
      { name: 'Millimeter', symbol: 'mm', isBaseUnit: false },
      { name: 'Micrometer', symbol: 'μm', isBaseUnit: false }
    ]
  },
  {
    id: '2',
    name: 'Imperial Length Units',
    description: 'Complete set of imperial length units with conversions',
    category: 'length',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Imperial Length'],
    units: [
      { name: 'Foot', symbol: 'ft', isBaseUnit: true },
      { name: 'Inch', symbol: 'in', isBaseUnit: false },
      { name: 'Yard', symbol: 'yd', isBaseUnit: false },
      { name: 'Mile', symbol: 'mi', isBaseUnit: false }
    ]
  },
  {
    id: '3',
    name: 'Metric Weight Units',
    description: 'Complete set of metric weight units with conversions',
    category: 'weight',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Metric Weight'],
    units: [
      { name: 'Kilogram', symbol: 'kg', isBaseUnit: true },
      { name: 'Gram', symbol: 'g', isBaseUnit: false },
      { name: 'Milligram', symbol: 'mg', isBaseUnit: false },
      { name: 'Ton', symbol: 't', isBaseUnit: false }
    ]
  },
  {
    id: '4',
    name: 'Imperial Weight Units',
    description: 'Complete set of imperial weight units with conversions',
    category: 'weight',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Imperial Weight'],
    units: [
      { name: 'Pound', symbol: 'lb', isBaseUnit: true },
      { name: 'Ounce', symbol: 'oz', isBaseUnit: false },
      { name: 'Stone', symbol: 'st', isBaseUnit: false }
    ]
  },
  {
    id: '5',
    name: 'Metric Volume Units',
    description: 'Complete set of metric volume units with conversions',
    category: 'volume',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Metric Volume'],
    units: [
      { name: 'Liter', symbol: 'L', isBaseUnit: true },
      { name: 'Milliliter', symbol: 'mL', isBaseUnit: false },
      { name: 'Cubic Meter', symbol: 'm³', isBaseUnit: false }
    ]
  },
  {
    id: '6',
    name: 'Time Units',
    description: 'Standard time units with conversions',
    category: 'time',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Time'],
    units: [
      { name: 'Second', symbol: 's', isBaseUnit: true },
      { name: 'Minute', symbol: 'min', isBaseUnit: false },
      { name: 'Hour', symbol: 'h', isBaseUnit: false },
      { name: 'Day', symbol: 'd', isBaseUnit: false }
    ]
  },
  {
    id: '7',
    name: 'Temperature Units',
    description: 'Temperature units with conversion formulas',
    category: 'temperature',
    type: 'system',
    version: '1.0',
    updatedAt: '2024-01-15',
    families: ['Temperature'],
    units: [
      { name: 'Celsius', symbol: '°C', isBaseUnit: true },
      { name: 'Fahrenheit', symbol: '°F', isBaseUnit: false },
      { name: 'Kelvin', symbol: 'K', isBaseUnit: false }
    ]
  },
  {
    id: '8',
    name: 'Complete Metric System',
    description: 'Full set of metric units across all categories',
    category: 'all',
    type: 'system',
    version: '2.0',
    updatedAt: '2024-01-20',
    families: ['Metric Length', 'Metric Weight', 'Metric Volume'],
    units: [
      // Length
      { name: 'Meter', symbol: 'm', isBaseUnit: true },
      { name: 'Kilometer', symbol: 'km', isBaseUnit: false },
      { name: 'Centimeter', symbol: 'cm', isBaseUnit: false },
      { name: 'Millimeter', symbol: 'mm', isBaseUnit: false },
      // Weight
      { name: 'Kilogram', symbol: 'kg', isBaseUnit: true },
      { name: 'Gram', symbol: 'g', isBaseUnit: false },
      { name: 'Ton', symbol: 't', isBaseUnit: false },
      // Volume
      { name: 'Liter', symbol: 'L', isBaseUnit: true },
      { name: 'Milliliter', symbol: 'mL', isBaseUnit: false }
    ]
  }
])

// Computed properties
const filteredTemplates = computed(() => {
  let filtered = templates.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(template => 
      template.category === selectedCategory.value || template.category === 'all'
    )
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.units.some(unit => 
        unit.name.toLowerCase().includes(query) ||
        unit.symbol.toLowerCase().includes(query)
      )
    )
  }

  return filtered
})

// Methods
function updateOpen(value) {
  emit('update:open', value)
  if (!value) {
    resetForm()
  }
}

function resetForm() {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  selectedTemplate.value = null
  importOptions.value = {
    skipExisting: true,
    createFamilies: true,
    setAsActive: true
  }
}

function selectTemplate(template) {
  selectedTemplate.value = template
}

function getCategoryIcon(category) {
  const iconMap = {
    length: RulerIcon,
    weight: ScaleIcon,
    volume: FlaskConicalIcon,
    time: ClockIcon,
    temperature: ThermometerIcon,
    energy: ZapIcon,
    all: GlobeIcon
  }
  return iconMap[category] || PackageIcon
}

function formatCategory(category) {
  return category === 'all' ? 'Multiple' : 
         category.charAt(0).toUpperCase() + category.slice(1)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function refreshTemplates() {
  toast({
    title: "Templates Refreshed",
    description: "Template list has been updated",
  })
}

async function applyTemplate() {
  if (!selectedTemplate.value) return

  try {
    isApplying.value = true

    // Simulate API call to apply template
    await new Promise(resolve => setTimeout(resolve, 2000))

    const appliedUnits = selectedTemplate.value.units.length
    const appliedFamilies = selectedTemplate.value.families?.length || 0

    toast({
      title: "Template Applied",
      description: `Successfully applied template with ${appliedUnits} units${appliedFamilies > 0 ? ` and ${appliedFamilies} families` : ''}`,
    })

    emit('applied', {
      template: selectedTemplate.value,
      options: importOptions.value,
      counts: {
        units: appliedUnits,
        families: appliedFamilies
      }
    })

    updateOpen(false)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to apply template",
      variant: "destructive",
    })
  } finally {
    isApplying.value = false
  }
}
</script>
