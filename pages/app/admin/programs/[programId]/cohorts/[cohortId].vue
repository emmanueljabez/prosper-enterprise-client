<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useCompanyProgramsStore } from '@/store/modules/company-programs'
import { useCompanyProgramCohortsStore } from '@/store/modules/company-program-cohorts'
import type { CompanyProgramParticipantRecord } from '@/http/requests/app/companyPrograms'
import type {
  CircleSuggestionRecord,
  CohortParticipantStatus,
  CohortRosterParticipantPayload,
  CompanyProgramCohortJoinRequestRecord,
  CompanyProgramCohortParticipantRecord,
  CompanyProgramCohortRecord,
  CompanyProgramCohortStatus,
  CommonInterestCircleRecord,
  CommonInterestCircleMemberRecord,
  PlenaryAttendanceStatus,
} from '@/http/requests/app/companyProgramCohorts'
import { useAppToast } from '@/composables/services/toastService'
import CompanyProgramCohortEditorDialog from '@/components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Tabs, TabsContent } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Layers3,
  Link,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Shuffle,
  Ticket,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-vue-next'

definePageMeta({
  title: 'Cohort Workspace',
  description: 'Operate a company program cohort',
  requiresAuth: true,
  permissions: ['admin:programs'],
})

type CircleFormModel = {
  name: string
  theme: string
  interestTags: string
  facilitatorProfileId: string
  minSize: number | null
  maxSize: number | null
  nextSessionAt: string
}

const route = useRoute()
const router = useRouter()
const cohortsStore = useCompanyProgramCohortsStore()
const companyProgramsStore = useCompanyProgramsStore()
const toast = useAppToast()

const {
  selectedCohort,
  participants,
  joinRequests,
  circles,
  suggestions,
  dashboard,
  isLoading,
  isSaving,
  error,
} = storeToRefs(cohortsStore)

const {
  participants: programRosterParticipants,
  participantsLoading: programRosterLoading,
  participantsError: programRosterError,
} = storeToRefs(companyProgramsStore)

const programId = computed(() => String(route.params.programId || ''))
const cohortId = computed(() => String(route.params.cohortId || ''))
const activeTab = ref(['participants', 'plenary', 'circles', 'matching'].includes(String(route.query.tab)) ? String(route.query.tab) : 'overview')
const editDialogOpen = ref(false)
const isRosterDialogOpen = ref(false)
const isCreateCircleDialogOpen = ref(false)
const addMenteesCircleId = ref<string | null>(null)
const rosterEntryMode = ref<'program' | 'upload'>('program')
const rosterCsv = ref('')
const selectedProgramParticipantIds = ref<string[]>([])
const membershipTargetCircleId = reactive<Record<string, string>>({})
const newCircle = reactive<CircleFormModel>({
  name: '',
  theme: '',
  interestTags: '',
  facilitatorProfileId: '',
  minSize: 5,
  maxSize: 10,
  nextSessionAt: '',
})

const activeParticipants = computed(() =>
  participants.value.filter(participant => !['REJECTED', 'WITHDRAWN'].includes(participant.status)),
)

const reviewParticipants = computed(() =>
  participants.value.filter(participant =>
    ['PENDING', 'CONFIRMED'].includes(participant.status) || participant.duplicateStatus === 'POSSIBLE_DUPLICATE',
  ),
)
const activeJoinRequests = computed(() =>
  joinRequests.value.filter(joinRequest => ['PENDING', 'DUPLICATE_REVIEW'].includes(joinRequest.status)),
)

const plenaryParticipants = computed(() =>
  participants.value.filter(participant => !['REJECTED', 'WITHDRAWN'].includes(participant.status)),
)

const placedParticipantIds = computed(() => {
  const ids = new Set<string>()
  for (const circle of circles.value) {
    for (const member of circle.members || []) {
      if (member.status !== 'REMOVED') {
        ids.add(member.cohortParticipantId)
      }
    }
  }
  return ids
})

const circleEligibleParticipants = computed(() =>
  activeParticipants.value.filter(participant =>
    ['CONFIRMED', 'PLENARY_ATTENDED', 'PLACED_IN_CIRCLE', 'ELIGIBLE_FOR_MATCHING', 'MATCHED', 'ACTIVE', 'COMPLETED'].includes(participant.status),
  ),
)

const unplacedParticipants = computed(() =>
  circleEligibleParticipants.value.filter(participant => !placedParticipantIds.value.has(participant.id)),
)

const unplacedParticipantsEmptyCopy = computed(() => {
  if (!activeParticipants.value.length) {
    return 'No active mentees are in this cohort yet. Add participants or share the join code.'
  }
  if (!circleEligibleParticipants.value.length) {
    return 'No mentees are ready for circle placement yet. Confirm intake first.'
  }
  return 'Every circle-ready participant is placed.'
})

const cohortParticipantProfileIds = computed(() => {
  const ids = new Set<string>()
  participants.value.forEach((participant) => {
    if (participant.profileId) ids.add(participant.profileId)
  })
  return ids
})

const availableProgramRosterParticipants = computed(() =>
  programRosterParticipants.value.filter(participant =>
    participant.profileId
    && participant.status !== 'WITHDRAWN'
    && !cohortParticipantProfileIds.value.has(participant.profileId),
  ),
)

const selectedProgramParticipants = computed(() =>
  availableProgramRosterParticipants.value.filter(participant =>
    selectedProgramParticipantIds.value.includes(participant.id),
  ),
)

const addMenteesCircle = computed(() =>
  circles.value.find(circle => circle.id === addMenteesCircleId.value) || null,
)

const circleCapacityLabel = (cohort?: CompanyProgramCohortRecord | null) =>
  `${cohort?.circleMinSize || 5}-${cohort?.circleMaxSize || 10}`

const statusTone = (status?: CompanyProgramCohortStatus | null) => ({
  DRAFT: 'secondary',
  INTAKE_OPEN: 'default',
  INTAKE_CLOSED: 'outline',
  PLENARY_SCHEDULED: 'secondary',
  CIRCLES_FORMING: 'default',
  CIRCLES_FINALIZED: 'secondary',
  MATCHING: 'default',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const participantStatusTone = (status?: CohortParticipantStatus | null) => ({
  PENDING: 'secondary',
  CONFIRMED: 'default',
  PLENARY_ATTENDED: 'default',
  PLACED_IN_CIRCLE: 'secondary',
  ELIGIBLE_FOR_MATCHING: 'default',
  MATCHED: 'default',
  ACTIVE: 'default',
  COMPLETED: 'outline',
  WITHDRAWN: 'destructive',
  REJECTED: 'destructive',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const duplicateTone = (status?: string | null) => ({
  CLEAR: 'outline',
  POSSIBLE_DUPLICATE: 'destructive',
  RESOLVED_EXISTING_PROFILE: 'secondary',
  RESOLVED_NEW_PROFILE: 'secondary',
}[String(status || '')] as 'default' | 'secondary' | 'outline' | 'destructive')

const statusLabel = (status?: string | null) =>
  status ? String(status).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Unknown'

const formatDate = (value?: string | null) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined) return '0%'
  const normalized = value > 1 ? value : value * 100
  return `${Math.round(normalized)}%`
}

const toIsoOrNull = (value: string) => value ? new Date(value).toISOString() : null
const optionalNumber = (value: number | string | null) => {
  if (value === null || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const splitTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

const normalizeRosterHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const rosterHeaderAliases: Record<string, keyof CohortRosterParticipantPayload | 'name'> = {
  profileid: 'profileId',
  profiled: 'profileId',
  name: 'name',
  fullname: 'name',
  firstname: 'firstName',
  givenname: 'firstName',
  lastname: 'lastName',
  surname: 'lastName',
  email: 'email',
  emailaddress: 'email',
  phone: 'phone',
  phonenumber: 'phone',
  mobile: 'phone',
  chapter: 'chapter',
  region: 'region',
  interesttags: 'interestTags',
  interests: 'interestTags',
  tags: 'interestTags',
}

const rosterDefaultColumns: Array<keyof CohortRosterParticipantPayload> = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'chapter',
  'region',
  'interestTags',
]

const optionalString = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const splitRosterTags = (value?: string | null) =>
  (value || '')
    .split(/[;,|]/)
    .map(tag => tag.trim())
    .filter(Boolean)

const applyRosterValue = (row: CohortRosterParticipantPayload, key: keyof CohortRosterParticipantPayload | 'name', value: string) => {
  const trimmed = optionalString(value)
  if (!trimmed) return

  if (key === 'name') {
    const [firstName, ...lastNameParts] = trimmed.split(/\s+/)
    if (!row.firstName && firstName) row.firstName = firstName
    if (!row.lastName && lastNameParts.length) row.lastName = lastNameParts.join(' ')
    return
  }

  if (key === 'interestTags') {
    row.interestTags = splitRosterTags(trimmed)
    return
  }

  row[key] = trimmed as any
}

const parseRosterRows = (rawRows: unknown[][]): CohortRosterParticipantPayload[] => {
  const parsedRows = rawRows
    .map(row => row.map(cell => String(cell || '').trim()))
    .filter(row => row.some(Boolean))

  if (!parsedRows.length) return []

  const firstRow = parsedRows[0]
  const hasHeader = firstRow.some(cell => Boolean(rosterHeaderAliases[normalizeRosterHeader(cell)]))
  const headers = hasHeader ? firstRow : rosterDefaultColumns
  const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows

  return dataRows
    .map((cells) => {
      const row: CohortRosterParticipantPayload = {}
      cells.forEach((cell, index) => {
        const key = hasHeader
          ? rosterHeaderAliases[normalizeRosterHeader(String(headers[index] || ''))]
          : headers[index]
        if (key) applyRosterValue(row, key, cell)
      })
      return row
    })
    .filter(row => Boolean(row.profileId || row.email || row.phone || row.firstName || row.lastName))
}

const parseRosterCsv = (value: string): CohortRosterParticipantPayload[] => {
  const rows = Papa.parse<string[]>(value, { skipEmptyLines: 'greedy' }).data
  return parseRosterRows(rows)
}

const csvCell = (value: unknown) => {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const rowsToCsv = (rows: unknown[][]) =>
  rows.map(row => row.map(csvCell).join(',')).join('\n')

const parseRosterWorkbook = async (file: File): Promise<string> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return ''

  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    blankrows: false,
    defval: '',
  })

  return rowsToCsv(rows)
}

const downloadRosterTemplate = () => {
  const rows = [
    rosterDefaultColumns,
    ['Amina', 'Otieno', 'amina@example.com', '+254712000000', selectedCohort.value?.chapter || 'Nairobi', selectedCohort.value?.region || 'Kenya', 'STEM; Career readiness'],
  ]
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cohort roster')
  XLSX.writeFile(workbook, `${selectedCohort.value?.code || 'cohort'}-participant-template.xlsx`)
}

const rosterPreviewRows = computed(() => parseRosterCsv(rosterCsv.value))

const participantName = (participant?: CompanyProgramCohortParticipantRecord | null) =>
  participant?.profileName || participant?.profileEmail || participant?.profilePhone || 'Cohort participant'

const memberName = (member: CommonInterestCircleMemberRecord) =>
  member.profileName || member.profileEmail || 'Circle member'

const loadCohort = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadCohort(cohortId.value)
}

const loadParticipants = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadParticipants(cohortId.value)
}

const loadJoinRequests = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadJoinRequests(cohortId.value)
}

const loadCircles = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadCircles(cohortId.value)
}

const loadDashboard = async () => {
  if (!cohortId.value) return
  await cohortsStore.loadDashboard(cohortId.value)
}

const loadWorkspace = async () => {
  if (!cohortId.value) return

  try {
    await Promise.all([
      loadCohort(),
      loadParticipants(),
      loadJoinRequests(),
      loadCircles(),
      loadDashboard(),
    ])
  } catch (workspaceError: any) {
    toast.error(workspaceError?.response?.data?.message || workspaceError?.message || 'Failed to load cohort workspace')
  }
}

const refreshAfterMutation = async () => {
  await Promise.all([
    loadCohort(),
    loadParticipants(),
    loadJoinRequests(),
    loadCircles(),
    loadDashboard(),
  ])
}

const loadProgramRoster = async () => {
  if (!programId.value) return
  try {
    await companyProgramsStore.loadProgramParticipants({
      companyProgramId: programId.value,
      page: 0,
      size: 500,
      status: 'ALL',
    })
  } catch (programRosterLoadError: any) {
    toast.error(programRosterLoadError?.response?.data?.message || programRosterLoadError?.message || 'Failed to load program roster')
  }
}

const openIntake = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.openIntake(cohortId.value)
    toast.success('Cohort intake opened.')
    await loadDashboard()
  } catch (intakeError: any) {
    toast.error(intakeError?.response?.data?.message || intakeError?.message || 'Failed to open cohort intake')
  }
}

const closeIntake = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.closeIntake(cohortId.value)
    toast.success('Cohort intake closed.')
    await loadDashboard()
  } catch (intakeError: any) {
    toast.error(intakeError?.response?.data?.message || intakeError?.message || 'Failed to close cohort intake')
  }
}

const openRosterDialog = async () => {
  rosterEntryMode.value = 'program'
  isRosterDialogOpen.value = true
  await loadProgramRoster()
}

const closeRosterDialog = () => {
  isRosterDialogOpen.value = false
  rosterCsv.value = ''
  selectedProgramParticipantIds.value = []
  rosterEntryMode.value = 'program'
}

const toggleProgramParticipant = (participant: CompanyProgramParticipantRecord, checked: boolean | 'indeterminate') => {
  if (!participant.profileId) return
  const selected = new Set(selectedProgramParticipantIds.value)
  if (checked === true) {
    selected.add(participant.id)
  } else {
    selected.delete(participant.id)
  }
  selectedProgramParticipantIds.value = Array.from(selected)
}

const handleRosterFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const fileName = file.name.toLowerCase()
  rosterCsv.value = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    ? await parseRosterWorkbook(file)
    : await file.text()
  input.value = ''
}

const submitProgramRosterParticipants = async () => {
  if (!cohortId.value) return

  const selected = selectedProgramParticipants.value
  if (!selected.length) {
    toast.error('Select at least one program employee before adding participants.')
    return
  }

  try {
    const participants = await cohortsStore.addRosterParticipants(cohortId.value, {
      participants: selected.map(participant => ({
        profileId: participant.profileId,
        chapter: selectedCohort.value?.chapter || null,
        region: selectedCohort.value?.region || null,
      })),
    })
    toast.success(`${participants.length} participant${participants.length === 1 ? '' : 's'} added to this cohort and queued for notification.`)
    closeRosterDialog()
    activeTab.value = 'participants'
    await refreshAfterMutation()
  } catch (rosterError: any) {
    toast.error(rosterError?.response?.data?.message || rosterError?.message || 'Failed to add program roster participants')
  }
}

const submitRosterParticipants = async () => {
  if (!cohortId.value) return

  const rows = parseRosterCsv(rosterCsv.value)
  if (!rows.length) {
    toast.error('Add at least one participant row before uploading the roster.')
    return
  }

  const missingContact = rows.find(row => !row.profileId && !row.email && !row.phone)
  if (missingContact) {
    toast.error('Each roster row needs an email or phone number.')
    return
  }

  try {
    const participants = await cohortsStore.addRosterParticipants(cohortId.value, {
      participants: rows.map(row => ({
        ...row,
        chapter: row.chapter || selectedCohort.value?.chapter || null,
        region: row.region || selectedCohort.value?.region || null,
      })),
    })
    toast.success(`${participants.length} participant${participants.length === 1 ? '' : 's'} added for review and queued for notification.`)
    closeRosterDialog()
    activeTab.value = 'participants'
    await refreshAfterMutation()
  } catch (rosterError: any) {
    toast.error(rosterError?.response?.data?.message || rosterError?.message || 'Failed to upload cohort roster')
  }
}

const confirmParticipant = async (participant: CompanyProgramCohortParticipantRecord) => {
  try {
    await cohortsStore.confirmParticipant(participant.id)
    toast.success('Participant confirmed.')
    await loadDashboard()
  } catch (participantError: any) {
    toast.error(participantError?.response?.data?.message || participantError?.message || 'Failed to confirm participant')
  }
}

const rejectParticipant = async (participant: CompanyProgramCohortParticipantRecord) => {
  try {
    await cohortsStore.rejectParticipant(participant.id)
    toast.success('Participant rejected.')
    await loadDashboard()
  } catch (participantError: any) {
    toast.error(participantError?.response?.data?.message || participantError?.message || 'Failed to reject participant')
  }
}

const resolveDuplicate = async (participant: CompanyProgramCohortParticipantRecord, mode: 'existing' | 'new') => {
  const profileId = mode === 'existing' ? participant.duplicateCandidateProfileId : participant.profileId
  if (!profileId) {
    toast.error('A profile is required to resolve this duplicate review.')
    return
  }

  try {
    await cohortsStore.resolveDuplicate(participant.id, {
      profileId,
      duplicateStatus: mode === 'existing' ? 'RESOLVED_EXISTING_PROFILE' : 'RESOLVED_NEW_PROFILE',
    })
    toast.success('Duplicate review resolved.')
    await loadDashboard()
  } catch (duplicateError: any) {
    toast.error(duplicateError?.response?.data?.message || duplicateError?.message || 'Failed to resolve duplicate review')
  }
}

const joinRequestName = (joinRequest: CompanyProgramCohortJoinRequestRecord) =>
  [joinRequest.submittedFirstName, joinRequest.submittedLastName].filter(Boolean).join(' ').trim()
  || joinRequest.submittedEmail
  || 'Self-join request'

const confirmJoinRequest = async (joinRequest: CompanyProgramCohortJoinRequestRecord) => {
  if (!joinRequest.matchedProfileId) {
    toast.error('A matched profile is required before confirming this join request.')
    return
  }

  try {
    await cohortsStore.confirmJoinRequest(joinRequest.id, { profileId: joinRequest.matchedProfileId })
    toast.success('Join request confirmed.')
    await refreshAfterMutation()
  } catch (joinRequestError: any) {
    toast.error(joinRequestError?.response?.data?.message || joinRequestError?.message || 'Failed to confirm join request')
  }
}

const rejectJoinRequest = async (joinRequest: CompanyProgramCohortJoinRequestRecord) => {
  try {
    await cohortsStore.rejectJoinRequest(joinRequest.id)
    toast.success('Join request rejected.')
    await refreshAfterMutation()
  } catch (joinRequestError: any) {
    toast.error(joinRequestError?.response?.data?.message || joinRequestError?.message || 'Failed to reject join request')
  }
}

const recordPlenaryAttendance = async (participant: CompanyProgramCohortParticipantRecord, status: PlenaryAttendanceStatus) => {
  try {
    await cohortsStore.recordPlenaryAttendance(participant.id, {
      status,
      attendanceSource: 'ADMIN_OVERRIDE',
    })
    toast.success('Plenary attendance recorded.')
    await loadDashboard()
  } catch (attendanceError: any) {
    toast.error(attendanceError?.response?.data?.message || attendanceError?.message || 'Failed to record plenary attendance')
  }
}

const suggestCircles = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.suggestCircles(cohortId.value)
    activeTab.value = 'circles'
    toast.success('Circle suggestions refreshed.')
  } catch (suggestionError: any) {
    toast.error(suggestionError?.response?.data?.message || suggestionError?.message || 'Failed to suggest circles')
  }
}

const resetCircleForm = () => {
  newCircle.name = ''
  newCircle.theme = ''
  newCircle.interestTags = ''
  newCircle.facilitatorProfileId = ''
  newCircle.minSize = selectedCohort.value?.circleMinSize ?? 5
  newCircle.maxSize = selectedCohort.value?.circleMaxSize ?? 10
  newCircle.nextSessionAt = ''
}

const openCreateCircleDialog = () => {
  resetCircleForm()
  isCreateCircleDialogOpen.value = true
}

const closeCreateCircleDialog = () => {
  isCreateCircleDialogOpen.value = false
  resetCircleForm()
}

const openAddMenteesDialog = (circleId: string) => {
  addMenteesCircleId.value = circleId
}

const closeAddMenteesDialog = () => {
  addMenteesCircleId.value = null
}

const addMenteesDialogOpen = computed({
  get: () => Boolean(addMenteesCircle.value),
  set: (open: boolean) => {
    if (!open) closeAddMenteesDialog()
  },
})

const createCircle = async () => {
  if (!cohortId.value) return

  if (!newCircle.name.trim()) {
    toast.error('Circle name is required')
    return
  }

  try {
    await cohortsStore.createCircle(cohortId.value, {
      name: newCircle.name.trim(),
      theme: newCircle.theme.trim() || null,
      interestTags: splitTags(newCircle.interestTags),
      facilitatorProfileId: newCircle.facilitatorProfileId.trim() || null,
      minSize: optionalNumber(newCircle.minSize),
      maxSize: optionalNumber(newCircle.maxSize),
      nextSessionAt: toIsoOrNull(newCircle.nextSessionAt),
    })
    resetCircleForm()
    isCreateCircleDialogOpen.value = false
    toast.success('Circle created.')
    await refreshAfterMutation()
  } catch (circleError: any) {
    toast.error(circleError?.response?.data?.message || circleError?.message || 'Failed to create circle')
  }
}

const createCircleFromSuggestion = async (suggestion: CircleSuggestionRecord) => {
  if (!cohortId.value) return

  try {
    const circle = await cohortsStore.createCircle(cohortId.value, {
      name: suggestion.name,
      theme: suggestion.theme || null,
      interestTags: suggestion.interestTags || [],
      minSize: selectedCohort.value?.circleMinSize ?? null,
      maxSize: selectedCohort.value?.circleMaxSize ?? null,
    })

    for (const cohortParticipantId of suggestion.cohortParticipantIds || []) {
      await cohortsStore.placeParticipant(circle.id, {
        cohortParticipantId,
        placementSource: 'SUGGESTED',
      })
    }

    toast.success('Suggested circle created.')
    await refreshAfterMutation()
  } catch (circleError: any) {
    toast.error(circleError?.response?.data?.message || circleError?.message || 'Failed to create suggested circle')
  }
}

const placeParticipantInCircle = async (circleId: string, participant: CompanyProgramCohortParticipantRecord) => {
  if (!circleId) {
    toast.error('Choose a circle before adding this mentee')
    return
  }

  try {
    await cohortsStore.placeParticipant(circleId, {
      cohortParticipantId: participant.id,
      placementSource: 'ADMIN_PLACED',
    })
    toast.success('Mentee added to circle.')
    await refreshAfterMutation()
    if (!unplacedParticipants.value.length) {
      closeAddMenteesDialog()
    }
  } catch (placementError: any) {
    toast.error(placementError?.response?.data?.message || placementError?.message || 'Failed to add mentee to circle')
  }
}

const moveMembership = async (membershipId: string) => {
  const targetCircleId = membershipTargetCircleId[membershipId]
  if (!targetCircleId) {
    toast.error('Choose a target circle before moving this member')
    return
  }

  try {
    await cohortsStore.moveMembership(membershipId, { targetCircleId })
    membershipTargetCircleId[membershipId] = ''
    toast.success('Circle member moved.')
    await refreshAfterMutation()
  } catch (moveError: any) {
    toast.error(moveError?.response?.data?.message || moveError?.message || 'Failed to move circle member')
  }
}

const removeMembership = async (membershipId: string) => {
  try {
    await cohortsStore.removeMembership(membershipId)
    toast.success('Circle member removed.')
    await refreshAfterMutation()
  } catch (removeError: any) {
    toast.error(removeError?.response?.data?.message || removeError?.message || 'Failed to remove circle member')
  }
}

const finalizeCircles = async () => {
  if (!cohortId.value) return

  try {
    await cohortsStore.finalizeCircles(cohortId.value)
    toast.success('Circles finalized.')
    await refreshAfterMutation()
  } catch (finalizeError: any) {
    toast.error(finalizeError?.response?.data?.message || finalizeError?.message || 'Failed to finalize circles')
  }
}

const canOpenIntake = computed(() => ['DRAFT', 'INTAKE_CLOSED'].includes(String(selectedCohort.value?.status || '')))
const canCloseIntake = computed(() => selectedCohort.value?.status === 'INTAKE_OPEN')
const canFinalizeCircles = computed(() => Boolean(circles.value.length) && Boolean(circleEligibleParticipants.value.length) && !unplacedParticipants.value.length)

watch(cohortId, async () => {
  await loadWorkspace()
}, { immediate: true })

watch(activeTab, value => {
  router.replace({
    query: value === 'overview' ? {} : { tab: value },
  })
})
</script>

<template>
  <div class="container mx-auto space-y-6 px-4 py-6">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <Button variant="ghost" class="w-fit px-0 text-muted-foreground" @click="router.push(`/app/admin/programs/${programId}?tab=cohorts`)">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to cohorts
        </Button>
        <div class="flex flex-wrap items-center gap-2">
          <Badge v-if="selectedCohort" :variant="statusTone(selectedCohort.status)">
            {{ statusLabel(selectedCohort.status) }}
          </Badge>
          <Badge v-if="selectedCohort?.code" variant="outline">
            <Ticket class="mr-1 h-3 w-3" />
            {{ selectedCohort.code }}
          </Badge>
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">{{ selectedCohort?.name || 'Cohort workspace' }}</h1>
        <p class="text-sm text-muted-foreground">
          Manage cohort intake, plenary attendance, circles, and matching readiness.
        </p>
      </div>

      <div class="cohort-actions">
        <Button variant="outline" :disabled="isLoading" @click="loadWorkspace">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
        <Button variant="outline" :disabled="isSaving" @click="openRosterDialog">
          <UserPlus class="mr-2 h-4 w-4" />
          Add participants
        </Button>
        <Button variant="outline" :disabled="!selectedCohort || isSaving" @click="editDialogOpen = true">
          <Pencil class="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button v-if="canOpenIntake" :disabled="isSaving" @click="openIntake">
          <Link class="mr-2 h-4 w-4" />
          Open intake
        </Button>
        <Button v-if="canCloseIntake" variant="outline" :disabled="isSaving" @click="closeIntake">
          Close intake
        </Button>
      </div>
    </div>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <div v-if="isLoading && !selectedCohort" class="space-y-3">
      <Skeleton class="h-28 w-full" />
      <Skeleton class="h-12 w-full" />
    </div>

    <template v-else>
      <div class="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Participants</CardDescription>
            <CardTitle class="text-3xl">{{ dashboard?.enrolledCount ?? selectedCohort?.participantCount ?? participants.length }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Plenary attended</CardDescription>
            <CardTitle class="text-3xl">{{ dashboard?.plenaryAttendedCount ?? 0 }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Circles</CardDescription>
            <CardTitle class="text-3xl">{{ dashboard?.circleCount ?? circles.length }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-2">
            <CardDescription>Match completion</CardDescription>
            <CardTitle class="text-3xl">{{ formatPercent(dashboard?.matchCompletionRate) }}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs v-model="activeTab" class="space-y-4">
        <div class="cohort-tabbar" aria-label="Cohort workspace sections">
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            Overview
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'participants' }"
            @click="activeTab = 'participants'"
          >
            Intake
            <span>{{ reviewParticipants.length + activeJoinRequests.length }}</span>
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'plenary' }"
            @click="activeTab = 'plenary'"
          >
            Plenary
            <span>{{ dashboard?.plenaryAttendedCount ?? 0 }}</span>
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'circles' }"
            @click="activeTab = 'circles'"
          >
            Circles
            <span>{{ circles.length }}</span>
          </button>
          <button
            type="button"
            class="cohort-tab"
            :class="{ 'cohort-tab--active': activeTab === 'matching' }"
            @click="activeTab = 'matching'"
          >
            Matching
            <span>{{ selectedCohort?.matchedCount || 0 }}</span>
          </button>
        </div>

        <TabsContent value="overview" class="space-y-4">
          <div class="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Setup</CardTitle>
                <CardDescription>Cycle configuration for this company program.</CardDescription>
              </CardHeader>
              <CardContent class="grid gap-4 md:grid-cols-2">
                <div class="cohort-detail">
                  <span>Company program</span>
                  <strong>{{ selectedCohort?.companyProgramName || '-' }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Chapter</span>
                  <strong>{{ selectedCohort?.chapter || 'Not set' }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Region</span>
                  <strong>{{ selectedCohort?.region || 'Not set' }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Dates</span>
                  <strong>{{ formatDate(selectedCohort?.startsAt) }} - {{ formatDate(selectedCohort?.endsAt) }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Circle size</span>
                  <strong>{{ circleCapacityLabel(selectedCohort) }}</strong>
                </div>
                <div class="cohort-detail">
                  <span>Matching gate</span>
                  <strong>{{ selectedCohort?.matchingStartsAfterCirclesFinalized === false ? 'Before final circles' : 'After final circles' }}</strong>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intake Link</CardTitle>
                <CardDescription>Share this join code when self-join is open.</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="rounded-lg border bg-muted/20 p-4">
                  <div class="text-xs font-medium uppercase text-muted-foreground">Join code</div>
                  <div class="mt-1 break-all text-lg font-semibold">{{ selectedCohort?.code || '-' }}</div>
                </div>
                <div class="grid gap-2 text-sm text-muted-foreground">
                  <div>Self-join: {{ selectedCohort?.selfJoinEnabled ? 'Enabled' : 'Disabled' }}</div>
                  <div>Capacity: {{ selectedCohort?.selfJoinCapacity || 'Open' }}</div>
                  <div>Expires: {{ formatDate(selectedCohort?.selfJoinExpiresAt) }}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Indicators</CardTitle>
              <CardDescription>Signals from cohort progress and matching readiness.</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="dashboard?.riskIndicators?.length" class="flex flex-wrap gap-2">
                <Badge v-for="risk in dashboard.riskIndicators" :key="risk" variant="destructive">
                  <ShieldAlert class="mr-1 h-3 w-3" />
                  {{ statusLabel(risk) }}
                </Badge>
              </div>
              <p v-else class="text-sm text-muted-foreground">No cohort risk indicators are currently reported.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Self-join requests</CardTitle>
              <CardDescription>Review employees who joined this cohort with the shared code.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="!activeJoinRequests.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No pending self-join requests.
              </div>
              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Matched profile</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="joinRequest in activeJoinRequests" :key="joinRequest.id">
                    <TableCell>
                      <div class="space-y-1">
                        <div class="font-medium">{{ joinRequestName(joinRequest) }}</div>
                        <div class="text-xs text-muted-foreground">
                          {{ joinRequest.submittedEmail || joinRequest.submittedPhone || 'Self-join intake' }}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="joinRequest.status === 'DUPLICATE_REVIEW' ? 'destructive' : 'secondary'">
                        {{ statusLabel(joinRequest.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span class="text-sm">{{ joinRequest.matchedProfileName || joinRequest.matchedProfileId || 'Profile match required' }}</span>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="tag in joinRequest.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="text-right">
                      <div class="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          :disabled="isSaving || !joinRequest.matchedProfileId"
                          @click="confirmJoinRequest(joinRequest)"
                        >
                          Confirm matched profile
                        </Button>
                        <Button size="sm" variant="ghost" :disabled="isSaving" @click="rejectJoinRequest(joinRequest)">
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Intake Review</CardTitle>
                <CardDescription>Confirm uploaded roster rows and self-join requests before plenary and circles.</CardDescription>
              </div>
              <Button variant="outline" size="sm" :disabled="isSaving" @click="openRosterDialog">
                <Upload class="mr-2 h-4 w-4" />
                Upload roster
              </Button>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="isLoading" class="space-y-3">
                <Skeleton class="h-12 w-full" />
                <Skeleton class="h-12 w-full" />
              </div>
              <div v-else-if="!participants.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                <p>No participants are attached to this cohort yet.</p>
                <Button class="mt-4" variant="outline" :disabled="isSaving" @click="openRosterDialog">
                  <UserPlus class="mr-2 h-4 w-4" />
                  Add participants
                </Button>
              </div>
              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duplicate review</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="participant in participants" :key="participant.id">
                    <TableCell>
                      <div class="space-y-1">
                        <div class="font-medium">{{ participantName(participant) }}</div>
                        <div class="text-xs text-muted-foreground">
                          {{ participant.profileEmail || participant.profilePhone || participant.source }}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="participantStatusTone(participant.status)">
                        {{ statusLabel(participant.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="duplicateTone(participant.duplicateStatus)">
                        {{ statusLabel(participant.duplicateStatus) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="text-right">
                      <div class="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          :disabled="isSaving || ['CONFIRMED', 'PLENARY_ATTENDED', 'PLACED_IN_CIRCLE', 'ELIGIBLE_FOR_MATCHING', 'MATCHED', 'ACTIVE', 'COMPLETED'].includes(participant.status)"
                          @click="confirmParticipant(participant)"
                        >
                          <UserCheck class="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" :disabled="isSaving || participant.status === 'REJECTED'" @click="rejectParticipant(participant)">
                          <UserMinus class="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          v-if="participant.duplicateStatus === 'POSSIBLE_DUPLICATE'"
                          size="sm"
                          variant="outline"
                          :disabled="isSaving || !participant.duplicateCandidateProfileId"
                          @click="resolveDuplicate(participant, 'existing')"
                        >
                          Existing profile
                        </Button>
                        <Button
                          v-if="participant.duplicateStatus === 'POSSIBLE_DUPLICATE'"
                          size="sm"
                          variant="outline"
                          :disabled="isSaving || !participant.profileId"
                          @click="resolveDuplicate(participant, 'new')"
                        >
                          New profile
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plenary" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plenary Attendance</CardTitle>
              <CardDescription>Mark who attended the cohort plenary before circle placement.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="!plenaryParticipants.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No eligible participants are ready for plenary attendance yet.
              </div>

              <Table v-else>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead class="text-right">Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="participant in plenaryParticipants" :key="participant.id">
                    <TableCell>
                      <div class="font-medium">{{ participantName(participant) }}</div>
                      <div class="text-xs text-muted-foreground">{{ participant.profileEmail || participant.profilePhone || '-' }}</div>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="participantStatusTone(participant.status)">
                        {{ statusLabel(participant.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>{{ participant.chapter || selectedCohort?.chapter || '-' }}</TableCell>
                    <TableCell class="text-right">
                      <div class="flex flex-wrap justify-end gap-2">
                        <Button size="sm" :disabled="isSaving" @click="recordPlenaryAttendance(participant, 'ATTENDED')">
                          <CheckCircle2 class="mr-2 h-4 w-4" />
                          Attended
                        </Button>
                        <Button size="sm" variant="outline" :disabled="isSaving" @click="recordPlenaryAttendance(participant, 'EXCUSED')">
                          Excused
                        </Button>
                        <Button size="sm" variant="ghost" :disabled="isSaving" @click="recordPlenaryAttendance(participant, 'ABSENT')">
                          <XCircle class="mr-2 h-4 w-4" />
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circles" class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-semibold tracking-tight">Form circles</h2>
              <p class="text-sm text-muted-foreground">Group attendees into common-interest circles of {{ circleCapacityLabel(selectedCohort) }}.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" :disabled="isSaving" @click="openCreateCircleDialog">
                <CircleDot class="mr-2 h-4 w-4" />
                Create circle
              </Button>
              <Button variant="outline" :disabled="isSaving || isLoading" @click="suggestCircles">
                <Shuffle class="mr-2 h-4 w-4" />
                Refresh suggestions
              </Button>
              <Button :disabled="isSaving || !canFinalizeCircles" @click="finalizeCircles">
                <ClipboardCheck class="mr-2 h-4 w-4" />
                Confirm circles as final
              </Button>
            </div>
          </div>

          <Alert v-if="unplacedParticipants.length">
            <AlertDescription>
              {{ unplacedParticipants.length }} participants are not placed in a circle yet.
            </AlertDescription>
          </Alert>

          <div class="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
            <div class="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unplaced participants</CardTitle>
                  <CardDescription>Use Add mentees on a circle to place each attendee after plenary attendance is confirmed.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div v-if="!unplacedParticipants.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    <p>{{ unplacedParticipantsEmptyCopy }}</p>
                    <Button
                      v-if="!activeParticipants.length"
                      class="mt-4"
                      variant="outline"
                      size="sm"
                      :disabled="isSaving"
                      @click="openRosterDialog"
                    >
                      <UserPlus class="mr-2 h-4 w-4" />
                      Add participants
                    </Button>
                  </div>
                  <div v-for="participant in unplacedParticipants" v-else :key="participant.id" class="rounded-lg border p-3">
                    <div class="font-medium">{{ participantName(participant) }}</div>
                    <div class="text-xs text-muted-foreground">{{ participant.profileEmail || participant.profilePhone || '-' }}</div>
                    <div class="mt-2 flex flex-wrap gap-1">
                      <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                      <span v-if="!participant.interestTags?.length" class="text-xs text-muted-foreground">No interest tags</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div class="space-y-4">
              <Card v-if="suggestions?.suggestedCircles?.length">
                <CardHeader>
                  <CardTitle>Suggested Groupings</CardTitle>
                  <CardDescription>Suggestions are based on shared interest tags.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div v-for="suggestion in suggestions.suggestedCircles" :key="suggestion.name" class="rounded-lg border p-3">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="font-medium">{{ suggestion.name }}</div>
                        <div class="mt-1 text-xs text-muted-foreground">
                          {{ suggestion.participantCount }} participants | {{ suggestion.participantNames.join(', ') }}
                        </div>
                        <div class="mt-2 flex flex-wrap gap-1">
                          <span v-for="tag in suggestion.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" :disabled="isSaving" @click="createCircleFromSuggestion(suggestion)">
                        Create
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Circles in this cohort</CardTitle>
                  <CardDescription>Review membership, move participants, or remove placements before finalizing.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div v-if="!circles.length" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No circles have been created yet.
                  </div>

                  <div v-for="circle in circles" v-else :key="circle.id" class="circle-panel">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="font-semibold">{{ circle.name }}</div>
                        <div class="text-sm text-muted-foreground">
                          {{ circle.memberCount || 0 }} members | {{ circle.theme || 'No theme set' }}
                        </div>
                      </div>
                      <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Badge :variant="circle.memberCount < (circle.minSize || selectedCohort?.circleMinSize || 5) ? 'outline' : 'secondary'">
                          {{ circle.memberCount || 0 }} / {{ circle.minSize || selectedCohort?.circleMinSize || 5 }}-{{ circle.maxSize || selectedCohort?.circleMaxSize || 10 }}
                        </Badge>
                        <Button size="sm" variant="outline" :disabled="isSaving || !unplacedParticipants.length" @click="openAddMenteesDialog(circle.id)">
                          <UserPlus class="mr-2 h-4 w-4" />
                          Add mentees
                        </Button>
                      </div>
                    </div>

                    <div class="mt-3 space-y-2">
                      <div v-if="!(circle.members || []).length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        No members placed yet.
                      </div>
                      <div v-for="member in circle.members || []" v-else :key="member.membershipId" class="circle-member-row">
                        <div>
                          <div class="font-medium">{{ memberName(member) }}</div>
                          <div class="text-xs text-muted-foreground">{{ statusLabel(member.placementSource) }}</div>
                        </div>
                        <div class="grid gap-2 sm:grid-cols-[180px,auto,auto]">
                          <Select v-model="membershipTargetCircleId[member.membershipId]">
                            <SelectTrigger>
                              <SelectValue placeholder="Move to" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                v-for="targetCircle in circles.filter((item: CommonInterestCircleRecord) => item.id !== circle.id)"
                                :key="targetCircle.id"
                                :value="targetCircle.id"
                              >
                                {{ targetCircle.name }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" :disabled="isSaving || !membershipTargetCircleId[member.membershipId]" @click="moveMembership(member.membershipId)">
                            Move
                          </Button>
                          <Button size="sm" variant="ghost" :disabled="isSaving" @click="removeMembership(member.membershipId)">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matching" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matching Readiness</CardTitle>
              <CardDescription>1:1 matching opens after cohort gates are satisfied.</CardDescription>
            </CardHeader>
            <CardContent class="grid gap-4 md:grid-cols-2">
              <div class="cohort-detail">
                <span>Confirmed participants</span>
                <strong>{{ selectedCohort?.confirmedCount || 0 }}</strong>
              </div>
              <div class="cohort-detail">
                <span>Unplaced participants</span>
                <strong>{{ selectedCohort?.unplacedCount ?? unplacedParticipants.length }}</strong>
              </div>
              <div class="cohort-detail">
                <span>Matched participants</span>
                <strong>{{ selectedCohort?.matchedCount || 0 }}</strong>
              </div>
              <div class="cohort-detail">
                <span>Feedback response rate</span>
                <strong>{{ formatPercent(dashboard?.feedbackResponseRate) }}</strong>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              Matching is {{ selectedCohort?.matchingStartsAfterCirclesFinalized === false ? 'not blocked by final circle status' : 'blocked until circles are finalized' }} for this cohort.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </template>

    <CompanyProgramCohortEditorDialog
      v-if="selectedCohort"
      v-model:open="editDialogOpen"
      :program-id="programId"
      :cohort="selectedCohort"
      @saved="refreshAfterMutation"
    />

    <Dialog v-model:open="isRosterDialogOpen">
      <DialogContent class="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add participants</DialogTitle>
          <DialogDescription>
            Add existing program employees or upload a new roster for this cohort. Participants will be notified after they are added.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              :variant="rosterEntryMode === 'program' ? 'default' : 'outline'"
              @click="rosterEntryMode = 'program'"
            >
              <Users class="mr-2 h-4 w-4" />
              From program roster
            </Button>
            <Button
              type="button"
              :variant="rosterEntryMode === 'upload' ? 'default' : 'outline'"
              @click="rosterEntryMode = 'upload'"
            >
              <Upload class="mr-2 h-4 w-4" />
              Upload roster
            </Button>
          </div>

          <div v-if="rosterEntryMode === 'program'" class="space-y-3">
            <div class="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>{{ selectedProgramParticipants.length }} selected from {{ availableProgramRosterParticipants.length }} available program employees.</span>
              <Button type="button" variant="outline" size="sm" :disabled="programRosterLoading" @click="loadProgramRoster">
                <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': programRosterLoading }" />
                Refresh roster
              </Button>
            </div>

            <Alert v-if="programRosterError" variant="destructive">
              <AlertDescription>{{ programRosterError }}</AlertDescription>
            </Alert>

            <div v-if="programRosterLoading" class="space-y-2">
              <Skeleton class="h-14 w-full" />
              <Skeleton class="h-14 w-full" />
            </div>

            <div v-else-if="!availableProgramRosterParticipants.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Every active program employee is already attached to this cohort, or no program employees have been enrolled yet.
            </div>

            <div v-else class="max-h-80 space-y-2 overflow-y-auto pr-1">
              <div
                v-for="participant in availableProgramRosterParticipants"
                :key="participant.id"
                class="flex items-start gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  :checked="selectedProgramParticipantIds.includes(participant.id)"
                  @update:checked="value => toggleProgramParticipant(participant, value)"
                />
                <div class="min-w-0 flex-1">
                  <div class="font-medium">{{ participant.profileName || participant.profileEmail || 'Program employee' }}</div>
                  <div class="text-sm text-muted-foreground">{{ participant.profileEmail || participant.profileRole || '-' }}</div>
                </div>
                <Badge variant="outline">{{ statusLabel(participant.status) }}</Badge>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Use the template for name, contact, chapter, region, and interest tags.</span>
              <Button type="button" variant="outline" size="sm" @click="downloadRosterTemplate">
                <Upload class="mr-2 h-4 w-4" />
                Download Excel template
              </Button>
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">CSV or Excel file</label>
              <Input type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" :disabled="isSaving" @change="handleRosterFileUpload" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Roster rows</label>
              <Textarea
                v-model="rosterCsv"
                class="min-h-48 font-mono text-xs"
                placeholder="firstName,lastName,email,phone,chapter,region,interestTags&#10;Amina,Otieno,amina@example.com,+254712000000,Nairobi,Kenya,&quot;STEM; Career readiness&quot;"
              />
            </div>
            <div class="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
              {{ rosterPreviewRows.length }} row{{ rosterPreviewRows.length === 1 ? '' : 's' }} ready for upload.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="closeRosterDialog">
            Cancel
          </Button>
          <Button
            v-if="rosterEntryMode === 'program'"
            :disabled="isSaving || !selectedProgramParticipants.length"
            @click="submitProgramRosterParticipants"
          >
            <UserPlus class="mr-2 h-4 w-4" :class="{ 'animate-spin': isSaving }" />
            Add selected
          </Button>
          <Button v-else :disabled="isSaving || !rosterPreviewRows.length" @click="submitRosterParticipants">
            <Upload class="mr-2 h-4 w-4" :class="{ 'animate-spin': isSaving }" />
            Upload roster
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isCreateCircleDialogOpen">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create circle</DialogTitle>
          <DialogDescription>Add a new common-interest circle manually.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="grid gap-2">
              <label class="text-sm font-medium">Circle name</label>
              <Input v-model="newCircle.name" placeholder="STEM Risers" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Theme</label>
              <Input v-model="newCircle.theme" placeholder="STEM" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Min size</label>
              <Input v-model="newCircle.minSize" type="number" min="1" />
            </div>
            <div class="grid gap-2">
              <label class="text-sm font-medium">Max size</label>
              <Input v-model="newCircle.maxSize" type="number" min="1" />
            </div>
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">Interest tags</label>
            <Input v-model="newCircle.interestTags" placeholder="STEM, career readiness" />
          </div>
          <div class="grid gap-2">
            <label class="text-sm font-medium">Next session</label>
            <Input v-model="newCircle.nextSessionAt" type="datetime-local" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="closeCreateCircleDialog">
            Cancel
          </Button>
          <Button :disabled="isSaving" @click="createCircle">
            <CircleDot class="mr-2 h-4 w-4" />
            Create circle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="addMenteesDialogOpen">
      <DialogContent v-if="addMenteesCircle" class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add mentees</DialogTitle>
          <DialogDescription>
            Add unplaced mentees to {{ addMenteesCircle.name }}.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3">
          <div v-if="!unplacedParticipants.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {{ unplacedParticipantsEmptyCopy }}
          </div>
          <div v-for="participant in unplacedParticipants" v-else :key="participant.id" class="rounded-lg border p-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="font-medium">{{ participantName(participant) }}</div>
                <div class="text-xs text-muted-foreground">{{ participant.profileEmail || participant.profilePhone || '-' }}</div>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span v-for="tag in participant.interestTags" :key="tag" class="mini-tag">{{ tag }}</span>
                  <span v-if="!participant.interestTags?.length" class="text-xs text-muted-foreground">No interest tags</span>
                </div>
              </div>
              <Button size="sm" :disabled="isSaving" @click="placeParticipantInCircle(addMenteesCircle.id, participant)">
                <UserPlus class="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="closeAddMenteesDialog">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.cohort-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (min-width: 1024px) {
  .cohort-actions {
    justify-content: flex-end;
  }
}

.cohort-tabbar {
  display: inline-flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  border: 1px solid #ead2e4;
  border-radius: 18px;
  background: #fff;
  padding: 4px;
}

.cohort-tab {
  display: inline-flex;
  flex: 1 1 0;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 11px;
  color: #6b5b6a;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  padding: 0 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.cohort-tab span {
  display: inline-flex;
  min-width: 22px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f6edf4;
  color: #8a337f;
  font-size: 11px;
  padding: 0 6px;
}

.cohort-tab--active {
  background: #a03b93;
  color: #fff;
}

.cohort-tab--active span {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.cohort-detail {
  display: grid;
  gap: 4px;
  border: 1px solid #f1e3ed;
  border-radius: 8px;
  background: #fffafd;
  padding: 14px;
}

.cohort-detail span {
  color: #7a6d78;
  font-size: 12px;
  font-weight: 600;
}

.cohort-detail strong {
  color: #2f2930;
  font-size: 14px;
}

.mini-tag {
  display: inline-flex;
  min-height: 22px;
  align-items: center;
  border: 1px solid #ead2e4;
  border-radius: 999px;
  background: #fbf6fa;
  color: #6f2d66;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 0 8px;
}

.circle-panel {
  border: 1px solid #ead2e4;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.circle-member-row {
  display: grid;
  gap: 12px;
  align-items: center;
  border: 1px solid #f0e2eb;
  border-radius: 8px;
  padding: 10px;
}

@media (min-width: 768px) {
  .circle-member-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
</style>
