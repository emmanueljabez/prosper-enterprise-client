<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Barcode Scanner</DialogTitle>
      <DialogDescription>
        {{ getScanDescription() }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-6 py-4">
      <!-- Scanner Mode Selector -->
      <div class="space-y-2">
        <Label>Scan Mode</Label>
        <div class="flex flex-wrap gap-2">
          <Button 
            v-for="mode in scanModes" 
            :key="mode.value"
            :variant="scanMode === mode.value ? 'default' : 'outline'"
            size="sm"
            @click="scanMode = mode.value"
          >
            <component :is="mode.icon" class="h-4 w-4 mr-2" />
            {{ mode.label }}
          </Button>
        </div>
      </div>
      
      <!-- Camera Scanner (when available) -->
      <div v-if="cameraSupported" class="space-y-2">
        <div class="flex items-center justify-between">
          <Label>Camera Scanner</Label>
          <Switch v-model="usingCamera" />
        </div>
        
        <div v-if="usingCamera" class="relative aspect-video rounded-md border overflow-hidden bg-muted">
          <div v-if="!scannerReady" class="absolute inset-0 flex items-center justify-center">
            <Loader2Icon class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          <video 
            ref="videoElement" 
            class="h-full w-full object-cover"
            :class="{ 'opacity-0': !scannerReady }"
          ></video>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div class="w-64 h-64 border-2 border-primary opacity-70 relative">
              <!-- Scanner corner highlights -->
              <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
              <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
              <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
            </div>
            <p v-if="scannerReady" class="text-xs text-white mt-2 bg-black/50 px-2 py-1 rounded">
              Center the barcode in the box
            </p>
          </div>
        </div>
      </div>
      
      <!-- Manual Entry -->
      <div class="space-y-2">
        <Label for="barcode-input">{{ usingCamera ? 'Or Enter Manually' : 'Enter Barcode' }}</Label>
        <div class="flex space-x-2">
          <Input 
            id="barcode-input" 
            v-model="barcodeInput" 
            placeholder="Enter SKU or barcode"
            @keydown.enter="handleManualSubmit"
          />
          <Button 
            type="button" 
            @click="handleManualSubmit"
            :disabled="!barcodeInput"
          >
            <SearchIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <!-- Location Selector (for certain modes) -->
      <div v-if="needsLocation" class="space-y-2">
        <Label for="location-select">{{ getLocationLabel() }}</Label>
        <Select v-model="selectedLocation">
          <SelectTrigger id="location-select">
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup v-for="group in locationGroups" :key="group.type">
              <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
              <SelectItem 
                v-for="location in group.locations" 
                :key="location.id" 
                :value="location.id"
              >
                {{ location.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Scanned Items -->
      <div v-if="scannedItems.length > 0" class="space-y-2">
        <Label>Scanned Items</Label>
        <div class="max-h-40 overflow-y-auto rounded-md border divide-y">
          <div 
            v-for="(item, index) in scannedItems" 
            :key="index"
            class="flex items-center justify-between p-2 text-sm"
          >
            <div class="flex items-center">
              <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
              <div>
                <div class="font-medium">{{ item.name || 'Unknown Item' }}</div>
                <div class="text-xs text-muted-foreground">{{ item.barcode }}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" @click="removeScannedItem(index)">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Alert v-if="scanError" variant="destructive">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {{ scanError }}
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <div class="flex w-full justify-between sm:justify-end gap-2">
        <Button variant="outline" @click="$emit('close')">
          Cancel
        </Button>
        <Button 
          @click="handleComplete"
          :disabled="!canComplete"
        >
          {{ getActionButtonText() }}
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  AlertCircleIcon, 
  CheckIcon, 
  DownloadIcon, 
  ListChecksIcon, 
  Loader2Icon, 
  MoveHorizontalIcon, 
  SearchIcon, 
  UploadIcon, 
  XIcon 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const props = defineProps({
  scanMode: {
    type: String,
    default: 'receive',
    validator: (value) => ['receive', 'issue', 'transfer', 'count'].includes(value)
  },
  locations: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'item-scanned'])

// State
const scanModes = [
  { value: 'receive', label: 'Receive', icon: DownloadIcon },
  { value: 'issue', label: 'Issue', icon: UploadIcon },
  { value: 'transfer', label: 'Transfer', icon: MoveHorizontalIcon },
  { value: 'count', label: 'Count', icon: ListChecksIcon }
]
const barcodeInput = ref('')
const scanError = ref('')
const scannedItems = ref([])
const selectedLocation = ref('')
const scanMode = ref(props.scanMode)

// Camera-related state
const cameraSupported = ref(typeof navigator !== 'undefined' && 'mediaDevices' in navigator)
const usingCamera = ref(false)
const videoElement = ref(null)
const scannerReady = ref(false)
const scanner = ref(null)

// Computed properties
const needsLocation = computed(() => {
  return ['issue', 'transfer', 'count'].includes(scanMode.value)
})

const locationGroups = computed(() => {
  // Filter active locations
  const filteredLocations = props.locations.filter(location => location.isActive)
  
  // Get relevant locations based on scan mode
  let relevantLocations = filteredLocations
  if (scanMode.value === 'issue') {
    relevantLocations = filteredLocations.filter(loc => loc.type !== 'customer')
  } else if (scanMode.value === 'receive') {
    relevantLocations = filteredLocations.filter(loc => loc.type !== 'supplier')
  }
  
  // Group locations by type
  const groups = {}
  relevantLocations.forEach(location => {
    const type = location.type || 'other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(location)
  })

  // Convert to array format for SelectGroup
  return Object.entries(groups).map(([type, locations]) => ({
    type,
    locations
  }))
})

const canComplete = computed(() => {
  if (scannedItems.value.length === 0) return false
  if (needsLocation.value && !selectedLocation.value) return false
  return true
})

// Methods
const getScanDescription = () => {
  switch (scanMode.value) {
    case 'receive':
      return 'Scan items to receive into inventory'
    case 'issue':
      return 'Scan items to issue out of inventory'
    case 'transfer':
      return 'Scan items to transfer between locations'
    case 'count':
      return 'Scan items for inventory count'
    default:
      return 'Scan barcodes to identify items'
  }
}

const getLocationLabel = () => {
  switch (scanMode.value) {
    case 'issue':
      return 'Source Location'
    case 'transfer':
      return 'Source Location'
    case 'count':
      return 'Count Location'
    default:
      return 'Location'
  }
}

const getActionButtonText = () => {
  switch (scanMode.value) {
    case 'receive':
      return 'Receive Items'
    case 'issue':
      return 'Issue Items'
    case 'transfer':
      return 'Transfer Items'
    case 'count':
      return 'Count Items'
    default:
      return 'Continue'
  }
}

const formatLocationType = (type) => {
  switch (type) {
    case 'warehouse': return 'Warehouses'
    case 'store': return 'Stores'
    case 'zone': return 'Zones'
    case 'supplier': return 'Suppliers'
    case 'customer': return 'Customers'
    case 'other': return 'Other Locations'
    default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }
}

const handleManualSubmit = async () => {
  if (!barcodeInput.value) return
  
  try {
    scanError.value = ''
    // In a real application, you would validate the code against your inventory
    // For now, we'll simulate finding an item
    const found = await findItemByCode(barcodeInput.value)
    
    if (found) {
      addScannedItem(found)
      barcodeInput.value = ''
    } else {
      scanError.value = `Item with code "${barcodeInput.value}" not found`
    }
  } catch (error) {
    console.error('Error scanning item:', error)
    scanError.value = 'Failed to process barcode. Please try again.'
  }
}

const findItemByCode = async (code) => {
  // This would normally be an API call to search for an item by barcode/SKU
  // For demonstration purposes, we'll create a dummy item
  return {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    name: `Item (${code})`,
    barcode: code,
    // Add other relevant item information
  }
}

const addScannedItem = (item) => {
  // Check if item is already scanned
  const exists = scannedItems.value.some(i => i.barcode === item.barcode)
  if (!exists) {
    scannedItems.value.push(item)
  }
}

const removeScannedItem = (index) => {
  scannedItems.value.splice(index, 1)
}

const handleComplete = () => {
  if (!canComplete.value) return
  
  // Prepare result object with scanned items and location
  const result = {
    items: scannedItems.value,
    location: selectedLocation.value,
    mode: scanMode.value
  }
  
  // Emit the result to the parent component
  emit('item-scanned', result)
}

// Camera Scanner Functions
const initScanner = async () => {
  if (!cameraSupported.value || !usingCamera.value || !videoElement.value) return
  
  try {
    scannerReady.value = false
    
    // Access camera
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    
    // Set up video element
    videoElement.value.srcObject = stream
    videoElement.value.play()
    
    // In a real implementation, you would now initialize a barcode scanning library
    // For example, using Quagga.js, ZXing, or a similar library
    
    // Simulate scanner initialization
    setTimeout(() => {
      scannerReady.value = true
      startScanning()
    }, 1000)
    
  } catch (error) {
    console.error('Error accessing camera:', error)
    usingCamera.value = false
    scanError.value = 'Could not access camera. Please check permissions or enter barcode manually.'
  }
}

const startScanning = () => {
  // In a real implementation, this would start the barcode detection process
  // For demonstration purposes, we'll simulate finding barcodes at random intervals
  
  // This would be replaced with actual barcode detection code
  const simulateScan = () => {
    // Only simulate scans while camera is active
    if (!usingCamera.value) return
    
    // Generate random barcode for demonstration
    const randomBarcode = 'ITEM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    // Process the "scanned" barcode
    findItemByCode(randomBarcode).then(item => {
      addScannedItem(item)
    })
  }
  
  // Simulate finding a barcode after 3 seconds
  setTimeout(simulateScan, 3000)
}

const stopScanner = () => {
  if (!videoElement.value) return
  
  // Stop camera stream
  const stream = videoElement.value.srcObject
  if (stream) {
    const tracks = stream.getTracks()
    tracks.forEach(track => track.stop())
    videoElement.value.srcObject = null
  }
  
  // Reset scanner state
  scannerReady.value = false
  
  // If using a real barcode scanning library, you would clean it up here
}

// Lifecycle hooks
onMounted(() => {
  if (usingCamera.value) {
    initScanner()
  }
})

onBeforeUnmount(() => {
  stopScanner()
})

// Watch for changes in camera usage
watch(usingCamera, (newValue) => {
  if (newValue) {
    initScanner()
  } else {
    stopScanner()
  }
})
</script>