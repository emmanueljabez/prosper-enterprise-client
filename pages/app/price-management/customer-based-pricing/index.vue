<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Customer-Based Pricing</h2>
        <p class="text-muted-foreground">Manage pricing rules and discounts for specific customers and groups</p>
      </div>
      <div class="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileUp class="h-4 w-4 mr-2" />
              Import
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="openImportSheet('csv')">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Import CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="openImportSheet('excel')">
              <Table2 class="h-4 w-4 mr-2" />
              Import Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openPricingRuleEditor()">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Pricing Rule
        </Button>
      </div>
    </div>

    <!-- Tabs for different views -->
    <Tabs defaultValue="rules" class="w-full">
      <TabsList class="grid grid-cols-3 w-full max-w-lg">
        <TabsTrigger value="rules">
          <TagIcon class="h-4 w-4 mr-2" />
          Pricing Rules
        </TabsTrigger>
        <TabsTrigger value="groups">
          <Users2Icon class="h-4 w-4 mr-2" />
          Customer Groups
        </TabsTrigger>
        <TabsTrigger value="customers">
          <UserIcon class="h-4 w-4 mr-2" />
          Individual Customers
        </TabsTrigger>
      </TabsList>

      <!-- Pricing Rules Tab -->
      <TabsContent value="rules" class="space-y-6">
        <CustomerPricingRulesTable
          :pricingRules="filteredPricingRules"
          :customerGroups="customerGroups"
          :loading="isLoading"
          @edit-rule="openPricingRuleEditor"
          @delete-rule="openDeletePricingRuleDialog"
          @duplicate-rule="handleDuplicatePricingRule"
          @toggle-rule-status="togglePricingRuleStatus"
          @refresh="fetchPricingData"
        />
      </TabsContent>

      <!-- Customer Groups Tab -->
      <TabsContent value="groups" class="space-y-6">
        <CustomerGroupPricingTable
          :customerGroups="customerGroups"
          :loading="isLoading"
          @edit-group="openCustomerGroupEditor"
          @edit-group-pricing="openGroupPricingEditor"
          @delete-group="openDeleteCustomerGroupDialog"
          @refresh="fetchCustomerGroups"
        />
      </TabsContent>

      <!-- Individual Customers Tab -->
      <TabsContent value="customers" class="space-y-6">
        <CustomerSpecificPricingTable
          :customerPricing="customerSpecificPricing"
          :customers="customers"
          :products="products"
          :loading="isLoading"
          @edit-pricing="openCustomerPricingEditor"
          @delete-pricing="openDeleteCustomerPricingDialog"
          @refresh="fetchCustomerSpecificPricing"
        />
      </TabsContent>
    </Tabs>
  </div>

  <!-- Dialogs and Sheets -->
  <!-- Pricing Rule Editor Sheet -->
  <CustomerPricingRuleEditorSheet
    :isOpen="showPricingRuleEditorSheet"
    :editingRule="selectedRule"
    :customers="customers"
    :customerGroups="customerGroups"
    :products="products"
    :productCategories="productCategories"
    :isProcessing="isProcessing"
    @update:isOpen="showPricingRuleEditorSheet = $event"
    @rule-saved="handlePricingRuleSaved"
  />

  <!-- Delete Pricing Rule Dialog -->
  <DeletePricingRuleDialog
    :isOpen="showDeletePricingRuleDialog"
    :rule="selectedRule"
    :isProcessing="isProcessing"
    @update:isOpen="showDeletePricingRuleDialog = $event"
    @confirm-delete="handlePricingRuleDeleted"
  />

  <!-- Customer Group Editor Sheet -->
  <CustomerGroupEditorSheet
    :isOpen="showCustomerGroupEditorSheet"
    :editingGroup="selectedCustomerGroup"
    :customers="customers"
    :isProcessing="isProcessing"
    @update:isOpen="showCustomerGroupEditorSheet = $event"
    @group-saved="handleCustomerGroupSaved"
  />

  <!-- Delete Customer Group Dialog -->
  <DeleteCustomerGroupDialog
    :isOpen="showDeleteCustomerGroupDialog"
    :group="selectedCustomerGroup"
    :isProcessing="isProcessing"
    @update:isOpen="showDeleteCustomerGroupDialog = $event"
    @confirm-delete="handleCustomerGroupDeleted"
  />

  <!-- Group Pricing Editor Sheet -->
  <GroupPricingEditorSheet
    :isOpen="showGroupPricingEditorSheet"
    :group="selectedCustomerGroup"
    :products="products"
    :isProcessing="isProcessing"
    @update:isOpen="showGroupPricingEditorSheet = $event"
    @pricing-saved="handleGroupPricingSaved"
  />

  <!-- Customer Pricing Editor Sheet -->
  <CustomerPricingEditorSheet
    :isOpen="showCustomerPricingEditorSheet"
    :editingPricing="selectedCustomerPricing"
    :customers="customers"
    :products="products"
    :isProcessing="isProcessing"
    @update:isOpen="showCustomerPricingEditorSheet = $event"
    @pricing-saved="handleCustomerPricingSaved"
  />

  <!-- Delete Customer Pricing Dialog -->
  <DeleteCustomerPricingDialog
    :isOpen="showDeleteCustomerPricingDialog"
    :pricing="selectedCustomerPricing"
    :customers="customers"
    :products="products"
    :isProcessing="isProcessing"
    @update:isOpen="showDeleteCustomerPricingDialog = $event"
    @confirm-delete="handleCustomerPricingDeleted"
  />

  <!-- Import Sheet -->
  <CustomerPricingImportSheet
    :isOpen="showImportSheet"
    :customers="customers"
    :products="products"
    :customerGroups="customerGroups"
    :isProcessing="isProcessing"
    @update:isOpen="showImportSheet = $event"
    @import-complete="handleImportComplete"
  />
  
  <!-- Debug element - remove after fixing -->
  <div class="fixed bottom-4 right-4 p-2 bg-black/80 text-white rounded-md z-50 text-xs">
    <div>Rule Editor: {{ showPricingRuleEditorSheet }}</div>
    <div>Delete Rule: {{ showDeletePricingRuleDialog }}</div>
    <div>Customer Pricing: {{ showCustomerPricingEditorSheet }}</div>
    <div>Delete Pricing: {{ showDeleteCustomerPricingDialog }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet, Table2,
  TagIcon, Users2Icon, UserIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
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
import CustomerPricingRulesTable from '@/components/price-management/customer-based-pricing/CustomerPricingRulesTable.vue'
import CustomerGroupPricingTable from '@/components/price-management/customer-based-pricing/CustomerGroupPricingTable.vue'
import CustomerSpecificPricingTable from '@/components/price-management/customer-based-pricing/CustomerSpecificPricingTable.vue'
import CustomerPricingRuleEditorSheet from '@/components/price-management/customer-based-pricing/CustomerPricingRuleEditorSheet.vue'
import DeletePricingRuleDialog from '@/components/price-management/customer-based-pricing/DeletePricingRuleDialog.vue'
import CustomerGroupEditorSheet from '@/components/price-management/customer-based-pricing/CustomerGroupEditorSheet.vue'
import DeleteCustomerGroupDialog from '@/components/price-management/customer-based-pricing/DeleteCustomerGroupDialog.vue'
import GroupPricingEditorSheet from '@/components/price-management/customer-based-pricing/GroupPricingEditorSheet.vue'
import CustomerPricingEditorSheet from '@/components/price-management/customer-based-pricing/CustomerPricingEditorSheet.vue'
import DeleteCustomerPricingDialog from '@/components/price-management/customer-based-pricing/DeleteCustomerPricingDialog.vue'
import CustomerPricingImportSheet from '@/components/price-management/customer-based-pricing/CustomerPricingImportSheet.vue'

// Stores
import { usePricingStore } from '@/store/modules/price-mangement/pricing'
import { useCustomersStore } from '@/store/modules/price-mangement/customers'

// Initialize stores
const pricingStore = usePricingStore()
const customersStore = useCustomersStore()
const { toast } = useToast()

// Access store state through computed properties
const customerGroups = computed(() => pricingStore.getCustomerGroups)
const salesChannels = computed(() => pricingStore.getSalesChannels)
const promotions = computed(() => pricingStore.getPromotions)
const isLoading = computed(() => pricingStore.getIsLoading)
const customers = computed(() => customersStore.getCustomers || [])

// Additional state variables
const products = ref([])
const productCategories = ref([])
const isProcessing = ref(false)

// State for customer-specific pricing (this would be in your pricing store in a real app)
const customerSpecificPricing = ref([])

// Filter promotions that are customer-based
const filteredPricingRules = computed(() => {
  return promotions.value.filter(promo => 
    promo.type === 'customer_based' || 
    promo.type === 'customer_group'
  );
})

// Selection state
const selectedRule = ref(null)
const selectedCustomerGroup = ref(null)
const selectedCustomerPricing = ref(null)

// UI control
const showPricingRuleEditorSheet = ref(false)
const showDeletePricingRuleDialog = ref(false)
const showCustomerGroupEditorSheet = ref(false)
const showDeleteCustomerGroupDialog = ref(false)
const showGroupPricingEditorSheet = ref(false)
const showCustomerPricingEditorSheet = ref(false)
const showDeleteCustomerPricingDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Utility functions for form data conversion
const formatForForm = (data) => {
  if (!data) return null;
  
  // Create a deep copy to avoid mutations
  const formattedData = JSON.parse(JSON.stringify(data));
  
  // Convert numeric values to strings for all properties
  const convertObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      // Convert numbers to strings for form inputs
      if (typeof obj[key] === 'number') {
        obj[key] = String(obj[key]);
      }
      
      // Handle nested objects and arrays
      if (obj[key] && typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(item => {
            if (item && typeof item === 'object') {
              convertObject(item);
            }
          });
        } else {
          convertObject(obj[key]);
        }
      }
    });
  };
  
  convertObject(formattedData);
  return formattedData;
};

// Function to convert string values back to numbers for saving
const prepareForSave = (data) => {
  if (!data) return data;
  
  // Create a deep copy to avoid mutations
  const preparedData = JSON.parse(JSON.stringify(data));
  
  // Fields that should be converted back to numbers
  const numericFields = [
    'price', 'compareAtPrice', 'discountValue', 'amount', 
    'percentage', 'minQuantity', 'maxQuantity'
  ];
  
  const convertObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      // Convert strings back to numbers for numeric fields
      if (numericFields.includes(key) && typeof obj[key] === 'string' && !isNaN(obj[key])) {
        obj[key] = parseFloat(obj[key]);
      }
      
      // Handle nested objects and arrays
      if (obj[key] && typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(item => {
            if (item && typeof item === 'object') {
              convertObject(item);
            }
          });
        } else {
          convertObject(obj[key]);
        }
      }
    });
  };
  
  convertObject(preparedData);
  return preparedData;
};

// Data fetching
const fetchPricingData = async () => {
  try {
    await Promise.all([
      pricingStore.fetchPromotions(),
      pricingStore.fetchCustomerGroups(),
      pricingStore.fetchSalesChannels()
    ])
  } catch (error) {
    console.error('Error fetching pricing data:', error)
    toast({
      title: 'Error',
      description: 'Failed to load pricing data',
      variant: 'destructive'
    })
  }
}

const fetchProducts = async () => {
  try {
    // Mock data with string values for numeric properties
    products.value = [
      { id: 'prod1', name: 'Product 1', sku: 'SKU001', price: '99.99' },
      { id: 'prod2', name: 'Product 2', sku: 'SKU002', price: '49.99' },
    ]
    
    productCategories.value = [
      { id: 'cat1', name: 'Category 1' },
      { id: 'cat2', name: 'Category 2' }
    ]
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const fetchCustomerGroups = async () => {
  try {
    await pricingStore.fetchCustomerGroups()
  } catch (error) {
    console.error('Error fetching customer groups:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customer groups',
      variant: 'destructive'
    })
  }
}

const fetchCustomers = async () => {
  try {
    await customersStore.fetchCustomers()
  } catch (error) {
    console.error('Error fetching customers:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customers',
      variant: 'destructive'
    })
  }
}

const fetchCustomerSpecificPricing = async () => {
  try {
    // Mock data with string values for numeric properties
    customerSpecificPricing.value = [
      { id: 'csp1', customerId: 'cust1', customerName: 'Acme Inc.', discountType: 'percentage', discountValue: '10' },
      { id: 'csp2', customerId: 'cust2', customerName: 'Beta Corp', discountType: 'fixed', discountValue: '15' }
    ]
  } catch (error) {
    console.error('Error fetching customer specific pricing:', error)
    toast({
      title: 'Error',
      description: 'Failed to load customer pricing data',
      variant: 'destructive'
    })
  }
}

// Dialog and sheet handlers
const openPricingRuleEditor = (rule = null) => {
  console.log("Opening pricing rule editor with rule:", rule)
  selectedRule.value = formatForForm(rule)
  showPricingRuleEditorSheet.value = true
  console.log("Dialog state after:", showPricingRuleEditorSheet.value)
}

const openDeletePricingRuleDialog = (rule) => {
  console.log("Opening delete rule dialog with rule:", rule)
  selectedRule.value = formatForForm(rule)
  showDeletePricingRuleDialog.value = true
  console.log("Dialog state after:", showDeletePricingRuleDialog.value)
}

const openCustomerGroupEditor = (group = null) => {
  console.log("Opening customer group editor with group:", group)
  selectedCustomerGroup.value = formatForForm(group)
  showCustomerGroupEditorSheet.value = true
  console.log("Dialog state after:", showCustomerGroupEditorSheet.value)
}

const openDeleteCustomerGroupDialog = (group) => {
  console.log("Opening delete group dialog with group:", group)
  selectedCustomerGroup.value = formatForForm(group)
  showDeleteCustomerGroupDialog.value = true
  console.log("Dialog state after:", showDeleteCustomerGroupDialog.value)
}

const openGroupPricingEditor = (group) => {
  console.log("Opening group pricing editor with group:", group)
  selectedCustomerGroup.value = formatForForm(group)
  showGroupPricingEditorSheet.value = true
  console.log("Dialog state after:", showGroupPricingEditorSheet.value)
}

const openCustomerPricingEditor = (pricing = null) => {
  console.log("Opening customer pricing editor with pricing:", pricing)
  selectedCustomerPricing.value = formatForForm(pricing)
  showCustomerPricingEditorSheet.value = true
  console.log("Dialog state after:", showCustomerPricingEditorSheet.value)
}

const openDeleteCustomerPricingDialog = (pricing) => {
  console.log("Opening delete pricing dialog with pricing:", pricing)
  selectedCustomerPricing.value = formatForForm(pricing)
  showDeleteCustomerPricingDialog.value = true
  console.log("Dialog state after:", showDeleteCustomerPricingDialog.value)
}

const openImportSheet = (type) => {
  console.log("Opening import sheet with type:", type)
  importType.value = type
  showImportSheet.value = true
  console.log("Sheet state after:", showImportSheet.value)
}

// Action handlers
const handlePricingRuleSaved = async (rule, isNew = false) => {
  try {
    isProcessing.value = true
    // Convert string values back to numbers before saving
    const processedRule = prepareForSave(rule)
    
    if (isNew) {
      await pricingStore.createPromotion(processedRule)
      toast({
        title: 'Rule Created',
        description: 'Pricing rule has been created successfully',
        variant: 'success'
      })
    } else {
      await pricingStore.updatePromotion(processedRule.id, processedRule)
      toast({
        title: 'Rule Updated',
        description: 'Pricing rule has been updated successfully',
        variant: 'success'
      })
    }
    showPricingRuleEditorSheet.value = false
    await fetchPricingData()
  } catch (error) {
    console.error('Error saving pricing rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to save pricing rule',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handlePricingRuleDeleted = async (ruleId) => {
  try {
    isProcessing.value = true
    await pricingStore.deletePromotion(ruleId)
    toast({
      title: 'Rule Deleted',
      description: 'Pricing rule has been deleted successfully',
      variant: 'success'
    })
    showDeletePricingRuleDialog.value = false
    await fetchPricingData()
  } catch (error) {
    console.error('Error deleting pricing rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete pricing rule',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleDuplicatePricingRule = async (rule) => {
  try {
    isProcessing.value = true
    const duplicatedRule = { 
      ...rule,
      id: undefined, 
      name: `${rule.name} (Copy)`,
      createdAt: new Date().toISOString()
    }
    await pricingStore.createPromotion(duplicatedRule)
    toast({
      title: 'Rule Duplicated',
      description: 'Pricing rule has been duplicated successfully',
      variant: 'success'
    })
    await fetchPricingData()
  } catch (error) {
    console.error('Error duplicating pricing rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to duplicate pricing rule',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const togglePricingRuleStatus = async (rule) => {
  try {
    isProcessing.value = true
    const updatedRule = { 
      ...rule,
      isActive: !rule.isActive 
    }
    await pricingStore.updatePromotion(rule.id, updatedRule)
    toast({
      title: updatedRule.isActive ? 'Rule Activated' : 'Rule Deactivated',
      description: `Pricing rule has been ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`,
      variant: 'success'
    })
    await fetchPricingData()
  } catch (error) {
    console.error('Error toggling pricing rule status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update pricing rule status',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleCustomerGroupSaved = async (group, isNew = false) => {
  try {
    isProcessing.value = true
    if (isNew) {
      await pricingStore.createCustomerGroup(group)
      toast({
        title: 'Group Created',
        description: 'Customer group has been created successfully',
        variant: 'success'
      })
    } else {
      await pricingStore.updateCustomerGroup(group.id, group)
      toast({
        title: 'Group Updated',
        description: 'Customer group has been updated successfully',
        variant: 'success'
      })
    }
    showCustomerGroupEditorSheet.value = false
    await fetchCustomerGroups()
  } catch (error) {
    console.error('Error saving customer group:', error)
    toast({
      title: 'Error',
      description: 'Failed to save customer group',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleCustomerGroupDeleted = async (groupId) => {
  try {
    isProcessing.value = true
    await pricingStore.deleteCustomerGroup(groupId)
    toast({
      title: 'Group Deleted',
      description: 'Customer group has been deleted successfully',
      variant: 'success'
    })
    showDeleteCustomerGroupDialog.value = false
    await fetchCustomerGroups()
  } catch (error) {
    console.error('Error deleting customer group:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete customer group',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleGroupPricingSaved = async (groupPricing) => {
  try {
    isProcessing.value = true
    // In a real app, this would be updating the customer group with pricing data
    await pricingStore.updateCustomerGroup(groupPricing.groupId, { 
      pricingRules: groupPricing.pricingRules 
    })
    toast({
      title: 'Group Pricing Updated',
      description: 'Group pricing has been updated successfully',
      variant: 'success'
    })
    showGroupPricingEditorSheet.value = false
    await fetchCustomerGroups()
  } catch (error) {
    console.error('Error saving group pricing:', error)
    toast({
      title: 'Error',
      description: 'Failed to save group pricing',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleCustomerPricingSaved = async (customerPricing, isNew = false) => {
  try {
    isProcessing.value = true
    // Convert string values back to numbers before saving
    const processedPricing = prepareForSave(customerPricing)
    
    if (isNew) {
      customerSpecificPricing.value.push({
        ...processedPricing,
        id: `csp${Date.now()}`
      })
    } else {
      const index = customerSpecificPricing.value.findIndex(cp => cp.id === processedPricing.id)
      if (index !== -1) {
        customerSpecificPricing.value[index] = processedPricing
      }
    }
    
    toast({
      title: isNew ? 'Customer Pricing Created' : 'Customer Pricing Updated',
      description: `Customer pricing has been ${isNew ? 'created' : 'updated'} successfully`,
      variant: 'success'
    })
    showCustomerPricingEditorSheet.value = false
  } catch (error) {
    console.error('Error saving customer pricing:', error)
    toast({
      title: 'Error',
      description: 'Failed to save customer pricing',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleCustomerPricingDeleted = async (pricingId) => {
  try {
    isProcessing.value = true
    // Simulate API call - in a real app, this would interact with a store
    customerSpecificPricing.value = customerSpecificPricing.value.filter(
      cp => cp.id !== pricingId
    )
    
    toast({
      title: 'Customer Pricing Deleted',
      description: 'Customer pricing has been deleted successfully',
      variant: 'success'
    })
    showDeleteCustomerPricingDialog.value = false
  } catch (error) {
    console.error('Error deleting customer pricing:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete customer pricing',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const handleImportComplete = async (result) => {
  try {
    isProcessing.value = true
    if (result.success) {
      showImportSheet.value = false
      
      toast({
        title: 'Import Complete',
        description: `${result.importedCount} pricing rules have been imported successfully`,
        variant: 'success'
      })
      
      await fetchPricingData()
    } else {
      toast({
        title: 'Import Failed',
        description: result.error || 'Failed to import pricing data',
        variant: 'destructive'
      })
    }
  } catch (error) {
    console.error('Error handling import completion:', error)
  } finally {
    isProcessing.value = false
  }
}

// Initialize component
onMounted(async () => {
  await Promise.all([
    fetchPricingData(),
    fetchCustomers(),
    fetchProducts(),
    fetchCustomerSpecificPricing()
  ])
})
</script>