/**
 * Centralized Permission Constants
 * Consolidates all permission strings to eliminate magic strings
 */

export const PERMISSIONS = {
  // System permissions
  ADMIN: 'admin',
  SYSTEM_CONFIG: 'system.config',
  
  // User management
  USERS_MANAGE: 'users.manage',
  USERS_INVITE: 'users.invite',
  
  // Group management
  GROUPS_MANAGE: 'groups.manage',
  GROUPS_VIEW: 'groups.view',
  
  // Data room permissions
  DATA_ROOMS_MANAGE: 'data_rooms.manage',
  DATA_ROOMS_CREATE: 'data_rooms.create',
  DATA_ROOMS_DELETE: 'data_rooms.delete',
  DATA_ROOMS_WRITE: 'data_rooms.write',
  DATA_ROOMS_READ: 'data_rooms.read',
  
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
 */
export const PERMISSION_GROUPS = {
  ADMIN: [
    PERMISSIONS.ADMIN,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.GROUPS_MANAGE,
    PERMISSIONS.APPS_MANAGE,
    PERMISSIONS.DATA_ROOMS_MANAGE,
    PERMISSIONS.DATA_ROOMS_CREATE,
    PERMISSIONS.DATA_ROOMS_DELETE,
    PERMISSIONS.DATA_ROOMS_WRITE,
    PERMISSIONS.DATA_ROOMS_READ,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.ROLES_MANAGE,
  ],
  
  SUBADMIN: [
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.DATA_ROOMS_MANAGE,
    PERMISSIONS.DATA_ROOMS_CREATE,
    PERMISSIONS.DATA_ROOMS_WRITE,
    PERMISSIONS.DATA_ROOMS_READ,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.AUDIT_VIEW,
  ],
  
  MANAGER: [
    PERMISSIONS.DATA_ROOMS_CREATE,
    PERMISSIONS.DATA_ROOMS_WRITE,
    PERMISSIONS.DATA_ROOMS_READ,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.AUDIT_VIEW,
  ],
  
  USER: [
    PERMISSIONS.DATA_ROOMS_READ,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.PROFILE_EDIT,
  ],
};
