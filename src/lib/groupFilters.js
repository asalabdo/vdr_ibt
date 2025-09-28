/**
 * Centralized Group Filtering Logic
 * Eliminates duplication across CreateUserModal, CreateDataRoomModal, etc.
 */

/**
 * Filter groups based on user permissions
 * @param {Array} allGroups - All available groups
 * @param {Object} userPermissions - User's permission context
 * @param {boolean} userPermissions.isAdmin - Is user admin
 * @param {boolean} userPermissions.canManageAllGroups - Can manage all groups
 * @param {Array} userPermissions.managedGroups - Groups user can manage
 * @param {Object} options - Filtering options
 * @param {boolean} options.excludeAdmin - Exclude admin group (default: true)
 * @returns {Array} Filtered groups
 */
export const filterGroupsByPermissions = (
  allGroups, 
  userPermissions, 
  options = {}
) => {
  const { 
    excludeAdmin = true 
  } = options;
  
  const {
    isAdmin,
    canManageAllGroups,
    managedGroups = []
  } = userPermissions;
  
  // Filter out admin group if requested
  let filteredGroups = excludeAdmin 
    ? allGroups.filter(group => group.id !== 'admin') 
    : allGroups;
  
  // Admins can see all groups
  if (isAdmin || canManageAllGroups) {
    return filteredGroups;
  }
  
  // Subadmins can only see their managed groups
  return filteredGroups.filter(group => 
    Array.isArray(managedGroups) ? managedGroups.includes(group.id) : false
  );
};

/**
 * Get groups available for user role assignment
 * @param {Array} allGroups - All available groups  
 * @param {Object} userPermissions - User's permission context
 * @param {string} targetRole - Role being assigned ('user', 'admin', 'subadmin')
 * @returns {Array} Groups available for this role assignment
 */
export const getGroupsForRoleAssignment = (allGroups, userPermissions, targetRole) => {
  switch (targetRole) {
    case 'admin':
      // Admins don't need group assignments (they get the 'admin' group automatically)
      return [];
      
    case 'subadmin':
      // Subadmins need company groups to manage
      return filterGroupsByPermissions(allGroups, userPermissions, { excludeAdmin: true });
      
    case 'user':
    default:
      // Regular users can be assigned to any groups the current user can manage
      return filterGroupsByPermissions(allGroups, userPermissions, { excludeAdmin: true });
  }
};

/**
 * Check if user has permission to assign specific groups
 * @param {Array} groupIds - Group IDs to check
 * @param {Object} userPermissions - User's permission context
 * @returns {Object} Result with allowed and denied groups
 */
export const validateGroupAssignment = (groupIds, userPermissions) => {
  const { isAdmin, canManageAllGroups, managedGroups = [] } = userPermissions;
  
  // Admins can assign any groups
  if (isAdmin || canManageAllGroups) {
    return {
      allowed: groupIds,
      denied: [],
      isValid: true
    };
  }
  
  // Check each group against managed groups
  const allowed = [];
  const denied = [];
  
  groupIds.forEach(groupId => {
    if (managedGroups.includes(groupId)) {
      allowed.push(groupId);
    } else {
      denied.push(groupId);
    }
  });
  
  return {
    allowed,
    denied,
    isValid: denied.length === 0
  };
};
