/**
 * Authentication-related tools for the Outlook MCP server
 */
const config = require('../config');
const tokenManager = require('./token-manager');

/**
 * About tool handler
 * @returns {object} - MCP response
 */
async function handleAbout() {
  return {
    content: [{
      type: "text",
      text: `📧 MODULAR Outlook Assistant MCP Server v${config.SERVER_VERSION} 📧\n\nProvides access to Microsoft Outlook email, calendar, and contacts through Microsoft Graph API.\nImplemented with a modular architecture for improved maintainability.`
    }]
  };
}

/**
 * Authentication tool handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleAuthenticate(args) {
  const force = args && args.force === true;
  
  // For test mode, create a test token
  if (config.USE_TEST_MODE) {
    // Create a test token with a 1-hour expiry
    tokenManager.createTestTokens();
    
    return {
      content: [{
        type: "text",
        text: 'Successfully authenticated with Microsoft Graph API (test mode)'
      }]
    };
  }
  
  // For real authentication, start the auth server, open browser, and wait for completion
  const authUrl = `${config.AUTH_CONFIG.authServerUrl}/auth?client_id=${config.AUTH_CONFIG.clientId}`;
  
  try {
    // Import required modules
    const { exec } = require('child_process');
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    // Start the auth server
    const authServerPath = path.join(__dirname, '../outlook-auth-server.js');
    console.error('Starting authentication server...');
    
    const authServer = spawn('node', [authServerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });
    
    // Handle server output
    authServer.stdout.on('data', (data) => {
      console.error('Auth server:', data.toString());
    });
    
    authServer.stderr.on('data', (data) => {
      console.error('Auth server error:', data.toString());
    });
    
    // Wait for server to start (check if port is listening)
    let serverReady = false;
    const maxStartTime = 3000; // 3 seconds max to start
    let startTime = 0;
    
    while (!serverReady && startTime < maxStartTime) {
      try {
        const http = require('http');
        const req = http.request({
          hostname: 'localhost',
          port: 3333,
          path: '/token-status',
          method: 'GET',
          timeout: 1000
        }, (res) => {
          serverReady = true;
        });
        
        req.on('error', () => {
          // Server not ready yet
        });
        
        req.end();
        
        if (!serverReady) {
          await new Promise(resolve => setTimeout(resolve, 200));
          startTime += 200;
        }
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 200));
        startTime += 200;
      }
    }
    
    if (!serverReady) {
      authServer.kill('SIGTERM');
      throw new Error('Authentication server failed to start within 3 seconds');
    }
    
    console.error('Authentication server is ready');
    
    // Open browser automatically
    const openCommand = process.platform === 'darwin' ? 'open' : 
                       process.platform === 'win32' ? 'start' : 'xdg-open';
    
    console.error('Opening browser automatically...');
    exec(`${openCommand} "${authUrl}"`, (error) => {
      if (error) {
        console.error('Failed to open browser:', error);
      }
    });
    
    // Wait for authentication to complete (check for token file)
    const tokenPath = config.AUTH_CONFIG.tokenStorePath;
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 500; // Check every 500ms
    let waitTime = 0;
    
    console.error('Waiting for authentication to complete...');
    
    while (waitTime < maxWaitTime) {
      // Check if token file exists and has valid content
      if (fs.existsSync(tokenPath)) {
        try {
          const tokenData = fs.readFileSync(tokenPath, 'utf8');
          const tokens = JSON.parse(tokenData);
          
          if (tokens.access_token && tokens.expires_at > Date.now()) {
            // Authentication successful
            authServer.kill('SIGTERM');
            
            return {
              content: [{
                type: "text",
                text: '🎉 Authentication successful! Browser opened automatically and authentication completed.\n\nYou can now use all Outlook and Teams tools.'
              }]
            };
          }
        } catch (e) {
          // Token file exists but is not valid yet, continue waiting
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waitTime += checkInterval;
    }
    
    // Timeout reached
    authServer.kill('SIGTERM');
    
    return {
      content: [{
        type: "text",
        text: `⏰ Authentication timeout after 10 seconds.\n\nThe browser should have opened automatically with this URL:\n${authUrl}\n\nIf the browser didn't open or you need more time, please visit the URL manually and complete the authentication process.`
      }]
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    return {
      content: [{
        type: "text",
        text: `❌ Authentication failed: ${error.message}\n\nPlease try again or visit this URL manually: ${authUrl}`
      }]
    };
  }
}

/**
 * Check authentication status tool handler
 * @returns {object} - MCP response
 */
async function handleCheckAuthStatus() {
  console.error('[CHECK-AUTH-STATUS] Starting authentication status check');
  
  const tokens = tokenManager.loadTokenCache();
  
  console.error(`[CHECK-AUTH-STATUS] Tokens loaded: ${tokens ? 'YES' : 'NO'}`);
  
  if (!tokens || !tokens.access_token) {
    console.error('[CHECK-AUTH-STATUS] No valid access token found');
    return {
      content: [{ type: "text", text: "Not authenticated" }]
    };
  }
  
  console.error('[CHECK-AUTH-STATUS] Access token present');
  console.error(`[CHECK-AUTH-STATUS] Token expires at: ${tokens.expires_at}`);
  console.error(`[CHECK-AUTH-STATUS] Current time: ${Date.now()}`);
  
  return {
    content: [{ type: "text", text: "Authenticated and ready" }]
  };
}

// Tool definitions
const authTools = [
  {
    name: "about",
    description: "Returns information about this Outlook Assistant server",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    handler: handleAbout
  },
  {
    name: "authenticate",
    description: "Authenticate with Microsoft Graph API to access Outlook data",
    inputSchema: {
      type: "object",
      properties: {
        force: {
          type: "boolean",
          description: "Force re-authentication even if already authenticated"
        }
      },
      required: []
    },
    handler: handleAuthenticate
  },
  {
    name: "check-auth-status",
    description: "Check the current authentication status with Microsoft Graph API",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    handler: handleCheckAuthStatus
  }
];

module.exports = {
  authTools,
  handleAbout,
  handleAuthenticate,
  handleCheckAuthStatus
};
