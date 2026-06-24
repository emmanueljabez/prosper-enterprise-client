export interface BookingPricingPlan {
  id: string
  code?: string | null
  name?: string | null
  description?: string | null
  cost?: number | null
  currency?: string | null
  features?: string[] | string | null
  planFeatures?: Array<{
    enabled?: boolean | null
    available?: boolean | null
    feature?: { name?: string | null } | null
    name?: string | null
  }> | null
  sessionsPerPeriod?: number | null
  sessions_per_period?: number | null
  isActive?: boolean | null
  is_active?: boolean | null
  free?: boolean | null
  planAudience?: string | null
  plan_audience?: string | null
  billingType?: string | null
  billing_type?: string | null
  displayOrder?: number | null
  display_order?: number | null
  formattedPrice?: string | null
  sessionsDescription?: string | null
  highlighted?: boolean | null
  featured?: boolean | null
  mostPopular?: boolean | null
}

export interface PackageDisplayMeta {
  label: string
  accentLabel?: string
  footnote?: string
  subtitle: string
  features: string[]
  actionLabel: string
  highlighted: boolean
}

const EXCLUDED_CODES = new Set(['NETWORK', 'FREE', 'FREE_TRIAL'])
const PUBLIC_SESSION_PACKAGE_CODES = new Set([
  'SINGLE_SESSION',
  'PACK_3',
  'PACK_5',
  'PACK_10',
  'THREE_SESSION_PACK',
  'FIVE_SESSION_PACK',
  'TEN_SESSION_PACK',
])

const normalize = (value: unknown) => String(value || '').trim().toUpperCase()
const compact = (value: unknown) => String(value || '').trim()

const formatCurrencyAmount = (currency: string | null | undefined, amount: number): string => {
  const currencyLabel = normalize(currency) || 'KES'
  const formattedAmount = amount.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })

  return `${currencyLabel} ${formattedAmount}`
}

const matchesAny = (plan: BookingPricingPlan, terms: string[]): boolean => {
  const searchable = normalize(`${plan.code || ''} ${plan.name || ''}`)
  return terms.some(term => searchable.includes(term))
}

const isPublicSessionPackageCode = (plan: BookingPricingPlan): boolean =>
  PUBLIC_SESSION_PACKAGE_CODES.has(normalize(plan.code))

const parseFeatureList = (features: BookingPricingPlan['features']): string[] => {
  if (Array.isArray(features)) {
    return features.map(compact).filter(Boolean)
  }

  const raw = compact(features)
  if (!raw || raw === 'N/A') return []

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map(compact).filter(Boolean)
      }
    } catch {
      // Fall back to delimiter parsing below.
    }
  }

  return raw.split(/[\n,;|]+/).map(compact).filter(Boolean)
}

export function getPlanSessionCount(plan: BookingPricingPlan): number {
  return Number(plan.sessionsPerPeriod ?? plan.sessions_per_period ?? 0)
}

export function getPlanDisplayOrder(plan: BookingPricingPlan): number {
  return Number(plan.displayOrder ?? plan.display_order ?? 999)
}

export function isBookableSessionPackage(plan: BookingPricingPlan): boolean {
  const code = normalize(plan.code)
  const audience = normalize(plan.planAudience ?? plan.plan_audience)
  const active = plan.isActive ?? plan.is_active ?? true

  return Boolean(plan.id)
    && active !== false
    && plan.free !== true
    && !EXCLUDED_CODES.has(code)
    && isPublicSessionPackageCode(plan)
    && audience !== 'CORPORATE'
    && getPlanSessionCount(plan) > 0
    && Number(plan.cost ?? 0) > 0
}

export function getBookableSessionPackages<T extends BookingPricingPlan>(plans: T[]): T[] {
  return [...plans]
    .filter(isBookableSessionPackage)
    .sort((a, b) => getPlanDisplayOrder(a) - getPlanDisplayOrder(b))
}

export function formatPackagePrice(plan: BookingPricingPlan): string {
  const amount = Number(plan.cost ?? 0)
  if (Number.isFinite(amount) && amount > 0) {
    return formatCurrencyAmount(plan.currency, amount)
  }

  if (plan.formattedPrice) return plan.formattedPrice

  return formatCurrencyAmount(plan.currency, amount)
}

export function isFeaturedPackage(plan: BookingPricingPlan): boolean {
  const explicitFlag = plan.highlighted ?? plan.featured ?? plan.mostPopular
  if (explicitFlag !== undefined && explicitFlag !== null) return Boolean(explicitFlag)

  const sessions = getPlanSessionCount(plan)
  return sessions === 3 || matchesAny(plan, ['PACK_3', 'THREE'])
}

export function getPackageLabel(plan: BookingPricingPlan): string {
  const sessions = getPlanSessionCount(plan)

  if (matchesAny(plan, ['PACK_10', 'TEN']) || sessions >= 10) return 'TRANSFORMATION'
  if (matchesAny(plan, ['PACK_5', 'FIVE']) || sessions >= 5) return 'ACCOUNTABILITY'
  if (matchesAny(plan, ['PACK_3', 'THREE']) || sessions >= 3) return 'SHORT TERM'
  return 'JUMPSTART'
}

export function getPackageSubtitle(plan: BookingPricingPlan): string {
  const description = compact(plan.description || plan.sessionsDescription)
  if (description) return description

  const sessions = getPlanSessionCount(plan)
  if (sessions >= 10) return 'Maximized commitment'
  if (sessions >= 5) return 'Consistent growth path'
  if (sessions >= 3) return 'Structured guidance'
  return '1 one-on-one session'
}

export function getPackageSavingsLabel(
  plan: BookingPricingPlan,
  plans: BookingPricingPlan[] = [],
): string | undefined {
  const sessions = getPlanSessionCount(plan)
  if (sessions <= 1) return undefined

  const singleSessionPlan = plans.find(item => getPlanSessionCount(item) === 1 && Number(item.cost ?? 0) > 0)
  if (!singleSessionPlan) return undefined

  const savings = (Number(singleSessionPlan.cost ?? 0) * sessions) - Number(plan.cost ?? 0)
  if (savings <= 0) return undefined

  return `SAVE ${formatCurrencyAmount(plan.currency || singleSessionPlan.currency, savings)}`
}

export function isBestValuePackage(plan: BookingPricingPlan, plans: BookingPricingPlan[] = []): boolean {
  const sessions = getPlanSessionCount(plan)
  if (matchesAny(plan, ['PACK_10', 'TEN', 'BEST VALUE'])) return true

  const maxSessions = Math.max(0, ...plans.map(getPlanSessionCount))
  return maxSessions >= 5 && sessions === maxSessions
}

export function getPackageFeatures(plan: BookingPricingPlan): string[] {
  const directFeatures = parseFeatureList(plan.features)
  if (directFeatures.length > 0) return directFeatures.slice(0, 3)

  const planFeatureNames = Array.isArray(plan.planFeatures)
    ? plan.planFeatures
      .filter(item => item.enabled !== false && item.available !== false)
      .map(item => compact(item.feature?.name || item.name))
      .filter(Boolean)
    : []
  const meaningfulPlanFeatureNames = planFeatureNames.filter(feature => !/1:1|one[- ]on[- ]one|mentor session/i.test(feature))
  if (meaningfulPlanFeatureNames.length > 0) return meaningfulPlanFeatureNames.slice(0, 3)

  const sessions = getPlanSessionCount(plan)
  if (sessions >= 10) return ['Unlimited chat support', 'Personalized roadmap', 'Intro to network']
  if (sessions >= 5) return ['Monthly career audits', 'Long-term goal setting', 'Priority scheduling']
  if (sessions >= 3) return ['Milestone planning', 'Document reviews', 'Priority booking']
  return ['45-minute focused call', 'Immediate session notes', 'Direct chat (24h)']
}

export function getPackageDisplayMeta(
  plan: BookingPricingPlan,
  plans: BookingPricingPlan[] = [],
): PackageDisplayMeta {
  const bestValue = isBestValuePackage(plan, plans)
  const savingsLabel = getPackageSavingsLabel(plan, plans)
  const highlighted = isFeaturedPackage(plan)

  return {
    label: getPackageLabel(plan),
    accentLabel: bestValue ? 'BEST VALUE' : savingsLabel,
    footnote: bestValue ? savingsLabel : undefined,
    subtitle: getPackageSubtitle(plan),
    features: getPackageFeatures(plan),
    actionLabel: highlighted ? 'Get Started Now' : 'Choose Package',
    highlighted,
  }
}
