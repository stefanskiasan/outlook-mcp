/**
 * Bulk read emails functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');
const config = require('../config');

/**
 * Bulk read emails handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleBulkReadEmails(args) {
  const emailIds = args.emailIds || '';
  const useBatch = args.useBatch !== false; // Default to true
  const maxEmails = args.maxEmails || 20; // Safety limit
  
  if (!emailIds) {
    return {
      content: [{ 
        type: "text", 
        text: "Email IDs are required. Please provide a comma-separated list of email IDs to read."
      }]
    };
  }
  
  try {
    // Get access token
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('bulk-read-emails');
    }
    
    // Parse email IDs
    const ids = emailIds.split(',').map(id => id.trim()).filter(id => id);
    
    if (ids.length === 0) {
      return {
        content: [{ 
          type: "text", 
          text: "No valid email IDs provided."
        }]
      };
    }
    
    // Safety check
    if (ids.length > maxEmails) {
      return {
        content: [{ 
          type: "text", 
          text: `Too many emails to read at once. Maximum allowed: ${maxEmails}. You provided: ${ids.length}`
        }]
      };
    }
    
    // Read emails using batch or sequential approach
    const result = useBatch && ids.length > 1
      ? await bulkReadEmailsBatch(accessToken, ids)
      : await bulkReadEmailsSequential(accessToken, ids);
    
    return {
      content: [{ 
        type: "text", 
        text: result.message
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: `Error reading emails: ${error.message}`
      }]
    };
  }
}

/**
 * Read emails using JSON batching for better performance
 * @param {string} accessToken - Access token
 * @param {Array<string>} emailIds - Array of email IDs to read
 * @returns {Promise<object>} - Result object with status and message
 */
async function bulkReadEmailsBatch(accessToken, emailIds) {
  try {
    // Prepare batch requests (max 20 per batch)
    const batchRequests = emailIds.map((emailId, index) => ({
      id: `read-${index}`,
      method: 'GET',
      url: `/me/messages/${emailId}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }));
    
    const batchBody = {
      requests: batchRequests
    };
    
    // Execute batch request
    const batchResponse = await callGraphAPI(accessToken, 'POST', '$batch', batchBody);
    
    // Process results
    const results = {
      successful: [],
      failed: []
    };
    
    if (batchResponse.responses) {
      for (const response of batchResponse.responses) {
        const emailIndex = parseInt(response.id.split('-')[1]);
        const emailId = emailIds[emailIndex];
        
        if (response.status === 200 && response.body) {
          // Successful read
          results.successful.push({
            id: emailId,
            email: response.body,
            index: emailIndex
          });
        } else {
          results.failed.push({
            id: emailId,
            error: response.body?.error?.message || `HTTP ${response.status}`,
            index: emailIndex
          });
        }
      }
    }
    
    return formatBulkReadResults(results, emailIds.length, 'batch');
  } catch (error) {
    console.error('Batch read failed, falling back to sequential read:', error.message);
    // Fallback to sequential read if batch fails
    return await bulkReadEmailsSequential(accessToken, emailIds);
  }
}

/**
 * Read emails sequentially (one by one)
 * @param {string} accessToken - Access token
 * @param {Array<string>} emailIds - Array of email IDs to read
 * @returns {Promise<object>} - Result object with status and message
 */
async function bulkReadEmailsSequential(accessToken, emailIds) {
  const results = {
    successful: [],
    failed: []
  };
  
  // Process each email one by one
  for (let i = 0; i < emailIds.length; i++) {
    const emailId = emailIds[i];
    try {
      const email = await callGraphAPI(
        accessToken, 
        'GET', 
        `me/messages/${emailId}`,
        null,
        { $select: config.EMAIL_DETAIL_FIELDS }
      );
      
      results.successful.push({
        id: emailId,
        email: email,
        index: i
      });
    } catch (error) {
      console.error(`Error reading email ${emailId}: ${error.message}`);
      results.failed.push({
        id: emailId,
        error: error.message,
        index: i
      });
    }
  }
  
  return formatBulkReadResults(results, emailIds.length, 'sequential');
}

/**
 * Format bulk read results into a readable message
 * @param {object} results - Results object with successful and failed arrays
 * @param {number} totalCount - Total number of emails processed
 * @param {string} method - Method used ('batch' or 'sequential')
 * @returns {object} - Formatted result object
 */
function formatBulkReadResults(results, totalCount, method) {
  let message = `📬 Bulk Read Results (${method} method): ${results.successful.length}/${totalCount} emails read successfully\n\n`;
  
  // Sort successful results by original index to maintain order
  const sortedSuccessful = results.successful.sort((a, b) => a.index - b.index);
  
  // Format successful emails
  if (sortedSuccessful.length > 0) {
    message += `✅ Successfully read ${sortedSuccessful.length} email(s):\n\n`;
    
    sortedSuccessful.forEach((result, displayIndex) => {
      const email = result.email;
      const sender = email.from ? 
        `${email.from.emailAddress.name} (${email.from.emailAddress.address})` : 
        'Unknown';
      const date = new Date(email.receivedDateTime).toLocaleString();
      const readStatus = email.isRead ? '' : '[UNREAD] ';
      const hasAttachments = email.hasAttachments ? '📎 ' : '';
      
      // Extract and clean body content
      let bodyContent = '';
      if (email.body) {
        bodyContent = email.body.contentType === 'html' ? 
          email.body.content.replace(/<[^>]*>/g, '').trim() : 
          email.body.content.trim();
      } else {
        bodyContent = email.bodyPreview || 'No content available';
      }
      
      // Limit body content to first 300 characters for readability
      if (bodyContent.length > 300) {
        bodyContent = bodyContent.substring(0, 300) + '...';
      }
      
      message += `${displayIndex + 1}. ${readStatus}${hasAttachments}**${email.subject}**\n`;
      message += `   From: ${sender}\n`;
      message += `   Date: ${date}\n`;
      message += `   ID: ${result.id}\n`;
      message += `   Content: ${bodyContent}\n\n`;
    });
  }
  
  // Format failed emails
  if (results.failed.length > 0) {
    message += `❌ Failed to read ${results.failed.length} email(s):\n`;
    
    // Sort failed results by original index
    const sortedFailed = results.failed.sort((a, b) => a.index - b.index);
    
    // Show first few errors with details
    const maxErrors = Math.min(sortedFailed.length, 3);
    for (let i = 0; i < maxErrors; i++) {
      const failure = sortedFailed[i];
      message += `- ${failure.id}: ${failure.error}\n`;
    }
    
    // If there are more errors, just mention the count
    if (sortedFailed.length > maxErrors) {
      message += `...and ${sortedFailed.length - maxErrors} more errors.\n`;
    }
    message += '\n';
  }
  
  // Add summary
  const successRate = Math.round((results.successful.length / totalCount) * 100);
  message += `📊 Summary: ${results.successful.length}/${totalCount} emails read successfully (${successRate}%)`;
  
  return {
    success: results.successful.length > 0,
    message,
    results
  };
}

module.exports = handleBulkReadEmails;