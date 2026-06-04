import type { UserRole, Permission, User } from '@/types/auth'
import { PERMISSIONS } from '@/types/auth'

// Define all available permissions
const createPermission = (id: string, name: string, description: string, resource: string, action: string): Permission => ({
  id,
  name,
  description,
  resource,
  action
})

export const ALL_PERMISSIONS: Permission[] = [
  // Dashboard permissions
  createPermission('dashboard:view', 'View Dashboard', 'Access to main dashboard', 'dashboard', 'view'),
  createPermission('analytics:view', 'View Analytics', 'Access to analytics and reports', 'analytics', 'view'),
  createPermission('admin:dashboard:view', 'View Admin Dashboard', 'Access to corporate admin dashboard', 'dashboard', 'admin_view'),
  
  // Profile permissions
  createPermission('profile:view', 'View Profile', 'View own profile information', 'profile', 'view'),
  createPermission('profile:edit', 'Edit Profile', 'Edit own profile information', 'profile', 'edit'),
  
  // Mentor marketplace permissions
  createPermission('mentors:view', 'View Mentors', 'Browse mentor marketplace', 'mentors', 'view'),
  createPermission('mentors:search', 'Search Mentors', 'Search and filter mentors', 'mentors', 'search'),
  createPermission('sessions:book', 'Book Sessions', 'Book mentoring sessions', 'sessions', 'book'),
  
  // Session permissions
  createPermission('sessions:view', 'View Sessions', 'View own sessions', 'sessions', 'view'),
  createPermission('sessions:manage', 'Manage Sessions', 'Manage and modify sessions', 'sessions', 'manage'),
  createPermission('sessions:record', 'Record Sessions', 'Record mentoring sessions', 'sessions', 'record'),
  
  // Mentor-specific permissions
  createPermission('mentoring:accept', 'Accept Mentees', 'Accept and decline mentee requests', 'mentoring', 'accept'),
  createPermission('mentoring:availability', 'Set Availability', 'Manage availability and schedule', 'mentoring', 'availability'),
  createPermission('mentoring:earnings', 'View Earnings', 'View earnings and payment history', 'mentoring', 'earnings'),
  
  // Admin permissions
  createPermission('admin:users', 'Manage Users', 'Manage organization users', 'admin', 'users'),
  createPermission('admin:programs', 'Manage Programs', 'Manage company mentorship programs and matches', 'admin', 'programs'),
  createPermission('admin:mentors', 'Manage Mentors', 'Manage mentor marketplace', 'admin', 'mentors'),
  createPermission('admin:reports', 'View Reports', 'Access comprehensive reports', 'admin', 'reports'),
  createPermission('admin:company', 'Manage Company', 'Manage company settings', 'admin', 'company'),
  createPermission('admin:settings', 'Configure Settings', 'Configure platform settings', 'admin', 'settings'),
  createPermission('admin:billing', 'Manage Billing', 'Manage billing and payments', 'admin', 'billing'),
  createPermission('admin:branding', 'Manage Branding', 'Customize corporate branding', 'admin', 'branding'),
  createPermission('admin:export', 'Export Data', 'Export platform data', 'admin', 'export'),
  
  // Communication permissions
  createPermission('communication:send', 'Send Messages', 'Send messages to users', 'communication', 'send'),
  createPermission('communication:broadcast', 'Broadcast Announcements', 'Send announcements', 'communication', 'broadcast'),
  
  // Payment permissions
  createPermission('payments:view', 'View Payments', 'View payment information', 'payments', 'view'),
  createPermission('payments:process', 'Process Payments', 'Handle payment processing', 'payments', 'process')
]

// Define default roles with their permissions
export const DEFAULT_ROLES: Record<UserRole['name'], UserRole> = {
  employee: {
    id: 'employee',
    name: 'employee',
    displayName: 'Employee',
    permissions: ALL_PERMISSIONS.filter(p => [
      'dashboard:view',
      'profile:view',
      'profile:edit',
      'mentors:view',
      'mentors:search',
      'sessions:book',
      'sessions:view',
      'communication:send'
    ].includes(p.id))
  },
  
  mentor: {
    id: 'mentor',
    name: 'mentor',
    displayName: 'External Mentor',
    permissions: ALL_PERMISSIONS.filter(p => [
      'dashboard:view',
      'profile:view',
      'profile:edit',
      'sessions:view',
      'sessions:manage',
      'sessions:record',
      'mentoring:accept',
      'mentoring:availability',
      'mentoring:earnings',
      'communication:send',
      'payments:view'
    ].includes(p.id))
  },
  
  corporate_admin: {
    id: 'corporate_admin',
    name: 'corporate_admin',
    displayName: 'Corporate Administrator',
    permissions: ALL_PERMISSIONS // Admins have all permissions
  }
}

// Role management utility functions
export class RoleManager {
  static hasPermission(user: User | null, permissionId: string): boolean {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    
    return user.roles.some(role => 
      role.permissions && Array.isArray(role.permissions) && role.permissions.some(permission => permission.id === permissionId)
    )
  }
  
  static hasAnyPermission(user: User | null, permissionIds: string[]): boolean {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    
    return permissionIds.some(permissionId => 
      this.hasPermission(user, permissionId)
    )
  }
  
  static hasRole(user: User | null, roleName: string): boolean {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    
    return user.roles.some(role => role.name === roleName)
  }
  
  static hasAnyRole(user: User | null, roleNames: string[]): boolean {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    
    return roleNames.some(roleName => this.hasRole(user, roleName))
  }
  
  static getUserRoles(user: User | null): UserRole[] {
    if (!user || !user.roles || !Array.isArray(user.roles)) return []
    
    return user.roles
  }
  
  static getUserPermissions(user: User | null): Permission[] {
    if (!user || !user.roles || !Array.isArray(user.roles)) return []
    
    const permissions: Permission[] = []
    user.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        permissions.push(...role.permissions)
      }
    })
    
    // Remove duplicates based on permission id
    return permissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.id === permission.id)
    )
  }
  
  static isEmployee(user: User | null): boolean {
    return this.hasRole(user, 'employee')
  }
  
  static isMentor(user: User | null): boolean {
    return this.hasRole(user, 'mentor')
  }
  
  static isCorporateAdmin(user: User | null): boolean {
    return this.hasAnyRole(user, ['corporate_admin', 'company_admin', 'company'])
  }
  
  static canAccessRoute(user: User | null, routePath: string): boolean {
    if (!user) return false
    
    // Define route permissions
    const routePermissions: Record<string, string[]> = {
      '/app/dashboard': ['dashboard:view'],
      '/app/mentors': ['mentors:view'],
      '/app/sessions': ['sessions:view'],
      '/app/profile': ['profile:view'],
      '/app/admin': ['admin:users', 'admin:mentors', 'admin:reports'],
      '/app/admin/activate': ['admin:dashboard:view'],
      '/app/admin/activity': ['admin:dashboard:view'],
      '/app/admin/programs': ['admin:programs'],
      '/app/admin/programs/*': ['admin:programs'],
      '/app/admin/journey-templates': ['admin:programs'],
      '/app/admin/employees': ['admin:users'],
      '/app/admin/employees/*': ['admin:users'],
      '/app/admin/participants': ['admin:users'],
      '/app/admin/participants/*': ['admin:users'],
      '/app/admin/matches': ['admin:programs'],
      '/app/admin/users': ['admin:users'],
      '/app/admin/users/*': ['admin:users'],
      '/app/admin/mentors': ['admin:mentors'],
      '/app/admin/analytics': ['admin:reports'],
      '/app/admin/reports': ['admin:reports'],
      '/app/admin/reports/*': ['admin:reports'],
      '/app/admin/settings': ['admin:settings'],
      '/app/admin/billing': ['admin:billing'],
      '/app/admin/billing/*': ['admin:billing'],
      '/app/admin/branding': ['admin:branding'],
      '/app/admin/trust': ['admin:settings'],
      '/app/employee/programs': ['mentors:view'],
      '/app/employee/programs/*': ['mentors:view'],
      '/app/employee/journey': ['sessions:view'],
      '/app/employee/matches': ['mentors:view'],
      '/app/employee/mentor': ['mentors:view'],
      '/app/employee/goals': ['profile:view'],
      '/app/employee/pulses': ['profile:view'],
      '/app/employee/preferences': ['profile:view']
    }
    
    // Check if route requires specific permissions
    const wildcardRoutePermissions = Object.entries(routePermissions).find(([path]) =>
      path.endsWith('/*') && routePath.startsWith(path.slice(0, -1))
    )?.[1]
    const requiredPermissions = routePermissions[routePath] || wildcardRoutePermissions
    if (!requiredPermissions) return true // No specific permissions required
    
    return this.hasAnyPermission(user, requiredPermissions)
  }
  
  static getMenuItems(user: User | null) {
    if (!user) return []
    
    const menuItems = [
      {
        title: 'Dashboard',
        path: '/app/dashboard',
        icon: 'dashboard',
        permission: 'dashboard:view'
      },
      {
        title: 'Find Mentors',
        path: '/app/mentors',
        icon: 'users',
        permission: 'mentors:view'
      },
      {
        title: 'My Sessions',
        path: '/app/sessions',
        icon: 'calendar',
        permission: 'sessions:view'
      },
      {
        title: 'Profile',
        path: '/app/profile',
        icon: 'user',
        permission: 'profile:view'
      }
    ]
    
    // Add mentor-specific items
    if (this.isMentor(user)) {
      menuItems.push(
        {
          title: 'My Mentees',
          path: '/app/mentees',
          icon: 'users',
          permission: 'mentoring:accept'
        },
        {
          title: 'Earnings',
          path: '/app/earnings',
          icon: 'dollar-sign',
          permission: 'mentoring:earnings'
        }
      )
    }
    
    // Add admin items
    if (this.isCorporateAdmin(user)) {
      menuItems.push(
        {
          title: 'Admin Panel',
          path: '/app/admin',
          icon: 'settings',
          permission: 'admin:users'
        }
      )
    }
    
    // Filter menu items based on user permissions
    return menuItems.filter(item => 
      this.hasPermission(user, item.permission)
    )
  }
  
  static assignRole(user: User, roleName: UserRole['name']): User {
    const role = DEFAULT_ROLES[roleName]
    if (!role) throw new Error(`Role ${roleName} not found`)
    
    // Remove existing role of the same type and add new role
    const updatedRoles = user.roles.filter(r => r.name !== roleName)
    updatedRoles.push(role)
    
    return {
      ...user,
      roles: updatedRoles
    }
  }
  
  static removeRole(user: User, roleName: UserRole['name']): User {
    return {
      ...user,
      roles: user.roles.filter(role => role.name !== roleName)
    }
  }
} 
