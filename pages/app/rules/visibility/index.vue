<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Visibility Rules</h2>
        <p class="text-muted-foreground">Manage visibility settings for inventory items and alternatives</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button @click="openCreateRuleDialog">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>
    </div>

    <!-- Tabs for different rule types -->
    <Tabs default-value="stock-visibility" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="stock-visibility">Out-of-Stock Visibility</TabsTrigger>
        <TabsTrigger value="backorder">Backorder Settings</TabsTrigger>
        <TabsTrigger value="alternatives">Product Alternatives</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stock-visibility">
        <StockVisibilityTable 
          :rules="stockVisibilityRules" 
          :loading="isLoading"
          @edit-rule="openEditRuleDialog"
          @delete-rule="openDeleteRuleDialog"
          @toggle-rule="handleToggleRule"
          @refresh="fetchRules"
        />
      </TabsContent>
      
      <TabsContent value="backorder">
        <BackorderSettingsTable 
          :settings="backorderSettings" 
          :loading="isLoading"
          @edit-setting="openEditBackorderDialog"
          @toggle-setting="handleToggleBackorderSetting"
          @refresh="fetchRules"
        />
      </TabsContent>
      
      <TabsContent value="alternatives">
        <ProductAlternativesTable 
          :alternatives="productAlternatives" 
          :loading="isLoading"
          @edit-alternative="openEditAlternativeDialog"
          @delete-alternative="openDeleteAlternativeDialog"
          @refresh="fetchRules"
        />
      </TabsContent>
    </Tabs>

    <!-- Create Rule Dialog -->
    <Dialog v-model:open="showCreateRuleDialog">
      <CreateRuleDialog
        v-if="showCreateRuleDialog"
        :categories="categories"
        :items="availableItems"
        @rule-created="handleRuleCreated"
        @close="showCreateRuleDialog = false"
      />
    </Dialog>

    <!-- Edit Rule Dialog -->
    <Dialog v-model:open="showEditRuleDialog">
      <EditRuleDialog
        v-if="showEditRuleDialog"
        :rule="selectedRule"
        :categories="categories"
        :items="availableItems"
        @rule-updated="handleRuleUpdated"
        @close="showEditRuleDialog = false"
      />
    </Dialog>

    <!-- Delete Rule Dialog -->
    <AlertDialog v-model:open="showDeleteRuleDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Visibility Rule</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this visibility rule? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteRuleDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleDeleteRule">Delete Rule</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Edit Backorder Dialog -->
    <Dialog v-model:open="showEditBackorderDialog">
      <EditBackorderDialog
        v-if="showEditBackorderDialog"
        :setting="selectedBackorderSetting"
        :categories="categories"
        :items="availableItems"
        @setting-updated="handleBackorderSettingUpdated"
        @close="showEditBackorderDialog = false"
      />
    </Dialog>

    <!-- Edit Alternative Dialog -->
    <Dialog v-model:open="showEditAlternativeDialog">
      <EditAlternativeDialog
        v-if="showEditAlternativeDialog"
        :alternative="selectedAlternative"
        :products="products"
        @alternative-updated="handleAlternativeUpdated"
        @close="showEditAlternativeDialog = false"
      />
    </Dialog>

    <!-- Delete Alternative Dialog -->
    <AlertDialog v-model:open="showDeleteAlternativeDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product Alternative</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product alternative? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteAlternativeDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleDeleteAlternative">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, Database, Eye, AlertCircle, ShoppingCart 
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
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Component imports
import StockVisibilityTable from '@/components/rules/visibility/StockVisibilityTable.vue'
import BackorderSettingsTable from '@/components/rules/visibility/BackorderSettingsTable.vue'
import ProductAlternativesTable from '@/components/rules/visibility/ProductAlternativesTable.vue'
import CreateRuleDialog from '@/components/rules/visibility/CreateRuleDialog.vue'
import EditRuleDialog from '@/components/rules/visibility/EditRuleDialog.vue'
import EditBackorderDialog from '@/components/rules/visibility/EditBackorderDialog.vue'
import EditAlternativeDialog from '@/components/rules/visibility/EditAlternativeDialog.vue'

// Stores
import { useVisibilityRulesStore } from '@/store/modules/rules/visibility'
import { useInventoryStore } from '@/store/modules/inventory/items'
import { useCategoriesStore } from '@/store/modules/catalog/categories'
import { useProductsStore } from '@/store/modules/catalog/products'

// Initialize stores
const visibilityRulesStore = useVisibilityRulesStore()
const inventoryStore = useInventoryStore()
const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()
const { toast } = useToast()

// Access store state through computed properties
const stockVisibilityRules = computed(() => visibilityRulesStore.getStockVisibilityRules)
const backorderSettings = computed(() => visibilityRulesStore.getBackorderSettings)
const productAlternatives = computed(() => visibilityRulesStore.getProductAlternatives)
const isLoading = computed(() => visibilityRulesStore.getIsLoading)
const error = computed(() => visibilityRulesStore.getError)
const availableItems = computed(() => inventoryStore.getItems)
const categories = computed(() => categoriesStore.getCategories)
const products = computed(() => productsStore.getProducts)

// State management
const selectedRule = ref(null)
const selectedBackorderSetting = ref(null)
const selectedAlternative = ref(null)
const usingMockData = ref(true)

// UI control
const showCreateRuleDialog = ref(false)
const showEditRuleDialog = ref(false)
const showDeleteRuleDialog = ref(false)
const showEditBackorderDialog = ref(false)
const showEditAlternativeDialog = ref(false)
const showDeleteAlternativeDialog = ref(false)

// Toggle between mock data and API data
const toggleDataSource = () => {
  usingMockData.value = !usingMockData.value
  visibilityRulesStore.setUseMockData(usingMockData.value)
  inventoryStore.setUseMockData(usingMockData.value)
  categoriesStore.setUseMockData(usingMockData.value)
  productsStore.setUseMockData(usingMockData.value)
  
  // Refresh data
  fetchRules()
  fetchItems()
  fetchCategories()
  fetchProducts()
  
  toast({
    title: usingMockData.value ? 'Using Mock Data' : 'Using API Data',
    description: usingMockData.value 
      ? 'Switched to mock data for testing purposes' 
      : 'Connected to live API endpoints',
    variant: 'default'
  })
}

// Fetch data from APIs
const fetchRules = async () => {
  try {
    await visibilityRulesStore.fetchRules()
  } catch (error) {
    console.error('Error fetching visibility rules:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchItems = async () => {
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

const fetchCategories = async () => {
  try {
    await categoriesStore.fetchCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    toast({
      title: 'Error',
      description: 'Failed to load product categories',
      variant: 'destructive'
    })
  }
}

const fetchProducts = async () => {
  try {
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    toast({
      title: 'Error',
      description: 'Failed to load products',
      variant: 'destructive'
    })
  }
}

// Dialog handlers
const openCreateRuleDialog = () => {
  showCreateRuleDialog.value = true
}

const openEditRuleDialog = (rule) => {
  selectedRule.value = rule
  showEditRuleDialog.value = true
}

const openDeleteRuleDialog = (rule) => {
  selectedRule.value = rule
  showDeleteRuleDialog.value = true
}

const openEditBackorderDialog = (setting) => {
  selectedBackorderSetting.value = setting
  showEditBackorderDialog.value = true
}

const openEditAlternativeDialog = (alternative) => {
  selectedAlternative.value = alternative
  showEditAlternativeDialog.value = true
}

const openDeleteAlternativeDialog = (alternative) => {
  selectedAlternative.value = alternative
  showDeleteAlternativeDialog.value = true
}

// CRUD operation handlers
const handleRuleCreated = async (rule) => {
  try {
    await visibilityRulesStore.createStockVisibilityRule(rule)
    showCreateRuleDialog.value = false
    
    toast({
      title: 'Rule Created',
      description: 'Visibility rule has been created successfully.',
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error creating visibility rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to create visibility rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleRuleUpdated = async (rule) => {
  try {
    await visibilityRulesStore.updateStockVisibilityRule(rule)
    showEditRuleDialog.value = false
    
    toast({
      title: 'Rule Updated',
      description: 'Visibility rule has been updated successfully.',
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error updating visibility rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to update visibility rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDeleteRule = async () => {
  try {
    await visibilityRulesStore.deleteStockVisibilityRule(selectedRule.value.id)
    showDeleteRuleDialog.value = false
    
    toast({
      title: 'Rule Deleted',
      description: 'Visibility rule has been deleted successfully.',
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error deleting visibility rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete visibility rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleToggleRule = async (rule) => {
  try {
    const updatedRule = { ...rule, active: !rule.active }
    await visibilityRulesStore.updateStockVisibilityRule(updatedRule)
    
    toast({
      title: updatedRule.active ? 'Rule Activated' : 'Rule Deactivated',
      description: `Visibility rule has been ${updatedRule.active ? 'activated' : 'deactivated'}.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error toggling visibility rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to update visibility rule status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleBackorderSettingUpdated = async (setting) => {
  try {
    await visibilityRulesStore.updateBackorderSetting(setting)
    showEditBackorderDialog.value = false
    
    toast({
      title: 'Setting Updated',
      description: 'Backorder setting has been updated successfully.',
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error updating backorder setting:', error)
    toast({
      title: 'Error',
      description: 'Failed to update backorder setting. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleToggleBackorderSetting = async (setting) => {
  try {
    const updatedSetting = { ...setting, active: !setting.active }
    await visibilityRulesStore.updateBackorderSetting(updatedSetting)
    
    toast({
      title: updatedSetting.active ? 'Setting Activated' : 'Setting Deactivated',
      description: `Backorder setting has been ${updatedSetting.active ? 'activated' : 'deactivated'}.`,
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error toggling backorder setting:', error)
    toast({
      title: 'Error',
      description: 'Failed to update backorder setting status. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleAlternativeUpdated = async (alternative) => {
  try {
    await visibilityRulesStore.updateProductAlternative(alternative)
    showEditAlternativeDialog.value = false
    
    toast({
      title: 'Alternative Updated',
      description: 'Product alternative has been updated successfully.',
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error updating product alternative:', error)
    toast({
      title: 'Error',
      description: 'Failed to update product alternative. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleDeleteAlternative = async () => {
  try {
    await visibilityRulesStore.deleteProductAlternative(selectedAlternative.value.id)
    showDeleteAlternativeDialog.value = false
    
    toast({
      title: 'Alternative Deleted',
      description: 'Product alternative has been deleted successfully.',
      variant: 'success'
    })
    
    await fetchRules()
  } catch (error) {
    console.error('Error deleting product alternative:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete product alternative. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchRules()
  fetchItems()
  fetchCategories()
  fetchProducts()
})
</script>