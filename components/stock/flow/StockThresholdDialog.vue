<template>
  <DialogContent class="sm:max-w-xl">
    <DialogHeader>
      <DialogTitle>Configure Stock Thresholds</DialogTitle>
      <DialogDescription>
        Set stock level thresholds to determine when items are considered in stock, low stock, or critical stock levels.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 my-4">
      <!-- Default Thresholds -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium">Default Thresholds</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="default-in-stock">In Stock</Label>
            <Input 
              id="default-in-stock"
              v-model="localThresholds.default.inStock"
              type="number" 
              min="1"
              @change="validateThresholds('default')"
            />
          </div>
          <div class="space-y-2">
            <Label for="default-low-stock">Low Stock</Label>
            <Input 
              id="default-low-stock"
              v-model="localThresholds.default.lowStock"
              type="number" 
              min="1"
              @change="validateThresholds('default')"
            />
          </div>
          <div class="space-y-2">
            <Label for="default-critical-stock">Critical Stock</Label>
            <Input 
              id="default-critical-stock"
              v-model="localThresholds.default.criticalStock"
              type="number" 
              min="0"
              @change="validateThresholds('default')"
            />
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          These default values will be used for all items unless overridden by location or category specific thresholds.
        </p>
      </div>
      
      <Separator />
      
      <!-- Location Specific Thresholds -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">Location Specific Thresholds</h3>
          <Button variant="outline" size="sm" @click="addLocationThreshold">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
        
        <div v-if="Object.keys(localThresholds.byLocation).length === 0" class="border border-dashed rounded-md p-4 flex items-center justify-center">
          <p class="text-sm text-muted-foreground">No location-specific thresholds configured</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="(threshold, locationId) in localThresholds.byLocation" :key="locationId" class="border rounded-md p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <MapPinIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                <Select v-model="locationSelections[locationId]" @update:modelValue="updateLocationId(locationId, $event)">
                  <SelectTrigger class="w-[200px]">
                    <SelectValue :placeholder="getLocationName(locationId)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="location in locations" :key="location.id" :value="location.id">
                      {{ location.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" @click="removeLocationThreshold(locationId)">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label :for="`location-${locationId}-in-stock`">In Stock</Label>
                <Input 
                  :id="`location-${locationId}-in-stock`"
                  v-model="threshold.inStock"
                  type="number" 
                  min="1"
                  @change="validateThresholds('location', locationId)"
                />
              </div>
              <div class="space-y-2">
                <Label :for="`location-${locationId}-low-stock`">Low Stock</Label>
                <Input 
                  :id="`location-${locationId}-low-stock`"
                  v-model="threshold.lowStock"
                  type="number" 
                  min="1"
                  @change="validateThresholds('location', locationId)"
                />
              </div>
              <div class="space-y-2">
                <Label :for="`location-${locationId}-critical-stock`">Critical Stock</Label>
                <Input 
                  :id="`location-${locationId}-critical-stock`"
                  v-model="threshold.criticalStock"
                  type="number" 
                  min="0"
                  @change="validateThresholds('location', locationId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <!-- Category Specific Thresholds -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">Category Specific Thresholds</h3>
          <Button variant="outline" size="sm" @click="addCategoryThreshold">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
        
        <div v-if="Object.keys(localThresholds.byCategory).length === 0" class="border border-dashed rounded-md p-4 flex items-center justify-center">
          <p class="text-sm text-muted-foreground">No category-specific thresholds configured</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="(threshold, categoryId) in localThresholds.byCategory" :key="categoryId" class="border rounded-md p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <TagIcon class="h-4 w-4 mr-2 text-muted-foreground" />
                <Select v-model="categorySelections[categoryId]" @update:modelValue="updateCategoryId(categoryId, $event)">
                  <SelectTrigger class="w-[200px]">
                    <SelectValue :placeholder="getCategoryName(categoryId)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat-001">Tools</SelectItem>
                    <SelectItem value="cat-002">Customer Premise Equipment</SelectItem>
                    <SelectItem value="cat-003">Network Termination</SelectItem>
                    <SelectItem value="cat-004">Cabling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" @click="removeCategoryThreshold(categoryId)">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label :for="`category-${categoryId}-in-stock`">In Stock</Label>
                <Input 
                  :id="`category-${categoryId}-in-stock`"
                  v-model="threshold.inStock"
                  type="number" 
                  min="1"
                  @change="validateThresholds('category', categoryId)"
                />
              </div>
              <div class="space-y-2">
                <Label :for="`category-${categoryId}-low-stock`">Low Stock</Label>
                <Input 
                  :id="`category-${categoryId}-low-stock`"
                  v-model="threshold.lowStock"
                  type="number" 
                  min="1"
                  @change="validateThresholds('category', categoryId)"
                />
              </div>
              <div class="space-y-2">
                <Label :for="`category-${categoryId}-critical-stock`">Critical Stock</Label>
                <Input 
                  :id="`category-${categoryId}-critical-stock`"
                  v-model="threshold.criticalStock"
                  type="number" 
                  min="0"
                  @change="validateThresholds('category', categoryId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter class="flex items-center justify-between">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <RotateCcwIcon class="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Thresholds?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all threshold configurations to system defaults. 
              Any customized thresholds will be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="resetToDefaults">Reset Thresholds</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div class="flex space-x-2">
        <Button variant="outline" @click="$emit('close')">Cancel</Button>
        <Button type="submit" @click="saveThresholds">Save Changes</Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  PlusIcon, XIcon, MapPinIcon, TagIcon, RotateCcwIcon 
} from 'lucide-vue-next'
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  thresholds: {
    type: Object,
    required: true
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['thresholds-updated', 'close'])

// Create a deep copy of thresholds to avoid mutating props directly
const localThresholds = reactive({
  default: {
    inStock: props.thresholds.default?.inStock || 10,
    lowStock: props.thresholds.default?.lowStock || 5,
    criticalStock: props.thresholds.default?.criticalStock || 2
  },
  byLocation: { ...JSON.parse(JSON.stringify(props.thresholds.byLocation || {})) },
  byCategory: { ...JSON.parse(JSON.stringify(props.thresholds.byCategory || {})) }
})

// Track selected location and category IDs
const locationSelections = reactive({})
const categorySelections = reactive({})

// Initialize selections
onMounted(() => {
  // Initialize location selections
  Object.keys(localThresholds.byLocation).forEach(locationId => {
    locationSelections[locationId] = locationId
  })
  
  // Initialize category selections
  Object.keys(localThresholds.byCategory).forEach(categoryId => {
    categorySelections[categoryId] = categoryId
  })
})

// Validation function
function validateThresholds(type, id) {
  let target
  
  if (type === 'default') {
    target = localThresholds.default
  } else if (type === 'location') {
    target = localThresholds.byLocation[id]
  } else if (type === 'category') {
    target = localThresholds.byCategory[id]
  }
  
  if (target) {
    // Convert values to numbers
    target.inStock = parseInt(target.inStock) || 10
    target.lowStock = parseInt(target.lowStock) || 5
    target.criticalStock = parseInt(target.criticalStock) || 2
    
    // Ensure in-stock > low-stock > critical-stock
    if (target.inStock < target.lowStock) {
      target.inStock = target.lowStock + 1
    }
    
    if (target.lowStock < target.criticalStock) {
      target.lowStock = target.criticalStock + 1
    }
    
    if (target.criticalStock < 0) {
      target.criticalStock = 0
    }
  }
}

// Location and category operations
function addLocationThreshold() {
  // Find a location that doesn't already have thresholds
  const availableLocation = props.locations.find(loc => 
    !Object.keys(localThresholds.byLocation).includes(loc.id)
  )
  
  if (availableLocation) {
    const newLocationId = availableLocation.id
    localThresholds.byLocation[newLocationId] = {
      inStock: localThresholds.default.inStock,
      lowStock: localThresholds.default.lowStock,
      criticalStock: localThresholds.default.criticalStock
    }
    locationSelections[newLocationId] = newLocationId
  } else {
    // If all locations have thresholds, create one with a placeholder ID
    const newLocationId = `loc-new-${Date.now()}`
    localThresholds.byLocation[newLocationId] = {
      inStock: localThresholds.default.inStock,
      lowStock: localThresholds.default.lowStock,
      criticalStock: localThresholds.default.criticalStock
    }
    locationSelections[newLocationId] = props.locations[0]?.id || newLocationId
  }
}

function removeLocationThreshold(locationId) {
  delete localThresholds.byLocation[locationId]
  delete locationSelections[locationId]
}

function updateLocationId(oldLocationId, newLocationId) {
  if (oldLocationId !== newLocationId) {
    const thresholds = { ...localThresholds.byLocation[oldLocationId] }
    delete localThresholds.byLocation[oldLocationId]
    localThresholds.byLocation[newLocationId] = thresholds
    delete locationSelections[oldLocationId]
    locationSelections[newLocationId] = newLocationId
  }
}

function addCategoryThreshold() {
  const categories = ['cat-001', 'cat-002', 'cat-003', 'cat-004']
  const availableCategory = categories.find(cat => 
    !Object.keys(localThresholds.byCategory).includes(cat)
  )
  
  if (availableCategory) {
    const newCategoryId = availableCategory
    localThresholds.byCategory[newCategoryId] = {
      inStock: localThresholds.default.inStock,
      lowStock: localThresholds.default.lowStock,
      criticalStock: localThresholds.default.criticalStock
    }
    categorySelections[newCategoryId] = newCategoryId
  } else {
    // If all categories have thresholds, create one with a placeholder
    const newCategoryId = `cat-new-${Date.now()}`
    localThresholds.byCategory[newCategoryId] = {
      inStock: localThresholds.default.inStock,
      lowStock: localThresholds.default.lowStock,
      criticalStock: localThresholds.default.criticalStock
    }
    categorySelections[newCategoryId] = 'cat-001'
  }
}

function removeCategoryThreshold(categoryId) {
  delete localThresholds.byCategory[categoryId]
  delete categorySelections[categoryId]
}

function updateCategoryId(oldCategoryId, newCategoryId) {
  if (oldCategoryId !== newCategoryId) {
    const thresholds = { ...localThresholds.byCategory[oldCategoryId] }
    delete localThresholds.byCategory[oldCategoryId]
    localThresholds.byCategory[newCategoryId] = thresholds
    delete categorySelections[oldCategoryId]
    categorySelections[newCategoryId] = newCategoryId
  }
}

// Helper functions
function getLocationName(locationId) {
  const location = props.locations.find(loc => loc.id === locationId)
  return location ? location.name : 'Select Location'
}

function getCategoryName(categoryId) {
  const categories = {
    'cat-001': 'Tools',
    'cat-002': 'Customer Premise Equipment',
    'cat-003': 'Network Termination',
    'cat-004': 'Cabling'
  }
  return categories[categoryId] || 'Select Category'
}

// Save changes
function saveThresholds() {
  // Validate all thresholds
  validateThresholds('default')
  Object.keys(localThresholds.byLocation).forEach(locationId => {
    validateThresholds('location', locationId)
  })
  Object.keys(localThresholds.byCategory).forEach(categoryId => {
    validateThresholds('category', categoryId)
  })
  
  // Create a clean copy to emit
  const updatedThresholds = {
    default: { ...localThresholds.default },
    byLocation: { ...localThresholds.byLocation },
    byCategory: { ...localThresholds.byCategory }
  }
  
  emit('thresholds-updated', updatedThresholds)
}

// Reset to defaults
function resetToDefaults() {
  localThresholds.default = {
    inStock: 10,
    lowStock: 5,
    criticalStock: 2
  }
  localThresholds.byLocation = {}
  localThresholds.byCategory = {}
}
</script>