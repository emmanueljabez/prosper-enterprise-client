<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
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
  MessageSquare
} from 'lucide-vue-next'

definePageMeta({
  title: 'My Profile',
  description: 'Your professional profile and achievements',
  layout: 'default'
})

// Stores
const authStore = useAuthStore()
const toast = useAppToast()

// State
const activeTab = ref('overview')
const isEditingProfile = ref(false)
const profileForm = ref({
  name: 'Alex Morgan',
  title: 'Senior Software Engineer',
  company: 'TechFlow Solutions',
  bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Love mentoring junior developers and staying up-to-date with the latest technologies.',
  location: 'San Francisco, CA',
  email: 'alex.morgan@techflow.com',
  phone: '+1 (555) 123-4567',
  linkedin: 'https://linkedin.com/in/alexmorgan',
  website: 'https://alexmorgan.dev'
})

// Mock user data with gamification
const userProfile = ref({
  id: 'user-123',
  name: 'Alex Morgan',
  email: 'alex.morgan@techflow.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  title: 'Senior Software Engineer',
  company: 'TechFlow Solutions',
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

const saveProfile = () => {
  // TODO: Implement profile save
  toast.success('Profile updated successfully!')
  isEditingProfile.value = false
}

const uploadPhoto = () => {
  // TODO: Implement photo upload
  toast.info('Photo upload coming soon!')
}

// Lifecycle
onMounted(() => {
  console.log('👤 Loading profile page...')
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
                <AvatarImage :src="userProfile.avatar" :alt="userProfile.name" />
                <AvatarFallback class="text-lg">{{ userProfile.name.split(' ').map(n => n[0]).join('') }}</AvatarFallback>
              </Avatar>
              <Button 
                @click="uploadPhoto"
                size="sm" 
                variant="outline" 
                class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera class="h-4 w-4" />
              </Button>
            </div>
            <CardTitle>{{ userProfile.name }}</CardTitle>
            <p class="text-muted-foreground">{{ userProfile.title }}</p>
            <p class="text-sm text-muted-foreground">{{ userProfile.company }}</p>
          </CardHeader>
          
          <CardContent class="space-y-6">
            <!-- Level & XP -->
            <div class="text-center">
              <div class="flex items-center justify-center space-x-2 mb-2">
                <Crown class="h-5 w-5 text-yellow-600" />
                <span class="text-lg font-bold">Level {{ userProfile.level }}</span>
              </div>
              <Progress :value="progressToNextLevel" class="h-3 mb-2" />
              <p class="text-sm text-muted-foreground">
                {{ userProfile.xp }} / {{ userProfile.xpToNextLevel }} XP
              </p>
            </div>

            <!-- Streak -->
            <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <Flame class="h-5 w-5 text-orange-600" />
                <div>
                  <p class="font-semibold">{{ userProfile.streak }} days</p>
                  <p class="text-xs text-muted-foreground">Current streak</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">Best: {{ userProfile.longestStreak }}</p>
                <p class="text-xs text-muted-foreground">days</p>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <Calendar class="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p class="font-semibold">{{ userProfile.sessionCount }}</p>
                <p class="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <Users class="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p class="font-semibold">{{ userProfile.mentorCount }}</p>
                <p class="text-xs text-muted-foreground">Mentors</p>
              </div>
              <div class="text-center p-3 bg-purple-50 rounded-lg">
                <Clock class="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p class="font-semibold">{{ userProfile.hoursLearned }}h</p>
                <p class="text-xs text-muted-foreground">Learned</p>
              </div>
              <div class="text-center p-3 bg-yellow-50 rounded-lg">
                <Award class="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p class="font-semibold">{{ earnedAchievements.length }}</p>
                <p class="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2">
        <Tabs v-model="activeTab" class="space-y-6">
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <!-- Overview Tab -->
          <TabsContent value="overview" class="space-y-6">
            <!-- Recent Achievements -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <Sparkles class="h-5 w-5 text-yellow-600" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="achievement in earnedAchievements.slice(-4)" 
                    :key="achievement.id"
                    :class="[
                      'p-4 rounded-lg border-2 transition-colors',
                      getRarityColor(achievement.rarity)
                    ]"
                  >
                    <div class="flex items-start space-x-3">
                      <component :is="achievement.icon" class="h-6 w-6 mt-1" />
                      <div class="flex-1">
                        <h4 class="font-semibold">{{ achievement.title }}</h4>
                        <p class="text-sm opacity-80">{{ achievement.description }}</p>
                        <p class="text-xs mt-1">{{ formatTimeAgo(achievement.earnedDate) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Progress Overview -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <BarChart3 class="h-5 w-5 text-blue-600" />
                  <span>Learning Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="text-center">
                    <div class="relative w-20 h-20 mx-auto mb-3">
                      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-dasharray="85, 100"
                          class="text-blue-600"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-dasharray="0, 100"
                          class="text-gray-200"
                        />
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-lg font-bold">85%</span>
                      </div>
                    </div>
                    <p class="font-medium">Profile Completion</p>
                  </div>
                  
                  <div class="text-center">
                    <div class="relative w-20 h-20 mx-auto mb-3">
                      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-dasharray="72, 100"
                          class="text-green-600"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-dasharray="0, 100"
                          class="text-gray-200"
                        />
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-lg font-bold">72%</span>
                      </div>
                    </div>
                    <p class="font-medium">Monthly Goal</p>
                  </div>
                  
                  <div class="text-center">
                    <div class="relative w-20 h-20 mx-auto mb-3">
                      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-dasharray="89, 100"
                          class="text-orange-600"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-dasharray="0, 100"
                          class="text-gray-200"
                        />
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-lg font-bold">89%</span>
                      </div>
                    </div>
                    <p class="font-medium">Next Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Achievements Tab -->
          <TabsContent value="achievements" class="space-y-6">
            <!-- Earned Achievements -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <Trophy class="h-5 w-5 text-yellow-600" />
                    <span>Earned Achievements</span>
                  </div>
                  <Badge variant="secondary">{{ earnedAchievements.length }}/{{ userProfile.achievements.length }}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="achievement in earnedAchievements" 
                    :key="achievement.id"
                    :class="[
                      'p-4 rounded-lg border-2 transition-colors',
                      getRarityColor(achievement.rarity)
                    ]"
                  >
                    <div class="flex items-start space-x-3">
                      <component :is="achievement.icon" class="h-8 w-8 mt-1" />
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                          <h4 class="font-semibold">{{ achievement.title }}</h4>
                          <Badge :class="getRarityColor(achievement.rarity)" variant="outline" class="text-xs capitalize">
                            {{ achievement.rarity }}
                          </Badge>
                        </div>
                        <p class="text-sm opacity-80 mb-2">{{ achievement.description }}</p>
                        <div class="flex items-center space-x-2 text-xs">
                          <CheckCircle class="h-3 w-3" />
                          <span>Earned {{ formatTimeAgo(achievement.earnedDate) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Upcoming Achievements -->
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <Target class="h-5 w-5 text-blue-600" />
                  <span>Upcoming Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="achievement in upcomingAchievements" 
                    :key="achievement.id"
                    class="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 opacity-75"
                  >
                    <div class="flex items-start space-x-3">
                      <component :is="achievement.icon" class="h-8 w-8 mt-1 text-gray-400" />
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                          <h4 class="font-semibold text-gray-700">{{ achievement.title }}</h4>
                          <Badge variant="outline" class="text-xs capitalize">
                            {{ achievement.rarity }}
                          </Badge>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">{{ achievement.description }}</p>
                        <div class="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock class="h-3 w-3" />
                          <span>Not yet earned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Skills Tab -->
          <TabsContent value="skills" class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <GraduationCap class="h-5 w-5 text-purple-600" />
                  <span>Skill Progression</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div v-for="skill in userProfile.skills" :key="skill.name" class="space-y-2">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-medium">{{ skill.name }}</span>
                        <Badge variant="outline" class="ml-2 text-xs">{{ skill.category }}</Badge>
                      </div>
                      <span class="text-sm font-semibold">{{ skill.level }}%</span>
                    </div>
                    <Progress :value="skill.level" class="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Activity Tab -->
          <TabsContent value="activity" class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <BarChart3 class="h-5 w-5 text-green-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div 
                    v-for="activity in userProfile.recentActivity" 
                    :key="activity.timestamp"
                    class="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div class="p-2 bg-white rounded-full">
                      <component :is="getActivityIcon(activity.type)" class="h-5 w-5 text-blue-600" />
                    </div>
                    <div class="flex-1">
                      <p class="font-medium">{{ activity.description }}</p>
                      <p class="text-sm text-muted-foreground">{{ formatTimeAgo(activity.timestamp) }}</p>
                    </div>
                    <div class="text-right">
                      <div class="flex items-center space-x-1 text-green-600">
                        <ArrowUp class="h-4 w-4" />
                        <span class="font-semibold">+{{ activity.xpGained }} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <Dialog v-model:open="isEditingProfile">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-4">
            <div>
              <Label for="name">Full Name</Label>
              <Input id="name" v-model="profileForm.name" />
            </div>
            <div>
              <Label for="title">Job Title</Label>
              <Input id="title" v-model="profileForm.title" />
            </div>
            <div>
              <Label for="company">Company</Label>
              <Input id="company" v-model="profileForm.company" />
            </div>
            <div>
              <Label for="location">Location</Label>
              <Input id="location" v-model="profileForm.location" />
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <Label for="email">Email</Label>
              <Input id="email" v-model="profileForm.email" type="email" />
            </div>
            <div>
              <Label for="phone">Phone</Label>
              <Input id="phone" v-model="profileForm.phone" />
            </div>
            <div>
              <Label for="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" v-model="profileForm.linkedin" />
            </div>
            <div>
              <Label for="website">Website</Label>
              <Input id="website" v-model="profileForm.website" />
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
          <Button @click="saveProfile">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template> 