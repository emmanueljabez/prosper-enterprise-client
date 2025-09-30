<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { Shield, Smartphone, Key, ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/store/modules/auth'

interface Props {
  mfaToken: string
  userEmail?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  verified: [token: string]
  cancelled: []
}>()

const authStore = useAuthStore()
const { toast } = useToast()

// Component state
const verificationCode = ref('')
const recoveryCode = ref('')
const isLoading = ref(false)
const useRecoveryCode = ref(false)
const attempts = ref(0)
const maxAttempts = 5
const isLocked = ref(false)

// Input refs for focus management
const codeInput = ref<HTMLInputElement>()
const recoveryInput = ref<HTMLInputElement>()

// Computed properties
const remainingAttempts = computed(() => maxAttempts - attempts.value)
const canSubmit = computed(() => {
  if (useRecoveryCode.value) {
    return recoveryCode.value.length >= 8 && !isLoading.value && !isLocked.value
  }
  return verificationCode.value.length === 6 && !isLoading.value && !isLocked.value
})

// Verify MFA code
const verifyMFACode = async () => {
  if (!canSubmit.value) return

  isLoading.value = true
  attempts.value++

  try {
    const code = useRecoveryCode.value ? recoveryCode.value : verificationCode.value
    
    const result = await authStore.verifyMFA({
      token: props.mfaToken,
      code: code
    })

    // Success - emit verified event with new token
    emit('verified', result.token || result.jwtToken)

    toast({
      title: 'Verification Successful',
      description: 'You have been successfully authenticated',
      variant: 'success'
    })

  } catch (error: any) {
    console.error('MFA verification error:', error)
    
    // Handle different error types
    if (error.message?.includes('invalid') || error.message?.includes('expired')) {
      toast({
        title: 'Invalid Code',
        description: useRecoveryCode.value 
          ? 'Invalid recovery code. Please check and try again.'
          : 'Invalid or expired verification code. Please enter a new code from your authenticator app.',
        variant: 'destructive'
      })
    } else if (error.message?.includes('used')) {
      toast({
        title: 'Code Already Used',
        description: 'This recovery code has already been used. Please try a different one.',
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify code. Please try again.',
        variant: 'destructive'
      })
    }

    // Check if account should be locked
    if (attempts.value >= maxAttempts) {
      isLocked.value = true
      toast({
        title: 'Account Temporarily Locked',
        description: `Too many failed attempts. Please try again in 15 minutes or contact support.`,
        variant: 'destructive'
      })
    }

    // Clear the input
    if (useRecoveryCode.value) {
      recoveryCode.value = ''
    } else {
      verificationCode.value = ''
    }
  } finally {
    isLoading.value = false
  }
}

// Switch between code types
const switchToRecoveryCode = async () => {
  useRecoveryCode.value = true
  verificationCode.value = ''
  await nextTick()
  recoveryInput.value?.focus()
}

const switchToAuthenticatorCode = async () => {
  useRecoveryCode.value = false
  recoveryCode.value = ''
  await nextTick()
  codeInput.value?.focus()
}

// Handle input formatting
const formatVerificationCode = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')
  verificationCode.value = value.slice(0, 6)
}

const formatRecoveryCode = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  recoveryCode.value = value.slice(0, 16)
}

// Handle keyboard events
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && canSubmit.value) {
    verifyMFACode()
  }
}

// Focus management
onMounted(async () => {
  await nextTick()
  codeInput.value?.focus()
})
</script>

<template>
  <div class="max-w-md mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="flex items-center justify-center gap-2">
        <Shield class="h-8 w-8 text-primary" />
        <h1 class="text-2xl font-bold">Two-Factor Authentication</h1>
      </div>
      <p class="text-muted-foreground">
        Enter your verification code to continue
      </p>
    </div>

    <!-- Main Verification Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Smartphone v-if="!useRecoveryCode" class="h-5 w-5" />
          <Key v-else class="h-5 w-5" />
          {{ useRecoveryCode ? 'Recovery Code' : 'Authenticator Code' }}
        </CardTitle>
        <CardDescription>
          {{ useRecoveryCode 
            ? 'Enter one of your recovery codes to access your account'
            : 'Open your authenticator app and enter the 6-digit code'
          }}
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <!-- Account Locked Alert -->
        <Alert v-if="isLocked" variant="destructive">
          <Shield class="h-4 w-4" />
          <AlertDescription>
            Account temporarily locked due to too many failed attempts. Please try again in 15 minutes or contact support.
          </AlertDescription>
        </Alert>

        <!-- Attempts Warning -->
        <Alert v-else-if="attempts > 0 && attempts < maxAttempts" variant="destructive">
          <AlertDescription>
            {{ remainingAttempts }} {{ remainingAttempts === 1 ? 'attempt' : 'attempts' }} remaining before account lock.
          </AlertDescription>
        </Alert>

        <!-- Authenticator Code Input -->
        <div v-if="!useRecoveryCode" class="space-y-3">
          <Label for="verification-code">6-digit verification code</Label>
          <Input
            id="verification-code"
            ref="codeInput"
            v-model="verificationCode"
            @input="formatVerificationCode"
            @keydown="handleKeyDown"
            placeholder="000000"
            maxlength="6"
            class="text-center text-2xl tracking-[0.5em] font-mono"
            :disabled="isLoading || isLocked"
            autocomplete="one-time-code"
          />
          <p class="text-xs text-muted-foreground text-center">
            Code expires in 30 seconds
          </p>
        </div>

        <!-- Recovery Code Input -->
        <div v-if="useRecoveryCode" class="space-y-3">
          <Label for="recovery-code">Recovery code</Label>
          <Input
            id="recovery-code"
            ref="recoveryInput"
            v-model="recoveryCode"
            @input="formatRecoveryCode"
            @keydown="handleKeyDown"
            placeholder="xxxxxxxx"
            maxlength="16"
            class="text-center text-lg tracking-wider font-mono"
            :disabled="isLoading || isLocked"
            autocomplete="one-time-code"
          />
          <p class="text-xs text-muted-foreground text-center">
            Enter one of your 8-character recovery codes
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button 
            @click="verifyMFACode"
            :disabled="!canSubmit"
            class="w-full"
            :loading="isLoading"
          >
            {{ isLoading ? 'Verifying...' : 'Verify & Continue' }}
          </Button>

          <!-- Switch Code Type -->
          <div class="text-center">
            <Button
              v-if="!useRecoveryCode"
              variant="link"
              @click="switchToRecoveryCode"
              :disabled="isLoading || isLocked"
              class="text-sm"
            >
              Use recovery code instead
            </Button>
            <Button
              v-else
              variant="link"
              @click="switchToAuthenticatorCode"
              :disabled="isLoading || isLocked"
              class="text-sm"
            >
              <ArrowLeft class="h-3 w-3 mr-1" />
              Use authenticator code
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Help Section -->
    <Card variant="outline">
      <CardContent class="pt-6">
        <div class="space-y-3">
          <h4 class="font-medium text-sm">Need help?</h4>
          <div class="space-y-2 text-xs text-muted-foreground">
            <p>• Make sure your device's time is correct</p>
            <p>• Try generating a new code in your authenticator app</p>
            <p>• Use a recovery code if you can't access your authenticator</p>
            <p>• Contact support if you've lost access to both</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Cancel Button -->
    <div class="text-center">
      <Button
        variant="ghost"
        @click="emit('cancelled')"
        :disabled="isLoading"
        class="text-sm"
      >
        Cancel and logout
      </Button>
    </div>
  </div>
</template> 