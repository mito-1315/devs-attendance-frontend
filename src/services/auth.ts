import API_BASE_URL from '../config/api';

export interface User {
  username: string;
  name?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: any[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Cache keys
const AUTH_CACHE_KEY = 'devs_attendance_auth';
const USER_CACHE_KEY = 'devs_attendance_user';

/**
 * Login function that calls the backend API
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Cache the authentication state
      cacheAuthState(true, {
        username: data.user[0],
        name: data.user[1],
        email: data.user[2],
        role: data.user[5],
        isAdmin: data.admin === 'TRUE',
      });
      return data;
    } else {
      return {
        success: false,
        message: data.message || 'Login failed',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  name: string,
  roll_number: string,
  department: string,
  team: string,
  role: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/createuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        name,
        roll_number,
        department,
        team,
        role,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'User created successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create user',
      };
    }
  } catch (error) {
    console.error('Create user error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Logout function
 */
export function logout(): void {
  clearAuthCache();
}

/**
 * Check if user is authenticated (from cache)
 */
export function isAuthenticated(): boolean {
  const authState = localStorage.getItem(AUTH_CACHE_KEY);
  return authState === 'true';
}

/**
 * Get cached user data
 */
export function getCachedUser(): User | null {
  const userJson = localStorage.getItem(USER_CACHE_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing cached user:', error);
      return null;
    }
  }
  return null;
}

/**
 * Cache authentication state and user data
 */
function cacheAuthState(authenticated: boolean, user: User | null): void {
  localStorage.setItem(AUTH_CACHE_KEY, authenticated.toString());
  if (user) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_CACHE_KEY);
  }
}

/**
 * Clear authentication cache
 */
function clearAuthCache(): void {
  localStorage.removeItem(AUTH_CACHE_KEY);
  localStorage.removeItem(USER_CACHE_KEY);
}

/**
 * Get authentication state from cache
 */
export function getAuthState(): AuthState {
  return {
    isAuthenticated: isAuthenticated(),
    user: getCachedUser(),
  };
}
