import { DEFAULT_ROLES } from '@/utils/roleManager'

type FrontendRole = 'employee' | 'mentor' | 'corporate_admin'

const normalizeFrontendRoleName = (roleName?: string): FrontendRole => {
  const normalized = String(roleName || '').trim().toLowerCase()

  if (normalized === 'mentor') {
    return 'mentor'
  }

  if (['company', 'company_admin', 'corporate_admin'].includes(normalized)) {
    return 'corporate_admin'
  }

  return 'employee'
}

const firstNonBlank = (...values: Array<unknown>) => {
  for (const value of values) {
    const normalized = String(value || '').trim()
    if (normalized) {
      return normalized
    }
  }
  return ''
}

export const normalizeAuthSession = (rawResponse: any, fallbackEmail = '') => {
  const raw = rawResponse?.data || rawResponse || {}
  const user = raw.user || {}
  const profile = raw.profile || {}
  const normalizedRole = normalizeFrontendRoleName(
    profile.role || raw.memberships?.[0]?.role || user.role || user.roles?.[0],
  )
  const firstName = firstNonBlank(user.firstName, profile.firstName, profile.first_name, user.user_metadata?.first_name)
  const lastName = firstNonBlank(user.lastName, profile.lastName, profile.last_name, user.user_metadata?.last_name)
  const email = firstNonBlank(user.email, profile.email, fallbackEmail)
  const displayName = firstNonBlank(user.displayName, user.name, [firstName, lastName].filter(Boolean).join(' '), email)

  return {
    accessToken: raw.accessToken || raw.access_token || raw.jwtToken,
    refreshToken: raw.refreshToken || raw.refresh_token,
    user: {
      id: firstNonBlank(user.id, user.sub, raw.id, profile.id),
      email,
      name: displayName,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      picture: firstNonBlank(user.avatarUrl, user.picture, profile.avatarUrl, profile.avatar_url) || undefined,
      provider: user.provider || raw.provider || 'local',
      roles: [DEFAULT_ROLES[normalizedRole]],
      isVerified: user.emailVerified ?? true,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      companyId: profile.companyId || profile.company_id || profile.company?.id || raw.company?.companyId,
    },
    profile,
    memberships: raw.memberships || [],
    entitlements: raw.entitlements || [],
    defaultDestination: raw.defaultDestination || null,
    message: raw.message,
    freeTrial: raw.freeTrial,
  }
}
