<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSessionManager } from '@/utils/sessionManager'
import { Shield, Clock, Activity, AlertTriangle, Settings } from 'lucide-vue-next'

interface Props {
  showInNavbar?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showInNavbar: false,
  compact: false
})

const sessionManager = useSessionManager()

// Session state
const sessionHealth = computed(() => {
  const timeRemaining = sessionManager.timeRemaining.value
  const isWarning = sessionManager.isWarningShown.value
  
  if (isWarning && timeRemaining <= 60) {
    return { status: 'critical', color: 'red', icon: AlertTriangle }
  } else if (isWarning && timeRemaining <= 300) { // 5 minutes
    return { status: 'warning', color: 'yellow', icon: Clock }
  } else {
    return { status: 'active', color: 'green', icon: Shield }
  }
})

const sessionTimeDisplay = computed(() => {
  if (!sessionManager.isWarningShown.value) {
    return 'Active'
  }
  
  const time = sessionManager.timeRemaining.value
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
})

// Mock additional session info (in real app, this would come from session manager)
const sessionInfo = ref({
  startTime: new Date().toLocaleTimeString(),
  lastActivity: 'Just now',
  ipAddress: '192.168.1.100',
  userAgent: 'Chrome 120.0',
  multiTabActive: true
})

const formatSessionDuration = () => {
  // Calculate session duration (mock)
  const startTime = new Date()
  startTime.setHours(startTime.getHours() - 2) // 2 hours ago
  const duration = Date.now() - startTime.getTime()
  const hours = Math.floor(duration / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Actions
const extendSession = () => {
  sessionManager.extendSession()
}

const openSessionSettings = () => {
  // This would open session management settings
  console.log('Open session settings')
}
</script>

<template>
  <!-- Navbar Version -->
  <div v-if="showInNavbar" class="flex items-center gap-2">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="flex items-center gap-2 h-8 px-2"
        >
          <component 
            :is="sessionHealth.icon" 
            class="h-3 w-3"
            :class="`text-${sessionHealth.color}-500`"
          />
          <span v-if="!compact" class="text-xs">
            {{ sessionTimeDisplay }}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80" align="end">
        <div class="space-y-4">
          <div class="space-y-2">
            <h4 class="font-medium leading-none">Session Status</h4>
            <p class="text-sm text-muted-foreground">
              Current session security information
            </p>
          </div>
          
          <!-- Quick Status -->
          <div class="flex items-center gap-2">
            <Badge 
              :variant="sessionHealth.status === 'critical' ? 'destructive' : 'default'"
              class="flex items-center gap-1"
            >
              <component :is="sessionHealth.icon" class="h-3 w-3" />
              {{ sessionHealth.status.charAt(0).toUpperCase() + sessionHealth.status.slice(1) }}
            </Badge>
            <span class="text-sm text-muted-foreground">
              {{ sessionTimeDisplay === 'Active' ? 'Session healthy' : `${sessionTimeDisplay} remaining` }}
            </span>
          </div>
          
          <!-- Session Details -->
          <div class="space-y-2 text-sm">
            <div class="grid grid-cols-2 gap-2">
              <span class="text-muted-foreground">Duration:</span>
              <span>{{ formatSessionDuration() }}</span>
              
              <span class="text-muted-foreground">Started:</span>
              <span>{{ sessionInfo.startTime }}</span>
              
              <span class="text-muted-foreground">Last Activity:</span>
              <span>{{ sessionInfo.lastActivity }}</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-2">
            <Button 
              v-if="sessionManager.isWarningShown.value"
              @click="extendSession"
              size="sm"
              class="flex-1"
            >
              Extend Session
            </Button>
            <Button 
              @click="openSessionSettings"
              variant="outline"
              size="sm"
            >
              <Settings class="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>

  <!-- Card Version -->
  <Card v-else class="w-full">
    <CardHeader class="pb-4">
      <CardTitle class="flex items-center gap-2">
        <Shield class="h-5 w-5" />
        Session Security
      </CardTitle>
      <CardDescription>
        Monitor your current session status and security
      </CardDescription>
    </CardHeader>
    
    <CardContent class="space-y-6">
      <!-- Current Status -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="font-medium">Current Status</p>
          <div class="flex items-center gap-2">
            <Badge 
              :variant="sessionHealth.status === 'critical' ? 'destructive' : 'default'"
              class="flex items-center gap-1"
            >
              <component :is="sessionHealth.icon" class="h-3 w-3" />
              {{ sessionHealth.status.charAt(0).toUpperCase() + sessionHealth.status.slice(1) }}
            </Badge>
            <span class="text-sm text-muted-foreground">
              {{ sessionTimeDisplay === 'Active' ? 'Session is active and secure' : `Session expires in ${sessionTimeDisplay}` }}
            </span>
          </div>
        </div>
        
        <Button 
          v-if="sessionManager.isWarningShown.value"
          @click="extendSession"
          variant="outline"
          size="sm"
        >
          Extend Session
        </Button>
      </div>

      <!-- Session Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <h4 class="font-medium flex items-center gap-2">
            <Clock class="h-4 w-4" />
            Session Details
          </h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Duration:</span>
              <span>{{ formatSessionDuration() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Started:</span>
              <span>{{ sessionInfo.startTime }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Last Activity:</span>
              <span>{{ sessionInfo.lastActivity }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium flex items-center gap-2">
            <Activity class="h-4 w-4" />
            Security Info
          </h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">IP Address:</span>
              <span class="font-mono">{{ sessionInfo.ipAddress }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Browser:</span>
              <span>{{ sessionInfo.userAgent }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Multi-tab:</span>
              <span class="flex items-center gap-1">
                <div 
                  class="w-2 h-2 rounded-full"
                  :class="sessionInfo.multiTabActive ? 'bg-green-500' : 'bg-gray-400'"
                ></div>
                {{ sessionInfo.multiTabActive ? 'Synced' : 'Single' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Features -->
      <div class="border-t pt-4">
        <h4 class="font-medium mb-3">Active Security Features</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Auto-logout on inactivity</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Token auto-refresh</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Cross-tab synchronization</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Activity tracking</span>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="flex justify-between items-center pt-2 border-t">
        <span class="text-sm text-muted-foreground">
          Session managed automatically for your security
        </span>
        <Button 
          @click="openSessionSettings"
          variant="outline"
          size="sm"
          class="flex items-center gap-2"
        >
          <Settings class="h-3 w-3" />
          Settings
        </Button>
      </div>
    </CardContent>
  </Card>
</template> 