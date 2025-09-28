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

// Permission error handling
export { usePermissionErrors } from './usePermissionErrors';

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

// User role management hooks
export {
  useUserRole,
  useMakeUserAdmin,
  useRemoveAdminPrivileges,
  usePromoteUserToSubadmin,
  useDemoteUserFromSubadmin,
  useRoleManagement,
} from './useUserRoles';

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
  useUserSubadminGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupManagement,
} from './useGroups';

// Files management hooks
export {
  useListFiles,
  useFileProperties,
  useCreateFolder,
  useDeleteItem,
  useMoveItem,
  useCopyItem,
  useUploadFile,
  useDownloadFile,
  useFilesManagement,
  useFileUpload,
} from './useFiles';

// Sharing management hooks
export {
  useShares,
  useSharesByPath,
  useShareDetails,
  useCreateShare,
  useUpdateShare,
  useDeleteShare,
  useCreatePublicLink,
  useCreateEmailShare,
  useCreateGroupShare,
  useSharingManagement,
  useAdvancedSharing,
} from './useSharing';

// Audit Logs management hooks
export {
  useAuditLogStats,
  useExportAuditLogs,
  useAuditLogsManagement,
} from './useAuditLogs';

// Talk message management hooks
export {
  useRooms,
  useQAMessages,
  useSendQuestion,
  useSendAnswer,
  useRoomPermissions,
  useRoomsPermissions,
  useParticipants,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useAddParticipant,
  useRemoveParticipant,
  ROOM_TYPES,
} from './useTalk';

// Future hooks will be exported here:
// export { useNotifications } from './useNotifications';
