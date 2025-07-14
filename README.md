# Comprehensive Outlook & Teams MCP Server

[![npm version](https://badge.fury.io/js/outlook-mcp.svg)](https://badge.fury.io/js/outlook-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-brightgreen)](https://github.com/modelcontextprotocol/specification)

**Developed by Asan Stefanski**

A comprehensive Model Context Protocol (MCP) server that provides Claude with full access to Microsoft Outlook and Microsoft Teams through the Microsoft Graph API. This server offers 75+ tools across 8 modules, making it one of the most complete Microsoft 365 integrations available for Claude.

## 🚀 Features

- **📧 Email Management** (20 tools): Full email operations including send, reply, forward, attachments, categories, drafts, dedicated inbox-only tools, and bulk operations
- **📅 Calendar Management** (12 tools): Complete calendar and event management with CRUD operations
- **👥 Contacts Management** (8 tools): Full contact lifecycle management with folders
- **✅ Tasks Integration** (7 tools): Microsoft To-Do integration for task and list management
- **🔗 Teams Integration** (25 tools): Complete Teams functionality including:
  - Teams and channels management
  - Messages and chats
  - Online meetings
  - Presence status
- **📁 Advanced Folder Management** (3 tools): Unlimited nested folder hierarchy with deep search
- **⚙️ Rules Management** (3 tools): Email rules automation
- **🔐 Authentication** (2 tools): OAuth 2.0 with Microsoft Graph API

## 📦 Installation

### Via npm (Recommended)

```bash
npm install -g outlook-mcp
```

### Via git clone

```bash
git clone https://github.com/stefanskiasan/outlook-mcp.git
cd outlook-mcp
npm install
```

## 🔧 Setup

### 1. Azure App Registration

You need to register an application in Azure Portal:

1. Go to [Azure Portal](https://portal.azure.com/) → App registrations → New registration
2. Name: "Outlook MCP Server"
3. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
4. Redirect URI: `http://localhost:3333/auth/callback`
5. Click "Register"

### 2. Configure API Permissions

In your Azure app, go to "API permissions" → "Add a permission" → "Microsoft Graph" → "Delegated permissions" and add:

**Core Permissions:**
- `offline_access`
- `User.Read`

**Email & Calendar:**
- `Mail.Read`
- `Mail.ReadWrite`
- `Mail.Send`
- `Calendars.Read`
- `Calendars.ReadWrite`

**Contacts & Tasks:**
- `Contacts.Read`
- `Contacts.ReadWrite`
- `Tasks.Read`
- `Tasks.ReadWrite`

**Teams & Communication:**
- `Team.ReadBasic.All`
- `TeamMember.Read.All`
- `Channel.ReadBasic.All`
- `ChannelMessage.Read.All`
- `ChannelMessage.Send`
- `Chat.Read`
- `Chat.ReadWrite`
- `ChatMessage.Read`
- `ChatMessage.Send`
- `Presence.Read`
- `Presence.Read.All`
- `OnlineMeetings.ReadWrite`

### 3. Create Client Secret

1. Go to "Certificates & secrets" → "New client secret"
2. Add description and select expiration
3. Copy the secret value immediately

### 4. Environment Configuration

Create a `.env` file in the project root:

```env
MS_CLIENT_ID=your-client-id-here
MS_CLIENT_SECRET=your-client-secret-here
USE_TEST_MODE=false
```

**Note:** The system supports both `MS_CLIENT_ID`/`MS_CLIENT_SECRET` and `OUTLOOK_CLIENT_ID`/`OUTLOOK_CLIENT_SECRET` environment variables for backwards compatibility.

### 5. Claude Desktop Configuration

Add to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "outlook-mcp": {
      "command": "npx",
      "args": ["outlook-mcp"],
      "env": {
        "MS_CLIENT_ID": "your-client-id-here",
        "MS_CLIENT_SECRET": "your-client-secret-here"
      }
    }
  }
}
```

**Note:** The `npx outlook-mcp` command is designed to run as an MCP server via stdio and is meant to be used by Claude Desktop, not run directly from the command line.

## 🎯 Usage

### 1. Authentication

First, authenticate with Microsoft:

```
Use the "authenticate" tool in Claude to get an authentication URL
```

### 2. Available Tools

The server provides 75+ tools across these categories:

#### Email Tools (20)
- `list-emails`, `search-emails`, `read-email`, `send-email`
- `reply-email`, `forward-email`, `delete-email`
- `list-attachments`, `download-attachment`
- `list-categories`, `create-category`, `delete-category`
- `list-drafts`, `create-draft`, `update-draft`, `delete-draft`
- `mark-read`, `mark-unread`
- **`list-inbox-emails`** - Lists emails EXCLUSIVELY from inbox
- **`search-inbox-emails`** - Advanced inbox-only search with date ranges, names, descriptions and attachments
- **`bulk-delete-emails`** - Delete multiple emails at once with batch operations

#### Calendar Tools (12)
- `list-events`, `search-events`, `create-event`, `update-event`
- `delete-event`, `accept-event`, `decline-event`, `tentative-event`
- `list-calendars`, `create-calendar`, `update-calendar`, `delete-calendar`

#### Contacts Tools (8)
- `list-contacts`, `search-contacts`, `read-contact`, `create-contact`
- `update-contact`, `delete-contact`, `list-contact-folders`, `create-contact-folder`

#### Tasks Tools (7)
- `list-tasks`, `create-task`, `update-task`, `delete-task`
- `list-task-lists`, `create-task-list`, `delete-task-list`

#### Teams Tools (25)
- **Teams:** `list-teams`, `get-team-details`, `list-team-members`
- **Channels:** `list-channels`, `get-channel-details`, `create-channel`, `update-channel`, `delete-channel`
- **Messages:** `list-channel-messages`, `get-message-details`, `send-channel-message`, `reply-to-message`
- **Chats:** `list-chats`, `get-chat-details`, `list-chat-messages`, `send-chat-message`, `create-chat`
- **Presence:** `get-my-presence`, `get-user-presence`, `set-my-presence`, `get-multiple-users-presence`
- **Meetings:** `list-online-meetings`, `create-online-meeting`, `get-online-meeting`, `update-online-meeting`, `delete-online-meeting`

#### Advanced Folder Management Tools (3)
- `list-folders` - Display complete folder hierarchies with unlimited nesting levels
- `create-folder` - Create folders at any depth (e.g., Projects/2024/Client-Work/Invoices)
- `move-emails` - Move emails to deeply nested folders with automatic discovery

#### Rules Management Tools (3)
- `list-rules`, `create-rule`, `delete-rule`

### 3. Example Usage

```
"List my recent emails from today"
"Create a meeting for tomorrow at 2 PM with the development team"
"Send a message to the general channel in our project team"
"Show my current presence status"
"Create a task to review the quarterly report"

# Inbox-Only Email Examples:
"Show me my latest 20 inbox emails"
"Search for emails from John in my inbox only"
"List unread emails in my inbox"
"Find emails with attachments in my inbox"
"Search inbox emails from last week (dateStart: '2024-07-07', dateEnd: '2024-07-14')"
"Find inbox emails from Sarah between January 1-15 with attachments"
"Show inbox emails mentioning 'project' from the last 30 days"

# Bulk Operations Examples:
"Delete multiple emails: bulk-delete-emails with emailIds: 'id1,id2,id3'"
"Move multiple emails to Archive folder using move-emails"
"Bulk delete old emails with JSON batching for better performance"

# Advanced Folder Management Examples:
"Create a folder structure: Projects/2024/Client-Work/Invoices"
"Show me all folders with their hierarchy and email counts"
"Move these emails to the Photography subfolder in my Hobbies folder"
"Create an Archive folder inside my existing Work/Completed folder"
```

## 🗂️ Advanced Folder Management

### Unlimited Nested Folder Hierarchies

Create and manage complex folder structures with unlimited nesting levels:

```bash
# Create deep folder structures
create-folder: { "name": "2024", "parentFolder": "Projects" }
create-folder: { "name": "Client-Work", "parentFolder": "2024" }
create-folder: { "name": "Invoices", "parentFolder": "Client-Work" }

# Result: Projects/2024/Client-Work/Invoices
```

### Intelligent Folder Search

The system automatically finds folders at any depth:

```bash
# Works even with deeply nested folders
create-folder: { "name": "Archive", "parentFolder": "Invoices" }
move-emails: { "emailIds": "abc123", "targetFolder": "Archive" }
```

### Hierarchical Display

View complete folder trees with proper indentation:

```bash
list-folders: { "includeChildren": true, "includeItemCounts": true }

# Example output:
# Projects - 45 items
#   2024 - 32 items (5 unread)
#     Client-Work - 28 items (3 unread)
#       Invoices - 15 items
#         Archive - 8 items
#       Contracts - 13 items (3 unread)
#   2023 - 13 items
```

## 🧪 Test Mode

For development and testing without API calls:

```bash
npm run test-mode
```

This uses mock data to simulate all Microsoft Graph API responses.

## 📁 Project Structure

```
outlook-mcp/
├── index.js                 # Main MCP server entry point
├── config.js                # Configuration management
├── auth/                    # Authentication & token management
├── email/                   # Email functionality (20 tools)
├── calendar/                # Calendar management (12 tools)
├── contacts/                # Contacts management (8 tools)
├── tasks/                   # Tasks/To-Do integration (7 tools)
├── teams/                   # Teams integration (25 tools)
├── folder/                  # Folder operations (3 tools)
├── rules/                   # Rules management (3 tools)
└── utils/                   # Graph API helpers & mock data
```

## 🔨 Development

### Commands

```bash
npm start              # Start the MCP server
npm run auth-server    # Start authentication server
npm run test-mode      # Run in test mode with mock data
npm run inspect        # Debug with MCP Inspector
npm test              # Run tests
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors:**
- Check your Azure app configuration
- Verify client ID and secret in `.env`
- Ensure redirect URI is set correctly

**Permission Errors:**
- Verify all required permissions are granted in Azure
- Check if admin consent is required for your organization

**API Errors:**
- Enable test mode to verify the server works: `npm run test-mode`
- Check the console for detailed error messages

### Debug Mode

Enable verbose logging:

```bash
DEBUG=outlook-mcp npm start
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Support

- **Issues:** [GitHub Issues](https://github.com/stefanskiasan/outlook-mcp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/stefanskiasan/outlook-mcp/discussions)

## 🎉 Acknowledgments

- Microsoft Graph API team for the excellent API
- Model Context Protocol team for the specification
- Claude team for the amazing AI assistant

---

**Made with ❤️ by [Asan Stefanski](https://github.com/stefanskiasan)**