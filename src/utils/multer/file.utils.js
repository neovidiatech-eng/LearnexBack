import fs from "fs";
import path from "path";

/**
 *
 * @param {string} relativeFilePath
 */
export const deleteFile = (relativeFilePath) => {
  if (!relativeFilePath) return false;

  const fullPath = path.resolve(relativeFilePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      return true;
    } catch (error) {
      console.error(`Failed to delete file at ${fullPath}:`, error);
      return false;
    }
  }
  return false;
};

/**
 *
 * @param {string[]} filePaths
 */
export const deleteFiles = (filePaths = []) => {
  for (const filePath of filePaths) {
    deleteFile(filePath);
  }
};
