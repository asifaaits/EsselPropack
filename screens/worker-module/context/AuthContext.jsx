// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROLES, ROLE_PERMISSIONS, DEMO_USERS } from '../../constants/roles';

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

  useEffect(() => {
    // Check for stored user on initial load
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      // Check for remembered user first
      const rememberedUser = await AsyncStorage.getItem('user');
      if (rememberedUser) {
        setUser(JSON.parse(rememberedUser));
      } else {
        // Check for session user
        const sessionUser = await AsyncStorage.getItem('session_user');
        if (sessionUser) {
          setUser(JSON.parse(sessionUser));
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };
// src/context/AuthContext.jsx - Update login function

const login = async (username, password, rememberMe = false) => {
  console.log('🔐 AuthContext.login called with:', { username, password, rememberMe });
  
  // Find user in demo users
  const foundUser = DEMO_USERS.find(
    (u) => u.username === username && u.password === password
  );

  console.log('🔍 User found in DEMO_USERS:', foundUser);

  if (foundUser) {
    // Remove password before storing
    const { password: pwd, ...userWithoutPassword } = foundUser;
    
    console.log('👤 User without password:', userWithoutPassword);
    
    // Store user based on remember me
    if (rememberMe) {
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
      console.log('💾 User stored in permanent storage');
    } else {
      await AsyncStorage.setItem('session_user', JSON.stringify(userWithoutPassword));
      console.log('💾 User stored in session storage');
    }
    
    setUser(userWithoutPassword);
    console.log('✅ AuthContext user state updated to:', userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  }
  
  console.log('❌ User not found in DEMO_USERS');
  return { success: false, error: 'Invalid credentials' };
};

  const logout = async () => {
    console.log('Logging out');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('session_user');
    setUser(null);
  };

  const hasPermission = (module) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === ROLES.ADMIN) return true;
    
    // Check role-based permissions
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(module);
  };

  const canAccessStep = (stepNumber, ptw) => {
    if (!user) return false;
    
    // Admin can access everything
    if (user.role === ROLES.ADMIN) return true;
    
    // Check if user can access based on role and step
    const stepPermission = `step_${stepNumber}`;
    if (!hasPermission(stepPermission)) return false;
    
    // If PTW exists, check if it's the right stage
    if (ptw && ptw.workflow) {
      // Contractor can only see steps 4-8 when PTW is at their stage
      if (user.role === ROLES.CONTRACTOR) {
        return ptw.workflow.currentRole === ROLES.CONTRACTOR;
      }
      
      // Supervisor can only see steps 1-3 when PTW is at their stage
      if (user.role === ROLES.SUPERVISOR) {
        return ptw.workflow.currentRole === ROLES.SUPERVISOR;
      }
      
      // Safety Officer can only see steps 9-10 when PTW is at their stage
      if (user.role === ROLES.SAFETY_OFFICER) {
        return ptw.workflow.currentRole === ROLES.SAFETY_OFFICER;
      }
    }
    
    return true;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    canAccessStep,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};