/**
 * List emails functionality
 */
const config = require('../config');
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');

/**
 * List emails handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListEmails(args) {
  const folder = args.folder || "inbox";
  const count = Math.min(args.count || 10, config.MAX_RESULT_COUNT);
  
  try {
    // Get access token
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-emails');
    }
    
    // Build API endpoint
    let endpoint = 'me/messages';
    if (folder.toLowerCase() !== 'inbox') {
      // Get folder ID first if not inbox
      const folderResponse = await callGraphAPI(
        accessToken, 
        'GET', 
        `me/mailFolders?$filter=displayName eq '${folder}'`
      );
      
      if (folderResponse.value && folderResponse.value.length > 0) {
        endpoint = `me/mailFolders/${folderResponse.value[0].id}/messages`;
      }
    }
    
    // Add query parameters
    const queryParams = {
      $top: count,
      $orderby: 'receivedDateTime desc',
      $select: config.EMAIL_SELECT_FIELDS
    };
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', endpoint, null, queryParams);
    
    if (!response.value || response.value.length === 0) {
      return {
        content: [{ 
          type: "text", 
          text: `No emails found in ${folder}.`
        }]
      };
    }
    
    // Format results
    const emailList = response.value.map((email, index) => {
      const sender = email.from ? email.from.emailAddress : { name: 'Unknown', address: 'unknown' };
      const date = new Date(email.receivedDateTime).toLocaleString();
      const readStatus = email.isRead ? '' : '[UNREAD] ';
      
      return `${index + 1}. ${readStatus}${date} - From: ${sender.name} (${sender.address})\nSubject: ${email.subject}\nID: ${email.id}\n`;
    }).join("\n");
    
    return {
      content: [{ 
        type: "text", 
        text: `Found ${response.value.length} emails in ${folder}:\n\n${emailList}`
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: `Error listing emails: ${error.message}`
      }]
    };
  }
}

module.exports = handleListEmails;
