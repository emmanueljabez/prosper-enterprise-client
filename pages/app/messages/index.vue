<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useAppToast } from '@/composables/services/toastService'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Icons
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Star,
  Trash2,
  Check,
  CheckCheck,
  Circle,
  Clock,
  Users,
  MessageSquare,
  Filter,
  Settings,
  X
} from 'lucide-vue-next'

definePageMeta({
  title: 'Messages',
  description: 'Communicate with your mentors and colleagues',
  layout: 'default'
})

// Stores
const authStore = useAuthStore()
const toast = useAppToast()

// State
const selectedConversation = ref(null)
const searchQuery = ref('')
const newMessage = ref('')
const showNewMessageDialog = ref(false)
const isTyping = ref(false)
const messagesContainer = ref(null)

// Mock data
const currentUser = ref({
  id: 'user-123',
  name: 'Alex Morgan',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
})

const conversations = ref([
  {
    id: 'conv-1',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
    role: 'Senior Tech Lead',
    lastMessage: {
      text: "Great progress on the React components! Let's discuss the state management approach in our next session.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      senderId: 'mentor-1',
      isRead: false
    },
    isOnline: true,
    unreadCount: 2,
    isPinned: true,
    type: 'mentor'
  },
  {
    id: 'conv-2',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    role: 'Frontend Architect',
    lastMessage: {
      text: "The TypeScript migration looks good. I've reviewed your PR and left some feedback.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      senderId: 'mentor-2',
      isRead: true
    },
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 0,
    isPinned: false,
    type: 'mentor'
  },
  {
    id: 'conv-3',
    name: 'Emma Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    role: 'UX Design Lead',
    lastMessage: {
      text: "I love the new design direction! The user flow is much clearer now. 🎨",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      senderId: 'mentor-3',
      isRead: true
    },
    isOnline: true,
    unreadCount: 0,
    isPinned: false,
    type: 'mentor'
  },
  {
    id: 'conv-4',
    name: 'Development Team',
    avatar: null,
    role: 'Group Chat',
    lastMessage: {
      text: "James: Don't forget about the sprint retrospective tomorrow at 2 PM",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      senderId: 'user-456',
      isRead: true
    },
    isOnline: null,
    unreadCount: 0,
    isPinned: false,
    type: 'group',
    memberCount: 8
  },
  {
    id: 'conv-5',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    role: 'DevOps Engineer',
    lastMessage: {
      text: "The CI/CD pipeline is now working perfectly. Thanks for your help with the Docker configuration!",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      senderId: 'colleague-1',
      isRead: true
    },
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    isPinned: false,
    type: 'colleague'
  }
])

const messages = ref({
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'mentor-1',
      senderName: 'Dr. Sarah Johnson',
      text: "Hi Alex! I reviewed your latest code submission. Overall, great work on implementing the component architecture we discussed.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-2',
      senderId: 'user-123',
      senderName: 'Alex Morgan',
      text: "Thank you! I tried to follow the patterns you showed me. I'm particularly proud of how the state management turned out.",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-3',
      senderId: 'mentor-1',
      senderName: 'Dr. Sarah Johnson',
      text: "Exactly! The way you structured the Redux store is very clean. I have a few suggestions for optimization though.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-4',
      senderId: 'mentor-1',
      senderName: 'Dr. Sarah Johnson',
      text: "Could we schedule a quick call to go over the performance improvements? I think there are some easy wins we can implement.",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-5',
      senderId: 'user-123',
      senderName: 'Alex Morgan',
      text: "Absolutely! I'm free tomorrow afternoon if that works for you. Really appreciate all the guidance! 🙏",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: 'msg-6',
      senderId: 'mentor-1',
      senderName: 'Dr. Sarah Johnson',
      text: "Great progress on the React components! Let's discuss the state management approach in our next session.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      type: 'text'
    }
  ]
})

// Computed properties
const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  
  return conversations.value.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    conv.lastMessage.text.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const selectedMessages = computed(() => {
  if (!selectedConversation.value) return []
  return messages.value[selectedConversation.value.id] || []
})

const totalUnreadCount = computed(() => {
  return conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
})

// Helper functions
const formatMessageTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return timestamp.toLocaleDateString()
}

const formatDetailedTime = (timestamp) => {
  const now = new Date()
  const isToday = timestamp.toDateString() === now.toDateString()
  const isYesterday = new Date(now - 24 * 60 * 60 * 1000).toDateString() === timestamp.toDateString()
  
  if (isToday) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (isYesterday) {
    return 'Yesterday ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

const getStatusIcon = (message) => {
  if (message.senderId === currentUser.value.id) {
    return message.isRead ? CheckCheck : Check
  }
  return null
}

const getOnlineStatus = (conversation) => {
  if (conversation.type === 'group') return null
  if (conversation.isOnline) return 'Online'
  if (conversation.lastSeen) {
    const diff = new Date() - conversation.lastSeen
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 60) return `Last seen ${minutes}m ago`
    if (hours < 24) return `Last seen ${hours}h ago`
    return 'Last seen ' + conversation.lastSeen.toLocaleDateString()
  }
  return 'Offline'
}

const selectConversation = (conversation) => {
  selectedConversation.value = conversation
  
  // Mark as read
  if (conversation.unreadCount > 0) {
    conversation.unreadCount = 0
    // Mark all messages as read
    const convMessages = messages.value[conversation.id] || []
    convMessages.forEach(msg => {
      if (msg.senderId !== currentUser.value.id) {
        msg.isRead = true
      }
    })
  }
  
  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  
  const message = {
    id: `msg-${Date.now()}`,
    senderId: currentUser.value.id,
    senderName: currentUser.value.name,
    text: newMessage.value,
    timestamp: new Date(),
    isRead: false,
    type: 'text'
  }
  
  // Add to messages
  if (!messages.value[selectedConversation.value.id]) {
    messages.value[selectedConversation.value.id] = []
  }
  messages.value[selectedConversation.value.id].push(message)
  
  // Update last message in conversation
  selectedConversation.value.lastMessage = {
    text: newMessage.value,
    timestamp: new Date(),
    senderId: currentUser.value.id,
    isRead: false
  }
  
  newMessage.value = ''
  
  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
  
  // Simulate response after a delay
  setTimeout(() => {
    simulateResponse()
  }, 2000 + Math.random() * 3000)
}

const simulateResponse = () => {
  if (!selectedConversation.value) return
  
  const responses = [
    "Thanks for the update!",
    "That sounds great. Let me review and get back to you.",
    "Perfect! I'll take a look at this shortly.",
    "Good question. Let me think about that and respond soon.",
    "Excellent progress! Keep up the good work. 👍"
  ]
  
  const response = {
    id: `msg-${Date.now()}`,
    senderId: selectedConversation.value.id.replace('conv-', 'mentor-'),
    senderName: selectedConversation.value.name,
    text: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date(),
    isRead: false,
    type: 'text'
  }
  
  messages.value[selectedConversation.value.id].push(response)
  
  // Update conversation
  selectedConversation.value.lastMessage = {
    text: response.text,
    timestamp: response.timestamp,
    senderId: response.senderId,
    isRead: false
  }
  selectedConversation.value.unreadCount += 1
  
  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Lifecycle
onMounted(() => {
  console.log('💬 Loading messages page...')
  // Auto-select first conversation if available
  if (conversations.value.length > 0) {
    selectConversation(conversations.value[0])
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 h-[calc(100vh-8rem)]">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Messages</h1>
        <p class="text-muted-foreground">
          Stay connected with your mentors and colleagues
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Badge v-if="totalUnreadCount > 0" variant="destructive">
          {{ totalUnreadCount }} unread
        </Badge>
        <Button @click="showNewMessageDialog = true" size="sm">
          <Plus class="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6 h-full">
      <!-- Conversations List -->
      <div class="col-span-4 flex flex-col">
        <Card class="flex-1 flex flex-col">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <CardTitle>Conversations</CardTitle>
              <Button variant="ghost" size="sm">
                <Settings class="h-4 w-4" />
              </Button>
            </div>
            <!-- Search -->
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search conversations..."
                class="pl-9"
              />
            </div>
          </CardHeader>
          
          <CardContent class="flex-1 p-0">
            <ScrollArea class="h-full">
              <div class="space-y-1 p-3">
                <div
                  v-for="conversation in filteredConversations"
                  :key="conversation.id"
                  @click="selectConversation(conversation)"
                  :class="[
                    'flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50',
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border border-blue-200' : '',
                    conversation.isPinned ? 'bg-yellow-50/50' : ''
                  ]"
                >
                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <Avatar class="h-12 w-12">
                      <AvatarImage v-if="conversation.avatar" :src="conversation.avatar" :alt="conversation.name" />
                      <AvatarFallback>
                        <Users v-if="conversation.type === 'group'" class="h-6 w-6" />
                        <span v-else>{{ conversation.name.split(' ').map(n => n[0]).join('') }}</span>
                      </AvatarFallback>
                    </Avatar>
                    <!-- Online indicator -->
                    <div 
                      v-if="conversation.isOnline && conversation.type !== 'group'"
                      class="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"
                    />
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center space-x-2">
                        <h4 class="font-semibold text-sm truncate">{{ conversation.name }}</h4>
                        <Star v-if="conversation.isPinned" class="h-3 w-3 text-yellow-500 fill-current" />
                      </div>
                      <div class="flex items-center space-x-1">
                        <span class="text-xs text-muted-foreground">
                          {{ formatMessageTime(conversation.lastMessage.timestamp) }}
                        </span>
                        <Badge v-if="conversation.unreadCount > 0" variant="destructive" class="text-xs h-5 min-w-5 flex items-center justify-center p-0">
                          {{ conversation.unreadCount }}
                        </Badge>
                      </div>
                    </div>
                    
                    <p class="text-xs text-muted-foreground mb-1">{{ conversation.role }}</p>
                    
                    <div class="flex items-center justify-between">
                      <p class="text-sm text-muted-foreground truncate flex-1">
                        {{ conversation.lastMessage.text }}
                      </p>
                      <component 
                        v-if="getStatusIcon(conversation.lastMessage)"
                        :is="getStatusIcon(conversation.lastMessage)"
                        :class="[
                          'h-3 w-3 ml-2 flex-shrink-0',
                          conversation.lastMessage.isRead ? 'text-blue-500' : 'text-gray-400'
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <!-- Message Thread -->
      <div class="col-span-8 flex flex-col">
        <Card v-if="selectedConversation" class="flex-1 flex flex-col">
          <!-- Chat Header -->
          <CardHeader class="pb-3 border-b">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Avatar class="h-10 w-10">
                  <AvatarImage v-if="selectedConversation.avatar" :src="selectedConversation.avatar" :alt="selectedConversation.name" />
                  <AvatarFallback>
                    <Users v-if="selectedConversation.type === 'group'" class="h-5 w-5" />
                    <span v-else>{{ selectedConversation.name.split(' ').map(n => n[0]).join('') }}</span>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 class="font-semibold">{{ selectedConversation.name }}</h3>
                  <p class="text-sm text-muted-foreground">
                    {{ selectedConversation.type === 'group' ? `${selectedConversation.memberCount} members` : getOnlineStatus(selectedConversation) }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <!-- Messages -->
          <CardContent class="flex-1 p-0 flex flex-col">
            <ScrollArea ref="messagesContainer" class="flex-1 p-4">
              <div class="space-y-4">
                <div
                  v-for="message in selectedMessages"
                  :key="message.id"
                  :class="[
                    'flex',
                    message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div
                    :class="[
                      'max-w-[70%] rounded-lg px-4 py-2',
                      message.senderId === currentUser.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    ]"
                  >
                    <p class="text-sm">{{ message.text }}</p>
                    <div
                      :class="[
                        'flex items-center justify-between mt-1 text-xs',
                        message.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                      ]"
                    >
                      <span>{{ formatDetailedTime(message.timestamp) }}</span>
                      <component 
                        v-if="getStatusIcon(message)"
                        :is="getStatusIcon(message)"
                        :class="[
                          'h-3 w-3 ml-2',
                          message.isRead ? 'text-blue-200' : 'text-blue-300'
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <!-- Message Input -->
            <div class="border-t p-4">
              <div class="flex items-end space-x-2">
                <Button variant="ghost" size="sm" class="mb-2">
                  <Paperclip class="h-4 w-4" />
                </Button>
                <div class="flex-1">
                  <Textarea
                    v-model="newMessage"
                    placeholder="Type a message..."
                    rows="1"
                    class="resize-none"
                    @keypress="handleKeyPress"
                  />
                </div>
                <Button variant="ghost" size="sm" class="mb-2">
                  <Smile class="h-4 w-4" />
                </Button>
                <Button 
                  @click="sendMessage"
                  :disabled="!newMessage.trim()"
                  size="sm"
                  class="mb-2"
                >
                  <Send class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Empty State -->
        <Card v-else class="flex-1 flex items-center justify-center">
          <div class="text-center space-y-4">
            <MessageSquare class="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 class="text-lg font-semibold">Select a conversation</h3>
              <p class="text-muted-foreground">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- New Message Dialog -->
    <Dialog v-model:open="showNewMessageDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Start a new conversation with a mentor or colleague
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium">To:</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mentor-1">Dr. Sarah Johnson</SelectItem>
                <SelectItem value="mentor-2">Michael Chen</SelectItem>
                <SelectItem value="mentor-3">Emma Rodriguez</SelectItem>
                <SelectItem value="colleague-1">David Kim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label class="text-sm font-medium">Message:</label>
            <Textarea
              placeholder="Type your message here..."
              rows="4"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showNewMessageDialog = false">
            Cancel
          </Button>
          <Button @click="showNewMessageDialog = false">
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style> 