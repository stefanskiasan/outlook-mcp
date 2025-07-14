/**
 * Teams channels functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');
const config = require('../config');

/**
 * List channels handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListChannels(args) {
  try {
    const { teamId, count = config.DEFAULT_PAGE_SIZE } = args;
    
    if (!teamId) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID is required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('get-channel-details');
    }
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-channels');
    }
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.CHANNELS_SELECT_FIELDS,
      '$top': validCount,
      '$orderby': 'displayName asc'
    };
    
    console.error(`Fetching ${validCount} channels for team: ${teamId}`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const channels = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${channels.length} channels:\n\n${channels.map(channel => {
            const membershipType = channel.membershipType || 'standard';
            const description = channel.description || 'No description';
            const email = channel.email || 'No email';
            const created = channel.createdDateTime ? new Date(channel.createdDateTime).toLocaleString() : 'Unknown';
            
            return `📺 ${channel.displayName}
   ID: ${channel.id}
   Type: ${membershipType}
   Description: ${description}
   Email: ${email}
   Created: ${created}
   Web URL: ${channel.webUrl || 'Not available'}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleListChannels:', error);
    return {
      content: [{ 
        type: "text", 
        text: `Error listing channels: ${error.message}`
      }]
    };
  }
}

/**
 * Get channel details handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetChannelDetails(args) {
  try {
    const { teamId, channelId } = args;
    
    if (!teamId || !channelId) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID and Channel ID are required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('get-channel-details');
    }
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.CHANNELS_DETAIL_FIELDS
    };
    
    console.error(`Getting channel details: ${channelId} in team: ${teamId}`);
    
    // Make API call
    const channel = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    return {
      content: [
        {
          type: "text",
          text: `📺 Channel Details

**Name:** ${channel.displayName}
**Channel ID:** ${channel.id}
**Description:** ${channel.description || 'No description'}
**Type:** ${channel.membershipType || 'standard'}
**Email:** ${channel.email || 'No email available'}
**Created:** ${channel.createdDateTime ? new Date(channel.createdDateTime).toLocaleString() : 'Unknown'}
**Favorite by Default:** ${channel.isFavoriteByDefault ? 'Yes' : 'No'}

**Web URL:** ${channel.webUrl || 'Not available'}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetChannelDetails:', error);
    return {
      content: [{ 
        type: "text", 
        text: `Error getting channel details: ${error.message}`
      }]
    };
  }
}

/**
 * Create channel handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleCreateChannel(args) {
  try {
    const { teamId, displayName, description = '', membershipType = 'standard' } = args;
    
    if (!teamId || !displayName) {
      return {
        error: {
          code: -32602,
          message: "Team ID and display name are required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('get-channel-details');
    }
    
    // Build the channel object
    const channelData = {
      displayName,
      description,
      membershipType
    };
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels`;
    
    console.error(`Creating channel: ${displayName} in team: ${teamId}`);
    
    // Make API call
    const newChannel = await callGraphAPI(accessToken, 'POST', apiPath, channelData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Channel created successfully!

**Name:** ${newChannel.displayName}
**Channel ID:** ${newChannel.id}
**Type:** ${newChannel.membershipType}
**Description:** ${newChannel.description || 'No description'}
**Email:** ${newChannel.email || 'Email will be assigned'}
**Web URL:** ${newChannel.webUrl || 'URL will be available shortly'}

The channel has been created and is ready to use.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleCreateChannel:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to create channel: ${error.message}`
      }
    };
  }
}

/**
 * Update channel handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleUpdateChannel(args) {
  try {
    const { teamId, channelId, displayName, description } = args;
    
    if (!teamId || !channelId) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID and Channel ID are required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('get-channel-details');
    }
    
    // Build the update object (only include provided fields)
    const updateData = {};
    
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    
    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return {
        error: {
          code: -32602,
          message: "At least one field (displayName or description) must be provided to update"
        }
      };
    }
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}`;
    
    console.error(`Updating channel: ${channelId} in team: ${teamId}`);
    
    // Make API call
    const updatedChannel = await callGraphAPI(accessToken, 'PATCH', apiPath, updateData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Channel updated successfully!

**Name:** ${updatedChannel.displayName}
**Channel ID:** ${updatedChannel.id}
**Description:** ${updatedChannel.description || 'No description'}
**Type:** ${updatedChannel.membershipType}

The channel has been updated with the provided information.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleUpdateChannel:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to update channel: ${error.message}`
      }
    };
  }
}

/**
 * Delete channel handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleDeleteChannel(args) {
  try {
    const { teamId, channelId } = args;
    
    if (!teamId || !channelId) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID and Channel ID are required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('get-channel-details');
    }
    
    // First, get the channel details for confirmation
    const channelPath = `teams/${teamId}/channels/${channelId}`;
    let channelName = 'Unknown';
    
    try {
      const channel = await callGraphAPI(accessToken, 'GET', channelPath, null, { '$select': 'displayName' });
      channelName = channel.displayName || 'Unknown';
    } catch (error) {
      console.error('Could not retrieve channel for deletion:', error);
    }
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}`;
    
    console.error(`Deleting channel: ${channelId} (${channelName}) in team: ${teamId}`);
    
    // Make API call to delete the channel
    await callGraphAPI(accessToken, 'DELETE', apiPath);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Channel deleted successfully!

**Channel:** ${channelName}
**Channel ID:** ${channelId}
**Team ID:** ${teamId}

The channel has been permanently removed from the team.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleDeleteChannel:', error);
    
    // Handle specific error cases
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return {
        error: {
          code: -32603,
          message: `Channel not found: ${channelId}`
        }
      };
    }
    
    return {
      error: {
        code: -32603,
        message: `Failed to delete channel: ${error.message}`
      }
    };
  }
}

module.exports = {
  handleListChannels,
  handleGetChannelDetails,
  handleCreateChannel,
  handleUpdateChannel,
  handleDeleteChannel
};