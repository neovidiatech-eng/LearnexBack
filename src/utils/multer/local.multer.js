import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

export const localFileUpload = ({
  customPath = "general",
  validation = [],
  maxSizeInMB = 5,
} = {}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const resolvedPath =
          typeof customPath === "function"
            ? customPath(req)
            : customPath;

        const uploadPath = path.resolve(`uploads/${resolvedPath}`);

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },

    filename: (req, file, cb) => {
      try {
        const ext = path.extname(file.originalname);

        const uniqueFileName = `${Date.now()}-${nanoid(6)}${ext}`;

        const resolvedPath =
          typeof customPath === "function"
            ? customPath(req)
            : customPath;

        file.relativeDestination =
          `uploads/${resolvedPath}/${uniqueFileName}`.replace(/\\/g, "/");

        cb(null, uniqueFileName);
      } catch (error) {
        cb(error);
      }
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      validation.length === 0 ||
      validation.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    const error = new Error("INVALID_FILE_FORMAT");
    error.cause = 400;

    return cb(error, false);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeInMB * 1024 * 1024,
    },
  });
};