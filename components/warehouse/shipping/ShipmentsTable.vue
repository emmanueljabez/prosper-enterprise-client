<template>
  <div class="space-y-4">
    <!-- Table controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Input 
          v-model="searchQuery" 
          placeholder="Search shipments..." 
          class="w-[250px]" 
        />
        <Select v-model="filterStatus" class="w-[180px]">
          <SelectTrigger>
            <SelectValue :placeholder="getStatusLabel(filterStatus)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="label_created">Label Created</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterCarrier" class="w-[180px]">
          <SelectTrigger>
            <SelectValue placeholder="All Carriers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Carriers</SelectItem>
            <SelectItem 
              v-for="carrier in carriers" 
              :key="carrier.id" 
              :value="carrier.id"
            >
              {{ carrier.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Select v-model="sortBy" class="w-[200px]">
          <SelectTrigger>
            <SelectValue :placeholder="getSortLabel(sortBy)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created (Newest)</SelectItem>
            <SelectItem value="-createdAt">Date Created (Oldest)</SelectItem>
            <SelectItem value="updatedAt">Last Updated (Newest)</SelectItem>
            <SelectItem value="-updatedAt">Last Updated (Oldest)</SelectItem>
            <SelectItem value="customerName">Customer Name (A-Z)</SelectItem>
            <SelectItem value="-customerName">Customer Name (Z-A)</SelectItem>
            <SelectItem value="shippingCost">Cost (Low to High)</SelectItem>
            <SelectItem value="-shippingCost">Cost (High to Low)</SelectItem>
            <SelectItem value="status">Status (A-Z)</SelectItem>
            <SelectItem value="-status">Status (Z-A)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" @click="$emit('refresh')" :disabled="loading">
          <RefreshCw v-if="!loading" class="h-4 w-4" />
          <Loader2 v-else class="h-4 w-4 animate-spin" />
        </Button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin h-12 w-12 text-primary mb-4">
        <Loader2 />
      </div>
      <p class="text-muted-foreground">Loading shipments...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!displayedShipments.length" class="text-center py-12 border rounded-lg bg-card">
      <div class="flex flex-col items-center max-w-sm mx-auto">
        <PackageIcon class="h-12 w-12 text-muted-foreground opacity-25" />
        <h3 class="mt-4 text-lg font-medium">No shipments found</h3>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ getEmptyStateMessage() }}
        </p>
        <div class="mt-6 flex space-x-2">
          <Button variant="outline" @click="clearFilters">
            <FilterX class="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          <Button @click="$emit('refresh')">
            <RefreshCw class="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>

    <!-- Data table -->
    <div v-else class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[80px]">ID</TableHead>
            <TableHead>Order / Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="text-right">Cost</TableHead>
            <TableHead class="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="shipment in displayedShipments" :key="shipment.id" class="cursor-pointer hover:bg-muted/50">
            <TableCell class="font-medium" @click="$emit('view-shipment', shipment)">
              {{ shipment.id.slice(0, 8) }}
            </TableCell>
            <TableCell @click="$emit('view-shipment', shipment)">
              <div class="flex flex-col">
                <span>{{ shipment.orderId }}</span>
                <span class="text-sm text-muted-foreground">{{ shipment.customerName }}</span>
              </div>
            </TableCell>
            <TableCell @click="$emit('view-shipment', shipment)">
              <Badge :variant="getStatusVariant(shipment.status)">
                {{ formatStatus(shipment.status) }}
              </Badge>
            </TableCell>
            <TableCell @click="$emit('view-shipment', shipment)">
              {{ shipment.carrierName }}
            </TableCell>
            <TableCell @click="$emit('view-shipment', shipment)">
              <div class="flex flex-col">
                <span>{{ shipment.trackingNumber || 'Not yet assigned' }}</span>
                <span v-if="shipment.estimatedDelivery" class="text-xs text-muted-foreground">
                  Est. delivery: {{ formatDate(shipment.estimatedDelivery, 'short') }}
                </span>
              </div>
            </TableCell>
            <TableCell @click="$emit('view-shipment', shipment)">
              <div class="flex flex-col">
                <span>{{ formatAddress(shipment.shipToAddress) }}</span>
                <span class="text-xs text-muted-foreground">
                  {{ formatAddress(shipment.shipToAddress, 'detail') }}
                </span>
              </div>
            </TableCell>
            <TableCell @click="$emit('view-shipment', shipment)">
              {{ formatDate(shipment.createdAt) }}
            </TableCell>
            <TableCell class="text-right" @click="$emit('view-shipment', shipment)">
              {{ formatCurrency(shipment.shippingCost) }}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-shipment', shipment)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="shipment.status === 'pending'"
                    @click="$emit('process-shipment', shipment)"
                  >
                    <PlayCircle class="h-4 w-4 mr-2" />
                    Process Shipment
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="['pending', 'processing', 'label_created'].includes(shipment.status)"
                    @click="$emit('print-label', shipment)"
                  >
                    <Printer class="h-4 w-4 mr-2" />
                    Print Label
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="['label_created'].includes(shipment.status)"
                    @click="$emit('void-label', shipment)"
                  >
                    <Ban class="h-4 w-4 mr-2" />
                    Void Label
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="['pending', 'label_created', 'processing'].includes(shipment.status)"
                    @click="$emit('cancel-shipment', shipment)"
                  >
                    <X class="h-4 w-4 mr-2" />
                    Cancel Shipment
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)"
                    @click="$emit('track-shipment', shipment)"
                  >
                    <MapPin class="h-4 w-4 mr-2" />
                    Track Shipment
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="['delivered'].includes(shipment.status)"
                    @click="$emit('create-return', shipment)"
                  >
                    <ArrowLeft class="h-4 w-4 mr-2" />
                    Create Return
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="displayedShipments.length > 0" class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredShipments.length) }} of {{ filteredShipments.length }} shipments
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <ChevronLeft class="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Next
          <ChevronRight class="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Printer,
  Ban,
  X,
  MapPin,
  ArrowLeft,
  PackageIcon,
  FilterX,
  ChevronLeft,
  ChevronRight,
  PlayCircle
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

// Props
const props = defineProps({
  shipments: {
    type: Array,
    required: true,
    default: () => []
  },
  carriers: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
defineEmits([
  'view-shipment',
  'process-shipment',
  'print-label',
  'void-label',
  'cancel-shipment',
  'track-shipment',
  'create-return',
  'refresh'
]);

// Pagination and filtering state
const searchQuery = ref('');
const filterStatus = ref('all');
const filterCarrier = ref('all');
const sortBy = ref('createdAt');
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Filter shipments based on search, status, and carrier
const filteredShipments = computed(() => {
  let result = [...props.shipments];
  
  // Search query filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(shipment => 
      shipment.id.toLowerCase().includes(query) ||
      (shipment.orderId && shipment.orderId.toLowerCase().includes(query)) ||
      (shipment.customerName && shipment.customerName.toLowerCase().includes(query)) ||
      (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(query))
    );
  }
  
  // Status filter
  if (filterStatus.value !== 'all') {
    result = result.filter(shipment => shipment.status === filterStatus.value);
  }
  
  // Carrier filter
  if (filterCarrier.value !== 'all') {
    result = result.filter(shipment => shipment.carrierId === filterCarrier.value);
  }
  
  // Apply sorting
  const sortDirection = sortBy.value.startsWith('-') ? -1 : 1;
  const sortField = sortBy.value.startsWith('-') ? sortBy.value.slice(1) : sortBy.value;
  
  result.sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection * valueA.localeCompare(valueB);
    } else {
      return sortDirection * (valueA > valueB ? 1 : valueA < valueB ? -1 : 0);
    }
  });
  
  return result;
});

// Pagination calculations
const totalPages = computed(() => Math.ceil(filteredShipments.value.length / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const displayedShipments = computed(() => filteredShipments.value.slice(startIndex.value, endIndex.value));

// Helper functions
const formatDate = (date, format = 'full') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(dateObj);
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const formatStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'label_created': 'Label Created',
    'shipped': 'Shipped',
    'in_transit': 'In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'voided': 'Voided',
    'return_label_created': 'Return Label Created',
    'return_in_transit': 'Return In Transit',
    'returned': 'Returned'
  };
  
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getStatusVariant = (status) => {
  const variantMap = {
    'pending': 'outline',
    'processing': 'secondary',
    'label_created': 'secondary',
    'shipped': 'default',
    'in_transit': 'default',
    'out_for_delivery': 'default',
    'delivered': 'success',
    'cancelled': 'destructive',
    'voided': 'destructive',
    'return_label_created': 'warning',
    'return_in_transit': 'warning',
    'returned': 'success'
  };
  
  return variantMap[status] || 'outline';
};

const formatAddress = (address, format = 'city') => {
  if (!address) return 'N/A';
  
  if (format === 'detail') {
    return `${address.state}, ${address.postalCode}, ${address.country || 'US'}`;
  }
  
  return `${address.city}`;
};

const getStatusLabel = (value) => {
  if (value === 'all') return 'All Statuses';
  return formatStatus(value);
};

const getSortLabel = (value) => {
  const sortLabels = {
    'createdAt': 'Date Created (Newest)',
    '-createdAt': 'Date Created (Oldest)',
    'updatedAt': 'Last Updated (Newest)',
    '-updatedAt': 'Last Updated (Oldest)',
    'customerName': 'Customer Name (A-Z)',
    '-customerName': 'Customer Name (Z-A)',
    'shippingCost': 'Cost (Low to High)',
    '-shippingCost': 'Cost (High to Low)',
    'status': 'Status (A-Z)',
    '-status': 'Status (Z-A)'
  };
  
  return sortLabels[value] || 'Date Created (Newest)';
};

const getEmptyStateMessage = () => {
  if (searchQuery.value || filterStatus.value !== 'all' || filterCarrier.value !== 'all') {
    return 'No shipments match your current filters. Try changing or clearing the filters.';
  }
  
  return 'No shipments found. Create a new shipment to get started.';
};

const clearFilters = () => {
  searchQuery.value = '';
  filterStatus.value = 'all';
  filterCarrier.value = 'all';
  sortBy.value = 'createdAt';
  currentPage.value = 1;
};
</script>