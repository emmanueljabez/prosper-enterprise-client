<template>
  <div class="space-y-4">
    <!-- Products Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox :checked="isAllSelected" :indeterminate="isIndeterminate" @update:checked="toggleSelectAll" />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Monthly Price</TableHead>
            <TableHead class="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="product in products" :key="product.id"
            :class="{ 'bg-muted/50': selectedProducts.includes(product.id) }">
            <TableCell>
              <Checkbox :checked="selectedProducts.includes(product.id)"
                @update:checked="toggleProductSelection(product.id)" />
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-md border bg-muted flex items-center justify-center">
                  <Package2Icon class="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div class="font-medium cursor-pointer" @click="viewProduct(product)">{{ product.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ product.sku || 'No SKU' }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getProductTypeVariant(product.productType)">
                {{ formatProductType(product.productType) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(product.status)" class="capitalize">
                {{ formatStatus(product.status) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ formatPrice(product.monthlyPrice) }}
              <div v-if="product.promotionalPricing" class="text-xs text-green-600">
                {{ formatPrice(product.promotionalPricing.monthlyPrice) }} (Promo)
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center justify-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreHorizontalIcon class="h-4 w-4" />
                      <span class="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewProduct(product)">
                      <EyeIcon class="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="editProduct(product)">
                      <PencilIcon class="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="duplicateProduct(product)">
                      <CopyIcon class="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="deleteProduct(product)" class="text-destructive focus:text-destructive">
                      <TrashIcon class="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="products.length === 0 && !isLoading">
            <TableCell colSpan="6" class="text-center h-32 text-muted-foreground">
              No products found.
            </TableCell>
          </TableRow>
          <TableRow v-if="isLoading">
            <TableCell colSpan="6" class="text-center h-32">
              <div class="flex justify-center items-center">
                <LoaderIcon class="h-6 w-6 animate-spin mr-2" />
                <span>Loading products...</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing
        <span class="font-medium">{{ products.length ? startIndex + 1 : 0 }}</span>
        to
        <span class="font-medium">{{ Math.min(endIndex, totalItems) }}</span>
        of
        <span class="font-medium">{{ totalItems }}</span>
        results
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" :disabled="currentPage === 1 || isLoading"
          @click="changePage(currentPage - 1)">
          <ChevronLeftIcon class="h-4 w-4" />
          Previous
        </Button>
        <Button v-for="page in visiblePages" :key="page" variant="outline" size="sm"
          :disabled="page === '...' || isLoading"
          :class="{ 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground': page === currentPage }"
          @click="page !== '...' && changePage(page)">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage === totalPages || isLoading"
          @click="changePage(currentPage + 1)">
          Next
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Package2Icon,
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  CopyIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderIcon
} from 'lucide-vue-next'

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  initialPage: {
    type: Number,
    default: 1
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'view-product',
  'edit-product',
  'delete-product',
  'duplicate-product',
  'selection-change',
  'page-change'
])

// State
const currentPage = ref(props.initialPage)
const selectedProducts = ref([])

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * props.itemsPerPage)
const endIndex = computed(() => startIndex.value + props.itemsPerPage)

const isAllSelected = computed(() => {
  return props.products.length > 0 &&
    props.products.every(product => selectedProducts.value.includes(product.id))
})

const isIndeterminate = computed(() => {
  return selectedProducts.value.length > 0 && !isAllSelected.value
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if total is less than or equal to max visible
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always include first page
    pages.push(1)

    // Calculate range around current page
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if at edges
    if (startPage <= 2) {
      endPage = Math.min(totalPages.value - 1, 4)
    }

    if (endPage >= totalPages.value - 1) {
      startPage = Math.max(2, totalPages.value - 3)
    }


    if (startPage > 2) {
      pages.push('...')
    }


    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }


    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }


    if (totalPages.value > 1) {
      pages.push(totalPages.value)
    }
  }

  return pages
})

// Methods
const toggleProductSelection = (productId) => {
  if (selectedProducts.value.includes(productId)) {
    selectedProducts.value = selectedProducts.value.filter(id => id !== productId)
  } else {
    selectedProducts.value.push(productId)
  }

  emit('selection-change', selectedProducts.value)
}

const toggleSelectAll = (checked) => {
  if (checked) {
    selectedProducts.value = props.products.map(product => product.id)
  } else {
    selectedProducts.value = []
  }

  emit('selection-change', selectedProducts.value)
}

const changePage = (page) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

const viewProduct = (product) => {
  emit('view-product', product)
}

const editProduct = (product) => {
  emit('edit-product', product)
}

const deleteProduct = (product) => {
  emit('delete-product', product)
}

const duplicateProduct = (product) => {
  emit('duplicate-product', product)
}

// Format utilities
const formatPrice = (price) => {
  if (!price && price !== 0) return 'N/A'
  // Assuming price is in cents (e.g., 2000 = $20.00)
  // If price is already in dollars, remove the division
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES'
  }).format(price / 100)
}

const formatProductType = (type) => {
  if (!type) return 'Unknown';


  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

const formatStatus = (status) => {
  if (!status) return 'Unknown';


  return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

const getStatusVariant = (status) => {
  if (status === 'ACTIVE') return 'success'
  if (status === 'INACTIVE') return 'secondary'
  if (status === 'PLANNED') return 'warning'
  return 'default'
}

const getProductTypeVariant = (type) => {
  if (!type) return 'outline'

  const normalizedType = type.toLowerCase()

  if (normalizedType.includes('internet')) return 'info'
  if (normalizedType.includes('tv') || normalizedType.includes('streaming')) return 'indigo'
  if (normalizedType.includes('phone')) return 'orange'
  if (normalizedType.includes('hardware')) return 'lime'
  if (normalizedType.includes('bundle')) return 'success'
  
  return 'outline'
}

watch(() => props.products, () => {
  selectedProducts.value = []
}, { deep: true })


watch(totalPages, (newVal) => {
  if (currentPage.value > newVal) {
    currentPage.value = newVal || 1
  }
})
</script>