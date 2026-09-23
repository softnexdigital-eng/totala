export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetches a backend endpoint from the server side and safely parses the JSON
 * body.
 *
 * This guards against the common failure of an upstream backend returning a
 * non-JSON response (e.g. an Express HTML 404 page like
 * `<!DOCTYPE html>...<title>Error</title>`) which would otherwise make
 * `response.json()` throw:
 *   SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
 *
 * Returns the parsed JSON body, or `null` when:
 *   - there is no token,
 *   - the response status is not ok,
 *   - the response content-type is not JSON,
 *   - the network/JSON parsing fails.
 */
export async function fetchBackendJson(
  path: string,
  token: string | undefined,
  init: RequestInit = {}
) {
  if (!token) return null;

  try {
    const options: RequestInit = {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    };

    // Apply a sane default cache policy unless the caller already set one
    // (cache/no-store and next.revalidate are mutually exclusive in Next.js).
    if (options.cache === undefined && options.next === undefined) {
      options.cache = 'no-store';
    }

    const response = await fetch(`${process.env.BACKEND_URL}${path}`, options);

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export const endpoints = {
  auth: {
    login: '/auth/login',
    verifyOtp: '/auth/verify-otp',
    logout: '/auth/logout',
  },
  patients: '/patients',
  doctors: '/doctors',
  agents: '/agents',
  permissions: '/permissions',
  appointments: '/appointments',
  tasks: '/tasks',
  tasksTracking: '/tasks/tracking',
  payments: '/payments',
  reports: {
    daily: '/reports/daily',
    monthly: '/reports/monthly',
    financial: '/reports/financial',
    dailySummary: '/reports/daily-summary',
  },
  audit: '/audit-logs',
  search: '/search',
  dashboard: {
    summary: '/dashboard/summary',
  },
};
