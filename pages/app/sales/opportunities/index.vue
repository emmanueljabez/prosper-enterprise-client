<template>
  <div>
    <OpportunitiesTable
        :opportunities="opportunities"
        :isLoading="isLoading"
        @add-opportunity="addOpportunitySheet = true"
        @view-opportunity="viewOpportunityDetails"
        @edit-opportunity="editOpportunity"
        @delete-opportunity="confirmDeleteOpportunity"
        @stage-change="handleStageChange"
        @refresh="loadOpportunities"
    />

    <!-- Add Opportunity Sheet -->
    <AddOpportunitySheet
        v-model:open="addOpportunitySheet"
        :leads="leads"
        :services="services"
        @opportunity-created="handleOpportunityCreated"
    />

    <!-- Edit Opportunity Sheet -->
    <EditOpportunitySheet
        v-model:open="editOpportunitySheet"
        :opportunity="selectedOpportunity"
        :leads="leads"
        :services="services"
        @opportunity-updated="handleOpportunityUpdated"
    />

    <!-- Opportunity Details Dialog -->
    <OpportunityDetailsDialog
        v-model:open="opportunityDetailsDialog"
        :opportunity="selectedOpportunity"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete this opportunity. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialog = false">Cancel</Button>
          <Button variant="destructive" @click="deleteOpportunity" :disabled="isDeleting">
            <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            <span>Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/components/ui/toast'
import { Loader2Icon } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import OpportunitiesTable from '@/components/sales/opportunities/OpportunitiesTable.vue'
import AddOpportunitySheet from '@/components/sales/opportunities/AddOpportunitySheet.vue'
import EditOpportunitySheet from '@/components/sales/opportunities/EditOpportunitySheet.vue'
import OpportunityDetailsDialog from '@/components/sales/opportunities/OpportunityDetailsDialog.vue'

// State
const opportunities = ref([])
const leads = ref([])
const services = ref([])
const isLoading = ref(true)
const isDeleting = ref(false)

// UI state
const addOpportunitySheet = ref(false)
const editOpportunitySheet = ref(false)
const opportunityDetailsDialog = ref(false)
const deleteDialog = ref(false)
const selectedOpportunity = ref(null)

// Toast
const { toast } = useToast()

// Fetch data
async function loadOpportunities() {
  isLoading.value = true

  try {
    // In a real app, these would be API calls
    await Promise.all([
      fetchOpportunities(),
      fetchLeads(),
      fetchServices()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
    toast({
      title: 'Error',
      description: 'Failed to load opportunities data',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

async function fetchOpportunities() {
  // Simulate API call with delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Sample data
  opportunities.value = [
    {
      id: 'OPP-K1001',
      name: 'Enterprise Fiber Installation',
      leadId: 'LEAD-K001',
      lead: {
        id: 'LEAD-K001',
        name: 'Daniel Kipchoge',
        email: 'daniel.k@gmail.com',
        phone: '+254 712 345 678',
        company: null,
        type: 'individual'
      },
      stage: 'proposal',
      amount: 250000,
      currency: 'KES',
      probability: 70,
      expectedCloseDate: '2023-12-15',
      services: [
        { id: 'fiber-200', name: 'Fiber Internet 200Mbps', price: 15000 },
        { id: 'installation', name: 'Professional Installation', price: 35000 }
      ],
      notes: 'Client is interested in our enterprise fiber solution',
      createdAt: '2023-11-10T09:45:00Z',
      updatedAt: '2023-11-15T14:30:00Z',
      assignedTo: 'John Doe',
      activities: [
        {
          id: 'act-1',
          type: 'call',
          description: 'Initial consultation call',
          date: '2023-11-10T10:00:00Z',
          performer: 'John Doe'
        },
        {
          id: 'act-2',
          type: 'meeting',
          description: 'Site survey completed',
          date: '2023-11-14T14:00:00Z',
          performer: 'Sarah Kim'
        }
      ]
    },
    {
      id: 'OPP-K1002',
      name: 'SMB Network Setup',
      leadId: 'LEAD-K006',
      lead: {
        id: 'LEAD-K006',
        name: 'Equity Bank Kenya',
        email: 'infrastructure@equitybank.co.ke',
        phone: '+254 711 456 789',
        company: 'Equity Bank Kenya',
        type: 'business'
      },
      stage: 'qualification',
      amount: 120000,
      currency: 'KES',
      probability: 40,
      expectedCloseDate: '2023-12-30',
      services: [
        { id: 'fiber-50', name: 'Fiber Internet 50Mbps', price: 8000 },
        { id: 'voip', name: 'VoIP Phone System', price: 25000 }
      ],
      notes: 'Small branch office looking for connectivity solution',
      createdAt: '2023-11-12T11:20:00Z',
      updatedAt: '2023-11-12T11:20:00Z',
      assignedTo: 'Jane Smith',
      activities: []
    },
    {
      id: 'OPP-K1003',
      name: 'Residential Package Upgrade',
      leadId: 'LEAD-K003',
      lead: {
        id: 'LEAD-K003',
        name: 'Margaret Wambui',
        email: 'margaret.w@yahoo.com',
        phone: '+254 733 789 012',
        company: null,
        type: 'individual'
      },
      stage: 'closed_won',
      amount: 45000,
      currency: 'KES',
      probability: 100,
      expectedCloseDate: '2023-11-05',
      services: [
        { id: 'fiber-100', name: 'Fiber Internet 100Mbps', price: 12000 },
        { id: 'iptv', name: 'IPTV Package', price: 3000 }
      ],
      notes: 'Existing client upgrading from 50Mbps to 100Mbps + TV',
      createdAt: '2023-10-20T08:15:00Z',
      updatedAt: '2023-11-05T16:45:00Z',
      assignedTo: 'John Doe',
      activities: [
        {
          id: 'act-3',
          type: 'email',
          description: 'Sent upgrade options',
          date: '2023-10-22T09:30:00Z',
          performer: 'John Doe'
        },
        {
          id: 'act-4',
          type: 'call',
          description: 'Client confirmed upgrade',
          date: '2023-10-25T14:20:00Z',
          performer: 'John Doe'
        }
      ]
    },
    {
      id: 'OPP-K1004',
      name: 'Hotel WiFi Solution',
      leadId: 'LEAD-K004',
      lead: {
        id: 'LEAD-K004',
        name: 'Kenya Airways',
        email: 'it@kenya-airways.com',
        phone: '+254 725 567 890',
        company: 'Kenya Airways',
        type: 'business'
      },
      stage: 'closed_lost',
      amount: 350000,
      currency: 'KES',
      probability: 0,
      expectedCloseDate: '2023-10-30',
      services: [
        { id: 'wifi-enterprise', name: 'Enterprise WiFi Solution', price: 250000 },
        { id: 'support-premium', name: 'Premium Support Plan', price: 100000 }
      ],
      notes: 'Lost to competitor offering lower price point',
      createdAt: '2023-09-15T10:30:00Z',
      updatedAt: '2023-10-30T17:00:00Z',
      assignedTo: 'Jane Smith',
      activities: [
        {
          id: 'act-5',
          type: 'proposal',
          description: 'Submitted initial proposal',
          date: '2023-09-20T11:00:00Z',
          performer: 'Jane Smith'
        }
      ]
    },
    {
      id: 'OPP-K1005',
      name: 'Government Office Connectivity',
      leadId: 'LEAD-K005',
      lead: {
        id: 'LEAD-K005',
        name: 'Esther Nyambura',
        email: 'enyambura@hotmail.com',
        phone: '+254 700 234 567',
        company: 'Ministry of ICT',
        type: 'business'
      },
      stage: 'negotiation',
      amount: 500000,
      currency: 'KES',
      probability: 80,
      expectedCloseDate: '2023-12-20',
      services: [
        { id: 'fiber-500', name: 'Fiber Internet 500Mbps', price: 35000 },
        { id: 'mpls', name: 'MPLS Network', price: 150000 },
        { id: 'security', name: 'Network Security Suite', price: 200000 }
      ],
      notes: 'Government tender in final stages of negotiation',
      createdAt: '2023-10-01T08:00:00Z',
      updatedAt: '2023-11-18T09:15:00Z',
      assignedTo: 'Robert Ngugi',
      activities: [
        {
          id: 'act-6',
          type: 'meeting',
          description: 'Requirements gathering session',
          date: '2023-10-05T10:00:00Z',
          performer: 'Robert Ngugi'
        },
        {
          id: 'act-7',
          type: 'proposal',
          description: 'Formal tender submission',
          date: '2023-10-15T16:30:00Z',
          performer: 'Robert Ngugi'
        }
      ]
    }
  ]
}

async function fetchLeads() {
  // Simulate API call with delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Sample leads data
  leads.value = [
    {
      id: 'LEAD-K001',
      name: 'Daniel Kipchoge',
      email: 'daniel.k@gmail.com',
      phone: '+254 712 345 678',
      company: null,
      type: 'individual',
      status: 'contacted'
    },
    {
      id: 'LEAD-K002',
      name: 'Jane Njeri',
      email: 'jane.njeri@outlook.com',
      phone: '+254 722 456 789',
      company: 'Njeri Enterprises',
      type: 'business',
      status: 'new'
    },
    {
      id: 'LEAD-K003',
      name: 'Margaret Wambui',
      email: 'margaret.w@yahoo.com',
      phone: '+254 733 789 012',
      company: null,
      type: 'individual',
      status: 'qualified'
    },
    {
      id: 'LEAD-K004',
      name: 'Kenya Airways',
      email: 'it@kenya-airways.com',
      phone: '+254 725 567 890',
      company: 'Kenya Airways',
      type: 'business',
      status: 'nurturing'
    },
    {
      id: 'LEAD-K005',
      name: 'Esther Nyambura',
      email: 'enyambura@hotmail.com',
      phone: '+254 700 234 567',
      company: 'Ministry of ICT',
      type: 'business',
      status: 'qualified'
    },
    {
      id: 'LEAD-K006',
      name: 'Equity Bank Kenya',
      email: 'infrastructure@equitybank.co.ke',
      phone: '+254 711 456 789',
      company: 'Equity Bank Kenya',
      type: 'business',
      status: 'qualified'
    }
  ]
}

async function fetchServices() {
  // Simulate API call with delay
  await new Promise(resolve => setTimeout(resolve, 600))

  // Sample services data
  services.value = [
    {
      id: 'fiber-50',
      name: 'Fiber Internet 50Mbps',
      description: 'Fiber optic internet connection with 50Mbps speed',
      category: 'internet',
      price: 8000
    },
    {
      id: 'fiber-100',
      name: 'Fiber Internet 100Mbps',
      description: 'Fiber optic internet connection with 100Mbps speed',
      category: 'internet',
      price: 12000
    },
    {
      id: 'fiber-200',
      name: 'Fiber Internet 200Mbps',
      description: 'Fiber optic internet connection with 200Mbps speed',
      category: 'internet',
      price: 15000
    },
    {
      id: 'fiber-500',
      name: 'Fiber Internet 500Mbps',
      description: 'Fiber optic internet connection with 500Mbps speed',
      category: 'internet',
      price: 35000
    },
    {
      id: 'iptv',
      name: 'IPTV Package',
      description: 'Digital TV package delivered over internet protocol',
      category: 'tv',
      price: 3000
    },
    {
      id: 'voip',
      name: 'VoIP Phone System',
      description: 'Voice over IP telephone system with multiple lines',
      category: 'voice',
      price: 25000
    },
    {
      id: 'installation',
      name: 'Professional Installation',
      description: 'Professional installation and setup of services',
      category: 'installation',
      price: 35000
    },
    {
      id: 'wifi-enterprise',
      name: 'Enterprise WiFi Solution',
      description: 'Complete enterprise-grade WiFi network solution',
      category: 'internet',
      price: 250000
    },
    {
      id: 'mpls',
      name: 'MPLS Network',
      description: 'Multiprotocol Label Switching network for multi-location businesses',
      category: 'internet',
      price: 150000
    },
    {
      id: 'security',
      name: 'Network Security Suite',
      description: 'Comprehensive network security solution including firewall and threat protection',
      category: 'cloud',
      price: 200000
    },
    {
      id: 'support-premium',
      name: 'Premium Support Plan',
      description: '24/7 premium technical support with guaranteed response times',
      category: 'cloud',
      price: 100000
    }
  ]
}

// View opportunity details
function viewOpportunityDetails(opportunity) {
  selectedOpportunity.value = opportunity
  opportunityDetailsDialog.value = true
}

// Edit opportunity
function editOpportunity(opportunity) {
  selectedOpportunity.value = opportunity
  editOpportunitySheet.value = true
}

// Confirm delete
function confirmDeleteOpportunity(opportunity) {
  selectedOpportunity.value = opportunity
  deleteDialog.value = true
}

// Delete opportunity
async function deleteOpportunity() {
  if (!selectedOpportunity.value) return

  try {
    isDeleting.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Remove from local state
    opportunities.value = opportunities.value.filter(
        opp => opp.id !== selectedOpportunity.value.id
    )

    toast({
      title: 'Opportunity Deleted',
      description: `${selectedOpportunity.value.name} has been deleted.`
    })

    deleteDialog.value = false
    selectedOpportunity.value = null
  } catch (error) {
    console.error('Error deleting opportunity:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete opportunity. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isDeleting.value = false
  }
}

// Handle stage change
function handleStageChange({ opportunity, stage }) {
  // Find the opportunity in our array
  const index = opportunities.value.findIndex(opp => opp.id === opportunity.id)

  if (index !== -1) {
    // Update stage
    opportunities.value[index] = {
      ...opportunities.value[index],
      stage,
      updatedAt: new Date().toISOString()
    }

    // Update probability based on stage
    const stageProbabilities = {
      'prospecting': 10,
      'qualification': 30,
      'needs_analysis': 40,
      'proposal': 60,
      'negotiation': 80,
      'closed_won': 100,
      'closed_lost': 0
    }

    opportunities.value[index].probability = stageProbabilities[stage] || opportunities.value[index].probability

    toast({
      title: 'Opportunity Updated',
      description: `${opportunity.name} moved to ${formatStageName(stage)}.`
    })
  }
}

// Handle opportunity creation
function handleOpportunityCreated(opportunity) {
  opportunities.value.unshift(opportunity)
  toast({
    title: 'Opportunity Created',
    description: `${opportunity.name} has been created.`
  })
}

// Handle opportunity update
function handleOpportunityUpdated(opportunity) {
  const index = opportunities.value.findIndex(opp => opp.id === opportunity.id)
  if (index !== -1) {
    opportunities.value[index] = opportunity
  }
  toast({
    title: 'Opportunity Updated',
    description: `${opportunity.name} has been updated.`
  })
}

// Helper to format stage names
function formatStageName(stage) {
  const stageMap = {
    'prospecting': 'Prospecting',
    'qualification': 'Qualification',
    'needs_analysis': 'Needs Analysis',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  }

  return stageMap[stage] || stage
}

// Initialize component
onMounted(() => {
  loadOpportunities()
})
</script>