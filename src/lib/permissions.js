/**
 * Centralized Permission Constants
 * Consolidates all permission strings to eliminate magic strings
 * 
 * IMPORTANT: Permission model based on verified Nextcloud documentation
 * - Admins: Full system access (member of 'admin' group)
 * - Sub-admins: LIMITED scope - can manage existing users/groups but CANNOT create new ones
 * - Regular users: Basic file operations only
 * 
 * Reference: Docs/nextcloud-admin-subadmin-guide.md
 */

export const PERMISSIONS = {
  // System permissions
  ADMIN: 'admin',
  SYSTEM_CONFIG: 'system.config',
  
  // User management (GRANULAR permissions)
  USERS_CREATE: 'users.create',              // Admin only - create new users
  USERS_EDIT: 'users.edit',                  // Admin + Sub-admin (for managed groups only)
  USERS_MANAGE: 'users.manage',              // Legacy: kept for backward compatibility (maps to USERS_EDIT)
  USERS_INVITE: 'users.invite',              // Invite existing users to groups
  USERS_DELETE: 'users.delete',              // Admin only - delete users
  
  // Group management (GRANULAR permissions)
  GROUPS_CREATE: 'groups.create',            // Admin only - create new groups
  GROUPS_EDIT_MEMBERS: 'groups.edit_members', // Admin + Sub-admin (for managed groups only)
  GROUPS_MANAGE: 'groups.manage',            // Legacy: kept for backward compatibility
  GROUPS_VIEW: 'groups.view',                // View groups (Sub-admin can view their managed groups)
  GROUPS_DELETE: 'groups.delete',            // Admin only - delete groups
  
  // Data room permissions (GRANULAR permissions)
  DATA_ROOMS_CREATE: 'data_rooms.create',    // Admin only - create Group Folders
  DATA_ROOMS_EDIT: 'data_rooms.edit',        // Admin + Sub-admin (for assigned groups)
  DATA_ROOMS_MANAGE: 'data_rooms.manage',    // Legacy: manage existing data rooms
  DATA_ROOMS_DELETE: 'data_rooms.delete',    // Admin only - delete Group Folders
  DATA_ROOMS_WRITE: 'data_rooms.write',      // Write to data rooms
  DATA_ROOMS_READ: 'data_rooms.read',        // Read from data rooms
  
  // Document permissions
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_EDIT: 'documents.edit',
  
  // Audit permissions
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',
  
  // Role management
  ROLES_MANAGE: 'roles.manage',
  
  // Profile permissions
  PROFILE_EDIT: 'profile.edit',
  
  // Application management
  APPS_MANAGE: 'apps.manage',
};

/**
 * Permission groups for role-based assignment
 * 
 * CRITICAL: Based on verified Nextcloud architecture
 * 
 * ADMIN (member of 'admin' group):
 * - Full system access
 * - Can CREATE users, groups, and Group Folders
 * - Can manage all users and groups
 * 
 * SUBADMIN (assigned to specific groups via subadmin API):
 * - LIMITED scope to assigned groups only
 * - ❌ CANNOT create users, groups, or Group Folders
 * - ✅ CAN edit existing users in their managed groups
 * - ✅ CAN add/remove existing users to/from managed groups
 * - ✅ CAN view and manage Group Folders assigned to their groups
 * 
 * Reference: Docs/nextcloud-admin-subadmin-guide.md (Verified: Sept 30, 2025)
 */
export const PERMISSION_GROUPS = {
  ADMIN: [
    PERMISSIONS.ADMIN,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.APPS_MANAGE,
    
    // User management - FULL
    PERMISSIONS.USERS_CREATE,        // ✅ Can create new users
    PERMISSIONS.USERS_EDIT,          // ✅ Can edit all users
    PERMISSIONS.USERS_DELETE,        // ✅ Can delete users
    PERMISSIONS.USERS_MANAGE,        // ✅ Legacy support
    PERMISSIONS.USERS_INVITE,
    
    // Group management - FULL
    PERMISSIONS.GROUPS_CREATE,       // ✅ Can create new groups
    PERMISSIONS.GROUPS_EDIT_MEMBERS, // ✅ Can edit all groups
    PERMISSIONS.GROUPS_DELETE,       // ✅ Can delete groups
    PERMISSIONS.GROUPS_MANAGE,       // ✅ Legacy support
    PERMISSIONS.GROUPS_VIEW,
    
    // Data room management - FULL
    PERMISSIONS.DATA_ROOMS_CREATE,   // ✅ Can create Group Folders
    PERMISSIONS.DATA_ROOMS_EDIT,     // ✅ Can edit all data rooms
    PERMISSIONS.DATA_ROOMS_DELETE,   // ✅ Can delete Group Folders
    PERMISSIONS.DATA_ROOMS_MANAGE,   // ✅ Legacy support
    PERMISSIONS.DATA_ROOMS_WRITE,
    PERMISSIONS.DATA_ROOMS_READ,
    
    // Document management - FULL
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.DOCUMENTS_EDIT,
    PERMISSIONS.DOCUMENTS_VIEW,
    
    // Audit and roles
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.ROLES_MANAGE,
  ],
  
  SUBADMIN: [
    // User management - LIMITED (existing users in managed groups only)
    PERMISSIONS.USERS_EDIT,          // ✅ Can edit users in managed groups
    PERMISSIONS.USERS_MANAGE,        // ✅ Legacy (maps to USERS_EDIT)
    PERMISSIONS.USERS_INVITE,        // ✅ Can invite existing users to managed groups
    // ❌ NO USERS_CREATE - Cannot create new users
    // ❌ NO USERS_DELETE - Cannot delete users
    
    // Group management - LIMITED (assigned groups only)
    PERMISSIONS.GROUPS_VIEW,         // ✅ Can view managed groups
    PERMISSIONS.GROUPS_EDIT_MEMBERS, // ✅ Can add/remove members in managed groups
    // ❌ NO GROUPS_CREATE - Cannot create new groups
    // ❌ NO GROUPS_DELETE - Cannot delete groups
    // ❌ NO GROUPS_MANAGE - Cannot manage all groups
    
    // Data room management - LIMITED (assigned groups only)
    PERMISSIONS.DATA_ROOMS_EDIT,     // ✅ Can edit data rooms for managed groups
    PERMISSIONS.DATA_ROOMS_MANAGE,   // ✅ Can manage existing data rooms for managed groups
    PERMISSIONS.DATA_ROOMS_WRITE,    // ✅ Can write to assigned data rooms
    PERMISSIONS.DATA_ROOMS_READ,     // ✅ Can read from assigned data rooms
    // ❌ NO DATA_ROOMS_CREATE - Cannot create Group Folders
    // ❌ NO DATA_ROOMS_DELETE - Cannot delete Group Folders
    
    // Document management - STANDARD
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_VIEW,
    
    // Audit - READ ONLY
    PERMISSIONS.AUDIT_VIEW,
    // ❌ NO AUDIT_EXPORT - Cannot export audit logs
  ],
  
  MANAGER: [
    PERMISSIONS.DATA_ROOMS_WRITE,
    PERMISSIONS.DATA_ROOMS_READ,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_EDIT,
    PERMISSIONS.AUDIT_VIEW,
    // Note: Managers don't create data rooms, they manage existing ones
  ],
  
  USER: [
    PERMISSIONS.DATA_ROOMS_READ,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.PROFILE_EDIT,
  ],
};
