<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
  
        <div v-if="user" class="py-4">
          <AlertCircleIcon class="h-12 w-12 text-destructive mx-auto mb-4" />
          <p class="text-center">
            Are you sure you want to delete <strong>{{ user.name }}</strong>?
          </p>
          <p class="text-center text-sm text-muted-foreground mt-2">
            This will permanently remove the user and all associated data from the system.
          </p>
        </div>
  
        <DialogFooter>
          <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button
              variant="destructive"
              @click="handleDelete"
              :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { AlertCircleIcon, Loader2Icon } from 'lucide-vue-next';
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
    user: { type: Object, required: true }
  });
  
  const emit = defineEmits(['update:open', 'delete']);
  
  const isSubmitting = ref(false);
  
  function handleDelete() {
    isSubmitting.value = true;
    
    // Simulate API call
    setTimeout(() => {
      isSubmitting.value = false;
      emit('delete', props.user);
      emit('update:open', false);
    }, 500);
  }
  </script>