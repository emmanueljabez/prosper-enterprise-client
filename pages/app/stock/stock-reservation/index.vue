<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Stock Reservations</h2>
        <p class="text-muted-foreground">Manage inventory holds, cart reservations, and allocation policies</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ClockIcon class="h-4 w-4 mr-2" />
              Policies
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openHoldPolicyDialog">
              <TimerIcon class="h-4 w-4 mr-2" />
              Hold Duration Policies
            </DropdownMenuItem>
            <DropdownMenuItem @click="openCartPolicyDialog">
              <ShoppingCartIcon class="h-4 w-4 mr-2" />
              Cart Reservation Rules
            </DropdownMenuItem>
            <DropdownMenuItem @click="openAllocationDialog">
              <LayersIcon class="h-4 w-4 mr-2" />
              Allocation Priorities
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openCreateReservationDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active Holds</CardTitle>
          <ClockIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ reservationStats.activeHolds }}</div>
          <p class="text-xs text-muted-foreground">
            {{ reservationStats.expiringToday }} expiring today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Reserved Items</CardTitle>
          <PackageIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ reservationStats.itemsReserved }}</div>
          <p class="text-xs text-muted-foreground">
            {{ reservationStats.uniqueSkus }} unique SKUs
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Cart Reservations</CardTitle>
          <ShoppingCartIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ reservationStats.cartReservations }}</div>
          <p class="text-xs text-muted-foreground">
            {{ reservationStats.abandonedCarts }} abandoned
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Order Allocations</CardTitle>
          <ShoppingBagIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ reservationStats.orderAllocations }}</div>
          <p class="text-xs text-muted-foreground">
            {{ reservationStats.pendingAllocations }} pending
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Tabs for different reservation types -->
    <Tabs default-value="active" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="active">Active Holds</TabsTrigger>
        <TabsTrigger value="cart">Cart Reservations</TabsTrigger>
        <TabsTrigger value="orders">Order Allocations</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <ReservationTable 
          :reservations="activeReservations" 
          :loading="isLoadingReservations"
          @view-reservation="openReservationDetails"
          @extend-reservation="openExtendReservationDialog"
          @release-reservation="openReleaseConfirmation"
          @refresh="fetchReservations"
        />
      </TabsContent>
      
      <TabsContent value="cart">
        <CartReservationTable 
          :reservations="cartReservations" 
          :loading="isLoadingCartReservations"
          @view-cart="openCartDetails"
          @extend-cart="openExtendCartDialog"
          @release-cart="openReleaseCartConfirmation"
          @refresh="fetchCartReservations"
        />
      </TabsContent>
      
      <TabsContent value="orders">
        <OrderAllocationTable 
          :allocations="orderAllocations" 
          :loading="isLoadingAllocations"
          :locations="locations"
          @view-allocation="openAllocationDetails"
          @modify-allocation="openModifyAllocationDialog"
          @override-allocation="openOverrideAllocationDialog"
          @refresh="fetchOrderAllocations"
        />
      </TabsContent>
      
      <TabsContent value="history">
        <ReservationHistoryTable 
          :reservations="reservationHistory" 
          :loading="isLoadingHistory"
          @view-details="openHistoryDetails"
          @refresh="fetchReservationHistory"
        />
      </TabsContent>
    </Tabs>

    <!-- Create Reservation Dialog -->
    <Dialog v-model:open="showCreateReservationDialog">
      <CreateReservationDialog
        v-if="showCreateReservationDialog"
        :items="availableItems"
        :locations="locations"
        :holdPolicies="holdPolicies"
        @reservation-created="handleReservationCreated"
        @close="showCreateReservationDialog = false"
      />
    </Dialog>

    <!-- Reservation Details Dialog -->
    <Dialog v-model:open="showReservationDetailsDialog">
      <ReservationDetailsDialog
        v-if="showReservationDetailsDialog"
        :reservation="selectedReservation"
        @extend="openExtendReservationDialog"
        @release="openReleaseConfirmation"
        @close="showReservationDetailsDialog = false"
      />
    </Dialog>

    <!-- Extend Reservation Dialog -->
    <Dialog v-model:open="showExtendReservationDialog">
      <ExtendReservationDialog
        v-if="showExtendReservationDialog"
        :reservation="selectedReservation"
        :holdPolicies="holdPolicies"
        @reservation-extended="handleReservationExtended"
        @close="showExtendReservationDialog = false"
      />
    </Dialog>

    <!-- Hold Policy Dialog -->
    <Dialog v-model:open="showHoldPolicyDialog" class="sm:max-w-[900px]">
      <HoldPolicyDialog
        v-if="showHoldPolicyDialog"
        :policies="holdPolicies"
        @policies-updated="handlePoliciesUpdated"
        @close="showHoldPolicyDialog = false"
      />
    </Dialog>

    <!-- Cart Policy Dialog -->
    <Dialog v-model:open="showCartPolicyDialog" class="sm:max-w-[900px]">
      <CartPolicyDialog
        v-if="showCartPolicyDialog"
        :policies="cartPolicies"
        @policies-updated="handleCartPoliciesUpdated"
        @close="showCartPolicyDialog = false"
      />
    </Dialog>

    <!-- Allocation Dialog -->
    <Dialog v-model:open="showAllocationDialog" class="sm:max-w-[900px]">
      <AllocationPriorityDialog
        v-if="showAllocationDialog"
        :priorities="allocationPriorities"
        @priorities-updated="handlePrioritiesUpdated"
        @close="showAllocationDialog = false"
      />
    </Dialog>

    <!-- Release Confirmation Dialog -->
    <AlertDialog v-model:open="showReleaseConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release Reserved Stock</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to release this reservation? This will make the items available 
            for others to purchase or reserve. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showReleaseConfirmation = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmReleaseReservation">Release Stock</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Cart Details Dialog -->
    <Dialog v-model:open="showCartDetailsDialog">
      <ReservationDetailsDialog
        v-if="showCartDetailsDialog"
        :reservation="selectedCart"
        @extend="openExtendCartDialog"
        @release="openReleaseCartConfirmation"
        @close="showCartDetailsDialog = false"
      />
    </Dialog>

    <!-- Extend Cart Dialog -->
    <Dialog v-model:open="showExtendCartDialog">
      <ExtendReservationDialog
        v-if="showExtendCartDialog"
        :reservation="selectedCart"
        :holdPolicies="cartPolicies"
        @reservation-extended="handleCartExtended"
        @close="showExtendCartDialog = false"
      />
    </Dialog>

    <!-- Release Cart Confirmation Dialog -->
    <AlertDialog v-model:open="showReleaseCartConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Release Cart Items</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to release the items in this cart? This will make the items available
            for others to purchase. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showReleaseCartConfirmation = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmReleaseCart">Release Items</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Allocation Details Dialog -->
    <Dialog v-model:open="showAllocationDetailsDialog">
      <AllocationDetailsDialog
        v-if="showAllocationDetailsDialog"
        :allocation="selectedAllocation"
        @modify-allocation="openModifyAllocationDialog"
        @override-allocation="openOverrideAllocationDialog"
        @close="showAllocationDetailsDialog = false"
      />
    </Dialog>

    <!-- Modify Allocation Dialog -->
    <Dialog v-model:open="showModifyAllocationDialog">
      <ModifyAllocationDialog
        v-if="showModifyAllocationDialog"
        :allocation="selectedAllocation"
        :locations="locations"
        @allocation-modified="handleAllocationModified"
        @close="showModifyAllocationDialog = false"
      />
    </Dialog>

    <!-- Override Allocation Dialog -->
    <Dialog v-model:open="showOverrideAllocationDialog">
      <OverrideAllocationDialog
        v-if="showOverrideAllocationDialog"
        :allocation="selectedAllocation"
        :locations="locations"
        :availableInventory="availableInventory"
        @allocation-overridden="handleAllocationOverridden"
        @close="showOverrideAllocationDialog = false"
      />
    </Dialog>

    <!-- History Details Dialog -->
    <Dialog v-model:open="showHistoryDetailsDialog">
      <HistoryDetailsDialog
        v-if="showHistoryDetailsDialog"
        :reservation="selectedReservation"
        @export="handleExportHistory"
        @close="showHistoryDetailsDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, ClockIcon, ChevronDown, TimerIcon, ShoppingCartIcon, 
  LayersIcon, PackageIcon, ShoppingBagIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Components
import ReservationTable from '@/components/stock/reservation/ReservationTable.vue'
import CartReservationTable from '@/components/stock/reservation/CartReservationTable.vue'
import OrderAllocationTable from '@/components/stock/reservation/OrderAllocationTable.vue'
import ReservationHistoryTable from '@/components/stock/reservation/ReservationHistoryTable.vue'
import CreateReservationDialog from '@/components/stock/reservation/CreateReservationDialog.vue'
import ReservationDetailsDialog from '@/components/stock/reservation/ReservationDetailsDialog.vue'
import ExtendReservationDialog from '@/components/stock/reservation/ExtendReservationDialog.vue'
import HoldPolicyDialog from '@/components/stock/reservation/HoldPolicyDialog.vue'
import CartPolicyDialog from '@/components/stock/reservation/CartPolicyDialog.vue'
import AllocationPriorityDialog from '@/components/stock/reservation/AllocationPriorityDialog.vue'
import AllocationDetailsDialog from '@/components/stock/reservation/AllocationDetailsDialog.vue'
import ModifyAllocationDialog from '@/components/stock/reservation/ModifyAllocationDialog.vue'
import OverrideAllocationDialog from '@/components/stock/reservation/OverrideAllocationDialog.vue'
import HistoryDetailsDialog from '@/components/stock/reservation/HistoryDetailsDialog.vue'

// Stores
import { useReservationStore } from '@/store/modules/inventory/reservations'
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useLocationsStore } from '@/store/modules/inventory/locations'

// Initialize stores
const reservationStore = useReservationStore()
const itemsStore = useInventoryStore()
const locationsStore = useLocationsStore()
const { toast } = useToast()

// Access store state through computed properties
const activeReservations = computed(() => reservationStore.getActiveReservations)
const cartReservations = computed(() => reservationStore.getCartReservations)
const orderAllocations = computed(() => reservationStore.getOrderAllocations)
const reservationHistory = computed(() => reservationStore.getReservationHistory)
const holdPolicies = computed(() => reservationStore.getHoldPolicies)
const cartPolicies = computed(() => reservationStore.getCartPolicies)
const allocationPriorities = computed(() => reservationStore.getAllocationPriorities)
const reservationStats = computed(() => reservationStore.getReservationStats)

const availableItems = computed(() => itemsStore.getItems)
const locations = computed(() => locationsStore.getLocations)
const availableInventory = computed(() => itemsStore.getAvailableInventory)

const isLoadingReservations = computed(() => reservationStore.getIsLoadingReservations)
const isLoadingCartReservations = computed(() => reservationStore.getIsLoadingCartReservations)
const isLoadingAllocations = computed(() => reservationStore.getIsLoadingAllocations)
const isLoadingHistory = computed(() => reservationStore.getIsLoadingHistory)

// State management
const selectedReservation = ref(null)
const selectedCart = ref(null)
const selectedAllocation = ref(null)

// UI control
const showCreateReservationDialog = ref(false)
const showReservationDetailsDialog = ref(false)
const showExtendReservationDialog = ref(false)
const showHoldPolicyDialog = ref(false)
const showCartPolicyDialog = ref(false)
const showAllocationDialog = ref(false)
const showReleaseConfirmation = ref(false)
const showCartDetailsDialog = ref(false)
const showExtendCartDialog = ref(false)
const showReleaseCartConfirmation = ref(false)
const showAllocationDetailsDialog = ref(false)
const showModifyAllocationDialog = ref(false)
const showOverrideAllocationDialog = ref(false)
const showHistoryDetailsDialog = ref(false)

// Fetch data from APIs
const fetchReservations = async () => {
  try {
    await reservationStore.fetchReservations()
  } catch (error) {
    console.error('Error fetching reservations:', error)
    toast({
      title: 'Error',
      description: error.message || 'Failed to load reservations',
      variant: 'destructive'
    })
  }
}

const fetchCartReservations = async () => {
  try {
    await reservationStore.fetchCartReservations()
  } catch (error) {
    console.error('Error fetching cart reservations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load cart reservations',
      variant: 'destructive'
    })
  }
}

const fetchOrderAllocations = async () => {
  try {
    await reservationStore.fetchOrderAllocations()
  } catch (error) {
    console.error('Error fetching order allocations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load order allocations',
      variant: 'destructive'
    })
  }
}

const fetchReservationHistory = async () => {
  try {
    await reservationStore.fetchReservationHistory()
  } catch (error) {
    console.error('Error fetching reservation history:', error)
    toast({
      title: 'Error',
      description: 'Failed to load reservation history',
      variant: 'destructive'
    })
  }
}

const fetchHoldPolicies = async () => {
  try {
    await reservationStore.fetchHoldPolicies()
  } catch (error) {
    console.error('Error fetching hold policies:', error)
    toast({
      title: 'Error',
      description: 'Failed to load hold policies',
      variant: 'destructive'
    })
  }
}

const fetchItems = async () => {
  try {
    await itemsStore.fetchItems()
  } catch (error) {
    console.error('Error fetching items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory items',
      variant: 'destructive'
    })
  }
}

const fetchLocations = async () => {
  try {
    await locationsStore.fetchLocations()
  } catch (error) {
    console.error('Error fetching locations:', error)
    toast({
      title: 'Error',
      description: 'Failed to load locations',
      variant: 'destructive'
    })
  }
}

// Dialog handlers
const openCreateReservationDialog = () => {
  showCreateReservationDialog.value = true
}

const openReservationDetails = (reservation) => {
  selectedReservation.value = reservation
  showReservationDetailsDialog.value = true
}

const openExtendReservationDialog = (reservation) => {
  selectedReservation.value = reservation || selectedReservation.value
  showReservationDetailsDialog.value = false
  showExtendReservationDialog.value = true
}

const openReleaseConfirmation = (reservation) => {
  selectedReservation.value = reservation || selectedReservation.value
  showReservationDetailsDialog.value = false
  showReleaseConfirmation.value = true
}

const openHoldPolicyDialog = () => {
  showHoldPolicyDialog.value = true
}

const openCartPolicyDialog = () => {
  showCartPolicyDialog.value = true
}

const openAllocationDialog = () => {
  showAllocationDialog.value = true
}

const openCartDetails = (cart) => {
  selectedCart.value = cart
  showCartDetailsDialog.value = true
}

const openExtendCartDialog = (cart) => {
  selectedCart.value = cart
  showExtendCartDialog.value = true
}

const openReleaseCartConfirmation = (cart) => {
  selectedCart.value = cart
  showReleaseCartConfirmation.value = true
}

const openAllocationDetails = (allocation) => {
  selectedAllocation.value = allocation
  showAllocationDetailsDialog.value = true
}

const openModifyAllocationDialog = (allocation) => {
  selectedAllocation.value = allocation
  showModifyAllocationDialog.value = true
}

const openOverrideAllocationDialog = (allocation) => {
  selectedAllocation.value = allocation
  showOverrideAllocationDialog.value = true
}

const openHistoryDetails = (reservation) => {
  selectedReservation.value = reservation
  showHistoryDetailsDialog.value = true
}

// Action handlers
const handleReservationCreated = async (newReservation) => {
  try {
    await reservationStore.createReservation(newReservation)
    showCreateReservationDialog.value = false
    
    toast({
      title: 'Reservation Created',
      description: `Stock has been reserved successfully until ${new Date(newReservation.expiresAt).toLocaleDateString()}.`,
      variant: 'success'
    })
    
    await fetchReservations()
  } catch (error) {
    console.error('Error creating reservation:', error)
    toast({
      title: 'Error',
      description: 'Failed to create reservation. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleReservationExtended = async (reservation, newExpiryDate) => {
  try {
    await reservationStore.extendReservation(reservation.id, newExpiryDate)
    showExtendReservationDialog.value = false
    
    toast({
      title: 'Reservation Extended',
      description: `Hold has been extended until ${new Date(newExpiryDate).toLocaleDateString()}.`,
      variant: 'success'
    })
    
    await fetchReservations()
  } catch (error) {
    console.error('Error extending reservation:', error)
    toast({
      title: 'Error',
      description: 'Failed to extend reservation. Please try again.',
      variant: 'destructive'
    })
  }
}

const confirmReleaseReservation = async () => {
  try {
    await reservationStore.releaseReservation(selectedReservation.value.id)
    showReleaseConfirmation.value = false
    
    toast({
      title: 'Reservation Released',
      description: 'The reserved stock has been released and is now available.',
      variant: 'success'
    })
    
    await fetchReservations()
  } catch (error) {
    console.error('Error releasing reservation:', error)
    toast({
      title: 'Error',
      description: 'Failed to release reservation. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePoliciesUpdated = async (updatedPolicies) => {
  try {
    await reservationStore.updateHoldPolicies(updatedPolicies)
    showHoldPolicyDialog.value = false
    
    toast({
      title: 'Policies Updated',
      description: 'Hold duration policies have been updated successfully.',
      variant: 'success'
    })
    
    await fetchHoldPolicies()
  } catch (error) {
    console.error('Error updating hold policies:', error)
    toast({
      title: 'Error',
      description: 'Failed to update hold policies. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCartPoliciesUpdated = async (updatedPolicies) => {
  try {
    await reservationStore.updateCartPolicies(updatedPolicies)
    showCartPolicyDialog.value = false
    
    toast({
      title: 'Cart Policies Updated',
      description: 'Cart reservation policies have been updated successfully.',
      variant: 'success'
    })
    
    // Refresh policies
    await fetchHoldPolicies()
  } catch (error) {
    console.error('Error updating cart policies:', error)
    toast({
      title: 'Error',
      description: 'Failed to update cart policies. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePrioritiesUpdated = async (updatedPriorities) => {
  try {
    await reservationStore.updateAllocationPriorities(updatedPriorities)
    showAllocationDialog.value = false
    
    toast({
      title: 'Priorities Updated',
      description: 'Allocation priorities have been updated successfully.',
      variant: 'success'
    })
    
    // Refresh data
    await fetchHoldPolicies()
  } catch (error) {
    console.error('Error updating allocation priorities:', error)
    toast({
      title: 'Error',
      description: 'Failed to update allocation priorities. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleCartExtended = async (cart, newExpiryDate) => {
  try {
    await reservationStore.extendCartReservation(cart.id, newExpiryDate)
    showExtendCartDialog.value = false
    
    toast({
      title: 'Cart Extended',
      description: `Cart reservation has been extended until ${new Date(newExpiryDate).toLocaleDateString()}.`,
      variant: 'success'
    })
    
    await fetchCartReservations()
  } catch (error) {
    console.error('Error extending cart reservation:', error)
    toast({
      title: 'Error',
      description: 'Failed to extend cart reservation. Please try again.',
      variant: 'destructive'
    })
  }
}

const confirmReleaseCart = async () => {
  try {
    await reservationStore.releaseCartReservation(selectedCart.value.id)
    showReleaseCartConfirmation.value = false
    
    toast({
      title: 'Cart Items Released',
      description: 'The reserved items have been released and are now available.',
      variant: 'success'
    })
    
    await fetchCartReservations()
  } catch (error) {
    console.error('Error releasing cart items:', error)
    toast({
      title: 'Error',
      description: 'Failed to release cart items. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleAllocationModified = async (modificationData) => {
  try {
    await reservationStore.modifyAllocation(modificationData)
    showModifyAllocationDialog.value = false
    
    toast({
      title: 'Allocation Modified',
      description: 'The order allocation has been successfully modified.',
      variant: 'success'
    })
    
    await fetchOrderAllocations()
  } catch (error) {
    console.error('Error modifying allocation:', error)
    toast({
      title: 'Error',
      description: 'Failed to modify allocation. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleAllocationOverridden = async (overrideData) => {
  try {
    await reservationStore.overrideAllocation(overrideData)
    showOverrideAllocationDialog.value = false
    
    toast({
      title: 'Allocation Overridden',
      description: 'Manual allocation override has been applied successfully.',
      variant: 'success'
    })
    
    await fetchOrderAllocations()
  } catch (error) {
    console.error('Error overriding allocation:', error)
    toast({
      title: 'Error',
      description: 'Failed to override allocation. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleExportHistory = (reservation) => {
  // Implement export functionality here
  console.log('Exporting history for reservation:', reservation.reference)
  toast({
    title: 'Export Started',
    description: 'Reservation history export is being prepared.',
    variant: 'default'
  })
}

// Initialize component
onMounted(async () => {
  await Promise.all([
    fetchReservations(),
    fetchCartReservations(),
    fetchOrderAllocations(),
    fetchReservationHistory(),
    fetchHoldPolicies(),
    fetchItems(),
    fetchLocations()
  ])
})
</script>