<template>
  <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <LayoutTemplateIcon class="h-5 w-5" />
        <span>Category Templates</span>
      </DialogTitle>
      <DialogDescription>
        Choose from pre-built category structures or create your own template
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6">
      <!-- Template Categories -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
          :class="{ 'border-primary bg-primary/5': selectedTemplate === template.id }"
          @click="selectedTemplate = template.id"
        >
          <div class="flex items-start space-x-3">
            <component :is="template.icon" class="h-8 w-8 text-primary mt-1" />
            <div class="flex-1">
              <div class="font-medium mb-1">{{ template.name }}</div>
              <div class="text-sm text-muted-foreground mb-2">{{ template.description }}</div>
              <div class="text-xs text-muted-foreground">
                {{ template.categoriesCount }} categories
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Template Preview -->
      <div v-if="selectedTemplateData" class="border rounded-lg p-4">
        <h3 class="font-semibold mb-3">Template Preview: {{ selectedTemplateData.name }}</h3>
        <div class="max-h-64 overflow-y-auto">
          <div class="space-y-1">
            <div 
              v-for="category in selectedTemplateData.categories" 
              :key="category.code"
              class="flex items-center space-x-2 text-sm py-1"
            >
              <div :style="{ paddingLeft: `${category.level * 20}px` }" class="flex items-center space-x-2">
                <FolderIcon class="h-3 w-3 text-muted-foreground" />
                <span class="font-medium">{{ category.name }}</span>
                <Badge variant="outline" class="text-xs">{{ category.code }}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Template Actions -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            This will create {{ selectedTemplateData.categoriesCount }} categories
          </div>
          <div class="space-x-2">
            <Button variant="outline" size="sm" @click="previewTemplate">
              <EyeIcon class="h-4 w-4 mr-2" />
              Full Preview
            </Button>
            <Button size="sm" @click="applyTemplate" :disabled="isApplying">
              <Loader2Icon v-if="isApplying" class="h-4 w-4 mr-2 animate-spin" />
              <CheckIcon v-else class="h-4 w-4 mr-2" />
              Apply Template
            </Button>
          </div>
        </div>
      </div>

      <!-- Custom Template -->
      <div class="border-t pt-6">
        <h3 class="font-semibold mb-3">Custom Template</h3>
        <div class="space-y-4">
          <div>
            <Label for="template-name">Template Name</Label>
            <Input
              id="template-name"
              v-model="customTemplate.name"
              placeholder="My Custom Template"
            />
          </div>
          <div>
            <Label for="template-categories">Categories (CSV format)</Label>
            <Textarea
              id="template-categories"
              v-model="customTemplate.categories"
              placeholder="code,name,description,parentCode
ELEC,Electronics,Electronic devices,
COMP,Computers,Computer equipment,ELEC
PHON,Phones,Mobile phones,ELEC"
              rows="6"
              class="font-mono text-sm"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Format: code,name,description,parentCode (one per line)
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm" @click="validateCustomTemplate">
              <CheckCircleIcon class="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button size="sm" @click="applyCustomTemplate" :disabled="!customTemplate.name || !customTemplate.categories">
              <PlusIcon class="h-4 w-4 mr-2" />
              Create from Custom
            </Button>
          </div>
          <div v-if="customValidation.message" class="text-sm" :class="{
            'text-green-600': customValidation.valid,
            'text-red-600': !customValidation.valid
          }">
            {{ customValidation.message }}
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  LayoutTemplateIcon, FolderIcon, EyeIcon, CheckIcon, Loader2Icon,
  CheckCircleIcon, PlusIcon, PackageIcon, ShoppingCartIcon, WrenchIcon,
  HomeIcon, CarIcon, ShirtIcon, BookIcon, GamepadIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

// Emits
const emit = defineEmits(['template-applied', 'close'])

// State
const selectedTemplate = ref('')
const isApplying = ref(false)
const customTemplate = ref({
  name: '',
  categories: ''
})
const customValidation = ref({
  valid: false,
  message: ''
})

// Template definitions
const templates = [
  {
    id: 'general-retail',
    name: 'General Retail',
    description: 'Common categories for retail businesses',
    icon: ShoppingCartIcon,
    categoriesCount: 12,
    categories: [
      { code: 'ELEC', name: 'Electronics', level: 0 },
      { code: 'COMP', name: 'Computers', level: 1 },
      { code: 'PHON', name: 'Phones', level: 1 },
      { code: 'CLOT', name: 'Clothing', level: 0 },
      { code: 'MENS', name: "Men's Clothing", level: 1 },
      { code: 'WOME', name: "Women's Clothing", level: 1 },
      { code: 'HOME', name: 'Home & Garden', level: 0 },
      { code: 'FURN', name: 'Furniture', level: 1 },
      { code: 'DECO', name: 'Decor', level: 1 }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Categories for manufacturing and industrial supplies',
    icon: WrenchIcon,
    categoriesCount: 15,
    categories: [
      { code: 'RAW', name: 'Raw Materials', level: 0 },
      { code: 'METL', name: 'Metals', level: 1 },
      { code: 'PLAS', name: 'Plastics', level: 1 },
      { code: 'TOOL', name: 'Tools & Equipment', level: 0 },
      { code: 'HAND', name: 'Hand Tools', level: 1 },
      { code: 'POWR', name: 'Power Tools', level: 1 },
      { code: 'SAFE', name: 'Safety Equipment', level: 0 }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Auto parts and accessories organization',
    icon: CarIcon,
    categoriesCount: 18,
    categories: [
      { code: 'ENGN', name: 'Engine Parts', level: 0 },
      { code: 'FILT', name: 'Filters', level: 1 },
      { code: 'BELT', name: 'Belts & Hoses', level: 1 },
      { code: 'BRAK', name: 'Brake System', level: 0 },
      { code: 'PADS', name: 'Brake Pads', level: 1 },
      { code: 'DISC', name: 'Brake Discs', level: 1 },
      { code: 'ELEC', name: 'Electrical', level: 0 }
    ]
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    description: 'Complete office and stationery categories',
    icon: BookIcon,
    categoriesCount: 10,
    categories: [
      { code: 'STAT', name: 'Stationery', level: 0 },
      { code: 'PENS', name: 'Pens & Pencils', level: 1 },
      { code: 'PAPR', name: 'Paper Products', level: 1 },
      { code: 'TECH', name: 'Technology', level: 0 },
      { code: 'COMP', name: 'Computers', level: 1 },
      { code: 'ACCE', name: 'Accessories', level: 1 }
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Comprehensive clothing and accessories',
    icon: ShirtIcon,
    categoriesCount: 20,
    categories: [
      { code: 'MENS', name: "Men's Fashion", level: 0 },
      { code: 'MTOP', name: 'Tops', level: 1 },
      { code: 'MPAN', name: 'Pants', level: 1 },
      { code: 'WOME', name: "Women's Fashion", level: 0 },
      { code: 'WTOP', name: 'Tops', level: 1 },
      { code: 'WPAN', name: 'Pants', level: 1 },
      { code: 'ACCE', name: 'Accessories', level: 0 }
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming & Entertainment',
    description: 'Games, consoles, and entertainment products',
    icon: GamepadIcon,
    categoriesCount: 8,
    categories: [
      { code: 'CONS', name: 'Gaming Consoles', level: 0 },
      { code: 'GAME', name: 'Games', level: 0 },
      { code: 'ACCE', name: 'Gaming Accessories', level: 0 },
      { code: 'CONT', name: 'Controllers', level: 1 },
      { code: 'HEAD', name: 'Headsets', level: 1 }
    ]
  }
]

// Computed
const selectedTemplateData = computed(() => {
  return templates.find(t => t.id === selectedTemplate.value)
})

// Methods
const previewTemplate = () => {
  // Could open a larger preview dialog
  console.log('Preview template:', selectedTemplateData.value)
}

const applyTemplate = async () => {
  if (!selectedTemplateData.value) return
  
  isApplying.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('template-applied', selectedTemplateData.value)
  } catch (error) {
    console.error('Error applying template:', error)
  } finally {
    isApplying.value = false
  }
}

const validateCustomTemplate = () => {
  if (!customTemplate.value.categories.trim()) {
    customValidation.value = {
      valid: false,
      message: 'Please enter category data'
    }
    return
  }
  
  try {
    const lines = customTemplate.value.categories.trim().split('\n')
    const header = lines[0]
    const expectedHeaders = ['code', 'name', 'description', 'parentCode']
    
    if (!expectedHeaders.every(h => header.toLowerCase().includes(h))) {
      customValidation.value = {
        valid: false,
        message: 'Invalid header format. Expected: code,name,description,parentCode'
      }
      return
    }
    
    const categoryCount = lines.length - 1
    customValidation.value = {
      valid: true,
      message: `Valid format! ${categoryCount} categories ready to import`
    }
  } catch (error) {
    customValidation.value = {
      valid: false,
      message: 'Invalid CSV format'
    }
  }
}

const applyCustomTemplate = async () => {
  if (!customTemplate.value.name || !customTemplate.value.categories) return
  
  validateCustomTemplate()
  if (!customValidation.value.valid) return
  
  isApplying.value = true
  
  try {
    const customTemplateData = {
      name: customTemplate.value.name,
      categories: customTemplate.value.categories,
      type: 'custom'
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('template-applied', customTemplateData)
  } catch (error) {
    console.error('Error applying custom template:', error)
  } finally {
    isApplying.value = false
  }
}
</script>
