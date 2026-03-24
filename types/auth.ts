export interface JwtPayload {
    sub: string
    exp?: number
    iat?: number
    email?: string
    name?: string
    picture?: string
    provider?: string
    roles?: string[]
}

export interface SSOProvider {
    id: 'google' | 'microsoft'
    name: string
    clientId: string,
    clientSecret: string
    redirectUri: string
    scopes: string[]
}

export interface SSOResponse {
    accessToken: string
    idToken: string
    userInfo: {
        email: string
        name: string
        picture?: string
        givenName?: string
        familyName?: string
    }
    provider: 'google' | 'microsoft'
}

export interface Permission {
    id: string
    name: string
    description: string
    resource: string
    action: string
}

export interface UserRole {
    id: string
    name: 'employee' | 'mentor' | 'corporate_admin'
    displayName: string
    permissions: Permission[]
}

export interface User {
    id: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    picture?: string
    roles: UserRole[]
    provider?: 'local' | 'google' | 'microsoft'
    companyId?: string
    isVerified: boolean
    createdAt: string
    lastLoginAt?: string
    mfaEnabled?: boolean
    mfaSetupAt?: string
    mfaRecoveryCodesCount?: number
}

export interface RegistrationData {
    firstName: string | null
    lastName: string | null
    password: string | null
    companyName: string | null
    phoneNumber: string | null
    emailAddress: string | null
    noOfEmployees: string | null
}

export interface AuthState {
    loggedInUser: User | null
    loading: boolean
    error: string | null
    registrationData: RegistrationData
    currentStep: number
    networkType: string | null
    ssoProviders: SSOProvider[]
    mfaRequired: boolean
    mfaToken: string | null
}

export interface LoginData {
    email: string
    password: string
}

export interface SSOLoginData {
    provider: 'google' | 'microsoft'
    code: string
    state?: string
}

export interface MFAData {
    token: string
    code: string
}

export interface MFASetupData {
    secret: string
    qrCodeUrl: string
    recoveryCodes: string[]
    backupCodes?: string[]
}

export interface MFAStatus {
    enabled: boolean
    setupAt?: string
    lastUsed?: string
    recoveryCodesCount: number
    backupMethod?: 'email' | 'sms'
}

export interface MFASettings {
    isEnabled: boolean
    setupRequired: boolean
    allowRecoveryCodes: boolean
    maxAttempts: number
    lockoutDuration: number // in minutes
}

export interface RecoveryCode {
    id: string
    code: string
    used: boolean
    usedAt?: string
}

// Role-based Access Control Types
export interface RolePermissions {
    employee: Permission[]
    mentor: Permission[]
    corporate_admin: Permission[]
}

export interface MenuPermission {
    permission: string
    requiredRoles: UserRole['name'][]
}

// Predefined Permissions
export const PERMISSIONS = {
    // Dashboard permissions
    VIEW_DASHBOARD: 'dashboard:view',
    VIEW_ANALYTICS: 'analytics:view',
    
    // Profile permissions
    VIEW_PROFILE: 'profile:view',
    EDIT_PROFILE: 'profile:edit',
    
    // Mentor marketplace permissions
    VIEW_MENTORS: 'mentors:view',
    SEARCH_MENTORS: 'mentors:search',
    BOOK_SESSIONS: 'sessions:book',
    
    // Session permissions
    VIEW_SESSIONS: 'sessions:view',
    MANAGE_SESSIONS: 'sessions:manage',
    RECORD_SESSIONS: 'sessions:record',
    
    // Mentor-specific permissions
    ACCEPT_MENTEES: 'mentoring:accept',
    SET_AVAILABILITY: 'mentoring:availability',
    VIEW_EARNINGS: 'mentoring:earnings',
    
    // Admin permissions
    MANAGE_USERS: 'admin:users',
    MANAGE_PROGRAMS: 'admin:programs',
    MANAGE_MENTORS: 'admin:mentors',
    VIEW_REPORTS: 'admin:reports',
    MANAGE_COMPANY: 'admin:company',
    CONFIGURE_SETTINGS: 'admin:settings',
    MANAGE_BILLING: 'admin:billing',
    MANAGE_BRANDING: 'admin:branding',
    EXPORT_DATA: 'admin:export',
    
    // Communication permissions
    SEND_MESSAGES: 'communication:send',
    BROADCAST_ANNOUNCEMENTS: 'communication:broadcast',
    
    // Payment permissions
    VIEW_PAYMENTS: 'payments:view',
    PROCESS_PAYMENTS: 'payments:process'
} as const

export type PermissionKey = keyof typeof PERMISSIONS
