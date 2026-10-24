/**
 * Centralized API Configuration
 * Requirement #12:
 * "Create one API configuration: const API_BASE_URL = 'http://localhost:8080/api';
 * Do not repeat the backend URL throughout the application."
 */

// In browser preview, defaults to '/api' (proxied through Express full-stack runtime),
// or can point directly to 'http://localhost:8080/api' if the user starts Spring Boot locally.
export const DEFAULT_API_BASE_URL = '/api';

class ApiConfigManager {
  private baseUrl: string = DEFAULT_API_BASE_URL;

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }
}

export const apiConfig = new ApiConfigManager();

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = apiConfig.getBaseUrl();
  const url = `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok && !data.message) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return data;
}
