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

// Data Rooms management hooks
export {
  useDataRooms,
  useDataRoomDetails,
  useAvailableGroups,
  useCreateDataRoom,
  useUpdateDataRoom,
  useDeleteDataRoom,
  useAddGroupToDataRoom,
  useSetGroupPermissions,
  useRemoveGroupFromDataRoom,
  useDataRoomsManagement,
} from './useDataRooms';

// Groups management hooks
export {
  useGroups,
  useGroupDetails,
  useGroupSubadmins,
  useSearchGroups,
  useGroupMemberCounts,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupManagement,
} from './useGroups';

// Future hooks will be exported here:
// export { useFiles, useFileUpload } from './useFiles';
// export { useAuditLogs } from './useAuditLogs';
// export { useNotifications } from './useNotifications';
