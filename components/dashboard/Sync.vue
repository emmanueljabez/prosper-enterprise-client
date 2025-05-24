<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and actions -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Sync Status</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • {{ totalMappings }} total mappings
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="refreshData" :disabled="isLoading">
            <RefreshCw v-if="!isLoading" class="h-4 w-4 mr-2" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button>
            <Download class="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <!-- Filter controls -->
      <div class="flex flex-wrap items-center gap-3">
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="synced">Synced</SelectItem>
            <SelectItem value="out_of_sync">Out of Sync</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter class="h-4 w-4 mr-2" />
              Filters
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-[200px]">
            <DropdownMenuLabel>Mapping Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model="filters.showManual">
              Manual Mappings
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.showAutomatic">
              Automatic Mappings
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sync Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model="filters.inventory">
              Inventory Syncing
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.pricing">
              Price Syncing
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.metadata">
              Metadata Syncing
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.bidirectional">
              Bidirectional Sync
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div class="flex-1"></div>
        
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            :class="{ 'bg-muted': viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >
            <PieChart class="h-4 w-4 mr-2" />
            Chart
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            :class="{ 'bg-muted': viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <List class="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>
    </header>

    <!-- KPI Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Sync Health -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Sync Health</CardTitle>
          <ActivityIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ syncHealthPercentage }}%</div>
          <p class="text-xs text-muted-foreground">
            {{ syncedCount }} of {{ totalMappings }} mappings synced
          </p>
          <div class="mt-4">
            <Progress :value="syncHealthPercentage" class="h-2" />
            <div class="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Issues -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Sync Issues</CardTitle>
          <AlertTriangleIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ errorCount }}</div>
          <p class="text-xs text-muted-foreground">
            {{ conflictCount }} unresolved conflicts detected
          </p>
          <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div class="font-medium">{{ outOfSyncCount }}</div>
              <p class="text-muted-foreground">Out of Sync</p>
            </div>
            <div>
              <div class="font-medium">{{ pendingCount }}</div>
              <p class="text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Latest Sync -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Latest Sync</CardTitle>
          <ClockIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ formatTimeAgo(latestSyncTime) }}</div>
          <p class="text-xs text-muted-foreground">
            {{ formatDateTime(latestSyncTime) }}
          </p>
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Last sync item</span>
              <span class="font-medium">{{ latestSyncMappingName }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Sync Performance -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Sync Performance</CardTitle>
          <ZapIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ averageSyncTime }}s</div>
          <p class="text-xs text-muted-foreground">
            Average sync duration
          </p>
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Success rate</span>
              <span class="font-medium">{{ syncSuccessRate }}%</span>
            </div>
            <Progress :value="syncSuccessRate" class="h-2 mt-1" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Visualization Sections -->
    <Card v-if="viewMode === 'chart'">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Sync Status Overview</CardTitle>
            <CardDescription>
              Distribution of mappings by sync status
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-[400px] grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Status Distribution -->
          <div class="flex flex-col">
            <h3 class="text-sm font-medium mb-6">Status Distribution</h3>
            <div class="flex-1 flex items-center justify-center">
              <div class="relative h-64 w-64">
                <!-- Pie chart visualization (simplified for the example) -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-2xl font-bold">{{ totalMappings }}</div>
                    <div class="text-sm text-muted-foreground">Total Mappings</div>
                  </div>
                </div>
                <!-- Simulated pie chart segments -->
                <svg viewBox="0 0 100 100" class="absolute inset-0">
                  <!-- Background circle -->
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" stroke-width="20" />
                  
                  <!-- Synced segment (green) -->
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#22c55e" 
                    stroke-width="20"
                    stroke-dasharray="251.2" 
                    stroke-dashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  
                  <!-- Error segment (red) -->
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#ef4444" 
                    stroke-width="20"
                    stroke-dasharray="25.12" 
                    stroke-dashoffset="-251.2"
                    transform="rotate(-90 50 50)"
                  />
                  
                  <!-- Out of sync segment (yellow) -->
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#eab308" 
                    stroke-width="20"
                    stroke-dasharray="37.68" 
                    stroke-dashoffset="-226.08"
                    transform="rotate(-90 50 50)"
                  />
                  
                  <!-- Pending segment (blue) -->
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#3b82f6" 
                    stroke-width="20"
                    stroke-dasharray="37.68" 
                    stroke-dashoffset="-188.4"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <div class="text-sm">Synced ({{ syncedCount }})</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="text-sm">Error ({{ errorCount }})</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="text-sm">Out of Sync ({{ outOfSyncCount }})</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <div class="text-sm">Pending ({{ pendingCount }})</div>
              </div>
            </div>
          </div>
          
          <!-- Sync Options Distribution -->
          <div class="flex flex-col">
            <h3 class="text-sm font-medium mb-6">Sync Options Distribution</h3>
            <div class="flex-1 flex flex-col justify-center space-y-6">
              <!-- Inventory -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Inventory</span>
                  <span>{{ inventorySyncCount }} mappings</span>
                </div>
                <Progress :value="(inventorySyncCount / totalMappings) * 100" class="h-2" />
              </div>
              
              <!-- Pricing -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Pricing</span>
                  <span>{{ pricingSyncCount }} mappings</span>
                </div>
                <Progress :value="(pricingSyncCount / totalMappings) * 100" class="h-2" />
              </div>
              
              <!-- Metadata -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Metadata</span>
                  <span>{{ metadataSyncCount }} mappings</span>
                </div>
                <Progress :value="(metadataSyncCount / totalMappings) * 100" class="h-2" />
              </div>
              
              <!-- Bidirectional -->
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Bidirectional</span>
                  <span>{{ bidirectionalSyncCount }} mappings</span>
                </div>
                <Progress :value="(bidirectionalSyncCount / totalMappings) * 100" class="h-2" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Mapping Table -->
    <Card v-if="viewMode === 'table'">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Mapping Details</CardTitle>
            <CardDescription>
              All mappings with their current sync status
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Input 
              placeholder="Search mappings..." 
              class="w-[200px]"
              v-model="searchQuery"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown class="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="sortBy = 'itemName'; sortOrder = 'asc'">
                  <Check v-if="sortBy === 'itemName' && sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Item Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'itemName'; sortOrder = 'desc'">
                  <Check v-if="sortBy === 'itemName' && sortOrder === 'desc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Item Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="sortBy = 'lastSyncTime'; sortOrder = 'desc'">
                  <Check v-if="sortBy === 'lastSyncTime' && sortOrder === 'desc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Last Synced (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'lastSyncTime'; sortOrder = 'asc'">
                  <Check v-if="sortBy === 'lastSyncTime' && sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Last Synced (Oldest)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="sortBy = 'syncStatus'; sortOrder = 'asc'">
                  <Check v-if="sortBy === 'syncStatus' && sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item → Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sync Options</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-24 text-center">
                <Loader2 class="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                <span class="text-sm text-muted-foreground block mt-2">Loading mappings...</span>
              </TableCell>
            </TableRow>
            
            <TableRow v-else-if="filteredMappings.length === 0">
              <TableCell colspan="6" class="h-24 text-center">
                <div class="flex flex-col items-center justify-center">
                  <LinkIcon class="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <span class="text-muted-foreground">No mappings found</span>
                  <p class="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              </TableCell>
            </TableRow>
            
            <TableRow 
              v-for="mapping in paginatedMappings" 
              :key="mapping.id"
              :class="{'bg-muted/20': mapping.syncStatus === 'error'}"
            >
              <TableCell>
                <div class="flex items-start space-x-2">
                  <div>
                    <div class="font-medium">{{ mapping.itemName }}</div>
                    <div class="text-xs text-muted-foreground">{{ mapping.itemSku }}</div>
                  </div>
                  <div class="text-muted-foreground">→</div>
                  <div>
                    <div class="font-medium">{{ mapping.productName }}</div>
                    <div class="text-xs text-muted-foreground">{{ mapping.productSku }}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="mapping.mappingType === 'manual' ? 'outline' : 'secondary'">
                  {{ formatMappingType(mapping.mappingType) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex space-x-1">
                  <Badge v-if="mapping.syncOptions.inventory" variant="outline" class="text-xs">Inv</Badge>
                  <Badge v-if="mapping.syncOptions.pricing" variant="outline" class="text-xs">Price</Badge>
                  <Badge v-if="mapping.syncOptions.metadata" variant="outline" class="text-xs">Meta</Badge>
                  <Badge v-if="mapping.syncOptions.bidirectional" variant="outline" class="text-xs">2-Way</Badge>
                </div>
              </TableCell>
              <TableCell>
                <div v-if="mapping.lastSyncTime">
                  <div class="text-sm">{{ formatTimeAgo(mapping.lastSyncTime) }}</div>
                  <div class="text-xs text-muted-foreground">{{ formatDateTime(mapping.lastSyncTime) }}</div>
                </div>
                <div v-else class="text-sm text-muted-foreground">Never</div>
              </TableCell>
              <TableCell>
                <Badge :variant="getSyncStatusVariant(mapping.syncStatus)">
                  {{ formatSyncStatus(mapping.syncStatus) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewMappingDetails(mapping)">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="syncNow(mapping)">
                      <RefreshCw class="mr-2 h-4 w-4" />
                      <span>Sync Now</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem v-if="hasConflicts(mapping)" @click="resolveConflicts(mapping)">
                      <AlertTriangleIcon class="mr-2 h-4 w-4" />
                      <span>Resolve Conflicts</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-muted-foreground">
            Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }} to
            {{ Math.min(pagination.pageSize * pagination.page, filteredMappings.length) }}
            of {{ filteredMappings.length }} mappings
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page <= 1"
              @click="pagination.page--"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="pagination.page >= totalPages"
              @click="pagination.page++"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sync Conflicts -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Active Sync Conflicts</CardTitle>
            <CardDescription>
              Issues that need to be resolved to ensure data consistency
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="resolveAllConflicts">
            <ShieldAlertIcon class="h-4 w-4 mr-2" />
            Resolve All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
            <span class="text-sm text-muted-foreground ml-2">Loading data...</span>
          </div>
          
          <div v-else-if="unresolvedConflicts.length === 0" class="text-center py-8">
            <ShieldCheckIcon class="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p class="mt-2 text-muted-foreground">No active conflicts</p>
            <p class="text-xs text-muted-foreground mt-1">All sync conflicts have been resolved</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="conflict in unresolvedConflicts.slice(0, 3)"
              :key="conflict.id" 
              class="border rounded-md p-4"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium">{{ conflict.type }}</h3>
                  <p class="text-sm text-muted-foreground">{{ conflict.itemName }} ↔ {{ conflict.productName }}</p>
                </div>
                <Badge variant="destructive">Unresolved</Badge>
              </div>
              
              <div class="mt-3">
                <p class="text-sm">{{ conflict.details }}</p>
                <p class="text-xs text-muted-foreground mt-1">Detected {{ formatTimeAgo(conflict.detectedAt) }}</p>
              </div>
              
              <div class="mt-4 flex justify-end space-x-2">
                <Button size="sm" variant="outline" @click="viewConflictDetails(conflict)">
                  <Eye class="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button size="sm" variant="default" @click="resolveConflict(conflict)">
                  <ShieldCheckIcon class="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              </div>
            </div>
            
            <div v-if="unresolvedConflicts.length > 3" class="text-center pt-2">
              <Button variant="outline" @click="viewAllConflicts">
                View All {{ unresolvedConflicts.length }} Conflicts
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sync Performance Metrics -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Sync Performance Metrics</CardTitle>
            <CardDescription>
              Tracking sync times and success rates over time
            </CardDescription>
          </div>
          <Select v-model="timeRange">
            <SelectTrigger class="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm">Average Sync Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ averageSyncTime }}s</div>
                <p class="text-xs text-muted-foreground">
                  <span :class="syncTimeChange >= 0 ? 'text-green-500' : 'text-red-500'">
                    {{ syncTimeChange >= 0 ? '+' : '' }}{{ syncTimeChange }}%
                  </span> 
                  from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ syncSuccessRate }}%</div>
                <p class="text-xs text-muted-foreground">
                  <span :class="successRateChange >= 0 ? 'text-green-500' : 'text-red-500'">
                    {{ successRateChange >= 0 ? '+' : '' }}{{ successRateChange }}%
                  </span> 
                  from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="text-sm">Total Syncs</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{{ totalSyncs }}</div>
                <p class="text-xs text-muted-foreground">
                  {{ syncPerHour }} syncs per hour average
                </p>
              </CardContent>
            </Card>
          </div>
          
          <!-- Sync time trend visualization -->
          <div class="h-[200px] relative">
            <div class="absolute inset-x-0 bottom-0 h-[1px] bg-border"></div>
            <div class="absolute inset-y-0 left-0 w-[1px] bg-border"></div>
            
            <!-- Simplified chart visualization -->
            <div class="absolute inset-0 flex items-end">
              <div class="flex-1 flex items-end justify-around h-full">
                <div v-for="i in 7" :key="i" class="w-8 bg-primary/80 rounded-t" :style="`height: ${20 + Math.random() * 70}%`"></div>
              </div>
            </div>
            
            <!-- Y-axis labels -->
            <div class="absolute left-2 top-0 text-xs text-muted-foreground">10s</div>
            <div class="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">5s</div>
            <div class="absolute left-2 bottom-2 text-xs text-muted-foreground">0s</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { format, formatDistance } from 'date-fns'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Select, SelectValue, SelectTrigger, SelectContent, SelectItem 
} from '@/components/ui/select'
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'

// Icons
import {
  RefreshCw, Download, Filter, ChevronDown, PieChart, List,
  ArrowUpDown, Check, MoreHorizontal, Eye, AlertTriangleIcon,
  Loader2, LinkIcon, ActivityIcon, ClockIcon, ZapIcon,
  ShieldCheckIcon, ShieldAlertIcon
} from 'lucide-vue-next'

// Import store
import { useInventoryStore } from '@/store/modules/inventory/items'

// Toast notifications
const { toast } = useToast()

// Initialize store
const inventoryStore = useInventoryStore()

// State
const isLoading = ref(false)
const mappings = ref([])
const conflicts = ref([])

// UI state
const statusFilter = ref('all')
const viewMode = ref('chart')
const searchQuery = ref('')
const sortBy = ref('lastSyncTime')
const sortOrder = ref('desc')
const timeRange = ref('week')
const filters = ref({
  showManual: true,
  showAutomatic: true,
  inventory: true,
  pricing: true,
  metadata: true,
  bidirectional: true
})
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// Computed values
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

const totalMappings = computed(() => {
  return mappings.value.length
})

const syncedCount = computed(() => {
  return mappings.value.filter(m => m.syncStatus === 'synced').length
})

const errorCount = computed(() => {
  return mappings.value.filter(m => m.syncStatus === 'error').length
})

const outOfSyncCount = computed(() => {
  return mappings.value.filter(m => m.syncStatus === 'out_of_sync').length
})

const pendingCount = computed(() => {
  return mappings.value.filter(m => m.syncStatus === 'pending').length
})

const syncHealthPercentage = computed(() => {
  if (totalMappings.value === 0) return 0
  return Math.round((syncedCount.value / totalMappings.value) * 100)
})

const inventorySyncCount = computed(() => {
  return mappings.value.filter(m => m.syncOptions.inventory).length
})

const pricingSyncCount = computed(() => {
  return mappings.value.filter(m => m.syncOptions.pricing).length
})

const metadataSyncCount = computed(() => {
  return mappings.value.filter(m => m.syncOptions.metadata).length
})

const bidirectionalSyncCount = computed(() => {
  return mappings.value.filter(m => m.syncOptions.bidirectional).length
})

const unresolvedConflicts = computed(() => {
  return conflicts.value.filter(c => c.status === 'unresolved')
})

const conflictCount = computed(() => {
  return unresolvedConflicts.value.length
})

const latestSyncTime = computed(() => {
  const syncedMappings = mappings.value.filter(m => m.lastSyncTime)
  if (syncedMappings.length === 0) return null
  
  // Find the most recent sync time
  return syncedMappings.reduce((latest, current) => {
    const latestTime = new Date(latest.lastSyncTime).getTime()
    const currentTime = new Date(current.lastSyncTime).getTime()
    return currentTime > latestTime ? current : latest
  }, syncedMappings[0]).lastSyncTime
})

const latestSyncMappingName = computed(() => {
  if (!latestSyncTime.value) return 'N/A'
  
  const mapping = mappings.value.find(m => m.lastSyncTime === latestSyncTime.value)
  return mapping ? `${mapping.itemName} → ${mapping.productName}` : 'N/A'
})

// Filter mappings based on current filters
const filteredMappings = computed(() => {
  let filtered = mappings.value
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(mapping => mapping.syncStatus === statusFilter.value)
  }
  
  // Apply mapping type filters
  filtered = filtered.filter(mapping => {
    if (mapping.mappingType === 'manual' && !filters.value.showManual) return false
    if (mapping.mappingType === 'automatic' && !filters.value.showAutomatic) return false
    return true
  })
  
  // Apply sync options filters
  filtered = filtered.filter(mapping => {
    if (filters.value.inventory && !mapping.syncOptions.inventory) return false
    if (filters.value.pricing && !mapping.syncOptions.pricing) return false
    if (filters.value.metadata && !mapping.syncOptions.metadata) return false
    if (filters.value.bidirectional && !mapping.syncOptions.bidirectional) return false
    return true
  })
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(mapping => 
      mapping.itemName.toLowerCase().includes(query) || 
      mapping.productName.toLowerCase().includes(query) ||
      mapping.itemSku.toLowerCase().includes(query) ||
      mapping.productSku.toLowerCase().includes(query)
    )
  }
  
  // Apply sorting
  return [...filtered].sort((a, b) => {
    if (sortBy.value === 'itemName') {
      return sortOrder.value === 'asc' 
        ? a.itemName.localeCompare(b.itemName) 
        : b.itemName.localeCompare(a.itemName)
    } 
    else if (sortBy.value === 'lastSyncTime') {
      const timeA = a.lastSyncTime ? new Date(a.lastSyncTime).getTime() : 0
      const timeB = b.lastSyncTime ? new Date(b.lastSyncTime).getTime() : 0
      return sortOrder.value === 'asc' 
        ? timeA - timeB 
        : timeB - timeA
    }
    else if (sortBy.value === 'syncStatus') {
      const statusOrder = { 'synced': 1, 'pending': 2, 'out_of_sync': 3, 'error': 4 }
      return sortOrder.value === 'asc' 
        ? statusOrder[a.syncStatus] - statusOrder[b.syncStatus] 
        : statusOrder[b.syncStatus] - statusOrder[a.syncStatus]
    }
    return 0
  })
})

const paginatedMappings = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredMappings.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMappings.value.length / pagination.pageSize)
})

// Mock performance metrics
const averageSyncTime = computed(() => {
  return (1.8 + Math.random() * 0.4).toFixed(1)
})

const syncSuccessRate = computed(() => {
  return Math.round(92 + Math.random() * 6)
})

const syncTimeChange = computed(() => {
  return (-5 + Math.random() * 10).toFixed(1)
})

const successRateChange = computed(() => {
  return (Math.random() * 3).toFixed(1)
})

const totalSyncs = computed(() => {
  return Math.round(250 + Math.random() * 50)
})

const syncPerHour = computed(() => {
  return Math.round(10 + Math.random() * 5)
})

// Methods
const refreshData = async () => {
  isLoading.value = true
  
  try {
    // Fetch mappings from store
    const response = await inventoryStore.fetchMappings()
    mappings.value = inventoryStore.getMappings
    
    // Fetch conflicts
    const conflictsResponse = await inventoryStore.fetchSyncConflicts()
    conflicts.value = inventoryStore.getSyncConflicts
    
    toast({
      title: "Data refreshed",
      description: "Sync status information has been updated.",
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    toast({
      title: "Error refreshing data",
      description: "There was a problem fetching the latest data.",
      variant: "destructive"
    })
  } finally {
    isLoading.value = false
  }
}

const formatMappingType = (type) => {
  if (type === 'manual') return 'Manual'
  if (type === 'automatic') return 'Auto'
  return type
}

const formatSyncStatus = (status) => {
  const statusMap = {
    'synced': 'Synced',
    'out_of_sync': 'Out of Sync',
    'pending': 'Pending',
    'error': 'Error'
  }
  return statusMap[status] || status
}

const getSyncStatusVariant = (status) => {
  const variantMap = {
    'synced': 'success',
    'out_of_sync': 'warning',
    'pending': 'secondary',
    'error': 'destructive'
  }
  return variantMap[status] || 'outline'
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Never'
  try {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true })
  } catch (e) {
    return dateString
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

const hasConflicts = (mapping) => {
  return conflicts.value.some(c => c.mappingId === mapping.id && c.status === 'unresolved')
}

// Action handlers
const viewMappingDetails = (mapping) => {
  toast({
    title: "View Mapping Details",
    description: `Viewing details for ${mapping.itemName} → ${mapping.productName}`,
  })
}

const syncNow = async (mapping) => {
  toast({
    title: "Syncing",
    description: `Syncing ${mapping.itemName} with ${mapping.productName}...`,
  })
  
  try {
    await inventoryStore.syncMapping(mapping.id)
    
    // Refresh data to get updated status
    await refreshData()
    
    toast({
      title: "Sync Complete",
      description: `Successfully synced ${mapping.itemName} with ${mapping.productName}`,
    })
  } catch (error) {
    toast({
      title: "Sync Failed",
      description: error.message || "There was an error during synchronization",
      variant: "destructive"
    })
  }
}

const resolveConflicts = (mapping) => {
  const mappingConflicts = conflicts.value.filter(c => c.mappingId === mapping.id && c.status === 'unresolved')
  
  toast({
    title: "Resolve Conflicts",
    description: `Resolving ${mappingConflicts.length} conflicts for ${mapping.itemName}`,
  })
}

const viewConflictDetails = (conflict) => {
  toast({
    title: "Conflict Details",
    description: `Viewing details for conflict between ${conflict.itemName} and ${conflict.productName}`,
  })
}

const resolveConflict = async (conflict) => {
  toast({
    title: "Resolving Conflict",
    description: `Resolving conflict for ${conflict.itemName} → ${conflict.productName}`,
  })
  
  try {
    // Mock resolution
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update local state (in a real app, this would call the store)
    const index = conflicts.value.findIndex(c => c.id === conflict.id)
    if (index !== -1) {
      conflicts.value[index].status = 'resolved'
    }
    
    toast({
      title: "Conflict Resolved",
      description: `Successfully resolved the conflict`,
    })
  } catch (error) {
    toast({
      title: "Resolution Failed",
      description: "There was an error resolving the conflict",
      variant: "destructive"
    })
  }
}

const resolveAllConflicts = async () => {
  const count = unresolvedConflicts.value.length
  if (count === 0) return
  
  toast({
    title: "Resolving All Conflicts",
    description: `Resolving ${count} unresolved conflicts...`,
  })
  
  try {
    // Mock resolution
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update all conflicts (in a real app, this would call the store)
    conflicts.value.forEach(conflict => {
      if (conflict.status === 'unresolved') {
        conflict.status = 'resolved'
      }
    })
    
    toast({
      title: "All Conflicts Resolved",
      description: `Successfully resolved ${count} conflicts`,
    })
  } catch (error) {
    toast({
      title: "Resolution Failed",
      description: "There was an error resolving the conflicts",
      variant: "destructive"
    })
  }
}

const viewAllConflicts = () => {
  toast({
    title: "View All Conflicts",
    description: `Viewing all ${unresolvedConflicts.value.length} unresolved conflicts`,
  })
}

// Initialize
onMounted(() => {
  refreshData()
})
</script>