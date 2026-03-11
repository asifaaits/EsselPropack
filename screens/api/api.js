// src/services/authApi.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For React Native, use your machine's IP address instead of localhost
const API_URL = Platform.select({
  ios: 'http://localhost:5000',
  android: 'http://10.0.2.2:5000',
  default: 'http://192.168.1.1:5000' 
});

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('session_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Login API
export const loginUser = async (credentials) => {
  try {
    console.log('Sending login request to backend:', credentials);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        s_email: credentials.s_email,
        s_password: credentials.s_password,
      }),
    });

    const data = await response.json();
    console.log('Raw backend response:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP error! status: ${response.status}`,
        error: data.error || 'Login failed',
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Cannot connect to server. Please check your connection.',
      error: error.message,
    };
  }
};

// Get current user profile
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, message: 'Failed to fetch profile' };
  }
};

// Get all roles
export const getRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/roles`);
    const data = await response.json();
    console.log('Roles response:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP error! status: ${response.status}`,
        roles: [],
      };
    }

    return {
      success: true,
      roles: data.roles || data.data || data,
    };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return {
      success: false,
      message: 'Cannot connect to server',
      roles: [],
    };
  }
};

// Get all departments
export const getDepartments = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/departments`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP error! status: ${response.status}`,
        departments: [],
      };
    }

    return {
      success: true,
      departments: data.departments || data.data || data,
    };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return {
      success: false,
      message: 'Cannot connect to server',
      departments: [],
    };
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Cannot connect to server',
    };
  }
};

export default {
  loginUser,
  registerUser,
  getRoles,
  getDepartments,
  getCurrentUser,
};