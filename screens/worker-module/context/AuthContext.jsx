// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, getCurrentUser } from '../../api/api'; // We'll create this service

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      // Check for remembered user first
      const rememberedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (rememberedUser && token) {
        const userData = JSON.parse(rememberedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Check for session user
        const sessionUser = await AsyncStorage.getItem('session_user');
        const sessionToken = await AsyncStorage.getItem('session_token');
        
        if (sessionUser && sessionToken) {
          const userData = JSON.parse(sessionUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      console.log('🔐 Attempting login with:', { email, password, rememberMe });
      
      // Call backend login API
      const response = await loginUser({ s_email: email, s_password: password });
      
      console.log('📡 Login response:', response);

      if (response.success) {
        const { token, user: userData } = response;
        
        // Store token
        if (rememberMe) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          console.log('💾 User and token stored in permanent storage');
        } else {
          await AsyncStorage.setItem('session_token', token);
          await AsyncStorage.setItem('session_user', JSON.stringify(userData));
          console.log('💾 User and token stored in session storage');
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Login successful, user:', userData);
        
        return { 
          success: true, 
          user: userData,
          token 
        };
      } else {
        console.log('❌ Login failed:', response.message);
        return { 
          success: false, 
          error: response.message || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    console.log('Logging out');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('session_token');
    await AsyncStorage.removeItem('session_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('session_token');
      
      if (token) {
        const response = await getCurrentUser(token);
        if (response.success) {
          setUser(response.user);
          
          // Update stored user data
          const storageKey = await AsyncStorage.getItem('token') ? 'user' : 'session_user';
          await AsyncStorage.setItem(storageKey, JSON.stringify(response.user));
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const hasPermission = (module) => {
    if (!user) return false;
    
    // Check role-based permissions
    // You can implement role-based permissions here based on your backend roles
    // For now, returning true for all authenticated users
    return true;
  };

  const canAccessStep = (stepNumber, ptw) => {
    if (!user) return false;
    
    // Implement step access logic based on user role
    // You can customize this based on your role structure
    return true;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    canAccessStep,
    refreshUserProfile,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};