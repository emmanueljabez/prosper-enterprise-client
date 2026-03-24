import { computed, ref } from 'vue'
import companySubscriptionsApi, {
  type CompanySubscriptionMember,
  type CompanySubscriptionSummary,
} from '@/http/requests/app/companySubscriptions'
import { useAppToast } from '@/composables/services/toastService'

type MembershipContext = {
  subscription: CompanySubscriptionSummary
  member: CompanySubscriptionMember
}

export const useCompanySubscriptionAdmin = () => {
  const toast = useAppToast()

  const isLoadingBilling = ref(false)
  const billingError = ref<string | null>(null)
  const billingActionId = ref('')
  const companySubscriptions = ref<CompanySubscriptionSummary[]>([])
  const selectedCompanySubscriptionId = ref('')
  const membersBySubscriptionId = ref<Record<string, CompanySubscriptionMember[]>>({})

  const assignableSubscriptions = computed(() =>
    companySubscriptions.value.filter(subscription => subscription.status === 'ACTIVE')
  )

  const primaryCompanySubscription = computed(() =>
    companySubscriptions.value.find(subscription => subscription.status === 'ACTIVE')
    || companySubscriptions.value[0]
    || null
  )

  const activeCompanySubscriptionId = computed(() =>
    selectedCompanySubscriptionId.value || primaryCompanySubscription.value?.id || ''
  )

  const managedCompanySubscription = computed(() =>
    companySubscriptions.value.find(subscription => subscription.id === activeCompanySubscriptionId.value)
    || primaryCompanySubscription.value
  )

  const companySubscriptionMembers = computed(() =>
    membersBySubscriptionId.value[activeCompanySubscriptionId.value] || []
  )

  const memberMapByProfileId = computed(() => {
    const map = new Map<string, CompanySubscriptionMember>()
    companySubscriptionMembers.value.forEach(member => {
      if (member.status === 'ACTIVE') {
        map.set(member.profileId, member)
      }
    })
    return map
  })

  const selectCompanySubscription = (companySubscriptionId: string) => {
    selectedCompanySubscriptionId.value = companySubscriptionId
  }

  const setSubscriptions = (subscriptions: CompanySubscriptionSummary[]) => {
    companySubscriptions.value = subscriptions

    if (!subscriptions.length) {
      selectedCompanySubscriptionId.value = ''
      return
    }

    const currentSelection = subscriptions.find(subscription => subscription.id === selectedCompanySubscriptionId.value)
    if (currentSelection) {
      return
    }

    selectedCompanySubscriptionId.value =
      subscriptions.find(subscription => subscription.status === 'ACTIVE')?.id
      || subscriptions[0].id
  }

  const loadMembersForSubscription = async (companySubscriptionId: string) => {
    const response = await companySubscriptionsApi.getMembers(companySubscriptionId)
    if (!response.success) {
      throw new Error(response.message || 'Failed to load seat assignments.')
    }

    return response.data || []
  }

  const refreshMembers = async () => {
    const nextMembers: Record<string, CompanySubscriptionMember[]> = {}
    const results = await Promise.allSettled(
      companySubscriptions.value.map(async subscription => {
        const members = await loadMembersForSubscription(subscription.id)
        return { companySubscriptionId: subscription.id, members }
      }),
    )

    let hasMemberLoadFailure = false

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        nextMembers[result.value.companySubscriptionId] = result.value.members
        return
      }

      hasMemberLoadFailure = true
      console.error('Failed to load subscription members:', result.reason)
    })

    membersBySubscriptionId.value = nextMembers

    if (hasMemberLoadFailure) {
      billingError.value = 'Some seat assignments could not be loaded. Refresh and retry.'
    }
  }

  const loadCompanyBilling = async (companyId: string) => {
    if (!companyId) {
      billingError.value = 'Company ID not found. Log in again and retry.'
      return
    }

    isLoadingBilling.value = true
    billingError.value = null

    try {
      const response = await companySubscriptionsApi.getCompanySubscriptions(companyId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to load company subscriptions.')
      }

      setSubscriptions(response.data || [])
      await refreshMembers()
    } catch (loadError: any) {
      console.error('Failed to load company billing data:', loadError)
      billingError.value =
        loadError?.response?.data?.message
        || loadError?.message
        || 'Failed to load company billing data.'
    } finally {
      isLoadingBilling.value = false
    }
  }

  const getMembershipForProfile = (profileId: string, companySubscriptionId: string) =>
    (membersBySubscriptionId.value[companySubscriptionId] || []).find(member =>
      member.profileId === profileId && member.status === 'ACTIVE'
    ) || null

  const getActiveMembershipForProfile = (profileId: string): MembershipContext | null => {
    for (const subscription of companySubscriptions.value) {
      const member = getMembershipForProfile(profileId, subscription.id)
      if (member) {
        return { subscription, member }
      }
    }

    return null
  }

  const assignSeat = async (companySubscriptionId: string, profileId: string, companyId?: string) => {
    if (!companySubscriptionId) {
      toast.error('No company subscription selected.')
      return false
    }

    billingActionId.value = `assign-${companySubscriptionId}-${profileId}`

    try {
      const response = await companySubscriptionsApi.assignSeat(companySubscriptionId, profileId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to assign seat.')
      }

      toast.success('Seat assigned successfully.')

      if (companyId) {
        await loadCompanyBilling(companyId)
      } else {
        membersBySubscriptionId.value[companySubscriptionId] = await loadMembersForSubscription(companySubscriptionId)
      }

      return true
    } catch (assignError: any) {
      toast.error(assignError?.response?.data?.message || assignError?.message || 'Failed to assign seat.')
      return false
    } finally {
      billingActionId.value = ''
    }
  }

  const revokeSeat = async (companySubscriptionId: string, profileId: string, companyId?: string) => {
    if (!companySubscriptionId) {
      toast.error('No company subscription selected.')
      return false
    }

    billingActionId.value = `revoke-${companySubscriptionId}-${profileId}`

    try {
      const response = await companySubscriptionsApi.revokeSeat(companySubscriptionId, profileId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to revoke seat.')
      }

      toast.success('Seat revoked successfully.')

      if (companyId) {
        await loadCompanyBilling(companyId)
      } else {
        membersBySubscriptionId.value[companySubscriptionId] = await loadMembersForSubscription(companySubscriptionId)
      }

      return true
    } catch (revokeError: any) {
      toast.error(revokeError?.response?.data?.message || revokeError?.message || 'Failed to revoke seat.')
      return false
    } finally {
      billingActionId.value = ''
    }
  }

  const renewCompanySubscription = async (companySubscriptionId: string, payload?: {
    redirectSuccessUrl?: string
    redirectCancelUrl?: string
  }) => {
    if (!companySubscriptionId) {
      toast.error('No company subscription selected.')
      return null
    }

    billingActionId.value = `renew-${companySubscriptionId}`

    try {
      const response = await companySubscriptionsApi.renew(companySubscriptionId, payload)
      if (!response.success || !response.data?.paymentUrl) {
        throw new Error(response.message || 'Failed to create renewal invoice.')
      }

      return response.data.paymentUrl
    } catch (renewError: any) {
      toast.error(renewError?.response?.data?.message || renewError?.message || 'Failed to create renewal invoice.')
      return null
    } finally {
      billingActionId.value = ''
    }
  }

  return {
    isLoadingBilling,
    billingError,
    billingActionId,
    companySubscriptions,
    assignableSubscriptions,
    selectedCompanySubscriptionId,
    activeCompanySubscriptionId,
    managedCompanySubscription,
    companySubscriptionMembers,
    memberMapByProfileId,
    loadCompanyBilling,
    selectCompanySubscription,
    getMembershipForProfile,
    getActiveMembershipForProfile,
    assignSeat,
    revokeSeat,
    renewCompanySubscription,
  }
}
