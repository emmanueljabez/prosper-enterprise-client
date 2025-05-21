<template>
  <div class="space-y-6 p-6">

    <!-- Header with Title and Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Opportunities</h2>
        <p class="text-muted-foreground">Track and manage sales opportunities</p>
      </div>
      <Button @click="$emit('add-opportunity')" size="default">
        <PlusIcon class="h-4 w-4 mr-2" />
        New Opportunity
      </Button>
    </div>

    <!-- Filter Controls -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Input placeholder="Search opportunities..." v-model="filters.search" />
      </div>
      <div>
        <Select v-model="filters.stage">
          <SelectTrigger>
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent @click.stop>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="prospecting">Prospecting</SelectItem>
            <SelectItem value="qualification">Qualification</SelectItem>
            <SelectItem value="needs_analysis">Needs Analysis</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div class="flex space-x-2">
          <Button variant="outline" @click="resetFilters" class="shrink-0" size="icon">
            <RotateCcwIcon class="h-4 w-4" />
          </Button>
          <Button variant="outline" @click="$emit('refresh')" class="shrink-0" size="icon">
            <RefreshCwIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Pipeline View Toggle -->
    <div class="flex items-center space-x-2">
      <Button
          :variant="viewMode === 'table' ? 'default' : 'outline'"
          size="sm"
          @click="viewMode = 'table'"
      >
        <TableIcon class="h-4 w-4 mr-2" />
        Table View
      </Button>
      <Button
          :variant="viewMode === 'pipeline' ? 'default' : 'outline'"
          size="sm"
          @click="viewMode = 'pipeline'"
      >
        <LayoutIcon class="h-4 w-4 mr-2" />
        Pipeline View
      </Button>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Opportunity</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading" class="h-24">
            <TableCell colspan="8" class="text-center">
              <Loader2Icon class="w-6 h-6 mx-auto animate-spin text-primary" />
              <p class="mt-2 text-sm text-muted-foreground">Loading opportunities...</p>
            </TableCell>
          </TableRow>

          <TableRow v-else-if="filteredOpportunities.length === 0" class="h-24">
            <TableCell colspan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <TargetIcon class="h-8 w-8 text-muted-foreground mb-2" />
                <p>No opportunities found</p>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ hasFilters ? 'Try changing your filters' : 'Create your first opportunity by clicking "New Opportunity"' }}
                </p>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-for="opp in filteredOpportunities" :key="opp.id">
            <TableCell>
              <div class="font-medium">{{ opp.name }}</div>
              <div class="text-xs text-muted-foreground">{{ opp.id }}</div>
            </TableCell>
            <TableCell>
              <div>{{ opp.lead.name }}</div>
              <div class="text-xs text-muted-foreground">{{ opp.lead.type === 'business' ? 'Business' : 'Individual' }}</div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStageVariant(opp.stage)">
                {{ formatStageName(opp.stage) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatCurrency(opp.amount, opp.currency) }}</TableCell>
            <TableCell>
              <div class="flex items-center space-x-2">
                <div class="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                      class="h-full bg-primary"
                      :style="{ width: `${opp.probability}%` }"
                  ></div>
                </div>
                <span>{{ opp.probability }}%</span>
              </div>
            </TableCell>
            <TableCell>{{ formatDate(opp.expectedCloseDate) }}</TableCell>
            <TableCell>{{ formatDate(opp.createdAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" @click.stop>
                  <DropdownMenuItem @click="$emit('view-opportunity', opp)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-opportunity', opp)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRightIcon class="mr-2 h-4 w-4" />
                      <span>Change Stage</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                          v-for="stage in stages"
                          :key="stage.value"
                          :disabled="opp.stage === stage.value"
                          @click="changeStage(opp, stage.value)"
                      >
                        <Badge :variant="getStageVariant(stage.value)" class="mr-2">
                          {{ stage.label }}
                        </Badge>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      @click="$emit('delete-opportunity', opp)"
                      class="text-destructive focus:text-destructive"
                  >
                    <TrashIcon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pipeline View -->
    <div v-else-if="viewMode === 'pipeline'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stageGroup in pipelineGroups" :key="stageGroup.stage" class="border rounded-md overflow-hidden">
        <div class="p-3 border-b bg-muted/30">
          <div class="flex items-center justify-between">
            <h3 class="font-medium flex items-center">
              <Badge :variant="getStageVariant(stageGroup.stage)" class="mr-2">
                {{ formatStageName(stageGroup.stage) }}
              </Badge>
              <span>{{ stageGroup.opportunities.length }}</span>
            </h3>
            <div class="text-muted-foreground text-sm">
              {{ formatCurrency(stageGroup.total) }}
            </div>
          </div>
        </div>

        <div class="p-2 space-y-2 h-[calc(100vh-380px)] overflow-y-auto">
          <div
              v-for="opp in stageGroup.opportunities"
              :key="opp.id"
              class="p-3 border rounded-md bg-card hover:shadow-sm transition-shadow cursor-pointer"
              @click="$emit('view-opportunity', opp)"
          >
            <div class="font-medium">{{ opp.name }}</div>
            <div class="text-sm text-muted-foreground">{{ opp.lead.name }}</div>
            <div class="mt-2 flex items-center justify-between">
              <div class="font-medium">{{ formatCurrency(opp.amount, opp.currency) }}</div>
              <div class="text-xs text-muted-foreground">{{ formatDate(opp.expectedCloseDate) }}</div>
            </div>
            <div class="mt-1 flex items-center justify-between">
              <div class="text-xs flex items-center">
                <div class="w-8 h-1.5 bg-muted rounded-full overflow-hidden mr-1">
                  <div
                      class="h-full bg-primary"
                      :style="{ width: `${opp.probability}%` }"
                  ></div>
                </div>
                <span>{{ opp.probability }}%</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" class="h-7 w-7" @click.stop>
                    <MoreHorizontalIcon class="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" @click.stop>
                  <DropdownMenuItem @click="$emit('edit-opportunity', opp)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRightIcon class="mr-2 h-4 w-4" />
                      <span>Move To</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                          v-for="stage in stages"
                          :key="stage.value"
                          :disabled="opp.stage === stage.value"
                          @click="changeStage(opp, stage.value)"
                      >
                        {{ stage.label }}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      @click="$emit('delete-opportunity', opp)"
                      class="text-destructive focus:text-destructive"
                  >
                    <TrashIcon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div v-if="stageGroup.opportunities.length === 0" class="p-4 text-center text-muted-foreground text-sm">
            No opportunities in this stage
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PlusIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  TargetIcon,
  TableIcon,
  LayoutIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  opportunities: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add-opportunity',
  'view-opportunity',
  'edit-opportunity',
  'delete-opportunity',
  'stage-change',
  'refresh'
])

// State
const viewMode = ref('table')
const filters = ref({
  search: '',
  stage: 'all'
})

// Pipeline stages
const stages = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'needs_analysis', label: 'Needs Analysis' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' }
]

// Computed properties
const hasFilters = computed(() => {
  return filters.value.search || filters.value.stage !== 'all'
})

const filteredOpportunities = computed(() => {
  if (!props.opportunities) return []

  return props.opportunities.filter(opp => {
    // Filter by search term
    const searchMatch = !filters.value.search ||
        opp.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        opp.lead.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        opp.id.toLowerCase().includes(filters.value.search.toLowerCase())

    // Filter by stage
    const stageMatch = filters.value.stage === 'all' || opp.stage === filters.value.stage

    return searchMatch && stageMatch
  })
})

// Group opportunities by stage for pipeline view
const pipelineGroups = computed(() => {
  const groups = stages.map(stage => ({
    stage: stage.value,
    opportunities: [],
    total: 0
  }))

  // Filter opportunities first
  const filtered = filteredOpportunities.value

  // Group opportunities by stage
  filtered.forEach(opp => {
    const group = groups.find(g => g.stage === opp.stage)
    if (group) {
      group.opportunities.push(opp)
      group.total += opp.amount
    }
  })

  return groups
})

// Methods
function resetFilters() {
  filters.value = {
    search: '',
    stage: 'all'
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

function formatStageName(stage) {
  const stageMap = {
    'prospecting': 'Prospecting',
    'qualification': 'Qualification',
    'needs_analysis': 'Needs Analysis',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  }

  return stageMap[stage] || stage
}

function getStageVariant(stage) {
  const variantMap = {
    'prospecting': 'secondary',
    'qualification': 'secondary',
    'needs_analysis': 'default',
    'proposal': 'default',
    'negotiation': 'primary',
    'closed_won': 'success',
    'closed_lost': 'destructive'
  }

  return variantMap[stage] || 'default'
}

function changeStage(opp, newStage) {
  emit('stage-change', { opportunity: opp, stage: newStage })
}
</script>

<style scoped>
.pipeline-container {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.pipeline-wrapper {
  min-width: 900px;
}

.pipeline-column {
  min-height: 300px;
  max-height: 70vh;
  overflow-y: auto;
}

.opportunity-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.opportunity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>