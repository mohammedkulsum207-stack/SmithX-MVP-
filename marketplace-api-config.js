/*
 * SMITHX API connection settings.
 *
 * 1. Deploy the backend to an HTTPS host.
 * 2. Set apiBaseUrl to the backend origin, with no trailing slash.
 * 3. Only set enableRemoteCatalogue to true after reviewing the API's
 *    authentication, authorization, CORS and product moderation controls.
 *
 * Do not put API keys, database credentials, payment secrets or other
 * private credentials in this public file.
 */
window.SMX_MARKETPLACE_CONFIG = {
  apiBaseUrl: "",
  enableRemoteCatalogue: false
};
