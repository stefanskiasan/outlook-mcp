/**
 * Configuration for Outlook MCP Server
 */
const path = require('path');
const os = require('os');

// Ensure we have a home directory path even if process.env.HOME is undefined
const homeDir = process.env.HOME || process.env.USERPROFILE || os.homedir() || '/tmp';

module.exports = {
  // Server information
  SERVER_NAME: "outlook-assistant",
  SERVER_VERSION: "1.0.0",
  
  // Test mode setting
  USE_TEST_MODE: process.env.USE_TEST_MODE === 'true',
  
  // Authentication configuration
  AUTH_CONFIG: {
    clientId: process.env.MS_CLIENT_ID || process.env.OUTLOOK_CLIENT_ID || '',
    clientSecret: process.env.MS_CLIENT_SECRET || process.env.OUTLOOK_CLIENT_SECRET || '',
    redirectUri: 'http://localhost:3333/auth/callback',
    scopes: [
      'Mail.Read', 'Mail.ReadWrite', 'Mail.Send', 
      'User.Read', 
      'Calendars.Read', 'Calendars.ReadWrite',
      'Contacts.Read', 'Contacts.ReadWrite',
      'Tasks.Read', 'Tasks.ReadWrite',
      'Team.ReadBasic.All', 'TeamMember.Read.All',
      'Channel.ReadBasic.All', 'ChannelMessage.Read.All', 'ChannelMessage.Send',
      'Chat.Read', 'Chat.ReadWrite', 'ChatMessage.Read', 'ChatMessage.Send',
      'Presence.Read', 'Presence.Read.All',
      'OnlineMeetings.ReadWrite',
      'offline_access'
    ],
    tokenStorePath: path.join(homeDir, '.outlook-mcp-tokens.json'),
    authServerUrl: 'http://localhost:3333'
  },
  
  // Microsoft Graph API
  GRAPH_API_ENDPOINT: 'https://graph.microsoft.com/v1.0/',
  
  // Calendar constants
  CALENDAR_SELECT_FIELDS: 'id,subject,start,end,location,bodyPreview,isAllDay,recurrence,attendees',

  // Email constants
  EMAIL_SELECT_FIELDS: 'id,subject,from,toRecipients,ccRecipients,receivedDateTime,bodyPreview,hasAttachments,importance,isRead',
  EMAIL_DETAIL_FIELDS: 'id,subject,from,toRecipients,ccRecipients,bccRecipients,receivedDateTime,bodyPreview,body,hasAttachments,importance,isRead,internetMessageHeaders',
  
  // Calendar constants
  CALENDAR_SELECT_FIELDS: 'id,subject,bodyPreview,start,end,location,organizer,attendees,isAllDay,isCancelled',
  
  // Contacts constants
  CONTACTS_SELECT_FIELDS: 'id,displayName,emailAddresses,businessPhones,homePhones,mobilePhone,companyName,jobTitle,department,officeLocation,businessAddress,homeAddress',
  CONTACTS_DETAIL_FIELDS: 'id,displayName,givenName,surname,middleName,nickname,emailAddresses,businessPhones,homePhones,mobilePhone,companyName,jobTitle,department,officeLocation,businessAddress,homeAddress,personalNotes,birthday,categories',
  
  // Tasks constants
  TASKS_SELECT_FIELDS: 'id,title,status,createdDateTime,lastModifiedDateTime,dueDateTime,reminderDateTime,importance,isReminderOn,body',
  TASKS_DETAIL_FIELDS: 'id,title,status,createdDateTime,lastModifiedDateTime,dueDateTime,reminderDateTime,importance,isReminderOn,body,categories,hasAttachments,parentFolderId',
  
  // Teams constants
  TEAMS_SELECT_FIELDS: 'id,displayName,description,visibility,memberSettings,guestSettings,messagingSettings,funSettings,discoverySettings',
  TEAMS_DETAIL_FIELDS: 'id,displayName,description,visibility,memberSettings,guestSettings,messagingSettings,funSettings,discoverySettings,createdDateTime,internalId',
  
  // Channels constants
  CHANNELS_SELECT_FIELDS: 'id,displayName,description,email,webUrl,membershipType,createdDateTime',
  CHANNELS_DETAIL_FIELDS: 'id,displayName,description,email,webUrl,membershipType,createdDateTime,isFavoriteByDefault',
  
  // Chat constants
  CHAT_SELECT_FIELDS: 'id,topic,chatType,createdDateTime,lastUpdatedDateTime,webUrl',
  CHAT_DETAIL_FIELDS: 'id,topic,chatType,createdDateTime,lastUpdatedDateTime,webUrl,tenantId,onlineMeetingInfo',
  
  // Messages constants
  MESSAGES_SELECT_FIELDS: 'id,messageType,createdDateTime,lastModifiedDateTime,from,body,attachments,mentions,importance,locale,subject',
  MESSAGES_DETAIL_FIELDS: 'id,messageType,createdDateTime,lastModifiedDateTime,from,body,attachments,mentions,importance,locale,subject,summary,webUrl,channelIdentity,onBehalfOf,replyToId',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 25,
  MAX_RESULT_COUNT: 50,

  // Timezone
  DEFAULT_TIMEZONE: "Central European Standard Time",
};
