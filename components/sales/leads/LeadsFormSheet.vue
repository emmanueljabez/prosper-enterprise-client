<template>
  <SheetContent class="sm:max-w-lg flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>{{ mode === 'add' ? 'New Lead' : 'Edit Lead' }}</SheetTitle>
      <SheetDescription>
        {{ mode === 'add' ? 'Create a new sales lead.' : 'Update lead details.' }}
        Required fields are marked with an asterisk (*).
      </SheetDescription>
    </SheetHeader>

    <div class="flex-1 overflow-y-auto py-6 px-1">
      <form @submit.prevent="submitLead" class="space-y-6">
        <!-- Lead Type Selection -->
        <div class="space-y-3">
          <Label>Lead Type <span class="text-destructive">*</span></Label>
          <RadioGroup v-model="formData.leadType" class="flex space-x-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="INDIVIDUAL" id="individual" />
              <Label for="individual">Individual</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="BUSINESS" id="business" />
              <Label for="business">Business</Label>
            </div>
          </RadioGroup>
          <p v-if="errors.leadType" class="text-sm text-destructive">{{ errors.leadType }}</p>
        </div>

        <!-- Lead Details -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Lead Details</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">First Name <span class="text-destructive">*</span></Label>
              <Input id="firstName" v-model="formData.firstName" :class="{ 'border-destructive': errors.firstName }" />
              <p v-if="errors.firstName" class="text-sm text-destructive">{{ errors.firstName }}</p>
            </div>

            <div class="space-y-2">
              <Label for="lastName">Last Name <span class="text-destructive">*</span></Label>
              <Input id="lastName" v-model="formData.lastName" :class="{ 'border-destructive': errors.lastName }" />
              <p v-if="errors.lastName" class="text-sm text-destructive">{{ errors.lastName }}</p>
            </div>
          </div>

          <div v-if="formData.leadType === 'BUSINESS'" class="space-y-2">
            <Label for="companyName">Company Name <span class="text-destructive">*</span></Label>
            <Input id="companyName" v-model="formData.companyName"
              :class="{ 'border-destructive': errors.companyName }" />
            <p v-if="errors.companyName" class="text-sm text-destructive">{{ errors.companyName }}</p>
          </div>

          <div class="space-y-2">
            <Label for="email">Email Address <span class="text-destructive">*</span></Label>
            <Input id="email" v-model="formData.email" type="email" :class="{ 'border-destructive': errors.email }" />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="phone">Phone Number <span class="text-destructive">*</span></Label>
            <Input id="phone" v-model="formData.phone" placeholder="+254 7XX XXX XXX"
              :class="{ 'border-destructive': errors.phone }" />
            <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
          </div>
        </div>

        <!-- Address Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Address Information</h3>

          <div class="space-y-2">
            <Label for="streetLine1">Street Address <span class="text-destructive">*</span></Label>
            <Input id="streetLine1" v-model="formData.address.streetLine1"
              :class="{ 'border-destructive': errors.streetLine1 }" />
            <p v-if="errors.streetLine1" class="text-sm text-destructive">{{ errors.streetLine1 }}</p>
          </div>

          <div class="space-y-2">
            <Label for="streetLine2">Street Address 2</Label>
            <Input id="streetLine2" v-model="formData.address.streetLine2" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="postalCode">Postal Code</Label>
              <Input id="postalCode" v-model="formData.address.postalCode" />
            </div>

            <div class="space-y-2">
              <Label for="country-select">Country <span class="text-destructive">*</span></Label>
              <Select id="country-select" v-model="selectedCountryCode"
                :class="{ 'border-destructive': errors.country }">
                <SelectTrigger>
                  <SelectValue :placeholder="selectedCountry || 'Select country'" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="country in countries" :key="country.isoCode" :value="country.isoCode">
                    {{ country.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.country" class="text-sm text-destructive">{{ errors.country }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city-select">City/Town <span class="text-destructive">*</span></Label>
              <Select id="city-select" v-model="formData.address.city" :disabled="!selectedCountryCode"
                :class="{ 'border-destructive': errors.city }">
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="city in availableCities" :key="city.name" :value="city.name">
                    {{ city.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.city" class="text-sm text-destructive">{{ errors.city }}</p>
            </div>
          </div>


        </div>

        <!-- Source & Products -->
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="sourceId">Lead Source <span class="text-destructive">*</span></Label>
            <Select v-model="formData.sourceId" :class="{ 'border-destructive': errors.sourceId }">
              <SelectTrigger id="sourceId">
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="source in leadSources" :key="source.id" :value="source.id">
                  {{ source.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.sourceId" class="text-sm text-destructive">{{ errors.sourceId }}</p>
          </div>

          <div class="space-y-2">
            <Label for="products">Products</Label>
            <div class="border rounded-md p-3 bg-muted/30">
              <p v-if="props.products.length === 0" class="text-sm text-muted-foreground">
                No products available. Please add products first.
              </p>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="product in props.products" :key="product.id" class="flex items-center space-x-2">
                  <Checkbox :id="`product-${product.id}`" v-model:checked="selectedProducts[product.id]" />
                  <Label :for="`product-${product.id}`" class="text-sm">{{ product.name }}</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

         <!-- coverage areas/territory -->
         <div class="space-y-4">
          <h3 class="text-sm font-medium">Territory</h3>
          <Select 
            v-model="formData.territoryId" 
            :class="{ 'border-destructive': errors.territoryId }"
            @update:modelValue="handleTerritoryChange"
          >
            <SelectTrigger id="territoryId">
              <SelectValue placeholder="Select coverage area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="area in serviceAreas" :key="area.id" :value="area.id">
                {{ area.name }} ({{ area.radius }}km radius)
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.territoryId" class="text-sm text-destructive">{{ errors.territoryId }}</p>
        </div>

        <!-- coordinates -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium">Location</h3>
          <div class="space-y-2">
            <Label>Search Location</Label>
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
          
          <div class="space-y-2">
            <Label>Select Location on Map</Label>
            <p class="text-xs text-muted-foreground" v-if="selectedTerritory">
              Lead must be within {{ selectedTerritory.name }} coverage area ({{ selectedTerritory.radius }}km radius)
            </p>
            <div class="h-[300px] w-full bg-muted rounded-md overflow-hidden relative">
              <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center">
                <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
                <span class="ml-2 text-sm text-muted-foreground">Loading map...</span>
              </div>
              <GoogleMap 
                api-key="AIzaSyCwNhK0di7gxYMpNr5tnFuq_31eI9Fz1GA" 
                :center="mapCenter" 
                :zoom="13"
                style="width: 100%; height: 100%" 
                :options="googleMapOptions" 
                @click="handleMapClick"
              >
                <!-- Lead marker -->
                <Marker 
                  :options="{
                    position: {
                      lat: formData.address.latitude || 0.0236,
                      lng: formData.address.longitude || 37.9062
                    },
                    draggable: true,
                    icon: {
                      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }
                  }" 
                  @dragend="handleMarkerDragend"
                />
                
                <!-- Territory marker with radius circle -->
                <Marker 
                  v-if="selectedTerritory"
                  :options="{
                    position: {
                      lat: selectedTerritory.latitude,
                      lng: selectedTerritory.longitude
                    },
                    draggable: false,
                    icon: {
                      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }
                  }"
                />
                
                <!-- Territory radius circle -->
                <CircleComponent 
                  v-if="selectedTerritory"
                  :options="{
                    center: {
                      lat: selectedTerritory.latitude,
                      lng: selectedTerritory.longitude
                    },
                    radius: selectedTerritory.radius * 1000,
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#4285F4',
                    fillOpacity: 0.2
                  }"
                />
              </GoogleMap>
            </div>
            
            <div class="flex space-x-2 mt-2">
              <Button type="button" variant="outline" size="sm" @click="centerMapOnCurrentLocation">
                <MapPinIcon class="h-4 w-4 mr-2" />
                Use My Location
              </Button>
              <Button type="button" variant="outline" size="sm" @click="centerMapOnTerritory" v-if="selectedTerritory">
                <MapPinIcon class="h-4 w-4 mr-2" />
                Center on Territory
              </Button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="latitude">Latitude</Label>
              <Input id="latitude" v-model="formData.address.latitude" type="number" :class="{ 'border-destructive': errors.coordinates }" />
            </div>
            <div class="space-y-2">
              <Label for="longitude">Longitude</Label>
              <Input id="longitude" v-model="formData.address.longitude" type="number" :class="{ 'border-destructive': errors.coordinates }" />
            </div>
          </div>
          <p v-if="errors.coordinates" class="text-sm text-destructive">{{ errors.coordinates }}</p>
          <p v-if="outsideTerritory" class="text-sm text-destructive">Lead location is outside the selected territory's coverage area</p>
        </div>

       

      </form>
    </div>

    <!-- Fixed footer with buttons -->
    <div class="border-t p-4 flex justify-end space-x-2 flex-shrink-0 bg-background">
      <Button type="button" variant="outline" @click="handleClose">
        Cancel
      </Button>
      <Button type="submit" @click="submitLead" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        {{ mode === 'add' ? 'Create Lead' : 'Update Lead' }}
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Country, State, City } from 'country-state-city'
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2Icon, MapPinIcon, SearchIcon } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    validator: (value) => ['add', 'edit'].includes(value),
    default: 'add'
  },
  lead: {
    type: Object,
    default: null
  },
  serviceAreas: {
    type: Array,
    default: () => []
  },
  leadSources: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'lead-added',
  'lead-updated',
  'close',
  'update:open'
])

// Form state
const isSubmitting = ref(false)
const errors = ref({})
const mapLoaded = ref(false)
const searchInput = ref(null)
const selectedProducts = ref({})
const selectedCountryCode = ref('KE') // Default to Kenya
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const outsideTerritory = ref(false)

// Google Maps services
let sessionToken = null
let autocompleteService = null
let placesService = null

// Initialize form data
const formData = ref({
  leadType: 'INDIVIDUAL',
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  territoryId: null,
  sourceId: null,
  address: {
    streetLine1: '',
    streetLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: null,
    longitude: null
  }
})

// If editing, populate form with lead data
if (props.mode === 'edit' && props.lead) {
  formData.value = {
    ...props.lead,
    address: props.lead.address || {
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: null,
      longitude: null
    }
  }
  
  // Set selected country
  if (props.lead.address?.country) {
    selectedCountryCode.value = props.lead.address.country
  }
  
  // Set selected products
  if (props.lead.products && props.lead.products.length > 0) {
    props.lead.products.forEach(product => {
      selectedProducts.value[product.id] = true
    })
  }
}

// Map configuration
const googleMapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: true,
  fullscreenControl: false
}

// Computed properties
const selectedTerritory = computed(() => {
  if (!formData.value.territoryId) return null
  return props.serviceAreas.find(area => area.id === formData.value.territoryId)
})

const mapCenter = computed(() => {
  if (formData.value.address.latitude && formData.value.address.longitude) {
    return {
      lat: parseFloat(formData.value.address.latitude),
      lng: parseFloat(formData.value.address.longitude)
    }
  } else if (selectedTerritory.value) {
    return {
      lat: selectedTerritory.value.latitude,
      lng: selectedTerritory.value.longitude
    }
  } else {
    return { lat: 0.0236, lng: 37.9062 } 
  }
})

const countries = computed(() => {
  return Country.getAllCountries()
})

const availableCities = computed(() => {
  if (!selectedCountryCode.value) return []
  return City.getCitiesOfCountry(selectedCountryCode.value) || []
})

const selectedCountry = computed(() => {
  if (!selectedCountryCode.value) return null
  const country = Country.getCountryByCode(selectedCountryCode.value)
  return country ? country.name : null
})

// Handle territory selection
function handleTerritoryChange(territoryId) {
  const territory = props.serviceAreas.find(area => area.id === territoryId)
  if (territory) {
    // If no lead coordinates exist, center the lead at the territory center
    if (!formData.value.address.latitude || !formData.value.address.longitude) {
      formData.value.address.latitude = territory.latitude
      formData.value.address.longitude = territory.longitude
    } else {
      // Check if lead is within territory radius
      checkLeadInTerritory()
    }
  }
}

// Check if lead is within selected territory
function checkLeadInTerritory() {
  if (!selectedTerritory.value || !formData.value.address.latitude || !formData.value.address.longitude) {
    outsideTerritory.value = false
    return true
  }
  
  // Calculate distance between lead and territory center
  const R = 6371 // Earth radius in kilometers
  const lat1 = selectedTerritory.value.latitude * Math.PI / 180
  const lat2 = parseFloat(formData.value.address.latitude) * Math.PI / 180
  const lon1 = selectedTerritory.value.longitude * Math.PI / 180
  const lon2 = parseFloat(formData.value.address.longitude) * Math.PI / 180
  
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  // Check if distance is within territory radius
  outsideTerritory.value = distance > selectedTerritory.value.radius
  return !outsideTerritory.value
}

// Map event handlers
function handleMapClick(e) {
  formData.value.address.latitude = e.latLng.lat()
  formData.value.address.longitude = e.latLng.lng()
  checkLeadInTerritory()
}

function handleMarkerDragend(e) {
  formData.value.address.latitude = e.latLng.lat()
  formData.value.address.longitude = e.latLng.lng()
  checkLeadInTerritory()
}

function centerMapOnCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        formData.value.address.latitude = position.coords.latitude
        formData.value.address.longitude = position.coords.longitude
        checkLeadInTerritory()
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Could not get your location. Please check your permissions.")
      }
    )
  } else {
    alert("Geolocation is not supported by this browser.")
  }
}

function centerMapOnTerritory() {
  if (selectedTerritory.value) {
    formData.value.address.latitude = selectedTerritory.value.latitude
    formData.value.address.longitude = selectedTerritory.value.longitude

    setTimeout(() => {
      formData.value.address.latitude = formData.value.address.latitude
      formData.value.address.longitude = formData.value.address.longitude
    }, 10)
  }
}

// Handle search input with debounce
const handleSearchInput = debounce(async () => {
  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }
  
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps Places API not available')
    return
  }
  
  if (!sessionToken) {
    try {
      sessionToken = new google.maps.places.AutocompleteSessionToken()
    } catch (error) {
      console.error('Error creating session token:', error)
      return
    }
  }
  
  if (!autocompleteService) {
    try {
      autocompleteService = new google.maps.places.AutocompleteService()
      placesService = new google.maps.places.PlacesService(document.createElement('div'))
    } catch (error) {
      console.error('Error initializing Places services:', error)
      return
    }
  }
  
  try {
    const request = {
      input: searchQuery.value,
      sessionToken: sessionToken,
      // types: ['address', 'establishment'],
      componentRestrictions: selectedCountryCode.value ? { country: selectedCountryCode.value } : undefined
    }
    
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
  } catch (error) {
    console.error('Error fetching place predictions:', error)
  }
}, 300)

// Select a place from search results
function selectSearchResult(result) {
  searchQuery.value = result.description
  showSearchResults.value = false
  
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not available')
    return
  }
  
  try {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode(
      { placeId: result.placeId },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location
          formData.value.address.latitude = location.lat()
          formData.value.address.longitude = location.lng()
          
          // Update address components
          const addressComponents = results[0].address_components
          for (const component of addressComponents) {
            if (component.types.includes('street_number') || component.types.includes('route')) {
              formData.value.address.streetLine1 = (formData.value.address.streetLine1 || '') + ' ' + component.long_name
            } else if (component.types.includes('locality')) {
              formData.value.address.city = component.long_name
            } else if (component.types.includes('postal_code')) {
              formData.value.address.postalCode = component.long_name
            } else if (component.types.includes('country')) {
              formData.value.address.country = component.short_name
              selectedCountryCode.value = component.short_name
            }
          }
          
          formData.value.address.streetLine1 = formData.value.address.streetLine1?.trim()
          
          // Check if lead is within territory radius
          checkLeadInTerritory()
          
          // Create a new session token for the next search
          sessionToken = new google.maps.places.AutocompleteSessionToken()
        }
      }
    )
  } catch (error) {
    console.error('Error getting place details:', error)
  }
}

// Close search results when clicking outside
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

// Validate form
function validateForm() {
  const newErrors = {}

  if (!formData.value.leadType) {
    newErrors.leadType = 'Lead type is required'
  }

  if (!formData.value.firstName?.trim()) {
    newErrors.firstName = 'First name is required'
  }

  if (!formData.value.lastName?.trim()) {
    newErrors.lastName = 'Last name is required'
  }

  if (formData.value.leadType === 'BUSINESS' && !formData.value.companyName?.trim()) {
    newErrors.companyName = 'Company name is required'
  }

  if (!formData.value.email?.trim()) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  }

  if (!formData.value.phone?.trim()) {
    newErrors.phone = 'Phone number is required'
  }

  if (!formData.value.address.streetLine1?.trim()) {
    newErrors.streetLine1 = 'Street address is required'
  }

  if (!formData.value.address.city?.trim()) {
    newErrors.city = 'City is required'
  }

  if (!formData.value.address.country?.trim()) {
    newErrors.country = 'Country is required'
  }

  if (!formData.value.sourceId) {
    newErrors.sourceId = 'Lead source is required'
  }

  if (!formData.value.territoryId) {
    newErrors.territoryId = 'Territory is required'
  }

  // Validate coordinates
  if (!formData.value.address.latitude || !formData.value.address.longitude) {
    newErrors.coordinates = 'Location coordinates are required'
  }
  
  // Check if lead is within territory
  if (formData.value.territoryId && 
      formData.value.address.latitude && 
      formData.value.address.longitude && 
      outsideTerritory.value) {
    newErrors.coordinates = 'Lead must be within the selected territory coverage area'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit form
async function submitLead() {
  if (!validateForm() || isSubmitting.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Prepare form data
    const leadData = {
      ...formData.value,
      // Convert selected products to array of IDs
      productIds: Object.entries(selectedProducts.value)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => parseInt(id))
    }
    
    // Call appropriate emit based on mode
    if (props.mode === 'add') {
      emit('lead-added', leadData)
    } else {
      emit('lead-updated', leadData)
    }
    
    handleClose()
  } catch (error) {
    console.error('Error submitting lead:', error)
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  emit('close')
  emit('update:open', false)
  
  // Reset form after a short delay
  setTimeout(() => {
    formData.value = {
      leadType: 'INDIVIDUAL',
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      phone: '',
      territoryId: null,
      sourceId: null,
      address: {
        streetLine1: '',
        streetLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        latitude: null,
        longitude: null
      }
    }
    selectedProducts.value = {}
    selectedCountryCode.value = 'KE'
    errors.value = {}
    outsideTerritory.value = false
  }, 300)
}

// Watch for changes in territory selection
watch(() => formData.value.territoryId, (newTerritoryId) => {
  if (newTerritoryId) {
    handleTerritoryChange(newTerritoryId)
  }
})

// Watch for changes in lead coordinates
watch([() => formData.value.address.latitude, () => formData.value.address.longitude], () => {
  if (formData.value.address.latitude && formData.value.address.longitude) {
    checkLeadInTerritory()
  }
})

// Watch for country selection and update address country
watch(selectedCountryCode, (newCountryCode) => {
  if (newCountryCode) {
    formData.value.address.country = newCountryCode
  }
})

// Initialize Google Maps services safely
function initializeGoogleMapsServices() {
  try {
    if (!window.google?.maps?.places) {
      return
    }
    
    sessionToken = new google.maps.places.AutocompleteSessionToken()
    autocompleteService = new google.maps.places.AutocompleteService()
    placesService = new google.maps.places.PlacesService(document.createElement('div'))
  } catch (error) {
    console.error('Error initializing Google Maps services:', error)
  }
}

// Load Google Maps and initialize
onMounted(async () => {
  await nextTick()
  
  // Add click outside listener
  document.addEventListener('click', onClickOutside)
  
  // Create a promise to properly handle Maps API loading
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      // If already loaded
      if (window.google?.maps?.places) {
        return resolve()
      }
      
      // Define global callback for when Maps API loads
      window.initGoogleMapsCallback = () => {
        resolve()
      }
      
      // Check if the script is already added
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]')
      if (existingScript) {
        return // Let the callback handle it
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCwNhK0di7gxYMpNr5tnFuq_31eI9Fz1GA&libraries=places&callback=initGoogleMapsCallback`
      script.async = true
      script.defer = true
      
      script.onerror = (error) => {
        reject(error)
      }
      
      document.head.appendChild(script)
    })
  }
  
  try {
    await loadGoogleMaps()
    // Only initialize services and show map after API is fully loaded
    initializeGoogleMapsServices()
    mapLoaded.value = true
  } catch (error) {
    console.error('Failed to load Google Maps:', error)
  }
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>