import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { i18nOptions } from "./config.js";
import middleware from "i18next-http-middleware";

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init(i18nOptions);

export default i18next;
