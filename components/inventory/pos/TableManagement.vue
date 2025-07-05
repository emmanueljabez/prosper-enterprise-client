<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Table Management</h2>
        <div class="flex items-center space-x-2">
          <!-- View Toggle -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutGrid class="h-4 w-4 mr-2" />
                {{ viewMode === 'grid' ? 'Grid View' : 'List View' }}
                <ChevronDown class="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="viewMode = 'grid'">
                <LayoutGrid class="h-4 w-4 mr-2" />
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem @click="viewMode = 'list'">
                <List class="h-4 w-4 mr-2" />
                List View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Add Table Button -->
          <Button size="sm" @click="showAddTableDialog = true">
            <Plus class="h-4 w-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      <!-- Status Legend -->
      <div class="flex items-center space-x-4 mt-3">
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-xs text-gray-600 dark:text-gray-300">Available</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span class="text-xs text-gray-600 dark:text-gray-300">Occupied</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <span class="text-xs text-gray-600 dark:text-gray-300">Needs Attention</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span class="text-xs text-gray-600 dark:text-gray-300">Reserved</span>
        </div>
      </div>
    </div>

    <!-- Tables Grid View -->
    <div v-if="viewMode === 'grid'" class="p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div
          v-for="table in tables"
          :key="table.id"
          class="relative group cursor-pointer"
          @click="selectTable(table)"
        >
          <!-- Table Card -->
          <div
            class="border-2 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-lg"
            :class="[
              getTableStatusClasses(table),
              selectedTable?.id === table.id ? 'ring-2 ring-primary ring-offset-2' : ''
            ]"
          >
            <!-- Table Number -->
            <div class="text-lg font-bold mb-1">{{ table.number }}</div>
            
            <!-- Table Info -->
            <div class="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <div class="flex items-center justify-center space-x-1">
                <Users class="h-3 w-3" />
                <span>{{ table.capacity }}</span>
              </div>
              
              <div v-if="table.status === 'occupied'" class="space-y-1">
                <div class="flex items-center justify-center space-x-1">
                  <Clock class="h-3 w-3" />
                  <span>{{ getSeatedTime(table.seatedAt) }}</span>
                </div>
                <div class="text-xs font-medium">
                  Party: {{ table.partySize }}
                </div>
              </div>
              
              <div v-if="table.status === 'reserved'" class="text-xs">
                Reserved: {{ formatTime(table.reservationTime) }}
              </div>
            </div>

            <!-- Status Indicator -->
            <div
              class="absolute top-2 right-2 w-3 h-3 rounded-full"
              :class="getStatusIndicatorColor(table.status)"
            />

            <!-- Action Menu -->
            <div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" class="h-6 w-6 p-0">
                    <MoreVertical class="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem @click="openTableDetails(table)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="table.status === 'available'"
                    @click="seatGuests(table)"
                  >
                    <UserPlus class="h-4 w-4 mr-2" />
                    Seat Guests
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="table.status === 'occupied'"
                    @click="transferTable(table)"
                  >
                    <ArrowRightLeft class="h-4 w-4 mr-2" />
                    Transfer
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editTable(table)">
                    <Edit class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="markForCleaning(table)">
                    <Trash2 class="h-4 w-4 mr-2" />
                    Mark for Cleaning
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables List View -->
    <div v-else class="p-4">
      <div class="space-y-2">
        <div
          v-for="table in tables"
          :key="table.id"
          class="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          :class="selectedTable?.id === table.id ? 'bg-primary/10 border-primary' : ''"
          @click="selectTable(table)"
        >
          <div class="flex items-center space-x-4">
            <!-- Status Indicator -->
            <div
              class="w-3 h-3 rounded-full"
              :class="getStatusIndicatorColor(table.status)"
            />
            
            <!-- Table Info -->
            <div>
              <div class="font-medium">Table {{ table.number }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                Capacity: {{ table.capacity }} | 
                <span class="capitalize">{{ table.status }}</span>
                <span v-if="table.status === 'occupied'">
                  | Party: {{ table.partySize }} | {{ getSeatedTime(table.seatedAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center space-x-2">
            <Button
              v-if="table.status === 'available'"
              variant="outline"
              size="sm"
              @click.stop="seatGuests(table)"
            >
              <UserPlus class="h-4 w-4 mr-1" />
              Seat
            </Button>
            
            <Button
              v-if="table.status === 'occupied'"
              variant="outline"
              size="sm"
              @click.stop="viewOrder(table)"
            >
              <ClipboardList class="h-4 w-4 mr-1" />
              Order
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="openTableDetails(table)">
                  <Eye class="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem @click="editTable(table)">
                  <Edit class="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="markForCleaning(table)">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Mark for Cleaning
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Actions Dialog -->
    <Dialog v-model:open="showSeatGuestsDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Seat Guests at Table {{ selectedTableForAction?.number }}</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <div>
            <Label>Party Size</Label>
            <Select v-model="partySize">
              <SelectTrigger>
                <SelectValue placeholder="Select party size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="size in Array.from({length: 12}, (_, i) => i + 1)" :key="size" :value="size.toString()">
                  {{ size }} {{ size === 1 ? 'Person' : 'People' }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Guest Name (Optional)</Label>
            <Input v-model="guestName" placeholder="Enter guest name" />
          </div>

          <div>
            <Label>Special Requests (Optional)</Label>
            <Textarea v-model="specialRequests" placeholder="Any special requests..." rows="2" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showSeatGuestsDialog = false">
            Cancel
          </Button>
          <Button @click="confirmSeatGuests">
            Seat Guests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Add Table Dialog -->
    <Dialog v-model:open="showAddTableDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <div>
            <Label>Table Number</Label>
            <Input v-model="newTable.number" placeholder="Enter table number" />
          </div>

          <div>
            <Label>Capacity</Label>
            <Select v-model="newTable.capacity">
              <SelectTrigger>
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="capacity in [2, 4, 6, 8, 10, 12]" :key="capacity" :value="capacity.toString()">
                  {{ capacity }} People
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Section</Label>
            <Select v-model="newTable.section">
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="private">Private Dining</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showAddTableDialog = false">
            Cancel
          </Button>
          <Button @click="confirmAddTable">
            Add Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Table Details Dialog -->
    <Dialog v-model:open="showTableDetailsDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Eye class="h-5 w-5" />
            Table {{ selectedTableForDetails?.number }} Details
          </DialogTitle>
          <DialogDescription>
            View table information and current status
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="selectedTableForDetails" class="space-y-6">
          <!-- Table Overview -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <Label class="text-sm font-medium">Table Number</Label>
                <div class="text-lg font-semibold">{{ selectedTableForDetails.number }}</div>
              </div>
              <div>
                <Label class="text-sm font-medium">Status</Label>
                <Badge :variant="getTableStatusVariant(selectedTableForDetails.status)">
                  {{ selectedTableForDetails.status }}
                </Badge>
              </div>
              <div>
                <Label class="text-sm font-medium">Capacity</Label>
                <div class="flex items-center gap-1">
                  <Users class="h-4 w-4" />
                  {{ selectedTableForDetails.capacity }} guests
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <Label class="text-sm font-medium">Section</Label>
                <div>{{ selectedTableForDetails.section }}</div>
              </div>
              <div>
                <Label class="text-sm font-medium">Server</Label>
                <div>{{ selectedTableForDetails.server || 'Unassigned' }}</div>
              </div>
              <div v-if="selectedTableForDetails.timeSeated">
                <Label class="text-sm font-medium">Time Seated</Label>
                <div>{{ formatTime(selectedTableForDetails.timeSeated) }}</div>
              </div>
            </div>
          </div>

          <!-- Current Order (if any) -->
          <div v-if="selectedTableForDetails.currentOrder" class="space-y-3">
            <h4 class="font-medium">Current Order</h4>
            <div class="border rounded-lg p-4">
              <div class="flex justify-between items-center mb-3">
                <span class="font-medium">Order #{{ selectedTableForDetails.currentOrder.number }}</span>
                <Badge variant="secondary">{{ selectedTableForDetails.currentOrder.status }}</Badge>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="item in selectedTableForDetails.currentOrder.items" 
                  :key="item.id"
                  class="flex justify-between text-sm"
                >
                  <span>{{ item.quantity }}x {{ item.name }}</span>
                  <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
              <Separator class="my-2" />
              <div class="flex justify-between font-medium">
                <span>Total</span>
                <span>${{ selectedTableForDetails.currentOrder.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Table History -->
          <div class="space-y-3">
            <h4 class="font-medium">Recent Activity</h4>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div 
                v-for="activity in getTableActivity(selectedTableForDetails)" 
                :key="activity.id"
                class="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <span>{{ activity.description }}</span>
                <span class="text-muted-foreground">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showTableDetailsDialog = false">
            Close
          </Button>
          <Button @click="editTableFromDetails">
            <Edit class="mr-2 h-4 w-4" />
            Edit Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  LayoutGrid,
  List,
  Plus,
  Users,
  Clock,
  MoreVertical,
  Eye,
  UserPlus,
  ArrowRightLeft,
  Edit,
  Trash2,
  ChevronDown,
  ClipboardList
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

// Props
const props = defineProps({
  tables: {
    type: Array,
    default: () => []
  },
  selectedTable: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'table-select',
  'table-status-change',
  'table-merge',
  'table-split'
])

// Local state
const viewMode = ref('grid')
const showSeatGuestsDialog = ref(false)
const showAddTableDialog = ref(false)
const showTableDetailsDialog = ref(false)
const selectedTableForAction = ref(null)
const selectedTableForDetails = ref(null)
const partySize = ref('')
const guestName = ref('')
const specialRequests = ref('')

const newTable = ref({
  number: '',
  capacity: '',
  section: ''
})

// Methods
const selectTable = (table) => {
  emit('table-select', table)
}

const getTableStatusClasses = (table) => {
  const baseClasses = 'border-2 transition-all duration-200'
  
  switch (table.status) {
    case 'available':
      return `${baseClasses} border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800`
    case 'occupied':
      return `${baseClasses} border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800`
    case 'needs-attention':
      return `${baseClasses} border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800`
    case 'reserved':
      return `${baseClasses} border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`
    case 'cleaning':
      return `${baseClasses} border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800`
    default:
      return `${baseClasses} border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700`
  }
}

const getStatusIndicatorColor = (status) => {
  switch (status) {
    case 'available':
      return 'bg-green-500'
    case 'occupied':
      return 'bg-yellow-500'
    case 'needs-attention':
      return 'bg-red-500'
    case 'reserved':
      return 'bg-blue-500'
    case 'cleaning':
      return 'bg-gray-500'
    default:
      return 'bg-gray-300'
  }
}

const getSeatedTime = (seatedAt) => {
  if (!seatedAt) return ''
  
  const now = new Date()
  const seated = new Date(seatedAt)
  const diffMinutes = Math.floor((now - seated) / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return `${hours}h ${minutes}m`
}

const formatTime = (dateTime) => {
  if (!dateTime) return 'N/A'
  return new Date(dateTime).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const seatGuests = (table) => {
  selectedTableForAction.value = table
  showSeatGuestsDialog.value = true
}

const confirmSeatGuests = () => {
  if (!partySize.value) return
  
  const updateData = {
    id: selectedTableForAction.value.id,
    status: 'occupied',
    partySize: parseInt(partySize.value),
    guestName: guestName.value,
    specialRequests: specialRequests.value,
    seatedAt: new Date().toISOString()
  }
  
  emit('table-status-change', selectedTableForAction.value.id, updateData)
  
  // Reset form
  partySize.value = ''
  guestName.value = ''
  specialRequests.value = ''
  showSeatGuestsDialog.value = false
  selectedTableForAction.value = null
}

const openTableDetails = (table) => {
  selectedTableForDetails.value = {
    ...table,
    currentOrder: generateMockOrder(table),
    timeSeated: table.status === 'occupied' ? new Date(Date.now() - 3600000) : null // 1 hour ago
  }
  showTableDetailsDialog.value = true
}

const getTableActivity = (table) => {
  // Generate mock activity data
  return [
    {
      id: 1,
      description: `Table ${table.number} seated`,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      description: 'Order taken',
      timestamp: new Date(Date.now() - 3300000)
    },
    {
      id: 3,
      description: 'Food served',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]
}

const generateMockOrder = (table) => {
  if (table.status !== 'occupied') return null
  
  return {
    number: `ORD${table.number}${Date.now().toString().slice(-3)}`,
    status: 'in-progress',
    items: [
      { id: 1, name: 'Chicken Pasta', quantity: 2, price: 15.99 },
      { id: 2, name: 'Caesar Salad', quantity: 1, price: 8.99 },
      { id: 3, name: 'Soft Drinks', quantity: 2, price: 3.99 }
    ],
    total: 48.96
  }
}

const editTableFromDetails = () => {
  showTableDetailsDialog.value = false
  editTable(selectedTableForDetails.value)
}

const transferTable = (table) => {
  // Implementation for table transfer
  console.log('Transferring table:', table)
}

const editTable = (table) => {
  // Implementation for editing table
  console.log('Editing table:', table)
}

const markForCleaning = (table) => {
  emit('table-status-change', table.id, { status: 'cleaning' })
}

const viewOrder = (table) => {
  // Implementation for viewing table order
  console.log('Viewing order for table:', table)
}

const confirmAddTable = () => {
  if (!newTable.value.number || !newTable.value.capacity) return
  
  const tableData = {
    number: newTable.value.number,
    capacity: parseInt(newTable.value.capacity),
    section: newTable.value.section,
    status: 'available'
  }
  
  // Emit event to parent to add table
  emit('table-add', tableData)
  
  // Reset form
  newTable.value = {
    number: '',
    capacity: '',
    section: ''
  }
  showAddTableDialog.value = false
}
</script>
