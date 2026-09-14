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
 * Transforms relative file path to full accessible URL
 * @param {string} relativeFilePath 
 * @param {object} [req] 
 * @returns {string|null}
 */
export const getFileUrl = (relativeFilePath, req = null) => {
  if (!relativeFilePath) return null;
  if (relativeFilePath.startsWith("http://") || relativeFilePath.startsWith("https://")) {
    return relativeFilePath;
  }

  const normalizedPath = relativeFilePath.replace(/\\/g, "/").replace(/^\/+/, "");

  if (req && typeof req.get === "function") {
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;
    return `${protocol}://${host}/${normalizedPath}`;
  }

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl.replace(/\/+$/, "")}/${normalizedPath}`;
};
