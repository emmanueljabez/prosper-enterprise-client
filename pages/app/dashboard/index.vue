<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useMentorsStore } from '@/store/modules/mentors'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Icons
import {
  LayoutDashboard,
  Users,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  BookOpen,
  Award,
  ArrowRight,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Plus,
  User,
  PlayCircle,
  BarChart3,
  Download,
  Filter
} from 'lucide-vue-next'

definePageMeta({
  title: 'Employee Dashboard',
  description: 'Your comprehensive mentorship and professional development overview',
  requiresAuth: true,
  permissions: ['dashboard:view']
})

// Stores
const authStore = useAuthStore()
const mentorsStore = useMentorsStore()
const router = useRouter()

// Component State
const isLoading = ref(true)
const currentTime = ref(new Date())
const selectedPeriod = ref('last_30_days')
const activeTab = ref('overview')

// Combined Dashboard Data
const dashboardData = ref({
  employee: {
    name: 'Sarah Njeri Kamau',
    role: 'Software Developer',
    department: 'Engineering',
    joinDate: '2023-01-15',
    avatar: '/images/avatars/sarah.jpg'
  },
  overview: {
    totalSessions: 48,
    totalHours: 72.5,
    activeMentors: 3,
    goalsCompleted: 12,
    averageRating: 4.7,
    monthlyGrowth: 23,
    goalCompletionRate: 75
  },
  analytics: {
    sessionTrends: [
      { month: 'Oct', sessions: 8, hours: 12 },
      { month: 'Nov', sessions: 12, hours: 18 },
      { month: 'Dec', sessions: 15, hours: 22.5 },
      { month: 'Jan', sessions: 13, hours: 20 }
    ],
    skillProgress: [
      { skill: 'Technical Leadership', current: 75, previous: 60, category: 'Leadership' },
      { skill: 'React/TypeScript', current: 90, previous: 75, category: 'Technical' },
      { skill: 'Public Speaking', current: 65, previous: 45, category: 'Communication' },
      { skill: 'Team Management', current: 55, previous: 40, category: 'Leadership' },
      { skill: 'System Design', current: 80, previous: 70, category: 'Technical' }
    ],
    mentorRatings: [
      { mentorName: 'Grace Wanjiku', sessions: 24, averageRating: 4.8, skills: ['React', 'Leadership'] },
      { mentorName: 'Joseph Ruto', sessions: 18, averageRating: 4.6, skills: ['Product', 'Strategy'] },
      { mentorName: 'Dr. Amina Hassan', sessions: 6, averageRating: 4.9, skills: ['Research', 'Academia'] }
    ],
    goalCompletion: {
      completed: 12,
      inProgress: 5,
      planned: 8,
      overdue: 2
    },
    timeDistribution: {
      technical: 45,
      leadership: 30,
      communication: 15,
      other: 10
    }
  },
  currentMentors: [
    {
      id: 'mentor-001',
      name: 'Grace Wanjiku Mwangi',
      role: 'Senior Software Engineer',
      company: 'Safaricom PLC',
      avatar: '/images/avatars/grace.jpg',
      expertise: ['Software Development', 'Leadership'],
      nextSession: '2024-01-20T10:00:00Z',
      relationshipDuration: '6 months'
    },
    {
      id: 'mentor-002', 
      name: 'Joseph Kiprotich Ruto',
      role: 'Product Manager',
      company: 'M-Pesa',
      avatar: '/images/avatars/joseph.jpg',
      expertise: ['Product Strategy', 'Career Growth'],
      nextSession: '2024-01-22T14:00:00Z',
      relationshipDuration: '3 months'
    }
  ],
  upcomingSessions: [
    {
      id: 'session-001',
      mentorName: 'Grace Wanjiku Mwangi',
      title: 'Code Review & Architecture Discussion',
      date: '2024-01-20T10:00:00Z',
      duration: 60,
      type: 'Video Call',
      status: 'confirmed'
    },
    {
      id: 'session-002',
      mentorName: 'Joseph Kiprotich Ruto', 
      title: 'Career Planning & Goal Setting',
      date: '2024-01-22T14:00:00Z',
      duration: 45,
      type: 'In-Person',
      status: 'confirmed'
    },
    {
      id: 'session-003',
      mentorName: 'Grace Wanjiku Mwangi',
      title: 'Technical Skills Assessment',
      date: '2024-01-25T09:00:00Z',
      duration: 90,
      type: 'Video Call',
      status: 'pending'
    }
  ],
  currentGoals: [
    {
      id: 'goal-001',
      title: 'Complete Advanced React Certification',
      description: 'Master advanced React patterns and state management',
      progress: 85,
      targetDate: '2024-02-15',
      category: 'Technical Skills',
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 'goal-002',
      title: 'Lead a Team Project',
      description: 'Successfully lead and deliver a team project',
      progress: 40,
      targetDate: '2024-03-30',
      category: 'Leadership',
      priority: 'Medium',
      status: 'In Progress'
    },
    {
      id: 'goal-003',
      title: 'Improve Public Speaking',
      description: 'Give 3 technical presentations to the team',
      progress: 67,
      targetDate: '2024-02-28',
      category: 'Soft Skills',
      priority: 'Medium',
      status: 'In Progress'
    }
  ],
  recentActivity: [
    {
      id: 'activity-001',
      type: 'session_completed',
      title: 'Completed session with Grace Wanjiku',
      description: 'Discussed React best practices and code architecture',
      timestamp: '2024-01-18T15:30:00Z',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'activity-002',
      type: 'goal_progress',
      title: 'Goal progress updated',
      description: 'Advanced React Certification - 85% complete',
      timestamp: '2024-01-17T11:20:00Z',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      id: 'activity-003',
      type: 'session_scheduled',
      title: 'New session scheduled',
      description: 'Career Planning session with Joseph Ruto',
      timestamp: '2024-01-16T09:15:00Z',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      id: 'activity-004',
      type: 'feedback_received',
      title: 'Feedback received',
      description: 'Grace provided feedback on your leadership skills',
      timestamp: '2024-01-15T16:45:00Z',
      icon: MessageSquare,
      color: 'text-orange-600'
    }
  ],
  recommendations: [
    {
      id: 'rec-001',
      type: 'mentor',
      title: 'Connect with a Leadership Mentor',
      description: 'Based on your goals, consider connecting with a senior leader in your field',
      action: 'Find Mentors',
      actionUrl: '/app/mentors',
      priority: 'High'
    },
    {
      id: 'rec-002',
      type: 'skill',
      title: 'Improve TypeScript Skills',
      description: 'Your mentors suggest focusing on advanced TypeScript patterns',
      action: 'View Resources',
      actionUrl: '/app/learning/typescript',
      priority: 'Medium'
    },
    {
      id: 'rec-003',
      type: 'networking',
      title: 'Attend Tech Meetup',
      description: 'Nairobi JavaScript Meetup this Thursday - great for networking',
      action: 'Learn More',
      actionUrl: '/app/events',
      priority: 'Low'
    }
  ]
})

// Computed Properties
const progressMetrics = computed(() => {
  const data = dashboardData.value.overview
  return [
    { label: 'Sessions', value: data.totalSessions, change: '+12%', trend: 'up' },
    { label: 'Hours', value: data.totalHours, change: '+8%', trend: 'up' },
    { label: 'Rating', value: data.averageRating, change: '+0.2', trend: 'up' },
    { label: 'Goals', value: `${data.goalCompletionRate}%`, change: '+15%', trend: 'up' }
  ]
})

const urgentTasks = computed(() => {
  const now = new Date()
  const upcoming = dashboardData.value.upcomingSessions.filter(session => {
    const sessionDate = new Date(session.date)
    const timeDiff = sessionDate.getTime() - now.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    return daysDiff <= 2 && daysDiff >= 0
  })
  return upcoming
})

const goalsByCategory = computed(() => {
  const goals = dashboardData.value.currentGoals
  const categories = [...new Set(goals.map(goal => goal.category))]
  return categories.map(category => ({
    category,
    goals: goals.filter(goal => goal.category === category),
    averageProgress: Math.round(
      goals.filter(goal => goal.category === category)
        .reduce((sum, goal) => sum + goal.progress, 0) / 
      goals.filter(goal => goal.category === category).length
    )
  }))
})

// Analytics Computed Properties
const skillCategories = computed(() => {
  const categories = [...new Set(dashboardData.value.analytics.skillProgress.map(skill => skill.category))]
  return categories.map(category => ({
    category,
    skills: dashboardData.value.analytics.skillProgress.filter(skill => skill.category === category),
    averageProgress: Math.round(
      dashboardData.value.analytics.skillProgress
        .filter(skill => skill.category === category)
        .reduce((sum, skill) => sum + skill.current, 0) /
      dashboardData.value.analytics.skillProgress.filter(skill => skill.category === category).length
    )
  }))
})

const topPerformingSkills = computed(() => {
  return dashboardData.value.analytics.skillProgress
    .sort((a, b) => (b.current - b.previous) - (a.current - a.previous))
    .slice(0, 3)
})

const periodOptions = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'last_year', label: 'Last Year' }
]

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeUntil = (dateString: string) => {
  const now = new Date()
  const target = new Date(dateString)
  const diff = target.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
  return 'soon'
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'text-red-600 bg-red-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

const formatGrowth = (current: number, previous: number) => {
  const growth = ((current - previous) / previous * 100).toFixed(1)
  return `${growth > 0 ? '+' : ''}${growth}%`
}

const getGrowthColor = (current: number, previous: number) => {
  return current > previous ? 'text-green-600' : 'text-red-600'
}

const navigateToMentors = () => {
  router.push('/app/mentors')
}

const navigateToSessions = () => {
  router.push('/app/mentors/sessions')
}

const navigateToGoals = () => {
  router.push('/app/development/goals')
}

const exportData = () => {
  console.log('Exporting dashboard data...')
}

// Initialize component
onMounted(async () => {
  try {
    // Load initial data
    await mentorsStore.initializeStore()
    
    // Update current time every minute
    setInterval(() => {
      currentTime.value = new Date()
    }, 60000)
    
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Welcome back, {{ dashboardData.employee.name }}!</h1>
        <p class="text-muted-foreground">
          {{ dashboardData.employee.role }} • {{ dashboardData.employee.department }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <Select v-model="selectedPeriod">
          <SelectTrigger class="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in periodOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" @click="exportData">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
        <div class="text-right">
          <p class="text-sm text-muted-foreground">{{ currentTime.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          <p class="text-lg font-semibold">{{ currentTime.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }) }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="metric in progressMetrics" :key="metric.label">
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <p class="text-sm font-medium text-muted-foreground">{{ metric.label }}</p>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold">{{ metric.value }}</p>
            <Badge :variant="metric.trend === 'up' ? 'default' : 'secondary'" class="text-xs">
              {{ metric.change }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Urgent Tasks Alert -->
    <Alert v-if="urgentTasks.length > 0" class="border-orange-200 bg-orange-50">
      <AlertCircle class="h-4 w-4 text-orange-600" />
      <AlertDescription class="text-orange-800">
        You have {{ urgentTasks.length }} upcoming session{{ urgentTasks.length > 1 ? 's' : '' }} in the next 2 days.
        <Button variant="link" class="p-0 h-auto text-orange-600" @click="navigateToSessions">
          View sessions
        </Button>
      </AlertDescription>
    </Alert>

    <!-- Main Dashboard Tabs -->
    <Tabs v-model="activeTab" default-value="overview" class="space-y-6">
      <TabsList class="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="mentors">Mentors</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <!-- Overview Tab -->
      <TabsContent value="overview" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Left Column - Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Current Mentors -->
            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-xl">Your Mentors</CardTitle>
                <Button variant="outline" size="sm" @click="navigateToMentors">
                  <Plus class="h-4 w-4 mr-2" />
                  Find More
                </Button>
              </CardHeader>
              <CardContent class="space-y-4">
                <div v-for="mentor in dashboardData.currentMentors" :key="mentor.id" 
                     class="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Avatar class="h-12 w-12">
                    <AvatarImage :src="mentor.avatar" :alt="mentor.name" />
                    <AvatarFallback>{{ mentor.name.split(' ').map(n => n[0]).join('') }}</AvatarFallback>
                  </Avatar>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-semibold">{{ mentor.name }}</h4>
                      <Badge variant="outline" class="text-xs">{{ mentor.relationshipDuration }}</Badge>
                    </div>
                    <p class="text-sm text-muted-foreground">{{ mentor.role }} at {{ mentor.company }}</p>
                    <div class="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock class="h-3 w-3" />
                      <span>Next: {{ formatDate(mentor.nextSession) }}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageSquare class="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Goals Progress -->
            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-xl">Current Goals</CardTitle>
                <Button variant="outline" size="sm" @click="navigateToGoals">
                  <Target class="h-4 w-4 mr-2" />
                  Manage Goals
                </Button>
              </CardHeader>
              <CardContent class="space-y-6">
                <div v-for="category in goalsByCategory" :key="category.category">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium">{{ category.category }}</h4>
                    <Badge variant="secondary">{{ category.averageProgress }}%</Badge>
                  </div>
                  <div class="space-y-3">
                    <div v-for="goal in category.goals" :key="goal.id" class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span class="font-medium">{{ goal.title }}</span>
                        <Badge :class="getPriorityColor(goal.priority)" class="text-xs">
                          {{ goal.priority }}
                        </Badge>
                      </div>
                      <Progress :model-value="goal.progress" class="h-2" />
                      <div class="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{{ goal.progress }}% complete</span>
                        <span>Due {{ formatDate(goal.targetDate) }}</span>
                      </div>
                    </div>
                  </div>
                  <Separator v-if="category !== goalsByCategory[goalsByCategory.length - 1]" class="mt-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Right Column - Sidebar -->
          <div class="space-y-6">
            <!-- Upcoming Sessions -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div v-for="session in dashboardData.upcomingSessions.slice(0, 3)" :key="session.id"
                     class="space-y-2 p-3 rounded-lg border">
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium text-sm">{{ session.title }}</h4>
                    <Badge :variant="session.status === 'confirmed' ? 'default' : 'secondary'" class="text-xs">
                      {{ session.status }}
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">with {{ session.mentorName }}</p>
                  <div class="flex items-center justify-between text-xs">
                    <span class="flex items-center space-x-1">
                      <Calendar class="h-3 w-3" />
                      <span>{{ formatDate(session.date) }}</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <Clock class="h-3 w-3" />
                      <span>{{ session.duration }}min</span>
                    </span>
                  </div>
                  <Button size="sm" variant="outline" class="w-full">
                    <PlayCircle class="h-3 w-3 mr-2" />
                    Join Session
                  </Button>
                </div>
                <Button variant="ghost" class="w-full" @click="navigateToSessions">
                  View All Sessions
                  <ArrowRight class="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <!-- Recommendations -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div v-for="rec in dashboardData.recommendations" :key="rec.id"
                     class="space-y-2 p-3 rounded-lg border">
                  <div class="flex items-start justify-between">
                    <h4 class="font-medium text-sm">{{ rec.title }}</h4>
                    <Badge :class="getPriorityColor(rec.priority)" class="text-xs">
                      {{ rec.priority }}
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">{{ rec.description }}</p>
                  <Button size="sm" variant="outline" class="w-full">
                    {{ rec.action }}
                    <ArrowRight class="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <!-- Analytics Tab -->
      <TabsContent value="analytics" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Skill Progress by Category -->
          <Card>
            <CardHeader>
              <CardTitle>Skill Progress by Category</CardTitle>
              <CardDescription>Your growth across different skill areas</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="categoryData in skillCategories" :key="categoryData.category">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-sm">{{ categoryData.category }}</h4>
                  <Badge variant="secondary">{{ categoryData.averageProgress }}%</Badge>
                </div>
                <div class="space-y-2">
                  <div v-for="skill in categoryData.skills" :key="skill.skill" class="space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span>{{ skill.skill }}</span>
                      <div class="flex items-center space-x-2">
                        <span>{{ skill.current }}%</span>
                        <span :class="getGrowthColor(skill.current, skill.previous)" class="font-medium">
                          {{ formatGrowth(skill.current, skill.previous) }}
                        </span>
                      </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${skill.current}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Session Trends -->
          <Card>
            <CardHeader>
              <CardTitle>Session Trends</CardTitle>
              <CardDescription>Your mentorship session activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="month in dashboardData.analytics.sessionTrends" :key="month.month" 
                     class="flex items-center space-x-4">
                  <div class="w-12 text-xs text-muted-foreground">{{ month.month }}</div>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center justify-between text-xs">
                      <span>Sessions: {{ month.sessions }}</span>
                      <span>Hours: {{ month.hours }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-500 h-2 rounded-full"
                        :style="{ width: `${(month.sessions / 20) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Top Performing Skills -->
          <Card>
            <CardHeader>
              <CardTitle>Fastest Growing Skills</CardTitle>
              <CardDescription>Skills with the most improvement this period</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="(skill, index) in topPerformingSkills" :key="skill.skill" 
                   class="flex items-center space-x-4 p-3 rounded-lg border">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-sm">{{ skill.skill }}</h4>
                  <p class="text-xs text-muted-foreground">{{ skill.category }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium">{{ skill.current }}%</p>
                  <p class="text-xs text-green-600">{{ formatGrowth(skill.current, skill.previous) }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Time Distribution -->
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution</CardTitle>
              <CardDescription>How you spend your mentorship time</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="(percentage, category) in dashboardData.analytics.timeDistribution" :key="category"
                   class="flex items-center justify-between">
                <span class="text-sm capitalize">{{ category }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      class="h-2 rounded-full"
                      :class="{
                        'bg-blue-500': category === 'technical',
                        'bg-green-500': category === 'leadership', 
                        'bg-orange-500': category === 'communication',
                        'bg-gray-500': category === 'other'
                      }"
                      :style="{ width: `${percentage}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ percentage }}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Mentors Tab -->
      <TabsContent value="mentors" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mentor Performance</CardTitle>
            <CardDescription>Your experience with each mentor</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="mentor in dashboardData.analytics.mentorRatings" :key="mentor.mentorName" 
                   class="flex items-center space-x-4 p-4 rounded-lg border">
                <div class="flex-1">
                  <h4 class="font-medium">{{ mentor.mentorName }}</h4>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-sm text-muted-foreground">{{ mentor.sessions }} sessions</span>
                    <Badge variant="outline" class="text-xs">{{ mentor.averageRating }} ⭐</Badge>
                  </div>
                  <div class="flex space-x-1 mt-2">
                    <Badge v-for="skill in mentor.skills" :key="skill" variant="secondary" class="text-xs">
                      {{ skill }}
                    </Badge>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold">{{ mentor.averageRating }}</p>
                  <p class="text-xs text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Goals Tab -->
      <TabsContent value="goals" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Goal Status Overview</CardTitle>
              <CardDescription>Your current goal completion status</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="(count, status) in dashboardData.analytics.goalCompletion" :key="status"
                   class="flex items-center justify-between p-3 rounded-lg border">
                <span class="text-sm capitalize">{{ status.replace(/([A-Z])/g, ' $1').trim() }}</span>
                <div class="flex items-center space-x-2">
                  <Badge 
                    :variant="status === 'completed' ? 'default' : status === 'overdue' ? 'destructive' : 'secondary'"
                    class="text-xs"
                  >
                    {{ count }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goal Completion Rate</CardTitle>
              <CardDescription>Your success rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex items-center justify-center">
                <div class="text-center">
                  <p class="text-4xl font-bold text-green-600">
                    {{ Math.round((dashboardData.analytics.goalCompletion.completed / (dashboardData.analytics.goalCompletion.completed + dashboardData.analytics.goalCompletion.inProgress + dashboardData.analytics.goalCompletion.planned)) * 100) }}%
                  </p>
                  <p class="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Activity Tab -->
      <TabsContent value="activity" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent mentorship activities and updates</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="activity in dashboardData.recentActivity" :key="activity.id"
                 class="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div :class="`p-2 rounded-full ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`">
                <component :is="activity.icon" :class="`h-4 w-4 ${activity.color}`" />
              </div>
              <div class="flex-1 space-y-1">
                <p class="font-medium">{{ activity.title }}</p>
                <p class="text-sm text-muted-foreground">{{ activity.description }}</p>
                <p class="text-xs text-muted-foreground">{{ getTimeUntil(activity.timestamp) }}</p>
              </div>
              <Badge variant="outline" class="text-xs">
                {{ activity.type.replace('_', ' ') }}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style> 