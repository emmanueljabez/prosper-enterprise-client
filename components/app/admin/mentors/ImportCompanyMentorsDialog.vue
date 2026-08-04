<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { useCompanyMentorsStore } from '~/store/modules/companyMentors'

const props = defineProps<{
  open: boolean
  companyId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: []
}>()

const companyMentorsStore = useCompanyMentorsStore()
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const validation = computed(() => companyMentorsStore.importValidation)
const rows = computed(() => validation.value?.rows || [])
const errors = computed(() => validation.value?.errors?.length || 0)

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    selectedFile.value = null
    companyMentorsStore.clearImportValidation()
    if (fileInput.value) fileInput.value.value = ''
  }
})

const closeDialog = () => {
  emit('update:open', false)
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  selectedFile.value = file
  companyMentorsStore.clearImportValidation()

  if (!file || !props.companyId) return
  await companyMentorsStore.validateImport(props.companyId, file)
}

const confirmImport = async () => {
  if (!selectedFile.value || !props.companyId || errors.value > 0) return

  await companyMentorsStore.importMentors(props.companyId, selectedFile.value)
  emit('submitted')
  closeDialog()
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Import company mentors</DialogTitle>
        <DialogDescription>
          Upload an .xlsx file with email and phone columns. Optional columns: first_name, last_name, title, department, tags, visibility, program_or_cohort.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <Input
          ref="fileInput"
          type="file"
          accept=".xlsx"
          @change="handleFileChange"
        />

        <Alert v-if="validation && errors > 0" variant="destructive">
          <AlertDescription>
            {{ errors }} row issue{{ errors === 1 ? '' : 's' }} found. Fix the file and upload again.
          </AlertDescription>
        </Alert>

        <div v-if="validation" class="grid gap-3 md:grid-cols-3">
          <div class="rounded-md border p-3">
            <p class="text-xs font-medium uppercase text-muted-foreground">Rows</p>
            <p class="mt-1 text-xl font-semibold">{{ validation.totalRows }}</p>
          </div>
          <div class="rounded-md border p-3">
            <p class="text-xs font-medium uppercase text-muted-foreground">Valid rows</p>
            <p class="mt-1 text-xl font-semibold">{{ validation.validRows }}</p>
          </div>
          <div class="rounded-md border p-3">
            <p class="text-xs font-medium uppercase text-muted-foreground">Error rows</p>
            <p class="mt-1 text-xl font-semibold">{{ validation.errorRows }}</p>
          </div>
        </div>

        <div v-if="rows.length" class="max-h-[360px] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Existing mentor</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="row in rows" :key="row.rowNumber">
                <TableCell>{{ row.rowNumber }}</TableCell>
                <TableCell>{{ row.email || '-' }}</TableCell>
                <TableCell>{{ row.phone || '-' }}</TableCell>
                <TableCell>{{ row.visibility || 'COMPANY_PRIVATE' }}</TableCell>
                <TableCell>
                  <Badge :variant="row.existingProsperMentor ? 'success' : 'outline'">
                    {{ row.existingProsperMentor ? 'Yes' : 'No' }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div v-if="row.errors?.length" class="space-y-1 text-xs text-destructive">
                    <p v-for="error in row.errors" :key="`${row.rowNumber}-${error.field}-${error.reason}`">
                      {{ error.field }}: {{ error.reason }}
                    </p>
                  </div>
                  <span v-else class="text-xs text-muted-foreground">None</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
        <Button
          type="button"
          :disabled="companyMentorsStore.isSubmitting || errors > 0 || !validation?.valid || !selectedFile"
          @click="confirmImport"
        >
          Import mentors
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
