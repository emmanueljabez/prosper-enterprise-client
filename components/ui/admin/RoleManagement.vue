<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { RoleManager, DEFAULT_ROLES } from '@/utils/roleManager'
import type { User, UserRole } from '@/types/auth'

interface Props {
  user: User
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true
})

const emit = defineEmits<{
  roleChanged: [user: User]
}>()

const { toast } = useToast()
const selectedRole = ref<UserRole['name'] | ''>('')

// Available roles for selection
const availableRoles = computed(() => {
  return Object.values(DEFAULT_ROLES).map(role => ({
    value: role.name,
    label: role.displayName,
    description: `${role.permissions.length} permissions`
  }))
})

// Current user roles
const currentRoles = computed(() => {
  return props.user.roles.map(role => ({
    ...role,
    permissionCount: role.permissions.length
  }))
})

// Check if user has a specific role
const hasRole = (roleName: UserRole['name']) => {
  return RoleManager.hasRole(props.user, roleName)
}

// Add role to user
const addRole = async () => {
  if (!selectedRole.value) return
  
  try {
    const updatedUser = RoleManager.assignRole(props.user, selectedRole.value)
    emit('roleChanged', updatedUser)
    
    toast({
      title: 'Role Added',
      description: `${DEFAULT_ROLES[selectedRole.value].displayName} role has been assigned to ${props.user.name}`,
      variant: 'success'
    })
    
    selectedRole.value = ''
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to assign role',
      variant: 'destructive'
    })
  }
}

// Remove role from user
const removeRole = async (roleName: UserRole['name']) => {
  try {
    const updatedUser = RoleManager.removeRole(props.user, roleName)
    emit('roleChanged', updatedUser)
    
    toast({
      title: 'Role Removed',
      description: `${DEFAULT_ROLES[roleName].displayName} role has been removed from ${props.user.name}`,
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to remove role',
      variant: 'destructive'
    })
  }
}

// Get role badge variant based on role type
const getRoleBadgeVariant = (roleName: UserRole['name']) => {
  switch (roleName) {
    case 'corporate_admin':
      return 'destructive'
    case 'mentor':
      return 'default'
    case 'employee':
      return 'secondary'
    default:
      return 'outline'
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Role Management</CardTitle>
      <CardDescription>
        Manage roles and permissions for {{ user.name }}
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Current Roles -->
      <div>
        <h4 class="text-sm font-medium mb-3">Current Roles</h4>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="role in currentRoles"
            :key="role.id"
            class="flex items-center gap-2"
          >
            <Badge :variant="getRoleBadgeVariant(role.name)">
              {{ role.displayName }}
            </Badge>
            <span class="text-xs text-muted-foreground">
              ({{ role.permissionCount }} permissions)
            </span>
            <Button
              v-if="editable && role.name !== 'employee'"
              variant="ghost"
              size="sm"
              @click="removeRole(role.name)"
              class="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              ✕
            </Button>
          </div>
          <Badge v-if="currentRoles.length === 0" variant="outline">
            No roles assigned
          </Badge>
        </div>
      </div>

      <!-- Add Role Section -->
      <div v-if="editable">
        <h4 class="text-sm font-medium mb-3">Add Role</h4>
        <div class="flex gap-2">
          <Select v-model="selectedRole">
            <SelectTrigger class="flex-1">
              <SelectValue placeholder="Select a role to assign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="role in availableRoles"
                :key="role.value"
                :value="role.value"
                :disabled="hasRole(role.value)"
              >
                <div class="flex flex-col">
                  <span>{{ role.label }}</span>
                  <span class="text-xs text-muted-foreground">{{ role.description }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            @click="addRole"
            :disabled="!selectedRole"
          >
            Add Role
          </Button>
        </div>
      </div>

      <!-- Role Permissions Preview -->
      <div v-if="selectedRole">
        <h4 class="text-sm font-medium mb-3">
          {{ DEFAULT_ROLES[selectedRole].displayName }} Permissions
        </h4>
        <div class="max-h-40 overflow-y-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="permission in DEFAULT_ROLES[selectedRole].permissions"
              :key="permission.id"
              class="text-xs p-2 bg-muted rounded"
            >
              <div class="font-medium">{{ permission.name }}</div>
              <div class="text-muted-foreground">{{ permission.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Role Summary -->
      <div class="pt-4 border-t">
        <h4 class="text-sm font-medium mb-2">Access Summary</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium">Can access mentors:</span>
            <span class="ml-2">{{ RoleManager.hasPermission(user, 'mentors:view') ? '✅' : '❌' }}</span>
          </div>
          <div>
            <span class="font-medium">Can manage sessions:</span>
            <span class="ml-2">{{ RoleManager.hasPermission(user, 'sessions:manage') ? '✅' : '❌' }}</span>
          </div>
          <div>
            <span class="font-medium">Admin access:</span>
            <span class="ml-2">{{ RoleManager.isCorporateAdmin(user) ? '✅' : '❌' }}</span>
          </div>
          <div>
            <span class="font-medium">Mentor features:</span>
            <span class="ml-2">{{ RoleManager.isMentor(user) ? '✅' : '❌' }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template> 