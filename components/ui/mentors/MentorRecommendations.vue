<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type {
  MentorProfile,
  MentorMatchingCriteria,
  MentorRecommendation,
  CommunicationStyle,
  SessionType
} from '@/types/mentor'
import { useMentorsStore } from '@/store/modules/mentors'
import { useMentorDiscoveryService } from '@/composables/services/mentorDiscoveryService'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import { 
  Star, 
  Clock, 
  DollarSign, 
  Users,
  Video,
  Phone,
  MessageCircle,
  Globe,
  Shield,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Target,
  Briefcase,
  Gauge,
  MessageSquare,
  Calendar,
  Languages
} from 'lucide-vue-next'

interface Props {
  showCriteria?: boolean
  presetCriteria?: Partial<MentorMatchingCriteria>
  maxRecommendations?: number
  showMatchDetails?: boolean
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCriteria: true,
  presetCriteria: () => ({}),
  maxRecommendations: 6,
  showMatchDetails: true,
  autoLoad: false
})

const emit = defineEmits<{
  'select-mentor': [mentorId: string]
  'update-criteria': [criteria: MentorMatchingCriteria]
}>()

// Store and Services
const mentorsStore = useMentorsStore()
const discoveryService = useMentorDiscoveryService()

// Component state
const isLoading = ref(false)
const error = ref<string | null>(null)
const recommendations = ref<MentorRecommendation[]>([])

// Matching criteria state
const criteria = ref<MentorMatchingCriteria>({
  goals: [],
  currentRole: '',
  industry: '',
  experienceLevel: 'mid',
  skillsToLearn: [],
  preferredCommunicationStyle: [],
  availabilityPreferences: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredTimes: [],
    frequency: 'weekly',
    preferredLanguages: ['English']
  },
  budgetRange: {
    min: 50,
    max: 200,
    currency: 'USD'
  },
  sessionPreferences: [],
  mentorPreferences: {}
})

// Available options
const experienceLevels = [
  { value: 'entry', label: 'Entry Level (0-3 years)' },
  { value: 'mid', label: 'Mid Level (3-7 years)' },
  { value: 'senior', label: 'Senior Level (7-12 years)' },
  { value: 'executive', label: 'Executive Level (12+ years)' }
]

const communicationStyles: { value: CommunicationStyle; label: string }[] = [
  { value: 'direct', label: 'Direct and Straightforward' },
  { value: 'supportive', label: 'Supportive and Encouraging' },
  { value: 'analytical', label: 'Analytical and Detailed' },
  { value: 'collaborative', label: 'Collaborative and Interactive' },
  { value: 'structured', label: 'Structured and Methodical' },
  { value: 'flexible', label: 'Flexible and Adaptive' }
]

const sessionTypes: { value: SessionType; label: string; icon: any }[] = [
  { value: 'video_call', label: 'Video Call', icon: Video },
  { value: 'phone_call', label: 'Phone Call', icon: Phone },
  { value: 'chat_only', label: 'Chat Only', icon: MessageCircle },
  { value: 'screen_sharing', label: 'Screen Sharing', icon: Globe },
  { value: 'code_review', label: 'Code Review', icon: Users },
  { value: 'presentation', label: 'Presentation', icon: Users },
  { value: 'workshop', label: 'Workshop', icon: Users },
  { value: 'office_hours', label: 'Office Hours', icon: Calendar }
]

const frequencies = [
  { value: 'weekly', label: 'Weekly Sessions' },
  { value: 'biweekly', label: 'Bi-weekly Sessions' },
  { value: 'monthly', label: 'Monthly Sessions' }
]

const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Portuguese', 'Italian', 'Dutch', 'Korean'
]

// Computed properties
const hasValidCriteria = computed(() => {
  return criteria.value.goals.length > 0 &&
         criteria.value.skillsToLearn.length > 0 &&
         criteria.value.sessionPreferences.length > 0
})

const criteriaCompleteness = computed(() => {
  let score = 0
  const total = 8 // Total number of main criteria sections

  if (criteria.value.goals.length) score++
  if (criteria.value.currentRole) score++
  if (criteria.value.industry) score++
  if (criteria.value.skillsToLearn.length) score++
  if (criteria.value.preferredCommunicationStyle.length) score++
  if (criteria.value.sessionPreferences.length) score++
  if (criteria.value.availabilityPreferences.preferredTimes.length) score++
  if (Object.keys(criteria.value.mentorPreferences).length) score++

  return Math.round((score / total) * 100)
})

const sortedRecommendations = computed(() => {
  return [...recommendations.value]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, props.maxRecommendations)
})

// Methods
const initializeCriteria = () => {
  // Merge preset criteria with defaults
  criteria.value = {
    ...criteria.value,
    ...props.presetCriteria
  }
}

const generateRecommendations = async () => {
  if (!hasValidCriteria.value) {
    error.value = 'Please provide at least your goals, skills to learn, and preferred session types'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Get all available mentors
    const mentors = await mentorsStore.getAllMentors()
    
    // Generate recommendations using the discovery service
    const results = discoveryService.generateRecommendations(mentors, criteria.value)
    
    recommendations.value = results
    
    // Emit criteria update
    emit('update-criteria', criteria.value)

  } catch (err: any) {
    console.error('Error generating recommendations:', err)
    error.value = 'Failed to generate recommendations. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleMentorSelect = (mentorId: string) => {
  emit('select-mentor', mentorId)
}

const getMatchScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  return 'text-orange-600'
}

const getMatchScoreLabel = (score: number): string => {
  if (score >= 85) return 'Excellent Match'
  if (score >= 70) return 'Good Match'
  return 'Fair Match'
}

// Lifecycle
watch(() => props.presetCriteria, initializeCriteria, { immediate: true })

watch(() => props.autoLoad, (autoLoad) => {
  if (autoLoad && hasValidCriteria.value) {
    generateRecommendations()
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <!-- Matching Criteria Form -->
    <div v-if="showCriteria" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Target class="h-5 w-5" />
              <span>Matching Criteria</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-muted-foreground">
                {{ criteriaCompleteness }}% Complete
              </span>
              <Progress :value="criteriaCompleteness" class="w-20" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <!-- Goals and Skills -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Learning Goals</Label>
                <Input
                  v-model="criteria.goals"
                  placeholder="Enter your learning goals"
                  class="w-full"
                />
              </div>
              <div class="space-y-2">
                <Label>Skills to Learn</Label>
                <Input
                  v-model="criteria.skillsToLearn"
                  placeholder="Enter desired skills"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Role and Industry -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Current Role</Label>
                <Input
                  v-model="criteria.currentRole"
                  placeholder="Your current position"
                  class="w-full"
                />
              </div>
              <div class="space-y-2">
                <Label>Industry</Label>
                <Input
                  v-model="criteria.industry"
                  placeholder="Your industry"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Experience Level -->
            <div class="space-y-2">
              <Label>Experience Level</Label>
              <Select
                v-model="criteria.experienceLevel"
                class="w-full"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="level in experienceLevels"
                    :key="level.value"
                    :value="level.value"
                  >
                    {{ level.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Communication Style -->
            <div class="space-y-2">
              <Label>Preferred Communication Style</Label>
              <div class="grid gap-2 sm:grid-cols-2">
                <div
                  v-for="style in communicationStyles"
                  :key="style.value"
                  class="flex items-center space-x-2"
                >
                  <Checkbox
                    :id="`style-${style.value}`"
                    v-model="criteria.preferredCommunicationStyle"
                    :value="style.value"
                  />
                  <Label :for="`style-${style.value}`">{{ style.label }}</Label>
                </div>
              </div>
            </div>

            <!-- Session Types -->
            <div class="space-y-2">
              <Label>Session Types</Label>
              <div class="grid gap-2 sm:grid-cols-2">
                <div
                  v-for="type in sessionTypes"
                  :key="type.value"
                  class="flex items-center space-x-2"
                >
                  <Checkbox
                    :id="`session-${type.value}`"
                    v-model="criteria.sessionPreferences"
                    :value="type.value"
                  />
                  <Label :for="`session-${type.value}`" class="flex items-center space-x-2">
                    <component :is="type.icon" class="h-4 w-4" />
                    <span>{{ type.label }}</span>
                  </Label>
                </div>
              </div>
            </div>

            <!-- Budget Range -->
            <div class="space-y-4">
              <Label>Budget Range (per hour)</Label>
              <div class="px-2">
                <Slider
                  v-model="criteria.budgetRange.max"
                  :min="50"
                  :max="500"
                  :step="25"
                  class="w-full"
                />
                <div class="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>${{ criteria.budgetRange.min }}</span>
                  <span>${{ criteria.budgetRange.max }}+</span>
                </div>
              </div>
            </div>

            <!-- Session Frequency -->
            <div class="space-y-2">
              <Label>Session Frequency</Label>
              <Select
                v-model="criteria.availabilityPreferences.frequency"
                class="w-full"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="freq in frequencies"
                    :key="freq.value"
                    :value="freq.value"
                  >
                    {{ freq.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Languages -->
            <div class="space-y-2">
              <Label>Preferred Languages</Label>
              <div class="grid gap-2 sm:grid-cols-3">
                <div
                  v-for="lang in languages"
                  :key="lang"
                  class="flex items-center space-x-2"
                >
                  <Checkbox
                    :id="`lang-${lang}`"
                    v-model="criteria.availabilityPreferences.preferredLanguages"
                    :value="lang"
                  />
                  <Label :for="`lang-${lang}`">{{ lang }}</Label>
                </div>
              </div>
            </div>
          </div>

          <!-- Generate Button -->
          <div class="mt-6">
            <Button
              class="w-full"
              size="lg"
              :disabled="!hasValidCriteria || isLoading"
              @click="generateRecommendations"
            >
              <Target v-if="!isLoading" class="h-4 w-4 mr-2" />
              <template v-else>
                <span class="animate-spin h-4 w-4 mr-2">⌛</span>
              </template>
              {{ isLoading ? 'Generating Recommendations...' : 'Find My Mentors' }}
            </Button>
          </div>

          <!-- Error Message -->
          <Alert
            v-if="error"
            variant="destructive"
            class="mt-4"
          >
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>

    <!-- Recommendations -->
    <div v-if="recommendations.length > 0 || isLoading" class="space-y-4">
      <h3 class="text-lg font-semibold">
        {{ recommendations.length }} Recommended Mentors
      </h3>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4">
        <Card v-for="i in 3" :key="i">
          <CardContent class="p-6">
            <div class="flex items-center space-x-4">
              <Skeleton class="h-12 w-12 rounded-full" />
              <div class="space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Results -->
      <div v-else class="space-y-4">
        <Card
          v-for="rec in sortedRecommendations"
          :key="rec.mentor.id"
          class="hover:shadow-md transition-shadow cursor-pointer"
          @click="handleMentorSelect(rec.mentor.id)"
        >
          <CardContent class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-4">
                <!-- Avatar -->
                <div class="relative">
                  <img
                    v-if="rec.mentor.profilePhoto"
                    :src="rec.mentor.profilePhoto"
                    :alt="rec.mentor.firstName"
                    class="h-12 w-12 rounded-full object-cover"
                  />
                  <div v-else class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <span class="text-lg font-semibold">
                      {{ rec.mentor.firstName[0] }}{{ rec.mentor.lastName[0] }}
                    </span>
                  </div>
                  <div
                    v-if="rec.mentor.isAvailable"
                    class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"
                    title="Available now"
                  />
                </div>

                <!-- Basic Info -->
                <div>
                  <h4 class="font-semibold">
                    {{ rec.mentor.firstName }} {{ rec.mentor.lastName }}
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    {{ rec.mentor.title }} at {{ rec.mentor.company }}
                  </p>
                </div>
              </div>

              <!-- Match Score -->
              <div class="text-right">
                <div :class="[getMatchScoreColor(rec.matchScore), 'text-2xl font-bold']">
                  {{ rec.matchScore }}%
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ getMatchScoreLabel(rec.matchScore) }}
                </div>
              </div>
            </div>

            <!-- Match Details -->
            <div v-if="showMatchDetails" class="mt-4">
              <!-- Match Reasons -->
              <div class="flex flex-wrap gap-2 mb-3">
                <Badge
                  v-for="reason in rec.matchReasons.slice(0, 3)"
                  :key="reason.factor"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ reason.description }}
                </Badge>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center space-x-6 text-sm text-muted-foreground">
                <!-- Rating -->
                <div class="flex items-center space-x-1">
                  <Star class="h-4 w-4 text-yellow-400" />
                  <span>{{ rec.mentor.averageRating }} ({{ rec.mentor.totalReviews }})</span>
                </div>

                <!-- Sessions -->
                <div class="flex items-center space-x-1">
                  <Users class="h-4 w-4" />
                  <span>{{ rec.mentor.totalSessions }} sessions</span>
                </div>

                <!-- Rate -->
                <div class="flex items-center space-x-1">
                  <DollarSign class="h-4 w-4" />
                  <span>${{ rec.mentor.hourlyRate }}/hr</span>
                </div>

                <!-- Response Time -->
                <div class="flex items-center space-x-1">
                  <Clock class="h-4 w-4" />
                  <span>{{ rec.mentor.responseTime }}h response</span>
                </div>
              </div>

              <!-- Session Types -->
              <div class="flex items-center space-x-2 mt-3">
                <component
                  v-for="(type, index) in rec.mentor.preferredSessionTypes.slice(0, 4)"
                  :key="index"
                  :is="sessionTypes.find(t => t.value === type)?.icon"
                  class="h-4 w-4 text-muted-foreground"
                />
                <span
                  v-if="rec.mentor.preferredSessionTypes.length > 4"
                  class="text-xs text-muted-foreground"
                >
                  +{{ rec.mentor.preferredSessionTypes.length - 4 }}
                </span>
              </div>
            </div>

            <!-- Action Row -->
            <div class="flex items-center justify-between mt-4 pt-4 border-t">
              <!-- Verification Badges -->
              <div class="flex items-center space-x-2">
                <Badge
                  v-for="badge in rec.mentor.verificationBadges.slice(0, 2)"
                  :key="badge.id"
                  variant="outline"
                  class="text-xs flex items-center space-x-1"
                >
                  <Shield class="h-3 w-3" />
                  <span>{{ badge.name }}</span>
                </Badge>
              </div>

              <!-- View Profile -->
              <Button variant="ghost" size="sm">
                View Profile
                <ChevronRight class="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading && hasValidCriteria"
      class="text-center py-12"
    >
      <div class="space-y-4">
        <Target class="h-16 w-16 mx-auto text-muted-foreground" />
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">No matches found</h3>
          <p class="text-muted-foreground max-w-md mx-auto">
            We couldn't find any mentors matching your criteria. 
            Try adjusting your preferences or broadening your search.
          </p>
        </div>
        <Button variant="outline" @click="clearFilters">
          Adjust Criteria
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 