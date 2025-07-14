/**
 * Email folder utilities
 */
const { callGraphAPI } = require('../utils/graph-api');

/**
 * Cache of folder information to reduce API calls
 * Format: { userId: { folderName: { id, path } } }
 */
const folderCache = {};

/**
 * Resolve a folder name to its endpoint path
 * @param {string} accessToken - Access token
 * @param {string} folderName - Folder name to resolve
 * @returns {Promise<string>} - Resolved endpoint path
 */
async function resolveFolderPath(accessToken, folderName) {
  // Default to inbox if no folder specified
  if (!folderName) {
    return 'me/messages';
  }
  
  // Handle well-known folder names
  const wellKnownFolders = {
    'inbox': 'me/messages',
    'drafts': 'me/mailFolders/drafts/messages',
    'sent': 'me/mailFolders/sentItems/messages',
    'deleted': 'me/mailFolders/deletedItems/messages',
    'junk': 'me/mailFolders/junkemail/messages',
    'archive': 'me/mailFolders/archive/messages'
  };
  
  // Check if it's a well-known folder (case-insensitive)
  const lowerFolderName = folderName.toLowerCase();
  if (wellKnownFolders[lowerFolderName]) {
    console.error(`Using well-known folder path for "${folderName}"`);
    return wellKnownFolders[lowerFolderName];
  }
  
  try {
    // Try to find the folder by name
    const folderId = await getFolderIdByName(accessToken, folderName);
    if (folderId) {
      const path = `me/mailFolders/${folderId}/messages`;
      console.error(`Resolved folder "${folderName}" to path: ${path}`);
      return path;
    }
    
    // If not found, fall back to inbox
    console.error(`Couldn't find folder "${folderName}", falling back to inbox`);
    return 'me/messages';
  } catch (error) {
    console.error(`Error resolving folder "${folderName}": ${error.message}`);
    return 'me/messages';
  }
}

/**
 * Get the ID of a mail folder by its name (recursive search through all levels)
 * @param {string} accessToken - Access token
 * @param {string} folderName - Name of the folder to find
 * @returns {Promise<string|null>} - Folder ID or null if not found
 */
async function getFolderIdByName(accessToken, folderName) {
  try {
    console.error(`Looking for folder with name "${folderName}"`);
    
    // Get all folders recursively
    const allFolders = await getAllFoldersRecursive(accessToken);
    
    // First try exact match (case-sensitive)
    let matchingFolder = allFolders.find(
      folder => folder.displayName === folderName
    );
    
    // If no exact match, try case-insensitive
    if (!matchingFolder) {
      const lowerFolderName = folderName.toLowerCase();
      matchingFolder = allFolders.find(
        folder => folder.displayName.toLowerCase() === lowerFolderName
      );
    }
    
    if (matchingFolder) {
      console.error(`Found folder "${folderName}" with ID: ${matchingFolder.id} at path: ${matchingFolder.path || 'root'}`);
      return matchingFolder.id;
    }
    
    console.error(`No folder found matching "${folderName}"`);
    return null;
  } catch (error) {
    console.error(`Error finding folder "${folderName}": ${error.message}`);
    return null;
  }
}

/**
 * Recursively get all mail folders at all levels
 * @param {string} accessToken - Access token
 * @param {string} parentId - Parent folder ID (optional)
 * @param {string} parentPath - Parent folder path for tracking (optional)
 * @returns {Promise<Array>} - Array of all folder objects with path information
 */
async function getAllFoldersRecursive(accessToken, parentId = null, parentPath = '') {
  try {
    // Determine endpoint based on whether we're getting child folders or root folders
    const endpoint = parentId ? `me/mailFolders/${parentId}/childFolders` : 'me/mailFolders';
    
    const response = await callGraphAPI(
      accessToken,
      'GET',
      endpoint,
      null,
      { 
        $top: 100,
        $select: 'id,displayName,parentFolderId,childFolderCount,totalItemCount,unreadItemCount'
      }
    );
    
    if (!response.value || response.value.length === 0) {
      return [];
    }
    
    const folders = [];
    
    for (const folder of response.value) {
      // Add path information to folder
      const folderPath = parentPath ? `${parentPath}/${folder.displayName}` : folder.displayName;
      const folderWithPath = {
        ...folder,
        path: folderPath
      };
      
      folders.push(folderWithPath);
      
      // If this folder has child folders, recursively get them
      if (folder.childFolderCount > 0) {
        try {
          const childFolders = await getAllFoldersRecursive(accessToken, folder.id, folderPath);
          folders.push(...childFolders);
        } catch (error) {
          console.error(`Error getting child folders for "${folder.displayName}": ${error.message}`);
        }
      }
    }
    
    return folders;
  } catch (error) {
    console.error(`Error getting folders recursively: ${error.message}`);
    return [];
  }
}

/**
 * Get all mail folders (uses recursive function for complete hierarchy)
 * @param {string} accessToken - Access token
 * @returns {Promise<Array>} - Array of folder objects
 */
async function getAllFolders(accessToken) {
  try {
    // Use the recursive function to get all folders at all levels
    return await getAllFoldersRecursive(accessToken);
  } catch (error) {
    console.error(`Error getting all folders: ${error.message}`);
    return [];
  }
}

module.exports = {
  resolveFolderPath,
  getFolderIdByName,
  getAllFolders,
  getAllFoldersRecursive
};
