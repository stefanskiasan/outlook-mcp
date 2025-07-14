/**
 * Authentication module for Outlook MCP server
 */
const tokenManager = require('./token-manager');
const { authTools } = require('./tools');

/**
 * Ensures the user is authenticated and returns an access token
 * @param {boolean} forceNew - Whether to force a new authentication
 * @returns {Promise<string|null>} - Access token or null if not authenticated
 */
async function ensureAuthenticated(forceNew = false) {
  if (forceNew) {
    // Force re-authentication
    return null;
  }
  
  // Check for existing token
  const accessToken = tokenManager.getAccessToken();
  if (!accessToken) {
    return null;
  }
  
  return accessToken;
}

/**
 * Checks if user is authenticated
 * @returns {boolean} - Whether user is authenticated
 */
function isAuthenticated() {
  const accessToken = tokenManager.getAccessToken();
  return !!accessToken;
}

/**
 * Creates a standardized authentication required response and triggers authentication automatically
 * @param {string} toolName - Name of the tool being called
 * @returns {object} - MCP response indicating authentication is required
 */
async function createAuthRequiredResponse(toolName) {
  const config = require('../config');
  
  // For test mode, create test tokens automatically
  if (config.USE_TEST_MODE) {
    tokenManager.createTestTokens();
    return {
      content: [
        {
          type: "text",
          text: `🔐 **Authentication completed automatically (test mode)**

Authentication has been set up for test mode. You can now use the \`${toolName}\` tool and all other Outlook and Teams tools.

**Available tools include:**
• Email management
• Calendar operations
• Contacts management
• Tasks integration
• Teams collaboration
• And much more!

Try running the \`${toolName}\` tool again.`
        }
      ]
    };
  }
  
  // For real authentication, generate an auth URL
  const authUrl = `${config.AUTH_CONFIG.authServerUrl}/auth?client_id=${config.AUTH_CONFIG.clientId}`;
  
  return {
    content: [
      {
        type: "text",
        text: `🔐 **Authentication Required**

To use the \`${toolName}\` tool, you need to authenticate with Microsoft first.

**Please visit this URL to authenticate:**
${authUrl}

**Steps:**
1. Click on the URL above or copy it to your browser
2. Sign in with your Microsoft account
3. Grant the necessary permissions
4. Once authenticated, you'll be redirected back and can use all tools

After authentication, you'll have access to all 72+ tools including:
• Email management
• Calendar operations
• Contacts management
• Tasks integration
• Teams collaboration
• And much more!

Try running the \`${toolName}\` tool again after authentication.`
      }
    ]
  };
}

module.exports = {
  tokenManager,
  authTools,
  ensureAuthenticated,
  isAuthenticated,
  createAuthRequiredResponse
};
