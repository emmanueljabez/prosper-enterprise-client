<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Progress } from '@/components/ui/progress' // Removed - using custom progress bar
import { useSessionManager } from '@/utils/sessionManager'
import { Clock, Shield, LogOut, RotateCcw } from 'lucide-vue-next'

const sessionManager = useSessionManager()

// Computed properties
const isVisible = computed(() => sessionManager.isWarningShown.value)
const timeRemaining = computed(() => sessionManager.timeRemaining.value)

const minutesRemaining = computed(() => Math.floor(timeRemaining.value / 60))
const secondsRemaining = computed(() => timeRemaining.value % 60)

const progressPercentage = computed(() => {
  const maxWarningTime = 5 * 60 // 5 minutes in seconds
  return Math.max(0, (timeRemaining.value / maxWarningTime) * 100)
})

const urgencyLevel = computed(() => {
  if (timeRemaining.value <= 60) return 'critical' // Last minute
  if (timeRemaining.value <= 120) return 'high' // Last 2 minutes
  return 'medium'
})

const warningMessage = computed(() => {
  if (timeRemaining.value <= 30) {
    return 'Your session will expire in seconds!'
  } else if (timeRemaining.value <= 60) {
    return 'Your session is about to expire!'
  } else if (timeRemaining.value <= 120) {
    return 'Your session will expire soon.'
  } else {
    return 'Your session will expire due to inactivity.'
  }
})

// Format time display
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `${secs}s`
}

// Actions
const extendSession = () => {
  sessionManager.extendSession()
}

const logoutNow = () => {
  sessionManager.forceLogout()
}

// Sound notification for critical warnings
let audioContext: AudioContext | null = null
let warningSound: OscillatorNode | null = null

const playWarningSound = () => {
  if (typeof window === 'undefined') return
  
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Create a gentle warning tone
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.warn('Could not play warning sound:', error)
  }
}

// Watch for critical time and play sound
watch(timeRemaining, (newTime, oldTime) => {
  // Play sound when entering critical phase (60 seconds)
  if (oldTime && oldTime > 60 && newTime <= 60) {
    playWarningSound()
  }
  
  // Play sound again at 30 seconds
  if (oldTime && oldTime > 30 && newTime <= 30) {
    playWarningSound()
  }
})

// Cleanup
onUnmounted(() => {
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-description"
    >
      <Card 
        class="w-full max-w-md mx-auto shadow-lg border-2"
        :class="{
          'border-yellow-500': urgencyLevel === 'medium',
          'border-orange-500': urgencyLevel === 'high',
          'border-red-500 animate-pulse': urgencyLevel === 'critical'
        }"
      >
        <CardHeader class="text-center pb-4">
          <div class="flex items-center justify-center gap-2 mb-2">
            <Clock 
              class="h-8 w-8"
              :class="{
                'text-yellow-600': urgencyLevel === 'medium',
                'text-orange-600': urgencyLevel === 'high',
                'text-red-600': urgencyLevel === 'critical'
              }"
            />
            <Shield class="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle 
            id="session-warning-title"
            class="text-xl"
            :class="{
              'text-yellow-700': urgencyLevel === 'medium',
              'text-orange-700': urgencyLevel === 'high',
              'text-red-700': urgencyLevel === 'critical'
            }"
          >
            Session Expiring
          </CardTitle>
          <CardDescription id="session-warning-description">
            {{ warningMessage }}
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Time Remaining Display -->
          <div class="text-center space-y-3">
            <div 
              class="text-4xl font-mono font-bold"
              :class="{
                'text-yellow-600': urgencyLevel === 'medium',
                'text-orange-600': urgencyLevel === 'high',
                'text-red-600': urgencyLevel === 'critical'
              }"
              aria-live="polite"
            >
              {{ formatTime(timeRemaining) }}
            </div>
            
            <!-- Progress Bar -->
            <div class="space-y-2">
              <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="{
                    'bg-yellow-500': urgencyLevel === 'medium',
                    'bg-orange-500': urgencyLevel === 'high',
                    'bg-red-500': urgencyLevel === 'critical'
                  }"
                  :style="`width: ${progressPercentage}%`"
                ></div>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ minutesRemaining > 0 ? `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}` : '' }}
                {{ minutesRemaining > 0 && secondsRemaining > 0 ? ' and ' : '' }}
                {{ secondsRemaining > 0 || minutesRemaining === 0 ? `${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''}` : '' }}
                remaining
              </p>
            </div>
          </div>

          <!-- Warning Alert -->
          <Alert 
            :variant="urgencyLevel === 'critical' ? 'destructive' : 'default'"
            class="border-l-4"
            :class="{
              'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20': urgencyLevel === 'medium',
              'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20': urgencyLevel === 'high',
              'border-l-red-500': urgencyLevel === 'critical'
            }"
          >
            <Shield class="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> 
              Your session will automatically log out to protect your account. 
              {{ urgencyLevel === 'critical' ? 'Act now to stay logged in!' : 'Click "Stay Logged In" to continue your session.' }}
            </AlertDescription>
          </Alert>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <Button 
              @click="extendSession"
              :variant="urgencyLevel === 'critical' ? 'default' : 'default'"
              class="flex items-center gap-2"
              :class="{
                'bg-primary hover:bg-primary/90': urgencyLevel !== 'critical',
                'bg-green-600 hover:bg-green-700 text-white': urgencyLevel === 'critical'
              }"
            >
              <RotateCcw class="h-4 w-4" />
              Stay Logged In
            </Button>
            
            <Button 
              @click="logoutNow"
              variant="outline"
              class="flex items-center gap-2"
            >
              <LogOut class="h-4 w-4" />
              Logout Now
            </Button>
          </div>

          <!-- Additional Information -->
          <div class="text-center space-y-2">
            <p class="text-xs text-muted-foreground">
              Any mouse movement, keyboard input, or page interaction will extend your session.
            </p>
            <div class="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                Active
              </span>
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                Warning
              </span>
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-red-500"></div>
                Critical
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes pulse-border {
  0%, 100% {
    border-color: rgb(239 68 68);
  }
  50% {
    border-color: rgb(248 113 113);
  }
}

.animate-pulse {
  animation: pulse-border 1s ease-in-out infinite;
}
</style> 