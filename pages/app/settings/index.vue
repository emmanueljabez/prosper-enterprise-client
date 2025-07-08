<template>
  <div class="container py-8 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">      <div>
        <h1 class="text-3xl font-bold tracking-tight">Inventory Settings</h1>
        <p class="text-muted-foreground mt-1">
          Configure your inventory management system
        </p>
      </div>

      <div class="flex items-center gap-2">        <div class="relative w-80">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search inventory settings" class="pl-9" />
        </div>
        <Button variant="outline" @click="$router.back()">
          Close Settings
          <XIcon class="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>    <!-- Settings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Inventory Categories -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <PackageIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Categories</CardTitle>
              <p class="text-sm text-muted-foreground">Manage Item categories</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/categories" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Item Categories</span>
                <p class="text-xs text-muted-foreground">Organize your inventory</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/settings/inventory/subcategories" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Subcategories</span>
                <p class="text-xs text-muted-foreground">Create detailed classifications</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Units of Measure -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <WrenchIcon class="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Units & Measures</CardTitle>
              <p class="text-sm text-muted-foreground">Configure measurement units</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/uom" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Units of Measure</span>
                <p class="text-xs text-muted-foreground">Define measurement units</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/settings/inventory/conversions" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Unit Conversions</span>
                <p class="text-xs text-muted-foreground">Set conversion rates</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Warehouse Settings -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-100 rounded-lg">
              <BuildingIcon class="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Warehouses</CardTitle>
              <p class="text-sm text-muted-foreground">Manage storage locations</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/warehouses" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Warehouse Locations</span>
                <p class="text-xs text-muted-foreground">Configure storage facilities</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/settings/inventory/zones" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Storage Zones</span>
                <p class="text-xs text-muted-foreground">Organize warehouse areas</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Stock Management -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-orange-100 rounded-lg">
              <BarChartIcon class="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Stock Control</CardTitle>
              <p class="text-sm text-muted-foreground">Configure stock policies</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/reorder-points" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Reorder Points</span>
                <p class="text-xs text-muted-foreground">Set minimum stock levels</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/settings/inventory/valuation" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Valuation Methods</span>
                <p class="text-xs text-muted-foreground">Configure costing methods</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Suppliers -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-100 rounded-lg">
              <UsersIcon class="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Suppliers</CardTitle>
              <p class="text-sm text-muted-foreground">Manage supplier relationships</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/suppliers" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Supplier Management</span>
                <p class="text-xs text-muted-foreground">Configure supplier details</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/settings/inventory/purchase-terms" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Purchase Terms</span>
                <p class="text-xs text-muted-foreground">Set default terms</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>      <!-- Business Rules -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <SlidersIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Business Rules</CardTitle>
              <p class="text-sm text-muted-foreground">Configure business logic and automation</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/rules/visibility" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Visibility Rules</span>
                <p class="text-xs text-muted-foreground">Control data visibility</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/rules/trigger-configuration" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Trigger Configuration</span>
                <p class="text-xs text-muted-foreground">Set up automated triggers</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/rules/sync-schedules" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Sync Schedules</span>
                <p class="text-xs text-muted-foreground">Manage synchronization timing</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Inventory Settings -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-emerald-100 rounded-lg">
              <SettingsIcon class="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle class="text-lg">Inventory Settings</CardTitle>
              <p class="text-sm text-muted-foreground">Advanced configuration management</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/settings" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Configuration Manager</span>
                <p class="text-xs text-muted-foreground">Manage system settings</p>
              </NuxtLink>
            </li>
            <li>
              <div class="block p-2 rounded-md text-muted-foreground">
                <span class="text-sm font-medium">Settings History</span>
                <p class="text-xs text-muted-foreground">View configuration changes</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- General Settings -->
      <Card class="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 rounded-lg">
              <CodeIcon class="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <CardTitle class="text-lg">General</CardTitle>
              <p class="text-sm text-muted-foreground">System-wide settings</p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-grow">
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/app/settings/inventory/general" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">System Settings</span>
                <p class="text-xs text-muted-foreground">Configure default values</p>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/app/settings/inventory/alerts" class="block p-2 rounded-md hover:bg-gray-50 transition-colors">
                <span class="text-sm font-medium">Alerts & Notifications</span>
                <p class="text-xs text-muted-foreground">Set up system alerts</p>
              </NuxtLink>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  BuildingIcon, NetworkIcon, UsersIcon, CreditCardIcon,
  PackageIcon, WrenchIcon, LinkIcon, ShieldIcon,
  BarChartIcon, ServerIcon, MessageSquareIcon, PercentIcon,
  ZapIcon, PuzzleIcon, CodeIcon, SearchIcon, XIcon,
  SettingsIcon, SlidersIcon
} from 'lucide-vue-next';
</script>