<template>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Convert Lead to Customer</DialogTitle>
      <DialogDescription>
        Convert this lead into a customer and set up their service.
      </DialogDescription>
    </DialogHeader>

    <div v-if="lead" class="py-4">
      <div class="mb-4">
        <h3 class="text-sm font-medium">{{ getLeadName() }}</h3>
        <p class="text-xs text-muted-foreground">{{ lead.id }}</p>
      </div>

      <Alert class="mb-4">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Converting a lead to a customer is permanent and will move this lead to your customer database.
        </AlertDescription>
      </Alert>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="services">Selected Services</Label>
          <div class="border rounded-md p-3 bg-muted/30">
            <div v-for="product in lead.products" :key="product" class="flex items-center space-x-2 py-1">
              <Checkbox 
                :id="`product-${product}`" 
                v-model:checked="selectedProducts[product]"
              />
              <Label :for="`product-${product}`" class="text-sm">{{ getProductName(product) }}</Label>
            </div>
            <p v-if="!lead.products || lead.products.length === 0" class="text-sm text-muted-foreground">
              No products selected for this lead
            </p>
          </div>
          <p v-if="servicesError" class="text-sm text-destructive">
            {{ servicesError }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="packageType">Package Type</Label>
          <Select v-model="packageType">
            <SelectTrigger id="packageType">
              <SelectValue placeholder="Select package type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="conversionNote">Conversion Notes</Label>
          <Textarea
              id="conversionNote"
              v-model="conversionNote"
              placeholder="Additional information about this conversion..."
              rows="3"
          />
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="emit('close')">
        Cancel
      </Button>
      <Button
          type="submit"
          variant="default"
          :disabled="isSubmitting || !hasSelectedProducts"
          @click="convertLeadToCustomer"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <span>Convert to Customer</span>
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Loader2Icon, AlertCircleIcon } from 'lucide-vue-next'
import { useProductsStore } from '@/store/modules/administration/products/products'

// Stores
const productsStore = useProductsStore()

const props = defineProps({
  lead: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'lead-converted'])

const selectedProducts = ref({})
const packageType = ref('')
const conversionNote = ref('')
const servicesError = ref('')
const isSubmitting = ref(false)

// Initialize form when lead changes
watch(() => props.lead, (newLead) => {
  if (newLead) {
    // Reset form
    selectedProducts.value = {}
    packageType.value = newLead.leadType === 'BUSINESS' ? 'business' : 'residential'
    conversionNote.value = ''
    servicesError.value = ''
    
    // Pre-select all products from lead
    if (newLead.products && Array.isArray(newLead.products)) {
      newLead.products.forEach(productId => {
        selectedProducts.value[productId] = true
      })
    }
  }
}, { immediate: true })

// Helper to get product name
function getProductName(productId) {
  const product = productsStore.getProducts.find(p => p.id === productId)
  return product ? product.name : `Product ${productId}`
}

// Check if at least one product is selected
const hasSelectedProducts = computed(() => {
  return Object.values(selectedProducts.value).some(selected => selected === true)
})

function getLeadName() {
  if (!props.lead) return '';
  
  let name = '';
  if (props.lead.firstName) name += props.lead.firstName;
  if (props.lead.lastName) name += (name ? ' ' : '') + props.lead.lastName;
  if (props.lead.companyName && props.lead.leadType === 'BUSINESS') {
    name += ` (${props.lead.companyName})`;
  }
  return name || 'Unnamed Lead';
}

function resetForm() {
  selectedProducts.value = {}
  packageType.value = ''
  conversionNote.value = ''
  servicesError.value = ''
  isSubmitting.value = false
}

async function convertLeadToCustomer() {
  if (!props.lead) {
    return
  }

  // Validate selected products
  if (!hasSelectedProducts.value) {
    servicesError.value = 'At least one service must be selected'
    return
  }

  try {
    isSubmitting.value = true
    servicesError.value = ''

    // Prepare selected product IDs
    const selectedProductIds = Object.entries(selectedProducts.value)
      .filter(([_, isSelected]) => isSelected)
      .map(([productId]) => Number(productId))

    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate a customer ID with format CUST-K followed by 5 digits
    const customerId = `CUST-K${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`

    // Emit event with lead object as expected by the parent
    emit('lead-converted', {
      lead: props.lead,
      customerId,
      services: selectedProductIds,
      packageType: packageType.value,
      note: conversionNote.value || null
    })

    // Reset and close
    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error converting lead:', error)
    servicesError.value = 'An error occurred while converting the lead'
  } finally {
    isSubmitting.value = false
  }
}
</script>