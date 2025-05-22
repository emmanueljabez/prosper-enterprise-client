<template>
  <DialogContent class="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>Optimize Pick Paths</DialogTitle>
      <DialogDescription>
        Improve picking efficiency by optimizing your warehouse pick paths.
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-4 py-4">
      <!-- Path Selection Section -->
      <div class="space-y-2">
        <Label>Selected Paths to Optimize</Label>
        <div class="border rounded-md p-2 max-h-[200px] overflow-y-auto">
          <div v-if="selectedPaths.length === 0" class="text-center py-4 text-muted-foreground">
            No paths selected. Select paths below to optimize.
          </div>
          <div 
            v-for="path in selectedPaths" 
            :key="path.id" 
            class="flex items-center justify-between p-2 border-b last:border-0"
          >
            <div class="flex items-center">
              <CheckCircleIcon class="h-4 w-4 mr-2 text-primary" />
              <span>{{ path.name }}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              @click="removePath(path.id)"
              title="Remove from selection"
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Available Paths -->
      <div class="space-y-2">
        <Label>Available Paths</Label>
        <div class="border rounded-md p-2 max-h-[200px] overflow-y-auto">
          <div v-if="availablePaths.length === 0" class="text-center py-4 text-muted-foreground">
            All paths are selected or no paths are available.
          </div>
          <div 
            v-for="path in availablePaths" 
            :key="path.id" 
            class="flex items-center justify-between p-2 border-b last:border-0 hover:bg-muted/50 cursor-pointer"
            @click="addPath(path)"
          >
            <div class="flex items-center">
              <FolderIcon class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{{ path.name }}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              @click.stop="addPath(path)"
              title="Add to selection"
            >
              <PlusIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Optimization Settings -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium">Optimization Settings</h4>
        
        <!-- Optimization Method -->
        <div class="space-y-2">
          <Label for="optimizationMethod">Optimization Method</Label>
          <Select v-model="settings.method">
            <SelectTrigger id="optimizationMethod">
              <SelectValue placeholder="Select optimization method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Minimize Distance</SelectItem>
              <SelectItem value="frequency">Item Frequency</SelectItem>
              <SelectItem value="hybrid">Hybrid (Distance + Frequency)</SelectItem>
              <SelectItem value="zone">Zone-Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Priority Selection -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="weightDistance">Distance Weight</Label>
            <div class="flex items-center space-x-2">
              <Slider
                id="weightDistance"
                v-model="settings.weightDistance"
                :min="1"
                :max="10"
                :step="1"
                class="flex-1"
              />
              <span class="w-12 text-center">{{ settings.weightDistance }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="weightFrequency">Frequency Weight</Label>
            <div class="flex items-center space-x-2">
              <Slider
                id="weightFrequency"
                v-model="settings.weightFrequency"
                :min="1"
                :max="10"
                :step="1"
                class="flex-1"
              />
              <span class="w-12 text-center">{{ settings.weightFrequency }}</span>
            </div>
          </div>
        </div>

        <!-- Additional Options -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="considerVolume" 
              v-model:checked="settings.considerVolume" 
            />
            <Label for="considerVolume">Consider item volume/weight in optimization</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="avoidCongestion" 
              v-model:checked="settings.avoidCongestion" 
            />
            <Label for="avoidCongestion">Avoid aisle congestion</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="respectZones" 
              v-model:checked="settings.respectZones" 
            />
            <Label for="respectZones">Respect warehouse zones</Label>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview of Optimization -->
    <div v-if="selectedPaths.length > 0 && optimizationPreview" class="mb-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium">Optimization Preview</h4>
        <Badge variant="outline">
          {{ optimizationPreview.improvementPercentage }}% Improvement
        </Badge>
      </div>
      <div class="mt-2 p-3 border rounded-md bg-muted/30">
        <div v-for="(preview, index) in optimizationPreview.pathPreviews" :key="index" class="mb-2 last:mb-0">
          <div class="flex items-center justify-between">
            <span>{{ preview.name }}</span>
            <span class="text-sm">{{ preview.currentSteps }} → {{ preview.optimizedSteps }} steps</span>
          </div>
          <Progress :value="preview.improvement" class="h-2 mt-1" />
        </div>
      </div>
    </div>

    <div v-if="isCalculating" class="flex items-center justify-center mb-4 h-24">
      <div class="flex flex-col items-center">
        <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
        <span class="mt-2 text-sm text-muted-foreground">Calculating optimal paths...</span>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button
        variant="default"
        :disabled="selectedPaths.length === 0 || isCalculating"
        @click="calculateOptimization"
      >
        <CalculatorIcon v-if="!optimizationPreview" class="h-4 w-4 mr-2" />
        <CheckCircleIcon v-else class="h-4 w-4 mr-2" />
        {{ optimizationPreview ? 'Apply Optimization' : 'Calculate Optimization' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  CheckCircleIcon,
  XIcon,
  PlusIcon,
  FolderIcon,
  CalculatorIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  pickPaths: {
    type: Array,
    required: true
  },
  pickingTasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'paths-optimized'])

// State management
const selectedPathIds = ref([])
const settings = ref({
  method: 'hybrid',
  weightDistance: 5,
  weightFrequency: 5,
  considerVolume: true,
  avoidCongestion: true,
  respectZones: true
})
const isCalculating = ref(false)
const optimizationPreview = ref(null)

// Computed properties
const selectedPaths = computed(() => {
  if (!props.pickPaths) return []
  return props.pickPaths.filter(path => selectedPathIds.value.includes(path.id))
})

const availablePaths = computed(() => {
  if (!props.pickPaths) return []
  return props.pickPaths.filter(path => !selectedPathIds.value.includes(path.id))
})

// Methods
function addPath(path) {
  if (!selectedPathIds.value.includes(path.id)) {
    selectedPathIds.value.push(path.id)
  }
}

function removePath(pathId) {
  const index = selectedPathIds.value.indexOf(pathId)
  if (index !== -1) {
    selectedPathIds.value.splice(index, 1)
  }
}

async function calculateOptimization() {
  if (optimizationPreview.value) {
    // If we already have a preview, apply the optimization
    applyOptimization()
    return
  }

  isCalculating.value = true
  
  try {
    // Simulate API call or calculation time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock optimization preview
    optimizationPreview.value = {
      improvementPercentage: Math.floor(Math.random() * 15) + 10, // 10-25% improvement
      pathPreviews: selectedPaths.value.map(path => ({
        id: path.id,
        name: path.name,
        currentSteps: path.sequence?.length || 10,
        optimizedSteps: Math.max(
          Math.floor((path.sequence?.length || 10) * 0.8), 
          (path.sequence?.length || 10) - 2
        ),
        improvement: Math.floor(Math.random() * 30) + 60, // 60-90% efficiency
      }))
    }
  } catch (error) {
    console.error('Error calculating optimization:', error)
  } finally {
    isCalculating.value = false
  }
}

async function applyOptimization() {
  isCalculating.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate optimized paths (this would normally come from the API)
    const optimizedPaths = selectedPaths.value.map(path => {
      // In a real app, we'd apply the actual optimization algorithm here
      // For now, we're just simulating by shuffling the sequence a bit
      
      // Create a copy of the path
      const optimizedPath = { ...path }
      
      // If we have a sequence, optimize it by shuffling (in a real app, 
      // this would be a proper optimization algorithm)
      if (path.sequence && path.sequence.length > 0) {
        // We'll keep the sequence structure but pretend it's optimized
        optimizedPath.sequence = [...path.sequence]
          .sort((a, b) => a.locationCode.localeCompare(b.locationCode))
      }
      
      return optimizedPath
    })
    
    // Emit the optimized paths to the parent component
    emit('paths-optimized', optimizedPaths)
  } catch (error) {
    console.error('Error applying optimization:', error)
  } finally {
    isCalculating.value = false
  }
}

// Reset the preview when settings or selections change
watch([settings, selectedPathIds], () => {
  optimizationPreview.value = null
}, { deep: true })
</script>