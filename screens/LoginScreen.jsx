// src/screens/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from './worker-module/context/AuthContext';

const ESSEL_LOGO = require('../assets/logo.png');
const BG_IMAGE = require('../assets/factory.png');

const LoginScreen = ({ navigation }) => {
  const { login, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  // Fetch demo users from backend or use predefined ones
  useEffect(() => {
    // You can either fetch from backend or keep predefined
    // For now, keeping predefined but using email format
    setDemoUsers([
      { role: 'Admin', email: 'admin@esslepropack.com', password: 'admin123' },
      { role: 'Safety Officer', email: 'safety@esslepropack.com', password: 'safety123' },
      { role: 'Supervisor', email: 'supervisor@esslepropack.com', password: 'supervisor123' },
      { role: 'Contractor', email: 'contractor@esslepropack.com', password: 'contractor123' },
      { role: 'Worker', email: 'worker@esslepropack.com', password: 'worker123' },
    ]);
  }, []);

  const handleLogin = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 LOGIN ATTEMPT START');
      console.log('Email entered:', email);
      console.log('Password entered:', password);
      console.log('Remember me:', rememberMe);
      
      const result = await login(email, password, rememberMe);
      
      console.log('🔐 LOGIN RESULT:', result);
      
      if (result.success) {
        console.log('✅ Login successful! User role:', result.user.role_name);
        console.log('✅ User data:', JSON.stringify(result.user, null, 2));
        // Navigation will be handled automatically by App.js
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (demoUser) => {
    console.log('Filling demo credentials for:', demoUser.role);
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setShowDemoDropdown(false);
    // Clear any previous error
    setError('');
  };

  return (
    <ImageBackground source={BG_IMAGE} style={styles.background} blurRadius={3}>
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Glassmorphism Card */}
            <View style={styles.glassCard}>
              {/* Header with Logo */}
              <View style={styles.header}>
                <Image
                  source={ESSEL_LOGO}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputSection}>
                {/* Email Field - Changed from Username */}
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Icon name="email" size={22} color="#062a72" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#6886b0"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    editable={!isLoading}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Icon name="lock" size={22} color="#062a72" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#6886b0"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    editable={!isLoading}
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={22} 
                      color="#062a72"
                    />
                  </TouchableOpacity>
                </View>

                {/* Options Row */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checked]}>
                      {rememberMe && (
                        <Icon name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.demoButton}
                    onPress={() => setShowDemoDropdown(!showDemoDropdown)}
                  >
                    <Icon name="account-group" size={18} color="#062a72" />
                    <Text style={styles.demoButtonText}>Demo Users</Text>
                  </TouchableOpacity>
                </View>

                {/* Demo Users Dropdown */}
                {showDemoDropdown && (
                  <View style={styles.demoDropdown}>
                    <Text style={styles.demoDropdownTitle}>Select a demo user:</Text>
                    {demoUsers.map((user, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.demoUserItem}
                        onPress={() => fillDemoCredentials(user)}
                      >
                        <View style={styles.demoUserRole}>
                          <Text style={styles.demoUserRoleText}>{user.role}</Text>
                        </View>
                        <View style={styles.demoUserDetails}>
                          <Text style={styles.demoUserText}>
                            <Text style={{ fontWeight: '600' }}>Email:</Text> {user.email}
                          </Text>
                          <Text style={styles.demoUserText}>
                            <Text style={{ fontWeight: '600' }}>Password:</Text> {user.password}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={18} color="#ff4757" />
                    <Text style={styles.error}>{error}</Text>
                  </View>
                ) : null}

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, (isLoading || authLoading) && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading || authLoading}
                  activeOpacity={0.8}
                >
                  {isLoading || authLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.loginText}>LOGGING IN...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginText}>LOGIN</Text>
                      <Icon name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Connection Status Indicator - Optional */}
                <View style={styles.connectionStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Connected to server</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>© 2026 Essel Group. All rights reserved.</Text>
                  <Text style={styles.versionText}>v1.0.0</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 70,
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#013271',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#013271',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  inputSection: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(137, 178, 250, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#02285a',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeIcon: {
    padding: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#052b75',
    borderColor: '#4a6baf',
  },
  rememberText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  demoButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  demoDropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoDropdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#013271',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  demoUserItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  demoUserRole: {
    marginBottom: 2,
  },
  demoUserRoleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#013271',
  },
  demoUserDetails: {
    marginLeft: 4,
  },
  demoUserText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.2)',
  },
  error: {
    color: '#ff6b81',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#013271',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#082d79',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
    fontWeight: '600',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default LoginScreen;