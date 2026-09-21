import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const enCommon = readJson(path.join(__dirname, "locales/en/common.json"));
const arCommon = readJson(path.join(__dirname, "locales/ar/common.json"));
const enCourse = readJson(path.join(__dirname, "locales/en/course.json"));
const arCourse = readJson(path.join(__dirname, "locales/ar/course.json"));

export const SUPPORTED_LANGUAGES = ["en", "ar"];
export const DEFAULT_LOCALE = "en";
export const NAMESPACES = ["common", "course"];

export const i18nOptions = {
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LANGUAGES,
  preload: SUPPORTED_LANGUAGES,
  ns: NAMESPACES,
  defaultNS: "common",
  fallbackNS: NAMESPACES,
  resources: {
    en: { common: enCommon, course: enCourse },
    ar: { common: arCommon, course: arCourse },
  },
  detection: {
    order: ["querystring", "header"],
    lookupQuerystring: "lang",
    lookupHeader: "accept-language",
  },
};