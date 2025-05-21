<template>
  <SheetContent class="w-full sm:max-w-[650px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Manage Variant Attributes</SheetTitle>
      <SheetDescription>
        Configure which attributes can be used for product variants
      </SheetDescription>
    </SheetHeader>

    <div class="py-6 space-y-6">
      <Tabs defaultValue="existing" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Attributes</TabsTrigger>
          <TabsTrigger value="create">Create New Attribute</TabsTrigger>
        </TabsList>
        
        <!-- Existing Attributes Tab -->
        <TabsContent value="existing" class="space-y-4 pt-4">
          <div class="flex items-center justify-between mb-4">
            <div class="space-y-1">
              <h3 class="text-lg font-medium">Variant Attributes</h3>
              <p class="text-sm text-muted-foreground">
                Attributes that can be used to define product variants
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <Input 
                v-model="attributeSearch"
                placeholder="Search attributes..."
                class="w-[200px]" 
              />
            </div>
          </div>

          <Card v-if="isLoading">
            <CardContent class="pt-6">
              <div class="flex items-center justify-center py-8">
                <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card v-else-if="filteredAttributes.length === 0">
            <CardContent class="pt-6">
              <div class="flex flex-col items-center justify-center py-8 text-center">
                <PackagePlus class="h-12 w-12 text-muted-foreground mb-3" />
                <h3 class="text-lg font-medium">No attributes found</h3>
                <p class="text-sm text-muted-foreground max-w-md mt-1.5">
                  {{ attributeSearch 
                    ? 'Try adjusting your search query' 
                    : 'Create your first product attribute to get started with variants' }}
                </p>
              </div>
            </CardContent>
          </Card>

          <div v-else class="space-y-4">
            <Card v-for="attribute in filteredAttributes" :key="attribute.id" class="overflow-hidden">
              <CardHeader class="py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <CardTitle class="text-base">{{ attribute.name }}</CardTitle>
                    <CardDescription class="text-xs">
                      {{ attribute.type }} | Code: <span class="font-mono">{{ attribute.code }}</span>
                    </CardDescription>
                  </div>
                  <div class="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      @click="editAttribute(attribute)"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Switch 
                      :checked="attribute.isVariant"
                      @update:checked="toggleVariantAttribute(attribute)"
                      :disabled="isUpdating === attribute.id"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent class="pb-4 pt-0">
                <div class="text-sm text-muted-foreground">
                  {{ attribute.description || 'No description' }}
                </div>
                
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <Badge 
                    v-if="attribute.isVariant" 
                    variant="default"
                  >
                    Variant
                  </Badge>
                  <Badge 
                    v-if="attribute.isRequired" 
                    variant="secondary"
                  >
                    Required
                  </Badge>
                  <Badge 
                    v-if="attribute.isGlobal" 
                    variant="outline"
                  >
                    Global
                  </Badge>
                  <Badge 
                    v-if="attribute.isFilterable" 
                    variant="outline"
                  >
                    Filterable
                  </Badge>
                </div>
                
                <Collapsible v-if="attribute.options && attribute.options.length > 0" class="mt-3">
                  <CollapsibleTrigger class="flex items-center text-xs font-medium text-muted-foreground hover:underline">
                    <div class="flex items-center">
                      <ChevronRight class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-90': expanded[attribute.id] }" />
                      {{ attribute.options.length }} Options
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      <div 
                        v-for="option in attribute.options" 
                        :key="option.id"
                        class="flex items-center space-x-2 p-2 bg-muted/50 rounded-md"
                      >
                        <div 
                          v-if="attribute.type === 'color'"
                          class="w-4 h-4 rounded-full border"
                          :style="{ backgroundColor: option.metadata?.color || '#ccc' }"
                        ></div>
                        <span class="text-sm truncate">{{ option.label }}</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <!-- Create New Attribute Tab -->
        <TabsContent value="create" class="space-y-4 pt-4">
          <div class="space-y-1 mb-4">
            <h3 class="text-lg font-medium">Create New Attribute</h3>
            <p class="text-sm text-muted-foreground">
              Define a new attribute to use with product variants
            </p>
          </div>
          
          <form @submit.prevent="createAttribute" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="attribute-name">Name <span class="text-destructive">*</span></Label>
                <Input 
                  id="attribute-name"
                  v-model="newAttribute.name"
                  placeholder="e.g. Color, Size, Material"
                  :disabled="isCreating"
                />
                <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
              </div>
              
              <div class="space-y-2">
                <Label for="attribute-code">Code <span class="text-destructive">*</span></Label>
                <Input 
                  id="attribute-code"
                  v-model="newAttribute.code"
                  placeholder="e.g. color, size, material"
                  :disabled="isCreating"
                />
                <p class="text-xs text-muted-foreground">
                  Unique code without spaces, used in your system
                </p>
                <p v-if="errors.code" class="text-sm text-destructive">{{ errors.code }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <Label for="attribute-description">Description</Label>
              <Textarea 
                id="attribute-description"
                v-model="newAttribute.description"
                placeholder="Describe the attribute..."
                :disabled="isCreating"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="attribute-type">Type <span class="text-destructive">*</span></Label>
              <Select v-model="newAttribute.type" :disabled="isCreating">
                <SelectTrigger id="attribute-type">
                  <SelectValue placeholder="Select attribute type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Single Select</SelectItem>
                  <SelectItem value="multiselect">Multi Select</SelectItem>
                  <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
            </div>
            
            <div v-if="['select', 'multiselect', 'color'].includes(newAttribute.type)" class="space-y-4 border p-4 rounded-md">
              <div class="flex items-center justify-between">
                <Label>Options</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  @click="addOption"
                  :disabled="isCreating"
                >
                  <Plus class="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              
              <div v-if="newAttribute.options.length === 0" class="text-sm text-muted-foreground italic py-2">
                No options added yet. Click "Add Option" to create options.
              </div>
              
              <div v-for="(option, index) in newAttribute.options" :key="index" class="flex items-center space-x-2">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input 
                    v-model="option.label"
                    placeholder="Label (e.g. Red, Small)"
                    :disabled="isCreating"
                  />
                  <Input 
                    v-model="option.value"
                    placeholder="Value (e.g. red, small)"
                    :disabled="isCreating"
                  />
                  <Input 
                    v-if="newAttribute.type === 'color'"
                    v-model="option.metadata.color"
                    type="color"
                    :disabled="isCreating"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  @click="removeOption(index)"
                  :disabled="isCreating"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div class="space-y-4 border p-4 rounded-md">
              <Label class="text-base">Settings</Label>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="is-variant" 
                    v-model:checked="newAttribute.isVariant"
                    :disabled="isCreating"
                  />
                  <div>
                    <Label for="is-variant">Use for Variants</Label>
                    <p class="text-xs text-muted-foreground">
                      This attribute can be used to create product variants
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="is-required" 
                    v-model:checked="newAttribute.isRequired"
                    :disabled="isCreating"
                  />
                  <div>
                    <Label for="is-required">Required</Label>
                    <p class="text-xs text-muted-foreground">
                      A value is required for this attribute
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="is-global" 
                    v-model:checked="newAttribute.isGlobal"
                    :disabled="isCreating"
                  />
                  <div>
                    <Label for="is-global">Global</Label>
                    <p class="text-xs text-muted-foreground">
                      Available for all products
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="is-filterable" 
                    v-model:checked="newAttribute.isFilterable"
                    :disabled="isCreating"
                  />
                  <div>
                    <Label for="is-filterable">Filterable</Label>
                    <p class="text-xs text-muted-foreground">
                      Can be used to filter products
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              class="w-full"
              :disabled="isCreating"
            >
              <Loader2 v-if="isCreating" class="h-4 w-4 mr-2 animate-spin" />
              Create Attribute
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>

    <SheetFooter>
      <Button variant="outline" @click="$emit('close')">
        Done
      </Button>
    </SheetFooter>

    <!-- Edit Attribute Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Attribute</DialogTitle>
          <DialogDescription>
            Update attribute properties
          </DialogDescription>
        </DialogHeader>
        
        <div class="py-4 space-y-4">
          <div v-if="editingAttribute" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit-name">Name</Label>
                <Input 
                  id="edit-name"
                  v-model="editingAttribute.name"
                  :disabled="isEditSaving"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="edit-code">Code</Label>
                <Input 
                  id="edit-code"
                  v-model="editingAttribute.code"
                  :disabled="true"
                  class="bg-muted/40"
                />
                <p class="text-xs text-muted-foreground">
                  Code cannot be changed
                </p>
              </div>
            </div>
            
            <div class="space-y-2">
              <Label for="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                v-model="editingAttribute.description"
                :disabled="isEditSaving"
              />
            </div>
            
            <div class="space-y-4 border p-4 rounded-md">
              <Label class="text-base">Settings</Label>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="edit-is-variant" 
                    v-model:checked="editingAttribute.isVariant"
                    :disabled="isEditSaving"
                  />
                  <div>
                    <Label for="edit-is-variant">Use for Variants</Label>
                    <p class="text-xs text-muted-foreground">
                      This attribute can be used to create product variants
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="edit-is-required" 
                    v-model:checked="editingAttribute.isRequired"
                    :disabled="isEditSaving"
                  />
                  <div>
                    <Label for="edit-is-required">Required</Label>
                    <p class="text-xs text-muted-foreground">
                      A value is required for this attribute
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="edit-is-global" 
                    v-model:checked="editingAttribute.isGlobal"
                    :disabled="isEditSaving"
                  />
                  <div>
                    <Label for="edit-is-global">Global</Label>
                    <p class="text-xs text-muted-foreground">
                      Available for all products
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <Checkbox 
                    id="edit-is-filterable" 
                    v-model:checked="editingAttribute.isFilterable"
                    :disabled="isEditSaving"
                  />
                  <div>
                    <Label for="edit-is-filterable">Filterable</Label>
                    <p class="text-xs text-muted-foreground">
                      Can be used to filter products
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false" :disabled="isEditSaving">
            Cancel
          </Button>
          <Button 
            @click="saveEditedAttribute" 
            :disabled="isEditSaving"
          >
            <Loader2 v-if="isEditSaving" class="h-4 w-4 mr-2 animate-spin" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { 
  Edit, Loader2, ChevronRight, X, Plus, PackagePlus
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const props = defineProps({
  attributes: {
    type: Array,
    required: true
  },
  variantAttributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['attributes-updated', 'close'])

// State
const attributeSearch = ref('')
const isLoading = ref(false)
const isUpdating = ref(null)
const isCreating = ref(false)
const isEditSaving = ref(false)
const expanded = reactive({})
const errors = ref({})
const showEditDialog = ref(false)
const editingAttribute = ref(null)

// New attribute form
const newAttribute = ref({
  name: '',
  code: '',
  description: '',
  type: '',
  options: [],
  isVariant: true,
  isRequired: false,
  isGlobal: true,
  isFilterable: true
})

// Computed properties
const filteredAttributes = computed(() => {
  if (!attributeSearch.value.trim()) return props.attributes
  
  const search = attributeSearch.value.toLowerCase()
  return props.attributes.filter(attr => 
    attr.name.toLowerCase().includes(search) || 
    attr.code.toLowerCase().includes(search) ||
    (attr.description && attr.description.toLowerCase().includes(search))
  )
})

// Methods
const toggleVariantAttribute = async (attribute) => {
  isUpdating.value = attribute.id
  
  try {
    const updatedAttribute = {
      ...attribute,
      isVariant: !attribute.isVariant
    }
    
    // In a real app, you would call an API here
    await new Promise(resolve => setTimeout(resolve, 500))
    
    emit('attributes-updated', updatedAttribute)
  } catch (error) {
    console.error('Error updating attribute:', error)
  } finally {
    isUpdating.value = null
  }
}

const editAttribute = (attribute) => {
  editingAttribute.value = JSON.parse(JSON.stringify(attribute))
  showEditDialog.value = true
}

const saveEditedAttribute = async () => {
  isEditSaving.value = true
  
  try {
    // In a real app, you would call an API here
    await new Promise(resolve => setTimeout(resolve, 800))
    
    emit('attributes-updated', editingAttribute.value)
    showEditDialog.value = false
  } catch (error) {
    console.error('Error saving attribute:', error)
  } finally {
    isEditSaving.value = false
  }
}

const addOption = () => {
  newAttribute.value.options.push({
    label: '',
    value: '',
    sortOrder: newAttribute.value.options.length,
    metadata: newAttribute.value.type === 'color' ? { color: '#000000' } : {}
  })
}

const removeOption = (index) => {
  newAttribute.value.options.splice(index, 1)
}

const validateNewAttribute = () => {
  const newErrors = {}
  
  if (!newAttribute.value.name) {
    newErrors.name = 'Name is required'
  }
  
  if (!newAttribute.value.code) {
    newErrors.code = 'Code is required'
  } else if (!/^[a-z0-9_-]+$/.test(newAttribute.value.code)) {
    newErrors.code = 'Code must contain only lowercase letters, numbers, underscores, and hyphens'
  } else if (props.attributes.some(attr => attr.code === newAttribute.value.code)) {
    newErrors.code = 'This code is already in use'
  }
  
  if (!newAttribute.value.type) {
    newErrors.type = 'Type is required'
  }
  
  if (['select', 'multiselect', 'color'].includes(newAttribute.value.type) && 
      newAttribute.value.options.length === 0) {
    newErrors.options = 'At least one option is required'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const createAttribute = async () => {
  if (!validateNewAttribute()) return
  
  isCreating.value = true
  
  try {
    // Generate a unique ID
    const attributeId = 'attr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    
    // Process options to add IDs
    const options = newAttribute.value.options.map((option, index) => ({
      id: `${attributeId}_opt_${index}`,
      label: option.label,
      value: option.value || option.label.toLowerCase().replace(/\s+/g, '-'),
      sortOrder: index,
      metadata: option.metadata || {}
    }))
    
    // Create the new attribute
    const attribute = {
      id: attributeId,
      name: newAttribute.value.name,
      code: newAttribute.value.code,
      description: newAttribute.value.description,
      type: newAttribute.value.type,
      options: options,
      isVariant: newAttribute.value.isVariant,
      isRequired: newAttribute.value.isRequired,
      isGlobal: newAttribute.value.isGlobal,
      isFilterable: newAttribute.value.isFilterable,
      isSearchable: false,
      isComparable: false,
      isVisibleOnProductPage: true,
      createdAt: new Date().toISOString()
    }
    
    // In a real app, you would call an API here
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('attributes-updated', attribute, 'create')
    
    // Reset form
    newAttribute.value = {
      name: '',
      code: '',
      description: '',
      type: '',
      options: [],
      isVariant: true,
      isRequired: false,
      isGlobal: true,
      isFilterable: true
    }
  } catch (error) {
    console.error('Error creating attribute:', error)
  } finally {
    isCreating.value = false
  }
}
</script>