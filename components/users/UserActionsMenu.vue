<template>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" class="h-8 w-8 opacity-0 group-hover:opacity-100">
          <MoreHorizontalIcon class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="$emit('edit')">
          <EditIcon class="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem @click="$emit('reset-password')">
          <KeyIcon class="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
  
        <template v-if="user.status === 'active'">
          <DropdownMenuItem @click="$emit('suspend')">
            <BanIcon class="mr-2 h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        </template>
  
        <template v-if="user.status === 'suspended'">
          <DropdownMenuItem @click="$emit('activate')">
            <CheckCircleIcon class="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        </template>
  
        <template v-if="user.status === 'invited'">
          <DropdownMenuItem @click="$emit('resend-invitation')">
            <RefreshCwIcon class="mr-2 h-4 w-4" />
            Resend Invitation
          </DropdownMenuItem>
        </template>
  
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="$emit('delete')" class="text-destructive focus:text-destructive">
          <TrashIcon class="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </template>
  
  <script setup>
  import { 
    MoreHorizontalIcon, 
    EditIcon, 
    KeyIcon, 
    BanIcon, 
    CheckCircleIcon, 
    RefreshCwIcon, 
    TrashIcon 
  } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
  } from '@/components/ui/dropdown-menu';
  
  defineProps({
    user: { type: Object, default: () => ({}) }
  });
  
  defineEmits(['edit', 'reset-password', 'suspend', 'activate', 'resend-invitation', 'delete']);
  </script>