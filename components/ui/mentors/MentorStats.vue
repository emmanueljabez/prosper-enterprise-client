<script setup lang="ts">
import { computed } from 'vue'
import type { MentorMarketplaceStats } from '@/types/mentor'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Icons
import { 
  Users, 
  Star, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Shield,
  Globe,
  Clock
} from 'lucide-vue-next'

interface Props {
  stats: MentorMarketplaceStats
}

const props = defineProps<Props>()

// Computed properties
const formattedStats = computed(() => {
  const { stats } = props
  
  // Add safety checks for undefined values
  if (!stats) {
    return {
      totalMentors: '0',
      activeMentors: '0',
      verifiedMentors: '0',
      averageRating: '0.0',
      totalSessions: '0',
      activePercentage: 0,
      verifiedPercentage: 0
    }
  }
  
  return {
    totalMentors: formatNumber(stats.totalMentors || 0),
    activeMentors: formatNumber(stats.activeMentors || 0),
    verifiedMentors: formatNumber(stats.verifiedMentors || 0),
    averageRating: (stats.averageRating || 0).toFixed(1),
    totalSessions: formatNumber(stats.totalSessions || 0),
    activePercentage: Math.round(((stats.activeMentors || 0) / (stats.totalMentors || 1)) * 100),
    verifiedPercentage: Math.round(((stats.verifiedMentors || 0) / (stats.totalMentors || 1)) * 100)
  }
})

const topExpertiseAreas = computed(() => 
  props.stats?.popularExpertiseAreas?.slice(0, 5) || []
)

const topIndustries = computed(() => 
  props.stats?.industryDistribution?.slice(0, 4) || []
)

const priceRangeData = computed(() => 
  props.stats?.priceRangeDistribution?.slice(0, 3) || []
)

// Helper functions
const formatNumber = (num: number | undefined): string => {
  // Add safety check for undefined/null
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const getExpertiseColor = (index: number): string => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-pink-100 text-pink-800'
  ]
  return colors[index % colors.length]
}

const getIndustryColor = (index: number): string => {
  const colors = [
    'bg-indigo-100 text-indigo-800',
    'bg-teal-100 text-teal-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800'
  ]
  return colors[index % colors.length]
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Mentors -->
    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Total Mentors</p>
            <p class="text-2xl font-bold">{{ formattedStats.totalMentors }}</p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formattedStats.activePercentage }}% active
            </p>
          </div>
          <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Verified Mentors -->
    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Verified</p>
            <p class="text-2xl font-bold">{{ formattedStats.verifiedMentors }}</p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ formattedStats.verifiedPercentage }}% verified
            </p>
          </div>
          <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Average Rating -->
    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Avg Rating</p>
            <div class="flex items-center space-x-1">
              <p class="text-2xl font-bold">{{ formattedStats.averageRating }}</p>
              <Star class="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              High quality mentors
            </p>
          </div>
          <div class="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Star class="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total Sessions -->
    <Card class="hover:shadow-md transition-shadow">
      <CardContent class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Sessions</p>
            <p class="text-2xl font-bold">{{ formattedStats.totalSessions }}</p>
            <p class="text-xs text-muted-foreground mt-1">
              Total completed
            </p>
          </div>
          <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Detailed Stats Row -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <!-- Popular Expertise Areas -->
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center space-x-2 mb-4">
          <TrendingUp class="h-5 w-5 text-muted-foreground" />
          <h3 class="font-semibold">Popular Expertise</h3>
        </div>
        <div class="space-y-3">
          <div 
            v-for="(area, index) in topExpertiseAreas"
            :key="area.area"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <Badge :class="getExpertiseColor(index)" variant="secondary">
                {{ area.area }}
              </Badge>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">{{ formatNumber(area.mentorCount) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ Math.round(area.demandScore) }}% demand
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Industry Distribution -->
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center space-x-2 mb-4">
          <Globe class="h-5 w-5 text-muted-foreground" />
          <h3 class="font-semibold">Top Industries</h3>
        </div>
        <div class="space-y-3">
          <div 
            v-for="(industry, index) in topIndustries"
            :key="industry.industry"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <Badge :class="getIndustryColor(index)" variant="secondary">
                {{ industry.industry }}
              </Badge>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">{{ formatNumber(industry.count) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ industry.percentage }}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Price Range Distribution -->
    <Card>
      <CardContent class="p-6">
        <div class="flex items-center space-x-2 mb-4">
          <DollarSign class="h-5 w-5 text-muted-foreground" />
          <h3 class="font-semibold">Price Ranges</h3>
        </div>
        <div class="space-y-3">
          <div 
            v-for="(range, index) in priceRangeData"
            :key="range.range"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
              <span class="text-sm font-medium">{{ range.range }}</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">{{ formatNumber(range.count) }}</p>
              <p class="text-xs text-muted-foreground">
                {{ range.percentage }}%
              </p>
            </div>
          </div>
          
          <!-- Average Hourly Rate -->
          <div class="pt-2 border-t">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Average Rate</span>
              <span class="text-sm font-semibold">
                ${{ Math.round(props.stats.priceRangeDistribution.reduce((acc, range) => {
                  const midpoint = parseInt(range.range.split('-')[0]) || 100
                  return acc + (midpoint * range.percentage / 100)
                }, 0)) }}/hr
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Quick Insights -->
  <Card class="mb-6">
    <CardContent class="p-6">
      <div class="flex items-center space-x-2 mb-4">
        <Clock class="h-5 w-5 text-muted-foreground" />
        <h3 class="font-semibold">Market Insights</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Quality Score -->
        <div class="text-center p-4 bg-muted/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span class="text-lg font-bold">{{ formattedStats.averageRating }}</span>
          </div>
          <p class="text-xs text-muted-foreground">Quality Score</p>
        </div>

        <!-- Response Time -->
        <div class="text-center p-4 bg-muted/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <Clock class="h-4 w-4 text-green-600" />
            <span class="text-lg font-bold">&lt;2h</span>
          </div>
          <p class="text-xs text-muted-foreground">Avg Response</p>
        </div>

        <!-- Success Rate -->
        <div class="text-center p-4 bg-muted/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp class="h-4 w-4 text-blue-600" />
            <span class="text-lg font-bold">94%</span>
          </div>
          <p class="text-xs text-muted-foreground">Success Rate</p>
        </div>

        <!-- Satisfaction -->
        <div class="text-center p-4 bg-muted/50 rounded-lg">
          <div class="flex items-center justify-center space-x-1 mb-1">
            <Users class="h-4 w-4 text-purple-600" />
            <span class="text-lg font-bold">96%</span>
          </div>
          <p class="text-xs text-muted-foreground">Satisfaction</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
/* Additional styles if needed */
</style> 