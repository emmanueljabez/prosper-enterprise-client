<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { Copy, Check, Smartphone, Shield, Key } from 'lucide-vue-next'

interface Props {
  userId: string
  userEmail: string
  isRequired?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isRequired: false
})

const emit = defineEmits<{
  setupComplete: [secret: string, recoveryCodes: string[]]
  setupCancelled: []
}>()

const { toast } = useToast()

// MFA Setup State
const currentStep = ref(1)
const isLoading = ref(false)
const secret = ref('')
const qrCodeUrl = ref('')
const verificationCode = ref('')
const recoveryCodes = ref<string[]>([])
const isVerified = ref(false)
const copiedItems = ref<Set<string>>(new Set())

// Generate MFA secret and QR code
const generateMFASecret = async () => {
  isLoading.value = true
  try {
    // In a real implementation, this would call the backend
    const response = await fetch('/api/auth/mfa/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: props.userId,
        email: props.userEmail
      })
    })

    if (!response.ok) throw new Error('Failed to generate MFA secret')

    const data = await response.json()
    secret.value = data.secret
    qrCodeUrl.value = data.qrCodeUrl
    recoveryCodes.value = data.recoveryCodes

    currentStep.value = 2
  } catch (error: any) {
    toast({
      title: 'Setup Error',
      description: error.message || 'Failed to initialize MFA setup',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Verify MFA code
const verifyMFACode = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    toast({
      title: 'Invalid Code',
      description: 'Please enter a 6-digit code from your authenticator app',
      variant: 'destructive'
    })
    return
  }

  isLoading.value = true
  try {
    const response = await fetch('/api/auth/mfa/verify-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: props.userId,
        secret: secret.value,
        code: verificationCode.value
      })
    })

    if (!response.ok) throw new Error('Invalid verification code')

    isVerified.value = true
    currentStep.value = 3

    toast({
      title: 'Verification Successful',
      description: 'Your authenticator app has been successfully configured',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Verification Failed',
      description: error.message || 'Invalid verification code',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Complete MFA setup
const completeMFASetup = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/auth/mfa/complete-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId: props.userId,
        secret: secret.value
      })
    })

    if (!response.ok) throw new Error('Failed to complete MFA setup')

    emit('setupComplete', secret.value, recoveryCodes.value)

    toast({
      title: 'MFA Enabled',
      description: 'Multi-factor authentication has been successfully enabled for your account',
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Setup Error',
      description: error.message || 'Failed to complete MFA setup',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Copy to clipboard functionality
const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedItems.value.add(type)
    
    toast({
      title: 'Copied',
      description: `${type} copied to clipboard`,
      variant: 'success'
    })

    // Reset copied state after 2 seconds
    setTimeout(() => {
      copiedItems.value.delete(type)
    }, 2000)
  } catch (error) {
    toast({
      title: 'Copy Failed',
      description: 'Failed to copy to clipboard',
      variant: 'destructive'
    })
  }
}

// Format secret for manual entry
const formattedSecret = computed(() => {
  return secret.value.match(/.{1,4}/g)?.join(' ') || secret.value
})

// Initialize setup when component mounts
onMounted(() => {
  if (props.isRequired) {
    generateMFASecret()
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="flex items-center justify-center gap-2">
        <Shield class="h-8 w-8 text-primary" />
        <h1 class="text-2xl font-bold">Multi-Factor Authentication Setup</h1>
      </div>
      <p class="text-muted-foreground">
        Secure your account with an additional layer of protection
      </p>
    </div>

    <!-- Step 1: Introduction -->
    <Card v-if="currentStep === 1">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Shield class="h-5 w-5" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Multi-factor authentication adds an extra layer of security to your account by requiring a second form of verification.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Alert v-if="isRequired">
          <Shield class="h-4 w-4" />
          <AlertDescription>
            <strong>Required:</strong> As an administrator, multi-factor authentication is required for your account.
          </AlertDescription>
        </Alert>

        <div class="space-y-3">
          <h4 class="font-medium">What you'll need:</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-center gap-2">
              <Smartphone class="h-4 w-4" />
              An authenticator app (Google Authenticator, Authy, etc.)
            </li>
            <li class="flex items-center gap-2">
              <Key class="h-4 w-4" />
              A secure place to store recovery codes
            </li>
          </ul>
        </div>

        <div class="flex gap-2 pt-4">
          <Button 
            @click="generateMFASecret" 
            :disabled="isLoading"
            class="flex-1"
          >
            {{ isLoading ? 'Setting up...' : 'Begin Setup' }}
          </Button>
          <Button 
            v-if="!isRequired"
            variant="outline" 
            @click="emit('setupCancelled')"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 2: QR Code and Manual Setup -->
    <Card v-if="currentStep === 2">
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>
          Use your authenticator app to scan the QR code below
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- QR Code -->
        <div class="flex justify-center">
          <div class="p-4 bg-white rounded-lg border">
            <img 
              :src="qrCodeUrl" 
              alt="MFA QR Code"
              class="w-48 h-48"
            />
          </div>
        </div>

        <!-- Manual Entry Option -->
        <div class="space-y-3">
          <h4 class="font-medium">Can't scan the QR code?</h4>
          <p class="text-sm text-muted-foreground">
            Manually enter this secret key into your authenticator app:
          </p>
          <div class="flex items-center gap-2 p-3 bg-muted rounded-md">
            <code class="flex-1 text-sm font-mono">{{ formattedSecret }}</code>
            <Button
              variant="ghost"
              size="sm"
              @click="copyToClipboard(secret, 'Secret key')"
            >
              <Check v-if="copiedItems.has('Secret key')" class="h-4 w-4" />
              <Copy v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Verification Code Input -->
        <div class="space-y-3">
          <Label for="verification-code">Enter the 6-digit code from your app</Label>
          <Input
            id="verification-code"
            v-model="verificationCode"
            placeholder="000000"
            maxlength="6"
            class="text-center text-lg tracking-widest"
          />
        </div>

        <div class="flex gap-2">
          <Button 
            @click="verifyMFACode" 
            :disabled="isLoading || !verificationCode || verificationCode.length !== 6"
            class="flex-1"
          >
            {{ isLoading ? 'Verifying...' : 'Verify Code' }}
          </Button>
          <Button 
            variant="outline" 
            @click="currentStep = 1"
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 3: Recovery Codes -->
    <Card v-if="currentStep === 3">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Key class="h-5 w-5" />
          Save Your Recovery Codes
        </CardTitle>
        <CardDescription>
          Store these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <Alert>
          <Shield class="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Each recovery code can only be used once. Save them securely and treat them like passwords.
          </AlertDescription>
        </Alert>

        <!-- Recovery Codes -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-medium">Recovery Codes</h4>
            <Button
              variant="outline"
              size="sm"
              @click="copyToClipboard(recoveryCodes.join('\n'), 'Recovery codes')"
            >
              <Check v-if="copiedItems.has('Recovery codes')" class="h-4 w-4 mr-2" />
              <Copy v-else class="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>
          
          <div class="grid grid-cols-2 gap-2 p-4 bg-muted rounded-md">
            <div
              v-for="(code, index) in recoveryCodes"
              :key="index"
              class="font-mono text-sm text-center p-2 bg-background rounded border"
            >
              {{ code }}
            </div>
          </div>
        </div>

        <!-- Final Steps -->
        <div class="space-y-3">
          <h4 class="font-medium">Next Steps</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>✅ Download and print these recovery codes</li>
            <li>✅ Store them in a secure location (password manager, safe, etc.)</li>
            <li>✅ Test your authenticator app before closing this setup</li>
          </ul>
        </div>

        <Button 
          @click="completeMFASetup" 
          :disabled="isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Completing Setup...' : 'Complete Setup' }}
        </Button>
      </CardContent>
    </Card>

    <!-- Success State -->
    <Card v-if="currentStep === 4">
      <CardContent class="text-center py-8">
        <div class="space-y-4">
          <div class="flex justify-center">
            <div class="p-3 bg-green-100 rounded-full">
              <Check class="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-semibold">MFA Setup Complete!</h3>
            <p class="text-muted-foreground">
              Your account is now protected with multi-factor authentication.
            </p>
          </div>
          <Badge variant="secondary" class="text-sm">
            <Shield class="h-3 w-3 mr-1" />
            Account Secured
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>
</template> 