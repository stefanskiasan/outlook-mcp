/**
 * Bulk delete emails functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');
const config = require('../config');

/**
 * Bulk delete emails handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleBulkDeleteEmails(args) {
  const emailIds = args.emailIds || '';
  const useBatch = args.useBatch !== false; // Default to true
  const maxEmails = args.maxEmails || 20; // Safety limit
  
  if (!emailIds) {
    return {
      content: [{ 
        type: "text", 
        text: "Email IDs are required. Please provide a comma-separated list of email IDs to delete."
      }]
    };
  }
  
  try {
    // Get access token
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('bulk-delete-emails');
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
          text: `Too many emails to delete at once. Maximum allowed: ${maxEmails}. You provided: ${ids.length}`
        }]
      };
    }
    
    // Confirmation warning for bulk delete
    if (ids.length > 5) {
      console.warn(`⚠️  WARNING: Bulk deleting ${ids.length} emails - this action cannot be undone!`);
    }
    
    // Delete emails using batch or sequential approach
    const result = useBatch && ids.length > 1
      ? await bulkDeleteEmailsBatch(accessToken, ids)
      : await bulkDeleteEmailsSequential(accessToken, ids);
    
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
        text: `Error deleting emails: ${error.message}`
      }]
    };
  }
}

/**
 * Delete emails using JSON batching for better performance
 * @param {string} accessToken - Access token
 * @param {Array<string>} emailIds - Array of email IDs to delete
 * @returns {Promise<object>} - Result object with status and message
 */
async function bulkDeleteEmailsBatch(accessToken, emailIds) {
  try {
    // Prepare batch requests (max 20 per batch)
    const batchRequests = emailIds.map((emailId, index) => ({
      id: `delete-${index}`,
      method: 'DELETE',
      url: `/me/messages/${emailId}`
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
        
        if (response.status === 204) {
          // 204 No Content = successful deletion
          results.successful.push(emailId);
        } else {
          results.failed.push({
            id: emailId,
            error: response.body?.error?.message || `HTTP ${response.status}`
          });
        }
      }
    }
    
    return formatBulkDeleteResults(results, emailIds.length, 'batch');
  } catch (error) {
    console.error('Batch delete failed, falling back to sequential delete:', error.message);
    // Fallback to sequential delete if batch fails
    return await bulkDeleteEmailsSequential(accessToken, emailIds);
  }
}

/**
 * Delete emails sequentially (one by one)
 * @param {string} accessToken - Access token
 * @param {Array<string>} emailIds - Array of email IDs to delete
 * @returns {Promise<object>} - Result object with status and message
 */
async function bulkDeleteEmailsSequential(accessToken, emailIds) {
  const results = {
    successful: [],
    failed: []
  };
  
  // Process each email one by one
  for (const emailId of emailIds) {
    try {
      await callGraphAPI(accessToken, 'DELETE', `me/messages/${emailId}`);
      results.successful.push(emailId);
    } catch (error) {
      console.error(`Error deleting email ${emailId}: ${error.message}`);
      results.failed.push({
        id: emailId,
        error: error.message
      });
    }
  }
  
  return formatBulkDeleteResults(results, emailIds.length, 'sequential');
}

/**
 * Format bulk delete results into a readable message
 * @param {object} results - Results object with successful and failed arrays
 * @param {number} totalCount - Total number of emails processed
 * @param {string} method - Method used ('batch' or 'sequential')
 * @returns {object} - Formatted result object
 */
function formatBulkDeleteResults(results, totalCount, method) {
  let message = `🗑️  Bulk delete operation completed (${method} method):\n\n`;
  
  if (results.successful.length > 0) {
    message += `✅ Successfully deleted ${results.successful.length} email(s)`;
    if (results.successful.length <= 5) {
      message += `:\n${results.successful.map(id => `- ${id}`).join('\n')}`;
    }
    message += '\n\n';
  }
  
  if (results.failed.length > 0) {
    message += `❌ Failed to delete ${results.failed.length} email(s):`;
    
    // Show first few errors with details
    const maxErrors = Math.min(results.failed.length, 3);
    for (let i = 0; i < maxErrors; i++) {
      const failure = results.failed[i];
      message += `\n- ${failure.id}: ${failure.error}`;
    }
    
    // If there are more errors, just mention the count
    if (results.failed.length > maxErrors) {
      message += `\n...and ${results.failed.length - maxErrors} more errors.`;
    }
  }
  
  // Add summary
  const successRate = Math.round((results.successful.length / totalCount) * 100);
  message += `\n📊 Summary: ${results.successful.length}/${totalCount} emails deleted successfully (${successRate}%)`;
  
  return {
    success: results.successful.length > 0,
    message,
    results
  };
}

module.exports = handleBulkDeleteEmails;