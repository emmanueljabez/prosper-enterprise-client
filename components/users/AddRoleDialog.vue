<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>
            Create a new role with custom permissions.
          </DialogDescription>
        </DialogHeader>
  
        <div class="grid gap-4 py-4">
          <div>
            <Label for="roleName">Role Name</Label>
            <Input id="roleName" v-model="formData.name" placeholder="Support Supervisor" />
          </div>
  
          <div>
            <Label for="roleDescription">Description</Label>
            <Textarea
                id="roleDescription"
                v-model="formData.description"
                placeholder="Supervises support team and handles escalations"
                rows="3"
            />
          </div>
        </div>
  
        <DialogFooter>
          <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button
              @click="addNewRole"
              :disabled="!formData.name || isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { Loader2Icon } from 'lucide-vue-next';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Label } from '@/components/ui/label';
  import { Input } from '@/components/ui/input';
  import { Textarea } from '@/components/ui/textarea';
  import { Button } from '@/components/ui/button';
  
  const props = defineProps({
    open: { type : Boolean, default: () => false },
    permissionGroups: { type: Array, default: () => [] }
  });
  
  const emit = defineEmits(['update:open', 'role-added']);
  
  const isSubmitting = ref(false);
  const formData = reactive({
    name: '',
    description: ''
  });
  
  function addNewRole() {
    if (!formData.name) return;
    
    isSubmitting.value = true;
    const roleId = formData.name.toLowerCase().replace(/\s+/g, '_');
    
    const newRole = {
      id: roleId,
      name: formData.name,
      description: formData.description
    };
    
    // Create permissions object
    const permissions = {};
    props.permissionGroups.forEach(group => {
      permissions[group.id] = 'none';
    });
    
    setTimeout(() => {
      isSubmitting.value = false;
      emit('role-added', { role: newRole, permissions });
      emit('update:open', false);
      resetForm();
    }, 500);
  }
  
  function resetForm() {
    formData.name = '';
    formData.description = '';
  }
  </script>