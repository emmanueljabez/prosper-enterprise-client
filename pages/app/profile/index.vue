<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useProfileStore } from '@/store/modules/profile'
import { useSubscriptionsStore } from '@/store/modules/subscriptions'
import invoicesApi, { type PublicInvoice } from '@/http/requests/app/invoices'
import { useAppToast } from '@/composables/services/toastService'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Icons
import {
  User,
  Award,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  Medal,
  Flame,
  BookOpen,
  Users,
  Clock,
  BarChart3,
  Edit3,
  Camera,
  Shield,
  Crown,
  Sparkles,
  CheckCircle,
  ArrowUp,
  GitBranch,
  Briefcase,
  GraduationCap,
  Heart,
  MessageSquare,
  CreditCard,
  X,
  Check
} from 'lucide-vue-next'

definePageMeta({
  title: 'My Profile',
  description: 'Your professional profile and achievements',
  layout: 'default'
})

// Stores
const authStore = useAuthStore()
const profileStore = useProfileStore()
const subscriptionsStore = useSubscriptionsStore()
const toast = useAppToast()

// State
const activeTab = ref('overview')
const accountTab = ref('subscription')
const isEditingProfile = ref(false)
const isLoadingInvoices = ref(false)
const isRenewingSubscription = ref(false)
const isUpdatingAutoRenew = ref(false)
const isCancellingSubscription = ref(false)
const billingInvoices = ref<PublicInvoice[]>([])
const billingError = ref('')
const profileForm = ref({
  name: '',
  title: '',
  company: '',
  bio: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  website: ''
})

// Mock user data with gamification
const userProfile = ref({
  id: '',
  name: '',
  email: '',
  avatar: '',
  title: '',
  company: '',
  level: 12,
  xp: 2850,
  xpToNextLevel: 3200,
  totalXP: 12850,
  streak: 15, // days
  longestStreak: 28,
  joinedDate: new Date('2023-08-15'),
  sessionCount: 24,
  mentorCount: 6,
  hoursLearned: 48.5,
  
  // Achievements
  achievements: [
    {
      id: 'first-session',
      title: 'First Steps',
      description: 'Completed your first mentoring session',
      icon: BookOpen,
      earned: true,
      earnedDate: new Date('2023-08-20'),
      rarity: 'common'
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintained a 7-day learning streak',
      icon: Flame,
      earned: true,
      earnedDate: new Date('2023-09-15'),
      rarity: 'common'
    },
    {
      id: 'session-10',
      title: 'Committed Learner',
      description: 'Completed 10 mentoring sessions',
      icon: Medal,
      earned: true,
      earnedDate: new Date('2023-10-22'),
      rarity: 'uncommon'
    },
    {
      id: 'multi-mentor',
      title: 'Diverse Network',
      description: 'Worked with 5 different mentors',
      icon: Users,
      earned: true,
      earnedDate: new Date('2023-11-10'),
      rarity: 'uncommon'
    },
    {
      id: 'feedback-champion',
      title: 'Feedback Champion',
      description: 'Provided detailed feedback for 15 sessions',
      icon: Star,
      earned: true,
      earnedDate: new Date('2023-12-05'),
      rarity: 'rare'
    },
    {
      id: 'streak-30',
      title: 'Consistency Master',
      description: 'Maintained a 30-day learning streak',
      icon: Crown,
      earned: false,
      rarity: 'legendary'
    },
    {
      id: 'session-50',
      title: 'Dedication Expert',
      description: 'Completed 50 mentoring sessions',
      icon: Trophy,
      earned: false,
      rarity: 'epic'
    }
  ],

  // Skills progression
  skills: [
    { name: 'JavaScript', level: 85, category: 'Programming' },
    { name: 'React', level: 78, category: 'Frontend' },
    { name: 'Node.js', level: 72, category: 'Backend' },
    { name: 'Leadership', level: 45, category: 'Soft Skills' },
    { name: 'System Design', level: 65, category: 'Architecture' },
    { name: 'Communication', level: 82, category: 'Soft Skills' }
  ],

  // Recent activity
  recentActivity: [
    {
      type: 'session_completed',
      description: 'Completed session with Sarah Johnson',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      xpGained: 150
    },
    {
      type: 'achievement_earned',
      description: 'Earned "Feedback Champion" achievement',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      xpGained: 250
    },
    {
      type: 'streak_milestone',
      description: 'Reached 15-day learning streak',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      xpGained: 100
    },
    {
      type: 'skill_improved',
      description: 'Leadership skill increased to level 45',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      xpGained: 75
    }
  ]
})

// Computed properties
const progressToNextLevel = computed(() => {
  return (userProfile.value.xp / userProfile.value.xpToNextLevel) * 100
})

const earnedAchievements = computed(() => {
  return userProfile.value.achievements.filter(achievement => achievement.earned)
})

const upcomingAchievements = computed(() => {
  return userProfile.value.achievements.filter(achievement => !achievement.earned)
})

const getRarityColor = (rarity) => {
  const colors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    uncommon: 'bg-green-100 text-green-800 border-green-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  }
  return colors[rarity] || colors.common
}

const getActivityIcon = (type) => {
  const icons = {
    session_completed: Calendar,
    achievement_earned: Award,
    streak_milestone: Flame,
    skill_improved: TrendingUp
  }
  return icons[type] || BookOpen
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Helper function to get user ID from localStorage
const getUserIdFromStorage = () => {
  if (typeof window !== 'undefined') {
    const loggedInUserStr = localStorage.getItem('loggedInUser')
    if (loggedInUserStr) {
      try {
        const loggedInUser = JSON.parse(loggedInUserStr)
        return loggedInUser.id
      } catch (error) {
        console.error('Error parsing loggedInUser from localStorage:', error)
        return null
      }
    }
  }
  return null
}

// Computed properties for real profile data
const realUserProfile = computed(() => profileStore.profile)
const isLoadingProfile = computed(() => profileStore.isLoading)
const activeSubscription = computed(() => subscriptionsStore.activeSubscription)
const activeSubscriptionContext = computed(() => subscriptionsStore.activeSubscriptionContext)
const isLoadingSubscription = computed(() => subscriptionsStore.isLoadingActiveSubscription)
const isCorporateSponsored = computed(() => activeSubscriptionContext.value?.subscriptionSource === 'CORPORATE')
const sponsoredCompanyName = computed(() =>
  activeSubscriptionContext.value?.companySubscription?.company?.name ||
  realUserProfile.value?.company?.name ||
  'your company',
)
const nextBillingDate = computed(() =>
  activeSubscriptionContext.value?.nextBillingDate ||
  activeSubscription.value?.currentPeriodEnd ||
  activeSubscription.value?.endDate ||
  null,
)
const remainingSessions = computed(() =>
  activeSubscriptionContext.value?.remainingSessions ??
  activeSubscription.value?.remainingSessionsCount ??
  0,
)
const subscriptionPriceLabel = computed(() => {
  if (!activeSubscription.value?.plan) {
    return '—'
  }

  const plan = activeSubscription.value.plan
  const billingInterval = activeSubscription.value.billingInterval || 'MONTHLY'
  const amount = billingInterval === 'ANNUAL' && Number(plan.yearlyCost || 0) > 0
    ? Number(plan.yearlyCost || 0)
    : Number(plan.cost || 0)

  if (amount === 0) {
    return 'Free'
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: plan.currency || 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
})
const subscriptionBillingLabel = computed(() => {
  if (!activeSubscription.value?.plan) {
    return ''
  }

  const billingInterval = activeSubscription.value.billingInterval || 'MONTHLY'
  if (billingInterval === 'ANNUAL') {
    return 'per year'
  }

  return `per ${activeSubscription.value.plan.durationMonths} month${activeSubscription.value.plan.durationMonths > 1 ? 's' : ''}`
})
const sessionUsagePercent = computed(() => {
  if (!activeSubscription.value) {
    return 0
  }
  if (activeSubscription.value.plan.unlimited) {
    return 100
  }
  return activeSubscription.value.sessionsPerMonth > 0
    ? (activeSubscription.value.sessionsUsed / activeSubscription.value.sessionsPerMonth) * 100
    : 0
})

// Merge real profile data with mock userProfile for display
const displayProfile = computed(() => {
  if (realUserProfile.value) {
    return {
      ...userProfile.value,
      id: realUserProfile.value.id,
      name: `${realUserProfile.value.firstName} ${realUserProfile.value.lastName}`,
      email: realUserProfile.value.email,
      avatar: realUserProfile.value.avatarUrl,
      title: realUserProfile.value.role,
      company: realUserProfile.value.company?.name || realUserProfile.value.industry || userProfile.value.company
    }
  }
  return userProfile.value
})

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const getSubscriptionStatusClass = (status: string) => {
  if (status === 'ACTIVE') {
    return 'bg-green-600 text-white'
  }
  if (status === 'PENDING' || status === 'PENDING_PAYMENT' || status === 'TRIAL') {
    return 'bg-yellow-600 text-white'
  }
  if (status === 'SUSPENDED') {
    return 'bg-amber-600 text-white'
  }
  if (status === 'EXPIRED' || status === 'CANCELLED') {
    return 'bg-red-600 text-white'
  }
  return 'bg-gray-600 text-white'
}

const formatCardSummary = (cardType?: string | null, lastFour?: string | null) => {
  if (!cardType && !lastFour) {
    return 'Card on file'
  }
  if (cardType && lastFour) {
    return `${cardType} •••• ${lastFour}`
  }
  if (lastFour) {
    return `Card •••• ${lastFour}`
  }
  return cardType || 'Card on file'
}

const formatInvoiceAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'KES',
      maximumFractionDigits: 2
    }).format(Number(amount || 0))
  } catch {
    return `${currency || 'KES'} ${amount || 0}`
  }
}

const getInvoiceStatusClass = (status: string) => {
  if (status === 'PAID') {
    return 'bg-green-600 text-white'
  }
  if (status === 'OPEN') {
    return 'bg-blue-600 text-white'
  }
  if (status === 'FAILED' || status === 'VOID' || status === 'EXPIRED') {
    return 'bg-red-600 text-white'
  }
  return 'bg-gray-600 text-white'
}

const fetchUserInvoices = async (userId: string) => {
  isLoadingInvoices.value = true
  billingError.value = ''

  try {
    const response = await invoicesApi.getUserInvoices(userId)
    if (!response.success) {
      throw new Error(response.message || 'Failed to load billing invoices')
    }
    billingInvoices.value = response.data || []
  } catch (error: any) {
    billingError.value = error?.response?.data?.message || error?.message || 'Failed to load billing invoices'
    billingInvoices.value = []
  } finally {
    isLoadingInvoices.value = false
  }
}

const reloadBillingInvoices = async () => {
  const userId = getUserIdFromStorage()
  if (!userId) {
    toast.error('User ID not found. Please log in again.')
    return
  }
  await fetchUserInvoices(userId)
}

const goToPaymentUrl = (url: string) => {
  if (!url) {
    return
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.location.assign(url)
    return
  }

  const normalized = url.startsWith('/') ? url : `/${url}`
  window.location.assign(`${window.location.origin}${normalized}`)
}

const renewSubscriptionNow = async () => {
  const userId = getUserIdFromStorage()
  if (!userId) {
    toast.error('User ID not found. Please log in again.')
    return
  }

  isRenewingSubscription.value = true
  try {
    const result = await subscriptionsStore.renewNow(userId)
    if (!result) {
      toast.error(subscriptionsStore.error || 'Failed to initiate renewal')
      return
    }

    if (result.requiresManualPayment && result.paymentUrl) {
      toast.success('Renewal invoice is ready. Redirecting to payment...')
      await fetchUserInvoices(userId)
      goToPaymentUrl(result.paymentUrl)
      return
    }

    if (result.renewed) {
      toast.success('Subscription renewed successfully')
      await Promise.all([
        subscriptionsStore.fetchActiveSubscription(userId),
        fetchUserInvoices(userId)
      ])
      return
    }

    toast.error(subscriptionsStore.error || 'Unable to renew subscription at this time')
  } finally {
    isRenewingSubscription.value = false
  }
}

const toggleAutoRenew = async () => {
  const userId = getUserIdFromStorage()
  if (!userId) {
    toast.error('User ID not found. Please log in again.')
    return
  }
  if (!activeSubscription.value) {
    toast.error('No active subscription found')
    return
  }

  isUpdatingAutoRenew.value = true
  try {
    const targetState = !activeSubscription.value.autoRenew
    const updated = await subscriptionsStore.updateAutoRenewPreference(userId, targetState)
    if (!updated) {
      toast.error(subscriptionsStore.error || 'Failed to update auto-renew setting')
      return
    }

    toast.success(targetState ? 'Auto-renew enabled' : 'Auto-renew disabled')
  } finally {
    isUpdatingAutoRenew.value = false
  }
}

const cancelSubscription = async () => {
  const userId = getUserIdFromStorage()
  if (!userId) {
    toast.error('User ID not found. Please log in again.')
    return
  }
  if (!activeSubscription.value) {
    toast.error('No active subscription found')
    return
  }

  const confirmed = window.confirm('Cancel your active subscription? You can still renew manually later.')
  if (!confirmed) {
    return
  }

  isCancellingSubscription.value = true
  try {
    const cancelled = await subscriptionsStore.cancelActiveSubscription(userId)
    if (!cancelled) {
      toast.error(subscriptionsStore.error || 'Failed to cancel subscription')
      return
    }

    toast.success('Subscription cancelled successfully')
    await Promise.all([
      subscriptionsStore.fetchActiveSubscription(userId),
      fetchUserInvoices(userId)
    ])
  } finally {
    isCancellingSubscription.value = false
  }
}

const saveProfile = async () => {
  const userId = getUserIdFromStorage()
  if (!userId) {
    toast.error('User ID not found. Please log in again.')
    return
  }

  try {
    // Extract only the fields we need to update
    const updateData = {
      firstName: profileForm.value.name.split(' ')[0],
      lastName: profileForm.value.name.split(' ').slice(1).join(' '),
      bio: profileForm.value.bio,
      location: profileForm.value.location,
      phone: profileForm.value.phone,
      linkedinUrl: profileForm.value.linkedin,
      industry: profileForm.value.company
    }

    await profileStore.updateProfile(userId, updateData)
    toast.success('Profile updated successfully!')
    isEditingProfile.value = false
  } catch (error: any) {
    toast.error(error.message || 'Failed to update profile')
  }
}

const uploadPhoto = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const userId = getUserIdFromStorage()
  if (!userId) {
    toast.error('User ID not found. Please log in again.')
    return
  }

  try {
    await profileStore.uploadAvatar(userId, file)
    toast.success('Profile photo updated successfully!')
  } catch (error: any) {
    toast.error(error.message || 'Failed to upload photo')
  }
}

// Lifecycle
onMounted(async () => {
  console.log('👤 Loading profile page...')

  const userId = getUserIdFromStorage()
  if (!userId) {
    console.warn('User ID not found in localStorage')
    return
  }

  try {
    // Fetch user profile and active subscription
    await Promise.all([
      profileStore.fetchProfile(userId),
      subscriptionsStore.fetchActiveSubscription(userId),
      fetchUserInvoices(userId)
    ])

    // Update form with real profile data
    if (realUserProfile.value) {
      profileForm.value = {
        name: `${realUserProfile.value.firstName} ${realUserProfile.value.lastName}`,
        title: realUserProfile.value.role,
        company: realUserProfile.value.industry || '',
        bio: realUserProfile.value.bio || '',
        location: realUserProfile.value.location || '',
        email: realUserProfile.value.email,
        phone: realUserProfile.value.phone,
        linkedin: realUserProfile.value.linkedinUrl || '',
        website: ''
      }
    }
  } catch (error: any) {
    console.error('Error loading profile data:', error)
    toast.error('Failed to load profile data')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">My Profile</h1>
        <p class="text-muted-foreground">
          Manage your profile and track your learning journey
        </p>
      </div>
      <Button @click="isEditingProfile = true" variant="outline">
        <Edit3 class="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Summary Card -->
      <div class="lg:col-span-1">
        <Card>
          <CardHeader class="text-center">
            <div class="relative mx-auto w-24 h-24 mb-4">
              <Avatar class="w-24 h-24">
                <AvatarImage :src="displayProfile.avatar" :alt="displayProfile.name" />
                <AvatarFallback class="text-lg">{{ displayProfile.name.split(' ').map(n => n[0]).join('') }}</AvatarFallback>
              </Avatar>
              <label
                for="avatar-upload"
                class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 cursor-pointer bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Camera class="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="uploadPhoto"
                  :disabled="isLoadingProfile"
                />
              </label>
            </div>
            <CardTitle>{{ displayProfile.name }}</CardTitle>
            <p class="text-muted-foreground">{{ displayProfile.title }}</p>
            <p class="text-sm text-muted-foreground">{{ displayProfile.company }}</p>
          </CardHeader>
          
          <CardContent class="space-y-4">
            <!-- Contact Information -->
            <div class="space-y-3">
              <div class="text-sm">
                <p class="font-semibold text-muted-foreground">Email</p>
                <p class="break-all">{{ displayProfile.email }}</p>
              </div>

              <div class="text-sm">
                <p class="font-semibold text-muted-foreground">Phone</p>
                <p>{{ realUserProfile?.phone || 'N/A' }}</p>
              </div>

              <div class="text-sm" v-if="realUserProfile?.location">
                <p class="font-semibold text-muted-foreground">Location</p>
                <p>{{ realUserProfile.location }}</p>
              </div>

              <div class="text-sm" v-if="realUserProfile?.linkedinUrl">
                <p class="font-semibold text-muted-foreground">LinkedIn</p>
                <a :href="realUserProfile.linkedinUrl" target="_blank" class="text-blue-600 hover:underline break-all">
                  View Profile
                </a>
              </div>

              <div class="text-sm" v-if="realUserProfile?.bio">
                <p class="font-semibold text-muted-foreground">Bio</p>
                <p class="text-muted-foreground">{{ realUserProfile.bio }}</p>
              </div>
            </div>

            <Separator />

            <!-- Account Status -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Account Status</span>
                <Badge v-if="realUserProfile?.isVerified" variant="default" class="bg-green-600">
                  <CheckCircle class="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Member Since</span>
                <span class="font-medium" v-if="realUserProfile?.createdAt">
                  {{ new Date(realUserProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2">
        <Card>
          <Tabs v-model="accountTab" class="w-full">
            <CardHeader>
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="subscription" class="mt-0">
                <div class="mb-4">
                  <CardTitle class="flex items-center space-x-2">
                    <CreditCard class="h-5 w-5 text-purple-600" />
                    <span>My Subscription</span>
                  </CardTitle>
                </div>

                <div v-if="isLoadingSubscription" class="text-center py-12">
                  <p class="text-muted-foreground">Loading subscription...</p>
                </div>

                <div v-else-if="!activeSubscription" class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CreditCard class="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">No Active Subscription</h3>
                  <p class="text-muted-foreground mb-6">
                    You don't have an active subscription. Subscribe to a plan to get started with mentorship sessions.
                  </p>
                  <Button @click="() => navigateTo('/app/plans')">
                    Browse Plans
                  </Button>
                </div>

                <div v-else class="space-y-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Badge
                        :variant="activeSubscription.status === 'ACTIVE' ? 'default' : 'secondary'"
                        :class="getSubscriptionStatusClass(activeSubscription.status)"
                      >
                        {{ activeSubscription.status }}
                      </Badge>
                      <Badge v-if="isCorporateSponsored" variant="secondary" class="bg-[#f7e6f4] text-[#7f2f75]">
                        Sponsored by {{ sponsoredCompanyName }}
                      </Badge>
                    </div>
                    <span class="text-sm text-muted-foreground">
                      {{ isCorporateSponsored ? 'Managed by your company admin' : (activeSubscription.autoRenew ? 'Auto-renewal enabled' : 'Auto-renewal disabled') }}
                    </span>
                  </div>

                  <div class="border rounded-lg p-6">
                    <div class="flex items-start justify-between mb-6">
                      <div>
                        <h3 class="text-2xl font-bold flex items-center space-x-2">
                          <Crown v-if="activeSubscription.plan.code === 'PREMIUM'" class="h-6 w-6 text-yellow-600" />
                          <span>{{ activeSubscription.plan.name }}</span>
                        </h3>
                        <p class="text-muted-foreground mt-2">{{ activeSubscription.plan.description }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-3xl font-bold">
                          {{ isCorporateSponsored ? 'Sponsored access' : subscriptionPriceLabel }}
                        </p>
                        <p class="text-sm text-muted-foreground">
                          {{
                            isCorporateSponsored
                              ? `${sponsoredCompanyName} covers this plan`
                              : subscriptionBillingLabel
                          }}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div class="flex items-center space-x-3 text-sm">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                          <Calendar class="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p class="text-muted-foreground">Start Date</p>
                          <p class="font-semibold">{{ formatDate(activeSubscription.startDate) }}</p>
                        </div>
                      </div>

                      <div class="flex items-center space-x-3 text-sm">
                        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                          <Calendar class="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p class="text-muted-foreground">Next Billing Date</p>
                          <p class="font-semibold">{{ formatDate(nextBillingDate || activeSubscription.endDate) }}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="!isCorporateSponsored"
                      class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <h4 class="font-semibold text-sm mb-3">Billing Automation</h4>
                      <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between">
                          <span class="text-muted-foreground">Auto-renew</span>
                          <span class="font-medium">
                            {{ activeSubscription.autoRenew ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-muted-foreground">Card on file</span>
                          <span class="font-medium">
                            {{
                              activeSubscription.autoRenewCardOnFile
                                ? formatCardSummary(activeSubscription.autoRenewCardType, activeSubscription.autoRenewCardLastFour)
                                : 'Not available'
                            }}
                          </span>
                        </div>
                        <div v-if="activeSubscription.autoRenewLastChargeAt" class="flex items-center justify-between">
                          <span class="text-muted-foreground">Last successful charge</span>
                          <span class="font-medium">{{ formatDateTime(activeSubscription.autoRenewLastChargeAt) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-muted-foreground">Next billing date</span>
                          <span class="font-medium">{{ formatDate(nextBillingDate || activeSubscription.endDate) }}</span>
                        </div>
                        <div v-if="activeSubscription.autoRenewLastFailureReason" class="rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-700">
                          {{ activeSubscription.autoRenewLastFailureReason }}
                        </div>
                      </div>
                    </div>

                    <div v-if="!isCorporateSponsored" class="mb-6 flex flex-wrap gap-3">
                      <Button
                        variant="default"
                        :disabled="isRenewingSubscription || isLoadingSubscription"
                        @click="renewSubscriptionNow"
                      >
                        {{ isRenewingSubscription ? 'Preparing renewal...' : 'Renew Now' }}
                      </Button>
                      <Button
                        variant="outline"
                        :disabled="isUpdatingAutoRenew || isLoadingSubscription"
                        @click="toggleAutoRenew"
                      >
                        {{
                          isUpdatingAutoRenew
                            ? 'Updating...'
                            : activeSubscription.autoRenew
                              ? 'Disable Auto-renew'
                              : 'Enable Auto-renew'
                        }}
                      </Button>
                      <Button
                        variant="outline"
                        class="border-red-200 text-red-600 hover:bg-red-50"
                        :disabled="isCancellingSubscription || isLoadingSubscription"
                        @click="cancelSubscription"
                      >
                        {{ isCancellingSubscription ? 'Cancelling...' : 'Cancel Subscription' }}
                      </Button>
                    </div>

                    <div
                      v-else
                      class="mb-6 rounded-lg border border-[#edd3e8] bg-[#fcf5fa] p-4 text-sm text-[#7f2f75]"
                    >
                      <p class="font-semibold">Company-sponsored subscription</p>
                      <p class="mt-1">
                        This plan is sponsored by {{ sponsoredCompanyName }}. Renewal, seat assignment, and billing are managed by your company admin.
                      </p>
                    </div>

                    <div class="mb-6">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium">Sessions Usage</span>
                        <span class="text-sm text-muted-foreground">
                          {{ activeSubscription.sessionsUsed }} / {{ activeSubscription.sessionsPerMonth }}
                          {{ activeSubscription.plan.unlimited ? '(Unlimited)' : '' }}
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          class="bg-blue-600 h-2.5 rounded-full transition-all"
                          :style="{
                            width: `${sessionUsagePercent}%`
                          }"
                        ></div>
                      </div>
                      <p class="text-sm text-muted-foreground mt-2">
                        {{ remainingSessions }} session{{ remainingSessions !== 1 ? 's' : '' }} remaining
                      </p>
                    </div>

                    <div v-if="activeSubscription.plan.planFeatures && activeSubscription.plan.planFeatures.length > 0">
                      <h4 class="font-semibold text-sm mb-3">Plan Features</h4>
                      <ul class="space-y-2">
                        <li
                          v-for="feature in activeSubscription.plan.planFeatures"
                          :key="feature.id"
                          class="flex items-center space-x-2 text-sm"
                        >
                          <Check v-if="feature.enabled" class="h-4 w-4 text-green-600 flex-shrink-0" />
                          <X v-else class="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span :class="{ 'text-muted-foreground': !feature.enabled }">
                            {{ feature.feature.name }}
                            <span v-if="feature.unlimited" class="text-blue-600 font-medium">(Unlimited)</span>
                            <span v-else-if="feature.limitValue" class="text-muted-foreground">
                              ({{ feature.limitValue }} {{ feature.feature.type }})
                            </span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" class="mt-0">
                <div class="mb-4 flex items-center justify-between">
                  <CardTitle class="flex items-center space-x-2">
                    <CreditCard class="h-5 w-5 text-purple-600" />
                    <span>Billing</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" @click="reloadBillingInvoices" :disabled="isLoadingInvoices">
                    {{ isLoadingInvoices ? 'Refreshing...' : 'Refresh' }}
                  </Button>
                </div>

                <div v-if="isLoadingInvoices" class="text-center py-12">
                  <p class="text-muted-foreground">Loading invoices...</p>
                </div>

                <div v-else-if="billingError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {{ billingError }}
                </div>

                <div v-else-if="billingInvoices.length === 0" class="text-center py-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CreditCard class="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 class="text-lg font-semibold mb-2">No Billing Records</h3>
                  <p class="text-muted-foreground">
                    Invoices raised for your account will appear here.
                  </p>
                </div>

                <div v-else class="border rounded-lg overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-gray-50 border-b">
                        <tr>
                          <th class="text-left px-4 py-3 font-semibold">Invoice #</th>
                          <th class="text-left px-4 py-3 font-semibold">Description</th>
                          <th class="text-left px-4 py-3 font-semibold">Amount</th>
                          <th class="text-left px-4 py-3 font-semibold">Status</th>
                          <th class="text-left px-4 py-3 font-semibold">Created</th>
                          <th class="text-left px-4 py-3 font-semibold">Paid</th>
                          <th class="text-right px-4 py-3 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="invoice in billingInvoices" :key="invoice.id" class="border-b last:border-b-0">
                          <td class="px-4 py-3 font-medium">{{ invoice.invoiceNumber }}</td>
                          <td class="px-4 py-3 text-muted-foreground">
                            {{ invoice.description || 'Invoice payment' }}
                          </td>
                          <td class="px-4 py-3">
                            {{ formatInvoiceAmount(invoice.amount, invoice.currency) }}
                          </td>
                          <td class="px-4 py-3">
                            <Badge :class="getInvoiceStatusClass(invoice.status)">
                              {{ invoice.status }}
                            </Badge>
                          </td>
                          <td class="px-4 py-3">{{ formatDate(invoice.createdAt) }}</td>
                          <td class="px-4 py-3">{{ invoice.paidAt ? formatDate(invoice.paidAt) : 'N/A' }}</td>
                          <td class="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              :variant="invoice.status === 'OPEN' ? 'default' : 'outline'"
                              @click="navigateTo(`/payment/invoice/${invoice.publicToken}`)"
                            >
                              {{ invoice.status === 'OPEN' ? 'Pay Now' : 'View' }}
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Dialog v-model:open="isEditingProfile">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-4">
            <div>
              <Label for="name">Full Name</Label>
              <Input id="name" v-model="profileForm.name" />
            </div>
            <div>
              <Label for="company">Industry</Label>
              <Input id="company" v-model="profileForm.company" />
            </div>
            <div>
              <Label for="location">Location</Label>
              <Input id="location" v-model="profileForm.location" />
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <Label for="phone">Phone</Label>
              <Input id="phone" v-model="profileForm.phone" />
            </div>
            <div>
              <Label for="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" v-model="profileForm.linkedin" />
            </div>
          </div>
        </div>

        <div class="mt-4">
          <Label for="bio">Bio</Label>
          <Textarea
            id="bio"
            v-model="profileForm.bio"
            rows="3"
            placeholder="Tell us about yourself..."
          />
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isEditingProfile = false">
            Cancel
          </Button>
          <Button @click="saveProfile" :disabled="profileStore.isLoading">
            {{ profileStore.isLoading ? 'Saving...' : 'Save Changes' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
