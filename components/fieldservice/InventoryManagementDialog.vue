<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-4xl max-h-[90vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>Field Equipment Inventory</DialogTitle>
        <DialogDescription>
          Manage equipment inventory for ISP field services
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="inventory" class="mt-4">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <!-- Inventory Tab -->
        <TabsContent value="inventory" class="space-y-4 pt-4">
          <div class="flex justify-between items-center">
            <div class="space-y-1">
              <h2 class="text-xl font-semibold">Equipment Inventory</h2>
              <p class="text-sm text-muted-foreground">Manage field service equipment and stock levels</p>
            </div>

            <div class="flex gap-2">
              <Button variant="outline" @click="handleReorderLowStock">
                <RefreshCcwIcon class="h-4 w-4 mr-2" />
                Reorder Low Stock
              </Button>
              <Button @click="handleAddEquipment">
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Input v-model="inventorySearch" placeholder="Search equipment..." class="max-w-sm" />
            <Select v-model="categoryFilter" class="w-[180px]">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem v-for="category in uniqueCategories" :key="category" :value="category">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="stockFilter" class="w-[150px]">
              <SelectTrigger>
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead class="text-right">Stock Level</TableHead>
                  <TableHead class="text-right">Min Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Reordered</TableHead>
                  <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in filteredInventory" :key="item.id">
                  <TableCell>
                    <div class="font-medium">{{ item.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ item.id }}</div>
                  </TableCell>
                  <TableCell>{{ item.category }}</TableCell>
                  <TableCell class="text-right">
                    <span :class="{
                      'text-red-600 font-medium': item.stockLevel <= item.criticalLevel,
                      'text-amber-600 font-medium': item.stockLevel > item.criticalLevel && item.stockLevel <= item.minStockLevel
                    }">
                      {{ item.stockLevel }}
                    </span>
                  </TableCell>
                  <TableCell class="text-right">{{ item.minStockLevel }}</TableCell>
                  <TableCell>
                    <Badge v-if="item.stockLevel <= item.criticalLevel" class="bg-red-50 text-red-700">
                      Critical
                    </Badge>
                    <Badge v-else-if="item.stockLevel <= item.minStockLevel" class="bg-amber-50 text-amber-700">
                      Low Stock
                    </Badge>
                    <Badge v-else-if="item.status === 'reordered'" class="bg-blue-50 text-blue-700">
                      Reordered
                    </Badge>
                    <Badge v-else class="bg-green-50 text-green-700">
                      In Stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {{ item.lastReordered ? formatDate(item.lastReordered) : 'Never' }}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                          <MoreHorizontalIcon class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="handleEditInventory(item)">
                          <PencilIcon class="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            @click="handleReorderInventory(item)"
                            :disabled="item.status === 'reordered'"
                        >
                          <RefreshCcwIcon class="h-4 w-4 mr-2" />
                          Reorder
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="handleAdjustStock(item)">
                          Adjust Stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="handleArchiveInventory(item)" class="text-red-600">
                          <ArchiveIcon class="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <!-- Orders Tab -->
        <TabsContent value="orders" class="space-y-4 pt-4">
          <div class="flex justify-between items-center">
            <div class="space-y-1">
              <h2 class="text-xl font-semibold">Purchase Orders</h2>
              <p class="text-sm text-muted-foreground">Track and manage equipment orders</p>
            </div>

            <Button @click="handleCreateOrder">
              <PlusIcon class="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="order in mockOrders" :key="order.id">
                  <TableCell>
                    <div class="font-medium">{{ order.id }}</div>
                  </TableCell>
                  <TableCell>{{ order.supplier }}</TableCell>
                  <TableCell>{{ formatDate(order.orderDate) }}</TableCell>
                  <TableCell>{{ order.items.length }} items</TableCell>
                  <TableCell>${{ order.total.toFixed(2) }}</TableCell>
                  <TableCell>
                    <Badge :class="{
                      'bg-slate-50 text-slate-700': order.status === 'draft',
                      'bg-blue-50 text-blue-700': order.status === 'ordered',
                      'bg-amber-50 text-amber-700': order.status === 'partial',
                      'bg-green-50 text-green-700': order.status === 'received',
                      'bg-red-50 text-red-700': order.status === 'cancelled'
                    }">
                      {{ formatOrderStatus(order.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                      <MoreHorizontalIcon class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <!-- Reports Tab -->
        <TabsContent value="reports" class="space-y-4 pt-4">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold">Inventory Reports</h2>
            <p class="text-sm text-muted-foreground">View usage patterns and stock analytics</p>
          </div>

          <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
            <!-- Usage by Category Chart -->
            <Card>
              <CardHeader>
                <CardTitle>Usage by Category</CardTitle>
                <CardDescription>Equipment distribution across field services</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div class="text-center text-muted-foreground">
                    <BarChart3Icon class="h-10 w-10 mx-auto mb-2" />
                    <p>Chart would be displayed here in a real application</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Low Stock Alert Trends -->
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Frequency</CardTitle>
                <CardDescription>Tracking reorder patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div class="text-center text-muted-foreground">
                    <LineChartIcon class="h-10 w-10 mx-auto mb-2" />
                    <p>Chart would be displayed here in a real application</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Top Consumed Items -->
            <Card>
              <CardHeader>
                <CardTitle>Most Used Equipment</CardTitle>
                <CardDescription>Items with highest consumption rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div v-for="(item, index) in mostUsedItems" :key="item.id" class="flex items-center">
                    <div class="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full mr-3 shrink-0">
                      {{ index + 1 }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-baseline">
                        <h4 class="font-medium truncate">{{ item.name }}</h4>
                        <p class="text-sm text-muted-foreground">{{ item.usageRate }}/wk</p>
                      </div>
                      <div class="w-full bg-muted/30 rounded-full h-1.5 mt-1">
                        <div class="bg-primary h-1.5 rounded-full" :style="{ width: `${(item.usageRate / 15) * 100}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Inventory Value -->
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value</CardTitle>
                <CardDescription>Current equipment value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div v-for="category in inventoryValueByCategory" :key="category.name" class="space-y-2">
                    <div class="flex justify-between items-baseline">
                      <h4 class="text-sm font-medium">{{ category.name }}</h4>
                      <p class="text-sm">${{ category.value.toLocaleString() }}</p>
                    </div>
                    <div class="w-full bg-muted/30 rounded-full h-1.5">
                      <div class="bg-primary h-1.5 rounded-full" :style="{ width: `${(category.value / 25000) * 100}%` }"></div>
                    </div>
                  </div>
                  <Separator />
                  <div class="flex justify-between items-baseline font-medium">
                    <h4>Total Value</h4>
                    <p>${{ totalInventoryValue.toLocaleString() }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <!-- Edit Inventory Item Dialog -->
      <Dialog :open="showEditInventoryDialog" @update:open="showEditInventoryDialog = $event">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ isNewInventoryItem ? 'Add Equipment' : 'Edit Equipment' }}</DialogTitle>
            <DialogDescription>
              {{ isNewInventoryItem ? 'Add new equipment to inventory' : 'Update equipment details' }}
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2 col-span-2">
                <Label for="equipment-name">Equipment Name</Label>
                <Input id="equipment-name" v-model="editedInventory.name" placeholder="Enter equipment name" />
              </div>

              <div class="space-y-2">
                <Label for="equipment-category">Category</Label>
                <Select v-model="editedInventory.category">
                  <SelectTrigger id="equipment-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONT & Routers">ONT & Routers</SelectItem>
                    <SelectItem value="Cables & Connectors">Cables & Connectors</SelectItem>
                    <SelectItem value="Network Devices">Network Devices</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Installation Materials">Installation Materials</SelectItem>
                    <SelectItem value="Testing Equipment">Testing Equipment</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="equipment-location">Storage Location</Label>
                <Input id="equipment-location" v-model="editedInventory.location" placeholder="Enter location" />
              </div>

              <div class="space-y-2">
                <Label for="equipment-stock">Current Stock</Label>
                <Input
                    id="equipment-stock"
                    type="number"
                    v-model.number="editedInventory.stockLevel"
                    min="0"
                />
              </div>

              <div class="space-y-2">
                <Label for="equipment-min-stock">Minimum Stock Level</Label>
                <Input
                    id="equipment-min-stock"
                    type="number"
                    v-model.number="editedInventory.minStockLevel"
                    min="1"
                />
              </div>

              <div class="space-y-2">
                <Label for="equipment-critical">Critical Stock Level</Label>
                <Input
                    id="equipment-critical"
                    type="number"
                    v-model.number="editedInventory.criticalLevel"
                    min="0"
                />
              </div>

              <div class="space-y-2 col-span-2">
                <Label for="equipment-description">Description</Label>
                <Textarea
                    id="equipment-description"
                    v-model="editedInventory.description"
                    placeholder="Enter equipment description"
                    rows="3"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showEditInventoryDialog = false">Cancel</Button>
            <Button @click="saveInventoryItem">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Adjust Stock Dialog -->
      <Dialog :open="showAdjustStockDialog" @update:open="showAdjustStockDialog = $event">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>
              Update inventory quantity for {{ selectedInventoryItem?.name }}
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-4">
            <div class="p-4 border rounded-md bg-muted/20">
              <div class="flex justify-between">
                <div class="font-medium">Current Stock:</div>
                <div>{{ selectedInventoryItem?.stockLevel }}</div>
              </div>
              <div class="flex justify-between">
                <div class="font-medium">Minimum Level:</div>
                <div>{{ selectedInventoryItem?.minStockLevel }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <Label>Adjustment Type</Label>
              <div class="flex space-x-2">
                <Button
                    :variant="stockAdjustment.type === 'add' ? 'default' : 'outline'"
                    class="flex-1"
                    @click="stockAdjustment.type = 'add'"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
                <Button
                    :variant="stockAdjustment.type === 'remove' ? 'default' : 'outline'"
                    class="flex-1"
                    @click="stockAdjustment.type = 'remove'"
                >
                  <MinusIcon class="h-4 w-4 mr-2" />
                  Remove Stock
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="adjustment-amount">Adjustment Amount</Label>
              <Input
                  id="adjustment-amount"
                  type="number"
                  v-model.number="stockAdjustment.amount"
                  min="1"
              />
            </div>

            <div class="space-y-2">
              <Label for="adjustment-reason">Reason</Label>
              <Select v-model="stockAdjustment.reason">
                <SelectTrigger id="adjustment-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-if="stockAdjustment.type === 'add'" value="delivery">Delivery Received</SelectItem>
                  <SelectItem v-if="stockAdjustment.type === 'add'" value="return">Returned from Field</SelectItem>
                  <SelectItem v-if="stockAdjustment.type === 'add'" value="correction">Inventory Correction</SelectItem>
                  <SelectItem v-if="stockAdjustment.type === 'remove'" value="field">Field Assignment</SelectItem>
                  <SelectItem v-if="stockAdjustment.type === 'remove'" value="damaged">Damaged/Defective</SelectItem>
                  <SelectItem v-if="stockAdjustment.type === 'remove'" value="correction">Inventory Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="adjustment-notes">Notes</Label>
              <Textarea
                  id="adjustment-notes"
                  v-model="stockAdjustment.notes"
                  placeholder="Enter notes about this adjustment"
                  rows="2"
              />
            </div>

            <div class="p-4 border rounded-md bg-muted/20">
              <div class="flex justify-between">
                <div class="font-medium">New Stock Level:</div>
                <div>{{ calculatedNewStockLevel }}</div>
              </div>
              <div v-if="calculatedNewStockLevel <= selectedInventoryItem?.criticalLevel" class="text-red-600 text-sm mt-2">
                Warning: This adjustment will put stock at critical level!
              </div>
              <div v-else-if="calculatedNewStockLevel <= selectedInventoryItem?.minStockLevel" class="text-amber-600 text-sm mt-2">
                Warning: This adjustment will put stock below minimum level!
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="showAdjustStockDialog = false">Cancel</Button>
            <Button
                variant="default"
                @click="saveStockAdjustment"
                :disabled="stockAdjustment.type === 'remove' && stockAdjustment.amount > selectedInventoryItem?.stockLevel"
            >
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { format, parseISO } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  PlusIcon, MoreHorizontalIcon, PencilIcon, RefreshCcwIcon,
  ArchiveIcon, BarChart3Icon, LineChartIcon, MinusIcon
} from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  inventory: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:open', 'update']);

// Local state
const inventorySearch = ref('');
const categoryFilter = ref('');
const stockFilter = ref('');
const showEditInventoryDialog = ref(false);
const showAdjustStockDialog = ref(false);
const isNewInventoryItem = ref(false);
const editedInventory = ref({});
const selectedInventoryItem = ref(null);
const stockAdjustment = ref({
  type: 'add',
  amount: 1,
  reason: 'delivery',
  notes: ''
});

// Computed properties
const filteredInventory = computed(() => {
  let filtered = [...props.inventory];

  // Apply search filter
  if (inventorySearch.value) {
    const search = inventorySearch.value.toLowerCase();
    filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search)
    );
  }

  // Apply category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value);
  }

  // Apply stock level filter
  if (stockFilter.value) {
    filtered = filtered.filter(item => {
      if (stockFilter.value === 'critical') return item.stockLevel <= item.criticalLevel;
      if (stockFilter.value === 'low') return item.stockLevel <= item.minStockLevel && item.stockLevel > item.criticalLevel;
      if (stockFilter.value === 'normal') return item.stockLevel > item.minStockLevel;
      return true;
    });
  }

  // Sort by stock status (critical first, then low, then normal)
  return filtered.sort((a, b) => {
    if (a.stockLevel <= a.criticalLevel && b.stockLevel > b.criticalLevel) return -1;
    if (a.stockLevel > a.criticalLevel && b.stockLevel <= b.criticalLevel) return 1;
    if (a.stockLevel <= a.minStockLevel && b.stockLevel > b.minStockLevel) return -1;
    if (a.stockLevel > a.minStockLevel && b.stockLevel <= b.minStockLevel) return 1;
    return a.name.localeCompare(b.name);
  });
});

const uniqueCategories = computed(() => {
  const categories = props.inventory.map(item => item.category);
  return [...new Set(categories)].sort();
});

const calculatedNewStockLevel = computed(() => {
  if (!selectedInventoryItem.value) return 0;

  const currentLevel = selectedInventoryItem.value.stockLevel;
  const adjustment = stockAdjustment.value.amount || 0;

  if (stockAdjustment.value.type === 'add') {
    return currentLevel + adjustment;
  } else {
    return Math.max(0, currentLevel - adjustment);
  }
});

// Mock data for reports tab
const mostUsedItems = computed(() => [
  { id: 'EQ-ONT-001', name: 'Fiber ONT', usageRate: 12 },
  { id: 'EQ-ROUTER-003', name: 'Wi-Fi 6 Router', usageRate: 10 },
  { id: 'EQ-CABLE-001', name: 'Fiber Patch Cable 50ft', usageRate: 8 },
  { id: 'EQ-SPLITTER-002', name: 'Fiber Splitter 1x4', usageRate: 6 },
  { id: 'EQ-CONNECTOR-001', name: 'SC/APC Connectors', usageRate: 15 }
]);

const inventoryValueByCategory = computed(() => [
  { name: 'ONT & Routers', value: 22500 },
  { name: 'Cables & Connectors', value: 8750 },
  { name: 'Network Devices', value: 15200 },
  { name: 'Installation Materials', value: 4300 },
  { name: 'Testing Equipment', value: 12800 }
]);

const totalInventoryValue = computed(() =>
    inventoryValueByCategory.value.reduce((sum, category) => sum + category.value, 0)
);

const mockOrders = computed(() => [
  {
    id: 'PO-2023-001',
    supplier: 'TechNet Supplies',
    orderDate: '2023-06-15T10:00:00Z',
    items: [
      { id: 'EQ-ONT-001', name: 'Fiber ONT', quantity: 25, price: 85 },
      { id: 'EQ-ROUTER-003', name: 'Wi-Fi 6 Router', quantity: 20, price: 95 }
    ],
    total: 4325,
    status: 'received'
  },
  {
    id: 'PO-2023-002',
    supplier: 'Fiber Solutions Inc.',
    orderDate: '2023-07-02T14:30:00Z',
    items: [
      { id: 'EQ-CABLE-001', name: 'Fiber Patch Cable 50ft', quantity: 50, price: 18 },
      { id: 'EQ-CONNECTOR-001', name: 'SC/APC Connectors', quantity: 100, price: 2.5 }
    ],
    total: 1150,
    status: 'partial'
  },
  {
    id: 'PO-2023-003',
    supplier: 'TechNet Supplies',
    orderDate: '2023-07-20T09:15:00Z',
    items: [
      { id: 'EQ-ONT-001', name: 'Fiber ONT', quantity: 30, price: 82 },
      { id: 'EQ-SPLITTER-002', name: 'Fiber Splitter 1x4', quantity: 15, price: 45 }
    ],
    total: 3135,
    status: 'ordered'
  }
]);

// Helper functions
function formatDate(dateString) {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

function formatOrderStatus(status) {
  const statusMap = {
    'draft': 'Draft',
    'ordered': 'Ordered',
    'partial': 'Partially Received',
    'received': 'Received',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
}

function handleAddEquipment() {
  isNewInventoryItem.value = true;
  editedInventory.value = {
    id: `EQ-${Date.now().toString().substring(6)}`,
    name: '',
    category: '',
    stockLevel: 0,
    minStockLevel: 5,
    criticalLevel: 2,
    location: 'Main Warehouse',
    description: '',
    status: 'in_stock',
    lastReordered: null
  };
  showEditInventoryDialog.value = true;
}

function handleEditInventory(item) {
  isNewInventoryItem.value = false;
  editedInventory.value = { ...item };
  showEditInventoryDialog.value = true;
}

function handleReorderInventory(item) {
  const updatedInventory = props.inventory.map(i => {
    if (i.id === item.id) {
      return {
        ...i,
        status: 'reordered',
        lastReordered: new Date().toISOString()
      };
    }
    return i;
  });

  emit('update', updatedInventory);
}

function handleReorderLowStock() {
  const lowStockItems = props.inventory.filter(item =>
      item.stockLevel <= item.minStockLevel && item.status !== 'reordered'
  );

  const updatedInventory = props.inventory.map(item => {
    if (item.stockLevel <= item.minStockLevel && item.status !== 'reordered') {
      return {
        ...item,
        status: 'reordered',
        lastReordered: new Date().toISOString()
      };
    }
    return item;
  });

  emit('update', updatedInventory);
}

function handleAdjustStock(item) {
  selectedInventoryItem.value = item;
  stockAdjustment.value = {
    type: 'add',
    amount: 1,
    reason: 'delivery',
    notes: ''
  };
  showAdjustStockDialog.value = true;
}

function handleArchiveInventory(item) {
  if (confirm(`Are you sure you want to archive ${item.name}?`)) {
    const updatedInventory = props.inventory.filter(i => i.id !== item.id);
    emit('update', updatedInventory);
  }
}

function handleCreateOrder() {
  // In a real app, this would open an order creation dialog
  alert('Order creation would be implemented in a full application');
}

function saveInventoryItem() {
  if (!editedInventory.value.name || !editedInventory.value.category) {
    alert('Name and category are required');
    return;
  }

  let updatedInventory;

  if (isNewInventoryItem.value) {
    // Add new item
    updatedInventory = [...props.inventory, { ...editedInventory.value }];
  } else {
    // Update existing item
    updatedInventory = props.inventory.map(item => {
      if (item.id === editedInventory.value.id) {
        return { ...editedInventory.value };
      }
      return item;
    });
  }

  emit('update', updatedInventory);
  showEditInventoryDialog.value = false;
}

function saveStockAdjustment() {
  if (!selectedInventoryItem.value) return;

  const updatedInventory = props.inventory.map(item => {
    if (item.id === selectedInventoryItem.value.id) {
      return {
        ...item,
        stockLevel: calculatedNewStockLevel.value
      };
    }
    return item;
  });

  emit('update', updatedInventory);
  showAdjustStockDialog.value = false;
}
</script>