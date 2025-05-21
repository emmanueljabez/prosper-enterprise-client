<template>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            class="pl-10"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
          />
        </div>
      </div>
  
      <div>
        <Select 
          :value="roleFilter" 
          @update:modelValue="$emit('update:roleFilter', $event)"
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem
              v-for="role in roles"
              :key="role.id"
              :value="role.id"
            >
              {{ role.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      <div>
        <Select 
          :value="statusFilter"
          @update:modelValue="$emit('update:statusFilter', $event)"
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </template>
  
  <script setup>
  import { SearchIcon } from 'lucide-vue-next';
  import { Input } from '@/components/ui/input';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  
  defineProps({
    searchQuery: {
      type: String,
      default: ''
    },
    roleFilter: {
      type: String,
      default: 'all'
    },
    statusFilter: {
      type: String,
      default: 'all'
    },
    roles: {
      type: Array,
      default: () => []
    }
  });
  
  defineEmits(['update:searchQuery', 'update:roleFilter', 'update:statusFilter']);
  </script>