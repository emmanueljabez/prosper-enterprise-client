<template>
  <SheetContent class="sm:max-w-md overflow-y-auto">
    <SheetHeader>
      <SheetTitle>{{ mode === 'add' ? 'New Service Area' : 'Edit Service Area' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Create a new service coverage area.' : 'Update service area details.' }}
      </SheetDescription>
    </SheetHeader>

    <form @submit.prevent="submitServiceArea" class="space-y-6 py-6">
      <div class="space-y-4">
        <!-- Name -->
        <div class="space-y-2">
          <Label for="name" required>Name</Label>
          <Input id="name" v-model="formData.name" placeholder="Neighborhood, City, Region name" required
            :class="{ 'border-destructive': errors.name }" />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="formData.description" placeholder="Details about this service area"
            rows="3" />
        </div>

        <!-- Radius in Km -->
        <div class="space-y-2">
          <Label for="radius" required>Radius (Km)</Label>
          <Input id="radius" v-model="formData.radius" type="number" step="any" placeholder="5.0" required
            :class="{ 'border-destructive': errors.radius }" />
          <p v-if="errors.radius" class="text-sm text-destructive">{{ errors.radius }}</p>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <Label for="status" required>Status</Label>
          <Select v-model="formData.status" required>
            <SelectTrigger id="status" :class="{ 'border-destructive': errors.status }">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="NOT_ACTIVE">Inactive</SelectItem>
              <SelectItem value="PLANNED">Planned</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
        </div>

        <!-- Coordinates Section -->
        <div class="space-y-2">
          <Label>Coordinates</Label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="latitude" required class="text-xs">Latitude</Label>
              <Input id="latitude" v-model="formData.latitude" type="number" step="any" placeholder="-1.45" required
                :class="{ 'border-destructive': errors.latitude }" readonly />
              <p v-if="errors.latitude" class="text-sm text-destructive">{{ errors.latitude }}</p>
            </div>
            <div>
              <Label for="longitude" required class="text-xs">Longitude</Label>
              <Input id="longitude" v-model="formData.longitude" type="number" step="any" placeholder="36.983333"
                required :class="{ 'border-destructive': errors.longitude }" readonly />
              <p v-if="errors.longitude" class="text-sm text-destructive">{{ errors.longitude }}</p>
            </div>
          </div>
        </div>

        <!-- Map Component -->
        <div class="space-y-2">
          <Label>Location Map</Label>
          <p class="text-xs text-muted-foreground">Search on the map to set coordinates or drag the marker.</p>

          <div class="space-y-2">
            <div class="relative">
              <Input 
                ref="searchInput"
                id="map-search" 
                v-model="searchQuery"
                placeholder="Search for a location" 
                class="pr-10"
                @input="handleSearchInput"
              />
              <SearchIcon class="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
              
              <!-- Search results dropdown -->
              <div v-if="searchResults.length > 0 && showSearchResults" 
                class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                <div v-for="(result, index) in searchResults" :key="index"
                  class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  @click="selectSearchResult(result)">
                  <MapPinIcon class="mr-2 h-4 w-4 shrink-0 opacity-70" />
                  <span>{{ result.description }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="h-60 w-full bg-muted rounded-md overflow-hidden relative">
            <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center">
              <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
              <span class="ml-2 text-sm text-muted-foreground">Loading map...</span>
            </div>
            <GoogleMap api-key="AIzaSyCwNhK0di7gxYMpNr5tnFuq_31eI9Fz1GA" :center="mapCenter" :zoom="13"
              style="width: 100%; height: 100%" :options="googleMapOptions" @click="handleMapClick">
              <Marker v-if="formData.latitude && formData.longitude" :options="{
                position: {
                  lat: formData.latitude,
                  lng: formData.longitude
                },
                draggable: true
              }" @dragend="(e) => {
                formData.latitude = e.latLng.lat();
                formData.longitude = e.latLng.lng();
              }" />
              <CircleComponent v-if="formData.latitude && formData.longitude && formData.radius" :options="{
                center: {
                  lat: formData.latitude,
                  lng: formData.longitude
                },
                radius: formData.radius * 1000,
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#4285F4',
                fillOpacity: 0.2
              }" />
            </GoogleMap>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" @click="centerMapOnCurrentLocation" class="mt-2">
          <MapPinIcon class="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-2">
        <Button type="button" variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
          {{ mode === 'add' ? 'Create Service Area' : 'Update Service Area' }}
        </Button>
      </div>
    </form>
  </SheetContent>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { GoogleMap, Marker, Circle as CircleComponent } from 'vue3-google-map'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon, MapPinIcon, SearchIcon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value)
  },
  serviceArea: {
    type: Object,
    default: null
  },
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'serviceArea-added',
  'serviceArea-updated',
  'close',
  'update:open'
])

// Form state
const isSubmitting = ref(false)
const errors = ref({})
const mapLoaded = ref(false)
const searchInput = ref(null)
let autocompleteService = null
let placesService = null

// Search state
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
let sessionToken = null

// Map configuration
const googleMapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: true,
  fullscreenControl: false
}

// Initialize form data
const formData = ref({
  name: '',
  description: '',
  status: 'ACTIVE',
  radius: null,
  latitude: null,
  longitude: null
})

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    status: 'ACTIVE',
    radius: null,
    latitude: null,
    longitude: null
  }
  errors.value = {}
  isSubmitting.value = false
}

// If editing, populate form with service area data
if (props.mode === 'edit' && props.serviceArea) {
  formData.value = {
    name: props.serviceArea.name,
    description: props.serviceArea.description || '',
    status: props.serviceArea.status,
    radius: props.serviceArea.radius || null,
    latitude: props.serviceArea.latitude,
    longitude: props.serviceArea.longitude
  }
}

const mapCenter = computed(() => ({
  lat: formData.value.latitude || -1.286389,
  lng: formData.value.longitude || 36.817223
}))

function handleMapClick(e) {
  formData.value.latitude = e.latLng.lat()
  formData.value.longitude = e.latLng.lng()
}

function centerMapOnCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        formData.value.latitude = lat;
        formData.value.longitude = lng;
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please check your permissions.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Handle search input with debounce
const handleSearchInput = debounce(async () => {
  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }
  
  if (!sessionToken) {
    sessionToken = new google.maps.places.AutocompleteSessionToken()
  }
  
  if (!autocompleteService && window.google && window.google.maps && window.google.maps.places) {
    autocompleteService = new google.maps.places.AutocompleteService()
    placesService = new google.maps.places.PlacesService(document.createElement('div'))
  }
  
  if (!autocompleteService) {
    console.error('Places service not available')
    return
  }
  
  try {
    const request = {
      input: searchQuery.value,
      sessionToken: sessionToken,
      // types: ['geocode'],
      componentRestrictions: { country: 'KE' } 
    }
    
    if (autocompleteService && window.google?.maps?.places) {
      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
          searchResults.value = []
          showSearchResults.value = false
          return
        }
        
        searchResults.value = predictions.map(prediction => ({
          placeId: prediction.place_id,
          description: prediction.description
        }))
        
        showSearchResults.value = true
      })
    }
  } catch (error) {
    console.error('Error fetching place predictions:', error)
  }
}, 300)

function selectSearchResult(result) {
  searchQuery.value = result.description
  showSearchResults.value = false
  
  if (window.google && window.google.maps && window.google.maps.places) {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode(
      { placeId: result.placeId },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location
          formData.value.latitude = location.lat()
          formData.value.longitude = location.lng()
          
          sessionToken = new google.maps.places.AutocompleteSessionToken()
        }
      }
    )
  }
}

function onClickOutside(event) {
  if (searchInput.value && !searchInput.value.$el?.contains(event.target)) {
    showSearchResults.value = false
  }
}

// Debounce helper function
function debounce(fn, delay) {
  let timeout
  return function(...args) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
}


onMounted(async () => {
  await nextTick();
  
  document.addEventListener('click', onClickOutside);
  
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCwNhK0di7gxYMpNr5tnFuq_31eI9Fz1GA&libraries=places&callback=initGoogleMapsCallback`;
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
    mapLoaded.value = true;
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      mapLoaded.value = true;
      if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.trigger(document.querySelector('.google-map'), 'resize');
      }
    }, 300);
  }
});

// Validate form
function validateForm() {
  const newErrors = {}

  if (!formData.value.name || formData.value.name.trim() === '') {
    newErrors.name = 'Name is required'
  }

  if (!formData.value.status) {
    newErrors.status = 'Status is required'
  }

  if (formData.value.latitude === null || formData.value.latitude === undefined) {
    newErrors.latitude = 'Latitude is required'
  }

  if (formData.value.longitude === null || formData.value.longitude === undefined) {
    newErrors.longitude = 'Longitude is required'
  }

  if (formData.value.radius === null || formData.value.radius === undefined) {
    newErrors.radius = 'Radius is required'
  } else if (isNaN(formData.value.radius) || formData.value.radius <= 0) {
    newErrors.radius = 'Radius must be a positive number'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit form
async function submitServiceArea() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const formPayload = {
      name: formData.value.name,
      description: formData.value.description,
      status: formData.value.status,
      radius: parseFloat(formData.value.radius),
      latitude: parseFloat(formData.value.latitude),
      longitude: parseFloat(formData.value.longitude)
    };

    if (props.mode === 'add') {
      emit('serviceArea-added', formPayload)
    } else {
      emit('serviceArea-updated', {
        id: props.serviceArea.id,
        ...formPayload
      })
    }

    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error submitting service area:', error)
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>