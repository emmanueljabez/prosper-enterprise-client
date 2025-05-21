<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and actions -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Reports Center</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • {{ savedReports.length }} saved reports
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="refreshData" :disabled="isLoading">
            <RefreshCw v-if="!isLoading" class="h-4 w-4 mr-2" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button @click="createNewReport">
            <PlusCircle class="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>
    </header>

    <!-- Reports Dashboard Tabs -->
    <Tabs defaultValue="saved" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        <TabsTrigger value="recent">Recent Executions</TabsTrigger>
        <TabsTrigger value="templates">Report Templates</TabsTrigger>
      </TabsList>
      
      <!-- Saved Reports Tab -->
      <TabsContent value="saved" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Input 
              placeholder="Search reports..." 
              class="w-80"
              v-model="searchQuery"
            />
            <Select v-model="categoryFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings class="h-4 w-4 mr-2" />
                View Options
                <ChevronDown class="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem v-model="showDescriptions">
                Show Descriptions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model="showDates">
                Show Dates
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="report in filteredSavedReports" :key="report.id" class="overflow-hidden">
            <CardHeader class="pb-2">
              <div class="flex justify-between items-start">
                <div>
                  <CardTitle>{{ report.name }}</CardTitle>
                  <CardDescription v-if="showDescriptions">
                    {{ report.description }}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="runReport(report)">
                      <Play class="mr-2 h-4 w-4" />
                      Run Now
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="editReport(report)">
                      <Edit class="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="duplicateReport(report)">
                      <Copy class="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="deleteReport(report)" class="text-destructive focus:text-destructive">
                      <Trash class="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent class="pb-2">
              <div class="flex items-center mb-3 gap-2 flex-wrap">
                <Badge>{{ getTemplateName(report.templateId) }}</Badge>
                <Badge variant="outline">{{ report.exportFormat.toUpperCase() }}</Badge>
                <Badge v-if="report.schedule.frequency" variant="secondary">
                  {{ formatSchedule(report.schedule) }}
                </Badge>
              </div>
              <div v-if="showDates" class="text-xs text-muted-foreground">
                <p>Created: {{ formatDate(report.createdOn) }}</p>
                <p>Last modified: {{ formatDate(report.lastModified) }}</p>
              </div>
            </CardContent>
            <CardFooter class="flex justify-between pt-0">
              <Button variant="outline" size="sm" @click="shareReport(report)" 
                     class="h-8" :disabled="!report.isShared">
                <Share class="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="default" size="sm" @click="showReportPreview(report)" class="h-8">
                <Eye class="h-4 w-4 mr-2" />
                Preview
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div v-if="filteredSavedReports.length === 0" class="p-12 text-center border rounded-md">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileSearch class="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">No Reports Found</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            We couldn't find any reports matching your search.
          </p>
          <Button variant="outline" class="mt-4" @click="resetFilters">
            Reset Filters
          </Button>
        </div>
      </TabsContent>
      
      <!-- Scheduled Reports Tab -->
      <TabsContent value="scheduled" class="space-y-4">
        <div class="flex justify-end mb-4">
          <Button variant="outline" size="sm">
            <CalendarClock class="h-4 w-4 mr-2" />
            View Schedule Calendar
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Format</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="report in scheduledReports" :key="report.id">
              <TableCell>
                <div class="font-medium">{{ report.name }}</div>
                <div class="text-xs text-muted-foreground">{{ getTemplateName(report.templateId) }}</div>
              </TableCell>
              <TableCell>{{ formatFrequency(report.schedule) }}</TableCell>
              <TableCell>
                <div class="font-medium">{{ formatNextRun(report.schedule.nextRun) }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ getRelativeTime(report.schedule.nextRun) }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center">
                  <Badge variant="outline" class="rounded-sm">{{ report.recipients.length }}</Badge>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Users class="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent class="w-80">
                      <div class="space-y-1">
                        <h4 class="text-sm font-semibold">Recipients</h4>
                        <div class="text-sm" v-for="recipient in report.recipients" :key="recipient">
                          {{ recipient }}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </TableCell>
              <TableCell>
                <Badge>{{ report.exportFormat.toUpperCase() }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" @click="editSchedule(report)">
                    <Calendar class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="runReport(report)">
                    <Play class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="toggleSchedule(report)">
                    <component :is="report.paused ? Play : Pause" class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div v-if="scheduledReports.length === 0" class="p-12 text-center border rounded-md">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <CalendarOff class="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">No Scheduled Reports</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            You don't have any scheduled reports. Create a report and set up a schedule.
          </p>
          <Button class="mt-4" @click="createNewReport">
            Create New Report
          </Button>
        </div>
      </TabsContent>
      
      <!-- Recent Executions Tab -->
      <TabsContent value="recent" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Select v-model="executionStatusFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="executionDateRangeFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="Last 7 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div class="border rounded-md overflow-hidden">
          <Table>
            <TableHeader class="bg-muted">
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Executed On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>File</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="execution in filteredExecutions" :key="execution.id">
                <TableCell>
                  <div class="font-medium">{{ getReportName(execution.reportId) }}</div>
                  <div class="text-xs text-muted-foreground">{{ execution.executedBy }}</div>
                </TableCell>
                <TableCell>{{ formatDateTime(execution.executedOn) }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(execution.status)">
                    {{ execution.status }}
                  </Badge>
                </TableCell>
                <TableCell>{{ execution.rowCount || '—' }}</TableCell>
                <TableCell>{{ execution.executionTime ? `${execution.executionTime.toFixed(1)}s` : '—' }}</TableCell>
                <TableCell>
                  <div v-if="execution.fileName" class="flex items-center">
                    <component :is="getFormatIcon(execution.fileName)" class="h-4 w-4 mr-2" />
                    <span class="text-xs">{{ formatFileSize(execution.fileSize) }}</span>
                  </div>
                  <span v-else>—</span>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" @click="downloadExecution(execution)" 
                            :disabled="execution.status !== 'completed'">
                      <Download class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="viewExecutionDetails(execution)">
                      <Info class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div v-if="filteredExecutions.length === 0" class="p-12 text-center border rounded-md">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <History class="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">No Execution History</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            No report executions match your current filter criteria.
          </p>
          <Button variant="outline" class="mt-4" @click="resetExecutionFilters">
            Reset Filters
          </Button>
        </div>
      </TabsContent>
      
      <!-- Report Templates Tab -->
      <TabsContent value="templates" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Input 
              placeholder="Search templates..." 
              class="w-80"
              v-model="templateSearchQuery"
            />
            <Select v-model="templateCategoryFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="template in filteredTemplates" :key="template.id" class="overflow-hidden">
            <CardHeader class="pb-2">
              <div class="flex justify-between items-start">
                <div>
                  <CardTitle>{{ template.name }}</CardTitle>
                  <CardDescription>
                    {{ template.description }}
                  </CardDescription>
                </div>
                <Badge>{{ template.category }}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="text-sm font-medium">Default Columns</div>
                  <div class="flex flex-wrap gap-1">
                    <Badge variant="outline" v-for="column in template.defaultColumns.slice(0, 3)" :key="column">
                      {{ getColumnDisplayName(column) }}
                    </Badge>
                    <Badge variant="outline" v-if="template.defaultColumns.length > 3">
                      +{{ template.defaultColumns.length - 3 }} more
                    </Badge>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-sm font-medium">Available Filters</div>
                  <div class="flex flex-wrap gap-1">
                    <Badge variant="outline" v-for="filter in template.availableFilters.slice(0, 3)" :key="filter">
                      {{ getFilterDisplayName(filter) }}
                    </Badge>
                    <Badge variant="outline" v-if="template.availableFilters.length > 3">
                      +{{ template.availableFilters.length - 3 }} more
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button class="w-full" @click="createReportFromTemplate(template)">
                <FileText class="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Report Editor Dialog -->
    <Dialog 
      :open="showReportDialog" 
      @update:open="(val) => handleDialogUpdate(val, 'showReportDialog')"
    >
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>{{ isEditMode ? 'Edit Report' : 'Create New Report' }}</DialogTitle>
          <DialogDescription>
            {{ isEditMode ? 'Modify the report details and data selection' : 'Define a new report based on a template' }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="editingReport" class="space-y-6 py-4 overflow-y-auto flex-grow pr-2">
          <!-- Basic Information -->
          <div class="space-y-4">
            <div class="font-medium text-sm">Basic Information</div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="report-name" class="text-right">Name</Label>
              <Input id="report-name" v-model="editingReport.name" class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="report-description" class="text-right">Description</Label>
              <Textarea id="report-description" v-model="editingReport.description" class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4" v-if="!isEditMode">
              <Label for="report-template" class="text-right">Template</Label>
              <Select v-model="editingReport.templateId" class="col-span-3">
                <SelectTrigger id="report-template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="template in reportTemplates" 
                    :key="template.id" 
                    :value="template.id"
                  >
                    {{ template.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <!-- Columns Selection -->
          <div class="space-y-4">
            <div class="font-medium text-sm">Data Columns</div>
            <div class="bg-muted rounded-md p-4 space-y-2">
              <div class="text-xs text-muted-foreground mb-3">
                Drag and drop to reorder columns
              </div>
              <div class="flex flex-wrap gap-2">
                <Badge 
                  v-for="column in selectedColumns" 
                  :key="column" 
                  class="cursor-move"
                  variant="secondary"
                >
                  {{ getColumnDisplayName(column) }}
                  <Button variant="ghost" size="icon" class="h-4 w-4 ml-1 -mr-1"
                          @click="removeColumn(column)">
                    <X class="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
              <div class="mt-4">
                <Select v-model="selectedColumn" @update:modelValue="addColumn">
                  <SelectTrigger>
                    <SelectValue placeholder="Add column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup v-for="(group, groupName) in groupedAvailableColumns" :key="groupName">
                      <SelectLabel>{{ groupName }}</SelectLabel>
                      <SelectItem 
                        v-for="column in group" 
                        :key="column.id" 
                        :value="column.id"
                        :disabled="editingReport.columns.includes(column.id)"
                      >
                        {{ column.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <!-- Filters -->
          <div class="space-y-4">
            <div class="font-medium text-sm">Filters</div>
            <div class="space-y-3">
              <div v-for="(filter, index) in activeFilters" :key="index" class="flex items-start gap-2">
                <div class="grid grid-cols-3 gap-3 flex-1">
                  <Select 
                    v-model="filter.id"
                    @update:modelValue="updateFilterType(index)"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="availableFilter in availableFilters" 
                        :key="availableFilter.id" 
                        :value="availableFilter.id"
                      >
                        {{ availableFilter.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <!-- Date Range Filter -->
                  <Select 
                    v-if="filter.type === 'daterange'"
                    v-model="filter.value.preset" 
                    class="col-span-2"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="option in getFilterOptions(filter.id)" 
                        :key="option.id" 
                        :value="option.id || `option-${index}`"
                      >
                        {{ option.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <!-- Multi-select Filter -->
                  <Select 
                    v-if="filter.type === 'multiselect'"
                    v-model="filter.value" 
                    class="col-span-2"
                    multiple
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select options" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="option in getFilterOptions(filter.id)" 
                        :key="option.id" 
                        :value="option.id"
                      >
                        {{ option.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <!-- Range Filter -->
                  <div v-if="filter.type === 'range'" class="flex items-center gap-2 col-span-2">
                    <Input 
                      type="number" 
                      v-model="filter.value.min" 
                      placeholder="Min" 
                      class="w-full"
                    />
                    <span class="text-center">to</span>
                    <Input 
                      type="number" 
                      v-model="filter.value.max" 
                      placeholder="Max" 
                      class="w-full"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" class="mt-1" @click="removeFilter(index)">
                  <X class="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm" @click="addNewFilter">
                <Plus class="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </div>
          </div>
          
          <!-- Scheduling & Delivery -->
          <div class="space-y-4">
            <div class="font-medium text-sm">Scheduling & Delivery</div>
            
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="report-schedule" class="text-right">Schedule</Label>
              <Select 
                v-model="editingReport.schedule.frequency" 
                class="col-span-3"
              >
                <SelectTrigger id="report-schedule">
                  <SelectValue placeholder="No schedule (manual run)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No schedule (manual run)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div v-if="editingReport.schedule.frequency === 'weekly'" class="grid grid-cols-4 items-center gap-4">
              <Label for="schedule-day" class="text-right">Day of Week</Label>
              <Select v-model="editingReport.schedule.day" class="col-span-3">
                <SelectTrigger id="schedule-day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="1">Monday</SelectItem>
                  <SelectItem :value="2">Tuesday</SelectItem>
                  <SelectItem :value="3">Wednesday</SelectItem>
                  <SelectItem :value="4">Thursday</SelectItem>
                  <SelectItem :value="5">Friday</SelectItem>
                  <SelectItem :value="6">Saturday</SelectItem>
                  <SelectItem :value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div v-if="editingReport.schedule.frequency === 'monthly'" class="grid grid-cols-4 items-center gap-4">
              <Label for="schedule-day" class="text-right">Day of Month</Label>
              <Select v-model="editingReport.schedule.day" class="col-span-3">
                <SelectTrigger id="schedule-day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="day in 31" :key="day" :value="day || `day-${day}`">{{ day }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div v-if="editingReport.schedule.frequency" class="grid grid-cols-4 items-center gap-4">
              <Label for="schedule-time" class="text-right">Time</Label>
              <Input 
                id="schedule-time" 
                type="time" 
                v-model="editingReport.schedule.time" 
                class="col-span-3"
              />
            </div>
            
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="report-format" class="text-right">Format</Label>
              <Select v-model="editingReport.exportFormat" class="col-span-3">
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="format in exportFormats" 
                    :key="format.id" 
                    :value="format.id"
                  >
                    <div class="flex items-center">
                      <component :is="getIconComponent(format.icon)" class="h-4 w-4 mr-2" />
                      {{ format.name }}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="report-recipients" class="text-right">Recipients</Label>
              <Input 
                id="report-recipients" 
                v-model="recipientsString" 
                placeholder="Enter email addresses separated by commas"
                class="col-span-3" 
              />
            </div>
            
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="report-sharing" class="text-right">Sharing</Label>
              <div class="flex items-center space-x-2 col-span-3">
                <Switch id="report-sharing" v-model="editingReport.isShared" />
                <Label for="report-sharing">Allow sharing this report with others</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter class="flex-shrink-0 mt-4">
          <Button variant="outline" @click="showReportDialog = false">Cancel</Button>
          <Button @click="saveReport" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditMode ? 'Save Changes' : 'Create Report' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <!-- Report Preview Dialog -->
    <Dialog v-model:open="showPreviewDialog">
      <DialogContent class="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Report Preview: {{ previewReport?.name }}</DialogTitle>
          <DialogDescription>
            Preview of report data based on current filters and settings
          </DialogDescription>
        </DialogHeader>
        
        <div class="overflow-y-auto flex-grow py-4">
          <div v-if="isLoadingPreview" class="flex items-center justify-center h-60">
            <div class="flex flex-col items-center">
              <Loader2 class="h-8 w-8 animate-spin text-primary" />
              <p class="mt-2 text-sm text-muted-foreground">Generating report preview...</p>
            </div>
          </div>
          <div v-else-if="previewData" class="overflow-auto">
            <Table>
              <TableHeader class="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead v-for="column in previewColumns" :key="column.id">
                    {{ column.name }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(row, i) in previewData" :key="i">
                  <TableCell v-for="column in previewColumns" :key="column.id">
                    {{ formatPreviewCell(row[column.id], column.type) }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div v-else class="text-center p-8">
            <FileWarning class="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 class="mt-3 text-lg font-medium">No preview available</h3>
            <p class="text-sm text-muted-foreground mt-1">
              No data is available for preview with the current report settings.
            </p>
          </div>
        </div>
        
        <DialogFooter class="flex-shrink-0">
          <div class="flex items-center gap-2 w-full">
            <div class="text-sm text-muted-foreground mr-auto" v-if="previewData">
              Showing {{ previewData.length }} of {{ totalRows }} rows
            </div>
            <Button variant="outline" @click="showPreviewDialog = false">Close</Button>
            <Button variant="default" @click="runFullReport" :disabled="!previewData">
              <FileSpreadsheet class="h-4 w-4 mr-2" />
              Run Full Report
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <!-- Execution Details Dialog -->
    <Dialog v-model:open="showExecutionDialog">
      <DialogContent class="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Execution Details</DialogTitle>
          <DialogDescription>
            Detailed information about this report execution
          </DialogDescription>
        </DialogHeader>
        
        <div class="overflow-y-auto flex-grow py-4" v-if="selectedExecution">
          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-2">
              <div class="space-y-1">
                <div class="text-sm font-medium">Status</div>
                <Badge :variant="getStatusVariant(selectedExecution.status)">
                  {{ selectedExecution.status }}
                </Badge>
              </div>
              
              <div class="space-y-1">
                <div class="text-sm font-medium">Executed By</div>
                <div>{{ selectedExecution.executedBy }}</div>
              </div>
              
              <div class="space-y-1">
                <div class="text-sm font-medium">Date & Time</div>
                <div>{{ formatDateTime(selectedExecution.executedOn) }}</div>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2">
              <div class="space-y-1">
                <div class="text-sm font-medium">Rows Processed</div>
                <div>{{ selectedExecution.rowCount || '—' }}</div>
              </div>
              
              <div class="space-y-1">
                <div class="text-sm font-medium">Execution Time</div>
                <div>{{ selectedExecution.executionTime ? `${selectedExecution.executionTime.toFixed(1)} seconds` : '—' }}</div>
              </div>
              
              <div class="space-y-1">
                <div class="text-sm font-medium">File Size</div>
                <div>{{ selectedExecution.fileSize ? formatFileSize(selectedExecution.fileSize) : '—' }}</div>
              </div>
            </div>
            
            <div v-if="selectedExecution.sentTo && selectedExecution.sentTo.length" class="space-y-1">
              <div class="text-sm font-medium">Sent To</div>
              <div class="flex flex-wrap gap-2">
                <Badge variant="outline" v-for="recipient in selectedExecution.sentTo" :key="recipient">
                  {{ recipient }}
                </Badge>
              </div>
            </div>
            
            <div v-if="selectedExecution.errorMessage" class="space-y-1">
              <div class="text-sm font-medium">Error Message</div>
              <div class="text-destructive p-2 bg-destructive/10 rounded-md text-sm font-mono">
                {{ selectedExecution.errorMessage }}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter class="flex-shrink-0">
          <Button variant="outline" @click="showExecutionDialog = false">Close</Button>
          <Button 
            @click="downloadExecution(selectedExecution)"
            :disabled="!selectedExecution || selectedExecution.status !== 'completed'"
          >
            <Download class="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the report "{{ reportToDelete?.name }}". 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteConfirmation = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <!-- Share Report Dialog -->
    <Dialog v-model:open="showShareDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Share this report with other users or generate a public link
          </DialogDescription>
        </DialogHeader>
        
        <div class="py-4">
          <div class="space-y-4">
            <div>
              <Label>Report Link</Label>
              <div class="flex mt-1">
                <Input value="https://pcash-inventory.example.com/reports/share/abc123" readonly class="rounded-r-none" />
                <Button variant="outline" class="rounded-l-none" @click="copyShareLink">
                  <Copy class="h-4 w-4" />
                </Button>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                This link allows anyone to view this report (no authentication required)
              </p>
            </div>
            
            <div>
              <Label>Email to</Label>
              <div class="flex mt-1">
                <Input v-model="shareEmail" placeholder="Enter email address" class="rounded-r-none" />
                <Button class="rounded-l-none whitespace-nowrap" @click="sendShareEmail">
                  Send
                </Button>
              </div>
            </div>
            
            <div class="pt-2">
              <div class="flex items-center space-x-2">
                <Switch id="include-data" v-model="includeData" />
                <Label for="include-data">Include current data with share</Label>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                When enabled, shared report will include the most recent data snapshot
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showShareDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { format, formatDistanceToNow, parse, parseISO, isAfter, isBefore, subDays } from 'date-fns'

// Import mock data
import { 
  reportTemplates, 
  columnDefinitions, 
  filterDefinitions, 
  savedReports as mockSavedReports,
  reportExecutions as mockReportExecutions,
  sampleReportData,
  exportFormats
} from '@/mock/mockReportsData'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import {
  Select, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectLabel
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  HoverCard, HoverCardContent, HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuCheckboxItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

// Icons
import {
  RefreshCw, PlusCircle, Settings, ChevronDown, MoreVertical, Play, Edit, Copy, Trash,
  Eye, Share, Users, Calendar, Pause, Download, Info, FileSearch, CalendarClock, 
  CalendarOff, History, FileText, X, Plus, FileWarning, FileSpreadsheet, Loader2,
  Table as TableIcon, Database, FileText as FileTextIcon
} from 'lucide-vue-next'

// Get toast
const { toast } = useToast()

// State
const isLoading = ref(false)
const isLoadingPreview = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('all')
const showDescriptions = ref(true)
const showDates = ref(true)
const templateSearchQuery = ref('')
const templateCategoryFilter = ref('all')
const executionStatusFilter = ref('all')
const executionDateRangeFilter = ref('7days')
const showReportDialog = ref(false)
const showPreviewDialog = ref(false)
const showExecutionDialog = ref(false)
const showDeleteConfirmation = ref(false)
const showShareDialog = ref(false)
const activeDialog = ref(null) // Track which dialog is currently active
const editingReport = ref(null)
const previewReport = ref(null)
const previewData = ref(null)
const totalRows = ref(0)
const selectedExecution = ref(null)
const reportToDelete = ref(null)
const shareEmail = ref('')
const includeData = ref(true)
const selectedColumn = ref(null)
const savedReports = ref(JSON.parse(JSON.stringify(mockSavedReports)))
const reportExecutions = ref(JSON.parse(JSON.stringify(mockReportExecutions)))
const dialogRefs = {
  showReportDialog,
  showPreviewDialog,
  showExecutionDialog,
  showDeleteConfirmation,
  showShareDialog
};

// Function to ensure only one dialog is open at a time
const openDialog = (dialogRef) => {
  // Close all dialogs first
  closeAllDialogs()
  
  // Set active dialog and open it
  activeDialog.value = dialogRef
  dialogRef.value = true
}

// Function to close all dialogs
const closeAllDialogs = () => {
  showReportDialog.value = false
  showPreviewDialog.value = false
  showExecutionDialog.value = false
  showDeleteConfirmation.value = false
  showShareDialog.value = false
  activeDialog.value = null
}

// Computed properties
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

const isEditMode = computed(() => {
  return editingReport.value && savedReports.value.some(r => r.id === editingReport.value.id)
})

const filteredSavedReports = computed(() => {
  let filtered = [...savedReports.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(report => 
      report.name.toLowerCase().includes(query) || 
      report.description.toLowerCase().includes(query)
    )
  }
  
  // Apply category filter based on template
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(report => {
      const template = reportTemplates.find(t => t.id === report.templateId)
      return template && template.category === categoryFilter.value
    })
  }
  
  return filtered
})

const scheduledReports = computed(() => {
  return savedReports.value.filter(report => 
    report.schedule && 
    report.schedule.frequency
  )
})

const filteredExecutions = computed(() => {
  let filtered = [...reportExecutions.value]
  
  // Apply status filter
  if (executionStatusFilter.value !== 'all') {
    filtered = filtered.filter(exec => exec.status === executionStatusFilter.value)
  }
  
  // Apply date range filter
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const days7Ago = subDays(today, 7)
  const days30Ago = subDays(today, 30)
  const days90Ago = subDays(today, 90)
  
  switch (executionDateRangeFilter.value) {
    case 'today':
      filtered = filtered.filter(exec => {
        const execDate = parseISO(exec.executedOn)
        return execDate >= today
      })
      break
    case 'yesterday':
      filtered = filtered.filter(exec => {
        const execDate = parseISO(exec.executedOn)
        return execDate >= yesterday && execDate < today
      })
      break
    case '7days':
      filtered = filtered.filter(exec => {
        const execDate = parseISO(exec.executedOn)
        return execDate >= days7Ago
      })
      break
    case '30days':
      filtered = filtered.filter(exec => {
        const execDate = parseISO(exec.executedOn)
        return execDate >= days30Ago
      })
      break
    case '90days':
      filtered = filtered.filter(exec => {
        const execDate = parseISO(exec.executedOn)
        return execDate >= days90Ago
      })
      break
  }
  
  // Sort by execution date (most recent first)
  return filtered.sort((a, b) => 
    parseISO(b.executedOn).getTime() - parseISO(a.executedOn).getTime()
  )
})

const filteredTemplates = computed(() => {
  let filtered = [...reportTemplates]
  
  // Apply search filter
  if (templateSearchQuery.value) {
    const query = templateSearchQuery.value.toLowerCase()
    filtered = filtered.filter(template => 
      template.name.toLowerCase().includes(query) || 
      template.description.toLowerCase().includes(query)
    )
  }
  
  // Apply category filter
  if (templateCategoryFilter.value !== 'all') {
    filtered = filtered.filter(template => template.category === templateCategoryFilter.value)
  }
  
  return filtered
})

const availableFilters = computed(() => {
  if (!editingReport.value || !editingReport.value.templateId) return []
  
  const template = reportTemplates.find(t => t.id === editingReport.value.templateId)
  if (!template) return []
  
  return template.availableFilters.map(filterId => {
    return filterDefinitions[filterId]
  }).filter(Boolean)
})

const selectedColumns = computed(() => {
  return editingReport.value?.columns || []
})

const handleDialogUpdate = (isOpen, dialogName) => {
  console.log(`Dialog ${dialogName} update:open event:`, isOpen);
  
  if (!isOpen) {
    // Dialog is being closed by the Dialog component itself
    closeAllDialogs();
  } else {
    // Dialog is being opened by the Dialog component
    // First close all dialogs to avoid double dialogs
    Object.keys(dialogRefs).forEach(key => {
      if (key !== dialogName) {
        dialogRefs[key].value = false;
      }
    });
    
    // Now open the requested dialog
    if (dialogName === 'showReportDialog') showReportDialog.value = true;
    if (dialogName === 'showPreviewDialog') showPreviewDialog.value = true;
    // etc...
  }
};

const activeFilters = computed(() => {
  if (!editingReport.value) return []
  
  // Convert the filters object to an array for easier UI rendering
  const filters = []
  
  if (editingReport.value.filters) {
    Object.entries(editingReport.value.filters).forEach(([key, value]) => {
      // Skip empty or default values
      if (!value || (Array.isArray(value) && value.length === 0)) return
      
      // Get filter definition
      const filterDef = filterDefinitions[key]
      if (!filterDef) return
      
      // Add to filters array with correct type
      filters.push({
        id: key,
        name: filterDef.name,
        type: filterDef.type,
        value: value
      })
    })
  }
  
  return filters
})

const groupedAvailableColumns = computed(() => {
  // Group columns by type for better organization in dropdown
  const groups = {
    'Product Information': [],
    'Quantity & Stock': [],
    'Value & Cost': [],
    'Location': [],
    'Transaction': [],
    'Time & Aging': [],
    'Sales & Performance': [],
    'Supplier': [],
    'Status': []
  }
  
  // Get available columns for the template
  const template = reportTemplates.find(t => t.id === editingReport.value?.templateId)
  
  if (!template) return groups
  
  // Categories mapping
  const columnCategories = {
    sku: 'Product Information',
    name: 'Product Information',
    description: 'Product Information',
    category: 'Product Information',
    brand: 'Product Information',
    
    quantity: 'Quantity & Stock',
    minStockLevel: 'Quantity & Stock',
    maxStockLevel: 'Quantity & Stock',
    reorderPoint: 'Quantity & Stock',
    
    unitCost: 'Value & Cost',
    totalValue: 'Value & Cost',
    salesPrice: 'Value & Cost',
    
    location: 'Location',
    bin: 'Location',
    
    date: 'Transaction',
    transactionType: 'Transaction',
    reference: 'Transaction',
    
    receiptDate: 'Time & Aging',
    lastSold: 'Time & Aging',
    daysInStock: 'Time & Aging',
    daysNoMovement: 'Time & Aging',
    
    quantitySold: 'Sales & Performance',
    salesRevenue: 'Sales & Performance',
    turnoverRate: 'Sales & Performance',
    stockValue: 'Sales & Performance',
    
    supplier: 'Supplier',
    orderCount: 'Supplier',
    itemsOrdered: 'Supplier',
    itemsFulfilled: 'Supplier',
    fulfillmentRate: 'Supplier',
    avgLeadTime: 'Supplier',
    onTimeDelivery: 'Supplier',
    
    status: 'Status'
  }
  
  // Add columns to appropriate groups
  Object.entries(columnDefinitions).forEach(([id, column]) => {
    const category = columnCategories[id] || 'Other'
    if (groups[category]) {
      groups[category].push(column)
    } else {
      groups['Other'] = groups['Other'] || []
      groups['Other'].push(column)
    }
  })
  
  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })
  
  return groups
})

// For report preview
const previewColumns = computed(() => {
  if (!previewReport.value) return []
  
  return previewReport.value.columns.map(colId => columnDefinitions[colId]).filter(Boolean)
})

// For email recipients string (comma-separated)
const recipientsString = computed({
  get: () => {
    return editingReport.value?.recipients?.join(', ') || ''
  },
  set: (value) => {
    if (editingReport.value) {
      editingReport.value.recipients = value
        .split(',')
        .map(email => email.trim())
        .filter(Boolean)
    }
  }
})

// Helper functions
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    return dateString
  }
}

const formatDateTime = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy, h:mm a')
  } catch (e) {
    return dateString
  }
}

const formatNextRun = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy, h:mm a')
  } catch (e) {
    return 'Not scheduled'
  }
}

const getRelativeTime = (dateString) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch (e) {
    return ''
  }
}

const formatSchedule = (schedule) => {
  if (!schedule || !schedule.frequency) return 'Manual run only'
  
  let scheduleText = schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)
  
  if (schedule.frequency === 'weekly' && schedule.day !== undefined) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    scheduleText += ` (${dayNames[schedule.day]})`
  } else if (schedule.frequency === 'monthly' && schedule.day) {
    scheduleText += ` (Day ${schedule.day})`
  }
  
  return scheduleText
}

const formatFrequency = (schedule) => {
  if (!schedule || !schedule.frequency) return 'Manual run only'
  
  switch (schedule.frequency) {
    case 'daily':
      return `Daily at ${formatTime(schedule.time)}`
    case 'weekly':
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return `Weekly on ${dayNames[schedule.day || 0]} at ${formatTime(schedule.time)}`
    case 'monthly':
      return `Monthly on day ${schedule.day || 1} at ${formatTime(schedule.time)}`
    case 'quarterly':
      return `Quarterly on day ${schedule.day || 1} at ${formatTime(schedule.time)}`
    default:
      return 'Manual run only'
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '00:00'
  
  try {
    const time = parse(timeString, 'HH:mm', new Date())
    return format(time, 'h:mm a')
  } catch (e) {
    return timeString
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const getTemplateName = (templateId) => {
  const template = reportTemplates.find(t => t.id === templateId)
  return template ? template.name : 'Custom Report'
}

const getReportName = (reportId) => {
  const report = savedReports.value.find(r => r.id === reportId)
  return report ? report.name : 'Unknown Report'
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'completed': return 'success'
    case 'failed': return 'destructive'
    case 'in-progress': return 'secondary'
    default: return 'outline'
  }
}

const getFormatIcon = (fileName) => {
  if (!fileName) return FileTextIcon
  
  if (fileName.endsWith('.xlsx')) return TableIcon
  if (fileName.endsWith('.csv')) return Database
  if (fileName.endsWith('.pdf')) return FileTextIcon
  
  return FileTextIcon
}

const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'FileText': return FileTextIcon
    case 'Table': return TableIcon
    case 'Database': return Database
    default: return FileTextIcon
  }
}

const getColumnDisplayName = (columnId) => {
  return columnDefinitions[columnId]?.name || columnId
}

const getFilterDisplayName = (filterId) => {
  return filterDefinitions[filterId]?.name || filterId
}

const getFilterOptions = (filterId) => {
  const filterDef = filterDefinitions[filterId]
  return (filterDef?.options || []).filter(option => option.id !== '')
}

const formatPreviewCell = (value, type) => {
  if (value === undefined || value === null) return '—'
  
  switch (type) {
    case 'currency':
      return `$${Number(value).toFixed(2)}`
    case 'percentage':
      return `${Number(value).toFixed(1)}%`
    case 'date':
      return formatDate(value)
    default:
      return value
  }
}

// Clean up state when dialog closes
const resetDialogState = () => {
  // Clear any state that might cause issues when dialog reopens
  if (!showReportDialog.value) {
    editingReport.value = null
  }
  
  if (!showPreviewDialog.value) {
    previewReport.value = null
    previewData.value = null
  }
  
  if (!showExecutionDialog.value) {
    selectedExecution.value = null
  }
  
  if (!showDeleteConfirmation.value) {
    reportToDelete.value = null
  }
  
  if (!showShareDialog.value) {
    shareEmail.value = ''
  }
}

// Action functions
const refreshData = () => {
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    // Refresh report data from backend (using mock for demo)
    savedReports.value = JSON.parse(JSON.stringify(mockSavedReports))
    reportExecutions.value = JSON.parse(JSON.stringify(mockReportExecutions))
    
    isLoading.value = false
    toast({
      title: "Data Refreshed",
      description: "Report data has been refreshed.",
      variant: "default"
    })
  }, 1000)
}

const createNewReport = () => {
  editingReport.value = {
    id: Date.now(), // Temporary ID
    name: "New Report",
    description: "",
    templateId: "",
    createdBy: "current_user",
    createdOn: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isShared: false,
    schedule: {
      frequency: "",
      time: "08:00"
    },
    filters: {},
    columns: [],
    recipients: [],
    exportFormat: "pdf"
  }
  
  openDialog(showReportDialog)
}

const createReportFromTemplate = (template) => {
  editingReport.value = {
    id: Date.now(), // Temporary ID
    name: template.name,
    description: template.description,
    templateId: template.id,
    createdBy: "current_user",
    createdOn: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isShared: false,
    schedule: {
      frequency: "",
      time: "08:00"
    },
    filters: {},
    columns: [...template.defaultColumns],
    recipients: [],
    exportFormat: "pdf"
  }
  
  openDialog(showReportDialog)
}

const editReport = (report) => {
  editingReport.value = JSON.parse(JSON.stringify(report))
  openDialog(showReportDialog)
}

const saveReport = () => {
  if (!editingReport.value) return
  
  isLoading.value = true
  
  // Update last modified date
  editingReport.value.lastModified = new Date().toISOString()
  
  // Calculate next run time if scheduled
  if (editingReport.value.schedule && editingReport.value.schedule.frequency) {
    editingReport.value.schedule.nextRun = calculateNextRunDate(editingReport.value.schedule)
  }
  
  // Simulate API call
  setTimeout(() => {
    const index = savedReports.value.findIndex(r => r.id === editingReport.value.id)
    
    if (index >= 0) {
      // Update existing report
      savedReports.value[index] = { ...editingReport.value }
    } else {
      // Add new report
      savedReports.value.push({ ...editingReport.value })
    }
    
    isLoading.value = false
    closeAllDialogs()
    
    toast({
      title: isEditMode.value ? "Report Updated" : "Report Created",
      description: `${editingReport.value.name} has been ${isEditMode.value ? 'updated' : 'created'} successfully.`,
      variant: "success"
    })
  }, 1000)
}

const calculateNextRunDate = (schedule) => {
  // This is a simplified version. A real implementation would be more complex
  const now = new Date()
  let nextRun = new Date()
  
  // Set time from schedule
  if (schedule.time) {
    const [hours, minutes] = schedule.time.split(':').map(Number)
    nextRun.setHours(hours, minutes, 0, 0)
  }
  
  // If the time is already past for today, start from tomorrow
  if (nextRun < now) {
    nextRun.setDate(nextRun.getDate() + 1)
  }
  
  // Adjust based on frequency
  switch (schedule.frequency) {
    case 'daily':
      // Already set correctly
      break
    case 'weekly':
      const targetDay = schedule.day || 0 // 0 = Sunday, 1 = Monday, etc.
      const currentDay = nextRun.getDay()
      const daysToAdd = (targetDay - currentDay + 7) % 7
      nextRun.setDate(nextRun.getDate() + daysToAdd)
      break
    case 'monthly':
      const targetDate = schedule.day || 1
      nextRun.setDate(targetDate)
      // If the resulting date is in the past, move to next month
      if (nextRun < now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
      break
    case 'quarterly':
      // Set to first month of next quarter
      const currentMonth = now.getMonth()
      const currentQuarter = Math.floor(currentMonth / 3)
      const firstMonthOfNextQuarter = (currentQuarter + 1) * 3
      nextRun.setMonth(firstMonthOfNextQuarter)
      nextRun.setDate(schedule.day || 1)
      break
  }
  
  return nextRun.toISOString()
}

const deleteReport = (report) => {
  reportToDelete.value = report
  openDialog(showDeleteConfirmation)
}

const confirmDelete = () => {
  if (!reportToDelete.value) return
  
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    const index = savedReports.value.findIndex(r => r.id === reportToDelete.value.id)
    
    if (index >= 0) {
      savedReports.value.splice(index, 1)
    }
    
    isLoading.value = false
    closeAllDialogs()
    
    toast({
      title: "Report Deleted",
      description: `${reportToDelete.value.name} has been deleted successfully.`,
      variant: "default"
    })
  }, 800)
}

const duplicateReport = (report) => {
  // Create a copy of the report with a new ID
  const newReport = {
    ...JSON.parse(JSON.stringify(report)),
    id: Date.now(),
    name: `${report.name} (Copy)`,
    createdOn: new Date().toISOString(),
    lastModified: new Date().toISOString()
  }
  
  savedReports.value.push(newReport)
  
  toast({
    title: "Report Duplicated",
    description: `A copy of "${report.name}" has been created.`,
    variant: "success"
  })
}

const runReport = (report) => {
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    // Create a new execution record
    const newExecution = {
      id: reportExecutions.value.length + 1000, // Ensure unique ID
      reportId: report.id,
      executedOn: new Date().toISOString(),
      status: 'completed',
      executionTime: Math.random() * 3 + 1, // Random time between 1-4 seconds
      rowCount: Math.floor(Math.random() * 100) + 50, // Random row count
      fileName: `${report.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${report.exportFormat}`,
      fileSize: Math.floor(Math.random() * 500000) + 50000, // Random file size
      executedBy: 'current_user',
      sentTo: [],
      downloadUrl: `/reports/download/${Date.now()}`
    }
    
    reportExecutions.value.push(newExecution)
    
    isLoading.value = false
    
    toast({
      title: "Report Generated",
      description: `${report.name} has been generated successfully.`,
      variant: "success"
    })
  }, 2500)
}

const showReportPreview = (report) => {
  previewReport.value = report
  isLoadingPreview.value = true
  openDialog(showPreviewDialog)
  
  // Simulate API call to get preview data
  setTimeout(() => {
    // Get sample data based on report template
    const sampleData = sampleReportData[report.templateId] || []
    previewData.value = sampleData.slice(0, 5) // Show only first 5 rows for preview
    totalRows.value = sampleData.length
    
    isLoadingPreview.value = false
  }, 1500)
}

const runFullReport = () => {
  if (!previewReport.value) return
  
  const reportToRun = previewReport.value
  closeAllDialogs()
  runReport(reportToRun)
}

const viewExecutionDetails = (execution) => {
  selectedExecution.value = execution
  openDialog(showExecutionDialog)
}

const downloadExecution = (execution) => {
  if (!execution || execution.status !== 'completed') return
  
  // Simulate file download
  const link = document.createElement('a')
  link.href = execution.downloadUrl || '#'
  link.download = execution.fileName || 'report.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  toast({
    title: "Download Started",
    description: `${execution.fileName} is being downloaded.`,
    variant: "default"
  })
}

const editSchedule = (report) => {
  editReport(report)
}

const toggleSchedule = (report) => {
  const index = savedReports.value.findIndex(r => r.id === report.id)
  
  if (index >= 0) {
    const newReport = { ...savedReports.value[index] }
    newReport.paused = !newReport.paused
    savedReports.value[index] = newReport
    
    toast({
      title: newReport.paused ? "Schedule Paused" : "Schedule Activated",
      description: `${report.name} schedule has been ${newReport.paused ? 'paused' : 'activated'}.`,
      variant: "default"
    })
  }
}

const shareReport = (report) => {
  shareEmail.value = ''
  includeData.value = true
  openDialog(showShareDialog)
}

const copyShareLink = () => {
  navigator.clipboard.writeText('https://pcash-inventory.example.com/reports/share/abc123')
  
  toast({
    title: "Link Copied",
    description: "The report link has been copied to clipboard.",
    variant: "success"
  })
}

const sendShareEmail = () => {
  if (!shareEmail.value) {
    toast({
      title: "Error",
      description: "Please enter a valid email address.",
      variant: "destructive"
    })
    return
  }
  
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false
    
    toast({
      title: "Report Shared",
      description: `Report has been shared with ${shareEmail.value}.`,
      variant: "success"
    })
    
    shareEmail.value = ''
  }, 1000)
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
}

const resetExecutionFilters = () => {
  executionStatusFilter.value = 'all'
  executionDateRangeFilter.value = '7days'
}

// Column and filter management for report editing
const addColumn = (columnId) => {
  if (columnId && editingReport.value && !editingReport.value.columns.includes(columnId)) {
    editingReport.value.columns.push(columnId)
  }
  selectedColumn.value = null
}

const removeColumn = (columnId) => {
  if (editingReport.value && editingReport.value.columns.includes(columnId)) {
    editingReport.value.columns = editingReport.value.columns.filter(c => c !== columnId)
  }
}

const addNewFilter = () => {
  if (!editingReport.value || !availableFilters.value.length) return
  
  const firstAvailableFilter = availableFilters.value[0]
  
  if (!editingReport.value.filters) {
    editingReport.value.filters = {}
  }
  
  // Initialize filter based on its type
  if (firstAvailableFilter.type === 'daterange') {
    editingReport.value.filters[firstAvailableFilter.id] = { preset: 'thisMonth' }
  } else if (firstAvailableFilter.type === 'multiselect') {
    editingReport.value.filters[firstAvailableFilter.id] = ['all']
  } else if (firstAvailableFilter.type === 'range') {
    const range = firstAvailableFilter
    editingReport.value.filters[firstAvailableFilter.id] = { 
      min: range.min || 0, 
      max: range.max || 100 
    }
  }
}

const updateFilterType = (index) => {
  const filter = activeFilters.value[index]
  if (!filter || !editingReport.value) return
  
  // Get filter definition to determine the type
  const filterDef = filterDefinitions[filter.id]
  if (!filterDef) return
  
  // Initialize filter value based on type
  if (filterDef.type === 'daterange') {
    editingReport.value.filters[filter.id] = { preset: 'thisMonth' }
  } else if (filterDef.type === 'multiselect') {
    editingReport.value.filters[filter.id] = ['all']
  } else if (filterDef.type === 'range') {
    editingReport.value.filters[filter.id] = { 
      min: filterDef.min || 0, 
      max: filterDef.max || 100 
    }
  }
}

const removeFilter = (index) => {
  const filter = activeFilters.value[index]
  if (filter && editingReport.value && editingReport.value.filters) {
    delete editingReport.value.filters[filter.id]
    // Force UI update
    editingReport.value = { ...editingReport.value }
  }
}

// Initialize component
onMounted(() => {
  refreshData()
})

// Watch dialog state changes to reset related state
watch([showReportDialog, showPreviewDialog, showExecutionDialog, showDeleteConfirmation, showShareDialog], 
  ([reportDialogOpen, previewDialogOpen, executionDialogOpen, deleteDialogOpen, shareDialogOpen], oldValues) => {
    // Check if any dialog was open before and is now closed
    const oldValues2 = oldValues || [false, false, false, false, false];
    if ((oldValues2[0] && !reportDialogOpen) || 
        (oldValues2[1] && !previewDialogOpen) || 
        (oldValues2[2] && !executionDialogOpen) || 
        (oldValues2[3] && !deleteDialogOpen) || 
        (oldValues2[4] && !shareDialogOpen)) {
      // If a dialog was closed, reset related state
      resetDialogState();
    }
  }
)

// Watch for template changes to update columns
watch(() => editingReport.value?.templateId, (newTemplateId) => {
  if (newTemplateId && editingReport.value) {
    // Get the template
    const template = reportTemplates.find(t => t.id === newTemplateId)
    if (template) {
      // Use template's default columns
      editingReport.value.columns = [...template.defaultColumns]
    }
  }
})
</script>