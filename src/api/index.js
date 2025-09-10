/**
 * API Layer Index
 * Centralized exports for all API functions and configurations
 */

// HTTP Client
export { default as apiClient, adminApiClient } from './client';

// Endpoints and Configuration
export { 
  default as endpoints, 
  withJsonFormat, 
  shareTypes, 
  permissions 
} from './endpoints';

// API Functions
export { authAPI } from './auth';
export { groupsAPI } from './groups';
export { usersAPI } from './users';
export { dataRoomsAPI } from './dataRooms';
export { filesAPI } from './files';
export { sharingAPI } from './sharing';
export { auditLogsAPI } from './auditLogs';

// Future API exports will be added here:
// export { notificationsAPI } from './notifications';
