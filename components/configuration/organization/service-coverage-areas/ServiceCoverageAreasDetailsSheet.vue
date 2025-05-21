<template>
  <SheetContent class="sm:max-w-md overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Service Area Details</SheetTitle>
      <SheetDescription>
        View service coverage area information
      </SheetDescription>
    </SheetHeader>

    <div v-if="serviceArea" class="py-6 space-y-6">
      <!-- Service Area Header -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-lg">{{ serviceArea.name }}</h3>
          <Badge :variant="getStatusVariant(serviceArea.status)">
            {{ formatStatus(serviceArea.status) }}
          </Badge>
        </div>

        <div v-if="serviceArea.description" class="space-y-2">
          <p class="text-sm text-muted-foreground">Description</p>
          <p>{{ serviceArea.description }}</p>
        </div>

        <!-- radius in km -->
        <div v-if="serviceArea.radius" class="space-y-2">
          <p class="text-sm text-muted-foreground">Coverage Radius</p>
          <p>{{ serviceArea.radius }} km</p>
        </div>

        <!-- Coordinates -->
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">Coordinates</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">Latitude</p>
              <p>{{ formatCoordinate(serviceArea.latitude) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Longitude</p>
              <p>{{ formatCoordinate(serviceArea.longitude) }}</p>
            </div>
          </div>
        </div>

        <!-- Map View -->
        <!-- Map View -->
        <div class="space-y-2 mt-4">
          <p class="text-sm text-muted-foreground">Location</p>
          <div class="h-60 w-full bg-muted rounded-md overflow-hidden relative">
            <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center">
              <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
              <span class="ml-2 text-sm text-muted-foreground">Loading map...</span>
            </div>
            <GoogleMap v-if="serviceArea && serviceArea.latitude && serviceArea.longitude"
              api-key="AIzaSyCwNhK0di7gxYMpNr5tnFuq_31eI9Fz1GA" :center="mapCenter" :zoom="13"
              style="width: 100%; height: 100%" :options="googleMapOptions">
              <Marker :options="{
                position: {
                  lat: serviceArea.latitude,
                  lng: serviceArea.longitude
                }
              }" />
              <CircleComponent v-if="serviceArea.radius" :options="{
                center: {
                  lat: serviceArea.latitude,
                  lng: serviceArea.longitude
                },
                radius: serviceArea.radius * 1000,
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#4285F4',
                fillOpacity: 0.2
              }" />
            </GoogleMap>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p class="text-sm text-muted-foreground">Created Date</p>
            <p>{{ formatDate(serviceArea.created) }}</p>
          </div>
          <div v-if="serviceArea.updated">
            <p class="text-sm text-muted-foreground">Last Updated</p>
            <p>{{ formatDate(serviceArea.updated) }}</p>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Products using this area (if available) -->
      <div class="space-y-3" v-if="hasProducts">
        <h3 class="font-medium">Assigned Products</h3>
        <div class="grid grid-cols-1 gap-2">
          <div v-for="product in serviceArea.products" :key="product.id" class="p-2 bg-muted rounded-md">
            <p class="font-medium">{{ product.name }}</p>
            <p class="text-xs text-muted-foreground">{{ product.type }}</p>
          </div>
          <div v-if="serviceArea.products?.length === 0" class="text-sm text-muted-foreground">
            No products are currently using this service area.
          </div>
        </div>
      </div>

      <!-- Coverage Statistics (if any) -->
      <div v-if="hasCoverage" class="space-y-3">
        <Separator />
        <h3 class="font-medium">Coverage Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="serviceArea.radius">
            <p class="text-sm text-muted-foreground">Coverage Radius</p>
            <p class="font-medium">{{ serviceArea.radius }} km</p>
          </div>
          <div v-if="serviceArea.population">
            <p class="text-sm text-muted-foreground">Population</p>
            <p class="font-medium">{{ serviceArea.population }}</p>
          </div>
          <div v-if="serviceArea.households">
            <p class="text-sm text-muted-foreground">Households</p>
            <p class="font-medium">{{ serviceArea.households }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 mt-6">
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
      <Button variant="outline" @click="openDirections" class="hidden sm:flex">
        <MapPinIcon class="h-4 w-4 mr-2" />
        Directions
      </Button>
      <Button variant="default" @click="$emit('edit-serviceArea', serviceArea)">
        <EditIcon class="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { GoogleMap, Marker, Circle as CircleComponent } from 'vue3-google-map'
import { format, parseISO } from 'date-fns'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EditIcon, MapPinIcon, Loader2Icon } from 'lucide-vue-next'

const props = defineProps({
  serviceArea: {
    type: Object,
    default: null
  }
})

defineEmits(['edit-serviceArea', 'close'])

// Map references
const mapContainer = ref(null)
const mapLoaded = ref(true)
let map = null
let marker = null

const googleMapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: true,
  fullscreenControl: false
}

const mapCenter = computed(() => ({
  lat: props.serviceArea?.latitude || -1.286389,
  lng: props.serviceArea?.longitude || 36.817223
}))


// Check if the service area has product data
const hasProducts = computed(() => {
  return props.serviceArea && props.serviceArea.products !== undefined
})

// Check if the service area has coverage data
const hasCoverage = computed(() => {
  return props.serviceArea &&
    (props.serviceArea.radius !== undefined ||
      props.serviceArea.population !== undefined ||
      props.serviceArea.households !== undefined)
})

// Initialize the map
onMounted(() => {
  if (props.serviceArea && props.serviceArea.latitude && props.serviceArea.longitude) {
    // Check if leaflet is available globally
    if (window.L) {
      initMap();
    } else {
      // Load Leaflet dynamically if not available
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }
});

// Clean up map instance
onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
    marker = null;
  }
});

// Initialize the map
function initMap() {
  if (!props.serviceArea || !mapContainer.value) return;

  const lat = props.serviceArea.latitude;
  const lng = props.serviceArea.longitude;

  // Create map
  map = L.map(mapContainer.value).setView([lat, lng], 13);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add marker
  marker = L.marker([lat, lng]).addTo(map);

  // Add circle if radius is defined
  if (props.serviceArea.radius) {
    const radiusInMeters = props.serviceArea.radius * 1000; // Convert km to meters
    L.circle([lat, lng], {
      radius: radiusInMeters,
      color: 'blue',
      fillColor: '#30c',
      fillOpacity: 0.2
    }).addTo(map);
  }

  mapLoaded.value = true;
}

// Open directions in Google Maps
function openDirections() {
  if (props.serviceArea && props.serviceArea.latitude && props.serviceArea.longitude) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${props.serviceArea.latitude},${props.serviceArea.longitude}`;
    window.open(url, '_blank');
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(new Date(dateString), 'MMM dd, yyyy')
}

function formatStatus(status) {
  if (!status) return ''
  return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

function formatCoordinate(coord) {
  if (coord === null || coord === undefined) return 'N/A'
  return coord.toFixed(6)
}

function getStatusVariant(status) {
  if (!status) return 'default'

  const statusUpper = status.toUpperCase()
  if (statusUpper === 'ACTIVE') return 'success'
  if (statusUpper === 'INACTIVE') return 'secondary'
  if (statusUpper === 'PLANNED') return 'warning'
  return 'default'
}
</script>
