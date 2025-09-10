import apiClient from './client';
import { endpoints, withJsonFormat } from './endpoints';

/**
 * Audit Logs API functions for Nextcloud Activity & Admin Audit
 * Modern functional approach with comprehensive audit log management capabilities
 */

// ===== PURE UTILITY FUNCTIONS =====

/**
 * Transform raw Nextcloud activity data into audit log format
 * @param {Array} activities - Raw activities array from Nextcloud
 * @returns {Array} Formatted audit logs array
 */
const formatAuditLogsList = (activities = []) => {
  if (!Array.isArray(activities)) return [];
  
  return activities.map(activity => {
    // Parse the activity data
    const activityId = activity.activity_id || activity.id || Date.now();
    const timestamp = activity.timestamp || activity.datetime || new Date().toISOString();
    const subject = activity.subject || activity.message || 'Unknown activity';
    const subjectRich = activity.subject_rich || activity.subjectRich || {};
    const message = activity.message || activity.subject || '';
    const messageRich = activity.message_rich || activity.messageRich || {};
    
    // Determine activity type and category
    const app = activity.app || 'system';
    const type = activity.type || 'unknown';
    const objectType = activity.object_type || activity.objectType || '';
    const objectId = activity.object_id || activity.objectId || '';
    const objectName = activity.object_name || activity.objectName || '';
    
    // User information
    const user = activity.user || activity.affecteduser || 'system';
    const author = activity.author || activity.user || 'system';
    
    // Additional metadata
    const link = activity.link || '';
    const icon = activity.icon || '';
    const priority = activity.priority || 'normal';
    
    return {
      id: activityId,
      logId: activityId.toString(),
      timestamp: timestamp,
      formattedDate: formatDate(timestamp),
      timeAgo: formatTimeAgo(timestamp),
      
      // Activity content
      subject: subject,
      subjectRich: subjectRich,
      message: message,
      messageRich: messageRich,
      
      // Categorization
      app: app,
      type: type,
      category: determineCategory(app, type, objectType),
      severity: determineSeverity(app, type, subject, message),
      
      // Object information
      objectType: objectType,
      objectId: objectId,
      objectName: objectName,
      
      // User information
      user: user,
      author: author,
      actor: author,
      
      // UI helpers
      icon: icon || getDefaultIcon(app, type),
      link: link,
      priority: priority,
      color: getSeverityColor(determineSeverity(app, type, subject, message)),
      categoryLabel: getCategoryLabel(app, type, objectType),
      
      // Computed fields
      isSecurityEvent: isSecurityRelated(app, type, subject, message),
      isDataEvent: isDataRelated(app, type, objectType),
      isSystemEvent: isSystemRelated(app, type),
      isUserEvent: isUserRelated(app, type),
      
      // Raw data for detailed view
      raw: activity,
    };
  });
};

/**
 * Determine audit log category based on app, type, and object
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @param {string} objectType - Object type
 * @returns {string} Category name
 */
const determineCategory = (app, type, objectType) => {
  // Security-related activities
  if (app === 'admin_audit' || type.includes('login') || type.includes('password') || type.includes('security')) {
    return 'security';
  }
  
  // File-related activities
  if (app === 'files' || objectType === 'files' || type.includes('file') || type.includes('share')) {
    return 'files';
  }
  
  // User management activities
  if (app === 'settings' || type.includes('user') || type.includes('group')) {
    return 'users';
  }
  
  // Data room activities
  if (app === 'groupfolders' || objectType === 'groupfolder') {
    return 'data_rooms';
  }
  
  // System activities
  if (app === 'core' || app === 'system' || type.includes('system')) {
    return 'system';
  }
  
  // App-specific activities
  if (app && app !== 'no app in context') {
    return 'apps';
  }
  
  return 'general';
};

/**
 * Determine severity level of audit log entry
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @param {string} subject - Activity subject
 * @param {string} message - Activity message
 * @returns {string} Severity level
 */
const determineSeverity = (app, type, subject, message) => {
  const content = (subject + ' ' + message).toLowerCase();
  
  // Critical events
  if (content.includes('failed') || content.includes('error') || content.includes('denied') || 
      content.includes('blocked') || content.includes('deleted') || content.includes('removed')) {
    return 'critical';
  }
  
  // High severity events
  if (app === 'admin_audit' || content.includes('login') || content.includes('password') || 
      content.includes('created') || content.includes('modified') || content.includes('shared')) {
    return 'high';
  }
  
  // Medium severity events
  if (content.includes('updated') || content.includes('changed') || content.includes('moved') || 
      content.includes('renamed') || content.includes('copied')) {
    return 'medium';
  }
  
  // Low severity events (general activities)
  return 'low';
};

/**
 * Check if activity is security-related
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @param {string} subject - Activity subject
 * @param {string} message - Activity message
 * @returns {boolean} Is security-related
 */
const isSecurityRelated = (app, type, subject, message) => {
  const content = (subject + ' ' + message).toLowerCase();
  const securityKeywords = ['login', 'password', 'security', 'authentication', 'authorization', 'permission', 'access', 'denied', 'blocked'];
  return app === 'admin_audit' || securityKeywords.some(keyword => content.includes(keyword));
};

/**
 * Check if activity is data-related
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @param {string} objectType - Object type
 * @returns {boolean} Is data-related
 */
const isDataRelated = (app, type, objectType) => {
  return app === 'files' || objectType === 'files' || type.includes('file') || type.includes('share');
};

/**
 * Check if activity is system-related
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @returns {boolean} Is system-related
 */
const isSystemRelated = (app, type) => {
  return app === 'core' || app === 'system' || type.includes('system') || app === 'settings';
};

/**
 * Check if activity is user-related
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @returns {boolean} Is user-related
 */
const isUserRelated = (app, type) => {
  return type.includes('user') || type.includes('group') || app === 'settings';
};

/**
 * Get default icon for activity type
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @returns {string} Icon name
 */
const getDefaultIcon = (app, type) => {
  if (app === 'admin_audit') return 'shield-check';
  if (app === 'files') return 'folder';
  if (app === 'settings') return 'settings';
  if (app === 'groupfolders') return 'folder-users';
  if (type.includes('login')) return 'log-in';
  if (type.includes('logout')) return 'log-out';
  if (type.includes('share')) return 'share';
  if (type.includes('file')) return 'file';
  return 'activity';
};

/**
 * Get severity color for UI display
 * @param {string} severity - Severity level
 * @returns {string} Color class
 */
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

/**
 * Get category label for display
 * @param {string} app - Application name
 * @param {string} type - Activity type
 * @param {string} objectType - Object type
 * @returns {string} Category label
 */
const getCategoryLabel = (app, type, objectType) => {
  const category = determineCategory(app, type, objectType);
  const labels = {
    security: 'Security',
    files: 'Files',
    users: 'Users',
    data_rooms: 'Data Rooms',
    system: 'System',
    apps: 'Applications',
    general: 'General'
  };
  return labels[category] || 'General';
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return dateString;
  }
};

/**
 * Format time ago string
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string
 */
const formatTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (error) {
    return 'Unknown';
  }
};

// ===== API FUNCTIONS =====

/**
 * Get audit logs (activity logs) - RAW API call with NO parameters
 * @returns {Object} Audit logs data
 */
const getAuditLogs = async () => {
  try {
    // Just the basic API call - NO FUCKING PARAMETERS!
    const url = withJsonFormat(endpoints.activity.list);
    const response = await apiClient.get(url);
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const activities = response.data.ocs.data || [];
      const formattedLogs = formatAuditLogsList(activities);
      
      return {
        success: true,
        auditLogs: formattedLogs,
        total: formattedLogs.length, // Actual count of returned logs
      };
    }
    
    throw new Error('Failed to fetch audit logs');
    
  } catch (error) {
    console.error('❌ Failed to get audit logs:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get audit logs');
  }
};

/**
 * Get audit log statistics with logs data - single source of truth for client-side pagination
 * @param {Object} options - Query options (ignored - we fetch everything)
 * @returns {Object} Statistics and logs data
 */
const getAuditLogStats = async (options = {}) => {
  try {
    // Fetch ALL available logs - raw API call with NO parameters
    const logsData = await getAuditLogs();
    
    const logs = logsData.auditLogs || [];
    
    // Calculate statistics
    const stats = {
      totalLogs: logs.length,
      
      // By severity
      bySeverity: {
        critical: logs.filter(log => log.severity === 'critical').length,
        high: logs.filter(log => log.severity === 'high').length,
        medium: logs.filter(log => log.severity === 'medium').length,
        low: logs.filter(log => log.severity === 'low').length,
      },
      
      // By category
      byCategory: {
        security: logs.filter(log => log.category === 'security').length,
        files: logs.filter(log => log.category === 'files').length,
        users: logs.filter(log => log.category === 'users').length,
        data_rooms: logs.filter(log => log.category === 'data_rooms').length,
        system: logs.filter(log => log.category === 'system').length,
        apps: logs.filter(log => log.category === 'apps').length,
        general: logs.filter(log => log.category === 'general').length,
      },
      
      // By app
      byApp: logs.reduce((acc, log) => {
        acc[log.app] = (acc[log.app] || 0) + 1;
        return acc;
      }, {}),
      
      // Top users
      topUsers: Object.entries(logs.reduce((acc, log) => {
        acc[log.user] = (acc[log.user] || 0) + 1;
        return acc;
      }, {}))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([user, count]) => ({ user, count })),
      
      // Security events
      securityEvents: logs.filter(log => log.isSecurityEvent).length,
      dataEvents: logs.filter(log => log.isDataEvent).length,
      systemEvents: logs.filter(log => log.isSystemEvent).length,
      userEvents: logs.filter(log => log.isUserEvent).length,
    };
    
    return {
      success: true,
      stats,
      logs, // Return logs for client-side pagination
      total: logs.length // Consistent total count
    };
    
  } catch (error) {
    console.error('❌ Failed to get audit log statistics:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get audit log statistics');
  }
};

// getAuditLogFilters function removed - not used anymore

/**
 * Export audit logs data
 * @param {Object} options - Export options
 * @param {string} [options.format='csv'] - Export format (csv, json)
 * @param {string} [options.since] - Export logs since this timestamp
 * @param {string} [options.until] - Export logs until this timestamp
 * @param {Array} [options.categories] - Filter by categories
 * @param {Array} [options.severities] - Filter by severities
 * @returns {Object} Export data
 */
const exportAuditLogs = async (options = {}) => {
  try {
    const {
      format = 'csv',
      since,
      until,
      categories,
      severities
    } = options;
    
    // Fetch ALL logs - raw API call
    const logsData = await getAuditLogs();
    
    let logs = logsData.auditLogs || [];
    
    // Apply filters
    if (categories && categories.length > 0) {
      logs = logs.filter(log => categories.includes(log.category));
    }
    
    if (severities && severities.length > 0) {
      logs = logs.filter(log => severities.includes(log.severity));
    }
    
    // Generate export data based on format
    let exportData;
    let mimeType;
    let filename;
    
    if (format === 'csv') {
      // CSV export
      const headers = [
        'Timestamp',
        'User',
        'Category',
        'Severity',
        'Subject',
        'Message',
        'App',
        'Type',
        'Object Type',
        'Object Name'
      ];
      
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp,
          log.user,
          log.category,
          log.severity,
          `"${log.subject.replace(/"/g, '""')}"`,
          `"${log.message.replace(/"/g, '""')}"`,
          log.app,
          log.type,
          log.objectType,
          log.objectName
        ].join(','))
      ];
      
      exportData = csvRows.join('\n');
      mimeType = 'text/csv';
      filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      
    } else if (format === 'json') {
      // JSON export
      exportData = JSON.stringify({
        exportDate: new Date().toISOString(),
        period: { since, until },
        totalLogs: logs.length,
        logs: logs.map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          user: log.user,
          author: log.author,
          category: log.category,
          severity: log.severity,
          subject: log.subject,
          message: log.message,
          app: log.app,
          type: log.type,
          objectType: log.objectType,
          objectId: log.objectId,
          objectName: log.objectName,
          isSecurityEvent: log.isSecurityEvent,
          isDataEvent: log.isDataEvent,
          isSystemEvent: log.isSystemEvent,
        }))
      }, null, 2);
      
      mimeType = 'application/json';
      filename = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    }
    
    return {
      success: true,
      data: exportData,
      mimeType,
      filename,
      totalRecords: logs.length
    };
    
  } catch (error) {
    console.error('❌ Failed to export audit logs:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to export audit logs');
  }
};

// ===== EXPORTS =====

/**
 * Audit Logs Management API object with all functions
 * Modern functional approach - all functions are pure and composable
 */
export const auditLogsAPI = {
  // Audit logs retrieval
  getAuditLogs,
  getAuditLogStats,
  
  // Export functionality
  exportAuditLogs,
  
  // Pure utility functions (exposed for testing and flexibility)
  formatAuditLogsList,
  determineCategory,
  determineSeverity,
  isSecurityRelated,
  isDataRelated,
  isSystemRelated,
  isUserRelated,
  getDefaultIcon,
  getSeverityColor,
  getCategoryLabel,
  formatDate,
  formatTimeAgo,
};
