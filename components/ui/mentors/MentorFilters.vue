<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMentorsStore } from '@/store/modules/mentors'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Icons
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X,
  Star,
  DollarSign,
  Clock,
  Globe,
  Shield,
  Users,
  Video,
  Phone,
  MessageCircle
} from 'lucide-vue-next'

const mentorsStore = useMentorsStore()

// Component state
const expandedSections = ref<Set<string>>(new Set(['expertise', 'price', 'rating']))

// Filter state
const selectedExpertiseAreas = ref<string[]>([])
const selectedSkills = ref<string[]>([])
const selectedIndustries = ref<string[]>([])
const selectedSessionTypes = ref<string[]>([])
const selectedCommunicationStyles = ref<string[]>([])
const selectedLanguages = ref<string[]>([])
const selectedVerificationBadges = ref<string[]>([])

const priceRange = ref([25, 500])
const experienceRange = ref([0, 20])
const minRating = ref(0)
const availabilityFilter = ref('')

// Available filter options (would come from API in real implementation)
const expertiseOptions = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'Product Management', 'UX/UI Design', 'Data Science', 'Machine Learning',
  'DevOps', 'Engineering Leadership', 'Career Transition', 'Startup Strategy',
  'Technical Interview', 'System Design', 'Mobile Development'
]

const skillOptions = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript',
  'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL',
  'Figma', 'Sketch', 'Analytics', 'A/B Testing', 'Agile', 'Scrum'
]

const industryOptions = [
  'Technology', 'Financial Services', 'Healthcare', 'E-commerce',
  'Education', 'Entertainment', 'Automotive', 'Real Estate',
  'Consulting', 'Manufacturing', 'Retail', 'Non-profit'
]

const sessionTypeOptions = [
  { value: 'video_call', label: 'Video Call', icon: Video },
  { value: 'phone_call', label: 'Phone Call', icon: Phone },
  { value: 'chat_only', label: 'Chat Only', icon: MessageCircle },
  { value: 'screen_sharing', label: 'Screen Sharing', icon: Globe },
  { value: 'code_review', label: 'Code Review', icon: Users },
  { value: 'workshop', label: 'Workshop', icon: Users }
]

const communicationStyleOptions = [
  'Direct', 'Supportive', 'Analytical', 'Collaborative', 'Structured', 'Flexible'
]

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Portuguese', 'Italian', 'Dutch', 'Korean'
]

const verificationBadgeOptions = [
  { value: 'identity_verified', label: 'Identity Verified', icon: Shield },
  { value: 'education_verified', label: 'Education Verified', icon: Shield },
  { value: 'certification_verified', label: 'Certification Verified', icon: Shield },
  { value: 'background_check', label: 'Background Check', icon: Shield },
  { value: 'top_rated', label: 'Top Rated', icon: Star },
  { value: 'expert_certified', label: 'Expert Certified', icon: Star }
]

const availabilityOptions = [
  { value: '', label: 'Any availability' },
  { value: 'available_now', label: 'Available now' },
  { value: 'this_week', label: 'Available this week' },
  { value: 'emergency', label: 'Emergency available' }
]

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedExpertiseAreas.value.length > 0 ||
         selectedSkills.value.length > 0 ||
         selectedIndustries.value.length > 0 ||
         selectedSessionTypes.value.length > 0 ||
         selectedCommunicationStyles.value.length > 0 ||
         selectedLanguages.value.length > 0 ||
         selectedVerificationBadges.value.length > 0 ||
         priceRange.value[0] > 25 ||
         priceRange.value[1] < 500 ||
         experienceRange.value[0] > 0 ||
         experienceRange.value[1] < 20 ||
         minRating.value > 0 ||
         availabilityFilter.value !== ''
})

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedExpertiseAreas.value.length) count++
  if (selectedSkills.value.length) count++
  if (selectedIndustries.value.length) count++
  if (selectedSessionTypes.value.length) count++
  if (selectedCommunicationStyles.value.length) count++
  if (selectedLanguages.value.length) count++
  if (selectedVerificationBadges.value.length) count++
  if (priceRange.value[0] > 25 || priceRange.value[1] < 500) count++
  if (experienceRange.value[0] > 0 || experienceRange.value[1] < 20) count++
  if (minRating.value > 0) count++
  if (availabilityFilter.value) count++
  return count
})

// Event handlers
const toggleSection = (section: string) => {
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section)
  } else {
    expandedSections.value.add(section)
  }
}

const handleFilterChange = (filterKey: string, values: string[]) => {
  mentorsStore.updateFilters(filterKey, values)
}

const handleCheckboxChange = (filterType: string, value: string, checked: boolean) => {
  const currentValues = getCurrentFilterValues(filterType)
  
  if (checked) {
    currentValues.push(value)
  } else {
    const index = currentValues.indexOf(value)
    if (index > -1) {
      currentValues.splice(index, 1)
    }
  }
  
  handleFilterChange(filterType, currentValues)
}

const getCurrentFilterValues = (filterType: string): string[] => {
  switch (filterType) {
    case 'expertiseAreas': return selectedExpertiseAreas.value
    case 'skills': return selectedSkills.value
    case 'industries': return selectedIndustries.value
    case 'sessionTypes': return selectedSessionTypes.value
    case 'communicationStyles': return selectedCommunicationStyles.value
    case 'languages': return selectedLanguages.value
    case 'verificationBadges': return selectedVerificationBadges.value
    default: return []
  }
}

const clearAllFilters = () => {
  selectedExpertiseAreas.value = []
  selectedSkills.value = []
  selectedIndustries.value = []
  selectedSessionTypes.value = []
  selectedCommunicationStyles.value = []
  selectedLanguages.value = []
  selectedVerificationBadges.value = []
  priceRange.value = [25, 500]
  experienceRange.value = [0, 20]
  minRating.value = 0
  availabilityFilter.value = ''
  
  mentorsStore.clearFilters()
}

const applyFilters = () => {
  const filters: Record<string, any> = {}
  
  if (selectedExpertiseAreas.value.length) {
    filters.expertiseAreas = selectedExpertiseAreas.value
  }
  if (selectedSkills.value.length) {
    filters.skills = selectedSkills.value
  }
  if (selectedIndustries.value.length) {
    filters.industries = selectedIndustries.value
  }
  if (selectedSessionTypes.value.length) {
    filters.sessionTypes = selectedSessionTypes.value
  }
  if (selectedCommunicationStyles.value.length) {
    filters.communicationStyles = selectedCommunicationStyles.value
  }
  if (selectedLanguages.value.length) {
    filters.languages = selectedLanguages.value
  }
  if (selectedVerificationBadges.value.length) {
    filters.verificationBadges = selectedVerificationBadges.value
  }
  if (priceRange.value[0] > 25 || priceRange.value[1] < 500) {
    filters.hourlyRate = { min: priceRange.value[0], max: priceRange.value[1] }
  }
  if (experienceRange.value[0] > 0 || experienceRange.value[1] < 20) {
    filters.experienceYears = { min: experienceRange.value[0], max: experienceRange.value[1] }
  }
  if (minRating.value > 0) {
    filters.rating = { min: minRating.value }
  }
  if (availabilityFilter.value) {
    filters.availability = { [availabilityFilter.value]: true }
  }
  
  // Apply all filters at once
  Object.entries(filters).forEach(([key, value]) => {
    mentorsStore.updateFilters(key, Array.isArray(value) ? value : [value])
  })
}

// Watch for changes and auto-apply filters
watch([
  selectedExpertiseAreas, selectedSkills, selectedIndustries,
  selectedSessionTypes, selectedCommunicationStyles, selectedLanguages,
  selectedVerificationBadges, priceRange, experienceRange, minRating, availabilityFilter
], applyFilters, { deep: true })
</script>

<template>
  <div class="space-y-4">
    <!-- Filter Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Filter class="h-4 w-4" />
        <span class="font-medium">Filters</span>
        <Badge v-if="activeFilterCount > 0" variant="secondary">
          {{ activeFilterCount }}
        </Badge>
      </div>
      <Button
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        @click="clearAllFilters"
      >
        Clear All
      </Button>
    </div>

    <!-- Expertise Areas -->
    <Collapsible :open="expandedSections.has('expertise')">
      <CollapsibleTrigger 
        class="flex items-center justify-between w-full p-3 text-left hover:bg-muted rounded-lg"
        @click="toggleSection('expertise')"
      >
        <span class="font-medium">Expertise Areas</span>
        <ChevronDown 
          :class="{ 'rotate-180': expandedSections.has('expertise') }"
          class="h-4 w-4 transition-transform"
        />
      </CollapsibleTrigger>
      <CollapsibleContent class="space-y-2 p-3 pt-0">
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div 
            v-for="option in expertiseOptions"
            :key="option"
            class="flex items-center space-x-2"
          >
            <Checkbox
              :id="`expertise-${option}`"
              :checked="selectedExpertiseAreas.includes(option)"
              @update:checked="(checked) => handleCheckboxChange('expertiseAreas', option, checked)"
            />
            <Label 
              :for="`expertise-${option}`"
              class="text-sm cursor-pointer"
            >
              {{ option }}
            </Label>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>

    <Separator />


    <!-- Rating -->
    <Collapsible :open="expandedSections.has('rating')">
      <CollapsibleTrigger 
        class="flex items-center justify-between w-full p-3 text-left hover:bg-muted rounded-lg"
        @click="toggleSection('rating')"
      >
        <div class="flex items-center space-x-2">
          <Star class="h-4 w-4" />
          <span class="font-medium">Minimum Rating</span>
        </div>
        <ChevronDown 
          :class="{ 'rotate-180': expandedSections.has('rating') }"
          class="h-4 w-4 transition-transform"
        />
      </CollapsibleTrigger>
      <CollapsibleContent class="p-3 pt-0">
        <div class="space-y-3">
          <div 
            v-for="rating in [4.5, 4.0, 3.5, 3.0]"
            :key="rating"
            class="flex items-center space-x-2"
          >
            <Checkbox
              :id="`rating-${rating}`"
              :checked="minRating === rating"
              @update:checked="(checked) => minRating = checked ? rating : 0"
            />
            <Label 
              :for="`rating-${rating}`"
              class="flex items-center space-x-1 cursor-pointer"
            >
              <span>{{ rating }}+</span>
              <div class="flex">
                <Star
                  v-for="n in Math.floor(rating)"
                  :key="n"
                  class="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
                <Star
                  v-if="rating % 1 !== 0"
                  class="h-3 w-3 fill-yellow-400/50 text-yellow-400"
                />
              </div>
            </Label>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>

    <Separator />

    <!-- Experience Years -->
    <Collapsible :open="expandedSections.has('experience')">
      <CollapsibleTrigger 
        class="flex items-center justify-between w-full p-3 text-left hover:bg-muted rounded-lg"
        @click="toggleSection('experience')"
      >
        <div class="flex items-center space-x-2">
          <Clock class="h-4 w-4" />
          <span class="font-medium">Experience</span>
        </div>
        <ChevronDown 
          :class="{ 'rotate-180': expandedSections.has('experience') }"
          class="h-4 w-4 transition-transform"
        />
      </CollapsibleTrigger>
      <CollapsibleContent class="p-3 pt-0">
        <div class="space-y-4">
          <Slider
            v-model="experienceRange"
            :min="0"
            :max="20"
            :step="1"
            class="w-full"
          />
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <span>{{ experienceRange[0] }} years</span>
            <span>{{ experienceRange[1] }}+ years</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>

    <Separator />

    <!-- Apply Filters Button (for mobile) -->
    <div class="lg:hidden pt-4">
      <Button class="w-full" @click="applyFilters">
        Apply Filters
        <Badge v-if="activeFilterCount > 0" variant="secondary" class="ml-2">
          {{ activeFilterCount }}
        </Badge>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style> 