<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import TagInput from '@/components/common/TagInput.vue'
import { 
  DollarSign, 
  Clock, 
  Star, 
  Award, 
  Users, 
  Globe,
  Briefcase,
  GraduationCap,
  Save,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Plus,
  X
} from 'lucide-vue-next'
import type { User as UserType } from '@/types/auth'

interface Props {
  userId?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<{
  mentorProfileUpdated: [profile: any]
}>()

const authStore = useAuthStore()
const { toast } = useToast()

// Component state
const isEditing = ref(!props.readonly)
const isLoading = ref(false)
const isSaving = ref(false)
const hasChanges = ref(false)

// Mentor profile data
const mentorData = ref({
  // Professional Details
  title: '',
  company: '',
  industry: '',
  experienceYears: 5,
  
  // Expertise & Skills
  expertiseAreas: [] as string[],
  skills: [] as string[],
  industries: [] as string[],
  mentorshipFocus: [] as string[],
  
  // Rates & Availability
  hourlyRate: 150,
  currency: 'USD',
  minSessionDuration: 30,
  maxSessionDuration: 120,
  isAvailable: true,
  
  // Availability Schedule
  weeklyAvailability: {
    monday: { available: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
    thursday: { available: true, startTime: '09:00', endTime: '17:00' },
    friday: { available: true, startTime: '09:00', endTime: '17:00' },
    saturday: { available: false, startTime: '10:00', endTime: '16:00' },
    sunday: { available: false, startTime: '10:00', endTime: '16:00' }
  },
  
  // Professional Background
  education: [] as Array<{
    degree: string
    institution: string
    year: string
    field: string
  }>,
  
  certifications: [] as Array<{
    name: string
    issuer: string
    year: string
    credentialUrl: string
  }>,
  
  workExperience: [] as Array<{
    title: string
    company: string
    startYear: string
    endYear: string
    description: string
  }>,
  
  // Mentor Preferences
  preferredSessionTypes: [] as string[],
  maxMentees: 10,
  communicationStyle: '',
  specializations: [] as string[],
  
  // Public Profile
  profileSummary: '',
  successStories: '',
  mentoringPhilosophy: '',
  
  // Verification & Reviews
  isVerified: false,
  verificationStatus: 'pending', // pending, verified, rejected
  averageRating: 0,
  totalReviews: 0
})

// Validation errors
const errors = ref<Record<string, string>>({})

// Current user info
const currentUser = computed(() => {
  if (props.userId) {
    // In a real app, this would fetch user by ID
    return authStore.loggedInUser
  }
  return authStore.loggedInUser
})

const canEditProfile = computed(() => {
  if (props.readonly) return false
  if (!currentUser.value) return false
  
  // Mentors can edit their own profile, admins can edit any profile
  return RoleManager.isMentor(currentUser.value) || 
         RoleManager.isCorporateAdmin(currentUser.value)
})

// Options for dropdowns
const currencies = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' }
]

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Consulting',
  'Marketing', 'Sales', 'Human Resources', 'Operations', 'Product Management',
  'Design', 'Engineering', 'Data Science', 'Legal', 'Non-profit',
  'Government', 'Real Estate', 'Manufacturing', 'Retail', 'Media'
]

const expertiseOptions = [
  'Leadership', 'Career Development', 'Technical Skills', 'Communication',
  'Project Management', 'Entrepreneurship', 'Strategy', 'Team Building',
  'Public Speaking', 'Negotiation', 'Data Analysis', 'Marketing',
  'Sales', 'Product Development', 'UX/UI Design', 'Software Development',
  'Machine Learning', 'Financial Planning', 'Business Development',
  'Operations Management'
]

const sessionTypes = [
  'One-on-One Mentoring', 'Goal Setting', 'Career Planning', 'Skill Development',
  'Resume Review', 'Interview Preparation', 'Project Feedback', 'Strategy Session',
  'Problem Solving', 'Brainstorming', 'Code Review', 'Portfolio Review'
]

const communicationStyles = [
  { value: 'direct', label: 'Direct & Action-Oriented' },
  { value: 'supportive', label: 'Supportive & Encouraging' },
  { value: 'analytical', label: 'Analytical & Data-Driven' },
  { value: 'collaborative', label: 'Collaborative & Interactive' },
  { value: 'structured', label: 'Structured & Methodical' },
  { value: 'flexible', label: 'Flexible & Adaptive' }
]

const verificationStatuses = [
  { value: 'pending', label: 'Pending Verification', color: 'yellow' },
  { value: 'verified', label: 'Verified Professional', color: 'green' },
  { value: 'rejected', label: 'Verification Failed', color: 'red' }
]

// Computed values
const currencySymbol = computed(() => {
  return currencies.find(c => c.value === mentorData.value.currency)?.symbol || '$'
})

const formattedRate = computed(() => {
  return `${currencySymbol.value}${mentorData.value.hourlyRate}/hour`
})

const totalExpertise = computed(() => {
  return mentorData.value.expertiseAreas.length + mentorData.value.skills.length
})

// Validation
const validateMentorForm = () => {
  const newErrors: Record<string, string> = {}

  if (!mentorData.value.title?.trim()) {
    newErrors.title = 'Professional title is required'
  }

  if (!mentorData.value.company?.trim()) {
    newErrors.company = 'Company is required'
  }

  if (mentorData.value.hourlyRate < 25) {
    newErrors.hourlyRate = 'Minimum hourly rate is $25'
  }

  if (mentorData.value.hourlyRate > 1000) {
    newErrors.hourlyRate = 'Maximum hourly rate is $1000'
  }

  if (mentorData.value.expertiseAreas.length < 1) {
    newErrors.expertiseAreas = 'Please select at least one area of expertise'
  }

  if (!mentorData.value.profileSummary?.trim()) {
    newErrors.profileSummary = 'Profile summary is required'
  }

  if (mentorData.value.profileSummary?.length > 500) {
    newErrors.profileSummary = 'Profile summary must be less than 500 characters'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Education management
const addEducation = () => {
  mentorData.value.education.push({
    degree: '',
    institution: '',
    year: '',
    field: ''
  })
  hasChanges.value = true
}

const removeEducation = (index: number) => {
  mentorData.value.education.splice(index, 1)
  hasChanges.value = true
}

// Certification management
const addCertification = () => {
  mentorData.value.certifications.push({
    name: '',
    issuer: '',
    year: '',
    credentialUrl: ''
  })
  hasChanges.value = true
}

const removeCertification = (index: number) => {
  mentorData.value.certifications.splice(index, 1)
  hasChanges.value = true
}

// Work experience management
const addWorkExperience = () => {
  mentorData.value.workExperience.push({
    title: '',
    company: '',
    startYear: '',
    endYear: '',
    description: ''
  })
  hasChanges.value = true
}

const removeWorkExperience = (index: number) => {
  mentorData.value.workExperience.splice(index, 1)
  hasChanges.value = true
}

// Watch for changes
watch(mentorData, () => {
  hasChanges.value = true
}, { deep: true })

// Load mentor profile data
const loadMentorProfile = async () => {
  if (!currentUser.value) return

  isLoading.value = true
  try {
    // In a real app, this would fetch from API
    // For now, using default values
    hasChanges.value = false
  } catch (error: any) {
    toast({
      title: 'Load Failed',
      description: error.message || 'Failed to load mentor profile',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Save mentor profile
const saveMentorProfile = async () => {
  if (!validateMentorForm()) {
    toast({
      title: 'Validation Error',
      description: 'Please fix the errors before saving',
      variant: 'destructive'
    })
    return
  }

  isSaving.value = true
  try {
    const response = await fetch('/api/mentor/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(mentorData.value)
    })

    if (!response.ok) throw new Error('Save failed')

    const updatedProfile = await response.json()
    
    emit('mentorProfileUpdated', updatedProfile)
    hasChanges.value = false
    
    toast({
      title: 'Profile Saved',
      description: 'Your mentor profile has been updated successfully',
      variant: 'success'
    })

    if (props.readonly) {
      isEditing.value = false
    }
  } catch (error: any) {
    toast({
      title: 'Save Failed',
      description: error.message || 'Failed to save mentor profile',
      variant: 'destructive'
    })
  } finally {
    isSaving.value = false
  }
}

// Toggle edit mode
const toggleEdit = () => {
  if (isEditing.value && hasChanges.value) {
    const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?')
    if (!confirmed) return
  }
  
  if (isEditing.value) {
    loadMentorProfile()
    isEditing.value = false
    hasChanges.value = false
    errors.value = {}
  } else {
    isEditing.value = true
  }
}

// Initialize
onMounted(() => {
  loadMentorProfile()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Verification Status -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">Mentor Profile</h1>
              <Badge 
                :variant="mentorData.verificationStatus === 'verified' ? 'default' : 'secondary'"
                class="flex items-center gap-1"
              >
                <Award class="h-3 w-3" />
                {{ verificationStatuses.find(s => s.value === mentorData.verificationStatus)?.label }}
              </Badge>
            </div>
            <p class="text-muted-foreground">
              Professional mentoring profile and marketplace settings
            </p>
          </div>
          
          <!-- Edit Controls -->
          <div v-if="canEditProfile" class="flex items-center gap-2">
            <Button
              v-if="!isEditing"
              @click="toggleEdit"
              variant="outline"
              class="flex items-center gap-2"
            >
              <Edit3 class="h-4 w-4" />
              Edit Profile
            </Button>
            
            <div v-else class="flex items-center gap-2">
              <Button
                @click="saveMentorProfile"
                :disabled="!hasChanges || isSaving"
                class="flex items-center gap-2"
              >
                <Save class="h-4 w-4" />
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </Button>
              <Button
                @click="toggleEdit"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>

    <!-- Professional Overview -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Briefcase class="h-5 w-5" />
          Professional Overview
        </CardTitle>
        <CardDescription>
          Your current role and professional background
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="title">Professional Title *</Label>
            <Input
              id="title"
              v-model="mentorData.title"
              :readonly="!isEditing"
              :class="{ 'border-red-500': errors.title }"
              placeholder="e.g. Senior Software Engineer"
            />
            <p v-if="errors.title" class="text-sm text-red-500">{{ errors.title }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="company">Company *</Label>
            <Input
              id="company"
              v-model="mentorData.company"
              :readonly="!isEditing"
              :class="{ 'border-red-500': errors.company }"
              placeholder="e.g. Google, Microsoft, Startup Inc."
            />
            <p v-if="errors.company" class="text-sm text-red-500">{{ errors.company }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="industry">Industry</Label>
            <Select
              v-if="isEditing"
              v-model="mentorData.industry"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="industry in industries"
                  :key="industry"
                  :value="industry"
                >
                  {{ industry }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :value="mentorData.industry"
              readonly
            />
          </div>
          
          <div class="space-y-2">
            <Label for="experienceYears">Years of Experience</Label>
            <div v-if="isEditing" class="space-y-2">
              <Slider 
                :model-value="[mentorData.experienceYears]"
                @update:model-value="(value) => mentorData.experienceYears = value[0]"
                :max="40"
                :min="1"
                :step="1"
                class="w-full"
              />
              <p class="text-sm text-muted-foreground text-center">
                {{ mentorData.experienceYears }} years
              </p>
            </div>
            <Input
              v-else
              :value="`${mentorData.experienceYears} years`"
              readonly
            />
          </div>
        </div>

        <!-- Profile Summary -->
        <div class="space-y-2">
          <Label for="profileSummary">Professional Summary *</Label>
          <Textarea
            id="profileSummary"
            v-model="mentorData.profileSummary"
            :readonly="!isEditing"
            :class="{ 'border-red-500': errors.profileSummary }"
            placeholder="Describe your professional background, expertise, and what you bring as a mentor..."
            rows="4"
          />
          <div class="flex justify-between text-sm text-muted-foreground">
            <span v-if="errors.profileSummary" class="text-red-500">{{ errors.profileSummary }}</span>
            <span>{{ mentorData.profileSummary?.length || 0 }}/500 characters</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Expertise & Skills -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Star class="h-5 w-5" />
          Expertise & Skills
        </CardTitle>
        <CardDescription>
          Define your areas of expertise and mentoring focus
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label>Areas of Expertise *</Label>
            <TagInput
              v-model="mentorData.expertiseAreas"
              :suggestions="expertiseOptions"
              :readonly="!isEditing"
              placeholder="Add expertise areas..."
              :max-tags="10"
            />
            <p v-if="errors.expertiseAreas" class="text-sm text-red-500">{{ errors.expertiseAreas }}</p>
            <p class="text-sm text-muted-foreground">
              Select your primary areas of professional expertise (max 10)
            </p>
          </div>

          <div class="space-y-2">
            <Label>Technical Skills</Label>
            <TagInput
              v-model="mentorData.skills"
              :readonly="!isEditing"
              placeholder="Add technical skills..."
              :max-tags="15"
            />
            <p class="text-sm text-muted-foreground">
              List specific tools, technologies, or skills you can mentor on
            </p>
          </div>

          <div class="space-y-2">
            <Label>Mentorship Focus Areas</Label>
            <TagInput
              v-model="mentorData.mentorshipFocus"
              :suggestions="sessionTypes"
              :readonly="!isEditing"
              placeholder="Add mentorship focus areas..."
              :max-tags="8"
            />
            <p class="text-sm text-muted-foreground">
              What types of mentoring do you specialize in?
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Rates & Availability -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <DollarSign class="h-5 w-5" />
          Rates & Availability
        </CardTitle>
        <CardDescription>
          Set your pricing and availability preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <!-- Pricing -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="hourlyRate">Hourly Rate *</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {{ currencySymbol }}
              </span>
              <Input
                id="hourlyRate"
                v-model.number="mentorData.hourlyRate"
                :readonly="!isEditing"
                :class="{ 'border-red-500': errors.hourlyRate, 'pl-8': true }"
                type="number"
                min="25"
                max="1000"
              />
            </div>
            <p v-if="errors.hourlyRate" class="text-sm text-red-500">{{ errors.hourlyRate }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="currency">Currency</Label>
            <Select
              v-if="isEditing"
              v-model="mentorData.currency"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="curr in currencies"
                  :key="curr.value"
                  :value="curr.value"
                >
                  {{ curr.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :value="currencies.find(c => c.value === mentorData.currency)?.label"
              readonly
            />
          </div>
          
          <div class="space-y-2">
            <Label>Formatted Rate</Label>
            <div class="px-3 py-2 bg-muted rounded-md text-lg font-semibold text-green-600">
              {{ formattedRate }}
            </div>
          </div>
        </div>

        <!-- Session Duration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="minDuration">Minimum Session (minutes)</Label>
            <Select
              v-if="isEditing"
              v-model="mentorData.minSessionDuration"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :value="`${mentorData.minSessionDuration} minutes`"
              readonly
            />
          </div>
          
          <div class="space-y-2">
            <Label for="maxDuration">Maximum Session (minutes)</Label>
            <Select
              v-if="isEditing"
              v-model="mentorData.maxSessionDuration"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
                <SelectItem value="180">180 minutes</SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :value="`${mentorData.maxSessionDuration} minutes`"
              readonly
            />
          </div>
        </div>

        <!-- Availability Toggle -->
        <div class="flex items-center justify-between space-x-2 p-4 border rounded-lg">
          <div class="space-y-0.5">
            <Label for="availability">Currently Available for Mentoring</Label>
            <p class="text-sm text-muted-foreground">
              Toggle your availability status in the mentor marketplace
            </p>
          </div>
          <Switch
            id="availability"
            :checked="mentorData.isAvailable"
            @update:checked="(value) => mentorData.isAvailable = value"
            :disabled="!isEditing"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Mentoring Preferences -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Users class="h-5 w-5" />
          Mentoring Preferences
        </CardTitle>
        <CardDescription>
          Configure your mentoring style and preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="maxMentees">Maximum Active Mentees</Label>
            <div v-if="isEditing" class="space-y-2">
              <Slider 
                :model-value="[mentorData.maxMentees]"
                @update:model-value="(value) => mentorData.maxMentees = value[0]"
                :max="50"
                :min="1"
                :step="1"
                class="w-full"
              />
              <p class="text-sm text-muted-foreground text-center">
                {{ mentorData.maxMentees }} mentees
              </p>
            </div>
            <Input
              v-else
              :value="`${mentorData.maxMentees} mentees`"
              readonly
            />
          </div>
          
          <div class="space-y-2">
            <Label for="communicationStyle">Communication Style</Label>
            <Select
              v-if="isEditing"
              v-model="mentorData.communicationStyle"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="style in communicationStyles"
                  :key="style.value"
                  :value="style.value"
                >
                  {{ style.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :value="communicationStyles.find(s => s.value === mentorData.communicationStyle)?.label"
              readonly
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Preferred Session Types</Label>
          <TagInput
            v-model="mentorData.preferredSessionTypes"
            :suggestions="sessionTypes"
            :readonly="!isEditing"
            placeholder="Add preferred session types..."
            :max-tags="8"
          />
          <p class="text-sm text-muted-foreground">
            What types of mentoring sessions do you prefer to conduct?
          </p>
        </div>

        <!-- Mentoring Philosophy -->
        <div class="space-y-2">
          <Label for="philosophy">Mentoring Philosophy</Label>
          <Textarea
            id="philosophy"
            v-model="mentorData.mentoringPhilosophy"
            :readonly="!isEditing"
            placeholder="Describe your approach to mentoring and what mentees can expect..."
            rows="4"
          />
          <p class="text-sm text-muted-foreground">
            {{ mentorData.mentoringPhilosophy?.length || 0 }}/300 characters
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Status Messages -->
    <Alert v-if="hasChanges && isEditing">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>
        You have unsaved changes. Make sure to save your mentor profile before leaving this page.
      </AlertDescription>
    </Alert>

    <Alert v-if="!isEditing && !hasChanges">
      <CheckCircle class="h-4 w-4" />
      <AlertDescription>
        Your mentor profile is up to date. {{ canEditProfile ? 'Click "Edit Profile" to make changes.' : '' }}
      </AlertDescription>
    </Alert>

    <!-- Profile Completeness -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Award class="h-5 w-5" />
          Profile Completeness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="space-y-1">
              <div class="text-2xl font-bold text-primary">{{ totalExpertise }}</div>
              <div class="text-sm text-muted-foreground">Skills & Expertise</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold text-primary">{{ formattedRate }}</div>
              <div class="text-sm text-muted-foreground">Hourly Rate</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold text-primary">{{ mentorData.averageRating.toFixed(1) }}/5</div>
              <div class="text-sm text-muted-foreground">Rating</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl font-bold text-primary">{{ mentorData.totalReviews }}</div>
              <div class="text-sm text-muted-foreground">Reviews</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template> 