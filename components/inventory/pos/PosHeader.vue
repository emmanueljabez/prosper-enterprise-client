<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo and Restaurant Info -->
        <div class="flex items-center space-x-4">
          <!-- Sidebar Toggle Button -->
          <SidebarTrigger class="bg-white dark:bg-gray-800 shadow-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" />
          
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Store class="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
                POINT OF SALE
              </h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ currentTime }}
              </p>
            </div>
          </div>
        </div>

        <!-- Combined Status Indicators and Navigation -->
        <div class="flex items-center space-x-3">
          <!-- Quick Search (responsive) -->
          <div class="hidden lg:block max-w-xs">
            <Popover>
              <PopoverTrigger asChild>
                <div class="relative">
                  <Input type="search" placeholder="Search orders, tables..." class="w-full pl-8 h-8 text-sm" />
                  <Search class="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent class="w-[350px] p-4">
                <Command>
                  <CommandInput placeholder="Search anything..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Recent Orders">
                      <CommandItem>Order #001 - Table 5</CommandItem>
                      <CommandItem>Order #002 - Table 3</CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Tables">
                      <CommandItem>Table 1 - Available</CommandItem>
                      <CommandItem>Table 2 - Occupied</CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <!-- POS Status Indicators -->
          <div class="flex items-center space-x-2">
            <Badge variant="outline" class="flex items-center space-x-1">
              <ClipboardList class="h-3 w-3" />
              <span class="hidden sm:inline">{{ activeOrders }}</span>
              <span class="sm:hidden">{{ activeOrders }}</span>
              <span class="hidden sm:inline">Orders</span>
            </Badge>
            
            <Badge variant="outline" class="flex items-center space-x-1">
              <Users class="h-3 w-3" />
              <span class="hidden sm:inline">{{ tableCount }}</span>
              <span class="sm:hidden">{{ tableCount }}</span>
              <span class="hidden sm:inline">Tables</span>
            </Badge>
          </div>

          <!-- Connection Status -->
          <div class="flex items-center space-x-2">
            <div 
              class="w-2 h-2 rounded-full"
              :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
            />
            <span class="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
              {{ isConnected ? 'Online' : 'Offline' }}
            </span>
          </div>

          <!-- Quick Applications Menu -->
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" class="rounded-full p-2">
                <LayoutGrid class="h-4 w-4" />
                <span class="sr-only">Applications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[280px] p-4">
              <h4 class="mb-3 text-sm font-medium text-center">Quick Access</h4>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="navigateTo('/app/inventory')"
                  class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
                  <Package class="h-6 w-6 mb-2 text-blue-600" />
                  <span class="text-xs text-center">Inventory</span>
                </button>
                <button
                  @click="navigateTo('/app/reports')"
                  class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
                  <BarChart3 class="h-6 w-6 mb-2 text-green-600" />
                  <span class="text-xs text-center">Reports</span>
                </button>
                <button
                  @click="navigateTo('/app/customers')"
                  class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
                  <UserCheck class="h-6 w-6 mb-2 text-purple-600" />
                  <span class="text-xs text-center">Customers</span>
                </button>
                <button
                  @click="navigateTo('/app/settings')"
                  class="flex flex-col items-center p-3 rounded-lg hover:bg-muted cursor-pointer border border-gray-200">
                  <Settings class="h-6 w-6 mb-2 text-gray-600" />
                  <span class="text-xs text-center">Settings</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <!-- Notifications -->
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" class="rounded-full p-2 relative">
                <BellRing class="h-4 w-4" />
                <span v-if="notificationCount > 0" 
                      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {{ notificationCount }}
                </span>
                <span class="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[320px] p-0">
              <div class="flex flex-col">
                <div class="p-4 border-b">
                  <h4 class="text-sm font-medium">Notifications</h4>
                </div>
                <ScrollArea class="h-[250px]">
                  <div class="p-4 space-y-3">
                    <div v-if="notifications.length === 0" class="text-sm text-muted-foreground text-center py-4">
                      No new notifications
                    </div>
                    <div v-for="notification in notifications" :key="notification.id" 
                         class="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted">
                      <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium">{{ notification.title }}</p>
                        <p class="text-xs text-muted-foreground">{{ notification.message }}</p>
                        <p class="text-xs text-muted-foreground mt-1">{{ notification.time }}</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>

          <!-- Role Selector -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" class="flex items-center space-x-2">
                <component :is="roleIcons[currentRole]" class="h-4 w-4" />
                <span class="capitalize">{{ currentRole }}</span>
                <ChevronDown class="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                v-for="role in availableRoles" 
                :key="role"
                @click="$emit('switch-role', role)"
                :class="{ 'bg-accent': role === currentRole }"
              >
                <component :is="roleIcons[role]" class="mr-2 h-4 w-4" />
                <span class="capitalize">{{ role }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- User Menu -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" class="flex items-center space-x-2">
                <Avatar class="h-8 w-8">
                  <AvatarImage :src="currentUser?.avatar" :alt="currentUser?.name" />
                  <AvatarFallback>
                    {{ currentUser?.name?.charAt(0) || 'U' }}
                  </AvatarFallback>
                </Avatar>
                <span class="hidden md:block text-sm font-medium">
                  {{ currentUser?.name }}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>{{ currentUser?.name }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="navigateTo('/app/profile')">
                <User class="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem @click="navigateTo('/app/settings')">
                <Settings class="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                @click="$emit('logout')"
                class="text-red-600 dark:text-red-400"
              >
                <LogOut class="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Quick Stats Bar (for Manager role) -->
      <div v-if="currentRole === 'manager'" class="mt-3 pt-3 border-t">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <DollarSign class="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Today's Sales</p>
              <p class="text-sm font-semibold">KSh {{ formatCurrency(todaysSales) }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <TrendingUp class="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Orders Today</p>
              <p class="text-sm font-semibold">{{ ordersToday }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Clock class="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Avg. Wait Time</p>
              <p class="text-sm font-semibold">{{ avgWaitTime }}m</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users class="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Staff Online</p>
              <p class="text-sm font-semibold">{{ staffOnline }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { navigateTo } from 'nuxt/app'
import {
  Store,
  ClipboardList,
  Users,
  ChevronDown,
  User,
  Settings,
  LogOut,
  DollarSign,
  TrendingUp,
  Clock,
  ChefHat,
  CreditCard,
  Shield,
  Coffee
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  },
  activeOrders: {
    type: Number,
    default: 0
  },
  tableCount: {
    type: Number,
    default: 0
  },
  currentRole: {
    type: String,
    default: 'server'
  },
  isConnected: {
    type: Boolean,
    default: true
  },
  todaysSales: {
    type: Number,
    default: 0
  },
  ordersToday: {
    type: Number,
    default: 0
  },
  avgWaitTime: {
    type: Number,
    default: 0
  },
  staffOnline: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['switch-role', 'logout'])

// Role configuration
const availableRoles = ['server', 'kitchen', 'bartender', 'cashier', 'manager']

const roleIcons = {
  server: Users,
  kitchen: ChefHat,
  bartender: Coffee,
  cashier: CreditCard,
  manager: Shield
}

// Current time display
const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Timer for updating time
let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
