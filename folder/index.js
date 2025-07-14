/**
 * Folder management module for Outlook MCP server
 */
const handleListFolders = require('./list');
const handleCreateFolder = require('./create');
const handleMoveEmails = require('./move');

// Folder management tool definitions
const folderTools = [
  {
    name: "list-folders",
    description: "Lists mail folders with full hierarchy support - displays unlimited nesting levels with proper indentation. Shows complete folder structures from root to deepest subfolders.",
    inputSchema: {
      type: "object",
      properties: {
        includeItemCounts: {
          type: "boolean",
          description: "Include counts of total and unread items for each folder"
        },
        includeChildren: {
          type: "boolean",
          description: "Display folders in hierarchical tree format with indentation (recommended for complex folder structures)"
        }
      },
      required: []
    },
    handler: handleListFolders
  },
  {
    name: "create-folder",
    description: "Creates mail folders with unlimited nesting support. Build complex hierarchies like Projects/2024/Client-Work/Invoices. Automatically finds parent folders at any depth level.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the new folder to create"
        },
        parentFolder: {
          type: "string",
          description: "Parent folder name - can be nested at any level (e.g., 'Photography' in 'Hobbies/Photography/Landscapes'). Leave empty to create at root level."
        }
      },
      required: ["name"]
    },
    handler: handleCreateFolder
  },
  {
    name: "move-emails",
    description: "Moves emails between folders with deep hierarchy support. Can move to any nested folder automatically found by recursive search.",
    inputSchema: {
      type: "object",
      properties: {
        emailIds: {
          type: "string",
          description: "Comma-separated list of email IDs to move"
        },
        targetFolder: {
          type: "string",
          description: "Name of the destination folder - works with deeply nested folders (e.g., 'Invoices' in Projects/2024/Client-Work/Invoices)"
        },
        sourceFolder: {
          type: "string",
          description: "Optional source folder name - also supports nested folders (default is inbox)"
        }
      },
      required: ["emailIds", "targetFolder"]
    },
    handler: handleMoveEmails
  }
];

module.exports = {
  folderTools,
  handleListFolders,
  handleCreateFolder,
  handleMoveEmails
};
