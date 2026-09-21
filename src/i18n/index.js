import i18next from "i18next";
import middleware from "i18next-http-middleware";
import { i18nOptions } from "./config.js";

i18next.use(middleware.LanguageDetector).init(i18nOptions);

export default i18next;