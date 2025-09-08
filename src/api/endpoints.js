/**
 * Nextcloud API Endpoints Configuration
 * Based on comprehensive APIs.json analysis
 * 
 * Note: All endpoints that return data should include ?format=json for OCS API
 */

export const endpoints = {
  // ===== AUTHENTICATION & SESSION =====
  auth: {
    serverStatus: '/status.php',
    capabilities: '/ocs/v2.php/cloud/capabilities',
    currentUser: '/ocs/v2.php/cloud/user',
    testAuth: '/ocs/v2.php/apps/files_sharing/api/v1/shares', // Test endpoint
  },

  // ===== USER MANAGEMENT (Provisioning API) =====
  users: {
    list: '/ocs/v1.php/cloud/users',
    search: '/ocs/v1.php/cloud/users', // Add ?search=term
    details: (userId) => `/ocs/v1.php/cloud/users/${userId}`,
    create: '/ocs/v1.php/cloud/users',
    updateDisplayName: (userId) => `/ocs/v1.php/cloud/users/${userId}/displayname`,
    updateEmail: (userId) => `/ocs/v1.php/cloud/users/${userId}/email`,
    updatePassword: (userId) => `/ocs/v1.php/cloud/users/${userId}/password`,
    enable: (userId) => `/ocs/v1.php/cloud/users/${userId}/enable`,
    disable: (userId) => `/ocs/v1.php/cloud/users/${userId}/disable`,
    delete: (userId) => `/ocs/v1.php/cloud/users/${userId}`,
    groups: (userId) => `/ocs/v1.php/cloud/users/${userId}/groups`,
    addToGroup: (userId) => `/ocs/v1.php/cloud/users/${userId}/groups`,
    removeFromGroup: (userId) => `/ocs/v1.php/cloud/users/${userId}/groups`,
  },

  // ===== GROUP MANAGEMENT =====
  groups: {
    list: '/ocs/v1.php/cloud/groups',
    search: '/ocs/v1.php/cloud/groups', // Add ?search=term
    create: '/ocs/v1.php/cloud/groups',
    details: (groupId) => `/ocs/v1.php/cloud/groups/${groupId}`,
    delete: (groupId) => `/ocs/v1.php/cloud/groups/${groupId}`,
  },

  // ===== FILES & WEBDAV =====
  files: {
    root: (username) => `/remote.php/dav/files/${username}/`,
    folder: (username, path) => `/remote.php/dav/files/${username}/${path}/`,
    file: (username, path) => `/remote.php/dav/files/${username}/${path}`,
    upload: (username, filename) => `/remote.php/dav/files/${username}/${filename}`,
    download: (username, path) => `/remote.php/dav/files/${username}/${path}`,
    properties: (username, path) => `/remote.php/dav/files/${username}/${path}`,
  },

  // ===== SHARING API (CRITICAL FOR VDR) =====
  sharing: {
    list: '/ocs/v2.php/apps/files_sharing/api/v1/shares',
    getByPath: '/ocs/v2.php/apps/files_sharing/api/v1/shares', // Add ?path=filepath
    create: '/ocs/v2.php/apps/files_sharing/api/v1/shares',
    details: (shareId) => `/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`,
    update: (shareId) => `/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`,
    delete: (shareId) => `/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`,
  },

  // ===== GROUP FOLDERS (Alternative VDR approach) =====
  groupFolders: {
    list: '/ocs/v2.php/apps/groupfolders/folders',
    create: '/ocs/v2.php/apps/groupfolders/folders',
    details: (folderId) => `/ocs/v2.php/apps/groupfolders/folders/${folderId}`,
    delete: (folderId) => `/ocs/v2.php/apps/groupfolders/folders/${folderId}`,
    addGroup: (folderId) => `/ocs/v2.php/apps/groupfolders/folders/${folderId}/groups`,
    setPermissions: (folderId, groupId) => `/ocs/v2.php/apps/groupfolders/folders/${folderId}/groups/${groupId}`,
  },

  // ===== CALENDAR (CalDAV) =====
  calendar: {
    root: (username) => `/remote.php/dav/calendars/${username}/`,
    calendar: (username, calendarName) => `/remote.php/dav/calendars/${username}/${calendarName}/`,
    event: (username, calendarName, eventId) => `/remote.php/dav/calendars/${username}/${calendarName}/${eventId}.ics`,
    create: (username) => `/remote.php/dav/calendars/${username}/`,
  },

  // ===== CONTACTS (CardDAV) =====
  contacts: {
    root: (username) => `/remote.php/dav/addressbooks/users/${username}/`,
    addressbook: (username, addressbookName) => `/remote.php/dav/addressbooks/users/${username}/${addressbookName}/`,
    contact: (username, addressbookName, contactId) => `/remote.php/dav/addressbooks/users/${username}/${addressbookName}/${contactId}.vcf`,
    search: (username, addressbookName) => `/remote.php/dav/addressbooks/users/${username}/${addressbookName}/`,
  },

  // ===== TASKS (CalDAV Tasks) =====
  tasks: {
    root: (username) => `/remote.php/dav/calendars/${username}/tasks/`,
    task: (username, taskId) => `/remote.php/dav/calendars/${username}/tasks/${taskId}.ics`,
  },

  // ===== TALK (Chat & Video) =====
  talk: {
    rooms: '/ocs/v2.php/apps/spreed/api/v4/room',
    roomDetails: (token) => `/ocs/v2.php/apps/spreed/api/v4/room/${token}`,
    join: (token) => `/ocs/v2.php/apps/spreed/api/v4/room/${token}/participants/active`,
    leave: (token) => `/ocs/v2.php/apps/spreed/api/v4/room/${token}/participants/active`,
    messages: (token) => `/ocs/v2.php/apps/spreed/api/v1/chat/${token}`,
    sendMessage: (token) => `/ocs/v2.php/apps/spreed/api/v1/chat/${token}`,
    participants: (token) => `/ocs/v2.php/apps/spreed/api/v4/room/${token}/participants`,
  },

  // ===== DECK (Kanban Boards) =====
  deck: {
    boards: '/index.php/apps/deck/api/v1.0/boards',
    board: (boardId) => `/index.php/apps/deck/api/v1.0/boards/${boardId}`,
    stacks: (boardId) => `/index.php/apps/deck/api/v1.0/boards/${boardId}/stacks`,
    stack: (boardId, stackId) => `/index.php/apps/deck/api/v1.0/boards/${boardId}/stacks/${stackId}`,
    cards: (boardId, stackId) => `/index.php/apps/deck/api/v1.0/boards/${boardId}/stacks/${stackId}/cards`,
    card: (boardId, stackId, cardId) => `/index.php/apps/deck/api/v1.0/boards/${boardId}/stacks/${stackId}/cards/${cardId}`,
    comments: (cardId) => `/ocs/v2.php/apps/deck/api/v1.0/cards/${cardId}/comments`,
  },

  // ===== NOTIFICATIONS =====
  notifications: {
    list: '/ocs/v2.php/apps/notifications/api/v2/notifications',
    delete: (notificationId) => `/ocs/v2.php/apps/notifications/api/v2/notifications/${notificationId}`,
    deleteAll: '/ocs/v2.php/apps/notifications/api/v2/notifications',
  },

  // ===== ACTIVITY & MONITORING (CRITICAL FOR AUDIT LOGS) =====
  activity: {
    list: '/ocs/v2.php/apps/activity/api/v2/activity',
    filter: '/ocs/v2.php/apps/activity/api/v2/activity/filter',
    withLimit: (limit = 50) => `/ocs/v2.php/apps/activity/api/v2/activity?limit=${limit}`,
  },

  // ===== USER STATUS =====
  userStatus: {
    get: '/ocs/v2.php/apps/user_status/api/v1/user_status',
    set: '/ocs/v2.php/apps/user_status/api/v1/user_status/status',
    clear: '/ocs/v2.php/apps/user_status/api/v1/user_status/status',
  },

  // ===== SEARCH & AUTOCOMPLETE =====
  search: {
    autocomplete: '/ocs/v2.php/core/autocomplete/get',
    files: '/remote.php/dav', // Use SEARCH method with XML body
  },

  // ===== APPS MANAGEMENT =====
  apps: {
    list: '/ocs/v2.php/cloud/apps',
    info: (appName) => `/ocs/v2.php/cloud/apps/${appName}`,
    enable: (appName) => `/ocs/v2.php/cloud/apps/${appName}`,
    disable: (appName) => `/ocs/v2.php/cloud/apps/${appName}`,
  },

  // ===== DIRECT DOWNLOAD =====
  directDownload: {
    create: '/ocs/v2.php/apps/dav/api/v1/direct',
  },

  // ===== COMMENTS =====
  comments: {
    fileComments: (fileId) => `/remote.php/dav/comments/files/${fileId}`,
    addComment: (fileId) => `/remote.php/dav/comments/files/${fileId}`,
  },

  // ===== TRASH BIN =====
  trash: {
    list: (username) => `/remote.php/dav/trashbin/${username}/trash/`,
    restore: (username, filename) => `/remote.php/dav/trashbin/${username}/restore/${filename}`,
    delete: (username, filename) => `/remote.php/dav/trashbin/${username}/trash/${filename}`,
    empty: (username) => `/remote.php/dav/trashbin/${username}/trash/`,
  },

  // ===== FILE VERSIONS =====
  versions: {
    list: (username, fileId) => `/remote.php/dav/versions/${username}/versions/${fileId}`,
    restore: (username, fileId, versionId) => `/remote.php/dav/versions/${username}/versions/${fileId}/${versionId}`,
  },

  // ===== ONLYOFFICE INTEGRATION =====
  onlyOffice: {
    status: '/ocs/v2.php/cloud/apps/onlyoffice',
    config: '/ocs/v2.php/apps/onlyoffice/api/v1/config',
    healthCheck: ':8000/healthcheck', // Note: Different port for document server
    template: '/ocs/v2.php/apps/onlyoffice/api/v1/template',
  },
};

// Helper function to add format=json to OCS endpoints
export const withJsonFormat = (endpoint) => {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}format=json`;
};

// Predefined share types (from APIs.json analysis)
export const shareTypes = {
  USER: 0,        // Share with specific user
  GROUP: 1,       // Share with group
  PUBLIC_LINK: 3, // Public link (CRITICAL for VDR external access)
  EMAIL: 4,       // Share via email
  FEDERATED: 6,   // Federated sharing
};

// Predefined permission levels (from APIs.json analysis and VDR testing)
export const permissions = {
  READ: 1,                    // Read only
  UPDATE: 2,                  // Update/edit
  CREATE: 4,                  // Create new files
  DELETE: 8,                  // Delete files
  SHARE: 16,                  // Share with others
  READ_CREATE: 17,            // Read + Create (tested and confirmed)
  READ_WRITE_CREATE: 19,      // Read + Write + Create (tested and confirmed)
  FULL: 31,                   // All permissions (tested and confirmed)
};

export default endpoints;
