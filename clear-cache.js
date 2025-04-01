const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to delete directory recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    console.log(`Attempting to delete: ${folderPath}`);
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`Successfully deleted: ${folderPath}`);
    } catch (err) {
      console.error(`Error deleting ${folderPath}:`, err);
    }
  } else {
    console.log(`Folder does not exist: ${folderPath}`);
  }
}

// Clear Next.js cache
const nextCacheDir = path.join(__dirname, '.next');
const nodeCacheDir = path.join(__dirname, 'node_modules', '.cache');

console.log('Clearing Next.js cache...');
deleteFolderRecursive(nextCacheDir);
deleteFolderRecursive(nodeCacheDir);

console.log('Cache cleared successfully!'); 