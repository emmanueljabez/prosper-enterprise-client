<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Leads</h2>
        <p class="text-muted-foreground">Manage your sales leads and customer opportunities</p>
      </div>
      <Button @click="openLeadsFormSheet">
        <PlusIcon class="h-4 w-4 mr-2" />
        New Lead
      </Button>
    </div>

    <!-- Leads Table -->
    <LeadsTable
      :leads="leads"
      :leadSources="leadSources"
      :loading="isLoading"
      @view-lead="openViewLeadDetails"
      @edit-lead="openEditLeadSheet"
      @delete-lead="openDeleteLeadDialog"
      @add-note="openAddNoteDialog"
      @assign-lead="openAssignLeadDialog"
      @update-status="openUpdateStatusDialog"
      @convert-lead="openConvertLeadDialog"
      @mark-lost="openMarkLostDialog"
      @refresh="fetchLeads"
    />

    <!-- Lead Details Dialog -->
    <Dialog v-model:open="showLeadDetailsDialog">
      <LeadDetailsDialog
        v-if="showLeadDetailsDialog"
        :lead="selectedLead"
        @edit-lead="openEditLeadSheet"
        @close="showLeadDetailsDialog = false"
      />
    </Dialog>

    <!-- Add/Edit Lead Sheet -->
    <Sheet v-model:open="showLeadsFormSheet">
      <LeadsFormSheet
        v-if="showLeadsFormSheet"
        :mode="leadFormMode"
        :lead="selectedLead"
        :leadSources="leadSources"
        :products="products"
        :serviceAreas="serviceAreas"
        @lead-added="handleLeadAdded"
        @lead-updated="handleLeadUpdated"
        @close="showLeadsFormSheet = false"
      />
    </Sheet>

    <!-- Update Status Dialog -->
    <Dialog v-model:open="showStatusDialog">
      <UpdateStatusDialog
        v-if="showStatusDialog"
        :lead="selectedLead"
        @status-updated="handleStatusUpdated"
        @close="showStatusDialog = false"
      />
    </Dialog>

    <!-- Assign Lead Dialog -->
    <Dialog v-model:open="showAssignDialog">
      <AssignLeadDialog
        v-if="showAssignDialog"
        :lead="selectedLead"
        :users="users"
        @lead-assigned="handleLeadAssigned"
        @close="showAssignDialog = false"
      />
    </Dialog>

    <!-- Add Note Dialog -->
    <Dialog v-model:open="showNoteDialog">
      <AddNoteDialog
        v-if="showNoteDialog"
        :lead="selectedLead"
        @note-added="handleNoteAdded"
        @close="showNoteDialog = false"
      />
    </Dialog>

    <!-- Convert Lead Dialog -->
    <Dialog v-model:open="showConvertDialog">
      <ConvertLeadDialog
        v-if="showConvertDialog"
        :lead="selectedLead"
        @lead-converted="handleLeadConverted"
        @close="showConvertDialog = false"
      />
    </Dialog>

    <!-- Mark as Lost Dialog -->
    <Dialog v-model:open="showLostDialog">
      <MarkLostDialog
        v-if="showLostDialog"
        :lead="selectedLead"
        @lead-lost="handleLeadLost"
        @close="showLostDialog = false"
      />
    </Dialog>

    <!-- Delete Lead Dialog -->
    <DeleteLeadDialog
      v-model:open="showDeleteLeadDialog"
      :lead="selectedLead"
      @delete="handleLeadDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

// Components
import LeadsTable from '@/components/sales/leads/LeadsTable.vue'
import LeadsFormSheet from '@/components/sales/leads/LeadsFormSheet.vue'
import LeadDetailsDialog from '@/components/sales/leads/LeadDetailsDialog.vue'
import UpdateStatusDialog from '@/components/sales/leads/UpdateStatusDialog.vue'
import AssignLeadDialog from '@/components/sales/leads/AssignLeadDialog.vue'
import AddNoteDialog from '@/components/sales/leads/AddNoteDialog.vue'
import ConvertLeadDialog from '@/components/sales/leads/ConvertLeadDialog.vue'
import MarkLostDialog from '@/components/sales/leads/MarkLostDialog.vue'
import DeleteLeadDialog from '@/components/sales/leads/DeleteLeadDialog.vue'

// Stores
import { useLeadsStore } from '@/store/modules/sales/leads'
import { useLeadsManagementStore } from '@/store/modules/administration/configuration/sales-settings/leads-management'
import { useProductsStore } from '@/store/modules/administration/products/products'
import { useServiceCoverageAreasStore } from '@/store/modules/administration/configuration/organization/service-coverage-areas'

// Initialize stores
const leadsStore = useLeadsStore()
const leadSourcesStore = useLeadsManagementStore()
const productsStore = useProductsStore()
const serviceCoverageAreasStore = useServiceCoverageAreasStore()
const { toast } = useToast()

// Access store state through computed properties
const leads = computed(() => leadsStore.getLeads)
const leadSources = computed(() => leadSourcesStore.getLeadsSources)
const products = computed(() => productsStore.getProducts)
const serviceAreas = computed(() => serviceCoverageAreasStore.getServiceAreas)
const isLoading = computed(() => leadsStore.getIsLoading)
const error = computed(() => leadsStore.getError)

// State management
const selectedLead = ref(null)

// UI control
const showLeadDetailsDialog = ref(false)
const showLeadsFormSheet = ref(false)
const showStatusDialog = ref(false)
const showAssignDialog = ref(false)
const showNoteDialog = ref(false)
const showConvertDialog = ref(false)
const showLostDialog = ref(false)
const showDeleteLeadDialog = ref(false)
const leadFormMode = ref('add')

// Available users for assignment - replace with API data when available
const users = ref([
  { id: 'USER001', name: 'Robert Kimani' },
  { id: 'USER002', name: 'Faith Wanjiku' },
  { id: 'USER003', name: 'John Mwangi' },
  { id: 'USER004', name: 'Grace Njeri' }
])

// Fetch leads from API
const fetchLeads = async () => {
  try {
    await leadsStore.fetchLeads()
  } catch (error) {
    console.error('Error fetching leads:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Fetch lead sources for dropdown menus
const fetchLeadSources = async () => {
  try {
    await leadSourcesStore.fetchLeadSources()
  } catch (error) {
    console.error('Error fetching lead sources:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// fetch products for dropdown menus
const fetchProducts = async () => {
  try {
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Fetch service coverage areas for dropdown menus
const fetchServiceAreas = async () => {
  try {
    await serviceCoverageAreasStore.fetchServiceAreas()
  } catch (error) {
    console.error('Error fetching service coverage areas:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

// Sheet and dialog handlers
function openViewLeadDetails(lead) {
  selectedLead.value = lead
  showLeadDetailsDialog.value = true
}

function openLeadsFormSheet() {
  leadFormMode.value = 'add'
  selectedLead.value = null
  showLeadsFormSheet.value = true
}

function openEditLeadSheet(lead) {
  leadFormMode.value = 'edit'
  selectedLead.value = lead
  showLeadsFormSheet.value = true
}

function openUpdateStatusDialog(lead) {
  selectedLead.value = lead
  showStatusDialog.value = true
}

function openAssignLeadDialog(lead) {
  selectedLead.value = lead
  showAssignDialog.value = true
}

function openAddNoteDialog(lead) {
  selectedLead.value = lead
  showNoteDialog.value = true
}

function openConvertLeadDialog(lead) {
  selectedLead.value = lead
  showConvertDialog.value = true
}

function openMarkLostDialog(lead) {
  selectedLead.value = lead
  showLostDialog.value = true
}

function openDeleteLeadDialog(lead) {
  selectedLead.value = lead
  showDeleteLeadDialog.value = true
}

// CRUD operations
async function handleLeadAdded(newLead) {
  try {
    await leadsStore.createLead(newLead)
    showLeadsFormSheet.value = false
    
    toast({
      title: 'Lead Created',
      description: `Lead for ${newLead.firstName} ${newLead.lastName} has been created.`,
      variant: 'success'
    })
    
    // Refresh the list
    await fetchLeads()
  } catch (error) {
    console.error('Error creating lead:', error)
    toast({
      title: 'Error',
      description: 'Failed to create lead. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleLeadUpdated(updatedLead) {
  try {
    await leadsStore.updateLead(updatedLead)
    showLeadsFormSheet.value = false
    
    toast({
      title: 'Lead Updated',
      description: `Lead for ${updatedLead.firstName} ${updatedLead.lastName} has been updated.`,
      variant: 'success'
    })
    
    await fetchLeads()
  } catch (error) {
    console.error('Error updating lead:', error)
    toast({
      title: 'Error',
      description: 'Failed to update lead. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleLeadDeleted(lead) {
  try {
    await leadsStore.deleteLead(lead.id)
    showDeleteLeadDialog.value = false
    
    toast({
      title: 'Lead Deleted',
      description: `Lead for ${lead.firstName} ${lead.lastName} has been deleted.`,
      variant: 'success'
    })
    
    // Refresh the list
    await fetchLeads()
  } catch (error) {
    console.error('Error deleting lead:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete lead. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleStatusUpdated({ lead, status, reason }) {
  try {
    await leadsStore.updateLead({
      ...lead,
      status: status,
      statusReason: reason || ''
    })
    
    showStatusDialog.value = false
    toast({
      title: "Status Updated",
      description: `Lead status changed to ${status}`,
      variant: 'success'
    })
    
    await fetchLeads()
  } catch (error) {
    console.error('Error updating lead status:', error)
    toast({
      title: 'Error',
      description: 'Failed to update lead status. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleLeadAssigned({ lead, userId, userName }) {
  try {
    await leadsStore.assignLead(lead.id, { userId })
    
    showAssignDialog.value = false
    toast({
      title: "Lead Assigned",
      description: `Lead assigned to ${userName}`,
      variant: 'success'
    })
    
    await fetchLeads()
  } catch (error) {
    console.error('Error assigning lead:', error)
    toast({
      title: 'Error',
      description: 'Failed to assign lead. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleNoteAdded({ lead, note }) {
  try {
    // Implement API call to add note
    showNoteDialog.value = false
    toast({
      title: "Note Added",
      description: `Note added to lead`,
      variant: 'success'
    })
    
    await fetchLeads()
  } catch (error) {
    console.error('Error adding note:', error)
    toast({
      title: 'Error',
      description: 'Failed to add note. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleLeadConverted({ lead }) {
  try {
    await leadsStore.convertToOpportunity(lead.id)
    
    showConvertDialog.value = false
    toast({
      title: "Lead Converted",
      description: `Lead successfully converted to opportunity`,
      variant: 'success'
    })
    
    await fetchLeads()
  } catch (error) {
    console.error('Error converting lead:', error)
    toast({
      title: 'Error',
      description: 'Failed to convert lead. Please try again.',
      variant: 'destructive'
    })
  }
}

async function handleLeadLost({ lead, reason }) {
  try {
    await leadsStore.updateLead({
      ...lead,
      status: 'LOST',
      lostReason: reason
    })
    
    showLostDialog.value = false
    toast({
      title: "Lead Lost",
      description: `Lead marked as lost`,
      variant: 'success'
    })
    
    await fetchLeads()
  } catch (error) {
    console.error('Error marking lead as lost:', error)
    toast({
      title: 'Error',
      description: 'Failed to update lead status. Please try again.',
      variant: 'destructive'
    })
  }
}

// Initialize component
onMounted(() => {
  fetchLeads()
  fetchLeadSources()
  fetchProducts()
  fetchServiceAreas()
})
</script>