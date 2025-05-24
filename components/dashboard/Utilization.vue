<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and actions -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Warehouse Utilization</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • {{ totalLocations }} locations tracked
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
      
      <!-- Location filter -->
      <div class="flex flex-wrap items-center gap-3">
        <Select v-model="warehouseFilter">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            <SelectItem 
              v-for="warehouse in warehouses" 
              :key="warehouse.id" 
              :value="warehouse.id"
            >
              {{ warehouse.name }}
            </SelectItem>
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
            <DropdownMenuLabel>Show Locations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem v-model="filters.showWarehouses">
              Warehouses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.showZones">
              Zones
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.showAisles">
              Aisles
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem v-model="filters.showBins">
              Bins
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Utilization Thresholds</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div class="px-2 py-1.5 text-sm">
              <div class="flex items-center justify-between mb-1">
                <Label for="bottleneck-threshold" class="text-xs">Bottleneck</Label>
                <span class="text-xs">{{ filters.bottleneckThreshold }}%</span>
              </div>
              <Slider
                id="bottleneck-threshold"
                v-model="filters.bottleneckThreshold"
                :min="50"
                :max="100"
                :step="5"
                class="w-full"
              />
            </div>
            <div class="px-2 py-1.5 text-sm">
              <div class="flex items-center justify-between mb-1">
                <Label for="underutilized-threshold" class="text-xs">Underutilized</Label>
                <span class="text-xs">{{ filters.underutilizedThreshold }}%</span>
              </div>
              <Slider
                id="underutilized-threshold"
                v-model="filters.underutilizedThreshold"
                :min="0"
                :max="50"
                :step="5"
                class="w-full"
              />
            </div>
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
            <BarChart2 class="h-4 w-4 mr-2" />
            Chart
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            :class="{ 'bg-muted': viewMode === 'treemap' }"
            @click="viewMode = 'treemap'"
          >
            <LayoutGrid class="h-4 w-4 mr-2" />
            Treemap
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
      <!-- Overall Utilization -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Overall Utilization</CardTitle>
          <Gauge class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ overallUtilizationPercentage }}%</div>
          <p class="text-xs text-muted-foreground">
            {{ formatNumber(utilizationData.itemsStored) }} of {{ formatNumber(utilizationData.totalCapacity) }} capacity used
          </p>
          <div class="mt-4">
            <Progress :value="overallUtilizationPercentage" class="h-2" />
            <div class="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Warehouse Count -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Locations</CardTitle>
          <Warehouse class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ utilizationData.warehouses }}</div>
          <p class="text-xs text-muted-foreground">
            Warehouses across {{ utilizationData.sites }} sites
          </p>
          <div class="mt-4 grid grid-cols-4 gap-2 text-xs">
            <div>
              <div class="font-medium">{{ utilizationData.zones }}</div>
              <p class="text-muted-foreground">Zones</p>
            </div>
            <div>
              <div class="font-medium">{{ utilizationData.aisles }}</div>
              <p class="text-muted-foreground">Aisles</p>
            </div>
            <div>
              <div class="font-medium">{{ utilizationData.bins }}</div>
              <p class="text-muted-foreground">Bins</p>
            </div>
            <div>
              <div class="font-medium">{{ utilizationData.binsInUse }}</div>
              <p class="text-muted-foreground">In Use</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Bottlenecks -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Bottlenecks</CardTitle>
          <AlertOctagon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ bottleneckLocations.length }}</div>
          <p class="text-xs text-muted-foreground">
            Locations over {{ filters.bottleneckThreshold }}% capacity
          </p>
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Most utilized zone</span>
              <span class="font-medium">{{ mostUtilizedZone ? mostUtilizedZone.name : 'N/A' }}</span>
            </div>
            <Progress 
              :value="mostUtilizedZone ? calculateUtilization(mostUtilizedZone) : 0" 
              class="h-2 mt-1" 
            />
            <p class="mt-1 text-xs text-muted-foreground text-right">
              {{ mostUtilizedZone ? `${calculateUtilization(mostUtilizedZone)}%` : 'N/A' }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Available Space -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Available Space</CardTitle>
          <BoxSelect class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ underutilizedLocations.length }}</div>
          <p class="text-xs text-muted-foreground">
            Locations under {{ filters.underutilizedThreshold }}% capacity
          </p>
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">Most available zone</span>
              <span class="font-medium">{{ leastUtilizedZone ? leastUtilizedZone.name : 'N/A' }}</span>
            </div>
            <Progress 
              :value="leastUtilizedZone ? calculateUtilization(leastUtilizedZone) : 0" 
              class="h-2 mt-1" 
            />
            <p class="mt-1 text-xs text-muted-foreground text-right">
              {{ leastUtilizedZone ? `${calculateUtilization(leastUtilizedZone)}%` : 'N/A' }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Visualization Sections -->
    <Card v-if="viewMode === 'chart' || viewMode === 'treemap'">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Warehouse Utilization Visualization</CardTitle>
            <CardDescription>
              {{ viewMode === 'chart' ? 'Capacity utilization by location' : 'Space allocation visualization' }}
            </CardDescription>
          </div>
          <Select v-model="visualizationLevel">
            <SelectTrigger class="w-[150px]">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse">Warehouses</SelectItem>
              <SelectItem value="zone">Zones</SelectItem>
              <SelectItem value="aisle">Aisles</SelectItem>
              <SelectItem value="bin">Bins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Chart View -->
        <div v-if="viewMode === 'chart'" class="h-[400px]">
          <div v-if="filteredLocations.length === 0" class="h-full flex items-center justify-center">
            <div class="text-center">
              <BarChart2 class="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p class="mt-2 text-muted-foreground">No data available to display</p>
            </div>
          </div>
          <div v-else class="h-full">
            <!-- Chart Visualization -->
            <div class="h-full flex flex-col">
              <div class="flex-1 grid grid-cols-1 gap-2">
                <div 
                  v-for="location in filteredLocations.slice(0, 12)" 
                  :key="location.id"
                  class="flex items-center gap-3"
                >
                  <div class="w-32 truncate text-sm">{{ location.name }}</div>
                  <div class="flex-1">
                    <div class="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div 
                        class="h-4 rounded-full"
                        :class="getUtilizationColorClass(calculateUtilization(location))"
                        :style="{width: `${calculateUtilization(location)}%`}"
                      ></div>
                    </div>
                  </div>
                  <div class="w-12 text-right text-sm">
                    {{ calculateUtilization(location) }}%
                  </div>
                </div>
              </div>
              <div class="mt-4 flex justify-between text-xs text-muted-foreground">
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Low (0-50%)</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Medium (51-80%)</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>High (81-100%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Treemap View -->
        <div v-if="viewMode === 'treemap'" class="h-[400px]">
          <div v-if="filteredLocations.length === 0" class="h-full flex items-center justify-center">
            <div class="text-center">
              <LayoutGrid class="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p class="mt-2 text-muted-foreground">No data available to display</p>
            </div>
          </div>
          <div v-else class="h-full grid grid-cols-4 gap-2">
            <div 
              v-for="location in filteredLocations.slice(0, 16)" 
              :key="location.id"
              class="relative border rounded-md overflow-hidden"
              :class="getUtilizationBorderClass(calculateUtilization(location))"
              :style="{
                flexGrow: location.capacity || 1,
                height: `${Math.min(100, Math.max(50, (location.capacity || 50) / 10))}px`
              }"
            >
              <div 
                class="absolute inset-0 opacity-80"
                :class="getUtilizationBgClass(calculateUtilization(location))"
                :style="{width: `${calculateUtilization(location)}%`}"
              ></div>
              <div class="relative z-10 p-2 h-full flex flex-col justify-between">
                <div class="text-xs font-medium truncate">{{ location.name }}</div>
                <div class="text-xs">
                  {{ location.itemCount || 0 }}/{{ location.capacity || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabular View -->
    <Card v-if="viewMode === 'table'">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Location Utilization Details</CardTitle>
            <CardDescription>
              Detailed view of capacity and utilization
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Input 
              placeholder="Search locations..." 
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
                <DropdownMenuItem @click="sortBy = 'name'; sortOrder = 'asc'">
                  <Check v-if="sortBy === 'name' && sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'name'; sortOrder = 'desc'">
                  <Check v-if="sortBy === 'name' && sortOrder === 'desc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="sortBy = 'utilization'; sortOrder = 'asc'">
                  <Check v-if="sortBy === 'utilization' && sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Utilization (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'utilization'; sortOrder = 'desc'">
                  <Check v-if="sortBy === 'utilization' && sortOrder === 'desc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Utilization (High to Low)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="sortBy = 'capacity'; sortOrder = 'desc'">
                  <Check v-if="sortBy === 'capacity' && sortOrder === 'desc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Capacity (High to Low)
                </DropdownMenuItem>
                <DropdownMenuItem @click="sortBy = 'capacity'; sortOrder = 'asc'">
                  <Check v-if="sortBy === 'capacity' && sortOrder === 'asc'" class="h-4 w-4 mr-2" />
                  <span v-else class="w-4 mr-2"></span>
                  Capacity (Low to High)
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
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="8" class="h-24 text-center">
                <Loader2 class="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                <span class="text-sm text-muted-foreground block mt-2">Loading locations...</span>
              </TableCell>
            </TableRow>
            
            <TableRow v-else-if="sortedAndFilteredLocations.length === 0">
              <TableCell colspan="8" class="h-24 text-center">
                <div class="flex flex-col items-center justify-center">
                  <BoxSelect class="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <span class="text-muted-foreground">No locations found</span>
                  <p class="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              </TableCell>
            </TableRow>
            
            <TableRow 
              v-for="location in sortedAndFilteredLocations" 
              :key="location.id"
              :class="{'bg-muted/20': isBottleneck(location)}"
            >
              <TableCell>
                <div class="font-medium">{{ location.name }}</div>
                <div v-if="location.parentId" class="text-xs text-muted-foreground">
                  {{ getParentName(location.parentId) }}
                </div>
              </TableCell>
              <TableCell>{{ formatLocationType(location.type) }}</TableCell>
              <TableCell>{{ location.code || '—' }}</TableCell>
              <TableCell>{{ location.itemCount || 0 }}</TableCell>
              <TableCell>{{ location.capacity || '—' }}</TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <div class="w-24 bg-muted rounded-full h-2">
                    <div 
                      class="h-2 rounded-full" 
                      :class="getUtilizationColorClass(calculateUtilization(location))"
                      :style="{ width: `${Math.min(100, calculateUtilization(location))}%` }"
                    ></div>
                  </div>
                  <span class="text-sm">{{ calculateUtilization(location) }}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  :variant="location.status === 'active' ? 'success' : 'secondary'"
                >
                  {{ formatStatus(location.status) }}
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
                    <DropdownMenuItem @click="viewLocationDetails(location)">
                      <Eye class="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="viewItems(location)">
                      <Package class="mr-2 h-4 w-4" />
                      <span>View Items</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ArrowDownToLine class="mr-2 h-4 w-4" />
                      <span>Export Data</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Bottleneck Locations -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Potential Bottlenecks</CardTitle>
            <CardDescription>
              High-utilization locations that may need optimization (over {{ filters.bottleneckThreshold }}% utilized)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="exportBottlenecks">
            <AlertTriangle class="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
            <span class="text-sm text-muted-foreground ml-2">Loading data...</span>
          </div>
          
          <div v-else-if="bottleneckLocations.length === 0" class="text-center py-8">
            <AlertOctagon class="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p class="mt-2 text-muted-foreground">No bottlenecks detected</p>
            <p class="text-xs text-muted-foreground mt-1">All locations are below the {{ filters.bottleneckThreshold }}% threshold</p>
          </div>
          
          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div 
              v-for="location in bottleneckLocations.slice(0, 6)"
              :key="location.id" 
              class="border rounded-md p-4 space-y-3"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium">{{ location.name }}</h3>
                  <p class="text-sm text-muted-foreground">{{ formatLocationType(location.type) }} • {{ location.code || 'No code' }}</p>
                </div>
                <Badge variant="destructive" class="ml-2">
                  {{ calculateUtilization(location) }}%
                </Badge>
              </div>
              
              <Progress 
                :value="calculateUtilization(location)" 
                class="h-2" 
              />
              
              <div class="flex items-center justify-between text-sm">
                <span>{{ location.itemCount || 0 }} items</span>
                <span>Capacity: {{ location.capacity || 'N/A' }}</span>
              </div>
              
              <div class="flex items-center justify-between pt-2">
                <Button size="sm" variant="outline" @click="viewLocationDetails(location)">
                  <Eye class="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button size="sm" variant="default" @click="optimizeLocation(location)">
                  <Settings class="h-4 w-4 mr-2" />
                  Optimize
                </Button>
              </div>
            </div>
          </div>
          
          <div v-if="bottleneckLocations.length > 6" class="text-center pt-2">
            <Button variant="outline">
              View All {{ bottleneckLocations.length }} Bottlenecks
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Available Space -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Available Space</CardTitle>
            <CardDescription>
              Low-utilization locations with capacity for additional inventory (under {{ filters.underutilizedThreshold }}% utilized)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="exportAvailableSpace">
            <BoxSelect class="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
            <span class="text-sm text-muted-foreground ml-2">Loading data...</span>
          </div>
          
          <div v-else-if="underutilizedLocations.length === 0" class="text-center py-8">
            <BoxSelect class="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p class="mt-2 text-muted-foreground">No underutilized locations found</p>
            <p class="text-xs text-muted-foreground mt-1">All locations are above the {{ filters.underutilizedThreshold }}% threshold</p>
          </div>
          
          <div v-else>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Items</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Available Space</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="location in underutilizedLocations.slice(0, 5)" :key="location.id">
                  <TableCell>
                    <div class="font-medium">{{ location.name }}</div>
                    <div class="text-xs text-muted-foreground">{{ location.code || 'No code' }}</div>
                  </TableCell>
                  <TableCell>{{ formatLocationType(location.type) }}</TableCell>
                  <TableCell>{{ location.itemCount || 0 }}</TableCell>
                  <TableCell>{{ location.capacity || 'N/A' }}</TableCell>
                  <TableCell>
                    {{ location.capacity ? (location.capacity - (location.itemCount || 0)) : 'N/A' }}
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-2">
                      <div class="w-24 bg-muted rounded-full h-2">
                        <div 
                          class="h-2 rounded-full bg-green-500" 
                          :style="{ width: `${Math.min(100, calculateUtilization(location))}%` }"
                        ></div>
                      </div>
                      <span class="text-sm">{{ calculateUtilization(location) }}%</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button size="sm" variant="outline" @click="suggestItems(location)">
                      Suggest Items
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div v-if="underutilizedLocations.length > 5" class="text-center pt-4">
              <Button variant="outline">
                View All {{ underutilizedLocations.length }} Available Locations
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
  RefreshCw, Download, Filter, ChevronDown, BarChart2, LayoutGrid, List,
  Gauge, Warehouse, AlertOctagon, BoxSelect, ArrowUpDown, Check, MoreHorizontal,
  Eye, ArrowDownToLine, Package, AlertTriangle, Settings, Loader2
} from 'lucide-vue-next'

// Import store
import { useLocationsStore } from '@/store/modules/inventory/locations'

// Toast notifications
const { toast } = useToast()

// Initialize store
const locationsStore = useLocationsStore()

// State
const isLoading = ref(false)
const locations = ref([])
const utilizationData = ref({
  warehouses: 0,
  zones: 0,
  zonesInUse: 0,
  aisles: 0,
  bins: 0,
  binsInUse: 0,
  totalCapacity: 0,
  itemsStored: 0,
  sites: 0
})

// UI state
const warehouseFilter = ref('all')
const viewMode = ref('chart') // 'chart', 'treemap', 'table'
const visualizationLevel = ref('zone')
const searchQuery = ref('')
const sortBy = ref('utilization')
const sortOrder = ref('desc')
const filters = ref({
  showWarehouses: true,
  showZones: true,
  showAisles: true,
  showBins: true,
  bottleneckThreshold: 80,
  underutilizedThreshold: 30
})

// Computed values
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

const totalLocations = computed(() => {
  return locations.value.length
})

const warehouses = computed(() => {
  return locations.value.filter(loc => loc.type === 'warehouse' && loc.status === 'active')
})

// Filter locations based on current filters
const filteredLocations = computed(() => {
  let filtered = locations.value

  // Filter by warehouse
  if (warehouseFilter.value !== 'all') {
    // If warehouse selected, include the warehouse and its children
    const warehouseId = warehouseFilter.value
    filtered = filtered.filter(loc => 
      loc.id === warehouseId || 
      findParentWarehouse(loc) === warehouseId
    )
  }

  // Filter by location type
  filtered = filtered.filter(loc => {
    if (loc.type === 'warehouse' && !filters.value.showWarehouses) return false
    if (loc.type === 'zone' && !filters.value.showZones) return false
    if (loc.type === 'aisle' && !filters.value.showAisles) return false
    if (loc.type === 'bin' && !filters.value.showBins) return false
    return true
  })

  // For visualization level
  if (visualizationLevel.value) {
    filtered = filtered.filter(loc => loc.type === visualizationLevel.value)
  }

  return filtered
})

// Sorted and filtered locations for table view
const sortedAndFilteredLocations = computed(() => {
  let filtered = filteredLocations.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      (loc.code && loc.code.toLowerCase().includes(query))
    )
  }

  // Apply sorting
  return [...filtered].sort((a, b) => {
    if (sortBy.value === 'name') {
      return sortOrder.value === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name)
    } 
    else if (sortBy.value === 'utilization') {
      const utilizationA = calculateUtilization(a)
      const utilizationB = calculateUtilization(b)
      return sortOrder.value === 'asc' 
        ? utilizationA - utilizationB 
        : utilizationB - utilizationA
    }
    else if (sortBy.value === 'capacity') {
      const capacityA = a.capacity || 0
      const capacityB = b.capacity || 0
      return sortOrder.value === 'asc' 
        ? capacityA - capacityB 
        : capacityB - capacityA
    }
    return 0
  })
})

// Overall utilization percentage
const overallUtilizationPercentage = computed(() => {
  if (!utilizationData.value.totalCapacity) return 0
  return Math.round((utilizationData.value.itemsStored / utilizationData.value.totalCapacity) * 100)
})

// Find bottleneck locations (high utilization)
const bottleneckLocations = computed(() => {
  return locations.value
    .filter(loc => 
      loc.capacity && loc.itemCount && 
      calculateUtilization(loc) >= filters.value.bottleneckThreshold &&
      loc.status === 'active'
    )
    .sort((a, b) => calculateUtilization(b) - calculateUtilization(a))
})

// Find underutilized locations (low utilization)
const underutilizedLocations = computed(() => {
  return locations.value
    .filter(loc => 
      loc.capacity && 
      calculateUtilization(loc) <= filters.value.underutilizedThreshold &&
      loc.status === 'active'
    )
    .sort((a, b) => calculateUtilization(a) - calculateUtilization(b))
})

// Most utilized zone
const mostUtilizedZone = computed(() => {
  const zones = locations.value.filter(loc => loc.type === 'zone' && loc.status === 'active')
  if (!zones.length) return null
  
  return zones.reduce((most, current) => {
    const mostUtil = calculateUtilization(most)
    const currentUtil = calculateUtilization(current)
    return currentUtil > mostUtil ? current : most
  }, zones[0])
})

// Least utilized zone
const leastUtilizedZone = computed(() => {
  const zones = locations.value.filter(loc => 
    loc.type === 'zone' && 
    loc.status === 'active' && 
    loc.capacity && 
    loc.capacity > 0
  )
  if (!zones.length) return null
  
  return zones.reduce((least, current) => {
    const leastUtil = calculateUtilization(least)
    const currentUtil = calculateUtilization(current)
    return currentUtil < leastUtil ? current : least
  }, zones[0])
})

// Methods
const refreshData = async () => {
  isLoading.value = true
  
  try {
    // Fetch locations from store
    const response = await locationsStore.fetchLocations()
    
    // Update local state
    locations.value = locationsStore.getLocations
    utilizationData.value = locationsStore.getLocationStats
    
    toast({
      title: "Data refreshed",
      description: "Warehouse utilization data has been updated.",
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

const calculateUtilization = (location) => {
  if (!location.capacity || location.capacity === 0) return 0
  const itemCount = location.itemCount || 0
  return Math.round((itemCount / location.capacity) * 100)
}

const formatLocationType = (type) => {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatNumber = (num) => {
  if (num === undefined || num === null) return '—'
  return num.toLocaleString()
}

const getUtilizationColorClass = (percentage) => {
  if (percentage >= 80) return 'bg-red-500'
  if (percentage >= 50) return 'bg-amber-500'
  return 'bg-green-500'
}

const getUtilizationBgClass = (percentage) => {
  if (percentage >= 80) return 'bg-red-400'
  if (percentage >= 50) return 'bg-amber-400'
  return 'bg-green-400'
}

const getUtilizationBorderClass = (percentage) => {
  if (percentage >= 80) return 'border-red-500'
  if (percentage >= 50) return 'border-amber-500'
  return 'border-green-500'
}

const isBottleneck = (location) => {
  return calculateUtilization(location) >= filters.value.bottleneckThreshold
}

const getParentName = (parentId) => {
  const parent = locations.value.find(loc => loc.id === parentId)
  return parent ? parent.name : 'Unknown'
}

const findParentWarehouse = (location) => {
  // Traverse up the location hierarchy to find the warehouse
  let current = location
  let iterations = 0 // Safety check
  
  while (current && current.parentId && iterations < 10) {
    const parent = locations.value.find(loc => loc.id === current.parentId)
    if (!parent) break
    
    if (parent.type === 'warehouse') {
      return parent.id
    }
    
    current = parent
    iterations++
  }
  
  return null
}

// Action handlers
const viewLocationDetails = (location) => {
  toast({
    title: "Location Details",
    description: `Viewing details for ${location.name}`,
  })
}

const viewItems = (location) => {
  toast({
    title: "View Items",
    description: `Viewing items in ${location.name}`,
  })
}

const optimizeLocation = (location) => {
  toast({
    title: "Optimize Location",
    description: `Optimizing space in ${location.name}`,
  })
}

const suggestItems = (location) => {
  toast({
    title: "Item Suggestions",
    description: `Finding items to move to ${location.name}`,
  })
}

const exportBottlenecks = () => {
  toast({
    title: "Export Bottlenecks",
    description: `Exporting bottleneck report with ${bottleneckLocations.value.length} locations`,
  })
}

const exportAvailableSpace = () => {
  toast({
    title: "Export Available Space",
    description: `Exporting available space report with ${underutilizedLocations.value.length} locations`,
  })
}

// Initialize
onMounted(() => {
  refreshData()
})
</script>