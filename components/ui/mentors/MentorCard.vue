<script setup lang="ts">
import { computed } from 'vue'
import type { MentorListingCard } from '@/types/mentor'
import { useRouter } from 'vue-router'

// UI Components
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

// Icons
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Heart, 
  MessageSquare,
  Calendar,
  Shield,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Users,
  Globe,
  Video,
  Phone,
  MessageCircle
} from 'lucide-vue-next'

interface Props {
  mentor: MentorListingCard
  viewMode: 'grid' | 'list'
  isFavorite?: boolean
  isFeatured?: boolean
  isTrending?: boolean
  showViewProfile?: boolean
  showContactButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite: false,
  isFeatured: false,
  isTrending: false,
  showViewProfile: true,
  showContactButton: true
})

const emit = defineEmits<{
  'add-favorite': [mentorId: string]
  'remove-favorite': [mentorId: string]
  'contact': [mentorId: string]
  'view-profile': [mentorId: string]
}>()

const router = useRouter()

// Computed properties
const fullName = computed(() => `${props.mentor.firstName || ''} ${props.mentor.lastName || ''}`)

const initials = computed(() => 
  `${props.mentor.firstName?.charAt(0) || '?'}${props.mentor.lastName?.charAt(0) || '?'}`.toUpperCase()
)

const displayRating = computed(() => {
  const rating = props.mentor.averageRating || props.mentor.rating || 0
  return Math.round(rating * 10) / 10
})

const formattedPrice = computed(() => {
  const symbol = getCurrencySymbol(props.mentor.currency || 'USD')
  return `${symbol}${props.mentor.hourlyRate || 0}`
})

const responseTimeText = computed(() => {
  const hours = props.mentor.responseTime || 24
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
})

const sessionTypeIcons = computed(() => {
  const iconMap = {
    video: Video,
    phone: Phone,
    chat: MessageCircle
  }
  
  const sessionTypes = props.mentor.preferredSessionTypes || props.mentor.sessionTypes || ['video']
  return sessionTypes.map(type => iconMap[type] || MessageCircle)
})

const badgeVariants = computed(() => {
  const variants: Array<{ type: string; variant: string; icon?: any }> = []
  
  if (props.isFeatured) {
    variants.push({ type: 'Featured', variant: 'default', icon: Sparkles })
  }
  
  if (props.isTrending) {
    variants.push({ type: 'Trending', variant: 'secondary', icon: TrendingUp })
  }
  
  if (props.mentor.verificationBadges?.some(badge => badge.type === 'identity_verified')) {
    variants.push({ type: 'Verified', variant: 'outline', icon: Shield })
  }
  
  if (props.mentor.averageRating && props.mentor.averageRating >= 4.8) {
    variants.push({ type: 'Top Rated', variant: 'destructive' })
  }
  
  return variants
})

const availabilityStatus = computed(() => {
  if (props.mentor.isAvailable) {
    return { label: 'Available', color: 'bg-green-500' }
  }
  return { label: 'Busy', color: 'bg-yellow-500' }
})

// Helper functions
const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
  }
  return symbols[currency] || '$'
}

const truncateText = (text: string, maxLength: number) => {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Event handlers
const handleFavoriteToggle = () => {
  if (props.isFavorite) {
    emit('remove-favorite', props.mentor.id)
  } else {
    emit('add-favorite', props.mentor.id)
  }
}

const handleViewProfile = () => {
  emit('view-profile', props.mentor.id)
  router.push(`/app/mentors/${props.mentor.id}`)
}

const handleContact = () => {
  emit('contact', props.mentor.id)
  router.push(`/app/mentors/${props.mentor.id}/contact`)
}
</script>

<template>
  <Card 
    :class="{
      'hover:shadow-lg transition-shadow cursor-pointer': true,
      'border-primary/20': isFeatured,
      'border-orange-200': isTrending
    }"
    @click="handleViewProfile"
  >
    <!-- Grid View -->
    <template v-if="viewMode === 'grid'">
      <CardHeader class="pb-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <Avatar class="h-12 w-12">
                <AvatarImage :src="mentor.profilePhoto" :alt="fullName" />
                <AvatarFallback>{{ initials }}</AvatarFallback>
              </Avatar>
              <div 
                :class="[
                  'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white',
                  availabilityStatus.color
                ]"
                :title="availabilityStatus.label"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-lg truncate">{{ fullName }}</h3>
              <p class="text-sm text-muted-foreground truncate">
                {{ mentor.title }} at {{ mentor.company }}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            @click.stop="handleFavoriteToggle"
            :class="{ 'text-red-500': isFavorite }"
          >
            <Heart 
              :class="{ 'fill-current': isFavorite }" 
              class="h-4 w-4" 
            />
          </Button>
        </div>

        <!-- Badges -->
        <div v-if="badgeVariants.length > 0" class="flex flex-wrap gap-1 mt-2">
          <Badge
            v-for="badge in badgeVariants"
            :key="badge.type"
            :variant="badge.variant as any"
            class="text-xs flex items-center gap-1"
          >
            <component :is="badge.icon" v-if="badge.icon" class="h-3 w-3" />
            {{ badge.type }}
          </Badge>
        </div>
      </CardHeader>

      <CardContent class="pb-4">
        <!-- Summary -->
        <p class="text-sm text-muted-foreground mb-3 line-clamp-3">
          {{ truncateText(mentor.profileSummary, 120) }}
        </p>

        <!-- Expertise Areas -->
<!--
        <div class="space-y-2 mb-3">
          <div class="flex flex-wrap gap-1">
            <Badge
              v-for="area in (mentor.expertiseAreas || []).slice(0, 3)"
              :key="area"
              variant="secondary"
              class="text-xs"
            >
              {{ area }}
            </Badge>
            <Badge
              v-if="(mentor.expertiseAreas || []).length > 3"
              variant="outline"
              class="text-xs"
            >
              +{{ (mentor.expertiseAreas || []).length - 3 }} more
            </Badge>
          </div>
        </div>
-->

        <!-- Rating and Stats -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-2">
              <div class="flex items-center">
                <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span class="text-sm font-medium">{{ displayRating }}</span>
                <span class="text-sm text-muted-foreground">({{ mentor.reviewCount || mentor.totalReviews || 0 }})</span>
              </div>
              <Separator orientation="vertical" class="h-4" />
              <div class="flex items-center text-sm text-muted-foreground">
                <Clock class="h-4 w-4 mr-1" />
                <span>{{ responseTimeText }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter class="pt-0">
        <div class="flex space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            class="flex-1"
            @click.stop="handleViewProfile"
          >
            View Profile
          </Button>
        </div>
      </CardFooter>
    </template>

    <!-- List View -->
    <template v-else>
      <CardContent class="p-6">
        <div class="flex space-x-4">
          <!-- Avatar and Basic Info -->
          <div class="flex-shrink-0">
            <div class="relative">
              <Avatar class="h-16 w-16">
                <AvatarImage :src="mentor.profilePhoto" :alt="fullName" />
                <AvatarFallback>{{ initials }}</AvatarFallback>
              </Avatar>
              <div 
                :class="[
                  'absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white',
                  availabilityStatus.color
                ]"
                :title="availabilityStatus.label"
              />
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <!-- Header -->
                <div class="flex items-center space-x-2 mb-1">
                  <h3 class="font-semibold text-xl">{{ fullName }}</h3>
                  <Badge
                    v-for="badge in badgeVariants.slice(0, 2)"
                    :key="badge.type"
                    :variant="badge.variant as any"
                    class="text-xs flex items-center gap-1"
                  >
                    <component :is="badge.icon" v-if="badge.icon" class="h-3 w-3" />
                    {{ badge.type }}
                  </Badge>
                </div>
                
                <p class="text-muted-foreground mb-2">
                  {{ mentor.title }} at {{ mentor.company }} • {{ mentor.industry }}
                </p>

                <!-- Rating and Stats Row -->
                <div class="flex items-center space-x-6 text-sm mb-3">
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center">
                      <Star
                        v-for="n in ratingStars.fullStars"
                        :key="`full-${n}`"
                        class="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                      <Star
                        v-if="ratingStars.hasHalfStar"
                        class="h-4 w-4 fill-yellow-400/50 text-yellow-400"
                      />
                      <Star
                        v-for="n in ratingStars.emptyStars"
                        :key="`empty-${n}`"
                        class="h-4 w-4 text-gray-300"
                      />
                    </div>
                    <span class="font-medium">{{ mentor.averageRating }}</span>
                    <span class="text-muted-foreground">({{ mentor.totalReviews }} reviews)</span>
                  </div>
                  
                  <Separator orientation="vertical" class="h-4" />
                  
                  <div class="flex items-center space-x-1 text-muted-foreground">
                    <Users class="h-4 w-4" />
                    <span>{{ mentor.totalSessions }} sessions</span>
                  </div>
                  
                  <Separator orientation="vertical" class="h-4" />
                  
                  <div class="flex items-center space-x-1 text-muted-foreground">
                    <Clock class="h-4 w-4" />
                    <span>{{ responseTimeText }}</span>
                  </div>
                </div>

                <!-- Summary -->
                <p class="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {{ mentor.profileSummary }}
                </p>

                <!-- Skills and Expertise -->
                <div class="flex flex-wrap gap-1 mb-3">
                  <Badge
                    v-for="area in (mentor.expertiseAreas || []).slice(0, 4)"
                    :key="area"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ area }}
                  </Badge>
                  <Badge
                    v-if="(mentor.expertiseAreas || []).length > 4"
                    variant="outline"
                    class="text-xs"
                  >
                    +{{ (mentor.expertiseAreas || []).length - 4 }} more
                  </Badge>
                </div>

                <!-- Session Types -->
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-muted-foreground">Available for:</span>
                  <div class="flex items-center space-x-2">
                    <component
                      v-for="(icon, index) in sessionTypeIcons.slice(0, 5)"
                      :key="index"
                      :is="icon"
                      class="h-4 w-4 text-muted-foreground"
                    />
                    <span
                      v-if="sessionTypeIcons.length > 5"
                      class="text-xs text-muted-foreground"
                    >
                      +{{ sessionTypeIcons.length - 5 }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right Side Actions -->
              <div class="flex flex-col items-end space-y-3 ml-4">

                <!-- Actions -->
                <div class="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="handleFavoriteToggle"
                    :class="{ 'text-red-500': isFavorite }"
                  >
                    <Heart 
                      :class="{ 'fill-current': isFavorite }" 
                      class="h-4 w-4" 
                    />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    @click.stop="handleViewProfile"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </template>
  </Card>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 