<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { Shield, Smartphone, Key, AlertTriangle, Check, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/store/modules/auth'
import { RoleManager } from '@/utils/roleManager'
import MFASetup from './MFASetup.vue'

interface Props {
  userId: string
  showSetup?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSetup: false
})

const authStore = useAuthStore()
const { toast } = useToast()

// Component state
const isLoading = ref(false)
const showMFASetup = ref(props.showSetup)
const mfaStatus = ref({
  enabled: false,
  setupAt: null as string | null,
  lastUsed: null as string | null,
  recoveryCodesCount: 0
})

// Computed properties
const user = computed(() => authStore.loggedInUser)
const isMFARequired = computed(() => {
  return user.value && RoleManager.isCorporateAdmin(user.value)
})

const mfaStatusBadge = computed(() => {
  if (mfaStatus.value.enabled) {
    return { text: 'Enabled', variant: 'default', icon: Shield }
  } else if (isMFARequired.value) {
    return { text: 'Required', variant: 'destructive', icon: AlertTriangle }
  } else {
    return { text: 'Disabled', variant: 'secondary', icon: Settings }
  }
})

// Load MFA status
const loadMFAStatus = async () => {
  if (!user.value) return

  isLoading.value = true
  try {
    const status = await authStore.getMFAStatus(props.userId)
    mfaStatus.value = {
      enabled: status.enabled || user.value.mfaEnabled || false,
      setupAt: status.setupAt || user.value.mfaSetupAt || null,
      lastUsed: status.lastUsed || null,
      recoveryCodesCount: status.recoveryCodesCount || user.value.mfaRecoveryCodesCount || 0
    }
  } catch (error) {
    // Use user data as fallback
    mfaStatus.value = {
      enabled: user.value.mfaEnabled || false,
      setupAt: user.value.mfaSetupAt || null,
      lastUsed: null,
      recoveryCodesCount: user.value.mfaRecoveryCodesCount || 0
    }
  } finally {
    isLoading.value = false
  }
}

// Setup MFA
const startMFASetup = () => {
  showMFASetup.value = true
}

// Handle MFA setup completion
const handleMFASetupComplete = async (secret: string, recoveryCodes: string[]) => {
  try {
    await authStore.completeMFASetup(props.userId, secret)
    
    // Update local status
    mfaStatus.value.enabled = true
    mfaStatus.value.setupAt = new Date().toISOString()
    mfaStatus.value.recoveryCodesCount = recoveryCodes.length
    
    showMFASetup.value = false
    
    toast({
      title: 'MFA Enabled',
      description: 'Multi-factor authentication has been successfully enabled',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Setup Failed',
      description: error.message || 'Failed to complete MFA setup',
      variant: 'destructive'
    })
  }
}

// Handle MFA setup cancellation
const handleMFASetupCancelled = () => {
  if (isMFARequired.value) {
    toast({
      title: 'Setup Required',
      description: 'MFA setup is required for your account role',
      variant: 'destructive'
    })
    return
  }
  
  showMFASetup.value = false
}

// Disable MFA
const disableMFA = async () => {
  if (isMFARequired.value) {
    toast({
      title: 'Cannot Disable',
      description: 'MFA is required for your account role and cannot be disabled',
      variant: 'destructive'
    })
    return
  }

  // In a real implementation, this would require password confirmation
  const confirmed = confirm('Are you sure you want to disable multi-factor authentication? This will make your account less secure.')
  
  if (!confirmed) return

  isLoading.value = true
  try {
    // This would normally require password confirmation
    await authStore.disableMFA(props.userId, 'password')
    
    mfaStatus.value.enabled = false
    mfaStatus.value.setupAt = null
    mfaStatus.value.recoveryCodesCount = 0
    
    toast({
      title: 'MFA Disabled',
      description: 'Multi-factor authentication has been disabled',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Disable Failed',
      description: error.message || 'Failed to disable MFA',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Regenerate recovery codes
const regenerateRecoveryCodes = async () => {
  isLoading.value = true
  try {
    const response = await authStore.regenerateRecoveryCodes?.(props.userId)
    
    mfaStatus.value.recoveryCodesCount = response?.recoveryCodes?.length || 10
    
    toast({
      title: 'Recovery Codes Regenerated',
      description: 'New recovery codes have been generated. Make sure to save them securely.',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Regeneration Failed',
      description: error.message || 'Failed to regenerate recovery codes',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
}

// Load status on mount
onMounted(() => {
  loadMFAStatus()
})
</script>

<template>
  <div class="space-y-6">
    <!-- MFA Setup Modal -->
    <div v-if="showMFASetup" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <MFASetup
          :user-id="userId"
          :user-email="user?.email || ''"
          :is-required="isMFARequired"
          @setup-complete="handleMFASetupComplete"
          @setup-cancelled="handleMFASetupCancelled"
        />
      </div>
    </div>

    <!-- MFA Status Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Shield class="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Secure your account with an additional layer of protection
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Current Status -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="font-medium">Current Status</p>
            <div class="flex items-center gap-2">
              <Badge 
                :variant="mfaStatusBadge.variant as any"
                class="flex items-center gap-1"
              >
                <component :is="mfaStatusBadge.icon" class="h-3 w-3" />
                {{ mfaStatusBadge.text }}
              </Badge>
              <span v-if="mfaStatus.setupAt" class="text-sm text-muted-foreground">
                since {{ formatDate(mfaStatus.setupAt) }}
              </span>
            </div>
          </div>

          <!-- Toggle/Setup Button -->
          <div v-if="!mfaStatus.enabled">
            <Button 
              @click="startMFASetup"
              :disabled="isLoading"
            >
              {{ isMFARequired ? 'Setup Required' : 'Enable MFA' }}
            </Button>
          </div>
        </div>

        <!-- Required Warning -->
        <Alert v-if="isMFARequired && !mfaStatus.enabled" variant="destructive">
          <AlertTriangle class="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> Multi-factor authentication is required for your account role. Please complete the setup to continue using administrative features.
          </AlertDescription>
        </Alert>

        <!-- MFA Details -->
        <div v-if="mfaStatus.enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <h4 class="font-medium flex items-center gap-2">
              <Smartphone class="h-4 w-4" />
              Authenticator App
            </h4>
            <p class="text-sm text-muted-foreground">
              Using TOTP (Time-based One-Time Password)
            </p>
            <p class="text-xs text-muted-foreground">
              Last used: {{ formatDate(mfaStatus.lastUsed) }}
            </p>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium flex items-center gap-2">
              <Key class="h-4 w-4" />
              Recovery Codes
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ mfaStatus.recoveryCodesCount }} codes available
            </p>
            <Button
              variant="outline"
              size="sm"
              @click="regenerateRecoveryCodes"
              :disabled="isLoading"
            >
              Regenerate Codes
            </Button>
          </div>
        </div>

        <!-- Management Actions -->
        <div v-if="mfaStatus.enabled" class="border-t pt-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Manage MFA</h4>
              <p class="text-sm text-muted-foreground">
                Update your multi-factor authentication settings
              </p>
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                @click="startMFASetup"
                :disabled="isLoading"
              >
                Reconfigure
              </Button>
              <Button
                v-if="!isMFARequired"
                variant="destructive"
                @click="disableMFA"
                :disabled="isLoading"
              >
                Disable MFA
              </Button>
            </div>
          </div>
        </div>

        <!-- Information -->
        <div class="bg-muted p-4 rounded-lg">
          <h4 class="font-medium mb-2">About Multi-Factor Authentication</h4>
          <ul class="text-sm text-muted-foreground space-y-1">
            <li>• Adds an extra layer of security to your account</li>
            <li>• Requires both your password and a verification code</li>
            <li>• Works with popular authenticator apps like Google Authenticator</li>
            <li>• {{ isMFARequired ? 'Required for administrative accounts' : 'Optional but highly recommended' }}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template> 