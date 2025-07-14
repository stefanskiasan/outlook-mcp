/**
 * Teams presence functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated } = require('../auth');

/**
 * Get my presence handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetMyPresence(args) {
  try {
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the API path
    const apiPath = 'me/presence';
    
    console.error('Getting my presence');
    
    // Make API call
    const presence = await callGraphAPI(accessToken, 'GET', apiPath);
    
    return {
      content: [
        {
          type: "text",
          text: `👤 My Presence Status

**Availability:** ${presence.availability || 'Unknown'}
**Activity:** ${presence.activity || 'Unknown'}
**Status Message:** ${presence.statusMessage || 'No status message'}

**Available:** ${presence.availability === 'Available' ? '✅' : '❌'}
**Busy:** ${presence.availability === 'Busy' ? '🔴' : '⚪'}
**Away:** ${presence.availability === 'Away' ? '🟡' : '⚪'}
**Do Not Disturb:** ${presence.availability === 'DoNotDisturb' ? '🔴' : '⚪'}

**Last Activity:** ${presence.activity || 'Not specified'}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetMyPresence:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get presence: ${error.message}`
      }
    };
  }
}

/**
 * Get user presence handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetUserPresence(args) {
  try {
    const { userId } = args;
    
    if (!userId) {
      return {
        error: {
          code: -32602,
          message: "User ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the API path
    const apiPath = `users/${userId}/presence`;
    
    console.error(`Getting presence for user: ${userId}`);
    
    // Make API call
    const presence = await callGraphAPI(accessToken, 'GET', apiPath);
    
    return {
      content: [
        {
          type: "text",
          text: `👤 User Presence Status

**User ID:** ${userId}
**Availability:** ${presence.availability || 'Unknown'}
**Activity:** ${presence.activity || 'Unknown'}
**Status Message:** ${presence.statusMessage || 'No status message'}

**Available:** ${presence.availability === 'Available' ? '✅' : '❌'}
**Busy:** ${presence.availability === 'Busy' ? '🔴' : '⚪'}
**Away:** ${presence.availability === 'Away' ? '🟡' : '⚪'}
**Do Not Disturb:** ${presence.availability === 'DoNotDisturb' ? '🔴' : '⚪'}

**Last Activity:** ${presence.activity || 'Not specified'}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetUserPresence:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get user presence: ${error.message}`
      }
    };
  }
}

/**
 * Set my presence handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleSetMyPresence(args) {
  try {
    const { availability, activity, statusMessage = '' } = args;
    
    if (!availability || !activity) {
      return {
        error: {
          code: -32602,
          message: "Availability and activity are required"
        }
      };
    }
    
    // Validate availability values
    const validAvailability = ['Available', 'Busy', 'DoNotDisturb', 'BeRightBack', 'Away'];
    if (!validAvailability.includes(availability)) {
      return {
        error: {
          code: -32602,
          message: `Invalid availability. Must be one of: ${validAvailability.join(', ')}`
        }
      };
    }
    
    // Validate activity values
    const validActivity = ['Available', 'Away', 'BeRightBack', 'Busy', 'DoNotDisturb', 'InACall', 'InAConferenceCall', 'Inactive', 'InAMeeting', 'Offline', 'OffWork', 'OutOfOffice', 'PresenceUnknown', 'Presenting', 'UrgentInterruptionsOnly'];
    if (!validActivity.includes(activity)) {
      return {
        error: {
          code: -32602,
          message: `Invalid activity. Must be one of: ${validActivity.join(', ')}`
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the presence object
    const presenceData = {
      availability: availability,
      activity: activity,
      statusMessage: statusMessage
    };
    
    // Build the API path
    const apiPath = 'me/presence/setPresence';
    
    console.error(`Setting presence to: ${availability} / ${activity}`);
    
    // Make API call
    await callGraphAPI(accessToken, 'POST', apiPath, presenceData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Presence updated successfully!

**Availability:** ${availability}
**Activity:** ${activity}
**Status Message:** ${statusMessage || 'No status message'}

Your presence has been updated and is now visible to your colleagues.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleSetMyPresence:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to set presence: ${error.message}`
      }
    };
  }
}

/**
 * Get multiple users presence handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetMultipleUsersPresence(args) {
  try {
    const { userIds } = args;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return {
        error: {
          code: -32602,
          message: "User IDs array is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the request body
    const requestBody = {
      ids: userIds
    };
    
    // Build the API path
    const apiPath = 'communications/getPresencesByUserId';
    
    console.error(`Getting presence for ${userIds.length} users`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'POST', apiPath, requestBody);
    
    const presences = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found presence for ${presences.length} users:\n\n${presences.map(presence => {
            const getStatusIcon = (availability) => {
              switch (availability) {
                case 'Available': return '✅';
                case 'Busy': return '🔴';
                case 'Away': return '🟡';
                case 'DoNotDisturb': return '🔴';
                case 'BeRightBack': return '🟡';
                default: return '❓';
              }
            };
            
            return `👤 ${presence.id}
   ${getStatusIcon(presence.availability)} ${presence.availability || 'Unknown'}
   Activity: ${presence.activity || 'Unknown'}
   Status: ${presence.statusMessage || 'No status message'}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetMultipleUsersPresence:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get multiple users presence: ${error.message}`
      }
    };
  }
}

module.exports = {
  handleGetMyPresence,
  handleGetUserPresence,
  handleSetMyPresence,
  handleGetMultipleUsersPresence
};