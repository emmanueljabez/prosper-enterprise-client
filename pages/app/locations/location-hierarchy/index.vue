<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Location Hierarchy</h2>
        <p class="text-muted-foreground">Manage your warehouses, zones, aisles, and storage bins</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileDownIcon class="h-4 w-4 mr-2" />
              Export
              <ChevronDownIcon class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportLocations('csv')">
              <FileTextIcon class="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportLocations('pdf')">
              <FileIcon class="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportLocations('excel')">
              <TableIcon class="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openCreateLocationDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>
    </div>

    <!-- Location Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Total Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ warehouseCount }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Across {{ locationStats.sites || 0 }} sites
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Storage Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ locationStats.zones || 0 }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ zoneUtilization }}% space utilization
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Total Bins</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ locationStats.bins || 0 }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ emptyBins }} bins available
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Inventory Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ inventoryCoverage }}%</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ locationStats.itemsStored || 0 }} items stored
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Location Hierarchy Viewer -->
    <LocationHierarchyViewer
      :locations="locations"
      :is-loading="isLoading"
      @view-location="handleViewLocation"
      @edit-location="handleEditLocation"
      @delete-location="handleDeleteLocation"
      @create-location="handleCreateSubLocation"
      @print-labels="handlePrintLabels"
      @assign-items="handleAssignItems"
    />

    <!-- Location Details Dialog -->
    <Dialog v-model:open="showLocationDetailsDialog">
      <LocationDetailsDialog
        v-if="showLocationDetailsDialog"
        :location="selectedLocation"
        @edit-location="openEditLocationDialog"
        @delete-location="openDeleteLocationDialog"
        @create-location="handleCreateSubLocation"
        @close="showLocationDetailsDialog = false"
        @assign-items="openAssignItemsDialog"
      />
    </Dialog>

    <!-- Create/Edit Location Sheet -->
    <Sheet v-model:open="showLocationForm">
      <LocationFormSheet
        v-if="showLocationForm"
        :location="locationToEdit"
        :parent-locations="locations"
        :is-creating="isCreatingLocation"
        @location-saved="handleLocationSaved"
        @close="showLocationForm = false"
      />
    </Sheet>

    <!-- Delete Location Dialog -->
    <Dialog v-model:open="showDeleteLocationDialog">
      <DeleteLocationDialog
        v-if="showDeleteLocationDialog"
        :location="selectedLocation"
        @delete="handleLocationDeleted"
        @close="showDeleteLocationDialog = false"
      />
    </Dialog>

    <!-- Assign Items Dialog -->
    <Dialog v-model:open="showAssignItemsDialog">
      <AssignItemsDialog
        v-if="showAssignItemsDialog"
        :location="selectedLocation"
        @items-assigned="handleItemsAssigned"
        @close="showAssignItemsDialog = false"
      />
    </Dialog>

    <!-- Print Labels Dialog -->
    <Dialog v-model:open="showPrintLabelsDialog">
      <PrintLocationLabelsDialog
        v-if="showPrintLabelsDialog"
        :location="selectedLocation"
        :include-children="true"
        @close="showPrintLabelsDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileDownIcon, ChevronDownIcon, FileTextIcon,
  FileIcon, TableIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

// Components
import LocationHierarchyViewer from '@/components/warehouse/locations/LocationHierarchyViewer.vue'
import LocationDetailsDialog from '@/components/warehouse/locations/LocationDetailsDialog.vue'
import LocationFormSheet from '@/components/warehouse/locations/LocationFormSheet.vue'
import DeleteLocationDialog from '@/components/warehouse/locations/DeleteLocationDialog.vue'
import AssignItemsDialog from '@/components/warehouse/locations/AssignItemsDialog.vue'
import PrintLocationLabelsDialog from '@/components/warehouse/locations/PrintLocationLabelsDialog.vue'

// Stores
import { useLocationsStore } from '@/store/modules/inventory/locations'

// Initialize stores
const locationsStore = useLocationsStore()
const { toast } = useToast()

// Access store state through computed properties
const locations = computed(() => locationsStore.getLocations)
const locationStats = computed(() => locationsStore.getLocationStats)
const isLoading = computed(() => locationsStore.getIsLoading)
const error = computed(() => locationsStore.getError)

// Derived stats
const warehouseCount = computed(() => 
  locations.value.filter(loc => loc.type === 'warehouse').length
)
const zoneUtilization = computed(() => 
  Math.round((locationStats.value.zonesInUse / locationStats.value.zones) * 100) || 0
)
const emptyBins = computed(() => 
  locationStats.value.bins - locationStats.value.binsInUse || 0
)
const inventoryCoverage = computed(() => 
  Math.round((locationStats.value.itemsStored / locationStats.value.totalCapacity) * 100) || 0
)

// State management
const selectedLocation = ref(null)
const isCreatingLocation = ref(false)
const showLocationDetails = ref(false)
const showLocationForm = ref(false)
const locationToEdit = ref({})

// Parent location options for form selector
const parentLocationOptions = computed(() => {
  return [
    { id: null, name: 'None (Top Level)', type: 'root' },
    ...locations.value
      .filter(loc => loc.type !== 'bin') // Bins can't have children
      .map(loc => ({
        id: loc.id,
        name: `${loc.name} (${loc.type})`,
        type: loc.type
      }))
  ]
})

// UI control
const showLocationDetailsDialog = ref(false)
const showLocationFormSheet = ref(false)
const showDeleteLocationDialog = ref(false)
const showAssignItemsDialog = ref(false)
const showPrintLabelsDialog = ref(false)

// Fetch data from API
const fetchLocations = async () => {
  try {
    await locationsStore.fetchLocations()
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load locations. Please try again.',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openLocationDetails = (location) => {
  selectedLocation.value = location
  showLocationDetailsDialog.value = true
}

const openCreateLocationDialog = (parentLocation = null) => {
  selectedLocation.value = parentLocation ? { parentId: parentLocation.id } : null
  isCreatingLocation.value = true
  showLocationForm.value = true
}

const openEditLocationDialog = (location) => {
  locationToEdit.value = { ...location }
  isCreatingLocation.value = false
  showLocationDetails.value = false
  showLocationForm.value = true
}

const openDeleteLocationDialog = (location) => {
  selectedLocation.value = location
  showDeleteLocationDialog.value = true
}

const openAssignItemsDialog = (location) => {
  selectedLocation.value = location
  showAssignItemsDialog.value = true
}

const openPrintLabelsDialog = (location) => {
  selectedLocation.value = location
  showPrintLabelsDialog.value = true
}

// CRUD operation handlers
const handleLocationSaved = async (locationData) => {
  try {
    if (isCreatingLocation.value) {
      await locationsStore.createLocation(locationData)
      toast({
        title: 'Location Created',
        description: `${locationData.name} has been created successfully.`,
        variant: 'success'
      })
    } else {
      await locationsStore.updateLocation(locationData)
      toast({
        title: 'Location Updated',
        description: `${locationData.name} has been updated successfully.`,
        variant: 'success'
      })
    }
    
    showLocationForm.value = false
    await fetchLocations()
  } catch (error) {
    console.error('Error saving location:', error)
    toast({
      title: 'Error',
      description: 'Failed to save location. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleLocationDeleted = async (location) => {
  try {
    await locationsStore.deleteLocation(location.id)
    showDeleteLocationDialog.value = false
    
    toast({
      title: 'Location Deleted',
      description: `${location.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchLocations()
  } catch (error) {
    console.error('Error deleting location:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete location. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleItemsAssigned = async (location, items) => {
  try {
    await locationsStore.assignItemsToLocation(location.id, items)
    showAssignItemsDialog.value = false
    
    toast({
      title: 'Items Assigned',
      description: `${items.length} items assigned to ${location.name}.`,
      variant: 'success'
    })
    
    await fetchLocations()
  } catch (error) {
    console.error('Error assigning items:', error)
    toast({
      title: 'Error',
      description: 'Failed to assign items. Please try again.',
      variant: 'destructive'
    })
  }
}

// Create sub-location with pre-filled parent information
const handleCreateSubLocation = (parentLocation) => {
  console.log('Creating sub-location for:', parentLocation.name); // Debug log
  
  // Set up the new location with the parent pre-selected
  locationToEdit.value = {
    type: getNextLocationType(parentLocation.type),
    parentId: parentLocation.id,
    status: 'active',
    dimensions: {
      unit: parentLocation.dimensions?.unit || 'ft'
    },
    attributes: {}
  };
  
  isCreatingLocation.value = true;
  showLocationForm.value = true; // This is key - it opens the form
}

// Helper function to determine the appropriate child location type
const getNextLocationType = (parentType) => {
  switch (parentType) {
    case 'warehouse':
      return 'zone';
    case 'zone':
      return 'aisle';
    case 'aisle':
      return 'bin';
    default:
      return 'bin';
  }
}

// Export locations in different formats
const exportLocations = (format) => {
  toast({
    title: 'Export Started',
    description: `Exporting locations as ${format.toUpperCase()}...`,
    variant: 'default'
  })
  
  // Simulate export process
  setTimeout(() => {
    toast({
      title: 'Export Complete',
      description: `Locations exported as ${format.toUpperCase()} successfully.`,
      variant: 'success'
    })
  }, 1500)
}

// Initialize component
onMounted(() => {
  fetchLocations()
})
</script>