<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ mode === 'add' ? 'Add New User' : 'Edit User' }}</DialogTitle>
          <DialogDescription>
            {{ mode === 'add' ? 'Create a new system user account and set their permissions.' : 'Update user details and permissions.' }}
          </DialogDescription>
        </DialogHeader>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <template v-if="mode === 'add'">
            <div>
              <Label for="firstName">First Name</Label>
              <Input id="firstName" v-model="formData.firstName" placeholder="John" />
            </div>
  
            <div>
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" v-model="formData.lastName" placeholder="Doe" />
            </div>
          </template>
  
          <template v-else>
            <div>
              <Label for="editName">Full Name</Label>
              <Input id="editName" v-model="formData.name" />
            </div>
          </template>
  
          <div>
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="formData.email" placeholder="john.doe@example.com" />
          </div>
  
          <div>
            <Label for="role">Role</Label>
            <Select v-model="formData.role">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
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
            <Label for="department">Department</Label>
            <Input id="department" v-model="formData.department" placeholder="Network Operations" />
          </div>
  
          <div>
            <Label for="location">Location</Label>
            <Input id="location" v-model="formData.location" placeholder="Head Office" />
          </div>
  
          <div>
            <Label for="phone">Phone Number</Label>
            <Input id="phone" v-model="formData.phone" placeholder="(555) 123-4567" />
          </div>
  
          <div v-if="mode === 'add'" class="flex items-center space-x-2 md:col-span-2 mt-2">
            <Checkbox id="sendInvite" v-model:checked="formData.sendInvite" />
            <label
                for="sendInvite"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send email invitation to set up account
            </label>
          </div>
        </div>
  
        <DialogFooter>
          <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
          <Button
              @click="submitForm"
              :disabled="isDisabled || isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ mode === 'add' ? 'Add User' : 'Save Changes' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch } from 'vue';
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
  import { Button } from '@/components/ui/button';
  import { Checkbox } from '@/components/ui/checkbox';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  
  const props = defineProps({
    open: { type: Boolean, default: () => false },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit'].includes(value)
    },
    user: { type: Object, default: () => ({}) },
    roles: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['update:open', 'user-added', 'user-updated']);
  
  const isSubmitting = ref(false);
  const formData = reactive({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    role: '',
    department: '',
    location: '',
    phone: '',
    sendInvite: true
  });
  
  watch(() => props.user, (newUser) => {
    if (newUser && props.mode === 'edit') {
      formData.name = newUser.name || '';
      formData.email = newUser.email || '';
      formData.role = newUser.role || '';
      formData.department = newUser.department || '';
      formData.location = newUser.location || '';
      formData.phone = newUser.phone || '';
    }
  }, { immediate: true });
  
  const isDisabled = computed(() => {
    if (props.mode === 'add') {
      return !formData.firstName || !formData.lastName || !formData.email || !formData.role;
    } else {
      return !formData.name || !formData.email || !formData.role;
    }
  });
  
  function generateAvatar(name) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  }
  
  function submitForm() {
    isSubmitting.value = true;
    
    if (props.mode === 'add') {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        location: formData.location,
        phone: formData.phone,
        avatar: generateAvatar(`${formData.firstName} ${formData.lastName}`),
        status: formData.sendInvite ? 'invited' : 'active',
        lastActive: formData.sendInvite ? null : new Date().toISOString()
      };
      
      setTimeout(() => {
        isSubmitting.value = false;
        emit('user-added', newUser);
        emit('update:open', false);
        resetForm();
      }, 500);
    } else {
      const updatedUser = {
        ...props.user,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        location: formData.location,
        phone: formData.phone
      };
      
      setTimeout(() => {
        isSubmitting.value = false;
        emit('user-updated', updatedUser);
        emit('update:open', false);
      }, 500);
    }
  }
  
  function resetForm() {
    formData.firstName = '';
    formData.lastName = '';
    formData.name = '';
    formData.email = '';
    formData.role = '';
    formData.department = '';
    formData.location = '';
    formData.phone = '';
    formData.sendInvite = true;
  }
  </script>