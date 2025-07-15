/**
 * Email module for Outlook MCP server
 */
const handleListEmails = require('./list');
const handleSearchEmails = require('./search');
const handleReadEmail = require('./read');
const handleSendEmail = require('./send');
const handleMarkAsRead = require('./mark-as-read');
const { handleListAttachments, handleDownloadAttachment } = require('./attachments');
const { handleReplyToEmail, handleForwardEmail } = require('./reply');
const { handleSetEmailCategories, handleSetEmailImportance, handleFlagEmail } = require('./categories');
const { handleListDrafts, handleCreateDraft, handleUpdateDraft, handleSendDraft } = require('./drafts');
const { handleListInboxEmails, handleSearchInboxEmails } = require('./inbox');
const handleBulkDeleteEmails = require('./bulk-delete');
const handleBulkReadEmails = require('./bulk-read');

// Email tool definitions
const emailTools = [
  {
    name: "list-emails",
    description: "Lists recent emails from your inbox",
    inputSchema: {
      type: "object",
      properties: {
        folder: {
          type: "string",
          description: "Email folder to list (e.g., 'inbox', 'sent', 'drafts', default: 'inbox')"
        },
        count: {
          type: "number",
          description: "Number of emails to retrieve (default: 10, max: 50)"
        }
      },
      required: []
    },
    handler: handleListEmails
  },
  {
    name: "search-emails",
    description: "Search for emails using various criteria",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query text to find in emails"
        },
        folder: {
          type: "string",
          description: "Email folder to search in (default: 'inbox')"
        },
        from: {
          type: "string",
          description: "Filter by sender email address or name"
        },
        to: {
          type: "string",
          description: "Filter by recipient email address or name"
        },
        subject: {
          type: "string",
          description: "Filter by email subject"
        },
        hasAttachments: {
          type: "boolean",
          description: "Filter to only emails with attachments"
        },
        unreadOnly: {
          type: "boolean",
          description: "Filter to only unread emails"
        },
        count: {
          type: "number",
          description: "Number of results to return (default: 10, max: 50)"
        }
      },
      required: []
    },
    handler: handleSearchEmails
  },
  {
    name: "read-email",
    description: "Reads the content of a specific email",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the email to read"
        }
      },
      required: ["id"]
    },
    handler: handleReadEmail
  },
  {
    name: "send-email",
    description: "Composes and sends a new email",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Comma-separated list of recipient email addresses"
        },
        cc: {
          type: "string",
          description: "Comma-separated list of CC recipient email addresses"
        },
        bcc: {
          type: "string",
          description: "Comma-separated list of BCC recipient email addresses"
        },
        subject: {
          type: "string",
          description: "Email subject"
        },
        body: {
          type: "string",
          description: "Email body content (can be plain text or HTML)"
        },
        importance: {
          type: "string",
          description: "Email importance (normal, high, low)",
          enum: ["normal", "high", "low"]
        },
        saveToSentItems: {
          type: "boolean",
          description: "Whether to save the email to sent items"
        }
      },
      required: ["to", "subject", "body"]
    },
    handler: handleSendEmail
  },
  {
    name: "mark-as-read",
    description: "Marks an email as read or unread",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the email to mark as read/unread"
        },
        isRead: {
          type: "boolean",
          description: "Whether to mark as read (true) or unread (false). Default: true"
        }
      },
      required: ["id"]
    },
    handler: handleMarkAsRead
  },
  {
    name: "list-attachments",
    description: "Lists attachments for a specific email",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email to list attachments for"
        }
      },
      required: ["emailId"]
    },
    handler: handleListAttachments
  },
  {
    name: "download-attachment",
    description: "Downloads an email attachment",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email containing the attachment"
        },
        attachmentId: {
          type: "string",
          description: "ID of the attachment to download"
        }
      },
      required: ["emailId", "attachmentId"]
    },
    handler: handleDownloadAttachment
  },
  {
    name: "reply-to-email",
    description: "Replies to an email",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email to reply to"
        },
        body: {
          type: "string",
          description: "Reply message body"
        },
        replyAll: {
          type: "boolean",
          description: "Whether to reply to all recipients (default: false)"
        },
        comment: {
          type: "string",
          description: "Additional comment for the reply"
        }
      },
      required: ["emailId", "body"]
    },
    handler: handleReplyToEmail
  },
  {
    name: "forward-email",
    description: "Forwards an email to other recipients",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email to forward"
        },
        to: {
          type: "string",
          description: "Comma-separated list of recipient email addresses"
        },
        cc: {
          type: "string",
          description: "Comma-separated list of CC recipient email addresses"
        },
        bcc: {
          type: "string",
          description: "Comma-separated list of BCC recipient email addresses"
        },
        body: {
          type: "string",
          description: "Additional message body for the forward"
        },
        comment: {
          type: "string",
          description: "Additional comment for the forward"
        }
      },
      required: ["emailId", "to"]
    },
    handler: handleForwardEmail
  },
  {
    name: "set-email-categories",
    description: "Sets categories for an email",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email to categorize"
        },
        categories: {
          type: "array",
          items: {
            type: "string"
          },
          description: "List of categories to assign to the email"
        }
      },
      required: ["emailId", "categories"]
    },
    handler: handleSetEmailCategories
  },
  {
    name: "set-email-importance",
    description: "Sets importance level for an email",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email to set importance for"
        },
        importance: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "Importance level to set"
        }
      },
      required: ["emailId", "importance"]
    },
    handler: handleSetEmailImportance
  },
  {
    name: "flag-email",
    description: "Flags an email with follow-up information",
    inputSchema: {
      type: "object",
      properties: {
        emailId: {
          type: "string",
          description: "ID of the email to flag"
        },
        flagStatus: {
          type: "string",
          enum: ["notFlagged", "flagged", "complete"],
          description: "Flag status to set (default: 'flagged')"
        },
        dueDateTime: {
          type: "string",
          description: "Due date and time in ISO format (only for flagged status)"
        }
      },
      required: ["emailId"]
    },
    handler: handleFlagEmail
  },
  {
    name: "list-drafts",
    description: "Lists email drafts",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of drafts to retrieve (default: 25, max: 50)"
        }
      },
      required: []
    },
    handler: handleListDrafts
  },
  {
    name: "create-draft",
    description: "Creates a new email draft",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Comma-separated list of recipient email addresses"
        },
        cc: {
          type: "string",
          description: "Comma-separated list of CC recipient email addresses"
        },
        bcc: {
          type: "string",
          description: "Comma-separated list of BCC recipient email addresses"
        },
        subject: {
          type: "string",
          description: "Email subject"
        },
        body: {
          type: "string",
          description: "Email body content"
        },
        importance: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "Email importance level (default: 'normal')"
        }
      },
      required: []
    },
    handler: handleCreateDraft
  },
  {
    name: "update-draft",
    description: "Updates an existing email draft",
    inputSchema: {
      type: "object",
      properties: {
        draftId: {
          type: "string",
          description: "ID of the draft to update"
        },
        to: {
          type: "string",
          description: "Comma-separated list of recipient email addresses"
        },
        cc: {
          type: "string",
          description: "Comma-separated list of CC recipient email addresses"
        },
        bcc: {
          type: "string",
          description: "Comma-separated list of BCC recipient email addresses"
        },
        subject: {
          type: "string",
          description: "Email subject"
        },
        body: {
          type: "string",
          description: "Email body content"
        },
        importance: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "Email importance level"
        }
      },
      required: ["draftId"]
    },
    handler: handleUpdateDraft
  },
  {
    name: "send-draft",
    description: "Sends an email draft",
    inputSchema: {
      type: "object",
      properties: {
        draftId: {
          type: "string",
          description: "ID of the draft to send"
        }
      },
      required: ["draftId"]
    },
    handler: handleSendDraft
  },
  {
    name: "list-inbox-emails",
    description: "Lists emails EXCLUSIVELY from your inbox - never searches other folders. Perfect for quick inbox overview.",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of inbox emails to retrieve (default: 10, max: 50)"
        },
        unreadOnly: {
          type: "boolean",
          description: "Show only unread emails from inbox (default: false)"
        }
      },
      required: []
    },
    handler: handleListInboxEmails
  },
  {
    name: "search-inbox-emails",
    description: "Search emails EXCLUSIVELY within your inbox - never searches other folders. Advanced inbox-only search with date ranges, names, descriptions and attachments.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query text to find in inbox emails (subject and body)"
        },
        from: {
          type: "string",
          description: "Filter by sender email or name in inbox"
        },
        to: {
          type: "string",
          description: "Filter by recipient email or name in inbox"
        },
        subject: {
          type: "string",
          description: "Filter by subject text in inbox"
        },
        hasAttachments: {
          type: "boolean",
          description: "Filter by attachment presence in inbox"
        },
        unreadOnly: {
          type: "boolean",
          description: "Show only unread emails from inbox"
        },
        dateStart: {
          type: "string",
          description: "Start date for inbox search range (ISO format: '2024-01-15' or '2024-01-15T10:00:00Z')"
        },
        dateEnd: {
          type: "string",
          description: "End date for inbox search range (ISO format: '2024-01-15' or '2024-01-15T23:59:59Z')"
        },
        count: {
          type: "number",
          description: "Number of inbox search results (default: 10, max: 50)"
        }
      },
      required: []
    },
    handler: handleSearchInboxEmails
  },
  {
    name: "bulk-delete-emails",
    description: "Deletes multiple emails at once. Supports batch operations for better performance. Use with caution - this action cannot be undone!",
    inputSchema: {
      type: "object",
      properties: {
        emailIds: {
          type: "string",
          description: "Comma-separated list of email IDs to delete (e.g., 'id1,id2,id3')"
        },
        useBatch: {
          type: "boolean",
          description: "Use JSON batching for better performance (default: true)"
        },
        maxEmails: {
          type: "number",
          description: "Maximum number of emails to delete at once (default: 20, max: 20)"
        }
      },
      required: ["emailIds"]
    },
    handler: handleBulkDeleteEmails
  },
  {
    name: "bulk-read-emails",
    description: "Reads multiple emails at once using efficient batch processing. Perfect for processing large amounts of email data quickly.",
    inputSchema: {
      type: "object",
      properties: {
        emailIds: {
          type: "string",
          description: "Comma-separated list of email IDs to read (e.g., 'id1,id2,id3')"
        },
        useBatch: {
          type: "boolean",
          description: "Use JSON batching for better performance (default: true)"
        },
        maxEmails: {
          type: "number",
          description: "Maximum number of emails to read at once (default: 20, max: 20)"
        }
      },
      required: ["emailIds"]
    },
    handler: handleBulkReadEmails
  }
];

module.exports = {
  emailTools,
  handleListEmails,
  handleSearchEmails,
  handleReadEmail,
  handleSendEmail,
  handleMarkAsRead,
  handleListAttachments,
  handleDownloadAttachment,
  handleReplyToEmail,
  handleForwardEmail,
  handleSetEmailCategories,
  handleSetEmailImportance,
  handleFlagEmail,
  handleListDrafts,
  handleCreateDraft,
  handleUpdateDraft,
  handleSendDraft,
  handleListInboxEmails,
  handleSearchInboxEmails,
  handleBulkDeleteEmails,
  handleBulkReadEmails
};
