<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="px-6 pt-6">
      <DialogTitle>Bulk Edit Sync Rules</DialogTitle>
      <DialogDescription>
        Apply changes to {{ rules.length }} selected rules. Only modified fields will be updated.
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto px-6">
      <form @submit.prevent="submitForm" id="bulk-edit-form" class="py-4">
        <div class="grid gap-6">
          <!-- Selected Rules Summary -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium">Selected Rules ({{ rules.length }})</h3>
            <div class="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
              <ul class="text-sm space-y-1">
                <li v-for="rule in rules" :key="rule.id" class="flex justify-between">
                  <span>{{ rule.name }}</span>
                  <Badge :variant="rule.active ? 'success' : 'secondary'" class="ml-2">
                    {{ rule.active ? 'Active' : 'Inactive' }}
                  </Badge>
                </li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <AlertCircle class="h-4 w-4 mr-2" />
            <AlertTitle>Selective Update</AlertTitle>
            <AlertDescription>
              Only fields you modify will be updated. Leave unchanged any fields you don't want to modify.
            </AlertDescription>
          </Alert>
          
          <Separator />
          
          <!-- Status -->
          <div class="space-y-4">
            <div class="flex items-center">
              <Checkbox id="updateStatus" v-model="updateFields.status" />
              <Label for="updateStatus" class="ml-2 cursor-pointer">Update Status</Label>
            </div>
            
            <div v-if="updateFields.status" class="pl-6 space-y-2">
              <div class="flex items-center space-x-2">
                <Switch id="active" v-model="formData.active" />
                <Label for="active">{{ formData.active ? 'Active' : 'Inactive' }}</Label>
              </div>
            </div>
          </div>
          
          <!-- Priority -->
          <div class="space-y-4">
            <div class="flex items-center">
              <Checkbox id="updatePriority" v-model="updateFields.priority" />
              <Label for="updatePriority" class="ml-2 cursor-pointer">Update Priority</Label>
            </div>
            
            <div v-if="updateFields.priority" class="pl-6 space-y-2">
              <Input 
                id="priority" 
                type="number" 
                v-model.number="formData.priority" 
                placeholder="Enter priority"
                :class="{ 'border-red-500': errors.priority }"
              />
              <p v-if="errors.priority" class="text-xs text-red-500">{{ errors.priority }}</p>
              <p class="text-xs text-muted-foreground">
                Higher priority rules take precedence
              </p>
            </div>
          </div>
          
          <!-- Tags -->
          <div class="space-y-4">
            <div class="flex items-center">
              <Checkbox id="updateTags" v-model="updateFields.tags" />
              <Label for="updateTags" class="ml-2 cursor-pointer">Update Tags</Label>
            </div>
            
            <div v-if="updateFields.tags" class="pl-6 space-y-2">
              <TagsInput 
                v-model="formData.tags" 
                placeholder="Add tags (press Enter to add)"
              />
              <p class="text-xs text-muted-foreground">
                Tags help with filtering and organizing rules
              </p>
            </div>
          </div>
          
          <!-- Notification Settings -->
          <div class="space-y-4">
            <div class="flex items-center">
              <Checkbox id="updateNotify" v-model="updateFields.notifyStaff" />
              <Label for="updateNotify" class="ml-2 cursor-pointer">Update Notification Settings</Label>
            </div>
            
            <div v-if="updateFields.notifyStaff" class="pl-6 space-y-4">
              <div class="flex items-center space-x-2">
                <Switch id="notifyStaff" v-model="formData.actionConfig.notifyStaff" />
                <Label for="notifyStaff">{{ formData.actionConfig.notifyStaff ? 'Notify Staff' : 'Don\'t Notify Staff' }}</Label>
              </div>
              
              <div v-if="formData.actionConfig.notifyStaff" class="space-y-2">
                <Label>Notification Channels</Label>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="emailChannel" v-model="emailChannel" />
                    <Label for="emailChannel" class="cursor-pointer">Email</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="smsChannel" v-model="smsChannel" />
                    <Label for="smsChannel" class="cursor-pointer">SMS</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="pushChannel" v-model="pushChannel" />
                    <Label for="pushChannel" class="cursor-pointer">Push Notification</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="webhookChannel" v-model="webhookChannel" />
                    <Label for="webhookChannel" class="cursor-pointer">Webhook</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Display Update Settings -->
          <div class="space-y-4">
            <div class="flex items-center">
              <Checkbox id="updateDisplay" v-model="updateFields.updateDisplayed" />
              <Label for="updateDisplay" class="ml-2 cursor-pointer">Update Display Settings</Label>
            </div>
            
            <div v-if="updateFields.updateDisplayed" class="pl-6 space-y-2">
              <div class="flex items-center space-x-2">
                <Switch id="updateDisplayed" v-model="formData.actionConfig.updateDisplayed" />
                <Label for="updateDisplayed">{{ formData.actionConfig.updateDisplayed ? 'Update Display Status' : 'Don\'t Update Display Status' }}</Label>
              </div>
              <p class="text-xs text-muted-foreground">
                Control whether inventory changes affect product display status
              </p>
            </div>
          </div>
          
          <Separator />
          
          <!-- Summary -->
          <div class="space-y-2">
            <h3 class="text-sm font-medium">Update Summary</h3>
            <div class="bg-muted p-3 rounded-md text-sm">
              <p v-if="!hasSelectedFields">No fields selected for update</p>
              <ul v-else class="space-y-1">
                <li v-if="updateFields.status">
                  • Status: Will be set to <span class="font-medium">{{ formData.active ? 'Active' : 'Inactive' }}</span>
                </li>
                <li v-if="updateFields.priority">
                  • Priority: Will be set to <span class="font-medium">{{ formData.priority }}</span>
                </li>
                <li v-if="updateFields.tags">
                  • Tags: Will be set to <span class="font-medium">{{ formData.tags.length ? formData.tags.join(', ') : 'none' }}</span>
                </li>
                <li v-if="updateFields.notifyStaff">
                  • Notifications: <span class="font-medium">{{ formData.actionConfig.notifyStaff ? 'Enabled' : 'Disabled' }}</span>
                  <span v-if="formData.actionConfig.notifyStaff">
                    via {{ getSelectedChannels() }}
                  </span>
                </li>
                <li v-if="updateFields.updateDisplayed">
                  • Display Updates: <span class="font-medium">{{ formData.actionConfig.updateDisplayed ? 'Enabled' : 'Disabled' }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="px-6 py-4 border-t">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        type="submit" 
        form="bulk-edit-form" 
        :disabled="isSubmitting || !hasSelectedFields"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Apply to {{ rules.length }} Rules
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { AlertCircle, Loader2Icon } from 'lucide-vue-next';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TagsInput } from '@/components/ui/tags-input';

const props = defineProps({
  rules: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update-confirmed', 'close']);
const isSubmitting = ref(false);
const errors = ref({});

// Track which fields should be updated
const updateFields = ref({
  status: false,
  priority: false,
  tags: false,
  notifyStaff: false,
  updateDisplayed: false
});

// Default form data with average/common values from the selected rules
const formData = ref({
  active: getMostCommonStatus(),
  priority: getAveragePriority(),
  tags: getCommonTags(),
  actionConfig: {
    notifyStaff: getMostCommonNotifyStaff(),
    updateDisplayed: getMostCommonUpdateDisplayed()
  },
  notifications: {
    channels: ['email']
  }
});

// Notification channel checkboxes
const emailChannel = ref(true);
const smsChannel = ref(false);
const pushChannel = ref(false);
const webhookChannel = ref(false);

// Initialize notification channels based on most common configuration
function initializeChannels() {
  const channelCounts = { email: 0, sms: 0, push: 0, webhook: 0 };
  let totalWithChannels = 0;
  
  props.rules.forEach(rule => {
    if (rule.notifications?.channels?.length) {
      totalWithChannels++;
      rule.notifications.channels.forEach(channel => {
        if (channelCounts[channel] !== undefined) {
          channelCounts[channel]++;
        }
      });
    }
  });
  
  // Set each channel based on whether it's used in more than half the rules
  emailChannel.value = channelCounts.email > totalWithChannels / 2;
  smsChannel.value = channelCounts.sms > totalWithChannels / 2;
  pushChannel.value = channelCounts.push > totalWithChannels / 2;
  webhookChannel.value = channelCounts.webhook > totalWithChannels / 2;
}

// Call initialization
initializeChannels();

// Update channels when checkboxes change
watch([emailChannel, smsChannel, pushChannel, webhookChannel], () => {
  const channels = [];
  if (emailChannel.value) channels.push('email');
  if (smsChannel.value) channels.push('sms');
  if (pushChannel.value) channels.push('push');
  if (webhookChannel.value) channels.push('webhook');
  formData.value.notifications.channels = channels;
});

// Helper functions to get common/average values from rules
function getMostCommonStatus() {
  const activeCount = props.rules.filter(rule => rule.active).length;
  return activeCount >= props.rules.length / 2;
}

function getAveragePriority() {
  if (props.rules.length === 0) return 100;
  const sum = props.rules.reduce((acc, rule) => acc + (rule.priority || 0), 0);
  return Math.round(sum / props.rules.length);
}

function getCommonTags() {
  if (props.rules.length === 0) return [];
  
  // Get all unique tags
  const allTags = new Set();
  props.rules.forEach(rule => {
    if (rule.tags) {
      rule.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  // Find tags that are in more than half the rules
  const commonTags = [];
  allTags.forEach(tag => {
    const count = props.rules.filter(rule => rule.tags?.includes(tag)).length;
    if (count > props.rules.length / 2) {
      commonTags.push(tag);
    }
  });
  
  return commonTags;
}

function getMostCommonNotifyStaff() {
  const notifyCount = props.rules.filter(rule => rule.actionConfig?.notifyStaff).length;
  return notifyCount >= props.rules.length / 2;
}

function getMostCommonUpdateDisplayed() {
  const updateCount = props.rules.filter(rule => rule.actionConfig?.updateDisplayed).length;
  return updateCount >= props.rules.length / 2;
}

// Computed property to check if any fields are selected for update
const hasSelectedFields = computed(() => {
  return Object.values(updateFields.value).some(value => value);
});

// Helper to format selected channels for summary
function getSelectedChannels() {
  const channels = [];
  if (emailChannel.value) channels.push('Email');
  if (smsChannel.value) channels.push('SMS');
  if (pushChannel.value) channels.push('Push');
  if (webhookChannel.value) channels.push('Webhook');
  
  if (channels.length === 0) return 'no channels';
  if (channels.length === 1) return channels[0];
  if (channels.length === 2) return channels.join(' and ');
  
  return channels.slice(0, -1).join(', ') + ', and ' + channels[channels.length - 1];
}

// Validation
function validateForm() {
  const newErrors = {};
  
  if (updateFields.value.priority && (formData.value.priority === null || formData.value.priority === undefined)) {
    newErrors.priority = 'Priority is required';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

// Form submission
async function submitForm() {
  if (!validateForm()) {
    return;
  }
  
  if (!hasSelectedFields.value) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Create update object with only the fields that should be updated
    const updates = {};
    
    if (updateFields.value.status) {
      updates.active = formData.value.active;
    }
    
    if (updateFields.value.priority) {
      updates.priority = formData.value.priority;
    }
    
    if (updateFields.value.tags) {
      updates.tags = formData.value.tags;
    }
    
    // Handle nested properties
    if (updateFields.value.notifyStaff || updateFields.value.updateDisplayed) {
      updates.actionConfig = {};
      
      if (updateFields.value.notifyStaff) {
        updates.actionConfig.notifyStaff = formData.value.actionConfig.notifyStaff;
        
        if (formData.value.actionConfig.notifyStaff) {
          updates.notifications = {
            enabled: true,
            channels: formData.value.notifications.channels
          };
        }
      }
      
      if (updateFields.value.updateDisplayed) {
        updates.actionConfig.updateDisplayed = formData.value.actionConfig.updateDisplayed;
      }
    }
    
    // Get IDs of selected rules
    const ruleIds = props.rules.map(rule => rule.id);
    
    // Emit the update-confirmed event with the updates and rule IDs
    emit('update-confirmed', { updates, ruleIds });
  } catch (error) {
    console.error('Error preparing bulk update:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>