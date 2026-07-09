/** Base path when served behind office-portal (e.g. /lunch). Empty in standalone dev. */
export const basePath = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/$/, '');

export const routerBasename = basePath || undefined;

export const withBasePath = (path) => `${basePath}${path}`;
