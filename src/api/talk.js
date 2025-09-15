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
    
    // First pass: create TOP-LEVEL messages only (skip system messages and replies)
    messagesResult.messages.forEach(message => {
      if (message.messageType !== 'system' && !message.parent) {
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
 * Room Types for Talk API
 */
export const ROOM_TYPES = {
  ONE_TO_ONE: 1,      // Direct chat between two users
  GROUP: 2,           // Private group chat
  PUBLIC: 3,          // Public room (anyone with link can join)
  CHANGELOG: 4,       // System generated changelog room
};

/**
 * Create a new Talk room
 */
const createRoom = async (roomData) => {
  try {
    console.log('🏗️ Creating Talk room:', roomData);
    
    // Step 1: Create the room with basic parameters only
    const formData = new URLSearchParams();
    formData.append('roomType', roomData.roomType || ROOM_TYPES.GROUP);
    formData.append('roomName', roomData.roomName || '');
    
    // Add optional room parameters (but not invite - that's handled separately)
    if (roomData.description) {
      formData.append('description', roomData.description);
    }
    if (roomData.password) {
      formData.append('password', roomData.password);
    }
    if (roomData.source) {
      formData.append('source', roomData.source); // e.g., "groups"
    }
    if (roomData.objectType) {
      formData.append('objectType', roomData.objectType);
    }
    if (roomData.objectId) {
      formData.append('objectId', roomData.objectId);
    }

    const response = await apiClient.post(
      withJsonFormat(endpoints.talk.createRoom),
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'OCS-APIRequest': 'true',
        },
      }
    );

    console.log('✅ Room created successfully:', response.data);
    
    if (!response.data?.ocs?.data) {
      throw new Error('Invalid room creation response format');
    }

    const createdRoom = formatRoomData(response.data.ocs.data);
    
    // Step 2: Add participants if provided
    if (roomData.invite) {
      console.log('👥 Adding participants to room:', roomData.invite);
      
      // Parse invite list (can be array or comma-separated string)
      const participants = Array.isArray(roomData.invite) 
        ? roomData.invite 
        : roomData.invite.split(',').map(p => p.trim()).filter(p => p);
      
      // Add each participant
      const addParticipantPromises = participants.map(participant => 
        addParticipant(createdRoom.token, participant).catch(error => {
          console.warn(`⚠️ Failed to add participant ${participant}:`, error.message);
          return { error: error.message, participant };
        })
      );
      
      const participantResults = await Promise.allSettled(addParticipantPromises);
      
      // Collect any warnings for participants that couldn't be added
      const warnings = participantResults
        .filter(result => result.status === 'fulfilled' && result.value?.error)
        .map(result => `Could not add ${result.value.participant}: ${result.value.error}`);
      
      if (warnings.length > 0) {
        console.warn('⚠️ Participant warnings:', warnings);
        return { ...createdRoom, warnings };
      }
    }
    
    return createdRoom;
  } catch (error) {
    console.error('❌ Failed to create Talk room:', error.message);
    throw error;
  }
};

/**
 * Update an existing Talk room
 */
const updateRoom = async (roomToken, updateData) => {
  try {
    console.log('🔄 Updating Talk room:', roomToken, updateData);
    
    const formData = new URLSearchParams();
    
    // Add updateable fields
    if (updateData.roomName !== undefined) {
      formData.append('roomName', updateData.roomName);
    }
    if (updateData.description !== undefined) {
      formData.append('description', updateData.description);
    }
    if (updateData.readOnly !== undefined) {
      formData.append('readOnly', updateData.readOnly);
    }

    const response = await apiClient.put(
      withJsonFormat(endpoints.talk.updateRoom(roomToken)),
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'OCS-APIRequest': 'true',
        },
      }
    );

    console.log('✅ Room updated successfully:', response.data);
    
    if (response.data?.ocs?.data) {
      return formatRoomData(response.data.ocs.data);
    }
    
    throw new Error('Invalid room update response format');
  } catch (error) {
    console.error('❌ Failed to update Talk room:', error.message);
    throw error;
  }
};

/**
 * Delete a Talk room
 */
const deleteRoom = async (roomToken) => {
  try {
    console.log('🗑️ Deleting Talk room:', roomToken);
    
    const response = await apiClient.delete(
      withJsonFormat(endpoints.talk.deleteRoom(roomToken)),
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      }
    );

    console.log('✅ Room deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete Talk room:', error.message);
    throw error;
  }
};

/**
 * Get participants of a Talk room
 */
const getParticipants = async (roomToken) => {
  try {
    console.log('👥 Getting participants for room:', roomToken);
    
    const response = await apiClient.get(
      withJsonFormat(endpoints.talk.participants(roomToken)),
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      }
    );

    console.log('✅ Participants retrieved successfully:', response.data);
    return {
      participants: response.data.ocs.data || [],
    };
  } catch (error) {
    console.error('❌ Failed to get participants:', error.message);
    throw error;
  }
};

/**
 * Add participant to a Talk room
 */
const addParticipant = async (roomToken, newParticipant) => {
  try {
    console.log('👤 Adding participant to room:', roomToken, newParticipant);
    
    const formData = new URLSearchParams();
    formData.append('newParticipant', newParticipant);

    const response = await apiClient.post(
      withJsonFormat(endpoints.talk.addParticipant(roomToken)),
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'OCS-APIRequest': 'true',
        },
      }
    );

    console.log('✅ Participant added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add participant:', error.message);
    throw error;
  }
};

/**
 * Remove participant from a Talk room
 */
const removeParticipant = async (roomToken, participant) => {
  try {
    console.log('👤 Removing participant from room:', roomToken, participant);
    
    const response = await apiClient.delete(
      withJsonFormat(`${endpoints.talk.removeParticipant(roomToken)}/${participant}`),
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      }
    );

    console.log('✅ Participant removed successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to remove participant:', error.message);
    throw error;
  }
};

/**
 * Clean Talk API exports - only what we actually use
 */
export const talkAPI = {
  // Room management
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getParticipants,
  addParticipant,
  removeParticipant,
  
  // Message management
  getMessages,
  getQAMessages,
  sendMessage,
  sendQuestion,
  sendAnswer,
  
  // Utility functions (removed unused exports)
  
  // Permission functions
  canWriteToRoom,
  getRoomPermissionStatus,
  
  // Constants
  ROOM_TYPES,
};

export default talkAPI;
