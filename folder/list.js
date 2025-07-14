/**
 * List folders functionality
 */
const { callGraphAPI } = require('../utils/graph-api');
const { ensureAuthenticated, createAuthRequiredResponse } = require('../auth');

/**
 * List folders handler
 * @param {object} args - Tool arguments
 * @returns {object} - MCP response
 */
async function handleListFolders(args) {
  const includeItemCounts = args.includeItemCounts === true;
  const includeChildren = args.includeChildren === true;
  
  try {
    // Get access token
    const accessToken = await ensureAuthenticated();
    
    // Check if authentication is required
    if (!accessToken) {
      return await createAuthRequiredResponse('list-folders');
    }
    
    // Get all mail folders
    const folders = await getAllFoldersHierarchy(accessToken, includeItemCounts);
    
    // If including children, format as hierarchy
    if (includeChildren) {
      return {
        content: [{ 
          type: "text", 
          text: formatFolderHierarchy(folders, includeItemCounts)
        }]
      };
    } else {
      // Otherwise, format as flat list
      return {
        content: [{ 
          type: "text", 
          text: formatFolderList(folders, includeItemCounts)
        }]
      };
    }
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: `Error listing folders: ${error.message}`
      }]
    };
  }
}

/**
 * Get all mail folders with hierarchy information
 * @param {string} accessToken - Access token
 * @param {boolean} includeItemCounts - Include item counts in response
 * @returns {Promise<Array>} - Array of folder objects with hierarchy
 */
async function getAllFoldersHierarchy(accessToken, includeItemCounts) {
  try {
    // Import the recursive folder utility
    const { getAllFoldersRecursive } = require('../email/folder-utils');
    
    // Get all folders recursively
    const allFolders = await getAllFoldersRecursive(accessToken);
    
    // Add hierarchy metadata
    const foldersWithHierarchy = allFolders.map(folder => {
      // Determine if it's a top-level folder (no parent or parent is root)
      const isTopLevel = !folder.parentFolderId;
      
      // Extract parent folder name from path if available
      let parentFolder = null;
      if (folder.path && folder.path.includes('/')) {
        const pathParts = folder.path.split('/');
        if (pathParts.length > 1) {
          parentFolder = pathParts[pathParts.length - 2]; // Get immediate parent
        }
      }
      
      return {
        ...folder,
        isTopLevel,
        parentFolder,
        level: folder.path ? folder.path.split('/').length - 1 : 0
      };
    });
    
    return foldersWithHierarchy;
  } catch (error) {
    console.error(`Error getting all folders: ${error.message}`);
    throw error;
  }
}

/**
 * Format folders as a flat list
 * @param {Array} folders - Array of folder objects
 * @param {boolean} includeItemCounts - Whether to include item counts
 * @returns {string} - Formatted list
 */
function formatFolderList(folders, includeItemCounts) {
  if (!folders || folders.length === 0) {
    return "No folders found.";
  }
  
  // Sort folders alphabetically, with well-known folders first
  const wellKnownFolderNames = ['Inbox', 'Drafts', 'Sent Items', 'Deleted Items', 'Junk Email', 'Archive'];
  
  const sortedFolders = [...folders].sort((a, b) => {
    // Well-known folders come first
    const aIsWellKnown = wellKnownFolderNames.includes(a.displayName);
    const bIsWellKnown = wellKnownFolderNames.includes(b.displayName);
    
    if (aIsWellKnown && !bIsWellKnown) return -1;
    if (!aIsWellKnown && bIsWellKnown) return 1;
    
    if (aIsWellKnown && bIsWellKnown) {
      // Sort well-known folders by their index in the array
      return wellKnownFolderNames.indexOf(a.displayName) - wellKnownFolderNames.indexOf(b.displayName);
    }
    
    // Sort other folders alphabetically
    return a.displayName.localeCompare(b.displayName);
  });
  
  // Format each folder
  const folderLines = sortedFolders.map(folder => {
    let folderInfo = folder.displayName;
    
    // Add full path info if available (shows complete hierarchy)
    if (folder.path && folder.path !== folder.displayName) {
      folderInfo += ` (${folder.path})`;
    }
    
    // Add item counts if requested
    if (includeItemCounts) {
      const unreadCount = folder.unreadItemCount || 0;
      const totalCount = folder.totalItemCount || 0;
      folderInfo += ` - ${totalCount} items`;
      
      if (unreadCount > 0) {
        folderInfo += ` (${unreadCount} unread)`;
      }
    }
    
    return folderInfo;
  });
  
  return `Found ${folders.length} folders:\n\n${folderLines.join('\n')}`;
}

/**
 * Format folders as a hierarchical tree
 * @param {Array} folders - Array of folder objects
 * @param {boolean} includeItemCounts - Whether to include item counts
 * @returns {string} - Formatted hierarchy
 */
function formatFolderHierarchy(folders, includeItemCounts) {
  if (!folders || folders.length === 0) {
    return "No folders found.";
  }
  
  // Sort folders by their path to ensure proper hierarchy display
  const sortedFolders = folders.sort((a, b) => {
    const pathA = a.path || a.displayName;
    const pathB = b.path || b.displayName;
    return pathA.localeCompare(pathB);
  });
  
  // Format each folder with appropriate indentation based on its level
  const formattedLines = sortedFolders.map(folder => {
    const level = folder.level || 0;
    const indent = '  '.repeat(level);
    let line = `${indent}${folder.displayName}`;
    
    // Add item counts if requested
    if (includeItemCounts) {
      const unreadCount = folder.unreadItemCount || 0;
      const totalCount = folder.totalItemCount || 0;
      line += ` - ${totalCount} items`;
      
      if (unreadCount > 0) {
        line += ` (${unreadCount} unread)`;
      }
    }
    
    return line;
  });
  
  return `Folder Hierarchy (${folders.length} folders):\n\n${formattedLines.join('\n')}`;
}

module.exports = handleListFolders;
