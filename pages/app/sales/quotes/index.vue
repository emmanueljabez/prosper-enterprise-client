<template>
  <div>
    <QuotesTable
        :quotes="quotes"
        :isLoading="isLoading"
        @add-quote="addQuoteSheet = true"
        @view-quote="viewQuoteDetails"
        @edit-quote="editQuote"
        @delete-quote="confirmDeleteQuote"
        @send-quote="openSendQuoteDialog"
        @convert-quote="convertToOrder"
        @refresh="loadQuotes"
    />

    <!-- Add Quote Sheet -->
    <AddQuoteSheet
        v-model:open="addQuoteSheet"
        :customers="customers"
        :services="services"
        @quote-created="handleQuoteCreated"
    />

    <!-- Edit Quote Sheet -->
    <EditQuoteSheet
        v-model:open="editQuoteSheet"
        :quote="selectedQuote"
        :customers="customers"
        :services="services"
        @quote-updated="handleQuoteUpdated"
    />

    <!-- Quote Details Dialog -->
    <QuoteDetailsDialog
        v-model:open="quoteDetailsDialog"
        :quote="selectedQuote"
    />

    <!-- Send Quote Dialog -->
    <SendQuoteDialog
        v-model:open="sendQuoteDialog"
        :quote="selectedQuote"
        @quote-sent="handleQuoteSent"
    />

    <!-- Convert Quote Dialog -->
    <ConvertQuoteDialog
        v-model:open="convertQuoteDialog"
        :quote="selectedQuote"
        @quote-converted="handleQuoteConverted"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete Quote #{{ selectedQuote?.quoteNumber }}.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialog = false">Cancel</Button>
          <Button variant="destructive" @click="deleteQuote" :disabled="isDeleting">
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

import QuotesTable from '@/components/sales/quotes/QuotesTable.vue'
import AddQuoteSheet from '@/components/sales/quotes/AddQuoteSheet.vue'
import EditQuoteSheet from '@/components/sales/quotes/EditQuoteSheet.vue'
import QuoteDetailsDialog from '@/components/sales/quotes/QuoteDetailsDialog.vue'
import SendQuoteDialog from '@/components/sales/quotes/SendQuoteDialog.vue'
import ConvertQuoteDialog from '@/components/sales/quotes/ConvertQuoteDialog.vue'

const toast = useToast()

// State management
const quotes = ref([])
const customers = ref([])
const services = ref([])
const isLoading = ref(true)
const isDeleting = ref(false)

// Dialog and sheet states
const addQuoteSheet = ref(false)
const editQuoteSheet = ref(false)
const quoteDetailsDialog = ref(false)
const sendQuoteDialog = ref(false)
const convertQuoteDialog = ref(false)
const deleteDialog = ref(false)

// Selected quote for operations
const selectedQuote = ref(null)

// Load quotes from API
async function loadQuotes() {
  isLoading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Sample data - in a real app, this would come from your API
    quotes.value = [
      {
        id: 'QUO-K1001',
        quoteNumber: 'QUO-K1001',
        customer: {
          id: 'CUST-K10045',
          name: 'Safaricom PLC',
          email: 'procurement@safaricom.co.ke',
          phone: '+254 722 000 000',
          type: 'business'
        },
        status: 'draft',
        totalAmount: 245000,
        currency: 'KES',
        validUntil: '2023-12-30',
        createdAt: '2023-11-15',
        items: [
          {
            id: 'item-1',
            service: 'Dedicated Fiber - 50 Mbps',
            description: 'Dedicated fiber internet connection with 1:1 contention ratio',
            quantity: 1,
            unitPrice: 150000,
            total: 150000
          },
          {
            id: 'item-2',
            service: 'Installation Fee',
            description: 'One-time installation and equipment fee',
            quantity: 1,
            unitPrice: 45000,
            total: 45000
          },
          {
            id: 'item-3',
            service: 'Managed Router',
            description: 'Enterprise-grade Cisco router with 24/7 management',
            quantity: 2,
            unitPrice: 25000,
            total: 50000
          }
        ]
      },
      {
        id: 'QUO-K1002',
        quoteNumber: 'QUO-K1002',
        customer: {
          id: 'CUST-K10078',
          name: 'Nairobi Hospital',
          email: 'it@nairobihospital.org',
          phone: '+254 720 100 200',
          type: 'business'
        },
        status: 'sent',
        totalAmount: 85000,
        currency: 'KES',
        validUntil: '2023-12-15',
        createdAt: '2023-11-10',
        items: [
          {
            id: 'item-1',
            service: 'Business Fiber - 20 Mbps',
            description: 'Business fiber internet connection with 1:4 contention ratio',
            quantity: 1,
            unitPrice: 35000,
            total: 35000
          },
          {
            id: 'item-2',
            service: 'Installation Fee',
            description: 'One-time installation and equipment fee',
            quantity: 1,
            unitPrice: 25000,
            total: 25000
          },
          {
            id: 'item-3',
            service: 'IP Telephony Lines',
            description: 'Business VoIP phone lines with DID numbers',
            quantity: 5,
            unitPrice: 5000,
            total: 25000
          }
        ]
      },
      {
        id: 'QUO-K1003',
        quoteNumber: 'QUO-K1003',
        customer: {
          id: 'CUST-K10025',
          name: 'John Kamau',
          email: 'johnkamau@gmail.com',
          phone: '+254 712 345 678',
          type: 'individual'
        },
        status: 'accepted',
        totalAmount: 12000,
        currency: 'KES',
        validUntil: '2023-11-25',
        createdAt: '2023-11-05',
        items: [
          {
            id: 'item-1',
            service: 'Home Fiber - 15 Mbps',
            description: 'Residential fiber internet package',
            quantity: 1,
            unitPrice: 3500,
            total: 3500
          },
          {
            id: 'item-2',
            service: 'Installation Fee',
            description: 'One-time installation and equipment fee',
            quantity: 1,
            unitPrice: 5000,
            total: 5000
          },
          {
            id: 'item-3',
            service: 'TV Channels Package',
            description: 'Premium TV channels package for 3 months',
            quantity: 1,
            unitPrice: 3500,
            total: 3500
          }
        ]
      },
      {
        id: 'QUO-K1004',
        quoteNumber: 'QUO-K1004',
        customer: {
          id: 'CUST-K10135',
          name: 'Kilimani Apartments',
          email: 'management@kilimani.co.ke',
          phone: '+254 733 987 654',
          type: 'business'
        },
        status: 'expired',
        totalAmount: 320000,
        currency: 'KES',
        validUntil: '2023-10-30',
        createdAt: '2023-10-15',
        items: [
          {
            id: 'item-1',
            service: 'Building Fiber Backbone',
            description: 'Fiber backbone installation for 40-unit apartment building',
            quantity: 1,
            unitPrice: 250000,
            total: 250000
          },
          {
            id: 'item-2',
            service: 'Shared Building Internet - 100 Mbps',
            description: 'Shared internet connection for common areas',
            quantity: 1,
            unitPrice: 45000,
            total: 45000
          },
          {
            id: 'item-3',
            service: 'CCTV Setup',
            description: 'Security camera system with 10 cameras and DVR',
            quantity: 1,
            unitPrice: 25000,
            total: 25000
          }
        ]
      },
      {
        id: 'QUO-K1005',
        quoteNumber: 'QUO-K1005',
        customer: {
          id: 'CUST-K10089',
          name: 'Westlands Business Park',
          email: 'facilities@westlandsbp.co.ke',
          phone: '+254 722 111 222',
          type: 'business'
        },
        status: 'declined',
        totalAmount: 580000,
        currency: 'KES',
        validUntil: '2023-11-20',
        createdAt: '2023-10-20',
        items: [
          {
            id: 'item-1',
            service: 'Campus Fiber Network',
            description: 'Full fiber network installation across business park',
            quantity: 1,
            unitPrice: 450000,
            total: 450000
          },
          {
            id: 'item-2',
            service: 'Core Switch',
            description: 'Enterprise core switch with redundancy',
            quantity: 2,
            unitPrice: 65000,
            total: 130000
          }
        ],
        declineReason: 'Budget constraints - will revisit next quarter'
      }
    ]

    // Load customers
    customers.value = [
      {
        id: 'CUST-K10045',
        name: 'Safaricom PLC',
        email: 'procurement@safaricom.co.ke',
        phone: '+254 722 000 000',
        type: 'business'
      },
      {
        id: 'CUST-K10078',
        name: 'Nairobi Hospital',
        email: 'it@nairobihospital.org',
        phone: '+254 720 100 200',
        type: 'business'
      },
      {
        id: 'CUST-K10025',
        name: 'John Kamau',
        email: 'johnkamau@gmail.com',
        phone: '+254 712 345 678',
        type: 'individual'
      },
      {
        id: 'CUST-K10135',
        name: 'Kilimani Apartments',
        email: 'management@kilimani.co.ke',
        phone: '+254 733 987 654',
        type: 'business'
      },
      {
        id: 'CUST-K10089',
        name: 'Westlands Business Park',
        email: 'facilities@westlandsbp.co.ke',
        phone: '+254 722 111 222',
        type: 'business'
      }
    ]

    // Load services
    services.value = [
      {
        id: 'svc-001',
        name: 'Home Fiber - 5 Mbps',
        description: 'Residential fiber package - basic',
        price: 2500,
        category: 'residential'
      },
      {
        id: 'svc-002',
        name: 'Home Fiber - 10 Mbps',
        description: 'Residential fiber package - standard',
        price: 3000,
        category: 'residential'
      },
      {
        id: 'svc-003',
        name: 'Home Fiber - 15 Mbps',
        description: 'Residential fiber package - premium',
        price: 3500,
        category: 'residential'
      },
      {
        id: 'svc-004',
        name: 'Business Fiber - 10 Mbps',
        description: 'Business fiber connection with 1:4 contention',
        price: 15000,
        category: 'business'
      },
      {
        id: 'svc-005',
        name: 'Business Fiber - 20 Mbps',
        description: 'Business fiber connection with 1:4 contention',
        price: 35000,
        category: 'business'
      },
      {
        id: 'svc-006',
        name: 'Dedicated Fiber - 10 Mbps',
        description: 'Dedicated fiber with 1:1 contention',
        price: 50000,
        category: 'enterprise'
      },
      {
        id: 'svc-007',
        name: 'Dedicated Fiber - 50 Mbps',
        description: 'Dedicated fiber with 1:1 contention',
        price: 150000,
        category: 'enterprise'
      },
      {
        id: 'svc-008',
        name: 'Installation Fee - Residential',
        description: 'One-time installation fee for residential',
        price: 5000,
        category: 'installation'
      },
      {
        id: 'svc-009',
        name: 'Installation Fee - Business',
        description: 'One-time installation fee for business',
        price: 25000,
        category: 'installation'
      },
      {
        id: 'svc-010',
        name: 'TV Channels Package',
        description: 'Premium TV channels bundle',
        price: 3500,
        category: 'tv'
      },
      {
        id: 'svc-011',
        name: 'IP Telephony Lines',
        description: 'Business VoIP phone lines with DID numbers',
        price: 5000,
        category: 'voice'
      },
      {
        id: 'svc-012',
        name: 'Managed Router',
        description: 'Enterprise-grade router with management',
        price: 25000,
        category: 'equipment'
      }
    ]
  } catch (error) {
    console.error('Error loading quotes:', error)
    toast({
      title: 'Error',
      description: 'Failed to load quotes. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// View quote details
function viewQuoteDetails(quote) {
  selectedQuote.value = quote
  quoteDetailsDialog.value = true
}

// Edit quote
function editQuote(quote) {
  selectedQuote.value = quote
  editQuoteSheet.value = true
}

// Confirm deletion
function confirmDeleteQuote(quote) {
  selectedQuote.value = quote
  deleteDialog.value = true
}

// Delete quote
async function deleteQuote() {
  if (!selectedQuote.value) return

  isDeleting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Remove quote from list
    quotes.value = quotes.value.filter(q => q.id !== selectedQuote.value.id)

    toast({
      title: 'Quote Deleted',
      description: `Quote #${selectedQuote.value.quoteNumber} has been deleted.`
    })

    deleteDialog.value = false
    selectedQuote.value = null
  } catch (error) {
    console.error('Error deleting quote:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete quote. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isDeleting.value = false
  }
}

// Open send quote dialog
function openSendQuoteDialog(quote) {
  selectedQuote.value = quote
  sendQuoteDialog.value = true
}

// Convert quote to order
function convertToOrder(quote) {
  selectedQuote.value = quote
  convertQuoteDialog.value = true
}

// Handle quote creation
function handleQuoteCreated(quote) {
  quotes.value.unshift(quote)
  toast({
    title: 'Quote Created',
    description: `Quote #${quote.quoteNumber} has been created.`
  })
}

// Handle quote update
function handleQuoteUpdated(quote) {
  const index = quotes.value.findIndex(q => q.id === quote.id)
  if (index !== -1) {
    quotes.value[index] = quote
  }
  toast({
    title: 'Quote Updated',
    description: `Quote #${quote.quoteNumber} has been updated.`
  })
}

// Handle quote sent
function handleQuoteSent(result) {
  const { quote, method } = result
  const index = quotes.value.findIndex(q => q.id === quote.id)

  if (index !== -1) {
    quotes.value[index] = {
      ...quotes.value[index],
      status: 'sent',
      sentAt: new Date().toISOString(),
      sentVia: method
    }
  }

  toast({
    title: 'Quote Sent',
    description: `Quote #${quote.quoteNumber} has been sent to the customer via ${method}.`
  })
}

// Handle quote conversion
function handleQuoteConverted(result) {
  const { quote, orderId } = result
  const index = quotes.value.findIndex(q => q.id === quote.id)

  if (index !== -1) {
    quotes.value[index] = {
      ...quotes.value[index],
      status: 'converted',
      convertedAt: new Date().toISOString(),
      orderId
    }
  }

  toast({
    title: 'Quote Converted',
    description: `Quote #${quote.quoteNumber} has been converted to Order #${orderId}.`
  })
}

// Initialize component
onMounted(() => {
  loadQuotes()
})
</script>