<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import { User, Upload, Save, Edit3, CheckCircle, AlertTriangle, Camera, X } from 'lucide-vue-next'
import type { User as UserType } from '@/types/auth'

interface Props {
  userId?: string
  readonly?: boolean
  showRoleManagement?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  showRoleManagement: false
})

const emit = defineEmits<{
  profileUpdated: [user: UserType]
  profilePhotoUpdated: [photoUrl: string]
}>()

const authStore = useAuthStore()
const { toast } = useToast()

// Component state
const isEditing = ref(!props.readonly)
const isLoading = ref(false)
const isSaving = ref(false)
const hasChanges = ref(false)
const uploadingPhoto = ref(false)

// Form data
const profileData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  jobTitle: '',
  department: '',
  location: '',
  bio: '',
  timezone: '',
  preferredLanguage: 'en',
  linkedinUrl: '',
  twitterUrl: '',
  websiteUrl: ''
})

// Profile photo
const profilePhoto = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const photoUploadRef = ref<HTMLInputElement>()

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

const userInitials = computed(() => {
  if (!currentUser.value) return 'U'
  const first = profileData.value.firstName || currentUser.value.firstName || ''
  const last = profileData.value.lastName || currentUser.value.lastName || ''
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || currentUser.value.email.charAt(0).toUpperCase()
})

const fullName = computed(() => {
  const first = profileData.value.firstName || ''
  const last = profileData.value.lastName || ''
  return `${first} ${last}`.trim() || currentUser.value?.email || 'User'
})

const userRoles = computed(() => {
  return currentUser.value?.roles || []
})

const canEditProfile = computed(() => {
  if (props.readonly) return false
  if (!currentUser.value) return false
  
  // Users can edit their own profile, admins can edit any profile
  return props.userId === currentUser.value.id || 
         RoleManager.isCorporateAdmin(currentUser.value)
})

// Timezone options
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
]

// Language options
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' }
]

// Validation rules
const validateForm = () => {
  const newErrors: Record<string, string> = {}

  if (!profileData.value.firstName?.trim()) {
    newErrors.firstName = 'First name is required'
  }

  if (!profileData.value.lastName?.trim()) {
    newErrors.lastName = 'Last name is required'
  }

  if (!profileData.value.email?.trim()) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  }

  if (profileData.value.phoneNumber && !/^[\+]?[\d\s\-\(\)]+$/.test(profileData.value.phoneNumber)) {
    newErrors.phoneNumber = 'Please enter a valid phone number'
  }

  if (profileData.value.linkedinUrl && !isValidUrl(profileData.value.linkedinUrl)) {
    newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL'
  }

  if (profileData.value.twitterUrl && !isValidUrl(profileData.value.twitterUrl)) {
    newErrors.twitterUrl = 'Please enter a valid Twitter URL'
  }

  if (profileData.value.websiteUrl && !isValidUrl(profileData.value.websiteUrl)) {
    newErrors.websiteUrl = 'Please enter a valid website URL'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Watch for changes
watch(profileData, () => {
  hasChanges.value = true
}, { deep: true })

// Profile photo handling
const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'Invalid File',
      description: 'Please select an image file',
      variant: 'destructive'
    })
    return
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: 'File Too Large',
      description: 'Please select an image smaller than 5MB',
      variant: 'destructive'
    })
    return
  }

  photoFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    profilePhoto.value = e.target?.result as string
    hasChanges.value = true
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  profilePhoto.value = null
  photoFile.value = null
  hasChanges.value = true
  if (photoUploadRef.value) {
    photoUploadRef.value.value = ''
  }
}

// Upload photo to server
const uploadPhoto = async (): Promise<string | null> => {
  if (!photoFile.value) return profilePhoto.value

  uploadingPhoto.value = true
  try {
    const formData = new FormData()
    formData.append('photo', photoFile.value)
    formData.append('userId', currentUser.value?.id || '')

    const response = await fetch('/api/profile/upload-photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')

    const data = await response.json()
    const photoUrl = data.photoUrl

    emit('profilePhotoUpdated', photoUrl)
    return photoUrl
  } catch (error: any) {
    console.error('Photo upload error:', error)
    toast({
      title: 'Upload Failed',
      description: error.message || 'Failed to upload photo',
      variant: 'destructive'
    })
    return null
  } finally {
    uploadingPhoto.value = false
  }
}

// Load profile data
const loadProfile = async () => {
  if (!currentUser.value) return

  isLoading.value = true
  try {
    // In a real app, this would fetch from API
    profileData.value = {
      firstName: currentUser.value.firstName || '',
      lastName: currentUser.value.lastName || '',
      email: currentUser.value.email || '',
      phoneNumber: '',
      jobTitle: '',
      department: '',
      location: '',
      bio: '',
      timezone: 'UTC',
      preferredLanguage: 'en',
      linkedinUrl: '',
      twitterUrl: '',
      websiteUrl: ''
    }
    
    profilePhoto.value = currentUser.value.picture || null
    hasChanges.value = false
  } catch (error: any) {
    toast({
      title: 'Load Failed',
      description: error.message || 'Failed to load profile',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Save profile
const saveProfile = async () => {
  if (!validateForm()) {
    toast({
      title: 'Validation Error',
      description: 'Please fix the errors before saving',
      variant: 'destructive'
    })
    return
  }

  isSaving.value = true
  try {
    // Upload photo first if changed
    let photoUrl = profilePhoto.value
    if (photoFile.value) {
      photoUrl = await uploadPhoto()
    }

    // Save profile data
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...profileData.value,
        picture: photoUrl
      })
    })

    if (!response.ok) throw new Error('Save failed')

    const updatedUser = await response.json()
    
    // Update auth store
    if (authStore.loggedInUser) {
      authStore.loggedInUser = {
        ...authStore.loggedInUser,
        ...profileData.value,
        picture: photoUrl
      }
    }

    emit('profileUpdated', updatedUser)
    hasChanges.value = false
    
    toast({
      title: 'Profile Saved',
      description: 'Your profile has been updated successfully',
      variant: 'success'
    })

    if (props.readonly) {
      isEditing.value = false
    }
  } catch (error: any) {
    toast({
      title: 'Save Failed',
      description: error.message || 'Failed to save profile',
      variant: 'destructive'
    })
  } finally {
    isSaving.value = false
  }
}

// Cancel editing
const cancelEdit = () => {
  loadProfile()
  isEditing.value = false
  hasChanges.value = false
  errors.value = {}
}

// Toggle edit mode
const toggleEdit = () => {
  if (isEditing.value && hasChanges.value) {
    const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?')
    if (!confirmed) return
  }
  
  if (isEditing.value) {
    cancelEdit()
  } else {
    isEditing.value = true
  }
}

// Initialize
onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Profile Header -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <Avatar class="h-20 w-20">
                <AvatarImage :src="profilePhoto || undefined" :alt="fullName" />
                <AvatarFallback class="text-lg">{{ userInitials }}</AvatarFallback>
              </Avatar>
              
              <!-- Photo Upload/Edit Button -->
              <Button
                v-if="isEditing && canEditProfile"
                @click="photoUploadRef?.click()"
                size="sm"
                variant="outline"
                class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                :disabled="uploadingPhoto"
              >
                <Camera class="h-3 w-3" />
              </Button>
              
              <!-- Remove Photo Button -->
              <Button
                v-if="isEditing && profilePhoto && canEditProfile"
                @click="removePhoto"
                size="sm"
                variant="destructive"
                class="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              >
                <X class="h-3 w-3" />
              </Button>
              
              <!-- Hidden file input -->
              <input
                ref="photoUploadRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handlePhotoUpload"
              />
            </div>
            
            <div class="space-y-2">
              <div>
                <h1 class="text-2xl font-bold">{{ fullName }}</h1>
                <p class="text-muted-foreground">{{ profileData.email }}</p>
              </div>
              
              <!-- User Roles -->
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="role in userRoles"
                  :key="role.id"
                  variant="secondary"
                  class="flex items-center gap-1"
                >
                  <User class="h-3 w-3" />
                  {{ role.displayName }}
                </Badge>
              </div>
            </div>
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
                @click="saveProfile"
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

    <!-- Profile Form -->
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          {{ isEditing ? 'Update your personal details and contact information' : 'Your personal details and contact information' }}
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="firstName">First Name *</Label>
            <Input
              id="firstName"
              v-model="profileData.firstName"
              :readonly="!isEditing"
              :class="{ 'border-red-500': errors.firstName }"
            />
            <p v-if="errors.firstName" class="text-sm text-red-500">{{ errors.firstName }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="lastName">Last Name *</Label>
            <Input
              id="lastName"
              v-model="profileData.lastName"
              :readonly="!isEditing"
              :class="{ 'border-red-500': errors.lastName }"
            />
            <p v-if="errors.lastName" class="text-sm text-red-500">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="email">Email Address *</Label>
            <Input
              id="email"
              v-model="profileData.email"
              type="email"
              :readonly="!isEditing"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="text-sm text-red-500">{{ errors.email }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              v-model="profileData.phoneNumber"
              type="tel"
              :readonly="!isEditing"
              :class="{ 'border-red-500': errors.phoneNumber }"
              placeholder="+1 (555) 123-4567"
            />
            <p v-if="errors.phoneNumber" class="text-sm text-red-500">{{ errors.phoneNumber }}</p>
          </div>
        </div>

        <!-- Professional Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              v-model="profileData.jobTitle"
              :readonly="!isEditing"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="department">Department</Label>
            <Input
              id="department"
              v-model="profileData.department"
              :readonly="!isEditing"
              placeholder="e.g. Engineering"
            />
          </div>
        </div>

        <!-- Location and Preferences -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="location">Location</Label>
            <Input
              id="location"
              v-model="profileData.location"
              :readonly="!isEditing"
              placeholder="e.g. San Francisco, CA"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="timezone">Timezone</Label>
            <Select
              v-if="isEditing"
              v-model="profileData.timezone"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="tz in timezones"
                  :key="tz.value"
                  :value="tz.value"
                >
                  {{ tz.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-else
              :value="timezones.find(tz => tz.value === profileData.timezone)?.label || profileData.timezone"
              readonly
            />
          </div>
        </div>

        <!-- Bio -->
        <div class="space-y-2">
          <Label for="bio">Bio</Label>
          <Textarea
            id="bio"
            v-model="profileData.bio"
            :readonly="!isEditing"
            placeholder="Tell us about yourself..."
            rows="4"
          />
          <p class="text-sm text-muted-foreground">
            {{ profileData.bio?.length || 0 }}/500 characters
          </p>
        </div>

        <!-- Language Preference -->
        <div class="space-y-2">
          <Label for="language">Preferred Language</Label>
          <Select
            v-if="isEditing"
            v-model="profileData.preferredLanguage"
          >
            <SelectTrigger class="max-w-xs">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="lang in languages"
                :key="lang.value"
                :value="lang.value"
              >
                {{ lang.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            v-else
            :value="languages.find(lang => lang.value === profileData.preferredLanguage)?.label || profileData.preferredLanguage"
            readonly
            class="max-w-xs"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Social Links -->
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Connect your social media and professional profiles
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="linkedinUrl">LinkedIn Profile</Label>
          <Input
            id="linkedinUrl"
            v-model="profileData.linkedinUrl"
            :readonly="!isEditing"
            :class="{ 'border-red-500': errors.linkedinUrl }"
            placeholder="https://linkedin.com/in/yourprofile"
          />
          <p v-if="errors.linkedinUrl" class="text-sm text-red-500">{{ errors.linkedinUrl }}</p>
        </div>
        
        <div class="space-y-2">
          <Label for="twitterUrl">Twitter Profile</Label>
          <Input
            id="twitterUrl"
            v-model="profileData.twitterUrl"
            :readonly="!isEditing"
            :class="{ 'border-red-500': errors.twitterUrl }"
            placeholder="https://twitter.com/yourusername"
          />
          <p v-if="errors.twitterUrl" class="text-sm text-red-500">{{ errors.twitterUrl }}</p>
        </div>
        
        <div class="space-y-2">
          <Label for="websiteUrl">Personal Website</Label>
          <Input
            id="websiteUrl"
            v-model="profileData.websiteUrl"
            :readonly="!isEditing"
            :class="{ 'border-red-500': errors.websiteUrl }"
            placeholder="https://yourwebsite.com"
          />
          <p v-if="errors.websiteUrl" class="text-sm text-red-500">{{ errors.websiteUrl }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Status Messages -->
    <Alert v-if="hasChanges && isEditing">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>
        You have unsaved changes. Make sure to save your profile before leaving this page.
      </AlertDescription>
    </Alert>

    <Alert v-if="!isEditing && !hasChanges">
      <CheckCircle class="h-4 w-4" />
      <AlertDescription>
        Your profile is up to date. {{ canEditProfile ? 'Click "Edit Profile" to make changes.' : '' }}
      </AlertDescription>
    </Alert>
  </div>
</template> 