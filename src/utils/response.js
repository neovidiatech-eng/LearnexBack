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

//success response
export const successResponse = ({
  res,
  message = "SUCCESS",
  status = 200,
  data = {},
} = {}) => {
  if (status === 204) {
    return res.status(204).send();
  }
  return res.status(status).json({ message, data });
};

//global error handling
export const globalErrorHandling = (error, req, res, next) => {
  return res.status(error.cause || 400).json({
    message: error.message,
    error,
    stack: process.env.MOOD === "DEV" ? error.stack : undefined,
  });
};
