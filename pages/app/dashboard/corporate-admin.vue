<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Briefcase, Star, Calendar, Eye, CheckCircle, XCircle } from 'lucide-vue-next'

// Dashboard Components
import StatsCard from '@/components/ui/dashboard/StatsCard.vue'
import ActivityFeed from '@/components/ui/dashboard/ActivityFeed.vue'

// Icons
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar as CalendarIcon,
  Star as StarIcon,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Settings,
  FileText,
  MessageSquare,
  Target,
  Award,
  Zap,
  Eye as EyeIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon
} from 'lucide-vue-next'

definePageMeta({
  title: 'Corporate Admin Dashboard',
  description: 'Organizational oversight and platform management',
  requiresAuth: true,
  permissions: ['admin:dashboard:view']
})

// Store
const authStore = useAuthStore()

// Check permissions
const canViewAdminDashboard = computed(() => 
  RoleManager.hasPermission(authStore.loggedInUser, 'admin:dashboard:view')
)

// Mock data for corporate admin dashboard
const dashboardData = ref({
  organization: {
    name: "Safaricom PLC",
    totalEmployees: 1247,
    activeMentorships: 324,
    completedPrograms: 89,
    totalSpent: 2450000, // KES
    currency: "KES"
  },
  
  overview: {
    stats: [
      {
        title: "Total Employees",
        value: "1,247",
        change: "+12%",
        trend: "up" as const,
        icon: Users,
        color: "blue"
      },
      {
        title: "Active Mentorships",
        value: "324",
        change: "+8%", 
        trend: "up" as const,
        icon: UserCheck,
        color: "green"
      },
      {
        title: "Program Budget Used",
        value: "68%",
        change: "+5%",
        trend: "up" as const,
        icon: DollarSign,
        color: "orange"
      },
      {
        title: "Completion Rate",
        value: "87%",
        change: "+3%",
        trend: "up" as const,
        icon: Target,
        color: "purple"
      }
    ],
    
    mentorshipMetrics: {
      totalSessions: 1456,
      averageRating: 4.7,
      successRate: 87,
      retentionRate: 92
    },
    
    departmentBreakdown: [
      { department: "Engineering", employees: 342, activeMentorships: 89, budget: 680000 },
      { department: "Sales", employees: 186, activeMentorships: 67, budget: 420000 },
      { department: "Marketing", employees: 124, activeMentorships: 45, budget: 310000 },
      { department: "Operations", employees: 298, activeMentorships: 78, budget: 580000 },
      { department: "Finance", employees: 89, activeMentorships: 23, budget: 180000 },
      { department: "HR", employees: 67, activeMentorships: 22, budget: 150000 },
      { department: "Other", employees: 141, activeMentorships: 35, budget: 280000 }
    ]
  },

  mentors: {
    totalMentors: 156,
    verifiedMentors: 142,
    pendingApprovals: 8,
    topRatedMentors: [
      {
        id: "mentor-001",
        name: "Dr. Grace Wanjiku",
        rating: 4.9,
        sessions: 45,
        specialization: "Tech Leadership",
        verified: true
      },
      {
        id: "mentor-002", 
        name: "James Kiprotich",
        rating: 4.8,
        sessions: 38,
        specialization: "Strategic Planning",
        verified: true
      },
      {
        id: "mentor-003",
        name: "Amina Hassan",
        rating: 4.8,
        sessions: 42,
        specialization: "Digital Transformation",
        verified: true
      }
    ],
    
    mentorMetrics: {
      averageResponseTime: "2.3 hours",
      averageSessionRating: 4.7,
      totalRevenue: 2450000,
      topCategories: ["Leadership", "Technology", "Business Strategy", "Communication"]
    },
    
    pendingApprovals: [
      {
        id: "pending-001",
        name: "Peter Mwangi",
        expertise: "Software Engineering",
        experience: "8 years",
        submittedDate: "2024-01-18",
        status: "pending_review"
      },
      {
        id: "pending-002",
        name: "Mary Onjala", 
        expertise: "Product Management",
        experience: "12 years",
        submittedDate: "2024-01-17",
        status: "pending_verification"
      }
    ]
  },

  analytics: {
    sessionTrends: [
      { month: "Oct", sessions: 89, revenue: 178000 },
      { month: "Nov", sessions: 124, revenue: 248000 },
      { month: "Dec", sessions: 156, revenue: 312000 },
      { month: "Jan", sessions: 198, revenue: 396000 }
    ],
    
    departmentEngagement: [
      { department: "Engineering", engagement: 94 },
      { department: "Sales", engagement: 87 },
      { department: "Marketing", engagement: 91 },
      { department: "Operations", engagement: 83 },
      { department: "Finance", engagement: 78 },
      { department: "HR", engagement: 88 }
    ],
    
    programEffectiveness: {
      skillImprovement: 89,
      careerAdvancement: 76,
      jobSatisfaction: 82,
      employeeRetention: 94
    }
  },

  recentActivity: [
    {
      id: "activity-001",
      type: "mentor_approval",
      description: "Dr. Grace Wanjiku approved as verified mentor",
      timestamp: "2024-01-19T10:30:00Z",
      icon: CheckCircle,
      color: "green"
    },
    {
      id: "activity-002", 
      type: "budget_alert",
      description: "Engineering department reached 85% of mentorship budget",
      timestamp: "2024-01-19T09:15:00Z",
      icon: AlertTriangle,
      color: "orange"
    },
    {
      id: "activity-003",
      type: "program_completion",
      description: "Leadership Development Program completed by 12 employees",
      timestamp: "2024-01-19T08:45:00Z",
      icon: Award,
      color: "blue"
    },
    {
      id: "activity-004",
      type: "new_registration",
      description: "24 new employees registered for mentorship programs",
      timestamp: "2024-01-18T16:20:00Z",
      icon: Users,
      color: "purple"
    },
    {
      id: "activity-005",
      type: "mentor_review",
      description: "Mentor performance review flagged for quality assurance",
      timestamp: "2024-01-18T14:10:00Z",
      icon: AlertCircle,
      color: "red"
    }
  ],

  alerts: [
    {
      id: "alert-001",
      type: "budget",
      title: "Budget Alert",
      message: "Engineering department has used 85% of allocated mentorship budget",
      severity: "warning",
      actionRequired: true
    },
    {
      id: "alert-002",
      type: "approval",
      title: "Pending Approvals",
      message: "8 mentors are waiting for approval",
      severity: "info",
      actionRequired: true
    },
    {
      id: "alert-003",
      type: "compliance",
      title: "Compliance Review",
      message: "Monthly mentorship compliance report is due in 3 days",
      severity: "warning",
      actionRequired: true
    }
  ]
})

// Computed properties
const totalBudgetUsed = computed(() => {
  const total = dashboardData.value.overview.departmentBreakdown.reduce((sum, dept) => sum + dept.budget, 0)
  return (total / 3000000) * 100 // Assuming total budget is 3M KES
})

const topDepartmentByEngagement = computed(() => {
  return dashboardData.value.analytics.departmentEngagement.reduce((max, dept) => 
    dept.engagement > max.engagement ? dept : max
  )
})

const formatCurrency = (amount: number, currency: string = "KES") => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-KE').format(num)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-KE', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
}

const getAlertIcon = (severity: string) => {
  switch (severity) {
    case 'warning': return AlertTriangle
    case 'error': return XCircle
    case 'info': return AlertCircle
    default: return AlertCircle
  }
}

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'warning': return 'orange'
    case 'error': return 'red'
    case 'info': return 'blue'
    default: return 'gray'
  }
}

onMounted(() => {
  if (!canViewAdminDashboard.value) {
    navigateTo('/app/dashboard')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Page Header -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Corporate Admin Dashboard</h1>
          <p class="text-muted-foreground">
            {{ dashboardData.organization.name }} - Organizational oversight and platform management
          </p>
        </div>
        
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText class="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Settings class="h-4 w-4 mr-2" />
            Platform Settings
          </Button>
        </div>
      </div>

      <!-- Alert Cards -->
      <div v-if="dashboardData.alerts.length > 0" class="grid gap-4 md:grid-cols-3">
        <Alert
          v-for="alert in dashboardData.alerts"
          :key="alert.id"
          :variant="alert.severity === 'error' ? 'destructive' : 'default'"
          class="border-l-4"
          :class="{
            'border-l-orange-500': alert.severity === 'warning',
            'border-l-red-500': alert.severity === 'error',
            'border-l-blue-500': alert.severity === 'info'
          }"
        >
          <component :is="getAlertIcon(alert.severity)" class="h-4 w-4" />
          <div class="flex items-center justify-between">
            <div>
              <AlertDescription class="font-medium">{{ alert.title }}</AlertDescription>
              <AlertDescription class="text-sm text-muted-foreground mt-1">
                {{ alert.message }}
              </AlertDescription>
            </div>
            <Button v-if="alert.actionRequired" variant="ghost" size="sm">
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>

    <!-- Main Dashboard Tabs -->
    <Tabs default-value="overview" class="space-y-6">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="employees">Employee Management</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="activity">Activity Feed</TabsTrigger>
      </TabsList>

      <!-- Overview Tab -->
      <TabsContent value="overview" class="space-y-6">
        <!-- Key Metrics -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            v-for="stat in dashboardData.overview.stats"
            :key="stat.title"
            :title="stat.title"
            :value="stat.value"
            :change="stat.change"
            :trend="stat.trend"
            :icon="stat.icon"
            :color="stat.color"
          />
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Department Breakdown -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BarChart3 class="h-5 w-5" />
                Department Breakdown
              </CardTitle>
              <CardDescription>
                Mentorship participation and budget allocation by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="dept in dashboardData.overview.departmentBreakdown"
                  :key="dept.department"
                  class="space-y-2"
                >
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">{{ dept.department }}</span>
                    <div class="flex items-center gap-4 text-muted-foreground">
                      <span>{{ dept.activeMentorships }}/{{ dept.employees }}</span>
                      <span>{{ formatCurrency(dept.budget) }}</span>
                    </div>
                  </div>
                  <Progress 
                    :value="(dept.activeMentorships / dept.employees) * 100" 
                    class="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Program Effectiveness -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Target class="h-5 w-5" />
                Program Effectiveness
              </CardTitle>
              <CardDescription>
                Key performance indicators for mentorship programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Skill Improvement</span>
                  <div class="flex items-center gap-2">
                    <Progress 
                      :value="dashboardData.analytics.programEffectiveness.skillImprovement" 
                      class="w-20 h-2"
                    />
                    <span class="text-sm text-muted-foreground">
                      {{ dashboardData.analytics.programEffectiveness.skillImprovement }}%
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Career Advancement</span>
                  <div class="flex items-center gap-2">
                    <Progress 
                      :value="dashboardData.analytics.programEffectiveness.careerAdvancement" 
                      class="w-20 h-2"
                    />
                    <span class="text-sm text-muted-foreground">
                      {{ dashboardData.analytics.programEffectiveness.careerAdvancement }}%
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Job Satisfaction</span>
                  <div class="flex items-center gap-2">
                    <Progress 
                      :value="dashboardData.analytics.programEffectiveness.jobSatisfaction" 
                      class="w-20 h-2"
                    />
                    <span class="text-sm text-muted-foreground">
                      {{ dashboardData.analytics.programEffectiveness.jobSatisfaction }}%
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Employee Retention</span>
                  <div class="flex items-center gap-2">
                    <Progress 
                      :value="dashboardData.analytics.programEffectiveness.employeeRetention" 
                      class="w-20 h-2"
                    />
                    <span class="text-sm text-muted-foreground">
                      {{ dashboardData.analytics.programEffectiveness.employeeRetention }}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              <Button variant="outline" class="h-auto p-4 flex flex-col items-center gap-2">
                <UserCheck class="h-6 w-6" />
                <span class="text-sm">Approve Requests</span>
                <Badge variant="secondary">{{ dashboardData.mentors.pendingApprovals.length }}</Badge>
              </Button>
              
              <Button variant="outline" class="h-auto p-4 flex flex-col items-center gap-2">
                <FileText class="h-6 w-6" />
                <span class="text-sm">Generate Report</span>
              </Button>
              
              <Button variant="outline" class="h-auto p-4 flex flex-col items-center gap-2">
                <DollarSign class="h-6 w-6" />
                <span class="text-sm">Budget Management</span>
              </Button>
              
              <Button variant="outline" class="h-auto p-4 flex flex-col items-center gap-2">
                <Settings class="h-6 w-6" />
                <span class="text-sm">Platform Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Employee Management Tab -->
      <TabsContent value="employees" class="space-y-6">
        <!-- Employee Stats -->
        <div class="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Pending Approvals"
            :value="formatNumber(dashboardData.mentors.pendingApprovals.length)"
            icon="Clock"
            color="orange"
          />
          <StatsCard
            title="Active Mentorships"
            :value="formatNumber(dashboardData.mentors.activeMentorships)"
            icon="UserCheck"
            color="green"
          />
          <StatsCard
            title="Completed Programs"
            :value="formatNumber(dashboardData.mentors.completedPrograms)"
            icon="Award"
            color="blue"
          />
          <StatsCard
            title="Budget Utilized"
            :value="`${Math.round((dashboardData.mentors.budgetUsed / dashboardData.mentors.totalBudget) * 100)}%`"
            icon="DollarSign"
            color="purple"
          />
        </div>

        <!-- Pending Mentorship Requests -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="h-5 w-5" />
              Pending Mentorship Requests
              <Badge variant="secondary">{{ dashboardData.mentors.pendingApprovals.length }}</Badge>
            </CardTitle>
            <CardDescription>
              Employee requests for mentorship sessions requiring approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="request in dashboardData.mentors.pendingApprovals"
                :key="request.id"
                class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div class="flex items-center gap-4">
                  <Avatar class="h-10 w-10">
                    <AvatarImage :src="request.employee.profileImage" :alt="request.employee.name" />
                    <AvatarFallback>
                      {{ request.employee.name.split(' ').map(n => n[0]).join('').toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="space-y-1">
                    <div class="font-medium">{{ request.employee.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ request.employee.department }} • {{ request.employee.position }}</div>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar class="h-3 w-3" />
                      <span>Requested: {{ formatDate(request.submittedDate) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <div class="font-medium">{{ request.mentorshipType }}</div>
                    <div class="text-sm text-muted-foreground">{{ request.duration }}</div>
                    <div class="text-sm font-medium">{{ formatCurrency(request.estimatedCost, 'KES') }}</div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye class="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent class="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Mentorship Request Details</DialogTitle>
                          <DialogDescription>
                            Complete information for {{ request.employee.name }}'s mentorship request
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div class="space-y-6">
                          <!-- Employee Information -->
                          <div>
                            <h4 class="font-semibold mb-3">Employee Information</h4>
                            <div class="grid gap-3 md:grid-cols-2">
                              <div class="flex items-center gap-2">
                                <User class="h-4 w-4 text-muted-foreground" />
                                <span class="text-sm">{{ request.employee.name }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <Briefcase class="h-4 w-4 text-muted-foreground" />
                                <span class="text-sm">{{ request.employee.department }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <Star class="h-4 w-4 text-muted-foreground" />
                                <span class="text-sm">{{ request.employee.position }}</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <Calendar class="h-4 w-4 text-muted-foreground" />
                                <span class="text-sm">{{ request.employee.joinDate }}</span>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Request Details -->
                          <div>
                            <h4 class="font-semibold mb-3">Mentorship Request</h4>
                            <div class="space-y-3">
                              <div>
                                <div class="text-sm font-medium">Type</div>
                                <div class="text-sm text-muted-foreground">{{ request.mentorshipType }}</div>
                              </div>
                              <div>
                                <div class="text-sm font-medium">Goals</div>
                                <div class="text-sm text-muted-foreground">{{ request.goals }}</div>
                              </div>
                              <div>
                                <div class="text-sm font-medium">Preferred Areas</div>
                                <div class="flex flex-wrap gap-1 mt-1">
                                  <Badge v-for="area in request.preferredAreas" :key="area" variant="secondary" class="text-xs">
                                    {{ area }}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <div class="text-sm font-medium">Justification</div>
                                <div class="text-sm text-muted-foreground">{{ request.justification }}</div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Cost Information -->
                          <div>
                            <h4 class="font-semibold mb-3">Cost Breakdown</h4>
                            <div class="grid gap-3 md:grid-cols-2">
                              <div>
                                <div class="text-sm font-medium">Duration</div>
                                <div class="text-sm text-muted-foreground">{{ request.duration }}</div>
                              </div>
                              <div>
                                <div class="text-sm font-medium">Estimated Cost</div>
                                <div class="text-lg font-bold">{{ formatCurrency(request.estimatedCost, 'KES') }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter class="gap-2">
                          <Button variant="outline">
                            <XCircle class="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button>
                            <CheckCircle class="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" variant="outline">
                      <CheckCircle class="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Button size="sm" variant="destructive">
                      <XCircle class="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Employee Mentorship Overview -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Department Participation -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BarChart3 class="h-5 w-5" />
                Department Participation
              </CardTitle>
              <CardDescription>
                Mentorship participation by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="dept in dashboardData.overview.departmentBreakdown"
                  :key="dept.department"
                  class="space-y-2"
                >
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">{{ dept.department }}</span>
                    <div class="flex items-center gap-4 text-muted-foreground">
                      <span>{{ dept.activeMentorships }}/{{ dept.employees }}</span>
                      <span>{{ Math.round((dept.activeMentorships / dept.employees) * 100) }}%</span>
                    </div>
                  </div>
                  <Progress 
                    :value="(dept.activeMentorships / dept.employees) * 100" 
                    class="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Recent Approvals -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <CheckCircle class="h-5 w-5" />
                Recent Approvals
              </CardTitle>
              <CardDescription>
                Recently approved mentorship requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div
                  v-for="approval in dashboardData.mentors.recentApprovals"
                  :key="approval.id"
                  class="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle class="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div class="font-medium text-sm">{{ approval.employeeName }}</div>
                      <div class="text-xs text-muted-foreground">{{ approval.department }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-muted-foreground">{{ formatDate(approval.approvedDate) }}</div>
                    <div class="text-xs font-medium">{{ formatCurrency(approval.cost, 'KES') }}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Analytics Tab -->
      <TabsContent value="analytics" class="space-y-6">
        <!-- Session Trends -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <TrendingUp class="h-5 w-5" />
              Session & Revenue Trends
            </CardTitle>
            <CardDescription>
              Monthly progression of mentorship sessions and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="trend in dashboardData.analytics.sessionTrends"
                :key="trend.month"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="font-medium">{{ trend.month }} 2024</div>
                <div class="flex items-center gap-8">
                  <div class="text-right">
                    <div class="font-medium">{{ trend.sessions }}</div>
                    <div class="text-sm text-muted-foreground">Sessions</div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium">{{ formatCurrency(trend.revenue) }}</div>
                    <div class="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Department Engagement -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <BarChart3 class="h-5 w-5" />
              Department Engagement Scores
            </CardTitle>
            <CardDescription>
              Employee engagement levels by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="dept in dashboardData.analytics.departmentEngagement"
                :key="dept.department"
                class="space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">{{ dept.department }}</span>
                  <span class="text-muted-foreground">{{ dept.engagement }}%</span>
                </div>
                <Progress :value="dept.engagement" class="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Activity Feed Tab -->
      <TabsContent value="activity" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Activity class="h-5 w-5" />
              Recent Platform Activity
            </CardTitle>
            <CardDescription>
              Latest events and administrative actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed :activities="dashboardData.recentActivity" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template> 