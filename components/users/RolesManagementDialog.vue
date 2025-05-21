<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Manage Roles & Permissions</DialogTitle>
          <DialogDescription>
            Configure roles and their access levels to different parts of the system.
          </DialogDescription>
        </DialogHeader>
  
        <div class="pt-4 pb-2 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Roles</h3>
          <Button size="sm" @click="showAddRoleDialog = true">
            <PlusIcon class="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
  
        <Tabs defaultValue="permissions" class="w-full">
          <TabsList class="mb-4">
            <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
            <TabsTrigger value="roles">Role Details</TabsTrigger>
          </TabsList>
  
          <TabsContent value="permissions">
            <div class="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-[200px]">Permission Group</TableHead>
                    <TableHead v-for="role in roles" :key="role.id">
                      {{ role.name }}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="group in permissionGroups" :key="group.id">
                    <TableCell class="font-medium">{{ group.name }}</TableCell>
                    <TableCell v-for="role in roles" :key="`${group.id}-${role.id}`">
                      <div class="flex gap-1">
                        <button
                            v-for="level in ['none', 'view', 'edit', 'full']"
                            :key="level"
                            class="permission-option"
                            :class="[
                            level,
                            { selected: rolePermissions[role.id][group.id] === level }
                          ]"
                            @click="updatePermission(role.id, group.id, level)"
                        >
                          {{ level.charAt(0).toUpperCase() }}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
  
            <div class="mt-4 flex justify-between text-sm">
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                  <div class="permission-option none w-7 h-7">N</div>
                  <span>No Access</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="permission-option view w-7 h-7">V</div>
                  <span>View Only</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="permission-option edit w-7 h-7">E</div>
                  <span>Edit</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="permission-option full w-7 h-7">F</div>
                  <span>Full Access</span>
                </div>
              </div>
  
              <Button @click="saveRoleEdit">Save Changes</Button>
            </div>
          </TabsContent>
  
          <TabsContent value="roles">
            <div class="space-y-4">
              <Card v-for="role in roles" :key="role.id">
                <CardHeader>
                  <CardTitle>{{ role.name }}</CardTitle>
                  <CardDescription>{{ role.description }}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div v-for="group in permissionGroups" :key="`details-${role.id}-${group.id}`" class="flex justify-between">
                      <span class="text-sm font-medium">{{ group.name }}:</span>
                      <Badge
                          variant="outline"
                          :class="{
                          'border-gray-200 bg-gray-50 text-gray-700': rolePermissions[role.id][group.id] === 'none',
                          'border-blue-200 bg-blue-50 text-blue-700': rolePermissions[role.id][group.id] === 'view',
                          'border-indigo-200 bg-indigo-50 text-indigo-700': rolePermissions[role.id][group.id] === 'edit',
                          'border-green-200 bg-green-50 text-green-700': rolePermissions[role.id][group.id] === 'full'
                        }"
                      >
                        {{ getPermissionLabel(rolePermissions[role.id][group.id]) }}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
  
        <DialogFooter class="mt-4">
          <Button @click="$emit('update:open', false)">Done</Button>
        </DialogFooter>
      </DialogContent>
  
      <!-- Add Role Dialog -->
      <AddRoleDialog 
        v-model:open="showAddRoleDialog"
        :permission-groups="permissionGroups"
        @role-added="handleAddRole"
      />
    </Dialog>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { PlusIcon } from 'lucide-vue-next';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import AddRoleDialog from './AddRoleDialog.vue';
  
  const props = defineProps({
    open: { type: Boolean, default: () => false},
    roles: { type: Array, default: () => [] },
    permissionGroups: { type: Array, default: () => [] },
    rolePermissions: { type: Object, default: () => ({}) }
  });
  
  const emit = defineEmits(['update:open', 'roles-updated', 'role-added']);
  
  const showAddRoleDialog = ref(false);
  
  // Local copy of permissions
  const localPermissions = reactive({...props.rolePermissions});
  
  function updatePermission(roleId, groupId, level) {
    props.rolePermissions[roleId][groupId] = level;
  }
  
  function saveRoleEdit() {
    emit('roles-updated');
  }
  
  function getPermissionLabel(level) {
    const labels = {
      'none': 'No Access',
      'view': 'View Only',
      'edit': 'Edit',
      'full': 'Full Access'
    };
    return labels[level] || level;
  }
  
  function handleAddRole(newRole) {
    emit('role-added', newRole);
  }
  </script>
  
  <style scoped>
  .permission-option {
    @apply px-3 py-1.5 flex items-center justify-center text-sm font-medium rounded-md transition-colors;
  }
  
  .permission-option.none {
    @apply bg-gray-100 text-gray-500;
  }
  
  .permission-option.view {
    @apply bg-blue-50 text-blue-700;
  }
  
  .permission-option.edit {
    @apply bg-indigo-50 text-indigo-700;
  }
  
  .permission-option.full {
    @apply bg-green-50 text-green-700;
  }
  
  .permission-option.selected {
    @apply ring-2 ring-offset-2;
  }
  
  .permission-option.none.selected {
    @apply ring-gray-400;
  }
  
  .permission-option.view.selected {
    @apply ring-blue-400;
  }
  
  .permission-option.edit.selected {
    @apply ring-indigo-400;
  }
  
  .permission-option.full.selected {
    @apply ring-green-400;
  }
  </style>