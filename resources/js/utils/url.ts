/**
 * Helper to get the correct application absolute URL for assets, API endpoints, etc.
 * taking into account any subdirectory hosting (e.g. /kunker).
 */
export const getAppUrl = (path: string): string => {
  const baseUrl = (window as any).APP_URL || '';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  if (!cleanBase) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  return `${cleanBase}/${cleanPath}`;
};

/**
 * Helper to get the API base URL.
 */
export const getApiBaseUrl = (): string => {
  const customApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  
  // If absolute URL is provided in env (e.g. http://localhost:8000/api), use it directly
  if (customApiUrl && (customApiUrl.startsWith('http://') || customApiUrl.startsWith('https://'))) {
    return customApiUrl;
  }
  
  // Otherwise, prefix it with the app base URL
  const apiPath = customApiUrl || '/api';
  return getAppUrl(apiPath);
};

/**
 * Helper to get the React Router basename dynamically.
 */
export const getRouterBasename = (): string => {
  const baseUrl = (window as any).APP_URL || '';
  if (!baseUrl) return '/';
  
  try {
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      const urlObj = new URL(baseUrl);
      const path = urlObj.pathname;
      const cleanPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      return cleanPath || '/';
    } else {
      const path = baseUrl;
      const cleanPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
      return cleanPath || '/';
    }
  } catch {
    return '/';
  }
};
