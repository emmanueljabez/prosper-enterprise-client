<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[250px]">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="user in users" :key="user.id" class="group">
          <TableCell>
            <div class="flex items-center gap-3">
              <Avatar>
                <AvatarImage :src="user.avatar" />
                <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
              </Avatar>
              <div>
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-muted-foreground">{{ user.email }}</div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge class="font-semibold" :class="getRoleBadgeClass(user.role)">
              {{ getRoleName(user.role) }}
            </Badge>
          </TableCell>
          <TableCell>
            <div class="text-sm">{{ formatLastActive(user.lastActive) }}</div>
          </TableCell>
          <TableCell>
            <Badge variant="outline" class="font-semibold" :class="getStatusBadgeClass(user.status)">
              {{ formatStatus(user.status) }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <UserActionsMenu :user="user" @edit="$emit('edit-user', user)"
              @reset-password="$emit('reset-password', user)" @suspend="$emit('suspend-user', user)"
              @activate="$emit('activate-user', user)" @resend-invitation="$emit('resend-invitation', user)"
              @delete="$emit('delete-user', user)" />
          </TableCell>
        </TableRow>

        <TableRow v-if="users.length === 0">
          <TableCell colspan="5" class="h-24 text-center">
            <div class="flex flex-col items-center justify-center text-muted-foreground">
              <UserXIcon class="h-8 w-8 mb-2" />
              <h3 class="font-medium">No users found</h3>
              <p class="text-sm">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup>
import { UserXIcon } from 'lucide-vue-next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserActionsMenu from './UserActionsMenu.vue';

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  roles: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});
defineEmits([
  'edit-user',
  'reset-password',
  'suspend-user',
  'activate-user',
  'resend-invitation',
  'delete-user',
  'refresh'
]);

function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getRoleName(roleId) {
  const role = props.roles.find(r => r.id === roleId);
  return role ? role.name : roleId;
}

function getRoleBadgeClass(roleId) {
  const classMap = {
    'admin': 'bg-primary/10 text-primary',
    'support': 'bg-blue-50 text-blue-700',
    'noc': 'bg-indigo-50 text-indigo-700',
    'field_tech': 'bg-orange-50 text-orange-700',
    'sales': 'bg-green-50 text-green-700',
    'billing': 'bg-purple-50 text-purple-700'
  };

  return classMap[roleId] || 'bg-gray-50 text-gray-700';
}

function getStatusBadgeClass(status) {
  return {
    'border-green-200 bg-green-50 text-green-700': status === 'active',
    'border-amber-200 bg-amber-50 text-amber-700': status === 'invited',
    'border-red-200 bg-red-50 text-red-700': status === 'suspended'
  };
}

function formatLastActive(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function formatStatus(status) {
  const statusMap = {
    'active': 'Active',
    'suspended': 'Suspended',
    'invited': 'Invited'
  };

  return statusMap[status] || status;
}
</script>