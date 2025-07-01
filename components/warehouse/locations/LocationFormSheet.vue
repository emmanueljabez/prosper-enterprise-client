<template>
  <SheetContent class="sm:max-w-2xl flex flex-col h-full">
    <SheetHeader>
      <SheetTitle>{{ isCreating ? `Create ${formatLocationType(formData.type)}` : `Edit ${location?.name || 'Location'}` }}</SheetTitle>
      <SheetDescription>
        {{ isCreating ? `Add a new ${formData.type} to your warehouse hierarchy` : `Update details for ${location?.name || 'this location'}` }}
      </SheetDescription>
    </SheetHeader>
    
    <!-- Loading Guard -->
    <div v-if="!isFormDataReady" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Loader2Icon class="h-8 w-8 animate-spin mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">Loading form...</p>
      </div>
    </div>
    
    <div v-else class="flex-1 overflow-y-auto py-6">
      <form 
        :key="`form-${props.location?.id || 'new'}-${formData.type}`"
        @submit.prevent="handleSubmit" 
        class="space-y-5"
      >
        <!-- Type Selection (only for creating) -->
        <div v-if="isCreating" class="space-y-4">
          <h3 class="text-sm font-medium">Location Type</h3>
          <div class="space-y-2">
            <Label for="location-type">Type <span class="text-destructive">*</span></Label>
            <Select v-model="formData.type" @update:model-value="handleTypeChange">
              <SelectTrigger 
                id="location-type" 
                :class="{ 'border-destructive': validationErrors.type }"
              >
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="option in availableTypes" 
                  :key="option.value" 
                  :value="option.value"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                  <span v-if="option.disabled" class="text-muted-foreground text-xs ml-2">(Not available here)</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="validationErrors.type" class="text-xs text-destructive mt-1">
              {{ validationErrors.type }}
            </p>
            <p v-if="formData.type" class="text-xs text-muted-foreground">
              {{ getTypeDescription(formData.type) }}
            </p>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Basic Information</h3>
          
          <div class="space-y-2">
            <Label for="location-name">Name <span class="text-destructive">*</span></Label>
            <Input 
              id="location-name" 
              v-model="formData.name" 
              :class="{ 'border-destructive': validationErrors.name }"
              :placeholder="getNamePlaceholder(formData.type)"
            />
            <p v-if="validationErrors.name" class="text-xs text-destructive mt-1">
              {{ validationErrors.name }}
            </p>
          </div>
          
          <div class="space-y-2">
            <Label for="location-code">Code</Label>
            <Input 
              id="location-code" 
              v-model="formData.code" 
              :placeholder="getCodePlaceholder(formData.type)"
            />
            <p class="text-xs text-muted-foreground">
              A unique identifier for this {{ formData.type }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="location-description">Description</Label>
            <Textarea 
              id="location-description" 
              v-model="formData.description" 
              :placeholder="`Describe this ${formData.type}...`"
              rows="3"
            />
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
        </div>

        <!-- Parent Location Info (for non-warehouse types) -->
        <div v-if="formData.type !== 'warehouse' && parentLocation" class="space-y-4">
          <Separator />
          <div class="space-y-2">
            <h3 class="text-sm font-medium">Parent Location</h3>
            <div class="p-3 border rounded-md bg-muted/30">
              <div class="flex items-center space-x-2">
                <WarehouseIcon v-if="parentLocation.type === 'warehouse'" class="h-4 w-4 text-blue-500" />
                <LayoutGridIcon v-else-if="parentLocation.type === 'zone'" class="h-4 w-4 text-purple-500" />
                <AlignEndHorizontalIcon v-else-if="parentLocation.type === 'aisle'" class="h-4 w-4 text-amber-500" />
                <span class="font-medium">{{ parentLocation.name }}</span>
                <Badge variant="outline" size="sm">{{ formatLocationType(parentLocation.type) }}</Badge>
              </div>
              <p class="text-sm text-muted-foreground mt-1">{{ parentLocation.description || 'No description' }}</p>
            </div>
          </div>
        </div>

        <!-- Warehouse-specific fields -->
        <div v-if="formData.type === 'warehouse'" class="space-y-4">
          <Separator />
          <h3 class="text-sm font-medium">Warehouse Details</h3>
          
          <!-- Google Maps Location Picker -->
          <div class="space-y-2">
            <Label>Location <span class="text-destructive">*</span></Label>
            
            <!-- Search Bar -->
            <div class="relative">
              <Input 
                ref="searchInputRef"
                id="location-search"
                v-model="mapSearchQuery"
                placeholder="Search for an address..."
                class="pr-20"
                @input="handleSearchInput"
                @focus="handleSearchFocus"
                @blur="handleSearchBlur"
                @keydown="handleSearchKeydown"
                autocomplete="off"
              />
              <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  v-if="mapSearchQuery"
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="h-6 w-6 p-0 hover:bg-muted"
                  @click="clearSearch"
                >
                  <XIcon class="h-3 w-3" />
                </Button>
                <SearchIcon class="h-4 w-4 text-muted-foreground" />
              </div>
              
              <!-- Search Suggestions Dropdown -->
              <div 
                ref="suggestionsContainerRef"
                v-if="searchSuggestions.length > 0 && showSearchSuggestions" 
                class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              >
                <div 
                  v-for="(suggestion, index) in searchSuggestions" 
                  :key="suggestion.placeId || `suggestion-${index}`"
                  class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none"
                  :class="{
                    'bg-accent text-accent-foreground': selectedSuggestionIndex === index,
                    'hover:bg-accent hover:text-accent-foreground': selectedSuggestionIndex !== index
                  }"
                  @click="selectSuggestion(suggestion)"
                  @mouseenter="selectedSuggestionIndex = index"
                >
                  <MapPinIcon class="mr-2 h-4 w-4 shrink-0 opacity-70" />
                  <span>{{ suggestion.description }}</span>
                </div>
              </div>
            </div>
            
            <div class="border rounded-md overflow-hidden">
              <div 
                v-if="formData.type === 'warehouse'"
                :key="`map-${props.location?.id || 'new'}`"
                class="h-64 w-full bg-muted/30 flex items-center justify-center relative"
                :class="{ 'border-destructive': validationErrors.addressLine1 }"
              >
                <div v-if="!mapLoaded || !config.public.googleMapsApiKey" class="text-center">
                  <Loader2Icon v-if="!config.public.googleMapsApiKey" class="h-8 w-8 animate-spin mx-auto mb-2" />
                  <MapIcon v-else class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p class="text-sm text-muted-foreground">
                    {{ !config.public.googleMapsApiKey ? 'Google Maps API key not configured' : 'Loading map...' }}
                  </p>
                </div>
                
                <GoogleMap
                  v-else
                  :api-key="config.public.googleMapsApiKey"
                  style="width: 100%; height: 100%;"
                  :center="mapCenter"
                  :zoom="15"
                  :disable-default-ui="false"
                  :clickable-icons="false"
                  @click="handleMapClick"
                  @ready="onMapReady"
                  class="rounded-md"
                >
                  <Marker
                    v-if="mapMarker.lat && mapMarker.lng"
                    :options="{
                      position: mapMarker,
                      draggable: true,
                      title: formData.name || 'Warehouse Location'
                    }"
                    @dragend="handleMarkerDragEnd"
                  />
                </GoogleMap>
              </div>
              <div v-else class="h-64 w-full bg-muted/30 flex items-center justify-center text-center">
                <div>
                  <MapIcon class="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p class="text-sm text-muted-foreground">Map not available for this location type</p>
                </div>
              </div>
            </div>
            <p v-if="validationErrors.addressLine1" class="text-xs text-destructive">
              {{ validationErrors.addressLine1 }}
            </p>
            <p class="text-xs text-muted-foreground">
              Search for an address above or click on the map to set the warehouse location
              <span v-if="searchSuggestions.length > 0" class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {{ searchSuggestions.length }} suggestion{{ searchSuggestions.length > 1 ? 's' : '' }} found
              </span>
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="address1">Address Line 1 <span class="text-destructive">*</span></Label>
              <Input 
                id="address1" 
                v-model="formData.addressLine1" 
                placeholder="123 Industrial Street"
                :class="{ 'border-destructive': validationErrors.addressLine1 }"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="address2">Address Line 2</Label>
              <Input 
                id="address2" 
                v-model="formData.addressLine2" 
                placeholder="Building A, Suite 100"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="city">City <span class="text-destructive">*</span></Label>
              <Input 
                id="city" 
                v-model="formData.city" 
                placeholder="Nairobi"
                :class="{ 'border-destructive': validationErrors.city }"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="state">State/Province <span class="text-destructive">*</span></Label>
              <Input 
                id="state" 
                v-model="formData.state" 
                placeholder="Nairobi County"
                :class="{ 'border-destructive': validationErrors.state }"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="postal">Postal Code <span class="text-destructive">*</span></Label>
              <Input 
                id="postal" 
                v-model="formData.postalCode" 
                placeholder="00100"
                :class="{ 'border-destructive': validationErrors.postalCode }"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="country">Country <span class="text-destructive">*</span></Label>
              <Input 
                id="country" 
                v-model="formData.country" 
                placeholder="Kenya"
                :class="{ 'border-destructive': validationErrors.country }"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label for="contact-person">Contact Person</Label>
              <Input 
                id="contact-person" 
                v-model="formData.contactPerson" 
                placeholder="John Doe"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="contact-phone">Contact Phone</Label>
              <Input 
                id="contact-phone" 
                v-model="formData.contactPhone" 
                placeholder="+254-700-123456"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="contact-email">Contact Email</Label>
              <Input 
                id="contact-email" 
                v-model="formData.contactEmail" 
                placeholder="warehouse@company.com"
                type="email"
              />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="is-main-warehouse" 
              v-model="formData.isMainWarehouse"
              class="rounded border-gray-300"
            />
            <Label for="is-main-warehouse">Main Warehouse</Label>
            <p class="text-xs text-muted-foreground">Mark as the primary distribution center</p>
          </div>
        </div>
        
        <!-- Zone-specific fields -->
        <div v-else-if="formData.type === 'zone'" class="space-y-4">
          <Separator />
          <h3 class="text-sm font-medium">Zone Configuration</h3>
          
          <div class="space-y-2">
            <Label for="zone-purpose">Zone Purpose</Label>
            <Select v-model="formData.zonePurpose">
              <SelectTrigger id="zone-purpose">
                <SelectValue placeholder="Select zone purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="storage">General Storage</SelectItem>
                <SelectItem value="receiving">Receiving Area</SelectItem>
                <SelectItem value="shipping">Shipping Area</SelectItem>
                <SelectItem value="staging">Staging Area</SelectItem>
                <SelectItem value="quarantine">Quarantine Zone</SelectItem>
                <SelectItem value="high-value">High-Value Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Aisle-specific fields -->
        <div v-else-if="formData.type === 'aisle'" class="space-y-4">
          <Separator />
          <h3 class="text-sm font-medium">Aisle Configuration</h3>
          
          <div class="space-y-2">
            <Label for="aisle-number">Aisle Number</Label>
            <Input 
              id="aisle-number" 
              v-model="formData.aisleNumber" 
              placeholder="A1, B2, etc."
            />
          </div>
        </div>

        <!-- Bin/Shelf-specific fields -->
        <div v-else-if="formData.type === 'bin'" class="space-y-4">
          <Separator />
          <h3 class="text-sm font-medium">Storage Bin Configuration</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="row-code">Row Code</Label>
              <Input 
                id="row-code" 
                v-model="formData.rowCode" 
                placeholder="R1, R2, etc."
              />
            </div>
            
            <div class="space-y-2">
              <Label for="bin-code">Bin Code</Label>
              <Input 
                id="bin-code" 
                v-model="formData.binCode" 
                placeholder="B01, B02, etc."
              />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="is-pickable" 
              v-model="formData.pickable"
              class="rounded border-gray-300"
            />
            <Label for="is-pickable">Pickable Location</Label>
            <p class="text-xs text-muted-foreground">Items can be picked from this location</p>
          </div>
        </div>
        
        <!-- Capacity & Dimensions (for all types) -->
        <Separator />
        <div class="space-y-4 pt-2">
          <h3 class="text-sm font-medium">Capacity & Dimensions</h3>
          
          <div class="space-y-2">
            <Label for="location-capacity">Maximum Capacity</Label>
            <Input 
              id="location-capacity" 
              v-model="formData.maxCapacity" 
              type="number" 
              min="0"
              :placeholder="getCapacityPlaceholder(formData.type)"
            />
            <p class="text-xs text-muted-foreground">
              {{ getCapacityDescription(formData.type) }}
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
                placeholder="0.00"
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
                placeholder="0.00"
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
                placeholder="0.00"
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
      </form>
    </div>
    
    <SheetFooter class="flex-shrink-0 border-t pt-4 pb-2 mt-2">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" :disabled="isSubmitting" @click="handleSubmit">
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        {{ isCreating ? `Create ${formatLocationType(formData.type)}` : 'Save Changes' }}
      </Button>
    </SheetFooter>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { GoogleMap, Marker } from 'vue3-google-map';
import { 
  PlusIcon, XIcon, Loader2Icon, WarehouseIcon, 
  LayoutGridIcon, AlignEndHorizontalIcon, SearchIcon, MapPinIcon, MapIcon
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
import { Badge } from '@/components/ui/badge';
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
  parentLocation: {
    type: Object,
    default: null
  },
  isCreating: {
    type: Boolean,
    default: true
  }
});

/**
 * Data Flow Overview:
 * 1. Props: location (for edit), parentLocation (context), isCreating (mode)
 * 2. FormData: Reactive form state initialized from props.location or defaults
 * 3. Validation: Ensures required fields based on location type
 * 4. Submission: Transforms form data to API-specific payload structure
 * 5. Emit: Sends structured payload to parent for API call
 * 
 * Location Hierarchy: Warehouse -> Zone -> Aisle -> Bin/Shelf
 * Each child location requires: warehouseId + parentLocationId (numeric)
 */

// Component event emitters
const emit = defineEmits(['location-saved', 'close']);

// Google Maps API configuration
const config = useRuntimeConfig();

// Form state management
const isSubmitting = ref(false);
const validationErrors = ref({});
const mapLoaded = ref(true); // Always ready for vue3-google-map component

// Map state for GoogleMap component
const mapCenter = ref({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi, Kenya
const mapMarker = ref({ lat: null, lng: null });

// Address search functionality  
const mapSearchQuery = ref('');
const searchSuggestions = ref([]);
const showSearchSuggestions = ref(false);
const selectedSuggestionIndex = ref(-1);
const searchInputRef = ref(null);
const suggestionsContainerRef = ref(null);
let autocompleteService = null;
let placesService = null;
let searchTimeout = null;
let sessionToken = null;

// Safe computed property to ensure formData exists before template access
const isFormDataReady = computed(() => {
  return formData.value && typeof formData.value === 'object';
});

// Determine available location types based on parent
const availableTypes = computed(() => {
  const types = [
    { value: 'warehouse', label: 'Warehouse', disabled: false },
    { value: 'zone', label: 'Zone', disabled: false },
    { value: 'aisle', label: 'Aisle', disabled: false },
    { value: 'bin', label: 'Storage Bin', disabled: false }
  ];

  if (props.parentLocation) {
    // If there's a parent, restrict based on parent type
    switch (props.parentLocation.type) {
      case 'warehouse':
        // In warehouse, can only create zones
        types.forEach(type => {
          type.disabled = type.value !== 'zone';
        });
        break;
      case 'zone':
        // In zone, can only create aisles
        types.forEach(type => {
          type.disabled = type.value !== 'aisle';
        });
        break;
      case 'aisle':
        // In aisle, can only create bins/shelves
        types.forEach(type => {
          type.disabled = type.value !== 'bin';
        });
        break;
      case 'bin':
        // Bins can't have children
        types.forEach(type => {
          type.disabled = true;
        });
        break;
    }
  } else {
    // No parent means we're creating a top-level location (warehouse only)
    types.forEach(type => {
      type.disabled = type.value !== 'warehouse';
    });
  }

  return types;
});

/**
 * Reactive form data structure - initialized from props.location (edit mode) or defaults (create mode)
 * Contains all possible fields for different location types:
 * - Common: id, name, type, code, status, description, capacity, dimensions
 * - Warehouse: address fields, contact info, isMainWarehouse flag
 * - Zone: zonePurpose
 * - Aisle: aisleNumber  
 * - Bin: rowCode, binCode, pickable flag
 */
const formData = ref({
  id: props.location?.id || null,
  name: props.location?.name || '',
  type: props.location?.type || (props.parentLocation ? getDefaultChildType(props.parentLocation.type) : 'warehouse'),
  code: props.location?.code || '',
  status: props.location?.status || 'active',
  description: props.location?.description || '',
  // Warehouse-specific fields
  addressLine1: props.location?.addressLine1 || '',
  addressLine2: props.location?.addressLine2 || '',
  city: props.location?.city || '',
  state: props.location?.state || '',
  postalCode: props.location?.postalCode || '',
  country: props.location?.country || '',
  contactPerson: props.location?.contactPerson || '',
  contactPhone: props.location?.contactPhone || '',
  contactEmail: props.location?.contactEmail || '',
  isMainWarehouse: props.location?.isMainWarehouse || false,
  // Zone-specific fields
  zonePurpose: props.location?.zonePurpose || '',
  // Aisle-specific fields
  aisleNumber: props.location?.aisleNumber || '',
  // Bin-specific fields
  rowCode: props.location?.rowCode || '',
  binCode: props.location?.binCode || '',
  pickable: props.location?.pickable || false,
  // Common fields
  maxCapacity: props.location?.maxCapacity || '',
  currentCapacity: props.location?.currentCapacity || 0,
  dimensions: {
    length: props.location?.dimensions?.length || '',
    width: props.location?.dimensions?.width || '',
    height: props.location?.dimensions?.height || '',
    unit: props.location?.dimensions?.unit || 'ft'
  }
});

/**
 * Extracts numeric ID from mixed string/number identifiers
 * Handles cases like: "zone-4" -> 4, "warehouse-1" -> 1, 42 -> 42
 */
function extractNumericId(id) {
  if (typeof id === 'number') {
    return id;
  }
  
  if (typeof id === 'string') {
    // Extract numeric suffix from prefixed strings
    const match = id.match(/(\d+)$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Parse pure numeric strings
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  return null;
}

// Location type hierarchy helpers
function getDefaultChildType(parentType) {
  switch (parentType) {
    case 'warehouse': return 'zone';
    case 'zone': return 'aisle';
    case 'aisle': return 'bin';
    default: return 'warehouse';
  }
}

function formatLocationType(type) {
  if (!type) return 'Unknown';
  const formatted = type.charAt(0).toUpperCase() + type.slice(1);
  return type === 'bin' ? 'Storage Bin' : formatted;
}

function getTypeDescription(type) {
  switch (type) {
    case 'warehouse':
      return 'A warehouse is a large storage facility that contains zones, aisles, and storage bins.';
    case 'zone':
      return 'A zone is a section within a warehouse, typically used for organizing different types of products.';
    case 'aisle':
      return 'An aisle is a walkway between storage areas within a zone.';
    case 'bin':
      return 'A storage bin is the smallest storage unit where individual items are placed.';
    default:
      return '';
  }
}

function getNamePlaceholder(type) {
  switch (type) {
    case 'warehouse': return 'Main Distribution Center';
    case 'zone': return 'Zone A, Receiving Area, etc.';
    case 'aisle': return 'Aisle A1, Aisle B2, etc.';
    case 'bin': return 'Bin A1-01, Shelf B2-15, etc.';
    default: return 'Enter a name';
  }
}

function getCodePlaceholder(type) {
  switch (type) {
    case 'warehouse': return 'WH-MAIN-001';
    case 'zone': return 'ZONE-A, REC-001, etc.';
    case 'aisle': return 'AISLE-A1, AIL-B2, etc.';
    case 'bin': return 'BIN-A1-01, SH-B2-15, etc.';
    default: return 'Enter a code';
  }
}

function getCapacityPlaceholder(type) {
  switch (type) {
    case 'warehouse': return '10000';
    case 'zone': return '1000';
    case 'aisle': return '100';
    case 'bin': return '10';
    default: return '0';
  }
}

function getCapacityDescription(type) {
  switch (type) {
    case 'warehouse': return 'Total number of items the warehouse can store';
    case 'zone': return 'Maximum items this zone can accommodate';
    case 'aisle': return 'Maximum items that can be stored in this aisle';
    case 'bin': return 'Maximum items this storage bin can hold';
    default: return 'Maximum storage capacity';
  }
}

function handleTypeChange(newType) {
  // Reset type-specific fields when type changes
  formData.value.zonePurpose = '';
  formData.value.aisleNumber = '';
  formData.value.rowCode = '';
  formData.value.binCode = '';
  formData.value.pickable = false;
  
  // Update name and code suggestions
  formData.value.name = '';
  formData.value.code = '';
}

// Google Maps integration using vue3-google-map
function onMapReady(mapInstance) {
  console.log('Google Map is ready:', mapInstance);
  // Initialize autocomplete service when map is ready
  if (window.google && window.google.maps) {
    autocompleteService = new window.google.maps.places.AutocompleteService();
    
    // Set initial marker if editing existing warehouse with coordinates
    if (props.location && props.location.latitude && props.location.longitude) {
      const lat = parseFloat(props.location.latitude);
      const lng = parseFloat(props.location.longitude);
      mapCenter.value = { lat, lng };
      mapMarker.value = { lat, lng };
    }
  }
}

function handleMapClick(event) {
  try {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Update marker position
    mapMarker.value = { lat, lng };
    
    // Reverse geocode to get address and always update all fields
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0] && formData.value) {
          const addressComponents = results[0].address_components;
          const formattedAddress = results[0].formatted_address;
          
          // Parse address components
          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let postalCode = '';
          let country = '';
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (types.includes('country')) {
              country = component.long_name;
            }
          });
          
          // Always update all form data fields with the new address information
          formData.value.addressLine1 = streetNumber && route ? `${streetNumber} ${route}` : route;
          formData.value.city = city;
          formData.value.state = state;
          formData.value.postalCode = postalCode;
          formData.value.country = country;
        }
      });
    }
  } catch (error) {
    console.error('Error handling map click:', error);
  }
}

function handleMarkerDragEnd(event) {
  try {
    const position = event.latLng;
    const lat = position.lat();
    const lng = position.lng();
    
    // Update marker position
    mapMarker.value = { lat, lng };
    
    // Reverse geocode to get address and always update all fields
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0] && formData.value) {
          const addressComponents = results[0].address_components;
          const formattedAddress = results[0].formatted_address;
          
          // Parse address components
          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let postalCode = '';
          let country = '';
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (types.includes('country')) {
              country = component.long_name;
            }
          });
          
          // Always update all form data fields with the new address information
          formData.value.addressLine1 = streetNumber && route ? `${streetNumber} ${route}` : route;
          formData.value.city = city;
          formData.value.state = state;
          formData.value.postalCode = postalCode;
          formData.value.country = country;
        }
      });
    }
  } catch (error) {
    console.error('Error handling marker drag:', error);
  }
}

// Debounce helper function
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Handle search input with debounce
const handleSearchInput = debounce(async () => {
  if (!mapSearchQuery.value || mapSearchQuery.value.length < 3) {
    searchSuggestions.value = [];
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
    return;
  }
  
  if (!sessionToken) {
    try {
      sessionToken = new google.maps.places.AutocompleteSessionToken();
    } catch (error) {
      console.error('Error creating session token:', error);
      return;
    }
  }
  
  if (!autocompleteService && window.google && window.google.maps && window.google.maps.places) {
    try {
      autocompleteService = new google.maps.places.AutocompleteService();
      placesService = new google.maps.places.PlacesService(document.createElement('div'));
    } catch (error) {
      console.error('Error initializing Places services:', error);
      return;
    }
  }
  
  if (!autocompleteService) {
    // Show test suggestions if autocomplete service is not available
    searchSuggestions.value = [
      {
        placeId: 'test-1',
        description: `${mapSearchQuery.value} - Sample Address 1, Nairobi, Kenya`
      },
      {
        placeId: 'test-2', 
        description: `${mapSearchQuery.value} - Sample Address 2, Nairobi, Kenya`
      }
    ];
    showSearchSuggestions.value = true;
    selectedSuggestionIndex.value = -1;
    return;
  }
  
  try {
    const request = {
      input: mapSearchQuery.value,
      sessionToken: sessionToken,
      // types: ['geocode'],
      componentRestrictions: { country: ['ke', 'us', 'gb', 'ca', 'au'] }
    };
    
    autocompleteService.getPlacePredictions(request, (predictions, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
        searchSuggestions.value = [];
        showSearchSuggestions.value = false;
        selectedSuggestionIndex.value = -1;
        return;
      }
      
      searchSuggestions.value = predictions.slice(0, 5).map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description
      }));
      
      showSearchSuggestions.value = true;
      selectedSuggestionIndex.value = -1;
    });
  } catch (error) {
    console.error('Error fetching place predictions:', error);
    searchSuggestions.value = [];
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
  }
}, 300);

function selectSuggestion(suggestion) {
  if (!suggestion) return;
  
  // Update search input
  mapSearchQuery.value = suggestion.description || '';
  showSearchSuggestions.value = false;
  searchSuggestions.value = [];
  selectedSuggestionIndex.value = -1;

  // Handle test suggestions
  if (suggestion.placeId && suggestion.placeId.startsWith('test-')) {
    if (formData.value) {
      // Extract the search term from the description
      const searchTerm = mapSearchQuery.value.split(' - Sample')[0];
      formData.value.addressLine1 = searchTerm || '';
      formData.value.city = 'Nairobi';
      formData.value.state = 'Nairobi County';
      formData.value.postalCode = '00100';
      formData.value.country = 'Kenya';
      
      // Set map position
      mapCenter.value = { lat: -1.2921, lng: 36.8219 };
      mapMarker.value = { lat: -1.2921, lng: 36.8219 };
    }
    return;
  }

  // Handle real Google Places suggestions
  if (window.google && window.google.maps) {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { placeId: suggestion.placeId },
      (results, status) => {
        if (status === 'OK' && results[0] && formData.value) {
          const result = results[0];
          const location = result.geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          // Update map center and marker
          mapCenter.value = { lat, lng };
          mapMarker.value = { lat, lng };
          
          // Parse address components and update form
          const addressComponents = result.address_components;
          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let postalCode = '';
          let country = '';
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (types.includes('country')) {
              country = component.long_name;
            }
          });
          
          // Always update all form data fields with the new address information
          formData.value.addressLine1 = streetNumber && route ? `${streetNumber} ${route}` : route;
          formData.value.city = city;
          formData.value.state = state;
          formData.value.postalCode = postalCode;
          formData.value.country = country;
          
          // Create new session token for the next search
          try {
            sessionToken = new google.maps.places.AutocompleteSessionToken();
          } catch (error) {
            console.error('Error creating new session token:', error);
          }
        }
      }
    );
  }
}

// Helper functions for search UI
function hideSearchSuggestions() {
  setTimeout(() => {
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
  }, 150);
}

function handleSearchFocus() {
  if (searchSuggestions.value.length > 0) {
    showSearchSuggestions.value = true;
    selectedSuggestionIndex.value = -1;
  }
}

function handleSearchBlur() {
  hideSearchSuggestions();
}

function handleSearchKeydown(event) {
  if (!showSearchSuggestions.value || searchSuggestions.value.length === 0) {
    if (event.key === 'Escape') {
      showSearchSuggestions.value = false;
      searchSuggestions.value = [];
      selectedSuggestionIndex.value = -1;
    }
    return;
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        searchSuggestions.value.length - 1
      );
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1);
      break;
      
    case 'Enter':
      event.preventDefault();
      if (selectedSuggestionIndex.value >= 0 && selectedSuggestionIndex.value < searchSuggestions.value.length) {
        selectSuggestion(searchSuggestions.value[selectedSuggestionIndex.value]);
      }
      break;
      
    case 'Escape':
      event.preventDefault();
      showSearchSuggestions.value = false;
      searchSuggestions.value = [];
      selectedSuggestionIndex.value = -1;
      break;
  }
}

function clearSearch() {
  mapSearchQuery.value = '';
  searchSuggestions.value = [];
  showSearchSuggestions.value = false;
  selectedSuggestionIndex.value = -1;
}

// Validation
function validateForm() {
  const errors = {};
  
  // Ensure formData is available
  if (!formData.value) {
    return false;
  }
  
  if (!formData.value.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!formData.value.type) {
    errors.type = 'Location type is required';
  }

  // Warehouse-specific validation
  if (formData.value.type === 'warehouse') {
    if (!formData.value.addressLine1?.trim()) {
      errors.addressLine1 = 'Address is required';
    }
    if (!formData.value.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.value.state?.trim()) {
      errors.state = 'State/Province is required';
    }
    if (!formData.value.postalCode?.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    if (!formData.value.country?.trim()) {
      errors.country = 'Country is required';
    }
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Form submission
async function handleSubmit() {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    // Create specific request payload based on type
    let requestPayload;
    
    switch (formData.value.type) {
      case 'warehouse':
        // CreateMainWarehouseRequest fields
        requestPayload = {
          code: formData.value.code,
          name: formData.value.name,
          description: formData.value.description,
          addressLine1: formData.value.addressLine1,
          addressLine2: formData.value.addressLine2,
          city: formData.value.city,
          state: formData.value.state,
          postalCode: formData.value.postalCode,
          country: formData.value.country,
          contactPerson: formData.value.contactPerson,
          contactPhone: formData.value.contactPhone,
          contactEmail: formData.value.contactEmail,
          isActive: formData.value.status === 'active',
          isMainWarehouse: formData.value.isMainWarehouse,
          locationType: 'WAREHOUSE'
        };
        break;
        
      case 'zone':
        // CreateZoneRequest fields
        requestPayload = {
          name: formData.value.name,
          code: formData.value.code,
          description: formData.value.description,
          locationType: 'ZONE',
          isActive: formData.value.status === 'active',
          maxCapacity: formData.value.maxCapacity ? Number(formData.value.maxCapacity) : undefined,
          currentCapacity: formData.value.currentCapacity || 0,
          pickable: false // Zones are typically not pickable
        };
        break;
        
      case 'aisle':
        // CreateAisleRequest fields
        requestPayload = {
          name: formData.value.name,
          code: formData.value.code,
          description: formData.value.description,
          locationType: 'AISLE',
          aisle: formData.value.aisleNumber || formData.value.code,
          isActive: formData.value.status === 'active',
          maxCapacity: formData.value.maxCapacity ? Number(formData.value.maxCapacity) : undefined,
          currentCapacity: formData.value.currentCapacity || 0,
          pickable: false // Aisles are typically not pickable
        };
        break;
        
      case 'bin':
        // CreateShelfRequest fields (bins are shelves in backend)
        requestPayload = {
          name: formData.value.name,
          code: formData.value.code,
          description: formData.value.description,
          locationType: 'SHELF', // Backend uses SHELF for storage bins
          aisle: formData.value.aisleNumber || props.parentLocation?.aisle || '',
          rowCode: formData.value.rowCode,
          isActive: formData.value.status === 'active',
          maxCapacity: formData.value.maxCapacity ? Number(formData.value.maxCapacity) : undefined,
          currentCapacity: formData.value.currentCapacity || 0,
          pickable: formData.value.pickable
        };
        break;
    }

    // For child locations (zones, aisles, bins), establish parent-child relationship
    if (props.parentLocation && formData.value.type !== 'warehouse') {
      // Extract numeric IDs from string identifiers (e.g., "zone-4" -> 4)
      const warehouseId = extractNumericId(props.parentLocation.warehouseId || props.parentLocation.id);
      const parentLocationId = extractNumericId(props.parentLocation.id);
      
      // Validate ID extraction was successful
      if (isNaN(warehouseId) || isNaN(parentLocationId)) {
        throw new Error('Invalid parent location data - could not extract numeric IDs');
      }
      
      // All child locations must reference their warehouse
      requestPayload.warehouseId = warehouseId;
      
      // Establish hierarchical relationship: zone -> warehouse, aisle -> zone, bin -> aisle
      requestPayload.parentLocationId = parentLocationId;
    }

    // Include ID for update operations
    if (!props.isCreating && props.location?.id) {
      requestPayload.id = props.location.id;
    }
    
    // Emit structured payload to parent component for API submission
    emit('location-saved', requestPayload);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
}

// Watch for changes in location prop
watch(
  () => props.location,
  (newLocation) => {
    if (newLocation && Object.keys(newLocation).length > 0) {
      formData.value = {
        id: newLocation.id || null,
        name: newLocation.name || '',
        type: newLocation.type || 'warehouse',
        code: newLocation.code || '',
        status: newLocation.status || 'active',
        description: newLocation.description || '',
        addressLine1: newLocation.addressLine1 || '',
        addressLine2: newLocation.addressLine2 || '',
        city: newLocation.city || '',
        state: newLocation.state || '',
        postalCode: newLocation.postalCode || '',
        country: newLocation.country || '',
        contactPerson: newLocation.contactPerson || '',
        contactPhone: newLocation.contactPhone || '',
        contactEmail: newLocation.contactEmail || '',
        isMainWarehouse: newLocation.isMainWarehouse || false,
        zonePurpose: newLocation.zonePurpose || '',
        aisleNumber: newLocation.aisleNumber || '',
        rowCode: newLocation.rowCode || '',
        binCode: newLocation.binCode || '',
        pickable: newLocation.pickable || false,
        maxCapacity: newLocation.maxCapacity || '',
        currentCapacity: newLocation.currentCapacity || 0,
        dimensions: {
          length: newLocation.dimensions?.length || '',
          width: newLocation.dimensions?.width || '',
          height: newLocation.dimensions?.height || '',
          unit: newLocation.dimensions?.unit || 'ft'
        }
      };
    }
  },
  { immediate: true }
);

// Click outside handler for search suggestions
function handleClickOutside(event) {
  if (searchInputRef.value && !searchInputRef.value.$el?.contains(event.target)) {
    showSearchSuggestions.value = false;
    selectedSuggestionIndex.value = -1;
  }
}
onMounted(async () => {
  await nextTick();
  
  // Add click outside listener for search suggestions
  document.addEventListener('click', handleClickOutside);
  
  // Initialize Google Maps services
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps?.places) {
        return resolve();
      }
      
      window.initGoogleMapsCallback = () => {
        resolve();
      };
      
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (existingScript) {
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&libraries=places&callback=initGoogleMapsCallback`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  };
  
  try {
    await loadGoogleMaps();
    sessionToken = new google.maps.places.AutocompleteSessionToken();
    autocompleteService = new google.maps.places.AutocompleteService();
    placesService = new google.maps.places.PlacesService(document.createElement('div'));
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
  }
  
  // Set initial map position if editing existing warehouse
  if (props.location && props.location.latitude && props.location.longitude) {
    const lat = parseFloat(props.location.latitude);
    const lng = parseFloat(props.location.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      mapCenter.value = { lat, lng };
      mapMarker.value = { lat, lng };
    }
  }
});

// Watch for type changes to reset map state
watch(
  () => formData.value.type,
  (newType) => {
    if (newType !== 'warehouse') {
      // Reset map state when switching away from warehouse
      mapMarker.value = { lat: null, lng: null };
      mapSearchQuery.value = '';
      searchSuggestions.value = [];
      showSearchSuggestions.value = false;
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside);
  
  // Clear search timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>