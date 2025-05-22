<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Reorder Automation</h2>
        <p class="text-muted-foreground">Configure threshold-based reorder rules and monitor pending reorders</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="openReorderSettingsDialog">
          <SettingsIcon class="h-4 w-4 mr-2" />
          Reorder Settings
        </Button>
        <Button @click="openCreateRuleDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Reorder Rule
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <ReorderStatCards :stats="reorderStats" />

    <!-- Filters -->
    <ReorderFilters 
      v-model:status="filters.status"
      v-model:location="filters.location"
      v-model:category="filters.category"
      v-model:threshold-type="filters.thresholdType"
      :locations="locations"
      :categories="categories"
      @filter-change="fetchReorderRules"
    />

    <!-- Tabs -->
    <Tabs default-value="rules" class="w-full">
      <TabsList class="grid w-full md:w-auto grid-cols-2">
        <TabsTrigger value="rules" class="flex items-center space-x-2">
          <ListTodoIcon class="h-4 w-4" />
          <span>Reorder Rules</span>
        </TabsTrigger>
        <TabsTrigger value="suggested" class="flex items-center space-x-2">
          <BarChart class="h-4 w-4" />
          <span>Suggested Reorders</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="rules" class="mt-6 space-y-6">
        <ReorderRulesTable 
          :rules="filteredReorderRules"
          :categories="categories" 
          :locations="locations"
          :loading="isLoadingRules"
          @edit-rule="openEditRuleDialog"
          @delete-rule="openDeleteRuleDialog"
          @toggle-status="toggleRuleStatus"
          @refresh="fetchReorderRules"
        />
      </TabsContent>
      
      <TabsContent value="suggested" class="mt-6 space-y-6">
        <SuggestedReordersTable 
          :suggested-reorders="suggestedReorders"
          :categories="categories" 
          :locations="locations"
          :loading="isLoadingSuggestions"
          @create-order="handleCreateOrder"
          @ignore-suggestion="handleIgnoreSuggestion"
          @unignore-suggestion="handleUnignoreSuggestion"
          @view-item="handleViewItemDetails"
          @view-location="handleViewLocationStock"
          @view-rule="handleViewRule"
          @refresh="fetchSuggestedReorders"
        />
      </TabsContent>
    </Tabs>

    <!-- Create/Edit Rule Dialog -->
    <Dialog v-model:open="showCreateRuleDialog">
      <ReorderRuleDialog
        v-if="showCreateRuleDialog"
        :edit-mode="editMode" 
        :rule="selectedRule"
        :categories="categories"
        :locations="locations"
        :items="inventoryItems"
        @save-rule="handleSaveRule"
        @close="showCreateRuleDialog = false"
      />
    </Dialog>

    <!-- Delete Rule Dialog -->
    <AlertDialog v-model:open="showDeleteRuleDialog">
      <AlertDialogContent v-if="showDeleteRuleDialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Reorder Rule</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this reorder rule? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteRuleDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleDeleteRule">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Reorder Settings Dialog -->
    <Dialog v-model:open="showReorderSettingsDialog">
      <ReorderSettingsDialog 
        v-if="showReorderSettingsDialog"
        :settings="reorderSettings"
        @save-settings="handleSaveSettings" 
        @close="showReorderSettingsDialog = false" 
      />
    </Dialog>

    <!-- Create Order From Suggestion -->
    <Dialog v-model:open="showCreateOrderDialog">
      <CreateOrderDialog
        v-if="showCreateOrderDialog"
        :suggested-reorder="selectedSuggestion"
        :locations="locations"
        :suppliers="suppliers"
        @create-order="handleOrderCreated"
        @close="showCreateOrderDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  SettingsIcon,
  ListTodoIcon,
  BarChart 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Component imports
import ReorderStatCards from '@/components/inventory/reorder/ReorderStatCards.vue'
import ReorderFilters from '@/components/inventory/reorder/ReorderFilters.vue'
import ReorderRulesTable from '@/components/inventory/reorder/ReorderRulesTable.vue'
import SuggestedReordersTable from '@/components/inventory/reorder/SuggestedReordersTable.vue'
import ReorderRuleDialog from '@/components/inventory/reorder/ReorderRuleDialog.vue'
import ReorderSettingsDialog from '@/components/inventory/reorder/ReorderSettingsDialog.vue'
import CreateOrderDialog from '@/components/inventory/reorder/CreateOrderDialog.vue'

// Store imports
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useLocationsStore } from '@/store/modules/inventory/locations'
import { useCategoriesStore } from '@/store/modules/catalog/categories'
import { useSuppliersStore } from '@/store/modules/inventory/suppliers'

// Initialize stores
const inventoryStore = useInventoryStore()
const locationsStore = useLocationsStore()
const categoriesStore = useCategoriesStore()
const suppliersStore = useSuppliersStore()
const { toast } = useToast()

// Access store state through computed properties
const inventoryItems = computed(() => {
  const items = inventoryStore.getInventoryItems;
  return Array.isArray(items) ? items : [];
})
const locations = computed(() => {
  const locs = locationsStore.getLocations;
  return Array.isArray(locs) ? locs : [];
})
const categories = computed(() => {
  const cats = categoriesStore.getCategories;
  return Array.isArray(cats) ? cats : [];
})
const suppliers = computed(() => {
  const supplierData = suppliersStore.getSuppliers;
  return Array.isArray(supplierData) ? supplierData : [];
})

// Mock data for now - would connect to real store methods
const reorderRules = ref([])
const suggestedReorders = ref([])
const isLoadingRules = ref(false)
const isLoadingSuggestions = ref(false)

// Local state
const filters = ref({
  status: 'all',
  location: 'all',
  category: 'all',
  thresholdType: 'all'
})

const reorderSettings = ref({
  enableGlobalReorderRules: true,
  defaultLeadTimeDays: 7,
  defaultSafetyStockPercentage: 20,
  notifyOnLowStock: true,
  autoCreatePurchaseOrders: false,
  preferredSuppliers: []
})

const reorderStats = computed(() => {
  // Safeguard all values to ensure they're arrays before filtering
  const rules = Array.isArray(reorderRules.value) ? reorderRules.value : [];
  const suggestions = Array.isArray(suggestedReorders.value) ? suggestedReorders.value : [];
  const items = Array.isArray(inventoryItems.value) ? inventoryItems.value : [];
  
  return {
    activeRules: rules.filter(rule => rule?.isActive).length,
    pendingReorders: suggestions.filter(item => !item?.isIgnored).length,
    lowStockItems: items.filter(item => 
      (item?.stockLevel || 0) < (item?.reorderPoint || 0)).length,
    reorderedLastMonth: 15 // Mock data
  }
})

// UI control
const showCreateRuleDialog = ref(false)
const showDeleteRuleDialog = ref(false)
const showReorderSettingsDialog = ref(false)
const showCreateOrderDialog = ref(false)
const selectedRule = ref(null)
const selectedSuggestion = ref(null)
const editMode = ref(false)

// Filtered rules based on the applied filters
const filteredReorderRules = computed(() => {
  // Make sure reorderRules.value is an array
  if (!Array.isArray(reorderRules.value)) {
    return [];
  }
  
  let result = [...reorderRules.value]
  
  if (filters.value.status !== 'all') {
    const isActive = filters.value.status === 'active'
    result = result.filter(rule => rule.isActive === isActive)
  }
  
  if (filters.value.location !== 'all') {
    result = result.filter(rule => 
      rule.locationId === filters.value.location || rule.applyToAllLocations)
  }
  
  if (filters.value.category !== 'all') {
    result = result.filter(rule => 
      rule.categoryId === filters.value.category || rule.applyToAllCategories)
  }
  
  if (filters.value.thresholdType !== 'all') {
    result = result.filter(rule => rule.thresholdType === filters.value.thresholdType)
  }
  
  return result
})

// Dialog and interaction handlers
const openCreateRuleDialog = () => {
  selectedRule.value = {
    id: null,
    name: '',
    description: '',
    thresholdType: 'absolute',
    thresholdValue: 10,
    isActive: true,
    applyToAllItems: false,
    applyToAllLocations: false,
    applyToAllCategories: false,
    itemId: null,
    locationId: null,
    categoryId: null,
    reorderQuantityType: 'fixed',
    reorderQuantityValue: 10,
    notifyUsers: true,
    autoCreateOrder: false,
    preferredSupplierId: null
  }
  editMode.value = false
  showCreateRuleDialog.value = true
}

const openEditRuleDialog = (rule) => {
  selectedRule.value = { ...rule }
  editMode.value = true
  showCreateRuleDialog.value = true
}

const openDeleteRuleDialog = (rule) => {
  selectedRule.value = rule
  showDeleteRuleDialog.value = true
}

const openReorderSettingsDialog = () => {
  showReorderSettingsDialog.value = true
}

const openCreateOrderDialog = (suggestion) => {
  selectedSuggestion.value = suggestion
  showCreateOrderDialog.value = true
}

// API interaction handlers
const fetchReorderRules = async () => {
  isLoadingRules.value = true
  
  try {
    // Mock data - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    reorderRules.value = [
      {
        id: '1',
        name: 'Low Stock Rule - Widgets',
        description: 'Reorder widgets when stock drops below threshold',
        thresholdType: 'absolute',
        thresholdValue: 25,
        isActive: true,
        applyToAllItems: false,
        applyToAllLocations: false,
        applyToAllCategories: false,
        itemId: 'item-001',
        locationId: 'loc-001',
        categoryId: 'cat-widgets',
        reorderQuantityType: 'fixed',
        reorderQuantityValue: 50,
        notifyUsers: true,
        autoCreateOrder: false,
        preferredSupplierId: 'sup-001',
        createdAt: '2025-02-15T10:20:00Z',
        updatedAt: '2025-04-10T14:30:00Z'
      },
      {
        id: '2',
        name: 'Safety Stock - Components',
        description: 'Maintain safety stock for all components',
        thresholdType: 'percentage',
        thresholdValue: 20, // 20% of max stock
        isActive: true,
        applyToAllItems: false,
        applyToAllLocations: true,
        applyToAllCategories: false,
        itemId: null,
        locationId: null,
        categoryId: 'cat-components',
        reorderQuantityType: 'economic_order_quantity',
        reorderQuantityValue: null,
        notifyUsers: true,
        autoCreateOrder: true,
        preferredSupplierId: 'sup-002',
        createdAt: '2025-03-05T09:15:00Z',
        updatedAt: '2025-03-05T09:15:00Z'
      },
      {
        id: '3',
        name: 'Global Minimum Stock Rule',
        description: 'Default rule for all inventory items',
        thresholdType: 'absolute',
        thresholdValue: 5,
        isActive: true,
        applyToAllItems: true,
        applyToAllLocations: true,
        applyToAllCategories: true,
        itemId: null,
        locationId: null,
        categoryId: null,
        reorderQuantityType: 'days_of_supply',
        reorderQuantityValue: 30, // 30 days supply
        notifyUsers: true,
        autoCreateOrder: false,
        preferredSupplierId: null,
        createdAt: '2025-01-10T11:00:00Z',
        updatedAt: '2025-04-15T13:25:00Z'
      },
      {
        id: '4',
        name: 'Critical Parts - Expedited',
        description: 'Reorder rule for critical components with expedited handling',
        thresholdType: 'absolute',
        thresholdValue: 10,
        isActive: false, // Inactive rule
        applyToAllItems: false,
        applyToAllLocations: false,
        applyToAllCategories: false,
        itemId: 'item-003',
        locationId: 'loc-002',
        categoryId: null,
        reorderQuantityType: 'fixed',
        reorderQuantityValue: 100,
        notifyUsers: true,
        autoCreateOrder: true,
        preferredSupplierId: 'sup-003',
        createdAt: '2025-03-20T16:45:00Z',
        updatedAt: '2025-04-18T09:10:00Z'
      }
    ]
    
    isLoadingRules.value = false
  } catch (error) {
    console.error('Error fetching reorder rules:', error)
    toast({
      title: 'Error',
      description: 'Failed to load reorder rules',
      variant: 'destructive'
    })
    isLoadingRules.value = false
  }
}

const fetchSuggestedReorders = async () => {
  isLoadingSuggestions.value = true
  
  try {
    // Mock data - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    suggestedReorders.value = [
      {
        id: 'suggestion-001',
        itemId: 'item-001',
        itemName: 'Widget A',
        sku: 'INV-001',
        locationId: 'loc-001',
        locationName: 'Main Warehouse',
        currentStock: 15,
        reorderPoint: 20,
        suggestedQuantity: 50,
        priority: 'high',
        estimatedCost: 299.50,
        triggeredByRuleId: '1',
        ruleName: 'Low Stock Rule - Widgets',
        suggestedDate: '2025-05-18T09:30:00Z',
        isIgnored: false,
        ignoredReason: null,
        estimatedOutOfStockDate: '2025-06-01T00:00:00Z',
        preferredSupplierId: 'sup-001',
        preferredSupplierName: 'Acme Supply Co'
      },
      {
        id: 'suggestion-002',
        itemId: 'item-003',
        itemName: 'Component C',
        sku: 'INV-003',
        locationId: 'loc-001',
        locationName: 'Main Warehouse',
        currentStock: 240,
        reorderPoint: 300,
        suggestedQuantity: 500,
        priority: 'medium',
        estimatedCost: 295.00,
        triggeredByRuleId: '2',
        ruleName: 'Safety Stock - Components',
        suggestedDate: '2025-05-17T10:15:00Z',
        isIgnored: false,
        ignoredReason: null,
        estimatedOutOfStockDate: '2025-06-10T00:00:00Z',
        preferredSupplierId: 'sup-002',
        preferredSupplierName: 'Component World'
      },
      {
        id: 'suggestion-003',
        itemId: 'item-005',
        itemName: 'Material E',
        sku: 'INV-005',
        locationId: 'loc-002',
        locationName: 'East Warehouse',
        currentStock: 45,
        reorderPoint: 75,
        suggestedQuantity: 100,
        priority: 'medium',
        estimatedCost: 349.00,
        triggeredByRuleId: '3',
        ruleName: 'Global Minimum Stock Rule',
        suggestedDate: '2025-05-16T14:20:00Z',
        isIgnored: false,
        ignoredReason: null,
        estimatedOutOfStockDate: '2025-06-05T00:00:00Z',
        preferredSupplierId: null,
        preferredSupplierName: null
      },
      {
        id: 'suggestion-004',
        itemId: 'item-006',
        itemName: 'Product F',
        sku: 'INV-006',
        locationId: 'loc-001',
        locationName: 'Main Warehouse',
        currentStock: 12,
        reorderPoint: 15,
        suggestedQuantity: 25,
        priority: 'low',
        estimatedCost: 624.75,
        triggeredByRuleId: '3',
        ruleName: 'Global Minimum Stock Rule',
        suggestedDate: '2025-05-15T09:45:00Z',
        isIgnored: true,
        ignoredReason: 'Product being phased out',
        estimatedOutOfStockDate: '2025-05-30T00:00:00Z',
        preferredSupplierId: null,
        preferredSupplierName: null
      }
    ]
    
    isLoadingSuggestions.value = false
  } catch (error) {
    console.error('Error fetching suggested reorders:', error)
    toast({
      title: 'Error',
      description: 'Failed to load reorder suggestions',
      variant: 'destructive'
    })
    isLoadingSuggestions.value = false
  }
}

// Action handlers
const handleSaveRule = async (rule) => {
  try {
    if (editMode.value) {
      // Update existing rule
      const index = reorderRules.value.findIndex(r => r.id === rule.id)
      if (index !== -1) {
        reorderRules.value[index] = { ...rule, updatedAt: new Date().toISOString() }
      }
      
      toast({
        title: 'Rule Updated',
        description: `"${rule.name}" has been updated successfully.`,
        variant: 'success'
      })
    } else {
      // Create new rule
      const newRule = {
        ...rule,
        id: `rule-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      reorderRules.value.push(newRule)
      
      toast({
        title: 'Rule Created',
        description: `"${rule.name}" has been created successfully.`,
        variant: 'success'
      })
    }
    
    showCreateRuleDialog.value = false
  } catch (error) {
    console.error('Error saving reorder rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to save reorder rule',
      variant: 'destructive'
    })
  }
}

const handleDeleteRule = async () => {
  try {
    if (selectedRule.value) {
      const index = reorderRules.value.findIndex(rule => rule.id === selectedRule.value.id)
      if (index !== -1) {
        reorderRules.value.splice(index, 1)
      }
      
      toast({
        title: 'Rule Deleted',
        description: `"${selectedRule.value.name}" has been deleted.`,
        variant: 'success'
      })
    }
    
    showDeleteRuleDialog.value = false
  } catch (error) {
    console.error('Error deleting rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete reorder rule',
      variant: 'destructive'
    })
  }
}

const toggleRuleStatus = async (rule) => {
  try {
    const index = reorderRules.value.findIndex(r => r.id === rule.id)
    if (index !== -1) {
      reorderRules.value[index].isActive = !reorderRules.value[index].isActive
      reorderRules.value[index].updatedAt = new Date().toISOString()
      
      toast({
        title: 'Status Changed',
        description: `Rule is now ${reorderRules.value[index].isActive ? 'active' : 'inactive'}.`,
        variant: 'success'
      })
    }
  } catch (error) {
    console.error('Error toggling rule status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update rule status',
      variant: 'destructive'
    })
  }
}

const handleSaveSettings = async (settings) => {
  try {
    reorderSettings.value = { ...settings }
    
    toast({
      title: 'Settings Updated',
      description: 'Reorder settings have been updated.',
      variant: 'success'
    })
    
    showReorderSettingsDialog.value = false
  } catch (error) {
    console.error('Error saving settings:', error)
    toast({
      title: 'Error',
      description: 'Failed to save reorder settings',
      variant: 'destructive'
    })
  }
}

const handleCreateOrder = (suggestion) => {
  openCreateOrderDialog(suggestion)
}

const handleIgnoreSuggestion = async (suggestion, reason) => {
  try {
    const index = suggestedReorders.value.findIndex(s => s.id === suggestion.id)
    if (index !== -1) {
      suggestedReorders.value[index].isIgnored = true
      suggestedReorders.value[index].ignoredReason = reason
      
      toast({
        title: 'Suggestion Ignored',
        description: `Reorder suggestion for ${suggestion.itemName} has been ignored.`,
        variant: 'success'
      })
    }
  } catch (error) {
    console.error('Error ignoring suggestion:', error)
    toast({
      title: 'Error',
      description: 'Failed to ignore reorder suggestion',
      variant: 'destructive'
    })
  }
}

const handleUnignoreSuggestion = async (suggestion) => {
  try {
    const index = suggestedReorders.value.findIndex(s => s.id === suggestion.id)
    if (index !== -1) {
      suggestedReorders.value[index].isIgnored = false
      suggestedReorders.value[index].ignoredReason = null
      
      toast({
        title: 'Suggestion Restored',
        description: `Reorder suggestion for ${suggestion.itemName} has been restored.`,
        variant: 'success'
      })
    }
  } catch (error) {
    console.error('Error restoring suggestion:', error)
    toast({
      title: 'Error',
      description: 'Failed to restore reorder suggestion',
      variant: 'destructive'
    })
  }
}

const handleOrderCreated = async (orderData) => {
  try {
    // In real implementation, would call API to create the purchase order
    console.log('Creating order with data:', orderData)
    
    // Mark the suggestion as handled (remove from list or mark as processed)
    const index = suggestedReorders.value.findIndex(s => s.id === selectedSuggestion.value.id)
    if (index !== -1) {
      // For this example, we're removing it from the list
      suggestedReorders.value.splice(index, 1)
    }
    
    showCreateOrderDialog.value = false
    
    toast({
      title: 'Purchase Order Created',
      description: `Purchase order for ${selectedSuggestion.value.itemName} has been created.`,
      variant: 'success'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    toast({
      title: 'Error',
      description: 'Failed to create purchase order',
      variant: 'destructive'
    })
  }
}

const handleViewItemDetails = (itemId) => {
  // Find the item from inventory
  const item = inventoryItems.value.find(item => item.id === itemId)
  if (item) {
    // Here you could navigate to item details page or open a modal
    console.log('Viewing item details for:', item)
    toast({
      title: 'Item Details',
      description: `Viewing details for ${item.name}`,
      variant: 'default'
    })
    // In a real implementation you might navigate using:
    // router.push(`/app/inventory/items/${itemId}`)
  }
}

const handleViewLocationStock = (locationId) => {
  // Find the location
  const location = locations.value.find(loc => loc.id === locationId)
  if (location) {
    // Show location stock details
    console.log('Viewing stock for location:', location)
    toast({
      title: 'Location Stock',
      description: `Viewing stock at ${location.name}`,
      variant: 'default'
    })
    // In a real implementation you might navigate using:
    // router.push(`/app/inventory/locations/${locationId}`)
  }
}

const handleViewRule = (ruleId) => {
  // Find the rule
  const rule = reorderRules.value.find(rule => rule.id === ruleId)
  if (rule) {
    // Open rule editor in edit mode
    selectedRule.value = { ...rule }
    editMode.value = true
    showCreateRuleDialog.value = true
  }
}

// Initialize
onMounted(async () => {
  try {
    // Load suppliers first - make this call await
    await suppliersStore.fetchSuppliers();
    console.log("Suppliers loaded:", suppliersStore.getSuppliers);
    
    // Then fetch other data
    fetchInventoryItems();
    fetchLocations();
    fetchCategories();
    fetchReorderRules();
    fetchSuggestedReorders();
  } catch (error) {
    console.error('Error initializing data:', error);
    toast({
      title: 'Error',
      description: 'Failed to initialize application data',
      variant: 'destructive'
    });
  }
})

// Helper methods
async function fetchInventoryItems() {
  try {
    await inventoryStore.fetchItems()
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    toast({
      title: 'Error',
      description: 'Failed to load inventory items',
      variant: 'destructive'
    })
  }
}

async function fetchLocations() {
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

async function fetchCategories() {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    toast({
      title: 'Error',
      description: 'Failed to load categories',
      variant: 'destructive'
    })
  }
}

async function fetchSuppliers() {
  try {
    await suppliersStore.fetchSuppliers()
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load suppliers',
      variant: 'destructive'
    })
  }
}
</script>