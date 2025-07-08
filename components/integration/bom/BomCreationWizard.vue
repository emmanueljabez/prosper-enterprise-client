<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">{{ stepTitles[currentStep] }}</h2>
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </Button>
      </div>
      <p class="text-sm text-muted-foreground">
        Step {{ currentStep + 1 }} of {{ steps.length }}
      </p>
    </div>

    <!-- Wizard Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Basic BOM Info Step -->
      <div v-if="currentStep === 0" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="bom-name" required>BOM Name</Label>
            <Input
              id="bom-name"
              v-model="formData.name"
              placeholder="Enter BOM name"
              :error="errors.name"
            />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </div>
          <div class="space-y-2">
            <Label for="bom-version" required>Version</Label>
            <Input
              id="bom-version"
              v-model="formData.version"
              placeholder="e.g. 1.0"
              :error="errors.version"
            />
            <p v-if="errors.version" class="text-sm text-destructive">{{ errors.version }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="bom-description">Description</Label>
          <Textarea
            id="bom-description"
            v-model="formData.description"
            placeholder="Enter BOM description"
            rows="4"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="bom-product" required>Product</Label>
            <Select v-model="formData.productId" :error="errors.productId">
              <SelectTrigger id="bom-product">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.productId" class="text-sm text-destructive">{{ errors.productId }}</p>
          </div>
          <div class="space-y-2">
            <Label for="bom-status">Status</Label>
            <Select v-model="formData.status">
              <SelectTrigger id="bom-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="bom-batch-size">Batch Size</Label>
            <Input
              id="bom-batch-size"
              v-model.number="formData.batchSize"
              type="number"
              min="1"
              placeholder="1"
            />
            <p class="text-xs text-muted-foreground">
              Default quantity when creating work orders
            </p>
          </div>
          <div class="space-y-2">
            <Label for="bom-effective-date">Effective Date</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  id="bom-effective-date"
                  variant="outline"
                  class="w-full justify-start text-left font-normal"
                  :class="!formData.effectiveDate && 'text-muted-foreground'"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ formData.effectiveDate ? formatDate(formData.effectiveDate) : "Select date" }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="formData.effectiveDate" initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <!-- Components Step -->
      <div v-if="currentStep === 1" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Components</h3>
          <Button variant="outline" size="sm" @click="openComponentSelector">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>

        <div v-if="formData.components.length === 0" class="border rounded-md p-8 text-center">
          <LayersIcon class="h-10 w-10 mx-auto text-muted-foreground" />
          <p class="mt-2 text-muted-foreground">No components added yet</p>
          <Button variant="outline" class="mt-4" @click="openComponentSelector">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(component, index) in formData.components" 
            :key="index" 
            class="border rounded-md p-4 flex items-start justify-between"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <div class="font-medium">{{ getItemName(component.itemId) }}</div>
                <Badge>{{ getItemCategory(component.itemId) }}</Badge>
              </div>
              <div class="text-sm text-muted-foreground mt-1">SKU: {{ getItemSku(component.itemId) }}</div>
              
              <div class="grid grid-cols-2 gap-4 mt-3">
                <div class="space-y-1">
                  <Label :for="`component-quantity-${index}`" class="text-xs">Quantity</Label>
                  <div class="flex gap-2">
                    <Input
                      :id="`component-quantity-${index}`"
                      v-model.number="component.quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      class="max-w-[120px]"
                    />
                    <div class="flex items-center text-sm">{{ getItemUnit(component.itemId) }}</div>
                  </div>
                </div>
                <div class="space-y-1">
                  <Label :for="`component-notes-${index}`" class="text-xs">Notes</Label>
                  <Input
                    :id="`component-notes-${index}`"
                    v-model="component.notes"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" @click="removeComponent(index)">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Assembly Steps -->
      <div v-if="currentStep === 2" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Assembly Steps</h3>
          <Button variant="outline" size="sm" @click="addAssemblyStep">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div v-if="formData.steps.length === 0" class="border rounded-md p-8 text-center">
          <ListIcon class="h-10 w-10 mx-auto text-muted-foreground" />
          <p class="mt-2 text-muted-foreground">No assembly steps added yet</p>
          <Button variant="outline" class="mt-4" @click="addAssemblyStep">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Assembly Step
          </Button>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(step, index) in formData.steps" 
            :key="index" 
            class="border rounded-md p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="h-6 w-6 rounded-full flex items-center justify-center p-0">
                  {{ index + 1 }}
                </Badge>
                <h4 class="font-medium">Step {{ index + 1 }}</h4>
              </div>
              <Button variant="ghost" size="icon" @click="removeStep(index)">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            
            <div class="space-y-3">
              <div class="space-y-2">
                <Label :for="`step-title-${index}`">Title</Label>
                <Input
                  :id="`step-title-${index}`"
                  v-model="step.title"
                  placeholder="Enter step title"
                />
              </div>
              
              <div class="space-y-2">
                <Label :for="`step-description-${index}`">Instructions</Label>
                <Textarea
                  :id="`step-description-${index}`"
                  v-model="step.description"
                  placeholder="Enter detailed instructions"
                  rows="3"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label :for="`step-time-${index}`">Estimated Time (minutes)</Label>
                  <Input
                    :id="`step-time-${index}`"
                    v-model.number="step.timeInMinutes"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <Label :for="`step-tools-${index}`">Required Tools</Label>
                  <Input
                    :id="`step-tools-${index}`"
                    v-model="step.tools"
                    placeholder="e.g., Screwdriver, Pliers"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <Label :for="`step-components-${index}`">Components Used</Label>
                <Select v-model="step.componentIds" multiple>
                  <SelectTrigger :id="`step-components-${index}`">
                    <SelectValue placeholder="Select components" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="comp in formData.components" 
                      :key="comp.itemId" 
                      :value="comp.itemId"
                    >
                      {{ getItemName(comp.itemId) }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Checks -->
      <div v-if="currentStep === 3" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Quality Checks</h3>
          <Button variant="outline" size="sm" @click="addQualityCheck">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Check
          </Button>
        </div>

        <div v-if="formData.qualityChecks.length === 0" class="border rounded-md p-8 text-center">
          <CheckIcon class="h-10 w-10 mx-auto text-muted-foreground" />
          <p class="mt-2 text-muted-foreground">No quality checks added yet</p>
          <Button variant="outline" class="mt-4" @click="addQualityCheck">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Quality Check
          </Button>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(check, index) in formData.qualityChecks" 
            :key="index" 
            class="border rounded-md p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium">Quality Check #{{ index + 1 }}</h4>
              <Button variant="ghost" size="icon" @click="removeQualityCheck(index)">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
            
            <div class="space-y-3">
              <div class="space-y-2">
                <Label :for="`check-title-${index}`">Title</Label>
                <Input
                  :id="`check-title-${index}`"
                  v-model="check.title"
                  placeholder="Enter check title"
                />
              </div>
              
              <div class="space-y-2">
                <Label :for="`check-description-${index}`">Description</Label>
                <Textarea
                  :id="`check-description-${index}`"
                  v-model="check.description"
                  placeholder="Enter detailed description"
                  rows="2"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label :for="`check-type-${index}`">Type</Label>
                  <Select v-model="check.type">
                    <SelectTrigger :id="`check-type-${index}`">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual Inspection</SelectItem>
                      <SelectItem value="measurement">Measurement</SelectItem>
                      <SelectItem value="function">Functional Test</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div class="space-y-2">
                  <Label :for="`check-when-${index}`">When to Perform</Label>
                  <Select v-model="check.performAt">
                    <SelectTrigger :id="`check-when-${index}`">
                      <SelectValue placeholder="Select when" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="during">During Assembly</SelectItem>
                      <SelectItem value="after">After Assembly</SelectItem>
                      <SelectItem value="before_packaging">Before Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div v-if="check.type === 'measurement'" class="grid grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label :for="`check-target-${index}`">Target Value</Label>
                  <Input
                    :id="`check-target-${index}`"
                    v-model.number="check.targetValue"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div class="space-y-2">
                  <Label :for="`check-min-${index}`">Min Value</Label>
                  <Input
                    :id="`check-min-${index}`"
                    v-model.number="check.minValue"
                    type="number"
                    step="0.01"
                  />
                </div>
                <div class="space-y-2">
                  <Label :for="`check-max-${index}`">Max Value</Label>
                  <Input
                    :id="`check-max-${index}`"
                    v-model.number="check.maxValue"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Review and Submit Step -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="rounded-md border">
          <div class="p-4 bg-muted/50">
            <h3 class="font-medium">Basic Information</h3>
          </div>
          <div class="p-4 grid gap-4 md:grid-cols-2">
            <div>
              <div class="text-sm font-medium">Name</div>
              <div>{{ formData.name }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Version</div>
              <div>{{ formData.version }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Product</div>
              <div>{{ getProductName(formData.productId) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Status</div>
              <div>{{ formatStatus(formData.status) }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Batch Size</div>
              <div>{{ formData.batchSize }}</div>
            </div>
            <div>
              <div class="text-sm font-medium">Effective Date</div>
              <div>{{ formData.effectiveDate ? formatDate(formData.effectiveDate) : 'Not specified' }}</div>
            </div>
            <div class="md:col-span-2">
              <div class="text-sm font-medium">Description</div>
              <div class="line-clamp-2">{{ formData.description || 'None' }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-4 bg-muted/50 flex justify-between items-center">
            <h3 class="font-medium">Components ({{ formData.components.length }})</h3>
            <Badge variant="outline">
              {{ calculateTotalCost() }}
            </Badge>
          </div>
          <div class="p-4">
            <div v-if="formData.components.length === 0" class="text-muted-foreground">
              No components added
            </div>
            <div v-for="(component, index) in formData.components" :key="index" class="py-2 border-b last:border-0">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium">{{ getItemName(component.itemId) }}</span>
                  <span class="text-sm text-muted-foreground ml-2">({{ getItemSku(component.itemId) }})</span>
                </div>
                <div class="flex items-center gap-4">
                  <div>{{ component.quantity }} {{ getItemUnit(component.itemId) }}</div>
                  <div class="text-muted-foreground">
                    {{ formatCurrency(calculateComponentCost(component)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-4 bg-muted/50">
            <h3 class="font-medium">Assembly Steps ({{ formData.steps.length }})</h3>
          </div>
          <div class="p-4">
            <div v-if="formData.steps.length === 0" class="text-muted-foreground">
              No assembly steps added
            </div>
            <div v-for="(step, index) in formData.steps" :key="index" class="py-2 border-b last:border-0">
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="h-6 w-6 rounded-full flex items-center justify-center p-0">
                  {{ index + 1 }}
                </Badge>
                <span class="font-medium">{{ step.title || `Step ${index + 1}` }}</span>
                <span v-if="step.timeInMinutes" class="text-sm text-muted-foreground ml-2">
                  ({{ step.timeInMinutes }} min)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <div class="p-4 bg-muted/50">
            <h3 class="font-medium">Quality Checks ({{ formData.qualityChecks.length }})</h3>
          </div>
          <div class="p-4">
            <div v-if="formData.qualityChecks.length === 0" class="text-muted-foreground">
              No quality checks added
            </div>
            <div v-for="(check, index) in formData.qualityChecks" :key="index" class="py-2 border-b last:border-0">
              <div class="flex justify-between">
                <div>
                  <span class="font-medium">{{ check.title || `Check ${index + 1}` }}</span>
                </div>
                <div>
                  <Badge>{{ formatCheckType(check.type) }}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t p-4">
      <div class="flex justify-between">
        <Button
          variant="outline"
          @click="previousStep"
          :disabled="currentStep === 0"
        >
          Previous
        </Button>
        <Button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
        >
          Next
        </Button>
        <Button
          v-else
          @click="createBom"
          :disabled="isSubmitting"
        >
          <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Create BOM
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  XIcon,
  PlusIcon,
  Loader2Icon,
  LayersIcon,
  ListIcon,
  CheckIcon,
  CalendarIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  },
  inventory: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['create-bom', 'close'])

// Wizard steps
const steps = ['basic-info', 'components', 'steps', 'quality', 'review']
const stepTitles = [
  'Basic Information',
  'Components',
  'Assembly Steps',
  'Quality Checks',
  'Review & Create'
]
const currentStep = ref(0)

// Form data
const formData = reactive({
  name: '',
  version: '1.0',
  description: '',
  productId: '',
  status: 'draft',
  batchSize: 1,
  effectiveDate: new Date().toISOString(),
  components: [],
  steps: [],
  qualityChecks: []
})

// Form validation errors
const errors = reactive({
  name: '',
  version: '',
  productId: ''
})

// Submission state
const isSubmitting = ref(false)

// Navigation methods
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
  }
}

const previousStep = () => {
  currentStep.value--
}

// Component management
const openComponentSelector = () => {
  // In a real implementation, this might open a modal or sheet
  // For now, we'll simulate by adding a dummy component
  const availableItems = props.inventory.filter(item => 
    !formData.components.some(comp => comp.itemId === item.id)
  )
  
  if (availableItems.length > 0) {
    const item = availableItems[0]
    formData.components.push({
      itemId: item.id,
      quantity: 1,
      notes: '',
      unitOfMeasure: item.unitOfMeasure
    })
  } else {
    alert('No more items available to add')
  }
}

const removeComponent = (index) => {
  formData.components.splice(index, 1)
}

// Step management
const addAssemblyStep = () => {
  formData.steps.push({
    title: '',
    description: '',
    timeInMinutes: 5,
    tools: '',
    componentIds: []
  })
}

const removeStep = (index) => {
  formData.steps.splice(index, 1)
}

// Quality check management
const addQualityCheck = () => {
  formData.qualityChecks.push({
    title: '',
    description: '',
    type: 'visual',
    performAt: 'after',
    targetValue: null,
    minValue: null,
    maxValue: null
  })
}

const removeQualityCheck = (index) => {
  formData.qualityChecks.splice(index, 1)
}

// Validation methods
const validateCurrentStep = () => {
  let isValid = true
  
  // Reset errors
  for (const key in errors) {
    errors[key] = ''
  }
  
  if (currentStep.value === 0) {
    if (!formData.name.trim()) {
      errors.name = 'BOM name is required'
      isValid = false
    }
    
    if (!formData.version.trim()) {
      errors.version = 'Version is required'
      isValid = false
    }
    
    if (!formData.productId) {
      errors.productId = 'Product is required'
      isValid = false
    }
  }
  
  return isValid
}

const validateAllSteps = () => {
  const originalStep = currentStep.value
  let isValid = true
  
  // Validate each step
  for (let step = 0; step < steps.length - 1; step++) {
    currentStep.value = step
    if (!validateCurrentStep()) {
      isValid = false
    }
  }
  
  // Restore original step
  currentStep.value = originalStep
  return isValid
}

// Helper methods
const getProductName = (productId) => {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

const getItemName = (itemId) => {
  const item = props.inventory.find(i => i.id === itemId)
  return item ? item.name : 'Unknown Item'
}

const getItemSku = (itemId) => {
  const item = props.inventory.find(i => i.id === itemId)
  return item ? item.sku : 'Unknown SKU'
}

const getItemCategory = (itemId) => {
  const item = props.inventory.find(i => i.id === itemId)
  return item && item.categoryName ? item.categoryName : 'Uncategorized'
}

const getItemUnit = (itemId) => {
  const item = props.inventory.find(i => i.id === itemId)
  return item ? item.unitOfMeasure : 'ea'
}

const getItemCost = (itemId) => {
  const item = props.inventory.find(i => i.id === itemId)
  return item ? (item.cost || 0) : 0
}

const formatStatus = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'active': 'Active',
    'obsolete': 'Obsolete'
  }
  return statusMap[status] || status
}

const formatCheckType = (type) => {
  const typeMap = {
    'visual': 'Visual Inspection',
    'measurement': 'Measurement',
    'function': 'Functional Test',
    'other': 'Other'
  }
  return typeMap[type] || type
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'KES' 
  }).format(value || 0)
}

const calculateComponentCost = (component) => {
  const itemCost = getItemCost(component.itemId)
  return itemCost * component.quantity
}

const calculateTotalCost = () => {
  const total = formData.components.reduce((sum, component) => {
    return sum + calculateComponentCost(component)
  }, 0)
  
  return formatCurrency(total)
}

// Submission handler
const createBom = async () => {
  if (!validateAllSteps()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Set product information
    const product = props.products.find(p => p.id === formData.productId)
    if (product) {
      formData.productName = product.name
      formData.productSku = product.sku
    }
    
    // Add component names, SKUs, and other details
    formData.components = formData.components.map(component => {
      const item = props.inventory.find(i => i.id === component.itemId)
      return {
        ...component,
        itemName: item ? item.name : 'Unknown Item',
        sku: item ? item.sku : 'Unknown SKU',
        cost: getItemCost(component.itemId),
        unitOfMeasure: getItemUnit(component.itemId)
      }
    })
    
    // Calculate totals
    formData.totalComponents = formData.components.length
    formData.totalSteps = formData.steps.length
    formData.estimatedTime = formData.steps.reduce((sum, step) => sum + (step.timeInMinutes || 0), 0)
    formData.totalCost = formData.components.reduce((sum, component) => sum + calculateComponentCost(component), 0)
    
    // Emit the BOM for creation
    emit('create-bom', { ...formData })
  } catch (error) {
    console.error('Error preparing BOM data:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>