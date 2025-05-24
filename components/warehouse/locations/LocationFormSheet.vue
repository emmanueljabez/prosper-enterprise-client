<template>
  <SheetContent class="sm:max-w-md flex flex-col h-full">
    <SheetHeader>
      <SheetTitle>{{ isCreating ? 'Create Location' : 'Edit Location' }}</SheetTitle>
      <SheetDescription>
        {{ isCreating ? 'Add a new location to your warehouse' : `Update details for ${location.name}` }}
      </SheetDescription>
    </SheetHeader>
    
    <div class="flex-1 overflow-y-auto py-6">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Basic Information</h3>
          
          <div class="space-y-2">
            <Label for="location-name">Name <span class="text-destructive">*</span></Label>
            <Input 
              id="location-name" 
              v-model="formData.name" 
              :class="{ 'border-destructive': validationErrors.name }"
              placeholder="Warehouse A, Zone B1, Aisle C, etc."
            />
            <p v-if="validationErrors.name" class="text-xs text-destructive mt-1">
              {{ validationErrors.name }}
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="location-type">Type <span class="text-destructive">*</span></Label>
            <Select v-model="formData.type" :disabled="!isCreating">
              <SelectTrigger 
                id="location-type" 
                :class="{ 'border-destructive': validationErrors.type }"
              >
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="zone">Zone</SelectItem>
                <SelectItem value="aisle">Aisle</SelectItem>
                <SelectItem value="bin">Bin</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="validationErrors.type" class="text-xs text-destructive mt-1">
              {{ validationErrors.type }}
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="location-code">Code</Label>
            <Input 
              id="location-code" 
              v-model="formData.code" 
              placeholder="WAR-A, ZN-B1, AISLE-C, etc."
            />
            <p class="text-xs text-muted-foreground">
              A unique identifier for this location
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="location-parent">Parent Location</Label>
            <Select v-model="formData.parentId">
              <SelectTrigger id="location-parent">
                <SelectValue placeholder="None (Top Level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">None (Top Level)</SelectItem>
                <SelectItem 
                  v-for="parent in availableParents" 
                  :key="parent.id" 
                  :value="parent.id"
                  :disabled="parent.id === location.id"
                >
                  {{ parent.name }} ({{ formatLocationType(parent.type) }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Where this location exists in the hierarchy
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="location-status">Status</Label>
            <Select v-model="formData.status">
              <SelectTrigger id="location-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="location-description">Description</Label>
            <Textarea 
              id="location-description" 
              v-model="formData.description" 
              placeholder="Add additional details about this location..."
              rows="3"
            />
          </div>
        </div>
        
        <!-- Capacity & Dimensions -->
        <Separator />
        <div class="space-y-4 pt-2">
          <h3 class="text-sm font-medium">Capacity & Dimensions</h3>
          
          <div class="space-y-2">
            <Label for="location-capacity">Capacity</Label>
            <Input 
              id="location-capacity" 
              v-model="formData.capacity" 
              type="number" 
              min="0"
              placeholder="Maximum storage capacity"
            />
            <p class="text-xs text-muted-foreground">
              Maximum number of items this location can hold
            </p>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-2">
              <Label for="location-length">Length</Label>
              <Input 
                id="location-length" 
                v-model="formData.dimensions.length" 
                type="number" 
                min="0"
                step="0.01"
              />
            </div>
            <div class="space-y-2">
              <Label for="location-width">Width</Label>
              <Input 
                id="location-width" 
                v-model="formData.dimensions.width" 
                type="number" 
                min="0"
                step="0.01"
              />
            </div>
            <div class="space-y-2">
              <Label for="location-height">Height</Label>
              <Input 
                id="location-height" 
                v-model="formData.dimensions.height" 
                type="number" 
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="location-unit">Unit of Measurement</Label>
            <Select v-model="formData.dimensions.unit">
              <SelectTrigger id="location-unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ft">Feet (ft)</SelectItem>
                <SelectItem value="m">Meters (m)</SelectItem>
                <SelectItem value="in">Inches (in)</SelectItem>
                <SelectItem value="cm">Centimeters (cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <!-- Additional Attributes -->
        <Separator />
        <div class="space-y-4 pt-2">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Additional Attributes</h3>
            <Button type="button" variant="outline" size="sm" @click="addAttribute">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Attribute
            </Button>
          </div>
          
          <div v-if="formData.attributes && Object.keys(formData.attributes).length > 0">
            <div 
              v-for="(value, key) in formData.attributes" 
              :key="key"
              class="flex items-center space-x-3 mb-3"
            >
              <div class="grid grid-cols-2 gap-2 flex-grow">
                <Input 
                  :value="key" 
                  @input="updateAttributeKey(key, $event.target.value)"
                  placeholder="Attribute name"
                />
                <Input 
                  v-model="formData.attributes[key]" 
                  placeholder="Attribute value"
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                @click="removeAttribute(key)"
                class="h-9 w-9"
              >
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div v-else class="text-center py-3 border rounded-md bg-muted/20">
            <p class="text-sm text-muted-foreground">
              No additional attributes
            </p>
          </div>
        </div>
      </form>
    </div>
    
    <SheetFooter class="flex-shrink-0 border-t pt-4 pb-2 mt-2">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" :disabled="isSubmitting" @click="handleSubmit">
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        {{ isCreating ? 'Create Location' : 'Save Changes' }}
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  PlusIcon, XIcon, Loader2Icon
} from 'lucide-vue-next';
import { 
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Props
const props = defineProps({
  location: {
    type: Object,
    default: () => ({})
  },
  parentLocations: {
    type: Array,
    default: () => []
  },
  isCreating: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['location-saved', 'close']);

// Form state
const isSubmitting = ref(false);
const validationErrors = ref({});

// Initialize form data
const formData = ref({
  id: props.location?.id || null,
  name: props.location?.name || '',
  type: props.location?.type || 'warehouse',
  code: props.location?.code || '',
  status: props.location?.status || 'active',
  description: props.location?.description || '',
  parentId: props.location?.parentId || null,
  capacity: props.location?.capacity || '',
  dimensions: {
    length: props.location?.dimensions?.length || '',
    width: props.location?.dimensions?.width || '',
    height: props.location?.dimensions?.height || '',
    unit: props.location?.dimensions?.unit || 'ft'
  },
  attributes: { ...(props.location?.attributes || {}) }
});

// Watch for changes in location prop
watch(
  () => props.location,
  (newLocation) => {
    // Update formData when location prop changes
    if (newLocation) {
      formData.value = {
        id: newLocation.id || null,
        name: newLocation.name || '',
        type: newLocation.type || 'warehouse',
        code: newLocation.code || '',
        status: newLocation.status || 'active',
        description: newLocation.description || '',
        parentId: newLocation.parentId || null,
        capacity: newLocation.capacity || '',
        dimensions: {
          length: newLocation.dimensions?.length || '',
          width: newLocation.dimensions?.width || '',
          height: newLocation.dimensions?.height || '',
          unit: newLocation.dimensions?.unit || 'ft'
        },
        attributes: { ...(newLocation.attributes || {}) }
      };
    }
  },
  { immediate: true }
);

// Computed
const availableParents = computed(() => {
  // Filter out the current location (can't be its own parent)
  // and any locations that would create a circular reference
  return props.parentLocations.filter(parent => 
    parent.id !== props.location?.id
  );
});

// Methods
const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const addAttribute = () => {
  const newKey = `attribute_${Object.keys(formData.value.attributes).length + 1}`;
  formData.value.attributes = {
    ...formData.value.attributes,
    [newKey]: ''
  };
};

const removeAttribute = (key) => {
  const attributes = { ...formData.value.attributes };
  delete attributes[key];
  formData.value.attributes = attributes;
};

const updateAttributeKey = (oldKey, newKey) => {
  if (oldKey === newKey) return;
  
  const attributes = {};
  Object.entries(formData.value.attributes).forEach(([key, value]) => {
    if (key === oldKey) {
      attributes[newKey] = value;
    } else {
      attributes[key] = value;
    }
  });
  
  formData.value.attributes = attributes;
};

const validateForm = () => {
  const errors = {};
  
  if (!formData.value.name.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!formData.value.type) {
    errors.type = 'Location type is required';
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    // Prepare the data
    const locationData = {
      ...formData.value,
      // Convert numeric strings to numbers
      capacity: formData.value.capacity ? Number(formData.value.capacity) : null,
      dimensions: {
        length: formData.value.dimensions.length ? Number(formData.value.dimensions.length) : null,
        width: formData.value.dimensions.width ? Number(formData.value.dimensions.width) : null,
        height: formData.value.dimensions.height ? Number(formData.value.dimensions.height) : null,
        unit: formData.value.dimensions.unit
      }
    };
    
    // Submit the form
    emit('location-saved', locationData);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Initialize component
onMounted(() => {
  // Additional initialization if needed
});
</script>