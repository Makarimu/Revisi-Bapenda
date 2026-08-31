declare global {
  interface Window {
    __APP_CONFIG__?: {
      basePath?: string;
      apiUrl?: string;
      csrfToken?: string;
    };
  }
}

export const getBasePath = (): string => {
  if (typeof window !== 'undefined') {
    if (window.__APP_CONFIG__?.basePath !== undefined && window.__APP_CONFIG__.basePath !== '') {
      return window.__APP_CONFIG__.basePath.replace(/\/+$/, '');
    }
    // Fallback detection from window.location if config is empty / not injected
    const path = window.location.pathname;
    const match = path.match(/^(\/[^/]+\/public)/);
    if (match) return match[1];
  }
  return '';
};

export const getApiUrl = (): string => {
  const customApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (customApi) return customApi;
  const basePath = getBasePath();
  return basePath ? `${basePath}/api` : '/api';
};

export const assetUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const basePath = getBasePath();
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
};

