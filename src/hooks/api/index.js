/**
 * API Hooks Index
 * Centralized exports for all API-related hooks
 */

// Authentication hooks
export {
  useAuth,
  useServerInfo,
  useAuthStatus,
  usePermissions,
  useLoginForm,
} from './useAuth';

// Users management hooks
export {
  useUsers,
  useUserDetails,
  useSearchUsers,
  useUserGroups,
  useCreateUser,
  useUpdateUserDisplayName,
  useUpdateUserEmail,
  useUpdateUserPassword,
  useEnableUser,
  useDisableUser,
  useDeleteUser,
  useAddUserToGroup,
  useRemoveUserFromGroup,
  useUsersManagement,
} from './useUsers';

// Future hooks will be exported here:
// export { useDataRooms, useDataRoom } from './useDataRooms';
// export { useFiles, useFileUpload } from './useFiles';
// export { useAuditLogs } from './useAuditLogs';
// export { useNotifications } from './useNotifications';
