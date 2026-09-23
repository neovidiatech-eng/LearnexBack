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
  const messageKey = error.message || "INTERNAL_SERVER_ERROR";
  const translatedMessage = req?.t ? req.t(messageKey, { defaultValue: messageKey }) : messageKey;

  return res.status(error.cause || 400).json({
    message: translatedMessage,
    status:error.cause,
    success:false,
    stack: process.env.MOOD === "DEV" ? error.stack : undefined,
  });
};
