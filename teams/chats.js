/**
 * Teams chats functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated } = require('../auth');
const config = require('../config');

/**
 * List chats handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListChats(args) {
  try {
    const { count = config.DEFAULT_PAGE_SIZE, chatType = 'all' } = args;
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = 'me/chats';
    
    // Build query parameters
    const queryParams = {
      '$select': config.CHAT_SELECT_FIELDS,
      '$top': validCount,
      '$orderby': 'lastUpdatedDateTime desc'
    };
    
    // Add chat type filter if specified
    if (chatType !== 'all') {
      queryParams['$filter'] = `chatType eq '${chatType}'`;
    }
    
    console.error(`Fetching ${validCount} chats`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const chats = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${chats.length} chats:\n\n${chats.map(chat => {
            const topic = chat.topic || 'No topic';
            const chatType = chat.chatType || 'Unknown';
            const created = chat.createdDateTime ? 
              new Date(chat.createdDateTime).toLocaleString() : 'Unknown';
            const lastUpdated = chat.lastUpdatedDateTime ? 
              new Date(chat.lastUpdatedDateTime).toLocaleString() : 'Unknown';
            
            return `💬 ${topic}
   ID: ${chat.id}
   Type: ${chatType}
   Created: ${created}
   Last Updated: ${lastUpdated}
   Web URL: ${chat.webUrl || 'Not available'}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleListChats:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to list chats: ${error.message}`
      }
    };
  }
}

/**
 * Get chat details handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetChatDetails(args) {
  try {
    const { chatId } = args;
    
    if (!chatId) {
      return {
        error: {
          code: -32602,
          message: "Chat ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the API path
    const apiPath = `chats/${chatId}`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.CHAT_DETAIL_FIELDS
    };
    
    console.error(`Getting chat details: ${chatId}`);
    
    // Make API call
    const chat = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const created = chat.createdDateTime ? 
      new Date(chat.createdDateTime).toLocaleString() : 'Unknown';
    const lastUpdated = chat.lastUpdatedDateTime ? 
      new Date(chat.lastUpdatedDateTime).toLocaleString() : 'Unknown';
    
    return {
      content: [
        {
          type: "text",
          text: `💬 Chat Details

**Topic:** ${chat.topic || 'No topic'}
**Chat ID:** ${chat.id}
**Type:** ${chat.chatType || 'Unknown'}
**Created:** ${created}
**Last Updated:** ${lastUpdated}
**Tenant ID:** ${chat.tenantId || 'Not available'}

**Online Meeting Info:** ${chat.onlineMeetingInfo ? 'Available' : 'Not available'}
**Web URL:** ${chat.webUrl || 'Not available'}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetChatDetails:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get chat details: ${error.message}`
      }
    };
  }
}

/**
 * List chat messages handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListChatMessages(args) {
  try {
    const { chatId, count = config.DEFAULT_PAGE_SIZE } = args;
    
    if (!chatId) {
      return {
        error: {
          code: -32602,
          message: "Chat ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = `chats/${chatId}/messages`;
    
    // Build query parameters
    const queryParams = {
      '$select': config.MESSAGES_SELECT_FIELDS,
      '$top': validCount,
      '$orderby': 'createdDateTime desc'
    };
    
    console.error(`Fetching ${validCount} messages from chat: ${chatId}`);
    
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
    console.error('Error in handleListChatMessages:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to list chat messages: ${error.message}`
      }
    };
  }
}

/**
 * Send chat message handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleSendChatMessage(args) {
  try {
    const { chatId, content, contentType = 'html', importance = 'normal' } = args;
    
    if (!chatId || !content) {
      return {
        error: {
          code: -32602,
          message: "Chat ID and content are required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the message object
    const messageData = {
      body: {
        contentType: contentType,
        content: content
      },
      importance: importance
    };
    
    // Build the API path
    const apiPath = `chats/${chatId}/messages`;
    
    console.error(`Sending message to chat: ${chatId}`);
    
    // Make API call
    const newMessage = await callGraphAPI(accessToken, 'POST', apiPath, messageData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Message sent successfully!

**Message ID:** ${newMessage.id}
**Chat ID:** ${chatId}
**Created:** ${newMessage.createdDateTime ? new Date(newMessage.createdDateTime).toLocaleString() : 'Just now'}
**Importance:** ${newMessage.importance}

The message has been sent to the chat.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleSendChatMessage:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to send chat message: ${error.message}`
      }
    };
  }
}

/**
 * Create chat handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleCreateChat(args) {
  try {
    const { members, topic = '', chatType = 'group' } = args;
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      return {
        error: {
          code: -32602,
          message: "Members array with at least one member is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the chat object
    const chatData = {
      chatType: chatType,
      members: members.map(member => ({
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        roles: ['owner'],
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${member}')`
      }))
    };
    
    // Add topic if provided
    if (topic) {
      chatData.topic = topic;
    }
    
    // Build the API path
    const apiPath = 'chats';
    
    console.error(`Creating chat with ${members.length} members`);
    
    // Make API call
    const newChat = await callGraphAPI(accessToken, 'POST', apiPath, chatData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Chat created successfully!

**Chat ID:** ${newChat.id}
**Type:** ${newChat.chatType}
**Topic:** ${newChat.topic || 'No topic'}
**Created:** ${newChat.createdDateTime ? new Date(newChat.createdDateTime).toLocaleString() : 'Just now'}
**Members:** ${members.length}

The chat has been created and is ready to use.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleCreateChat:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to create chat: ${error.message}`
      }
    };
  }
}

module.exports = {
  handleListChats,
  handleGetChatDetails,
  handleListChatMessages,
  handleSendChatMessage,
  handleCreateChat
};