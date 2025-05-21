<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header with date and filters -->
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Billing & Revenue</h1>
          <p class="text-muted-foreground">
            {{ formattedDate }} • {{ formattedFinancialYear }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Select v-model="selectedTimeframe">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" @click="refreshData">
            <RefreshCcw class="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download class="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </header>

    <!-- Key Revenue Metrics -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Total Revenue -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard class="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        
        <CardContent v-else-if="!hasTotalRevenueData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">KES {{ formatCurrency(revenueStats.totalRevenue) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="revenueStats.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="revenueStats.revenueGrowth > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(revenueStats.revenueGrowth) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>

      <!-- Monthly Recurring Revenue -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
          <Repeat class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasMonthlyRecurringRevenueData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">KES {{ formatCurrency(revenueStats.mrr) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="revenueStats.mrrGrowth > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="revenueStats.mrrGrowth > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(revenueStats.mrrGrowth) }}%
            </span>
            from previous month
          </p>
        </CardContent>
      </Card>

      <!-- Outstanding Invoices -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Outstanding Invoices</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasOutstandingBalancesData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">KES {{ formatCurrency(revenueStats.outstandingInvoices) }}</div>
          <p class="text-xs text-muted-foreground">
            {{ revenueStats.invoiceCount }} invoices pending
          </p>
        </CardContent>
      </Card>

      <!-- Average Transaction -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Average Transaction</CardTitle>
          <BarChart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasAverageTransactionData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">KES {{ formatCurrency(revenueStats.avgTransaction) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="revenueStats.avgTransactionGrowth > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="revenueStats.avgTransactionGrowth > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(revenueStats.avgTransactionGrowth) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Financial Performance Section -->
    <div class="grid gap-4 md:grid-cols-3">
      <!-- Average Revenue Per User -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Average Revenue Per User</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasAverageRevenuePerUserData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">KES {{ formatCurrency(revenueStats.arpu) }}</div>
          <p class="text-xs text-muted-foreground">
            <span :class="revenueStats.arpuGrowth > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="revenueStats.arpuGrowth > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(revenueStats.arpuGrowth) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>

      <!-- Gross Profit Margin -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Gross Profit Margin</CardTitle>
          <Percent class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasGrossProfitMarginData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ revenueStats.grossMargin }}%</div>
          <p class="text-xs text-muted-foreground">
            <span :class="revenueStats.marginGrowth > 0 ? 'text-green-500' : 'text-red-500'">
              <ArrowUp v-if="revenueStats.marginGrowth > 0" class="h-4 w-4 inline" />
              <ArrowDown v-else class="h-4 w-4 inline" />
              {{ Math.abs(revenueStats.marginGrowth) }}%
            </span>
            from previous period
          </p>
        </CardContent>
      </Card>

      <!-- YoY Revenue Growth -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">YoY Revenue Growth</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center space-x-2">
            <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p class="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasYearOverYearGrowthData && !isDev">
          <p class="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
        <CardContent v-else>
          <div class="text-2xl font-bold">{{ revenueStats.yearOverYearGrowth }}%</div>
          <p class="text-xs text-muted-foreground">
            Year-over-year comparison
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Revenue Charts -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Revenue Trend Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <div v-else-if="!hasRevenueTrend && !isDev" class="absolute inset-0 flex items-center justify-center">
            <p class="text-muted-foreground">No trend data available for the selected period.</p>
          </div>
          <canvas ref="revenueTrendChart" v-show="chartsLoaded && (hasRevenueTrend || isDev)"></canvas>
        </CardContent>
      </Card>

      <!-- Revenue Breakdown Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Revenue distribution by service category</CardDescription>
        </CardHeader>
        <CardContent class="h-[350px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <div v-else-if="!hasRevenueBreakDown && !isDev" class="absolute inset-0 flex items-center justify-center">
            <p class="text-muted-foreground">No breakdown data available for the selected period.</p>
          </div>
          <canvas ref="revenueBreakdownChart" v-show="chartsLoaded && (hasRevenueBreakDown || isDev)"></canvas>
        </CardContent>
      </Card>
    </div>

    <!-- Customer Revenue Metrics -->
    <Card>
      <CardHeader>
        <CardTitle>Customer Revenue Metrics</CardTitle>
        <CardDescription>Key indicators for customer value and retention</CardDescription>
      </CardHeader>
      <CardContent v-if="isLoading">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </CardContent>
      <CardContent v-else-if="!hasCustomerRevenueMetrics && !isDev">
        <div class="flex items-center justify-center py-8">
          <p class="text-muted-foreground">No customer metrics available for the selected period.</p>
        </div>
      </CardContent>
      <CardContent v-else>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Customer Lifetime Value</span>
              <Badge>KES {{ formatCurrency(revenueStats.clv) }}</Badge>
            </div>
            <Progress :value="85" class="h-2" />
            <p class="text-xs text-muted-foreground">Target: KES {{ formatCurrency(revenueStats.clvTarget) }}</p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Revenue Retention</span>
              <Badge>{{ revenueStats.revenueRetention }}%</Badge>
            </div>
            <Progress :value="revenueStats.revenueRetention" class="h-2" />
            <p class="text-xs text-muted-foreground">Target: 95%</p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Days Sales Outstanding</span>
              <Badge>{{ revenueStats.dso }} days</Badge>
            </div>
            <Progress :value="(45 - revenueStats.dso) / 45 * 100" class="h-2" />
            <p class="text-xs text-muted-foreground">Target: 30 days</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Payment Method Analysis -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Payment Method Distribution -->
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
          <CardDescription>Revenue by payment method</CardDescription>
        </CardHeader>
        <CardContent class="h-[300px] relative">
          <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <div v-else-if="!hasPaymentMethodDistribution && !isDev" class="absolute inset-0 flex items-center justify-center">
            <p class="text-muted-foreground">No payment data available for the selected period.</p>
          </div>
          <canvas ref="paymentMethodChart" v-show="chartsLoaded && (hasPaymentMethodDistribution || isDev)"></canvas>
        </CardContent>
      </Card>

      <!-- Payment Success Rate -->
      <Card>
        <CardHeader>
          <CardTitle>Payment Success Rate</CardTitle>
          <CardDescription>Transaction success and failure analysis</CardDescription>
        </CardHeader>
        <CardContent v-if="isLoading">
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
        <CardContent v-else-if="!hasPaymentSuccessRate && !isDev">
          <div class="flex items-center justify-center py-8">
            <p class="text-muted-foreground">No success rate data available for the selected period.</p>
          </div>
        </CardContent>
        <CardContent v-else>
          <div class="space-y-6">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">M-Pesa</span>
                <Badge variant="outline">{{ paymentStats.mpesa.success }}%</Badge>
              </div>
              <div class="flex items-center gap-2">
                <Progress :value="paymentStats.mpesa.success" class="h-2 flex-1" />
                <span class="text-xs text-muted-foreground w-12">
                  {{ paymentStats.mpesa.count }} txns
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Card Payments</span>
                <Badge variant="outline">{{ paymentStats.card.success }}%</Badge>
              </div>
              <div class="flex items-center gap-2">
                <Progress :value="paymentStats.card.success" class="h-2 flex-1" />
                <span class="text-xs text-muted-foreground w-12">
                  {{ paymentStats.card.count }} txns
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Bank Transfer</span>
                <Badge variant="outline">{{ paymentStats.bank.success }}%</Badge>
              </div>
              <div class="flex items-center gap-2">
                <Progress :value="paymentStats.bank.success" class="h-2 flex-1" />
                <span class="text-xs text-muted-foreground w-12">
                  {{ paymentStats.bank.count }} txns
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Service Performance -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>Revenue breakdown by service area and type</CardDescription>
          </div>
          <Select v-model="serviceView">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="View by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Geographic Area</SelectItem>
              <SelectItem value="type">Connection Type</SelectItem>
              <SelectItem value="plan">Service Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent class="h-[350px] relative">
        <div v-if="isLoading || !chartsLoaded" class="absolute inset-0 flex items-center justify-center">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <div v-else-if="!hasServicePerformance && !isDev" class="absolute inset-0 flex items-center justify-center">
          <p class="text-muted-foreground">No service performance data available for the selected period.</p>
        </div>
        <canvas ref="servicePerformanceChart" v-show="chartsLoaded && (hasServicePerformance || isDev)"></canvas>
      </CardContent>
    </Card>

    <!-- Invoice Management -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>Track and manage invoice status</CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Filter class="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent v-if="isLoading">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </CardContent>
      <CardContent v-else-if="!hasInvoiceManagement  && !isDev">
        <div class="flex items-center justify-center py-8">
          <p class="text-muted-foreground">No invoice data available for the selected period.</p>
        </div>
      </CardContent>
      <CardContent v-else>
        <Tabs defaultValue="pending">
          <TabsList class="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="invoice in pendingInvoices" :key="invoice.id">
                  <TableCell><span class="font-mono">{{ invoice.number }}</span></TableCell>
                  <TableCell>{{ invoice.customer }}</TableCell>
                  <TableCell>KES {{ formatCurrency(invoice.amount) }}</TableCell>
                  <TableCell>{{ invoice.issueDate }}</TableCell>
                  <TableCell>{{ invoice.dueDate }}</TableCell>
                  <TableCell>
                    <Badge :variant="getStatusVariant(invoice.status)">
                      {{ invoice.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye class="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send class="h-4 w-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText class="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle class="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <!-- Other tab content would be similar -->
        </Tabs>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          Showing <strong>5</strong> of <strong>{{ pendingInvoices.length }}</strong> invoices
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue'
import {format} from 'date-fns'

// UI components imported from their specific locations
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Progress} from '@/components/ui/progress'
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card'
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell} from '@/components/ui/table'
import {Badge} from '@/components/ui/badge'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs'
import {
  Select, SelectValue, SelectTrigger, SelectContent, SelectItem
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Icons
import {
  CreditCard, Repeat, FileText, BarChart, RefreshCcw, Download, Percent, TrendingUp,
  Plus, Send, ArrowUp, ArrowDown, MoreHorizontal, Calendar, CheckCircle, Eye,
  AlertCircle, Clock, Users, Filter, Banknote
} from 'lucide-vue-next'

// toast 
import { useToast } from '@/components/ui/toast'

// store
import { useBillingAndRevenueStore } from '@/store/modules/dashboard/billing-and-revenue'

// initialize store 
const billingAndRevenueStore = useBillingAndRevenueStore()

// toast
const { toast } = useToast()

// Date formatting
const formattedDate = computed(() => {
  return format(new Date(), 'MMMM d, yyyy')
})

const formattedFinancialYear = computed(() => {
  const startYear = new Date().getFullYear()
  const endYear = startYear + 1
  return `${startYear}/${endYear}`
})

// Selected timeframe
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development'

// Chart refs and states
const revenueTrendChart = ref(null)
const revenueBreakdownChart = ref(null)
const paymentMethodChart = ref(null)
const servicePerformanceChart = ref(null)
const chartsLoaded = ref(false)
const serviceView = ref('area')

// Chart instances
let revenueTrendChartInstance = null
let revenueBreakdownChartInstance = null
let paymentMethodChartInstance = null
let servicePerformanceChartInstance = null

// store state
const isLoading = computed(() => billingAndRevenueStore.getIsLoading)
const error = computed(() => billingAndRevenueStore.getError)
const totalRevenue = computed(() => billingAndRevenueStore.fetchTotalRevenue)
const monthlyRecurringRevenue = computed(() => billingAndRevenueStore.fetchMonthlyRecurringRevenue)
const outstandingBalances = computed(() => billingAndRevenueStore.fetchOutstandingBalances)
const averageTransaction = computed(() => billingAndRevenueStore.fetchAverageTransaction)
const averageRevenuePerUser = computed(() => billingAndRevenueStore.fetchAverageRevenuePerUser)
const grossProfitMargin = computed(() => billingAndRevenueStore.fetchGrossProfitMargin)
const yearOverYearGrowth = computed(() => billingAndRevenueStore.fetchYearOverYearGrowth)
const revenueTrend = computed(() => billingAndRevenueStore.fetchRevenueTrend)
const revenueBreakdown = computed(() => billingAndRevenueStore.fetchRevenueBreakdown)
const customerRevenueMetrics = computed(() => billingAndRevenueStore.fetchCustomerRevenueMetrics)
const paymentMethodDistribution = computed(() => billingAndRevenueStore.fetchPaymentMethodDistribution)
const paymentSuccessRate = computed(() => billingAndRevenueStore.fetchPaymentSuccessRate)
const servicePerformance = computed(() => billingAndRevenueStore.fetchServicePerformance)
const invoiceManagement = computed(() => billingAndRevenueStore.fetchInvoiceManagement)

// Revenue stats
const revenueStats = ref({
  totalRevenue: 28500000,
  mrr: 4200000,
  outstandingInvoices: 3750000,
  avgTransaction: 185000,
  revenueGrowth: 12,
  mrrGrowth: 8,
  invoiceCount: 53,
  avgTransactionGrowth: 5,
  // New metrics
  arpu: 12500,
  arpuGrowth: 3.5,
  grossMargin: 68,
  marginGrowth: 2.1,
  yearOverYearGrowth: 23,
  clv: 750000,
  clvTarget: 850000,
  revenueRetention: 92,
  dso: 32
})

// Payment stats
const paymentStats = ref({
  mpesa: {success: 98, count: 3842},
  card: {success: 95, count: 1256},
  bank: {success: 87, count: 438}
})

// Pending invoices
const pendingInvoices = ref([
  {
    id: 1,
    number: 'INV-2023-0457',
    customer: 'Safaricom PLC',
    amount: 1250000,
    issueDate: '2023-05-10',
    dueDate: '2023-06-09',
    status: 'pending'
  },
  {
    id: 2,
    number: 'INV-2023-0458',
    customer: 'Equity Bank Kenya',
    amount: 780000,
    issueDate: '2023-05-12',
    dueDate: '2023-06-11',
    status: 'pending'
  },
  {
    id: 3,
    number: 'INV-2023-0462',
    customer: 'Kenya Airways',
    amount: 520000,
    issueDate: '2023-05-15',
    dueDate: '2023-06-14',
    status: 'pending'
  },
  {
    id: 4,
    number: 'INV-2023-0465',
    customer: 'East African Breweries',
    amount: 325000,
    issueDate: '2023-05-18',
    dueDate: '2023-06-17',
    status: 'pending'
  },
  {
    id: 5,
    number: 'INV-2023-0469',
    customer: 'University of Nairobi',
    amount: 475000,
    issueDate: '2023-05-20',
    dueDate: '2023-06-19',
    status: 'pending'
  }
])

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Initialize charts
const initializeCharts = async () => {
  try {
    // Dynamic import of Chart.js
    const ChartModule = await import('chart.js/auto')
    const Chart = ChartModule.default

    // Revenue trend chart
    if (revenueTrendChart.value) {
      const ctx = revenueTrendChart.value.getContext('2d')
      revenueTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [18.2, 19.5, 20.1, 21.8, 22.5, 23.2, 24.8, 26.3, 25.9, 27.1, 28.5, 29.2],
            fill: false,
            borderColor: '#3b82f6',
            tension: 0.2,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#3b82f6',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `Revenue: KES ${context.raw}M`
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value}M`
              },
              grid: {
                borderDash: [2, 4]
              }
            }
          }
        }
      })
    }

    // Revenue breakdown chart
    if (revenueBreakdownChart.value) {
      const ctx = revenueBreakdownChart.value.getContext('2d')
      revenueBreakdownChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Connectivity Services', 'Cloud Solutions', 'Security Services', 'Managed Services', 'Hardware Sales'],
          datasets: [{
            data: [35, 25, 18, 12, 10],
            backgroundColor: [
              '#3b82f6', // blue
              '#10b981', // green
              '#f59e0b', // amber
              '#8b5cf6', // purple
              '#64748b'  // slate
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  const revenue = Math.round(revenueStats.value.totalRevenue * value / 100 / 1000000);
                  return `${label}: ${percentage}% (KES ${revenue}M)`;
                }
              }
            }
          },
          cutout: '65%'
        }
      })
    }

    // Payment method chart
    if (paymentMethodChart.value) {
      const ctx = paymentMethodChart.value.getContext('2d')
      paymentMethodChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['M-Pesa', 'Card Payments', 'Bank Transfer', 'Other Mobile Money'],
          datasets: [{
            data: [65, 20, 10, 5],
            backgroundColor: [
              '#10b981', // green for M-Pesa
              '#3b82f6', // blue for cards
              '#8b5cf6', // purple for bank
              '#f59e0b'  // amber for other mobile money
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        }
      })
    }

    // Service performance chart
    if (servicePerformanceChart.value) {
      const ctx = servicePerformanceChart.value.getContext('2d')

      const getServiceData = () => {
        if (serviceView.value === 'area') {
          return {
            labels: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Other Regions'],
            data: [45, 20, 12, 8, 7, 8]
          }
        } else if (serviceView.value === 'type') {
          return {
            labels: ['Fiber', 'Fixed Wireless', 'LTE', 'VSAT', 'Dedicated Links'],
            data: [55, 20, 15, 5, 5]
          }
        } else {
          return {
            labels: ['Business Premium', 'Business Standard', 'Home Premium', 'Home Standard', 'Basic'],
            data: [30, 25, 15, 20, 10]
          }
        }
      }

      const serviceData = getServiceData()

      servicePerformanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: serviceData.labels,
          datasets: [{
            label: 'Revenue Percentage',
            data: serviceData.data,
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'
            ],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value}%`
              }
            }
          }
        }
      })
    }

    chartsLoaded.value = true
  } catch (error) {
    console.error('Failed to initialize charts:', error)
  }
}

// Watch for service view changes
// In a real implementation, you would watch the serviceView and update the chart
// Here's a placeholder for that logic

// Refresh data function
const refreshData = () => {
  // Simulate a data refresh
  // You would typically make API calls here to refresh all the data

  // For demo, just add small random variations
  revenueStats.value = {
    ...revenueStats.value,
    totalRevenue: revenueStats.value.totalRevenue + (Math.random() * 500000 - 250000),
    mrr: revenueStats.value.mrr + (Math.random() * 200000 - 100000)
  }
}

const fetchTotalRevenue = async () => {
  try {
    await billingAndRevenueStore.fetchTotalRevenue()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      // const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      // toast({
      //   title: 'Error',
      //   description: errorMessage,
      //   variant: 'destructive'
      // })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchMonthlyRecurringRevenue = async () => {
  try {
    await billingAndRevenueStore.fetchMonthlyRecurringRevenue()
  } catch (error) {
    console.error('Error fetching data:', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    })
  }
}

const fetchOutstandingBalances = async () => {
  try {
    await billingAndRevenueStore.fetchOutstandingBalances()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchAverageTransaction = async () => {
  try {
    await billingAndRevenueStore.fetchAverageTransaction()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchAverageRevenuePerUser = async () => {
  try {
    await billingAndRevenueStore.fetchAverageRevenuePerUser()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchGrossProfitMargin = async () => {
  try {
    await billingAndRevenueStore.fetchGrossProfitMargin()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchYearOverYearGrowth = async () => {
  try {
    await billingAndRevenueStore.fetchYearOverYearGrowth()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchRevenueTrend = async () => {
  try {
    await billingAndRevenueStore.fetchRevenueTrend()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchRevenueBreakdown = async () => {
  try {
    await billingAndRevenueStore.fetchRevenueBreakDown()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchPaymentMethodDistribution = async () => {
  try {
    await billingAndRevenueStore.fetchPaymentMethodDistribution()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchPaymentSuccessRate = async () => {
  try {
    await billingAndRevenueStore.fetchPaymentSuccessRate()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchServicePerformance = async () => {
  try {
    await billingAndRevenueStore.fetchServicePerformance()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const fetchInvoiceManagement = async () => {
  try {
    await billingAndRevenueStore.fetchInvoiceManagement()
  } catch (error) {
    if (!isDev) {
      console.error('Error fetching data:', error)
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } else {
      console.error('Error fetching data:', error)
    }
  }
}

const hasTotalRevenueData = computed(() => {
  return totalRevenue.value && totalRevenue.value.length > 0
})	

const hasMonthlyRecurringRevenueData = computed(() => {
  return monthlyRecurringRevenue.value && monthlyRecurringRevenue.value.length > 0
})

const hasOutstandingBalancesData = computed(() => {
  return outstandingBalances.value && outstandingBalances.value.length > 0
})

const hasAverageTransactionData = computed(() => {
  return averageTransaction.value && averageTransaction.value.length > 0
})

const hasAverageRevenuePerUserData = computed(() => {
  return averageRevenuePerUser.value && averageRevenuePerUser.value.length > 0
})

const hasGrossProfitMarginData = computed(() => {
  return grossProfitMargin.value && grossProfitMargin.value.length > 0
})

const hasYearOverYearGrowthData = computed(() => {
  return yearOverYearGrowth.value && yearOverYearGrowth.value.length > 0
})

const hasRevenueTrend = computed(() => {
  return revenueTrend.value && revenueTrend.value.length > 0
})

const hasRevenueBreakDown = computed(() => {
  return revenueBreakdown.value && revenueBreakdown.value.length > 0
})

const hasPaymentMethodDistribution = computed(() => {
  return paymentMethodDistribution.value && paymentMethodDistribution.value.length > 0
})

const hasCustomerRevenueMetrics = computed(() => {
  return customerRevenueMetrics.value && customerRevenueMetrics.value.length > 0
})

const hasPaymentSuccessRate = computed(() => {
  return paymentSuccessRate.value && paymentSuccessRate.value.length > 0
})

const hasServicePerformance = computed(() => {
  return servicePerformance.value && servicePerformance.value.length > 0
})

const hasInvoiceManagement = computed(() => {
  return invoiceManagement.value && invoiceManagement.value.length > 0
})

// Initialize on client side
onMounted(() => {
    fetchTotalRevenue()
    fetchMonthlyRecurringRevenue()
    fetchOutstandingBalances()
    fetchAverageTransaction()
    fetchAverageRevenuePerUser()
    fetchGrossProfitMargin()
    fetchYearOverYearGrowth()
    fetchRevenueTrend()
    fetchRevenueBreakdown()
    fetchPaymentMethodDistribution()
    fetchPaymentSuccessRate()
    fetchServicePerformance()
    fetchInvoiceManagement()
  setTimeout(() => {
    initializeCharts()
  }, 300) // Small delay to ensure DOM is ready
})

// Clean up on unmount
onUnmounted(() => {
  if (revenueTrendChartInstance) {
    revenueTrendChartInstance.destroy()
  }
  if (revenueBreakdownChartInstance) {
    revenueBreakdownChartInstance.destroy()
  }
  if (paymentMethodChartInstance) {
    paymentMethodChartInstance.destroy()
  }
  if (servicePerformanceChartInstance) {
    servicePerformanceChartInstance.destroy()
  }
})
</script>