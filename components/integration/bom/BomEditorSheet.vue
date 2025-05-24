<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent class="sm:max-w-[700px] overflow-y-auto" position="right">
      <SheetHeader>
        <SheetTitle>Edit Bill of Materials</SheetTitle>
        <SheetDescription>
          Make changes to the BOM "{{ bom.name }}".
        </SheetDescription>
      </SheetHeader>

      <div v-if="loading" class="flex items-center justify-center my-12">
        <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
      </div>

      <Tabs v-else defaultValue="basic" class="mt-6">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <!-- Basic Information Tab -->
        <TabsContent value="basic" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <Label for="name">BOM Name</Label>
              <Input id="name" v-model="bom.name" placeholder="Enter BOM name" />
            </div>
            <div class="col-span-2">
              <Label for="product">Product</Label>
              <Select v-model="selectedProductId">
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="version">Version</Label>
              <Input id="version" v-model="bom.version" placeholder="e.g., 1.0" />
            </div>
            <div>
              <Label for="status">Status</Label>
              <Select v-model="bom.status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="col-span-2">
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="bom.description" placeholder="Enter BOM description" />
            </div>
            <div>
              <Label for="batchSize">Batch Size</Label>
              <Input id="batchSize" v-model.number="bom.batchSize" type="number" min="1" />
            </div>
            <div>
              <Label for="effectiveDate">Effective Date</Label>
              <Input id="effectiveDate" v-model="bom.effectiveDate" type="date" />
            </div>
            <div class="col-span-2">
              <Label for="notes">Notes</Label>
              <Textarea id="notes" v-model="bom.notes" placeholder="Additional notes" />
            </div>
          </div>
        </TabsContent>

        <!-- Components Tab -->
        <TabsContent value="components" class="space-y-4 py-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Components</h3>
            <Button variant="outline" size="sm" @click="addComponent">
              <PlusIcon class="h-4 w-4 mr-1" />
              Add Component
            </Button>
          </div>

          <div v-if="bom.components.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <LayersIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No components added yet. Add components to your BOM.</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="(component, index) in bom.components" :key="index" class="border rounded-md p-3">
              <div class="flex justify-between items-start mb-2">
                <div class="font-medium">{{ component.itemName || 'New Component' }}</div>
                <Button variant="ghost" size="icon" @click="removeComponent(index)">
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <Label>Item</Label>
                  <Select v-model="component.itemId" @update:modelValue="updateComponentItem(component, $event)">
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="item in inventory" :key="item.id" :value="item.id">
                        {{ item.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <div class="flex space-x-2">
                    <Input v-model.number="component.quantity" type="number" min="0" step="0.01" />
                    <Select v-model="component.unitOfMeasure" class="w-24">
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">L</SelectItem>
                        <SelectItem value="ml">mL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input v-model="component.position" placeholder="e.g., A1" />
                </div>
                <div>
                  <Label>Optional</Label>
                  <div class="flex items-center space-x-2 h-10 mt-1">
                    <Checkbox v-model="component.isOptional" :id="`optional-${index}`" />
                    <label :for="`optional-${index}`" class="text-sm cursor-pointer">This component is optional</label>
                  </div>
                </div>
                <div class="col-span-2">
                  <Label>Notes</Label>
                  <Textarea v-model="component.notes" placeholder="Component notes" rows="2" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- Assembly Steps Tab -->
        <TabsContent value="steps" class="space-y-4 py-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Assembly Steps</h3>
            <Button variant="outline" size="sm" @click="addStep">
              <PlusIcon class="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          <div v-if="!bom.steps || bom.steps.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <ClipboardListIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No assembly steps added yet. Add steps to your manufacturing process.</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="(step, index) in bom.steps" :key="index" class="border rounded-md p-3">
              <div class="flex justify-between items-start mb-2">
                <div class="font-medium">Step {{ step.stepNumber }}: {{ step.description || 'New Step' }}</div>
                <Button variant="ghost" size="icon" @click="removeStep(index)">
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <Label>Step Number</Label>
                  <Input v-model.number="step.stepNumber" type="number" min="1" />
                </div>
                <div>
                  <Label>Estimated Time (minutes)</Label>
                  <Input v-model.number="step.estimatedTime" type="number" min="0" />
                </div>
                <div class="col-span-2">
                  <Label>Description</Label>
                  <Input v-model="step.description" placeholder="Step description" />
                </div>
                <div class="col-span-2">
                  <Label>Instructions</Label>
                  <Textarea v-model="step.instructions" placeholder="Detailed instructions" rows="3" />
                </div>
                <div class="col-span-2">
                  <Label>Required Tools</Label>
                  <div class="flex space-x-2">
                    <Input 
                      v-model="newTool" 
                      placeholder="Add tool and press Enter" 
                      class="flex-1"
                      @keydown.enter.prevent="addToolToStep(index)" 
                    />
                    <Button type="button" variant="outline" @click="addToolToStep(index)">Add</Button>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <Badge 
                      v-for="(tool, toolIndex) in step.requiredTools" 
                      :key="toolIndex"
                      variant="secondary"
                      class="flex items-center"
                    >
                      {{ tool }}
                      <XIcon class="h-3 w-3 ml-1 cursor-pointer" @click="removeToolFromStep(index, toolIndex)" />
                    </Badge>
                  </div>
                </div>
                <div class="col-span-2">
                  <Label>Image URL</Label>
                  <Input v-model="step.imageUrl" placeholder="URL to step image" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- Quality Checks Tab -->
        <TabsContent value="quality" class="space-y-4 py-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Quality Checks</h3>
            <Button variant="outline" size="sm" @click="addQualityCheck">
              <PlusIcon class="h-4 w-4 mr-1" />
              Add Check
            </Button>
          </div>

          <div v-if="!bom.qualityChecks || bom.qualityChecks.length === 0" class="text-center p-4 border rounded-md bg-muted/30">
            <CheckCircleIcon class="h-8 w-8 mx-auto text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">No quality checks added yet. Add checks to ensure product quality.</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="(check, index) in bom.qualityChecks" :key="index" class="border rounded-md p-3">
              <div class="flex justify-between items-start mb-2">
                <div class="font-medium">{{ check.checkName || 'New Quality Check' }}</div>
                <Button variant="ghost" size="icon" @click="removeQualityCheck(index)">
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
              <div class="grid grid-cols-1 gap-3">
                <div>
                  <Label>Check Name</Label>
                  <Input v-model="check.checkName" placeholder="Quality check name" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea v-model="check.description" placeholder="Check description" rows="2" />
                </div>
                <div>
                  <Label>Acceptance Criteria</Label>
                  <Textarea v-model="check.acceptanceCriteria" placeholder="Criteria for passing this check" rows="2" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <SheetFooter class="mt-6">
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="saveBom" :disabled="!isFormValid">Save Changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  PlusIcon, 
  XIcon, 
  LayersIcon, 
  ClipboardListIcon,
  CheckCircleIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  bomData: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  inventory: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'save'])

// Form data
const bom = ref({...props.bomData})
const selectedProductId = ref(props.bomData.productId || '')
const newTool = ref('')

// Initialize components, steps, and quality checks arrays if they don't exist
onMounted(() => {
  if (!bom.value.components) bom.value.components = []
  if (!bom.value.steps) bom.value.steps = []
  if (!bom.value.qualityChecks) bom.value.qualityChecks = []
})

// Watch for product selection
watch(selectedProductId, (newVal) => {
  if (newVal) {
    const product = props.products.find(p => p.id === newVal)
    if (product) {
      bom.value.productId = product.id
      bom.value.productName = product.name
      bom.value.productSku = product.sku || ''
    }
  }
})

// Watch for bomData changes
watch(() => props.bomData, (newVal) => {
  bom.value = JSON.parse(JSON.stringify(newVal))
  selectedProductId.value = newVal.productId || ''
  
  // Ensure arrays exist
  if (!bom.value.components) bom.value.components = []
  if (!bom.value.steps) bom.value.steps = []
  if (!bom.value.qualityChecks) bom.value.qualityChecks = []
}, { deep: true })

// Component methods
const addComponent = () => {
  bom.value.components.push({
    itemId: '',
    itemName: '',
    sku: '',
    quantity: 1,
    unitOfMeasure: 'each',
    position: '',
    isOptional: false,
    notes: null,
    substitutes: []
  })
}

const updateComponentItem = (component, itemId) => {
  const item = props.inventory.find(i => i.id === itemId)
  if (item) {
    component.itemName = item.name
    component.sku = item.sku || ''
  }
}

const removeComponent = (index) => {
  bom.value.components.splice(index, 1)
}

// Step methods
const addStep = () => {
  const nextStepNumber = bom.value.steps.length > 0 
    ? Math.max(...bom.value.steps.map(s => s.stepNumber)) + 1 
    : 1
  
  bom.value.steps.push({
    stepNumber: nextStepNumber,
    description: '',
    estimatedTime: 15,
    instructions: '',
    requiredTools: [],
    imageUrl: ''
  })
}

const removeStep = (index) => {
  bom.value.steps.splice(index, 1)
  // Renumber steps
  bom.value.steps.forEach((step, idx) => {
    step.stepNumber = idx + 1
  })
}

const addToolToStep = (stepIndex) => {
  if (newTool.value.trim()) {
    if (!bom.value.steps[stepIndex].requiredTools) {
      bom.value.steps[stepIndex].requiredTools = []
    }
    bom.value.steps[stepIndex].requiredTools.push(newTool.value.trim())
    newTool.value = ''
  }
}

const removeToolFromStep = (stepIndex, toolIndex) => {
  bom.value.steps[stepIndex].requiredTools.splice(toolIndex, 1)
}

// Quality check methods
const addQualityCheck = () => {
  bom.value.qualityChecks.push({
    checkName: '',
    description: '',
    acceptanceCriteria: ''
  })
}

const removeQualityCheck = (index) => {
  bom.value.qualityChecks.splice(index, 1)
}

// Validation
const isBasicInfoValid = computed(() => {
  return bom.value.name && 
         bom.value.productId && 
         bom.value.version && 
         bom.value.status
})

const isComponentsValid = computed(() => {
  // Components are required but individual components may be invalid during editing
  return true
})

const isStepsValid = computed(() => {
  // Steps are optional
  return true
})

const isQualityChecksValid = computed(() => {
  // Quality checks are optional
  return true
})

const isFormValid = computed(() => {
  return isBasicInfoValid.value
})

// Save changes
const saveBom = () => {
  if (isFormValid.value) {
    emit('save', JSON.parse(JSON.stringify(bom.value)))
  }
}
</script>