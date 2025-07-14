/**
 * Authentication wrapper utility
 * Provides a wrapper function that handles authentication gracefully for all tools
 */
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');

/**
 * Wraps a tool handler to handle authentication gracefully
 * @param {string} toolName - Name of the tool (for error messages)
 * @param {function} handler - The original tool handler function
 * @returns {function} - Wrapped handler that checks authentication first
 */
function withAuthCheck(toolName, handler) {
  return async function(args) {
    try {
      // Check authentication first
      const accessToken = await ensureAuthenticated();
      
      // If no token, return friendly auth required message
      if (!accessToken) {
        return await createAuthRequiredResponse(toolName);
      }
      
      // Token exists, proceed with original handler
      return await handler(args, accessToken);
    } catch (error) {
      // Handle any other errors
      return {
        content: [{
          type: "text",
          text: `Error in ${toolName}: ${error.message}`
        }]
      };
    }
  };
}

module.exports = {
  withAuthCheck
};