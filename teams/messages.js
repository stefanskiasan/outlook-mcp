/**
 * Teams messages functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');
const config = require('../config');

/**
 * List channel messages handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListChannelMessages(args) {
  try {
    const { teamId, channelId, count = config.DEFAULT_PAGE_SIZE } = args;
    
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
      return await createAuthRequiredResponse('list-channel-messages');
    }
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}/messages`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.MESSAGES_SELECT_FIELDS,
      '$top': validCount,
      '$orderby': 'createdDateTime desc'
    };
    
    console.error(`Fetching ${validCount} messages from channel: ${channelId}`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const messages = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${messages.length} messages:\n\n${messages.map(message => {
            const from = message.from && message.from.user ? 
              (message.from.user.displayName || message.from.user.id) : 'Unknown';
            const created = message.createdDateTime ? 
              new Date(message.createdDateTime).toLocaleString() : 'Unknown';
            const messageType = message.messageType || 'message';
            const importance = message.importance || 'normal';
            const hasAttachments = message.attachments && message.attachments.length > 0;
            const hasMentions = message.mentions && message.mentions.length > 0;
            
            let content = 'No content';
            if (message.body && message.body.content) {
              content = message.body.content.length > 150 ? 
                message.body.content.substring(0, 150) + '...' : 
                message.body.content;
            }
            
            return `💬 ${messageType.toUpperCase()}
   ID: ${message.id}
   From: ${from}
   Created: ${created}
   Importance: ${importance}
   ${hasAttachments ? '📎 Has attachments' : ''}${hasMentions ? ' 🔔 Has mentions' : ''}
   Content: ${content.replace(/<[^>]*>/g, '')}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleListChannelMessages:', error);
    return {
      content: [{ 
        type: "text", 
        text: `Error listing channel messages: ${error.message}`
      }]
    };
  }
}

/**
 * Get message details handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetMessageDetails(args) {
  try {
    const { teamId, channelId, messageId } = args;
    
    if (!teamId || !channelId || !messageId) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID, Channel ID, and Message ID are required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-channel-messages');
    }
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}/messages/${messageId}`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.MESSAGES_DETAIL_FIELDS
    };
    
    console.error(`Getting message details: ${messageId}`);
    
    // Make API call
    const message = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    // Format the response
    const from = message.from && message.from.user ? 
      (message.from.user.displayName || message.from.user.id) : 'Unknown';
    const created = message.createdDateTime ? 
      new Date(message.createdDateTime).toLocaleString() : 'Unknown';
    const modified = message.lastModifiedDateTime ? 
      new Date(message.lastModifiedDateTime).toLocaleString() : 'Not modified';
    
    const formatAttachments = (attachments) => {
      if (!attachments || attachments.length === 0) return 'None';
      return attachments.map(att => `${att.name} (${att.contentType})`).join(', ');
    };
    
    const formatMentions = (mentions) => {
      if (!mentions || mentions.length === 0) return 'None';
      return mentions.map(mention => mention.mentioned.user.displayName).join(', ');
    };
    
    let content = 'No content';
    if (message.body && message.body.content) {
      content = message.body.content.replace(/<[^>]*>/g, '');
    }
    
    return {
      content: [
        {
          type: "text",
          text: `💬 Message Details

**Message ID:** ${message.id}
**Type:** ${message.messageType || 'message'}
**From:** ${from}
**Created:** ${created}
**Last Modified:** ${modified}
**Importance:** ${message.importance || 'normal'}
**Locale:** ${message.locale || 'Not specified'}
**Subject:** ${message.subject || 'No subject'}

**Content:**
${content}

**Attachments:** ${formatAttachments(message.attachments)}
**Mentions:** ${formatMentions(message.mentions)}

**Web URL:** ${message.webUrl || 'Not available'}
**Reply To:** ${message.replyToId || 'Not a reply'}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetMessageDetails:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get message details: ${error.message}`
      }
    };
  }
}

/**
 * Send channel message handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleSendChannelMessage(args) {
  try {
    const { teamId, channelId, content, contentType = 'html', subject = '', importance = 'normal' } = args;
    
    if (!teamId || !channelId || !content) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID, Channel ID, and content are required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-channel-messages');
    }
    
    // Build the message object
    const messageData = {
      body: {
        contentType: contentType,
        content: content
      },
      importance: importance
    };
    
    // Add subject if provided
    if (subject) {
      messageData.subject = subject;
    }
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}/messages`;
    
    console.error(`Sending message to channel: ${channelId}`);
    
    // Make API call
    const newMessage = await callGraphAPI(accessToken, 'POST', apiPath, messageData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Message sent successfully!

**Message ID:** ${newMessage.id}
**Channel ID:** ${channelId}
**Team ID:** ${teamId}
**Created:** ${newMessage.createdDateTime ? new Date(newMessage.createdDateTime).toLocaleString() : 'Just now'}
**Importance:** ${newMessage.importance}
**Subject:** ${newMessage.subject || 'No subject'}

The message has been posted to the channel.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleSendChannelMessage:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to send message: ${error.message}`
      }
    };
  }
}

/**
 * Reply to message handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleReplyToMessage(args) {
  try {
    const { teamId, channelId, messageId, content, contentType = 'html' } = args;
    
    if (!teamId || !channelId || !messageId || !content) {
      return {
        content: [{ 
          type: "text", 
          text: "Team ID, Channel ID, Message ID, and content are required"
        }]
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-channel-messages');
    }
    
    // Build the reply object
    const replyData = {
      body: {
        contentType: contentType,
        content: content
      }
    };
    
    // Build the API path
    const apiPath = `teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`;
    
    console.error(`Replying to message: ${messageId}`);
    
    // Make API call
    const reply = await callGraphAPI(accessToken, 'POST', apiPath, replyData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Reply sent successfully!

**Reply ID:** ${reply.id}
**Original Message ID:** ${messageId}
**Channel ID:** ${channelId}
**Team ID:** ${teamId}
**Created:** ${reply.createdDateTime ? new Date(reply.createdDateTime).toLocaleString() : 'Just now'}

The reply has been posted to the channel.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleReplyToMessage:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to reply to message: ${error.message}`
      }
    };
  }
}

module.exports = {
  handleListChannelMessages,
  handleGetMessageDetails,
  handleSendChannelMessage,
  handleReplyToMessage
};