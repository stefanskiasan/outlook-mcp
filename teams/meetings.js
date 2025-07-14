/**
 * Teams meetings functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated } = require('../auth');
const config = require('../config');

/**
 * List online meetings handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListOnlineMeetings(args) {
  try {
    const { count = config.DEFAULT_PAGE_SIZE } = args;
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Validate count parameter
    const validCount = Math.min(Math.max(1, count), config.MAX_RESULT_COUNT);
    
    // Build the API path
    const apiPath = 'me/onlineMeetings';
    
    // Build query parameters
    const queryParams = {
      '$select': 'id,subject,startDateTime,endDateTime,joinWebUrl,participants,isEntryExitAnnounced,allowedPresenters,audioConferencing',
      '$top': validCount,
      '$orderby': 'startDateTime desc'
    };
    
    console.error(`Fetching ${validCount} online meetings`);
    
    // Make API call
    const response = await callGraphAPI(accessToken, 'GET', apiPath, null, queryParams);
    
    const meetings = response.value || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${meetings.length} online meetings:\n\n${meetings.map(meeting => {
            const subject = meeting.subject || 'No subject';
            const start = meeting.startDateTime ? 
              new Date(meeting.startDateTime).toLocaleString() : 'Not set';
            const end = meeting.endDateTime ? 
              new Date(meeting.endDateTime).toLocaleString() : 'Not set';
            const presenters = meeting.allowedPresenters || 'Unknown';
            const hasAudio = meeting.audioConferencing ? '🔊' : '🔇';
            
            return `📹 ${subject}
   ID: ${meeting.id}
   Start: ${start}
   End: ${end}
   Presenters: ${presenters}
   ${hasAudio} Audio: ${meeting.audioConferencing ? 'Enabled' : 'Disabled'}
   Join URL: ${meeting.joinWebUrl || 'Not available'}`;
          }).join('\n\n')}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleListOnlineMeetings:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to list online meetings: ${error.message}`
      }
    };
  }
}

/**
 * Create online meeting handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleCreateOnlineMeeting(args) {
  try {
    const { 
      subject, 
      startDateTime, 
      endDateTime,
      allowedPresenters = 'organizer',
      isEntryExitAnnounced = false,
      allowAttendeeToEnableCamera = true,
      allowAttendeeToEnableMic = true,
      allowTeamworkReactions = true
    } = args;
    
    if (!subject || !startDateTime || !endDateTime) {
      return {
        error: {
          code: -32602,
          message: "Subject, start time, and end time are required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the meeting object
    const meetingData = {
      subject: subject,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      allowedPresenters: allowedPresenters,
      isEntryExitAnnounced: isEntryExitAnnounced,
      allowAttendeeToEnableCamera: allowAttendeeToEnableCamera,
      allowAttendeeToEnableMic: allowAttendeeToEnableMic,
      allowTeamworkReactions: allowTeamworkReactions
    };
    
    // Build the API path
    const apiPath = 'me/onlineMeetings';
    
    console.error(`Creating online meeting: ${subject}`);
    
    // Make API call
    const newMeeting = await callGraphAPI(accessToken, 'POST', apiPath, meetingData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Online meeting created successfully!

**Subject:** ${newMeeting.subject}
**Meeting ID:** ${newMeeting.id}
**Start:** ${new Date(newMeeting.startDateTime).toLocaleString()}
**End:** ${new Date(newMeeting.endDateTime).toLocaleString()}
**Allowed Presenters:** ${newMeeting.allowedPresenters}

**Join Information:**
• Join URL: ${newMeeting.joinWebUrl}
• Conference ID: ${newMeeting.audioConferencing ? newMeeting.audioConferencing.conferenceId : 'Not available'}
• Toll Number: ${newMeeting.audioConferencing ? newMeeting.audioConferencing.tollNumber : 'Not available'}

**Settings:**
• Entry/Exit Announced: ${newMeeting.isEntryExitAnnounced ? 'Yes' : 'No'}
• Camera Allowed: ${newMeeting.allowAttendeeToEnableCamera ? 'Yes' : 'No'}
• Microphone Allowed: ${newMeeting.allowAttendeeToEnableMic ? 'Yes' : 'No'}
• Reactions Allowed: ${newMeeting.allowTeamworkReactions ? 'Yes' : 'No'}

The meeting has been created and is ready to use.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleCreateOnlineMeeting:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to create online meeting: ${error.message}`
      }
    };
  }
}

/**
 * Get online meeting handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleGetOnlineMeeting(args) {
  try {
    const { meetingId } = args;
    
    if (!meetingId) {
      return {
        error: {
          code: -32602,
          message: "Meeting ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the API path
    const apiPath = `me/onlineMeetings/${meetingId}`;
    
    console.error(`Getting online meeting: ${meetingId}`);
    
    // Make API call
    const meeting = await callGraphAPI(accessToken, 'GET', apiPath);
    
    return {
      content: [
        {
          type: "text",
          text: `📹 Online Meeting Details

**Subject:** ${meeting.subject}
**Meeting ID:** ${meeting.id}
**Start:** ${new Date(meeting.startDateTime).toLocaleString()}
**End:** ${new Date(meeting.endDateTime).toLocaleString()}
**Allowed Presenters:** ${meeting.allowedPresenters}

**Join Information:**
• Join URL: ${meeting.joinWebUrl}
• Conference ID: ${meeting.audioConferencing ? meeting.audioConferencing.conferenceId : 'Not available'}
• Toll Number: ${meeting.audioConferencing ? meeting.audioConferencing.tollNumber : 'Not available'}
• Toll-Free Number: ${meeting.audioConferencing ? meeting.audioConferencing.tollFreeNumber : 'Not available'}

**Settings:**
• Entry/Exit Announced: ${meeting.isEntryExitAnnounced ? 'Yes' : 'No'}
• Camera Allowed: ${meeting.allowAttendeeToEnableCamera ? 'Yes' : 'No'}
• Microphone Allowed: ${meeting.allowAttendeeToEnableMic ? 'Yes' : 'No'}
• Reactions Allowed: ${meeting.allowTeamworkReactions ? 'Yes' : 'No'}
• Recording Allowed: ${meeting.allowRecording ? 'Yes' : 'No'}

**Participants:**
• Organizer: ${meeting.participants && meeting.participants.organizer ? meeting.participants.organizer.identity.user.displayName : 'Unknown'}
• Attendees: ${meeting.participants && meeting.participants.attendees ? meeting.participants.attendees.length : 0}`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleGetOnlineMeeting:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to get online meeting: ${error.message}`
      }
    };
  }
}

/**
 * Update online meeting handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleUpdateOnlineMeeting(args) {
  try {
    const { 
      meetingId, 
      subject, 
      startDateTime, 
      endDateTime,
      allowedPresenters,
      isEntryExitAnnounced,
      allowAttendeeToEnableCamera,
      allowAttendeeToEnableMic,
      allowTeamworkReactions
    } = args;
    
    if (!meetingId) {
      return {
        error: {
          code: -32602,
          message: "Meeting ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // Build the update object (only include provided fields)
    const updateData = {};
    
    if (subject !== undefined) updateData.subject = subject;
    if (startDateTime !== undefined) updateData.startDateTime = startDateTime;
    if (endDateTime !== undefined) updateData.endDateTime = endDateTime;
    if (allowedPresenters !== undefined) updateData.allowedPresenters = allowedPresenters;
    if (isEntryExitAnnounced !== undefined) updateData.isEntryExitAnnounced = isEntryExitAnnounced;
    if (allowAttendeeToEnableCamera !== undefined) updateData.allowAttendeeToEnableCamera = allowAttendeeToEnableCamera;
    if (allowAttendeeToEnableMic !== undefined) updateData.allowAttendeeToEnableMic = allowAttendeeToEnableMic;
    if (allowTeamworkReactions !== undefined) updateData.allowTeamworkReactions = allowTeamworkReactions;
    
    // Ensure we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return {
        error: {
          code: -32602,
          message: "At least one field must be provided to update"
        }
      };
    }
    
    // Build the API path
    const apiPath = `me/onlineMeetings/${meetingId}`;
    
    console.error(`Updating online meeting: ${meetingId}`);
    
    // Make API call
    const updatedMeeting = await callGraphAPI(accessToken, 'PATCH', apiPath, updateData);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Online meeting updated successfully!

**Subject:** ${updatedMeeting.subject}
**Meeting ID:** ${updatedMeeting.id}
**Start:** ${new Date(updatedMeeting.startDateTime).toLocaleString()}
**End:** ${new Date(updatedMeeting.endDateTime).toLocaleString()}
**Allowed Presenters:** ${updatedMeeting.allowedPresenters}

**Join URL:** ${updatedMeeting.joinWebUrl}

The meeting has been updated with the provided information.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleUpdateOnlineMeeting:', error);
    return {
      error: {
        code: -32603,
        message: `Failed to update online meeting: ${error.message}`
      }
    };
  }
}

/**
 * Delete online meeting handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleDeleteOnlineMeeting(args) {
  try {
    const { meetingId } = args;
    
    if (!meetingId) {
      return {
        error: {
          code: -32602,
          message: "Meeting ID is required"
        }
      };
    }
    
    // Ensure user is authenticated
    const accessToken = await ensureAuthenticated();
    
    // First, get the meeting details for confirmation
    const meetingPath = `me/onlineMeetings/${meetingId}`;
    let meetingSubject = 'Unknown';
    
    try {
      const meeting = await callGraphAPI(accessToken, 'GET', meetingPath, null, { '$select': 'subject' });
      meetingSubject = meeting.subject || 'Unknown';
    } catch (error) {
      console.error('Could not retrieve meeting for deletion:', error);
    }
    
    // Build the API path
    const apiPath = `me/onlineMeetings/${meetingId}`;
    
    console.error(`Deleting online meeting: ${meetingId} (${meetingSubject})`);
    
    // Make API call to delete the meeting
    await callGraphAPI(accessToken, 'DELETE', apiPath);
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Online meeting deleted successfully!

**Meeting:** ${meetingSubject}
**Meeting ID:** ${meetingId}

The meeting has been permanently removed and participants will no longer be able to join.`
        }
      ]
    };
  } catch (error) {
    console.error('Error in handleDeleteOnlineMeeting:', error);
    
    // Handle specific error cases
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return {
        error: {
          code: -32603,
          message: `Meeting not found: ${meetingId}`
        }
      };
    }
    
    return {
      error: {
        code: -32603,
        message: `Failed to delete online meeting: ${error.message}`
      }
    };
  }
}

module.exports = {
  handleListOnlineMeetings,
  handleCreateOnlineMeeting,
  handleGetOnlineMeeting,
  handleUpdateOnlineMeeting,
  handleDeleteOnlineMeeting
};