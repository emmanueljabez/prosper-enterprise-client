<template>
  <div class="rounded-md border h-[600px] overflow-hidden relative">
    <!-- Mock Map - In real implementation, integrate with Leaflet, Google Maps, etc. -->
    <div class="h-full w-full bg-gray-100 relative">
      <!-- This is a placeholder for a real map -->
      <div class="absolute inset-0 bg-slate-100 flex items-center justify-center">
        <div class="text-muted-foreground">
          Map would display here in a real implementation
        </div>
      </div>

      <!-- Overlays representing outages -->
      <div
          v-for="outage in safeOutages"
          :key="outage.id"
          class="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center cursor-pointer"
          :style="getPositionStyle(outage)"
          @click="$emit('select-outage', outage)"
      >
        <div
            class="animate-ping absolute h-4 w-4 rounded-full opacity-75"
            :class="{
            'bg-red-500': outage.severity === 'critical',
            'bg-amber-500': outage.severity === 'major',
            'bg-blue-500': outage.severity === 'minor',
            'bg-purple-500': outage.severity === 'degraded'
          }"
        ></div>
        <div
            class="relative rounded-full h-3 w-3"
            :class="{
            'bg-red-500': outage.severity === 'critical',
            'bg-amber-500': outage.severity === 'major',
            'bg-blue-500': outage.severity === 'minor',
            'bg-purple-500': outage.severity === 'degraded'
          }"
        ></div>
      </div>

      <!-- Overlays representing maintenance events -->
      <div
          v-for="maintenance in safeMaintenanceEvents"
          :key="maintenance.id"
          class="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center cursor-pointer"
          :style="getPositionStyle(maintenance)"
          @click="$emit('select-maintenance', maintenance)"
      >
        <div class="bg-white rounded-full p-0.5">
          <WrenchIcon class="h-4 w-4" :class="{
            'text-blue-500': maintenance.status === 'scheduled',
            'text-amber-500': maintenance.status === 'in_progress' || maintenance.status === 'delayed',
            'text-green-500': maintenance.status === 'completed',
            'text-gray-500': maintenance.status === 'cancelled'
          }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { WrenchIcon } from 'lucide-vue-next'

const props = defineProps({
  outages: {
    type: Array,
    default: () => []
  },
  maintenanceEvents: {
    type: Array,
    default: () => []
  },
  mapCenter: {
    type: Object,
    default: () => ({latitude: -1.286389, longitude: 36.817223}) // Default to Nairobi, Kenya
  },
  mapZoomFactor: {
    type: Number,
    default: 100 // Adjust based on your needs
  }
})

defineEmits(['select-outage', 'select-maintenance'])

// Filter out outages without valid coordinates
const safeOutages = computed(() => {
  return props.outages.filter(outage =>
      outage &&
      typeof outage.latitude === 'number' &&
      typeof outage.longitude === 'number'
  )
})

// Filter out maintenance events without valid coordinates
const safeMaintenanceEvents = computed(() => {
  return props.maintenanceEvents.filter(maintenance =>
      maintenance &&
      typeof maintenance.latitude === 'number' &&
      typeof maintenance.longitude === 'number'
  )
})

// Get safe map center coordinates
const safeMapCenter = computed(() => {
  const defaultCenter = {latitude: -1.286389, longitude: 36.817223}
  if (!props.mapCenter) return defaultCenter

  return {
    latitude: typeof props.mapCenter.latitude === 'number' ? props.mapCenter.latitude : defaultCenter.latitude,
    longitude: typeof props.mapCenter.longitude === 'number' ? props.mapCenter.longitude : defaultCenter.longitude
  }
})

// Calculate position style safely
function getPositionStyle(item) {
  // Ensure we have valid coordinates
  if (!item || typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
    return {display: 'none'}
  }

  // Use safe map center
  const center = safeMapCenter.value

  return {
    left: `${50 + (item.longitude - center.longitude) * props.mapZoomFactor}%`,
    top: `${50 - (item.latitude - center.latitude) * props.mapZoomFactor}%`
  }
}
</script>