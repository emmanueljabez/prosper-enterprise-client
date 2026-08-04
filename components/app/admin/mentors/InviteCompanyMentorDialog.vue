<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useCompanyMentorsStore } from '~/store/modules/companyMentors'
import type { CompanyMentorVisibilityMode } from '~/types/company-mentors'

const props = defineProps<{
  open: boolean
  companyId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: []
}>()

const companyMentorsStore = useCompanyMentorsStore()
const tagsText = ref('')
const form = reactive({
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  title: '',
  department: '',
  defaultVisibility: 'COMPANY_PRIVATE' as CompanyMentorVisibilityMode,
})

const visibilityOptions: Array<{ value: CompanyMentorVisibilityMode; label: string }> = [
  { value: 'COMPANY_PRIVATE', label: 'Company private' },
  { value: 'PROGRAM_RESTRICTED', label: 'Program restricted' },
  { value: 'PUBLIC_REQUESTED', label: 'Request public listing' },
]

const resetForm = () => {
  form.email = ''
  form.phone = ''
  form.firstName = ''
  form.lastName = ''
  form.title = ''
  form.department = ''
  form.defaultVisibility = 'COMPANY_PRIVATE'
  tagsText.value = ''
}

watch(() => props.open, (isOpen) => {
  if (!isOpen) resetForm()
})

const closeDialog = () => {
  emit('update:open', false)
}

const submitInvite = async () => {
  if (!props.companyId || !form.email.trim() || !form.phone.trim()) return

  await companyMentorsStore.inviteMentor(props.companyId, {
    email: form.email.trim(),
    phone: form.phone.trim(),
    firstName: form.firstName.trim() || null,
    lastName: form.lastName.trim() || null,
    title: form.title.trim() || null,
    department: form.department.trim() || null,
    defaultVisibility: form.defaultVisibility,
    tags: tagsText.value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean),
  })
  emit('submitted')
  closeDialog()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Invite company mentor</DialogTitle>
        <DialogDescription>
          Send email and WhatsApp invites to the normal Prosper mentor signup flow.
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" @submit.prevent="submitInvite">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-medium">
            Email
            <Input v-model="form.email" type="email" placeholder="mentor@example.com" required />
          </label>

          <label class="grid gap-2 text-sm font-medium">
            Phone
            <Input v-model="form.phone" type="tel" placeholder="+254720482575" required />
          </label>

          <label class="grid gap-2 text-sm font-medium">
            First name
            <Input v-model="form.firstName" placeholder="Maya" />
          </label>

          <label class="grid gap-2 text-sm font-medium">
            Last name
            <Input v-model="form.lastName" placeholder="Otieno" />
          </label>

          <label class="grid gap-2 text-sm font-medium">
            Title
            <Input v-model="form.title" placeholder="Engineering Lead" />
          </label>

          <label class="grid gap-2 text-sm font-medium">
            Department
            <Input v-model="form.department" placeholder="Engineering" />
          </label>
        </div>

        <label class="grid gap-2 text-sm font-medium">
          Tags
          <Input v-model="tagsText" placeholder="leadership, engineering, africa" />
        </label>

        <label class="grid gap-2 text-sm font-medium">
          Visibility
          <Select v-model="form.defaultVisibility">
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in visibilityOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </label>
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
        <Button
          type="button"
          :disabled="companyMentorsStore.isSubmitting || !form.email.trim() || !form.phone.trim()"
          @click="submitInvite"
        >
          Send invite
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
