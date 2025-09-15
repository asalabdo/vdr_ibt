import apiClient from './client';
import { endpoints, withJsonFormat } from './endpoints';

/**
 * Clean Nextcloud Talk API functions
 * Only includes functions actually used by the application
 */

/**
 * Transform raw Talk room data into application format
 */
const formatRoomData = (roomData) => {
  return {
    id: roomData.id,
    token: roomData.token,
    displayName: roomData.displayName || roomData.name,
    description: roomData.description || '',
    type: roomData.type,
    readOnly: roomData.readOnly || 0,
    lastActivity: roomData.lastActivity,
    unreadMessages: roomData.unreadMessages || 0,
    participantType: roomData.participantType || 0,
  };
};

/**
 * Transform raw Talk message data into application format
 */
const formatMessageData = (messageData) => {
  return {
    id: messageData.id,
    token: messageData.token,
    actorType: messageData.actorType,
    actorId: messageData.actorId,
    actorDisplayName: messageData.actorDisplayName,
    timestamp: messageData.timestamp,
    message: messageData.message,
    messageType: messageData.messageType || 'comment',
    parent: messageData.parent ? formatMessageData(messageData.parent) : null,
    timeAgo: formatTimeAgo(messageData.timestamp),
  };
};

/**
 * Format time ago string
 */
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
};

/**
 * Check if user can write messages to a room
 * @param {Object} room - Room object with permission fields
 * @returns {boolean} True if user can write messages
 */
const canWriteToRoom = (room) => {
  // Read-only rooms don't allow writing
  if (room.readOnly === 1) {
    return false;
  }
  
  // Changelog/system rooms (type 4) are typically read-only
  if (room.type === 4) {
    return false;
  }
  
  // Check participant type (0 = not joined, 1 = owner, 2 = moderator, 3 = user, 4 = guest)
  if (room.participantType === 0) {
    return false; // Not joined the room
  }
  
  return true; // Default: allow writing
};

/**
 * Get permission status for a room
 * @param {Object} room - Room object with permission fields
 * @returns {Object} Permission status with details
 */
const getRoomPermissionStatus = (room) => {
  const canWrite = canWriteToRoom(room);
  
  let reason = '';
  let permissionLevel = 'full';
  
  if (!canWrite) {
    if (room.readOnly === 1) {
      reason = 'Room is read-only';
      permissionLevel = 'read-only';
    } else if (room.type === 4) {
      reason = 'Changelog/system room';
      permissionLevel = 'read-only';
    } else if (room.participantType === 0) {
      reason = 'Not joined to room';
      permissionLevel = 'none';
    }
  }
  
  return {
    canWrite,
    canRead: true, // Can always read if they see the room
    permissionLevel,
    reason,
    isReadOnly: room.readOnly === 1
  };
};

/**
 * Get list of all Talk rooms
 */
const getRooms = async (options = {}) => {
  try {
    const { includeStatus = false } = options;
    
    let url = withJsonFormat(endpoints.talk.rooms);
    if (includeStatus) {
      url += '&includeStatus=true';
    }
    
    const response = await apiClient.get(url);
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const roomsData = response.data.ocs.data || [];
      
      return {
        success: true,
        rooms: roomsData.map(formatRoomData),
        total: roomsData.length,
      };
    }
    
    throw new Error('Failed to fetch Talk rooms');
    
  } catch (error) {
    console.error('❌ Failed to get Talk rooms:', error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get Talk rooms');
  }
};

/**
 * Get messages from a Talk room
 */
const getMessages = async (roomToken, options = {}) => {
  try {
    if (!roomToken?.trim()) {
      throw new Error('Room token is required');
    }
    
    const { limit = 100, lastKnownMessageId, lookIntoFuture = 1 } = options;
    
    const params = new URLSearchParams();
    params.append('format', 'json');
    params.append('limit', limit.toString());
    params.append('lookIntoFuture', lookIntoFuture.toString());
    
    if (lastKnownMessageId) {
      params.append('lastKnownMessageId', lastKnownMessageId.toString());
    }
    
    const url = `${endpoints.talk.messages(roomToken)}?${params.toString()}`;
    const response = await apiClient.get(url);
    
    if (response.data?.ocs?.meta?.statuscode === 200) {
      const messagesData = response.data.ocs.data || [];
      
      return {
        success: true,
        messages: messagesData.map(formatMessageData),
        total: messagesData.length,
        token: roomToken
      };
    }
    
    throw new Error('Failed to fetch messages');
    
  } catch (error) {
    console.error(`❌ Failed to get messages for room ${roomToken}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to get messages');
  }
};

/**
 * Get messages with threading support
 */
const getQAMessages = async (roomToken, options = {}) => {
  try {
    const messagesResult = await getMessages(roomToken, options);
    
    // Show ALL messages, not just filtered ones
    const allMessages = [];
    
    // First pass: create messages and skip system messages
    messagesResult.messages.forEach(message => {
      if (message.messageType !== 'system') {
        allMessages.push({
          ...message,
          answers: [],
          answersCount: 0,
          hasAnswers: false,
        });
      }
    });
    
    // Second pass: attach replies to parent messages
    messagesResult.messages.forEach(message => {
      if (message.parent && message.messageType !== 'system') {
        const parentId = message.parent.id;
        const parentMessage = allMessages.find(m => m.id === parentId);
        
        if (parentMessage) {
          parentMessage.answers.push(message);
        }
      }
    });
    
    // Sort messages by timestamp (newest first)
    allMessages.sort((a, b) => b.timestamp - a.timestamp);
    
    // Update answer counts
    allMessages.forEach(message => {
      message.answers.sort((a, b) => a.timestamp - b.timestamp);
      message.answersCount = message.answers.length;
      message.hasAnswers = message.answers.length > 0;
    });
    
    return {
      success: true,
      questions: allMessages, // Named for compatibility
      total: allMessages.length,
      token: roomToken,
      totalMessages: messagesResult.total
    };
    
  } catch (error) {
    console.error(`❌ Failed to get messages for room ${roomToken}:`, error.message);
    throw error;
  }
};

/**
 * Send a message to a Talk room
 */
const sendMessage = async (roomToken, message, options = {}) => {
  try {
    if (!roomToken?.trim() || !message?.trim()) {
      throw new Error('Room token and message are required');
    }
    
    const { replyTo, referenceId } = options;
    
    const formData = new URLSearchParams();
    formData.append('message', message.trim());
    
    if (replyTo) {
      formData.append('replyTo', replyTo.toString());
    }
    
    if (referenceId) {
      formData.append('referenceId', referenceId);
    }
    
    const response = await apiClient.post(endpoints.talk.sendMessage(roomToken), formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data?.ocs?.meta?.statuscode === 201) {
      const messageData = response.data.ocs.data;
      
      return {
        success: true,
        message: formatMessageData(messageData),
        sent: true
      };
    }
    
    throw new Error('Failed to send message');
    
  } catch (error) {
    console.error(`❌ Failed to send message to room ${roomToken}:`, error.message);
    throw new Error(error.response?.data?.ocs?.meta?.message || error.message || 'Failed to send message');
  }
};

/**
 * Send a message (clean, no artificial prefixes)
 */
const sendQuestion = async (roomToken, message, options = {}) => {
  try {
    return await sendMessage(roomToken, message, options);
  } catch (error) {
    console.error(`❌ Failed to send message to room ${roomToken}:`, error.message);
    throw error;
  }
};

/**
 * Send a reply to a message
 */
const sendAnswer = async (roomToken, questionId, answer, options = {}) => {
  try {
    return await sendMessage(roomToken, answer, {
      ...options,
      replyTo: questionId
    });
  } catch (error) {
    console.error(`❌ Failed to send reply to message ${questionId}:`, error.message);
    throw error;
  }
};

/**
 * Clean Talk API exports - only what we actually use
 */
export const talkAPI = {
  // Room management
  getRooms,
  
  // Message management
  getMessages,
  getQAMessages,
  sendMessage,
  sendQuestion,
  sendAnswer,
  
  // Utility functions
  formatRoomData,
  formatMessageData,
  
  // Permission functions
  canWriteToRoom,
  getRoomPermissionStatus,
};

export default talkAPI;
