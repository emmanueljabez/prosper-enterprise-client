<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Sales Channels Pricing</h2>
        <p class="text-muted-foreground">Manage pricing strategies across different sales channels</p>
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
            <DropdownMenuItem @click="openImportSheet('api')">
              <Webhook class="h-4 w-4 mr-2" />
              Import via API
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="openChannelEditor()">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Sales Channel
        </Button>
      </div>
    </div>

    <!-- Tabs for different views -->
    <Tabs defaultValue="overview" class="w-full">
      <TabsList class="grid grid-cols-3 w-full max-w-lg">
        <TabsTrigger value="overview">
          <LayoutGridIcon class="h-4 w-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="channels">
          <ShoppingBagIcon class="h-4 w-4 mr-2" />
          Channels
        </TabsTrigger>
        <TabsTrigger value="pricing-rules">
          <SettingsIcon class="h-4 w-4 mr-2" />
          Pricing Rules
        </TabsTrigger>
      </TabsList>

      <!-- Overview Tab -->
      <TabsContent value="overview" class="space-y-6">
        <SalesChannelsOverview 
          :salesChannels="salesChannels"
          :customerGroups="customerGroups"
          :loading="isLoading"
        />
      </TabsContent>

      <!-- Channels Tab -->
      <TabsContent value="channels" class="space-y-6">
        <SalesChannelsTable
          :salesChannels="salesChannels"
          :loading="isLoading"
          @view-channel="openChannelDetails"
          @edit-channel="openChannelEditor"
          @delete-channel="openDeleteChannelDialog"
          @edit-pricing="openChannelPricingEditor"
          @refresh="fetchSalesChannels"
        />
      </TabsContent>

      <!-- Pricing Rules Tab -->
      <TabsContent value="pricing-rules" class="space-y-6">
        <SalesChannelPricingRules
          :salesChannels="salesChannels"
          :customerGroups="customerGroups"
          :loading="isLoading"
          @edit-rule="openPricingRuleEditor"
          @refresh="fetchSalesChannels"
        />
      </TabsContent>
    </Tabs>
  </div>

  <!-- Dialogs and Sheets -->
  <!-- Channel Editor Sheet -->
  <Sheet v-model:open="showChannelEditorSheet" position="right" size="lg">
    <SalesChannelEditorSheet
      v-if="showChannelEditorSheet"
      :salesChannel="selectedChannel"
      @channel-created="handleChannelCreated"
      @channel-updated="handleChannelUpdated"
      @close="showChannelEditorSheet = false"
    />
  </Sheet>

  <!-- Channel Details Dialog -->
  <Dialog v-model:open="showChannelDetailsDialog">
    <SalesChannelDetailsDialog
      v-if="showChannelDetailsDialog"
      :salesChannel="selectedChannel"
      @edit-channel="openChannelEditor"
      @edit-pricing="openChannelPricingEditor"
      @close="showChannelDetailsDialog = false"
    />
  </Dialog>

  <!-- Channel Pricing Editor Sheet -->
  <Sheet v-model:open="showChannelPricingEditorSheet" position="right" size="xl">
    <SalesChannelPricingEditorSheet
      v-if="showChannelPricingEditorSheet"
      :salesChannel="selectedChannel"
      :customerGroups="customerGroups"
      @pricing-updated="handlePricingUpdated"
      @close="showChannelPricingEditorSheet = false"
    />
  </Sheet>

  <!-- Delete Channel Dialog -->
  <Dialog v-model:open="showDeleteChannelDialog">
    <DeleteSalesChannelDialog
      v-if="showDeleteChannelDialog"
      :salesChannel="selectedChannel"
      @delete="handleChannelDeleted"
      @close="showDeleteChannelDialog = false"
    />
  </Dialog>

  <!-- Pricing Rule Editor Dialog -->
  <Dialog v-model:open="showPricingRuleEditorDialog">
    <SalesChannelPricingRuleEditor
      v-if="showPricingRuleEditorDialog"
      :rule="selectedPricingRule"
      :salesChannels="salesChannels"
      :customerGroups="customerGroups"
      @rule-updated="handlePricingRuleUpdated"
      @close="showPricingRuleEditorDialog = false"
    />
  </Dialog>

  <!-- Import Sheet -->
  <Sheet v-model:open="showImportSheet" position="right" size="lg">
  <PricingImportSheet
    v-if="showImportSheet"
    :salesChannel="selectedChannel || {name: 'Default Channel'}"
    :products="products || []"
    :importType="importType"
    @import-complete="handleImportComplete"
    @import-prices="handleImportPrices"
    @close="showImportSheet = false"
  />
</Sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileUp, ChevronDown, FileSpreadsheet, Table2, Webhook,
  ShoppingBagIcon, LayoutGridIcon, SettingsIcon
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Components
import SalesChannelsTable from '@/components/price-management/sales-channels/SalesChannelsTable.vue'
import SalesChannelsOverview from '@/components/price-management/sales-channels/SalesChannelsOverview.vue'
import SalesChannelDetailsDialog from '@/components/price-management/sales-channels/SalesChannelDetailsDialog.vue'
import SalesChannelEditorSheet from '@/components/price-management/sales-channels/SalesChannelEditorSheet.vue'
import SalesChannelPricingEditorSheet from '@/components/price-management/sales-channels/SalesChannelPricingEditorSheet.vue'
import DeleteSalesChannelDialog from '@/components/price-management/sales-channels/DeleteSalesChannelDialog.vue'
import SalesChannelPricingRules from '@/components/price-management/sales-channels/SalesChannelPricingRules.vue'
import SalesChannelPricingRuleEditor from '@/components/price-management/sales-channels/SalesChannelPricingRuleEditor.vue'
import PricingImportSheet from '@/components/price-management/sales-channels/PricingImportSheet.vue'

// Stores
import { usePricingStore } from '@/store/modules/price-mangement/pricing'

// Initialize stores
const pricingStore = usePricingStore()
const { toast } = useToast()

// Access store state through computed properties
const salesChannels = computed(() => pricingStore.getSalesChannels)
const customerGroups = computed(() => pricingStore.getCustomerGroups)
const products = computed(() => pricingStore.getProducts || [])
const isLoading = computed(() => pricingStore.getIsLoading)
const error = computed(() => pricingStore.getError)

// State management
const selectedChannel = ref(null)
const selectedPricingRule = ref(null)

// UI control
const showChannelEditorSheet = ref(false)
const showChannelDetailsDialog = ref(false)
const showChannelPricingEditorSheet = ref(false)
const showDeleteChannelDialog = ref(false)
const showPricingRuleEditorDialog = ref(false)
const showImportSheet = ref(false)
const importType = ref('csv')

// Fetch data from APIs
const fetchSalesChannels = async () => {
  try {
    await pricingStore.fetchSalesChannels()
  } catch (error) {
    console.error('Error fetching sales channels:', error)
    toast({
      title: 'Error',
      description: 'Failed to load sales channels',
      variant: 'destructive'
    })
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

// Dialog and sheet handlers
const openChannelEditor = (channel = null) => {
  selectedChannel.value = channel
  showChannelEditorSheet.value = true
}

const openChannelDetails = (channel) => {
  selectedChannel.value = channel
  showChannelDetailsDialog.value = true
}

const openChannelPricingEditor = (channel) => {
  selectedChannel.value = channel
  showChannelPricingEditorSheet.value = true
}

const openDeleteChannelDialog = (channel) => {
  selectedChannel.value = channel
  showDeleteChannelDialog.value = true
}

const openPricingRuleEditor = (rule) => {
  selectedPricingRule.value = rule
  showPricingRuleEditorDialog.value = true
}

const openImportSheet = (type) => {
  importType.value = type
  showImportSheet.value = true
}

// CRUD operation handlers
const handleChannelCreated = async (newChannel) => {
  try {
    await pricingStore.createSalesChannel(newChannel)
    showChannelEditorSheet.value = false
    
    toast({
      title: 'Channel Created',
      description: `${newChannel.name} has been created successfully.`,
      variant: 'success'
    })
    
    await fetchSalesChannels()
  } catch (error) {
    console.error('Error creating sales channel:', error)
    toast({
      title: 'Error',
      description: 'Failed to create sales channel. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleChannelUpdated = async (updatedChannel) => {
  try {
    await pricingStore.updateSalesChannel(updatedChannel.id, updatedChannel)
    showChannelEditorSheet.value = false
    
    toast({
      title: 'Channel Updated',
      description: `${updatedChannel.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchSalesChannels()
  } catch (error) {
    console.error('Error updating sales channel:', error)
    toast({
      title: 'Error',
      description: 'Failed to update sales channel. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleChannelDeleted = async (channel) => {
  try {
    await pricingStore.deleteSalesChannel(channel.id)
    showDeleteChannelDialog.value = false
    
    toast({
      title: 'Channel Deleted',
      description: `${channel.name} has been deleted.`,
      variant: 'success'
    })
    
    await fetchSalesChannels()
  } catch (error) {
    console.error('Error deleting sales channel:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete sales channel. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePricingUpdated = async (channelId, pricingData) => {
  try {
    // Find the channel
    const channel = salesChannels.value.find(c => c.id === channelId)
    if (!channel) throw new Error('Channel not found')
    
    // Update channel with new pricing data
    const updatedChannel = {
      ...channel,
      pricingStrategy: pricingData.pricingStrategy,
      markupPercentage: pricingData.markupPercentage,
      // Add other pricing fields that were updated
    }
    
    await pricingStore.updateSalesChannel(channelId, updatedChannel)
    showChannelPricingEditorSheet.value = false
    
    toast({
      title: 'Pricing Updated',
      description: `Pricing for ${channel.name} has been updated successfully.`,
      variant: 'success'
    })
    
    await fetchSalesChannels()
  } catch (error) {
    console.error('Error updating pricing:', error)
    toast({
      title: 'Error',
      description: 'Failed to update pricing. Please try again.',
      variant: 'destructive'
    })
  }
}

const handlePricingRuleUpdated = async (rule) => {
  try {
    // This would call an appropriate API or store method
    // For now we'll just simulate success
    showPricingRuleEditorDialog.value = false
    
    toast({
      title: 'Pricing Rule Updated',
      description: 'Pricing rule has been updated successfully.',
      variant: 'success'
    })
    
    await fetchSalesChannels()
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    toast({
      title: 'Error',
      description: 'Failed to update pricing rule. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportComplete = async (result) => {
  if (result.success) {
    showImportSheet.value = false
    
    toast({
      title: 'Import Complete',
      description: `${result.count} items have been imported successfully.`,
      variant: 'success'
    })
    
    await fetchSalesChannels()
  } else {
    toast({
      title: 'Import Failed',
      description: result.error || 'Failed to import data. Please try again.',
      variant: 'destructive'
    })
  }
}

const handleImportPrices = async (data) => {
  try {
    // Process the import data - in a real app, you would call an API or store method
    console.log('Importing prices:', data)
    
    // Return a simulated result
    return {
      success: true,
      count: data.prices.length,
      message: `${data.prices.length} prices imported successfully for ${data.salesChannelId}`
    }
  } catch (error) {
    console.error('Error importing prices:', error)
    return {
      success: false,
      error: 'Failed to import pricing data'
    }
  }
}

// Initialize component
onMounted(() => {
  fetchSalesChannels()
  fetchCustomerGroups()
})
</script>

<style>
/* These styles ensure dialogs appear on top of other content */
.DialogOverlay {
  z-index: 50;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.DialogContent {
  z-index: 51;
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90vw;
  max-height: 85vh;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.SheetOverlay {
  z-index: 49;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.SheetContent {
  z-index: 50;
  background-color: white;
  box-shadow: hsl(206 22% 7% / 35%) -10px 0px 38px -10px;
  position: fixed;
  top: 0;
  bottom: 0;
  overflow-y: auto;
}

@keyframes overlayShow {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes contentShow {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
</style>