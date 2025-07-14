/**
 * Teams module for Outlook MCP server
 */
const { handleListTeams, handleGetTeamDetails, handleListTeamMembers } = require('./teams');
const { handleListChannels, handleGetChannelDetails, handleCreateChannel, handleUpdateChannel, handleDeleteChannel } = require('./channels');
const { handleListChannelMessages, handleGetMessageDetails, handleSendChannelMessage, handleReplyToMessage } = require('./messages');
const { handleListChats, handleGetChatDetails, handleListChatMessages, handleSendChatMessage, handleCreateChat } = require('./chats');
const { handleGetMyPresence, handleGetUserPresence, handleSetMyPresence, handleGetMultipleUsersPresence } = require('./presence');
const { handleListOnlineMeetings, handleCreateOnlineMeeting, handleGetOnlineMeeting, handleUpdateOnlineMeeting, handleDeleteOnlineMeeting } = require('./meetings');

// Teams tool definitions
const teamsTools = [
  {
    name: "list-teams",
    description: "Lists teams that the user is a member of",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of teams to retrieve (default: 25, max: 50)"
        }
      },
      required: []
    },
    handler: handleListTeams
  },
  {
    name: "get-team-details",
    description: "Gets detailed information about a specific team",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team to get details for"
        }
      },
      required: ["teamId"]
    },
    handler: handleGetTeamDetails
  },
  {
    name: "list-team-members",
    description: "Lists members of a specific team",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team to list members for"
        },
        count: {
          type: "number",
          description: "Number of members to retrieve (default: 25, max: 50)"
        }
      },
      required: ["teamId"]
    },
    handler: handleListTeamMembers
  },
  {
    name: "list-channels",
    description: "Lists channels in a team",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team to list channels for"
        },
        count: {
          type: "number",
          description: "Number of channels to retrieve (default: 25, max: 50)"
        }
      },
      required: ["teamId"]
    },
    handler: handleListChannels
  },
  {
    name: "get-channel-details",
    description: "Gets detailed information about a specific channel",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel to get details for"
        }
      },
      required: ["teamId", "channelId"]
    },
    handler: handleGetChannelDetails
  },
  {
    name: "create-channel",
    description: "Creates a new channel in a team",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team to create the channel in"
        },
        displayName: {
          type: "string",
          description: "Name of the channel"
        },
        description: {
          type: "string",
          description: "Description of the channel"
        },
        membershipType: {
          type: "string",
          enum: ["standard", "private"],
          description: "Membership type of the channel (default: 'standard')"
        }
      },
      required: ["teamId", "displayName"]
    },
    handler: handleCreateChannel
  },
  {
    name: "update-channel",
    description: "Updates an existing channel",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel to update"
        },
        displayName: {
          type: "string",
          description: "New name for the channel"
        },
        description: {
          type: "string",
          description: "New description for the channel"
        }
      },
      required: ["teamId", "channelId"]
    },
    handler: handleUpdateChannel
  },
  {
    name: "delete-channel",
    description: "Deletes a channel from a team",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel to delete"
        }
      },
      required: ["teamId", "channelId"]
    },
    handler: handleDeleteChannel
  },
  {
    name: "list-channel-messages",
    description: "Lists messages in a channel",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel to list messages from"
        },
        count: {
          type: "number",
          description: "Number of messages to retrieve (default: 25, max: 50)"
        }
      },
      required: ["teamId", "channelId"]
    },
    handler: handleListChannelMessages
  },
  {
    name: "get-message-details",
    description: "Gets detailed information about a specific message",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel containing the message"
        },
        messageId: {
          type: "string",
          description: "ID of the message to get details for"
        }
      },
      required: ["teamId", "channelId", "messageId"]
    },
    handler: handleGetMessageDetails
  },
  {
    name: "send-channel-message",
    description: "Sends a message to a channel",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel to send the message to"
        },
        content: {
          type: "string",
          description: "Content of the message"
        },
        contentType: {
          type: "string",
          enum: ["html", "text"],
          description: "Content type of the message (default: 'html')"
        },
        subject: {
          type: "string",
          description: "Subject of the message"
        },
        importance: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "Importance level of the message (default: 'normal')"
        }
      },
      required: ["teamId", "channelId", "content"]
    },
    handler: handleSendChannelMessage
  },
  {
    name: "reply-to-message",
    description: "Replies to a message in a channel",
    inputSchema: {
      type: "object",
      properties: {
        teamId: {
          type: "string",
          description: "ID of the team containing the channel"
        },
        channelId: {
          type: "string",
          description: "ID of the channel containing the message"
        },
        messageId: {
          type: "string",
          description: "ID of the message to reply to"
        },
        content: {
          type: "string",
          description: "Content of the reply"
        },
        contentType: {
          type: "string",
          enum: ["html", "text"],
          description: "Content type of the reply (default: 'html')"
        }
      },
      required: ["teamId", "channelId", "messageId", "content"]
    },
    handler: handleReplyToMessage
  },
  {
    name: "list-chats",
    description: "Lists chats that the user is a member of",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of chats to retrieve (default: 25, max: 50)"
        },
        chatType: {
          type: "string",
          enum: ["all", "oneOnOne", "group", "meeting"],
          description: "Type of chats to filter by (default: 'all')"
        }
      },
      required: []
    },
    handler: handleListChats
  },
  {
    name: "get-chat-details",
    description: "Gets detailed information about a specific chat",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description: "ID of the chat to get details for"
        }
      },
      required: ["chatId"]
    },
    handler: handleGetChatDetails
  },
  {
    name: "list-chat-messages",
    description: "Lists messages in a chat",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description: "ID of the chat to list messages from"
        },
        count: {
          type: "number",
          description: "Number of messages to retrieve (default: 25, max: 50)"
        }
      },
      required: ["chatId"]
    },
    handler: handleListChatMessages
  },
  {
    name: "send-chat-message",
    description: "Sends a message to a chat",
    inputSchema: {
      type: "object",
      properties: {
        chatId: {
          type: "string",
          description: "ID of the chat to send the message to"
        },
        content: {
          type: "string",
          description: "Content of the message"
        },
        contentType: {
          type: "string",
          enum: ["html", "text"],
          description: "Content type of the message (default: 'html')"
        },
        importance: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "Importance level of the message (default: 'normal')"
        }
      },
      required: ["chatId", "content"]
    },
    handler: handleSendChatMessage
  },
  {
    name: "create-chat",
    description: "Creates a new chat with specified members",
    inputSchema: {
      type: "object",
      properties: {
        members: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of user IDs to add to the chat"
        },
        topic: {
          type: "string",
          description: "Topic of the chat"
        },
        chatType: {
          type: "string",
          enum: ["oneOnOne", "group"],
          description: "Type of chat to create (default: 'group')"
        }
      },
      required: ["members"]
    },
    handler: handleCreateChat
  },
  {
    name: "get-my-presence",
    description: "Gets the current user's presence status",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    handler: handleGetMyPresence
  },
  {
    name: "get-user-presence",
    description: "Gets the presence status of a specific user",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "ID of the user to get presence for"
        }
      },
      required: ["userId"]
    },
    handler: handleGetUserPresence
  },
  {
    name: "set-my-presence",
    description: "Sets the current user's presence status",
    inputSchema: {
      type: "object",
      properties: {
        availability: {
          type: "string",
          enum: ["Available", "Busy", "DoNotDisturb", "BeRightBack", "Away"],
          description: "Availability status to set"
        },
        activity: {
          type: "string",
          enum: ["Available", "Away", "BeRightBack", "Busy", "DoNotDisturb", "InACall", "InAConferenceCall", "Inactive", "InAMeeting", "Offline", "OffWork", "OutOfOffice", "PresenceUnknown", "Presenting", "UrgentInterruptionsOnly"],
          description: "Activity status to set"
        },
        statusMessage: {
          type: "string",
          description: "Optional status message"
        }
      },
      required: ["availability", "activity"]
    },
    handler: handleSetMyPresence
  },
  {
    name: "get-multiple-users-presence",
    description: "Gets the presence status of multiple users",
    inputSchema: {
      type: "object",
      properties: {
        userIds: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of user IDs to get presence for"
        }
      },
      required: ["userIds"]
    },
    handler: handleGetMultipleUsersPresence
  },
  {
    name: "list-online-meetings",
    description: "Lists online meetings created by the user",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of meetings to retrieve (default: 25, max: 50)"
        }
      },
      required: []
    },
    handler: handleListOnlineMeetings
  },
  {
    name: "create-online-meeting",
    description: "Creates a new online meeting",
    inputSchema: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "Subject of the meeting"
        },
        startDateTime: {
          type: "string",
          description: "Start date and time in ISO format"
        },
        endDateTime: {
          type: "string",
          description: "End date and time in ISO format"
        },
        allowedPresenters: {
          type: "string",
          enum: ["organizer", "everyone", "roleIsPresenter"],
          description: "Who can present in the meeting (default: 'organizer')"
        },
        isEntryExitAnnounced: {
          type: "boolean",
          description: "Whether entry/exit is announced (default: false)"
        },
        allowAttendeeToEnableCamera: {
          type: "boolean",
          description: "Whether attendees can enable camera (default: true)"
        },
        allowAttendeeToEnableMic: {
          type: "boolean",
          description: "Whether attendees can enable microphone (default: true)"
        },
        allowTeamworkReactions: {
          type: "boolean",
          description: "Whether teamwork reactions are allowed (default: true)"
        }
      },
      required: ["subject", "startDateTime", "endDateTime"]
    },
    handler: handleCreateOnlineMeeting
  },
  {
    name: "get-online-meeting",
    description: "Gets detailed information about a specific online meeting",
    inputSchema: {
      type: "object",
      properties: {
        meetingId: {
          type: "string",
          description: "ID of the meeting to get details for"
        }
      },
      required: ["meetingId"]
    },
    handler: handleGetOnlineMeeting
  },
  {
    name: "update-online-meeting",
    description: "Updates an existing online meeting",
    inputSchema: {
      type: "object",
      properties: {
        meetingId: {
          type: "string",
          description: "ID of the meeting to update"
        },
        subject: {
          type: "string",
          description: "New subject for the meeting"
        },
        startDateTime: {
          type: "string",
          description: "New start date and time in ISO format"
        },
        endDateTime: {
          type: "string",
          description: "New end date and time in ISO format"
        },
        allowedPresenters: {
          type: "string",
          enum: ["organizer", "everyone", "roleIsPresenter"],
          description: "Who can present in the meeting"
        },
        isEntryExitAnnounced: {
          type: "boolean",
          description: "Whether entry/exit is announced"
        },
        allowAttendeeToEnableCamera: {
          type: "boolean",
          description: "Whether attendees can enable camera"
        },
        allowAttendeeToEnableMic: {
          type: "boolean",
          description: "Whether attendees can enable microphone"
        },
        allowTeamworkReactions: {
          type: "boolean",
          description: "Whether teamwork reactions are allowed"
        }
      },
      required: ["meetingId"]
    },
    handler: handleUpdateOnlineMeeting
  },
  {
    name: "delete-online-meeting",
    description: "Deletes an online meeting",
    inputSchema: {
      type: "object",
      properties: {
        meetingId: {
          type: "string",
          description: "ID of the meeting to delete"
        }
      },
      required: ["meetingId"]
    },
    handler: handleDeleteOnlineMeeting
  }
];

module.exports = {
  teamsTools,
  handleListTeams,
  handleGetTeamDetails,
  handleListTeamMembers,
  handleListChannels,
  handleGetChannelDetails,
  handleCreateChannel,
  handleUpdateChannel,
  handleDeleteChannel,
  handleListChannelMessages,
  handleGetMessageDetails,
  handleSendChannelMessage,
  handleReplyToMessage,
  handleListChats,
  handleGetChatDetails,
  handleListChatMessages,
  handleSendChatMessage,
  handleCreateChat,
  handleGetMyPresence,
  handleGetUserPresence,
  handleSetMyPresence,
  handleGetMultipleUsersPresence,
  handleListOnlineMeetings,
  handleCreateOnlineMeeting,
  handleGetOnlineMeeting,
  handleUpdateOnlineMeeting,
  handleDeleteOnlineMeeting
};