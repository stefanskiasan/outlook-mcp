/**
 * Mock data functions for test mode
 */

/**
 * Simulates Microsoft Graph API responses for testing
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {object} data - Request data
 * @param {object} queryParams - Query parameters
 * @returns {object} - Simulated API response
 */
function simulateGraphAPIResponse(method, path, data, queryParams) {
  console.error(`Simulating response for: ${method} ${path}`);
  
  if (method === 'GET') {
    // Contacts endpoints
    if (path.includes('contacts')) {
      if (path.includes('/contacts/')) {
        // Single contact response
        return {
          id: "simulated-contact-id",
          displayName: "John Doe",
          givenName: "John",
          surname: "Doe",
          emailAddresses: [{
            address: "john.doe@example.com",
            name: "John Doe"
          }],
          businessPhones: ["+1 555 123 4567"],
          mobilePhone: "+1 555 987 6543",
          companyName: "Example Corp",
          jobTitle: "Software Engineer",
          department: "Engineering",
          businessAddress: {
            street: "123 Business St",
            city: "Tech City",
            state: "TC",
            postalCode: "12345"
          }
        };
      } else {
        // Contacts list response
        return {
          value: [
            {
              id: "contact-1",
              displayName: "John Doe",
              emailAddresses: [{ address: "john.doe@example.com" }],
              businessPhones: ["+1 555 123 4567"],
              companyName: "Example Corp",
              jobTitle: "Software Engineer"
            },
            {
              id: "contact-2",
              displayName: "Jane Smith",
              emailAddresses: [{ address: "jane.smith@example.com" }],
              businessPhones: ["+1 555 234 5678"],
              companyName: "Tech Inc",
              jobTitle: "Product Manager"
            }
          ]
        };
      }
    }
    
    // Tasks endpoints
    if (path.includes('todo')) {
      if (path.includes('/tasks/')) {
        // Single task response
        return {
          id: "simulated-task-id",
          title: "Complete project documentation",
          status: "notStarted",
          importance: "high",
          isReminderOn: true,
          dueDateTime: {
            dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            timeZone: "UTC"
          },
          body: {
            content: "Write comprehensive documentation for the new feature",
            contentType: "text"
          },
          categories: ["Work", "Documentation"]
        };
      } else if (path.includes('/tasks')) {
        // Tasks list response
        return {
          value: [
            {
              id: "task-1",
              title: "Complete project documentation",
              status: "notStarted",
              importance: "high",
              isReminderOn: true,
              dueDateTime: {
                dateTime: new Date(Date.now() + 86400000).toISOString()
              },
              body: { content: "Write comprehensive documentation" }
            },
            {
              id: "task-2",
              title: "Review code changes",
              status: "inProgress",
              importance: "normal",
              isReminderOn: false,
              dueDateTime: {
                dateTime: new Date(Date.now() + 172800000).toISOString()
              },
              body: { content: "Review pull requests from team" }
            }
          ]
        };
      } else if (path.includes('/lists')) {
        // Task lists response
        return {
          value: [
            {
              id: "list-1",
              displayName: "Tasks",
              isOwner: true,
              isShared: false,
              wellknownListName: "defaultList"
            },
            {
              id: "list-2",
              displayName: "Work Projects",
              isOwner: true,
              isShared: true,
              wellknownListName: null
            }
          ]
        };
      }
    }
    
    // Calendar endpoints
    if (path.includes('events')) {
      if (path.includes('/events/')) {
        // Single event response
        return {
          id: "simulated-event-id",
          subject: "Team Meeting",
          start: {
            dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            timeZone: "UTC"
          },
          end: {
            dateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
            timeZone: "UTC"
          },
          location: {
            displayName: "Conference Room A"
          },
          attendees: [
            {
              emailAddress: {
                name: "John Doe",
                address: "john.doe@example.com"
              }
            }
          ],
          organizer: {
            emailAddress: {
              name: "Meeting Organizer",
              address: "organizer@example.com"
            }
          },
          bodyPreview: "Weekly team sync meeting",
          isAllDay: false,
          isCancelled: false
        };
      } else {
        // Events list response
        return {
          value: [
            {
              id: "event-1",
              subject: "Team Meeting",
              start: {
                dateTime: new Date(Date.now() + 3600000).toISOString()
              },
              end: {
                dateTime: new Date(Date.now() + 7200000).toISOString()
              },
              location: { displayName: "Conference Room A" },
              attendees: [{ emailAddress: { name: "John Doe", address: "john.doe@example.com" } }],
              organizer: { emailAddress: { name: "Organizer", address: "organizer@example.com" } },
              bodyPreview: "Weekly team sync meeting",
              isAllDay: false,
              isCancelled: false
            }
          ]
        };
      }
    }
    
    // Teams endpoints
    if (path.includes('joinedTeams') || path.includes('teams/')) {
      if (path.includes('/teams/')) {
        // Single team response
        return {
          id: "simulated-team-id",
          displayName: "Development Team",
          description: "Main development team for the project - comprehensive simulation",
          visibility: "private",
          createdDateTime: new Date(Date.now() - 86400000 * 30).toISOString(),
          memberSettings: {
            allowCreateUpdateChannels: true,
            allowDeleteChannels: false,
            allowAddRemoveApps: true,
            allowCreateUpdateRemoveConnectors: true,
            allowCreateUpdateRemoveTabs: true
          },
          messagingSettings: {
            allowUserEditMessages: true,
            allowUserDeleteMessages: true,
            allowOwnerDeleteMessages: true,
            allowTeamMentions: true,
            allowChannelMentions: true
          },
          guestSettings: {
            allowCreateUpdateChannels: false,
            allowDeleteChannels: false
          },
          funSettings: {
            allowGiphy: true,
            giphyContentRating: "moderate",
            allowStickersAndMemes: true,
            allowCustomMemes: true
          },
          discoverySettings: {
            showInTeamsSearchAndSuggestions: true
          },
          internalId: "19:team-internal-id-dev"
        };
      } else {
        // Teams list response
        return {
          value: [
            {
              id: "team-1",
              displayName: "Development Team",
              description: "Main development team",
              visibility: "private",
              memberSettings: { allowCreateUpdateChannels: true },
              messagingSettings: { allowUserEditMessages: true },
              funSettings: { allowGiphy: true }
            },
            {
              id: "team-2",
              displayName: "Marketing Team",
              description: "Marketing and communications",
              visibility: "public",
              memberSettings: { allowCreateUpdateChannels: false },
              messagingSettings: { allowUserEditMessages: false },
              funSettings: { allowGiphy: false }
            }
          ]
        };
      }
    }
    
    // Channels endpoints
    if (path.includes('channels') && !path.includes('messages')) {
      if (path.includes('/channels/')) {
        // Single channel response
        return {
          id: "simulated-channel-id",
          displayName: "General",
          description: "General discussion channel",
          email: "general@team.example.com",
          webUrl: "https://teams.microsoft.com/l/channel/...",
          membershipType: "standard",
          createdDateTime: new Date(Date.now() - 86400000 * 20).toISOString(),
          isFavoriteByDefault: true
        };
      } else {
        // Channels list response
        return {
          value: [
            {
              id: "channel-1",
              displayName: "General",
              description: "General discussion",
              email: "general@team.example.com",
              webUrl: "https://teams.microsoft.com/l/channel/...",
              membershipType: "standard",
              createdDateTime: new Date(Date.now() - 86400000 * 20).toISOString()
            },
            {
              id: "channel-2",
              displayName: "Development",
              description: "Development discussions",
              email: "dev@team.example.com",
              webUrl: "https://teams.microsoft.com/l/channel/...",
              membershipType: "standard",
              createdDateTime: new Date(Date.now() - 86400000 * 15).toISOString()
            }
          ]
        };
      }
    }
    
    // Teams messages endpoints
    if (path.includes('messages') && (path.includes('teams/') || path.includes('chats/'))) {
      if (path.includes('/messages/')) {
        // Single message response
        return {
          id: "simulated-message-id",
          messageType: "message",
          createdDateTime: new Date(Date.now() - 3600000).toISOString(),
          lastModifiedDateTime: new Date(Date.now() - 3600000).toISOString(),
          from: {
            user: {
              id: "user-1",
              displayName: "John Doe",
              userIdentityType: "aadUser"
            }
          },
          body: {
            contentType: "html",
            content: "<div>This is a simulated Teams message content</div>"
          },
          attachments: [],
          mentions: [],
          importance: "normal",
          locale: "en-US",
          subject: null,
          webUrl: "https://teams.microsoft.com/l/message/..."
        };
      } else {
        // Messages list response
        return {
          value: [
            {
              id: "message-1",
              messageType: "message",
              createdDateTime: new Date(Date.now() - 3600000).toISOString(),
              from: {
                user: {
                  id: "user-1",
                  displayName: "John Doe"
                }
              },
              body: {
                contentType: "html",
                content: "<div>Hello team! How is everyone doing?</div>"
              },
              attachments: [],
              mentions: [],
              importance: "normal"
            },
            {
              id: "message-2",
              messageType: "message",
              createdDateTime: new Date(Date.now() - 7200000).toISOString(),
              from: {
                user: {
                  id: "user-2",
                  displayName: "Jane Smith"
                }
              },
              body: {
                contentType: "html",
                content: "<div>Good morning! Ready for the sprint review?</div>"
              },
              attachments: [],
              mentions: [],
              importance: "high"
            }
          ]
        };
      }
    }
    
    // Chats endpoints
    if (path.includes('chats') && !path.includes('messages')) {
      if (path.includes('/chats/')) {
        // Single chat response
        return {
          id: "simulated-chat-id",
          topic: "Project Discussion",
          chatType: "group",
          createdDateTime: new Date(Date.now() - 86400000 * 5).toISOString(),
          lastUpdatedDateTime: new Date(Date.now() - 3600000).toISOString(),
          webUrl: "https://teams.microsoft.com/l/chat/...",
          tenantId: "tenant-id",
          onlineMeetingInfo: null
        };
      } else {
        // Chats list response
        return {
          value: [
            {
              id: "chat-1",
              topic: "Project Discussion",
              chatType: "group",
              createdDateTime: new Date(Date.now() - 86400000 * 5).toISOString(),
              lastUpdatedDateTime: new Date(Date.now() - 3600000).toISOString(),
              webUrl: "https://teams.microsoft.com/l/chat/..."
            },
            {
              id: "chat-2",
              topic: "One-on-One",
              chatType: "oneOnOne",
              createdDateTime: new Date(Date.now() - 86400000 * 10).toISOString(),
              lastUpdatedDateTime: new Date(Date.now() - 7200000).toISOString(),
              webUrl: "https://teams.microsoft.com/l/chat/..."
            }
          ]
        };
      }
    }
    
    // Presence endpoints
    if (path.includes('presence')) {
      return {
        id: "user-presence-id",
        availability: "Available",
        activity: "Available",
        statusMessage: "Working on important project"
      };
    }
    
    // Online meetings endpoints
    if (path.includes('onlineMeetings')) {
      if (path.includes('/onlineMeetings/')) {
        // Single meeting response
        return {
          id: "simulated-meeting-id",
          subject: "Team Sync Meeting",
          startDateTime: new Date(Date.now() + 3600000).toISOString(),
          endDateTime: new Date(Date.now() + 7200000).toISOString(),
          joinWebUrl: "https://teams.microsoft.com/l/meetup-join/...",
          allowedPresenters: "organizer",
          isEntryExitAnnounced: false,
          allowAttendeeToEnableCamera: true,
          allowAttendeeToEnableMic: true,
          allowTeamworkReactions: true,
          audioConferencing: {
            conferenceId: "123456789",
            tollNumber: "+1 555-123-4567",
            tollFreeNumber: "+1 800-123-4567"
          },
          participants: {
            organizer: {
              identity: {
                user: {
                  id: "organizer-id",
                  displayName: "Meeting Organizer"
                }
              }
            }
          }
        };
      } else {
        // Meetings list response
        return {
          value: [
            {
              id: "meeting-1",
              subject: "Team Sync Meeting",
              startDateTime: new Date(Date.now() + 3600000).toISOString(),
              endDateTime: new Date(Date.now() + 7200000).toISOString(),
              joinWebUrl: "https://teams.microsoft.com/l/meetup-join/...",
              allowedPresenters: "organizer",
              isEntryExitAnnounced: false,
              audioConferencing: {
                conferenceId: "123456789"
              }
            },
            {
              id: "meeting-2",
              subject: "Project Review",
              startDateTime: new Date(Date.now() + 86400000).toISOString(),
              endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
              joinWebUrl: "https://teams.microsoft.com/l/meetup-join/...",
              allowedPresenters: "everyone",
              isEntryExitAnnounced: true,
              audioConferencing: {
                conferenceId: "987654321"
              }
            }
          ]
        };
      }
    }
    
    // Team members endpoints
    if (path.includes('members')) {
      return {
        value: [
          {
            id: "member-1",
            displayName: "John Doe",
            email: "john.doe@example.com",
            roles: ["owner"],
            userId: "user-id-1",
            tenantId: "tenant-id"
          },
          {
            id: "member-2",
            displayName: "Jane Smith",
            email: "jane.smith@example.com",
            roles: ["member"],
            userId: "user-id-2",
            tenantId: "tenant-id"
          }
        ]
      };
    }
    
    // Calendars endpoints
    if (path.includes('calendars') && !path.includes('events')) {
      if (path.includes('/calendars/')) {
        // Single calendar response
        return {
          id: "simulated-calendar-id",
          name: "Work Calendar",
          color: "lightBlue",
          isDefaultCalendar: true,
          canShare: true,
          canViewPrivateItems: true,
          canEdit: true,
          owner: {
            name: "You",
            address: "you@example.com"
          }
        };
      } else {
        // Calendars list response
        return {
          value: [
            {
              id: "calendar-1",
              name: "Calendar",
              color: "lightBlue",
              isDefaultCalendar: true,
              canShare: true,
              canViewPrivateItems: true,
              canEdit: true,
              owner: { name: "You", address: "you@example.com" }
            },
            {
              id: "calendar-2",
              name: "Work Calendar",
              color: "lightGreen",
              isDefaultCalendar: false,
              canShare: true,
              canViewPrivateItems: true,
              canEdit: true,
              owner: { name: "You", address: "you@example.com" }
            }
          ]
        };
      }
    }
    
    if (path.includes('messages') && !path.includes('sendMail')) {
      // Simulate a successful email list/search response
      if (path.includes('/messages/')) {
        // Single email response
        return {
          id: "simulated-email-id",
          subject: "Simulated Email Subject",
          from: {
            emailAddress: {
              name: "Simulated Sender",
              address: "sender@example.com"
            }
          },
          toRecipients: [{
            emailAddress: {
              name: "Recipient Name",
              address: "recipient@example.com"
            }
          }],
          ccRecipients: [],
          bccRecipients: [],
          receivedDateTime: new Date().toISOString(),
          bodyPreview: "This is a simulated email preview...",
          body: {
            contentType: "text",
            content: "This is the full content of the simulated email. Since we can't connect to the real Microsoft Graph API, we're returning this placeholder content instead."
          },
          hasAttachments: false,
          importance: "normal",
          isRead: false,
          internetMessageHeaders: []
        };
      } else {
        // Email list response
        return {
          value: [
            {
              id: "simulated-email-1",
              subject: "Important Meeting Tomorrow",
              from: {
                emailAddress: {
                  name: "John Doe",
                  address: "john@example.com"
                }
              },
              toRecipients: [{
                emailAddress: {
                  name: "You",
                  address: "you@example.com"
                }
              }],
              ccRecipients: [],
              receivedDateTime: new Date().toISOString(),
              bodyPreview: "Let's discuss the project status...",
              hasAttachments: false,
              importance: "high",
              isRead: false
            },
            {
              id: "simulated-email-2",
              subject: "Weekly Report",
              from: {
                emailAddress: {
                  name: "Jane Smith",
                  address: "jane@example.com"
                }
              },
              toRecipients: [{
                emailAddress: {
                  name: "You",
                  address: "you@example.com"
                }
              }],
              ccRecipients: [],
              receivedDateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              bodyPreview: "Please find attached the weekly report...",
              hasAttachments: true,
              importance: "normal",
              isRead: true
            },
            {
              id: "simulated-email-3",
              subject: "Question about the project",
              from: {
                emailAddress: {
                  name: "Bob Johnson",
                  address: "bob@example.com"
                }
              },
              toRecipients: [{
                emailAddress: {
                  name: "You",
                  address: "you@example.com"
                }
              }],
              ccRecipients: [],
              receivedDateTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              bodyPreview: "I had a question about the timeline...",
              hasAttachments: false,
              importance: "normal",
              isRead: false
            }
          ]
        };
      }
    } else if (path.includes('mailFolders')) {
      // Simulate a mail folders response
      return {
        value: [
          { id: "inbox", displayName: "Inbox" },
          { id: "drafts", displayName: "Drafts" },
          { id: "sentItems", displayName: "Sent Items" },
          { id: "deleteditems", displayName: "Deleted Items" }
        ]
      };
    }
  } else if (method === 'POST') {
    if (path.includes('$batch')) {
      // Simulate batch API response
      const responses = [];
      
      if (data && data.requests && Array.isArray(data.requests)) {
        for (const request of data.requests) {
          let response;
          
          if (request.method === 'GET' && request.url.includes('/me/messages/')) {
            // Simulate successful email read
            const emailId = request.url.split('/').pop();
            response = {
              id: request.id,
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              body: {
                id: emailId,
                subject: `Mock Email ${emailId}`,
                from: {
                  emailAddress: {
                    name: "Mock Sender",
                    address: "sender@example.com"
                  }
                },
                toRecipients: [{
                  emailAddress: {
                    name: "You",
                    address: "you@example.com"
                  }
                }],
                ccRecipients: [],
                bccRecipients: [],
                receivedDateTime: new Date().toISOString(),
                bodyPreview: `This is a mock email preview for ${emailId}...`,
                body: {
                  contentType: "text",
                  content: `This is the full content of mock email ${emailId}. This is simulated content for testing the bulk read functionality.`
                },
                hasAttachments: false,
                importance: "normal",
                isRead: false,
                internetMessageHeaders: []
              }
            };
          } else if (request.method === 'DELETE' && request.url.includes('/me/messages/')) {
            // Simulate successful email deletion
            response = {
              id: request.id,
              status: 204,
              headers: {}
            };
          } else {
            // Simulate error for unknown requests
            response = {
              id: request.id,
              status: 404,
              headers: { 'Content-Type': 'application/json' },
              body: {
                error: {
                  code: 'NotFound',
                  message: 'The requested resource was not found.'
                }
              }
            };
          }
          
          responses.push(response);
        }
      }
      
      return {
        responses: responses
      };
    } else if (path.includes('sendMail')) {
      // Simulate a successful email send
      return {};
    } else if (path.includes('contacts')) {
      // Simulate contact creation
      return {
        id: "new-contact-id",
        displayName: data.displayName || "New Contact",
        ...data
      };
    } else if (path.includes('todo/lists') && path.includes('/tasks')) {
      // Simulate task creation
      return {
        id: "new-task-id",
        title: data.title || "New Task",
        status: "notStarted",
        importance: data.importance || "normal",
        ...data
      };
    } else if (path.includes('todo/lists') && !path.includes('/tasks')) {
      // Simulate task list creation
      return {
        id: "new-list-id",
        displayName: data.displayName || "New List",
        isOwner: true,
        isShared: false,
        ...data
      };
    } else if (path.includes('calendars') && !path.includes('events')) {
      // Simulate calendar creation
      return {
        id: "new-calendar-id",
        name: data.name || "New Calendar",
        color: data.color || "lightBlue",
        isDefaultCalendar: false,
        canShare: true,
        canViewPrivateItems: true,
        canEdit: true,
        ...data
      };
    } else if (path.includes('events')) {
      // Simulate event creation
      return {
        id: "new-event-id",
        subject: data.subject || "New Event",
        start: data.start || { dateTime: new Date().toISOString() },
        end: data.end || { dateTime: new Date(Date.now() + 3600000).toISOString() },
        ...data
      };
    } else if (path.includes('teams/') && path.includes('channels')) {
      // Simulate channel creation
      return {
        id: "new-channel-id",
        displayName: data.displayName || "New Channel",
        description: data.description || "",
        membershipType: data.membershipType || "standard",
        email: `${data.displayName?.toLowerCase().replace(/\s+/g, '')}@team.example.com`,
        webUrl: "https://teams.microsoft.com/l/channel/...",
        ...data
      };
    } else if (path.includes('chats') && !path.includes('messages')) {
      // Simulate chat creation
      return {
        id: "new-chat-id",
        topic: data.topic || "New Chat",
        chatType: data.chatType || "group",
        createdDateTime: new Date().toISOString(),
        lastUpdatedDateTime: new Date().toISOString(),
        webUrl: "https://teams.microsoft.com/l/chat/...",
        ...data
      };
    } else if (path.includes('messages')) {
      // Simulate message sending
      return {
        id: "new-message-id",
        messageType: "message",
        createdDateTime: new Date().toISOString(),
        lastModifiedDateTime: new Date().toISOString(),
        from: {
          user: {
            id: "current-user-id",
            displayName: "Current User"
          }
        },
        body: {
          contentType: data.body?.contentType || "html",
          content: data.body?.content || data.content || "Message content"
        },
        importance: data.importance || "normal",
        ...data
      };
    } else if (path.includes('onlineMeetings')) {
      // Simulate online meeting creation
      return {
        id: "new-meeting-id",
        subject: data.subject || "New Meeting",
        startDateTime: data.startDateTime || new Date(Date.now() + 3600000).toISOString(),
        endDateTime: data.endDateTime || new Date(Date.now() + 7200000).toISOString(),
        joinWebUrl: "https://teams.microsoft.com/l/meetup-join/...",
        allowedPresenters: data.allowedPresenters || "organizer",
        isEntryExitAnnounced: data.isEntryExitAnnounced || false,
        allowAttendeeToEnableCamera: data.allowAttendeeToEnableCamera !== false,
        allowAttendeeToEnableMic: data.allowAttendeeToEnableMic !== false,
        allowTeamworkReactions: data.allowTeamworkReactions !== false,
        audioConferencing: {
          conferenceId: "123456789",
          tollNumber: "+1 555-123-4567"
        },
        ...data
      };
    } else if (path.includes('presence/setPresence')) {
      // Simulate presence setting
      return {};
    } else if (path.includes('getPresencesByUserId')) {
      // Simulate multiple users presence
      return {
        value: (data.ids || []).map(id => ({
          id: id,
          availability: "Available",
          activity: "Available",
          statusMessage: "Simulated status"
        }))
      };
    } else if (path.includes('reply') || path.includes('forward')) {
      // Simulate email reply/forward
      return {};
    }
  } else if (method === 'PATCH') {
    // Simulate updates - return the updated object
    if (path.includes('contacts')) {
      return {
        id: path.split('/').pop(),
        displayName: data.displayName || "Updated Contact",
        ...data
      };
    } else if (path.includes('todo') && path.includes('/tasks/')) {
      return {
        id: path.split('/').pop(),
        title: data.title || "Updated Task",
        ...data
      };
    } else if (path.includes('calendars') && !path.includes('events')) {
      return {
        id: path.split('/').pop(),
        name: data.name || "Updated Calendar",
        ...data
      };
    } else if (path.includes('events')) {
      return {
        id: path.split('/').pop(),
        subject: data.subject || "Updated Event",
        ...data
      };
    } else if (path.includes('messages')) {
      return {
        id: path.split('/').pop(),
        subject: "Updated Email",
        ...data
      };
    } else if (path.includes('teams/') && path.includes('channels')) {
      return {
        id: path.split('/').pop(),
        displayName: data.displayName || "Updated Channel",
        description: data.description || "",
        membershipType: "standard",
        ...data
      };
    } else if (path.includes('onlineMeetings')) {
      return {
        id: path.split('/').pop(),
        subject: data.subject || "Updated Meeting",
        startDateTime: data.startDateTime || new Date(Date.now() + 3600000).toISOString(),
        endDateTime: data.endDateTime || new Date(Date.now() + 7200000).toISOString(),
        joinWebUrl: "https://teams.microsoft.com/l/meetup-join/...",
        ...data
      };
    }
  } else if (method === 'DELETE') {
    // Simulate successful deletion
    return {};
  }
  
  // If we get here, we don't have a simulation for this endpoint
  console.error(`No simulation available for: ${method} ${path}`);
  return {};
}

module.exports = {
  simulateGraphAPIResponse
};
