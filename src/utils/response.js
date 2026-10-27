import { deleteUploadedFiles } from "./multer/file.utils.js";

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      if (!error.cause) {
        error.cause = 500;
      }
      return next(error);
    });
  };
};

// success response with i18n translation support
export const successResponse = ({
  res,
  message = "SUCCESS",
  status = 200,
  data = {},
} = {}) => {
  if (status === 204) {
    return res.status(204).send();
  }
  const req = res.req;
  const translatedMessage = req?.t ? req.t(message, { defaultValue: message }) : message;
  return res.status(status).json({ message: translatedMessage, data });
};

// global error handling with i18n translation support
export const globalErrorHandling = (error, req, res, next) => {
  // Clean up any uploaded files if an error occurred during request processing
  deleteUploadedFiles(req);

  const status =
    typeof error.cause === "number" && error.cause >= 400 && error.cause < 600
      ? error.cause
      : 400;

  const rawMessage = error.message || "INTERNAL_SERVER_ERROR";

  // In production, do not leak raw 500 runtime or database errors
  const is500 = status >= 500;
  const isDev = process.env.MOOD === "DEV";
  const messageKey = is500 && !isDev ? "INTERNAL_SERVER_ERROR" : rawMessage;

  const translatedMessage = req?.t
    ? req.t(messageKey, { defaultValue: messageKey })
    : messageKey;

  return res.status(status).json({
    message: translatedMessage,
    code: rawMessage,
    status: status,
    success: false,
    stack: isDev ? error.stack : undefined,
  });
};

export const throwError = ({message,status}) => {
  const err = new Error(message || "INTERNAL_SERVER_ERROR");
  err.cause = typeof status === "number" ? status : 400;
  throw err;
};
