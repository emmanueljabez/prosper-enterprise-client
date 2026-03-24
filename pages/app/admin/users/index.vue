<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Skeleton } from '~/components/ui/skeleton'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { Search, Plus, Users, CheckCircle, X, Upload, Mail, Trash2, UserPlus, MoreHorizontal, CreditCard } from 'lucide-vue-next'
import { useAppToast } from '~/composables/services/toastService'
import { useCompanyStore } from '~/store/modules/company'
import { useAuthStore } from '~/store/modules/auth'
import { storeToRefs } from 'pinia'
import { useCompanySubscriptionAdmin } from '~/composables/useCompanySubscriptionAdmin'

definePageMeta({
  title: 'Employees',
  description: 'Manage your organization\'s employees',
  requiresAuth: true,
  permissions: ['admin:users']
})

const router = useRouter()
const companyStore = useCompanyStore()
const authStore = useAuthStore()
const {
  isLoadingBilling,
  billingError,
  billingActionId,
  companySubscriptions,
  assignableSubscriptions,
  loadCompanyBilling,
  getActiveMembershipForProfile,
  assignSeat,
  revokeSeat,
} = useCompanySubscriptionAdmin()
const {
  whitelist,
  whitelistPagination,
  isLoading: whitelistLoading,
  profiles,
  profilesPagination,
  profilesLoading
} = storeToRefs(companyStore)

// Get company ID from auth store
const companyId = computed(() => {
  // Check both localStorage and auth store for company ID
  if (typeof window !== 'undefined') {
    const profile = localStorage.getItem('profile')
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile)
        return parsedProfile?.company?.id
      } catch (e) {
        console.error('Error parsing profile:', e)
      }
    }
  }
  return authStore.loggedInUser?.companyId
})

// State
const error = ref<string | null>(null)
const profilesSearchQuery = ref('')
const profilesSearchDebounce = ref<NodeJS.Timeout | null>(null)
const activeTab = ref<'employees' | 'whitelist'>('employees')
const whitelistSearchQuery = ref('')
const whitelistSearchDebounce = ref<NodeJS.Timeout | null>(null)
const showAddWhitelistDialog = ref(false)
const newWhitelistEmail = ref('')

// Watch for profiles search query changes
watch(profilesSearchQuery, (newQuery) => {
  if (profilesSearchDebounce.value) {
    clearTimeout(profilesSearchDebounce.value)
  }
  profilesSearchDebounce.value = setTimeout(() => {
    if (companyId.value) {
      companyStore.searchProfiles(companyId.value, newQuery)
    }
  }, 500)
})

// Profile display helpers
const getProfileDisplayName = (profile: any) => {
  const firstName = profile.firstName || ''
  const lastName = profile.lastName || ''
  return `${firstName} ${lastName}`.trim() || profile.username || profile.email
}

const getProfileRole = (profile: any) => {
  if (profile.role === 'company') return 'Company Admin'
  if (profile.role === 'mentee') return 'Mentee'
  if (profile.role === 'mentor') return 'Mentor'
  return profile.role || 'Employee'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return '—'
  }
}

const openEmployee = (id: string) => {
  router.push(`/app/admin/users/${id}`)
}

const formatBillingInterval = (billingInterval?: string | null) =>
  billingInterval === 'ANNUAL' ? 'Annual' : 'Monthly'

const getActiveMembership = (profileId: string) =>
  getActiveMembershipForProfile(profileId)

const getSponsoredSeatLabel = (profileId: string) => {
  const membership = getActiveMembership(profileId)
  if (!membership) {
    return 'Not assigned'
  }

  const planName = membership.subscription.planName || 'Sponsored'
  const cadence = membership.subscription.billingInterval
    ? ` · ${formatBillingInterval(membership.subscription.billingInterval)}`
    : ''

  return `${planName}${cadence}`
}

const getSponsoredSubscriptionId = (profileId: string) =>
  getActiveMembership(profileId)?.subscription.id || ''

const getSponsoredPlanName = (profileId: string) =>
  getActiveMembership(profileId)?.subscription.planName || 'subscription'

const handleAssignSeat = async (companySubscriptionId: string, profileId: string) => {
  if (!companyId.value) {
    toastError('Company ID not found')
    return
  }

  await assignSeat(companySubscriptionId, profileId, companyId.value)
}

const handleRevokeSeat = async (companySubscriptionId: string, profileId: string) => {
  if (!companyId.value) {
    toastError('Company ID not found')
    return
  }

  await revokeSeat(companySubscriptionId, profileId, companyId.value)
}

// Toast helpers
const { success, error: toastError } = useAppToast()

// Load more profiles
const loadMoreProfiles = async () => {
  if (companyId.value) {
    await companyStore.loadMoreProfiles(companyId.value)
  }
}

// Whitelist search with debounce
watch(whitelistSearchQuery, (newQuery) => {
  if (whitelistSearchDebounce.value) {
    clearTimeout(whitelistSearchDebounce.value)
  }

  whitelistSearchDebounce.value = setTimeout(() => {
    if (companyId.value) {
      companyStore.searchWhitelist(companyId.value, newQuery)
    }
  }, 500)
})

// Whitelist status badge
const whitelistStatusVariant = (entry: any) => {
  if (entry.isUsed && entry.invitationAccepted) return 'secondary' // Active
  if (entry.invitationSent && !entry.invitationAccepted) return 'outline' // Invited
  return 'default' // Pending
}

const whitelistStatusText = (entry: any) => {
  if (entry.isUsed && entry.invitationAccepted) return 'Active'
  if (entry.invitationSent && !entry.invitationAccepted) return 'Invited'
  return 'Pending'
}

// Load more whitelist
const loadMoreWhitelist = async () => {
  if (companyId.value) {
    await companyStore.loadMoreWhitelist(companyId.value)
  }
}

// Send invitation
const sendInvitation = async (whitelistId: string) => {
  if (companyId.value) {
    try {
      await companyStore.sendInvitation(companyId.value, whitelistId)
    } catch (err) {
      console.error('Failed to send invitation:', err)
    }
  }
}

// Resend invitation
const resendInvitation = async (whitelistId: string) => {
  if (companyId.value) {
    try {
      await companyStore.resendInvitation(companyId.value, whitelistId)
    } catch (err) {
      console.error('Failed to resend invitation:', err)
    }
  }
}

// Remove from whitelist
const removeFromWhitelist = async (whitelistId: string) => {
  if (companyId.value) {
    if (confirm('Are you sure you want to remove this email from the whitelist?')) {
      try {
        await companyStore.removeFromWhitelist(companyId.value, whitelistId)
      } catch (err) {
        console.error('Failed to remove from whitelist:', err)
      }
    }
  }
}

// Add to whitelist
const addToWhitelist = async () => {
  if (!companyId.value) {
    toastError('Company ID not found')
    return
  }

  if (!newWhitelistEmail.value.trim()) {
    toastError('Email address is required')
    return
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newWhitelistEmail.value.trim())) {
    toastError('Please enter a valid email address')
    return
  }

  try {
    await companyStore.addToWhitelist(companyId.value, {
      emailAddress: newWhitelistEmail.value.trim()
    })

    // Reset form and close dialog
    newWhitelistEmail.value = ''
    showAddWhitelistDialog.value = false
  } catch (err) {
    console.error('Failed to add to whitelist:', err)
  }
}

onMounted(async () => {
  try {
    // Load profiles and whitelist if company ID is available
    if (companyId.value) {
      await Promise.all([
        companyStore.loadProfiles({
          companyId: companyId.value,
          page: 0,
          size: 20
        }),
        companyStore.loadWhitelist({
          companyId: companyId.value,
          page: 0,
          size: 10
        }),
        loadCompanyBilling(companyId.value)
      ])
    }
  } catch (e) {
    error.value = 'Failed to load data.'
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users class="h-7 w-7" /> User Management
        </h1>
        <p class="text-muted-foreground">Manage employees, access, and whitelist</p>
      </div>
      <div v-if="activeTab === 'whitelist'" class="flex items-center gap-2">
        <NuxtLink to="/app/admin/users/import">
          <Button variant="outline" class="gap-2">
            <Upload class="h-4 w-4" /> Import
          </Button>
        </NuxtLink>
        <Dialog v-model:open="showAddWhitelistDialog">
          <DialogTrigger as-child>
            <Button class="gap-2">
              <UserPlus class="h-4 w-4" /> Add to Whitelist
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add to Whitelist</DialogTitle>
              <DialogDescription>
                Add an email address to your company's whitelist. An invitation will be sent automatically.
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid gap-2">
                <Label for="email">Email Address *</Label>
                <Input
                  id="email"
                  v-model="newWhitelistEmail"
                  type="email"
                  placeholder="user@example.com"
                  @keyup.enter="addToWhitelist"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="showAddWhitelistDialog = false">
                Cancel
              </Button>
              <Button @click="addToWhitelist" :disabled="whitelistLoading">
                {{ whitelistLoading ? 'Adding...' : 'Add to Whitelist' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Tabs -->
    <Card>
      <CardContent class="p-0">
        <div class="flex border-b">
          <button
            @click="activeTab = 'employees'"
            :class="[
              'flex-1 px-6 py-3 font-medium transition-colors',
              activeTab === 'employees'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            Employees
            <Badge v-if="profilesPagination.totalElements > 0" variant="secondary" class="ml-2">
              {{ profilesPagination.totalElements }}
            </Badge>
          </button>
          <button
            @click="activeTab = 'whitelist'"
            :class="[
              'flex-1 px-6 py-3 font-medium transition-colors',
              activeTab === 'whitelist'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            Whitelist
            <Badge v-if="whitelistPagination.totalElements > 0" variant="secondary" class="ml-2">
              {{ whitelistPagination.totalElements }}
            </Badge>
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Employees Tab -->
    <div v-show="activeTab === 'employees'">
      <!-- Search -->
      <Card>
        <CardContent class="p-6">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="profilesSearchQuery"
              placeholder="Search by name, email, or username..."
              class="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Error -->
      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <Alert v-if="billingError" variant="destructive">
        <AlertDescription>{{ billingError }}</AlertDescription>
      </Alert>

      <Alert v-else-if="!isLoadingBilling && !companySubscriptions.length">
        <CreditCard class="h-4 w-4" />
        <AlertDescription>
          No active company subscription found yet. Purchase a corporate plan from settings before assigning seats.
        </AlertDescription>
      </Alert>

      <!-- Table -->
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({{ profilesPagination.totalElements }})</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="profilesLoading && profiles.length === 0" class="space-y-3">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
          <div v-else>
            <Table>
              <TableCaption v-if="profiles.length === 0">No employees found.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sponsored Access</TableHead>
                  <TableHead class="text-right">Joined</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="profile in profiles"
                  :key="profile.id"
                  class="hover:bg-muted/50 cursor-pointer"
                  @click="openEmployee(profile.id)"
                >
                  <TableCell class="font-medium">{{ getProfileDisplayName(profile) }}</TableCell>
                  <TableCell>{{ profile.email }}</TableCell>
                  <TableCell>{{ profile.username }}</TableCell>
                  <TableCell>{{ getProfileRole(profile) }}</TableCell>
                  <TableCell>
                    <Badge :variant="profile.isVerified ? 'secondary' : 'outline'">
                      {{ profile.isVerified ? 'Verified' : 'Pending' }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      v-if="getActiveMembership(profile.id)"
                      variant="secondary"
                      class="bg-[#f7e6f4] text-[#7f2f75]"
                    >
                      {{ getSponsoredSeatLabel(profile.id) }}
                    </Badge>
                    <span v-else class="text-sm text-muted-foreground">Not assigned</span>
                  </TableCell>
                  <TableCell class="text-right">{{ formatDate(profile.createdAt) }}</TableCell>
                  <TableCell class="text-right" @click.stop>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal class="h-4 w-4" />
                          <span class="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-64">
                        <DropdownMenuItem @click="openEmployee(profile.id)">
                          Open employee profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <template v-if="getActiveMembership(profile.id)">
                          <DropdownMenuItem
                            class="text-destructive focus:text-destructive"
                            :disabled="billingActionId === `revoke-${getSponsoredSubscriptionId(profile.id)}-${profile.id}`"
                            @click="handleRevokeSeat(getSponsoredSubscriptionId(profile.id), profile.id)"
                          >
                            Revoke seat from {{ getSponsoredPlanName(profile.id) }}
                          </DropdownMenuItem>
                        </template>
                        <template v-else-if="assignableSubscriptions.length">
                          <DropdownMenuItem
                            v-for="subscription in assignableSubscriptions"
                            :key="`${profile.id}-${subscription.id}`"
                            :disabled="billingActionId === `assign-${subscription.id}-${profile.id}` || (subscription.availableSeats || 0) <= 0"
                            @click="handleAssignSeat(subscription.id, profile.id)"
                          >
                            Assign seat: {{ subscription.planName || 'Subscription' }}
                            <span class="ml-1 text-xs text-muted-foreground">
                              ({{ subscription.availableSeats || 0 }} left)
                            </span>
                          </DropdownMenuItem>
                        </template>
                        <DropdownMenuItem v-else disabled>
                          No active company subscription available
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Load More Button -->
            <div v-if="profilesPagination.hasNext" class="mt-4 flex justify-center">
              <Button
                variant="outline"
                @click="loadMoreProfiles"
                :disabled="profilesLoading"
              >
                {{ profilesLoading ? 'Loading...' : 'Load More' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Whitelist Tab -->
    <div v-show="activeTab === 'whitelist'">
      <!-- Search -->
      <Card>
        <CardContent class="p-6">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="whitelistSearchQuery"
              placeholder="Search by email..."
              class="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Whitelist Table -->
      <Card>
        <CardHeader>
          <CardTitle>Company Whitelist</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="whitelistLoading && whitelist.length === 0" class="space-y-3">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
          <div v-else>
            <Table>
              <TableCaption v-if="whitelist.length === 0">
                No whitelist entries found. Add emails to invite users to your organization.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="entry in whitelist"
                  :key="entry.id"
                  class="hover:bg-muted/50"
                >
                  <TableCell class="font-medium">{{ entry.email }}</TableCell>
                  <TableCell>
                    <Badge :variant="whitelistStatusVariant(entry) as any">
                      {{ whitelistStatusText(entry) }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div v-if="entry.profile">
                      <div class="font-medium">{{ entry.profile.firstName }} {{ entry.profile.lastName }}</div>
                      <div class="text-xs text-muted-foreground">@{{ entry.profile.username }}</div>
                    </div>
                    <span v-else class="text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell>
                    <span v-if="entry.profile">{{ entry.profile.role }}</span>
                    <span v-else class="text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell>{{ entry.addedBy }}</TableCell>
                  <TableCell>{{ formatDate(entry.createdAt) }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        v-if="!entry.invitationSent"
                        size="sm"
                        variant="outline"
                        class="gap-1"
                        @click="sendInvitation(entry.id)"
                        :disabled="whitelistLoading"
                      >
                        <Mail class="h-4 w-4" /> Send Invite
                      </Button>
                      <Button
                        v-if="entry.invitationSent && !entry.invitationAccepted"
                        size="sm"
                        variant="outline"
                        class="gap-1"
                        @click="resendInvitation(entry.id)"
                        :disabled="whitelistLoading"
                      >
                        <Mail class="h-4 w-4" /> Resend
                      </Button>
                      <Button
                        v-if="!(entry.isUsed && entry.invitationAccepted)"
                        size="sm"
                        variant="destructive"
                        class="gap-1"
                        @click="removeFromWhitelist(entry.id)"
                        :disabled="whitelistLoading"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <!-- Load More Button -->
            <div v-if="whitelistPagination.hasNext" class="mt-6 text-center">
              <Button
                variant="outline"
                @click="loadMoreWhitelist"
                :disabled="whitelistLoading"
              >
                {{ whitelistLoading ? 'Loading...' : 'Load More' }}
              </Button>
            </div>

            <!-- Pagination Info -->
            <div v-if="whitelist.length > 0" class="mt-4 text-sm text-muted-foreground text-center">
              Showing {{ whitelist.length }} of {{ whitelistPagination.totalElements }} entries
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
