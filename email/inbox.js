/**
 * Inbox-only email functionality
 */
const config = require('../config');
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');

/**
 * List inbox emails handler - exclusively searches inbox only
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListInboxEmails(args) {
  const count = Math.min(args.count || 10, config.MAX_RESULT_COUNT);
  const unreadOnly = args.unreadOnly === true;
  
  try {
    // Get access token
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-inbox-emails');
    }
    
    // Always use inbox endpoint - never other folders  
    const endpoint = 'me/mailFolders/inbox/messages';
    
    // Build query parameters
    const queryParams = {
      $top: count,
      $orderby: 'receivedDateTime desc',
      $select: config.EMAIL_SELECT_FIELDS
    };
    
    // Add unread filter if requested
    if (unreadOnly) {
      queryParams.$filter = 'isRead eq false';
    }
    
    // Make API call - always to inbox
    const response = await callGraphAPI(accessToken, 'GET', endpoint, null, queryParams);
    
    if (!response.value || response.value.length === 0) {
      const filterText = unreadOnly ? ' unread' : '';
      return {
        content: [{ 
          type: "text", 
          text: `No${filterText} emails found in your inbox.`
        }]
      };
    }
    
    // Format results
    const emailList = response.value.map((email, index) => {
      const sender = email.from ? email.from.emailAddress : { name: 'Unknown', address: 'unknown' };
      const date = new Date(email.receivedDateTime).toLocaleString();
      const readStatus = email.isRead ? '' : '[UNREAD] ';
      const hasAttachments = email.hasAttachments ? '📎 ' : '';
      
      return `${index + 1}. ${readStatus}${hasAttachments}${date} - From: ${sender.name} (${sender.address})
Subject: ${email.subject}
ID: ${email.id}
`;
    }).join("\n");
    
    const filterText = unreadOnly ? ' unread' : '';
    const folderEmoji = '📥';
    
    return {
      content: [{ 
        type: "text", 
        text: `${folderEmoji} Found ${response.value.length}${filterText} emails in your INBOX:\n\n${emailList}`
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: `Error listing inbox emails: ${error.message}`
      }]
    };
  }
}

/**
 * Search inbox emails handler - exclusively searches inbox only
 * @param {object} args - Tool arguments  
 * @returns {object} - MCP response
 */
async function handleSearchInboxEmails(args) {
  const count = Math.min(args.count || 10, config.MAX_RESULT_COUNT);
  const query = args.query || '';
  const from = args.from || '';
  const to = args.to || '';
  const subject = args.subject || '';
  const hasAttachments = args.hasAttachments;
  const unreadOnly = args.unreadOnly;
  const dateStart = args.dateStart || '';
  const dateEnd = args.dateEnd || '';
  
  if (!query && !from && !to && !subject && hasAttachments === undefined && !unreadOnly && !dateStart && !dateEnd) {
    return {
      content: [{ 
        type: "text", 
        text: "Please provide at least one search criteria (query, from, to, subject, hasAttachments, unreadOnly, dateStart, or dateEnd)."
      }]
    };
  }
  
  try {
    // Get access token
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('search-inbox-emails');
    }
    
    // Always use inbox endpoint - never other folders  
    const endpoint = 'me/mailFolders/inbox/messages';
    
    // Build search filters
    const filters = [];
    
    if (query) {
      // Search in subject and body
      filters.push(`(contains(subject,'${query.replace(/'/g, "''")}') or contains(body/content,'${query.replace(/'/g, "''")}))`);
    }
    
    if (from) {
      filters.push(`contains(from/emailAddress/address,'${from.replace(/'/g, "''")}') or contains(from/emailAddress/name,'${from.replace(/'/g, "''")}')`);
    }
    
    if (to) {
      filters.push(`contains(toRecipients/any(r:r/emailAddress/address),'${to.replace(/'/g, "''")}') or contains(toRecipients/any(r:r/emailAddress/name),'${to.replace(/'/g, "''")}')`);
    }
    
    if (subject) {
      filters.push(`contains(subject,'${subject.replace(/'/g, "''")}')`);
    }
    
    if (hasAttachments === true) {
      filters.push('hasAttachments eq true');
    } else if (hasAttachments === false) {
      filters.push('hasAttachments eq false');
    }
    
    if (unreadOnly) {
      filters.push('isRead eq false');
    }
    
    // Add date range filters
    if (dateStart) {
      try {
        const startDate = new Date(dateStart).toISOString();
        filters.push(`receivedDateTime ge ${startDate}`);
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Invalid dateStart format. Please use ISO date format (e.g., '2024-01-15' or '2024-01-15T10:00:00Z').`
          }]
        };
      }
    }
    
    if (dateEnd) {
      try {
        const endDate = new Date(dateEnd).toISOString();
        filters.push(`receivedDateTime le ${endDate}`);
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Invalid dateEnd format. Please use ISO date format (e.g., '2024-01-15' or '2024-01-15T23:59:59Z').`
          }]
        };
      }
    }
    
    // Build query parameters
    const queryParams = {
      $top: count,
      $orderby: 'receivedDateTime desc',
      $select: config.EMAIL_SELECT_FIELDS
    };
    
    if (filters.length > 0) {
      queryParams.$filter = filters.join(' and ');
    }
    
    // Make API call - always to inbox
    const response = await callGraphAPI(accessToken, 'GET', endpoint, null, queryParams);
    
    if (!response.value || response.value.length === 0) {
      return {
        content: [{ 
          type: "text", 
          text: `📥 No emails found in your INBOX matching the search criteria.`
        }]
      };
    }
    
    // Format results
    const emailList = response.value.map((email, index) => {
      const sender = email.from ? email.from.emailAddress : { name: 'Unknown', address: 'unknown' };
      const date = new Date(email.receivedDateTime).toLocaleString();
      const readStatus = email.isRead ? '' : '[UNREAD] ';
      const hasAttachments = email.hasAttachments ? '📎 ' : '';
      
      return `${index + 1}. ${readStatus}${hasAttachments}${date} - From: ${sender.name} (${sender.address})
Subject: ${email.subject}
ID: ${email.id}
`;
    }).join("\n");
    
    return {
      content: [{ 
        type: "text", 
        text: `📥 Found ${response.value.length} emails in your INBOX matching search criteria:\n\n${emailList}`
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: `Error searching inbox emails: ${error.message}`
      }]
    };
  }
}

module.exports = {
  handleListInboxEmails,
  handleSearchInboxEmails
};