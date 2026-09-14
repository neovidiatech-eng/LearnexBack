import path from "path"
import { fileURLToPath } from "url"
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const SUPPORTED_LANGUAGES = ["en", "ar"]
export const DEFAULT_LOCALE = "en"
export const NAMESPACES = ["common","course"]

export const i18nOptions = {
    fallbackLng : DEFAULT_LOCALE,
    supportedLngs : SUPPORTED_LANGUAGES,
    preload:SUPPORTED_LANGUAGES,
    ns:NAMESPACES,
    defaultNS:"common",
    fallbackNS:NAMESPACES,
    backend:{
        loadPath:path.join(__dirname,'/locales/{{lng}}/{{ns}}.json'),
    },
    detection:{
        order:["querystring","header"],
        lookupQuerystring:"lng",
    }
    
}