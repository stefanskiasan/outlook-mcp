/**
 * Teams management functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');
const config = require('../config');

/**
 * List teams handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListTeams(args) {
  try {
    const { count = config.DEFAULT_PAGE_SIZE } = args;
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-teams');
    }
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = 'me/joinedTeams';
    
    // Build query parameters
    const queryParams = {
      '$select': config.TEAMS_SELECT_FIELDS,
      '$top': validCount,
      '$orderby': 'displayName asc'
    };
    
    console.error(`Fetching ${validCount} teams`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const teams = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${teams.length} teams:\n\n${teams.map(team => {
            const visibility = team.visibility || 'Unknown';
            const description = team.description || 'No description';
            const messagingSettings = team.messagingSettings || {};
            const memberSettings = team.memberSettings || {};
            
            return `🏢 ${team.displayName}
   ID: ${team.id}
   Visibility: ${visibility}
   Description: ${description}
   Messaging: ${messagingSettings.allowUserEditMessages ? 'Edit allowed' : 'Edit restricted'}
   Members: ${memberSettings.allowCreateUpdateChannels ? 'Can create channels' : 'Channel creation restricted'}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleListTeams:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to list teams: ${error.message}`
      }
    };
  }
}

/**
 * Get team details handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetTeamDetails(args) {
  try {
    const { teamId } = args;
    
    if (!teamId) {
      return {
        error: {
          code: -32602,
          message: "Team ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('get-team-details');
    }
    
    // Build the API path
    const apiPath = `teams/${teamId}`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.TEAMS_DETAIL_FIELDS
    };
    
    console.error(`Getting team details: ${teamId}`);
    
    // Make API call
    const team = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const formatSettings = (settings) => {
      if (!settings) return 'Not configured';
      return Object.entries(settings)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    };
    
    return {
      content: [
        {
          type: "text",
          text: `🏢 Team Details

**Name:** ${team.displayName}
**Team ID:** ${team.id}
**Description:** ${team.description || 'No description'}
**Visibility:** ${team.visibility || 'Unknown'}
**Created:** ${team.createdDateTime ? new Date(team.createdDateTime).toLocaleString() : 'Unknown'}

**Settings:**
• Member Settings: ${formatSettings(team.memberSettings)}
• Guest Settings: ${formatSettings(team.guestSettings)}
• Messaging Settings: ${formatSettings(team.messagingSettings)}
• Fun Settings: ${formatSettings(team.funSettings)}
• Discovery Settings: ${formatSettings(team.discoverySettings)}

**Internal ID:** ${team.internalId || 'Not available'}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetTeamDetails:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get team details: ${error.message}`
      }
    };
  }
}

/**
 * List team members handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListTeamMembers(args) {
  try {
    const { teamId, count = config.DEFAULT_PAGE_SIZE } = args;
    
    if (!teamId) {
      return {
        error: {
          code: -32602,
          message: "Team ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-team-members');
    }
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = `teams/${teamId}/members`;
    
    // Build query parameters
    const queryParams = {
      '$select': 'id,displayName,email,roles,userId,tenantId',
      '$top': validCount,
      '$orderby': 'displayName asc'
    };
    
    console.error(`Fetching ${validCount} team members for team: ${teamId}`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const members = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${members.length} team members:\n\n${members.map(member => {
            const roles = member.roles && member.roles.length > 0 ? member.roles.join(', ') : 'Member';
            const email = member.email || 'No email';
            
            return `👤 ${member.displayName}
   ID: ${member.id}
   Email: ${email}
   Roles: ${roles}
   User ID: ${member.userId || 'Unknown'}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleListTeamMembers:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to list team members: ${error.message}`
      }
    };
  }
}

module.exports = {
  handleListTeams,
  handleGetTeamDetails,
  handleListTeamMembers
};