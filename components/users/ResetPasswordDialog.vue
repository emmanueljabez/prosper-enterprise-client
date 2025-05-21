<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Send a password reset link to the user's email.
          </DialogDescription>
        </DialogHeader>
  
        <div v-if="user" class="py-4">
          <p>
            Are you sure you want to reset the password for <strong>{{ user.name }}</strong>?
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            A password reset link will be sent to {{ user.email }}
          </p>
        </div>
  
        <DialogFooter>
          <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button
              @click="handleReset"
              :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Send Reset Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { Loader2Icon } from 'lucide-vue-next';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  
  const props = defineProps({
    open: { type : Boolean, default: () => false },
    user: { type: Object, default: () => ({}) }
  });
  
  const emit = defineEmits(['update:open', 'reset']);
  
  const isSubmitting = ref(false);
  
  function handleReset() {
    isSubmitting.value = true;
    
    // Simulate API call
    setTimeout(() => {
      isSubmitting.value = false;
      emit('reset', props.user);
      emit('update:open', false);
    }, 500);
  }
  </script>