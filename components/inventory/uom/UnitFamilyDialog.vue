<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <component :is="getCategoryIcon(family?.category)" class="h-5 w-5" />
          <span>{{ isEditing ? 'Edit' : 'Create' }} Unit Family</span>
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Modify family details and manage member units' : 'Create a new unit family to group related units' }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-base font-medium">Family Information</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="familyName">Family Name *</Label>
              <Input
                id="familyName"
                v-model="formData.name"
                placeholder="e.g., Metric Length, Imperial Weight"
                :class="{ 'border-destructive': errors.name }"
              />
              <p v-if="errors.name" class="text-destructive text-sm">{{ errors.name }}</p>
            </div>

            <div class="space-y-2">
              <Label>Category *</Label>
              <Select v-model="formData.category" :disabled="isEditing && hasMembers">
                <SelectTrigger :class="{ 'border-destructive': errors.category }">
                  <SelectValue placeholder="Select category" />
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
              <p v-if="isEditing && hasMembers" class="text-xs text-muted-foreground">
                Category cannot be changed when family has members
              </p>
              <p v-if="errors.category" class="text-destructive text-sm">{{ errors.category }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Optional description of the unit family"
              rows="3"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox id="active" v-model="formData.isActive" />
              <Label for="active" class="text-sm font-medium">
                Active (available for use)
              </Label>
            </div>
          </div>
        </div>

        <!-- Family Members -->
        <div v-if="isEditing" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">Family Members</h3>
            <Button 
              size="sm" 
              @click="showAddMemberDialog = true"
              :disabled="!formData.category"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div v-if="familyMembers.length === 0" class="text-center py-8 text-muted-foreground">
            <PackageIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No units in this family yet</p>
            <p class="text-sm">Add units to create conversions between related measurements</p>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="member in familyMembers" 
              :key="member.id"
              class="flex items-center justify-between p-3 border rounded-md"
            >
              <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                  <Badge v-if="member.isBaseUnit" variant="default" class="text-xs">Base</Badge>
                  <span class="font-medium">{{ member.name }}</span>
                  <span class="font-mono text-sm bg-muted px-2 py-1 rounded">{{ member.symbol }}</span>
                </div>
                <div v-if="!member.isBaseUnit" class="text-sm text-muted-foreground">
                  1 {{ member.symbol }} = {{ member.conversionFactor }} {{ getBaseUnitSymbol() }}
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <Badge :variant="member.isActive ? 'default' : 'secondary'" class="text-xs">
                  {{ member.isActive ? 'Active' : 'Inactive' }}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  @click="removeMember(member)"
                  :disabled="member.isBaseUnit && familyMembers.length > 1"
                >
                  <Trash2Icon class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversion Preview -->
        <div v-if="isEditing && familyMembers.length > 1" class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">CONVERSION PREVIEW</Label>
          <div class="p-3 border rounded-md bg-muted/30">
            <div class="text-sm space-y-1">
              <div v-for="member in familyMembers.filter(m => !m.isBaseUnit)" :key="member.id">
                1 {{ member.symbol }} = {{ member.conversionFactor }} {{ getBaseUnitSymbol() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="updateOpen(false)" :disabled="isSaving">
          Cancel
        </Button>
        <Button @click="saveFamily" :disabled="!canSave || isSaving">
          <Loader2Icon v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
          {{ isEditing ? 'Update' : 'Create' }} Family
        </Button>
      </DialogFooter>
    </DialogContent>

    <!-- Add Member Dialog -->
    <Dialog :open="showAddMemberDialog" @update:open="showAddMemberDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Select units to add to this family
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Available Units</Label>
            <div class="max-h-64 overflow-y-auto space-y-2">
              <div 
                v-for="unit in availableUnits" 
                :key="unit.id"
                class="flex items-center space-x-2"
              >
                <Checkbox 
                  :id="`unit-${unit.id}`"
                  :checked="selectedUnits.includes(unit.id)"
                  @update:checked="toggleUnitSelection(unit.id, $event)"
                />
                <Label :for="`unit-${unit.id}`" class="flex-1 cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span>{{ unit.name }}</span>
                    <span class="font-mono text-sm bg-muted px-2 py-1 rounded">{{ unit.symbol }}</span>
                  </div>
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showAddMemberDialog = false">Cancel</Button>
          <Button 
            @click="addSelectedMembers" 
            :disabled="selectedUnits.length === 0"
          >
            Add {{ selectedUnits.length }} Unit(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  PlusIcon, PackageIcon, Trash2Icon, Loader2Icon,
  RulerIcon, ScaleIcon, FlaskConicalIcon, ClockIcon, 
  ThermometerIcon, ZapIcon 
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  family: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:open', 'created', 'updated'])

const { toast } = useToast()

// Form state
const isSaving = ref(false)
const showAddMemberDialog = ref(false)
const selectedUnits = ref([])

const formData = ref({
  name: '',
  category: '',
  description: '',
  isActive: true
})

const familyMembers = ref([])
const errors = ref({})

// Static data
const uomCategories = [
  { value: 'length', label: 'Length', icon: RulerIcon },
  { value: 'weight', label: 'Weight', icon: ScaleIcon },
  { value: 'volume', label: 'Volume', icon: FlaskConicalIcon },
  { value: 'time', label: 'Time', icon: ClockIcon },
  { value: 'temperature', label: 'Temperature', icon: ThermometerIcon },
  { value: 'energy', label: 'Energy', icon: ZapIcon }
]

// Mock data - replace with actual API calls
const availableUnits = ref([
  { id: '1', name: 'Meter', symbol: 'm', category: 'length' },
  { id: '2', name: 'Centimeter', symbol: 'cm', category: 'length' },
  { id: '3', name: 'Millimeter', symbol: 'mm', category: 'length' },
  { id: '4', name: 'Kilogram', symbol: 'kg', category: 'weight' },
  { id: '5', name: 'Gram', symbol: 'g', category: 'weight' }
])

// Computed properties
const isEditing = computed(() => !!props.family)

const hasMembers = computed(() => familyMembers.value.length > 0)

const canSave = computed(() => {
  return formData.value.name && formData.value.category && !isSaving.value
})

const filteredAvailableUnits = computed(() => {
  return availableUnits.value.filter(unit => 
    unit.category === formData.value.category &&
    !familyMembers.value.some(member => member.id === unit.id)
  )
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
    category: '',
    description: '',
    isActive: true
  }
  familyMembers.value = []
  errors.value = {}
  selectedUnits.value = []
  showAddMemberDialog.value = false
}

function loadFamilyData() {
  if (props.family) {
    formData.value = {
      name: props.family.name || '',
      category: props.family.category || '',
      description: props.family.description || '',
      isActive: props.family.isActive !== false
    }
    familyMembers.value = props.family.units || []
  }
}

function getCategoryIcon(category) {
  const iconMap = {
    length: RulerIcon,
    weight: ScaleIcon,
    volume: FlaskConicalIcon,
    time: ClockIcon,
    temperature: ThermometerIcon,
    energy: ZapIcon
  }
  return iconMap[category] || RulerIcon
}

function getBaseUnitSymbol() {
  const baseUnit = familyMembers.value.find(m => m.isBaseUnit)
  return baseUnit?.symbol || 'base'
}

function toggleUnitSelection(unitId, checked) {
  if (checked) {
    selectedUnits.value.push(unitId)
  } else {
    selectedUnits.value = selectedUnits.value.filter(id => id !== unitId)
  }
}

function addSelectedMembers() {
  const unitsToAdd = availableUnits.value.filter(unit => 
    selectedUnits.value.includes(unit.id)
  )
  
  familyMembers.value.push(...unitsToAdd.map(unit => ({
    ...unit,
    isBaseUnit: false,
    conversionFactor: 1,
    isActive: true
  })))
  
  selectedUnits.value = []
  showAddMemberDialog.value = false
  
  toast({
    title: "Success",
    description: `Added ${unitsToAdd.length} unit(s) to family`,
  })
}

function removeMember(member) {
  if (member.isBaseUnit && familyMembers.value.length > 1) {
    toast({
      title: "Cannot Remove",
      description: "Cannot remove base unit when family has other members",
      variant: "destructive",
    })
    return
  }
  
  familyMembers.value = familyMembers.value.filter(m => m.id !== member.id)
  
  toast({
    title: "Success",
    description: "Unit removed from family",
  })
}

function validateForm() {
  errors.value = {}
  
  if (!formData.value.name) {
    errors.value.name = 'Family name is required'
  }
  
  if (!formData.value.category) {
    errors.value.category = 'Category is required'
  }
  
  return Object.keys(errors.value).length === 0
}

async function saveFamily() {
  if (!validateForm()) {
    return
  }
  
  try {
    isSaving.value = true
    
    const familyData = {
      ...formData.value,
      units: familyMembers.value
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Success",
      description: `Unit family ${isEditing.value ? 'updated' : 'created'} successfully`,
    })
    
    if (isEditing.value) {
      emit('updated', { ...props.family, ...familyData })
    } else {
      emit('created', familyData)
    }
    
    updateOpen(false)
  } catch (error) {
    toast({
      title: "Error",
      description: `Failed to ${isEditing.value ? 'update' : 'create'} unit family`,
      variant: "destructive",
    })
  } finally {
    isSaving.value = false
  }
}

// Watch for family changes
watch(() => props.family, () => {
  if (props.family) {
    loadFamilyData()
  }
}, { immediate: true })

// Watch for dialog open to load data
watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.family) {
      loadFamilyData()
    } else {
      resetForm()
    }
  }
})
</script>
