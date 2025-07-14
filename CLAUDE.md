# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Developed by Asan Stefanski**

This is a comprehensive Model Context Protocol (MCP) server that provides Claude with full access to Microsoft Outlook and Microsoft Teams through the Microsoft Graph API. The server is structured as a modular Node.js application that handles authentication, email, calendar, contacts, tasks, teams, folders, and rules operations.

The server provides 75+ tools across 8 modules, making it one of the most comprehensive Microsoft 365 integrations available for Claude.

## Publishing Information

**npm Package**: `outlook-mcp`
**GitHub**: https://github.com/stefanskiasan/outlook-mcp
**Author**: Asan Stefanski (stefanskiasan)
**License**: MIT
**Version**: 2.0.0

### Installation for Users
```bash
npm install -g outlook-mcp
```

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "outlook-mcp": {
      "command": "npx",
      "args": ["outlook-mcp"],
      "env": {
        "MS_CLIENT_ID": "your-azure-client-id-here",
        "MS_CLIENT_SECRET": "your-azure-client-secret-here"
      }
    }
  }
}
```

## Development Commands

### Starting the Server
- `npm start` - Start the main MCP server
- `npm run auth-server` - Start the authentication server on port 3333
- `npm run test-mode` - Start server in test mode (uses mock data)
- `npm run inspect` - Start server with MCP Inspector for debugging

### Testing
- `npm test` - Run Jest tests
- `./test-modular-server.sh` - Test server using MCP Inspector
- `./test-direct.sh` - Direct server testing

### Debugging
- `node debug-env.js` - Debug environment variables
- `node test-config.js` - Test configuration loading

## Architecture

### Core Components

**Main Entry Point (`index.js`)**
- Combines all module tools into a single MCP server
- Handles MCP protocol methods (initialize, tools/list, tools/call)
- Uses fallback request handler pattern for all requests

**Configuration (`config.js`)**
- Centralizes all server configuration
- Manages test mode settings
- Defines API endpoints and field selections
- Token storage path and authentication settings

**Graph API Helper (`utils/graph-api.js`)**
- Handles all Microsoft Graph API calls
- Manages OData filter encoding for search queries
- Supports both real API calls and test mode simulation
- Handles authentication errors and token refresh

### Module Structure

Each functional area (auth, email, calendar, contacts, tasks, teams, folder, rules) follows this pattern:
- `index.js` - Exports tool definitions and handlers
- Individual handler files for each tool (e.g., `list.js`, `create.js`)
- Tools are defined with name, description, inputSchema, and handler function

**Authentication Module (`auth/`)**
- `token-manager.js` - Token storage and refresh logic
- `token-storage.js` - File-based token persistence
- `oauth-server.js` - Local OAuth callback server
- Tokens stored in `~/.outlook-mcp-tokens.json`

**Email Module (`email/`)**
- List, search, read, send, and mark emails
- Folder support (inbox, sent, drafts)
- Advanced search with OData filters
- Attachment handling (list, download)
- Email reply and forward functionality
- Categories, importance, and flags management
- Draft creation, editing, and sending

**Calendar Module (`calendar/`)**
- List, create, update, delete, cancel, decline events
- Event response handling (accept, decline, tentative)
- Calendar management (create, update, delete calendars)
- Advanced event search with filters
- Timezone support (defaults to CET)
- Attendee management and categories

**Contacts Module (`contacts/`)**
- Full CRUD operations for contacts
- Contact search with multiple criteria
- Contact folders management
- Address book integration
- Business and personal contact information

**Tasks Module (`tasks/`)**
- Microsoft To-Do integration
- Task lists management
- Task creation, updating, and completion
- Due dates and reminders
- Task categories and importance levels

**Teams Module (`teams/`)**
- Teams and channels management
- Team messaging and chat functionality
- Online meetings creation and management
- Presence status management
- Team members and permissions
- Channel creation and administration

### Key Patterns

**Error Handling**
- All handlers return `{ error: { code, message } }` for errors
- Authentication errors trigger re-authentication flow
- Network errors are properly caught and reported

**Test Mode**
- Set `USE_TEST_MODE=true` environment variable
- Mock data provided by `utils/mock-data.js`
- Test tokens start with `test_access_token_`

**OData Query Building**
- `utils/odata-helpers.js` provides safe filter construction
- Proper escaping for email addresses and special characters
- Support for complex search queries

## Configuration Requirements

### Environment Variables
- `MS_CLIENT_ID` (or `OUTLOOK_CLIENT_ID`) - Azure app client ID
- `MS_CLIENT_SECRET` (or `OUTLOOK_CLIENT_SECRET`) - Azure app client secret
- `USE_TEST_MODE` - Enable test mode (true/false)

### Azure App Registration
- Required scopes: Mail.Read, Mail.ReadWrite, Mail.Send, User.Read, Calendars.Read, Calendars.ReadWrite, Contacts.Read, Contacts.ReadWrite, Tasks.Read, Tasks.ReadWrite, Team.ReadBasic.All, TeamMember.Read.All, Channel.ReadBasic.All, ChannelMessage.Read.All, ChannelMessage.Send, Chat.Read, Chat.ReadWrite, ChatMessage.Read, ChatMessage.Send, Presence.Read, Presence.Read.All, OnlineMeetings.ReadWrite, offline_access
- Redirect URI: `http://localhost:3333/auth/callback`

### Claude Desktop Integration
- Copy `claude-config-sample.json` to Claude Desktop config
- Start with `authenticate` tool before using other tools
- Server runs on stdio transport for MCP communication

## Testing

- Jest for unit tests in `test/` directory
- MCP Inspector for interactive testing
- Mock data simulation for offline development
- Test scripts for different server configurations

## Available Tools

### Authentication
- `authenticate` - Authenticate with Microsoft Graph API

### Email Management
- `list-emails` - List emails from folders
- `search-emails` - Search emails with advanced filters
- `read-email` - Read email content
- `send-email` - Send new emails
- `mark-as-read` - Mark emails as read/unread
- `list-attachments` - List email attachments
- `download-attachment` - Download email attachments
- `reply-to-email` - Reply to emails (including reply all)
- `forward-email` - Forward emails
- `set-email-categories` - Set email categories
- `set-email-importance` - Set email importance
- `flag-email` - Flag emails for follow-up
- `list-drafts` - List email drafts
- `create-draft` - Create new email drafts
- `update-draft` - Update existing drafts
- `send-draft` - Send draft emails
- `list-inbox-emails` - List emails EXCLUSIVELY from inbox (never other folders)
- `search-inbox-emails` - Search emails EXCLUSIVELY within inbox with multiple criteria
- `bulk-delete-emails` - Delete multiple emails at once with JSON batching support

### Calendar Management
- `list-events` - List calendar events
- `create-event` - Create new events
- `update-event` - Update existing events
- `delete-event` - Delete events
- `cancel-event` - Cancel events
- `accept-event` - Accept event invitations
- `decline-event` - Decline event invitations
- `tentative-event` - Respond tentatively to events
- `list-calendars` - List all calendars
- `create-calendar` - Create new calendars
- `update-calendar` - Update calendar properties
- `delete-calendar` - Delete calendars
- `search-events` - Search events with filters

### Contacts Management
- `list-contacts` - List contacts
- `search-contacts` - Search contacts
- `read-contact` - Read contact details
- `create-contact` - Create new contacts
- `update-contact` - Update existing contacts
- `delete-contact` - Delete contacts
- `list-contact-folders` - List contact folders
- `create-contact-folder` - Create contact folders

### Tasks Management
- `list-tasks` - List tasks from Microsoft To-Do
- `create-task` - Create new tasks
- `update-task` - Update existing tasks
- `delete-task` - Delete tasks
- `list-task-lists` - List task lists
- `create-task-list` - Create new task lists
- `delete-task-list` - Delete task lists

### Microsoft Teams Management
- `list-teams` - List teams user is member of (Requires: Team.ReadBasic.All)
- `get-team-details` - Get detailed team information (Requires: Team.ReadBasic.All)
- `list-team-members` - List team members (Requires: TeamMember.Read.All)
- `list-channels` - List channels in a team (Requires: Channel.ReadBasic.All)
- `get-channel-details` - Get channel details (Requires: Channel.ReadBasic.All)
- `create-channel` - Create new channels (Requires: Channel.Create)
- `update-channel` - Update channel properties (Requires: Channel.ReadWrite.All)
- `delete-channel` - Delete channels (Requires: Channel.Delete.All)
- `list-channel-messages` - List messages in channels (Requires: ChannelMessage.Read.All)
- `get-message-details` - Get message details (Requires: ChannelMessage.Read.All)
- `send-channel-message` - Send messages to channels (Requires: ChannelMessage.Send)
- `reply-to-message` - Reply to channel messages (Requires: ChannelMessage.Send)
- `list-chats` - List user's chats (Requires: Chat.Read, Chat.ReadWrite)
- `get-chat-details` - Get chat details (Requires: Chat.Read, Chat.ReadWrite)
- `list-chat-messages` - List messages in chats (Requires: ChatMessage.Read)
- `send-chat-message` - Send messages to chats (Requires: ChatMessage.Send)
- `create-chat` - Create new chats (Requires: Chat.ReadWrite)
- `get-my-presence` - Get current user's presence (Requires: Presence.Read)
- `get-user-presence` - Get specific user's presence (Requires: Presence.Read.All)
- `set-my-presence` - Set user's presence status (Requires: Presence.ReadWrite)
- `get-multiple-users-presence` - Get multiple users' presence (Requires: Presence.Read.All)
- `list-online-meetings` - List online meetings (Requires: OnlineMeetings.ReadWrite)
- `create-online-meeting` - Create new online meetings (Requires: OnlineMeetings.ReadWrite)
- `get-online-meeting` - Get meeting details (Requires: OnlineMeetings.ReadWrite)
- `update-online-meeting` - Update meeting properties (Requires: OnlineMeetings.ReadWrite)
- `delete-online-meeting` - Delete online meetings (Requires: OnlineMeetings.ReadWrite)

### Advanced Folder Management (Deep Hierarchy Support)
- `list-folders` - List all folders with unlimited nesting levels and hierarchical display
- `create-folder` - Create folders at any depth (supports unlimited nesting like Projects/2024/Client-Work/Invoices)
- `move-emails` - Move emails to deeply nested folders with automatic recursive folder discovery

### Rules Management
- `list-rules` - List mail rules
- `create-rule` - Create new mail rules

## Important Notes

- All API calls go through `utils/graph-api.js` helper
- Token refresh handled automatically by token manager
- **Advanced Folder Features**: Recursive search through unlimited nesting levels for all folder operations
- **Intelligent Folder Discovery**: Automatically finds folders at any depth for create/move operations
- OData filters require proper escaping for email addresses
- Calendar events default to Central European Time
- Server stays alive on SIGTERM for MCP compatibility
- Test mode provides mock data for all operations
- All modules support comprehensive error handling
- Field selections are optimized for performance