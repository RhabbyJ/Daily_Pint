export const site = {
  name: import.meta.env.PUBLIC_SITE_NAME || "The Daily Pint",
  description:
    import.meta.env.PUBLIC_SITE_DESCRIPTION ||
    "Neighborhood bar serving cold beer, cocktails, and good company.",
  phone: import.meta.env.PUBLIC_BAR_PHONE || "",
  address: import.meta.env.PUBLIC_BAR_ADDRESS || "",
  instagramUrl: import.meta.env.PUBLIC_BAR_INSTAGRAM_URL || "",
  tallyFormId: import.meta.env.PUBLIC_TALLY_FORM_ID || "",
  googleCalendarEmbedUrl: import.meta.env.PUBLIC_GOOGLE_CALENDAR_EMBED_URL || "",
  googleMapsEmbedUrl: import.meta.env.PUBLIC_GOOGLE_MAPS_EMBED_URL || "",
};
