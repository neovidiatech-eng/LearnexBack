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

/**
 * Delete all files uploaded in the current request (req.file or req.files)
 * @param {object} req
 */
export const deleteUploadedFiles = (req) => {
  if (!req) return;

  // Single file (req.file)
  if (req.file) {
    deleteFile(req.file.path || req.file.relativeDestination);
  }

  // Multiple files (req.files: Array or Object of fields)
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        deleteFile(file.path || file.relativeDestination);
      });
    } else if (typeof req.files === "object") {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            deleteFile(file.path || file.relativeDestination);
          });
        }
      });
    }
  }
};

