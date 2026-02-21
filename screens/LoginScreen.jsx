import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ESSEL_LOGO = require('../assets/logo.png');
const BG_IMAGE = require('../assets/factory.png');

const LoginScreen = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!employeeId.trim() || !password.trim()) {
      setError('Please enter both Employee ID and Password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock user database - In production, this would come from your backend
const mockUsers = [
  // Workers
  { employeeId: 'worker123', password: 'pass123', role: 'worker', name: 'John Worker' },
  { employeeId: 'worker456', password: 'pass123', role: 'worker', name: 'Jane Worker' },
  { employeeId: 'w001', password: 'pass123', role: 'worker', name: 'Mike Smith' },
  
  // Managers
  { employeeId: 'manager123', password: 'pass123', role: 'manager', name: 'Bob Manager' },
  { employeeId: 'm001', password: 'pass123', role: 'manager', name: 'Sarah Johnson' },
  
  // Admins
  { employeeId: 'admin123', password: 'pass123', role: 'admin', name: 'Alice Admin' },
];

// Find user in mock database
const user = mockUsers.find(
  u => u.employeeId === employeeId && u.password === password
);

if (user) {
  // Successful login
  onLogin({ 
    employeeId: user.employeeId,
    name: user.name,
    role: user.role,
    rememberMe,
  });
} else {
  setError('Invalid credentials. Please check your Employee ID and Password');
}
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                {/* Employee ID Field */}
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Icon name="account" size={22} color="#062a72" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Employee ID / Username"
                    placeholderTextColor="#6886b0"
                    value={employeeId}
                    onChangeText={(text) => {
                      setEmployeeId(text);
                      setError('');
                    }}
                    editable={!isLoading}
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Icon name="lock" size={22}color="#062a72" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#6485b3"
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

                  <TouchableOpacity style={styles.forgotButton}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={18} color="#ff4757" />
                    <Text style={styles.error}>{error}</Text>
                  </View>
                ) : null}

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Icon name="loading" size={20} color="#fff" />
                      <Text style={styles.loginText}>PROCESSING...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginText}>LOGIN TO DASHBOARD</Text>
                      <Icon name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
                    </>
                  )}
                </TouchableOpacity>

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

export default LoginScreen;

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
    backdropFilter: 'blur(10px)',
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
      fontStyle:"bold",
    fontWeight: '700',
    color: '#013271',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
     color: '#013271',
     fontStyle:"bold",
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
   color: '#013271',
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
  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 14,
   color: '#032e65',
   marginLeft:10,
    fontWeight: '600',
    marginRight: 4,
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
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight:600,
    color: 'rgba(2, 26, 61, 0.6)',
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
     fontWeight:600,
    fontSize: 11,
    color: 'rgba(2, 26, 61, 0.6)',
  },
});