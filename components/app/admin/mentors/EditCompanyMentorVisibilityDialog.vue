<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useCompanyMentorsStore } from '~/store/modules/companyMentors'
import type { CompanyMentorPoolMember, CompanyMentorVisibilityMode } from '~/types/company-mentors'

const props = defineProps<{
  open: boolean
  companyId: string
  member: CompanyMentorPoolMember | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: []
}>()

const companyMentorsStore = useCompanyMentorsStore()
const visibilityMode = ref<CompanyMentorVisibilityMode>('COMPANY_PRIVATE')
const companyProgramIds = ref('')

const visibilityOptions: Array<{ value: CompanyMentorVisibilityMode; label: string }> = [
  { value: 'COMPANY_PRIVATE', label: 'Company private' },
  { value: 'PROGRAM_RESTRICTED', label: 'Program restricted' },
  { value: 'PUBLIC_REQUESTED', label: 'Request public listing' },
]

const parsedCompanyProgramIds = computed(() =>
  companyProgramIds.value
    .split(',')
    .map(id => id.trim())
    .filter(Boolean),
)

watch(
  () => props.member,
  (member) => {
    visibilityMode.value = member?.visibilityMode || 'COMPANY_PRIVATE'
    companyProgramIds.value = member?.programScopes
      ?.map(scope => scope.companyProgramId)
      .filter(Boolean)
      .join(', ') || ''
  },
  { immediate: true },
)

const closeDialog = () => {
  emit('update:open', false)
}

const submitVisibility = async () => {
  if (!props.companyId || !props.member?.id) return

  await companyMentorsStore.updateVisibility(props.companyId, props.member.id, {
    visibilityMode: visibilityMode.value,
    companyProgramIds: parsedCompanyProgramIds.value,
  })
  emit('submitted')
  closeDialog()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Edit mentor visibility</DialogTitle>
        <DialogDescription>
          Configure where this company mentor can be used. Public listing still requires Prosper approval.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4">
        <label class="grid gap-2 text-sm font-medium">
          Visibility
          <Select v-model="visibilityMode">
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

        <label class="grid gap-2 text-sm font-medium">
          Program IDs
          <Input
            v-model="companyProgramIds"
            placeholder="Comma-separated company program IDs"
          />
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
        <Button
          type="button"
          :disabled="companyMentorsStore.isSubmitting || !member"
          @click="submitVisibility"
        >
          Save visibility
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
