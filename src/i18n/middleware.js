import middleware from "i18next-http-middleware";
import i18next from "./index.js";

export const i18nMiddleware = middleware.handle(i18next);
