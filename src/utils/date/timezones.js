/**
 * Curated list of IANA timezones grouped by region.
 * Used for dropdown menus on the frontend.
 *
 * Country → default timezone mapping is also provided for admin convenience.
 */

export const TIMEZONES_LIST = [
  // Africa
  { value: "Africa/Cairo", label: "Cairo (UTC+2/+3)", region: "Africa" },
  { value: "Africa/Casablanca", label: "Casablanca (UTC+0/+1)", region: "Africa" },
  { value: "Africa/Johannesburg", label: "Johannesburg (UTC+2)", region: "Africa" },
  { value: "Africa/Lagos", label: "Lagos (UTC+1)", region: "Africa" },
  { value: "Africa/Nairobi", label: "Nairobi (UTC+3)", region: "Africa" },
  { value: "Africa/Tunis", label: "Tunis (UTC+1)", region: "Africa" },
  { value: "Africa/Tripoli", label: "Tripoli (UTC+2)", region: "Africa" },

  // Asia
  { value: "Asia/Riyadh", label: "Riyadh (UTC+3)", region: "Asia" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)", region: "Asia" },
  { value: "Asia/Kuwait", label: "Kuwait (UTC+3)", region: "Asia" },
  { value: "Asia/Baghdad", label: "Baghdad (UTC+3)", region: "Asia" },
  { value: "Asia/Beirut", label: "Beirut (UTC+2/+3)", region: "Asia" },
  { value: "Asia/Amman", label: "Amman (UTC+2/+3)", region: "Asia" },
  { value: "Asia/Jerusalem", label: "Jerusalem (UTC+2/+3)", region: "Asia" },
  { value: "Asia/Kolkata", label: "India (UTC+5:30)", region: "Asia" },
  { value: "Asia/Karachi", label: "Karachi (UTC+5)", region: "Asia" },
  { value: "Asia/Dhaka", label: "Dhaka (UTC+6)", region: "Asia" },
  { value: "Asia/Jakarta", label: "Jakarta (UTC+7)", region: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai (UTC+8)", region: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)", region: "Asia" },
  { value: "Asia/Seoul", label: "Seoul (UTC+9)", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)", region: "Asia" },
  { value: "Asia/Muscat", label: "Muscat (UTC+4)", region: "Asia" },
  { value: "Asia/Qatar", label: "Qatar (UTC+3)", region: "Asia" },
  { value: "Asia/Bahrain", label: "Bahrain (UTC+3)", region: "Asia" },

  // Europe
  { value: "Europe/London", label: "London (UTC+0/+1)", region: "Europe" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)", region: "Europe" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1/+2)", region: "Europe" },
  { value: "Europe/Rome", label: "Rome (UTC+1/+2)", region: "Europe" },
  { value: "Europe/Athens", label: "Athens (UTC+2/+3)", region: "Europe" },
  { value: "Europe/Istanbul", label: "Istanbul (UTC+3)", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow (UTC+3)", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Amsterdam (UTC+1/+2)", region: "Europe" },
  { value: "Europe/Stockholm", label: "Stockholm (UTC+1/+2)", region: "Europe" },

  // Americas
  { value: "America/New_York", label: "New York (UTC-5/-4)", region: "Americas" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)", region: "Americas" },
  { value: "America/Denver", label: "Denver (UTC-7/-6)", region: "Americas" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)", region: "Americas" },
  { value: "America/Toronto", label: "Toronto (UTC-5/-4)", region: "Americas" },
  { value: "America/Vancouver", label: "Vancouver (UTC-8/-7)", region: "Americas" },
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)", region: "Americas" },
  { value: "America/Mexico_City", label: "Mexico City (UTC-6/-5)", region: "Americas" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (UTC-3)", region: "Americas" },

  // Pacific & Oceania
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)", region: "Oceania" },
  { value: "Australia/Melbourne", label: "Melbourne (UTC+10/+11)", region: "Oceania" },
  { value: "Pacific/Auckland", label: "Auckland (UTC+12/+13)", region: "Oceania" },

  // UTC
  { value: "UTC", label: "UTC (UTC+0)", region: "UTC" },
];

/**
 * Mapping from country code/name → default IANA timezone.
 * Admin can select country and the timezone gets auto-filled.
 */
export const COUNTRY_TO_TIMEZONE = {
  EG: "Africa/Cairo",       // Egypt
  SA: "Asia/Riyadh",        // Saudi Arabia
  AE: "Asia/Dubai",         // UAE
  KW: "Asia/Kuwait",        // Kuwait
  QA: "Asia/Qatar",         // Qatar
  BH: "Asia/Bahrain",       // Bahrain
  OM: "Asia/Muscat",        // Oman
  IQ: "Asia/Baghdad",       // Iraq
  JO: "Asia/Amman",         // Jordan
  LB: "Asia/Beirut",        // Lebanon
  SY: "Asia/Damascus",      // Syria
  PS: "Asia/Gaza",          // Palestine
  YE: "Asia/Aden",          // Yemen
  MA: "Africa/Casablanca",  // Morocco
  TN: "Africa/Tunis",       // Tunisia
  LY: "Africa/Tripoli",     // Libya
  DZ: "Africa/Algiers",     // Algeria
  SD: "Africa/Khartoum",    // Sudan
  TR: "Europe/Istanbul",    // Turkey
  GB: "Europe/London",      // UK
  DE: "Europe/Berlin",      // Germany
  FR: "Europe/Paris",       // France
  US: "America/New_York",   // USA (default east coast)
  CA: "America/Toronto",    // Canada (default)
  PK: "Asia/Karachi",       // Pakistan
  IN: "Asia/Kolkata",       // India
  NG: "Africa/Lagos",       // Nigeria
  ZA: "Africa/Johannesburg",// South Africa
  KE: "Africa/Nairobi",     // Kenya
  AU: "Australia/Sydney",   // Australia
};

/**
 * Get timezone for a given country code.
 * Falls back to Africa/Cairo if country not found.
 * @param {string} countryCode - ISO 3166-1 alpha-2 code (e.g. "EG")
 * @returns {string}
 */
export const getTimezoneByCountry = (countryCode) => {
  return COUNTRY_TO_TIMEZONE[countryCode?.toUpperCase()] || "Africa/Cairo";
};

/**
 * Get all timezone values as a flat array (for Joi validation).
 */
export const VALID_TIMEZONE_VALUES = TIMEZONES_LIST.map((tz) => tz.value);
