import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import Navbar from './screens/Navbar';
import LandingPage from './screens/LandingPage';
import { SafetyModuleScreen } from './screens/LandingPage';
import PermitToWork from './screens/PermitToWork';
import ChemicalSafetyScreen from './screens/ChemicalSafetyScreen';
import SafetyDashboard from "./screens/SafetyDashboard";
import CapaScreen from "./screens/CapaScreen";
import IncidentAndInjuryScreen from "./screens/IncidentAndInjuryScreen";
import AuditAndInspectionScreen from "./screens/AuditAndInspectionScreen";
import SafetyTrainingScreen from "./screens/SafetyTrainingScreen";
import SafetyReportsScreen from "./screens/SafetyReportsScreen";
import WelcomeScreen from './screens/worker-module/WelcomeScreen';
// Import Worker Module screens
import IncidentReportScreen from './screens/worker-module/IncidentReportScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleLogin = (userInfo) => {
    console.log('User logged in:', userInfo);
    setUserData(userInfo);
    setUserRole(userInfo.role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('User logged out');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
  };

  // Custom wrapper to conditionally show navbar
  const AppContent = ({ children, showNavbar = true }) => (
    <View style={styles.appContainer}>
      {showNavbar && <Navbar onLogout={handleLogout} userData={userData} />}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );

  // Landing Page with Navbar (for managers/admins)
  const LandingPageWithNavbar = (props) => (
    <AppContent showNavbar={true}>
      <LandingPage {...props} userData={userData} />
    </AppContent>
  );

  // Worker Module Entry Point - Full incident reporting flow WITHOUT Navbar
const WorkerModuleEntry = (props) => (
  <AppContent showNavbar={false}>
    <IncidentReportScreen 
      {...props} 
      userData={userData}
      onLogout={handleLogout}   // 👈 ADD THIS
    />
  </AppContent>
);


  // Admin/Manager Incident Management Screen WITH Navbar
  const IncidentManagementWithNavbar = (props) => (
      <IncidentAndInjuryScreen {...props} userData={userData} />
  );

  // Safety Module Screen WITHOUT Navbar
  const SafetyModuleScreenWithoutNavbar = (props) => (
    <AppContent showNavbar={false}>
      <SafetyModuleScreen {...props} />
    </AppContent>
  );

  // Other screens (with navbar by default)
  const OtherScreen = (ScreenComponent) => (props) => (
    <AppContent showNavbar={true}>
      <ScreenComponent {...props} />
    </AppContent>
  );

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <NavigationContainer>
        {isAuthenticated ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Role-based initial route */}
            {userRole === 'worker' ? (
              // Workers go directly to the incident reporting flow
              <Stack.Screen name="WorkerModule" component={WorkerModuleEntry} />
            ) : (
              // Managers and admins go to Landing Page
              <Stack.Screen name="LandingPage" component={LandingPageWithNavbar} />
            )}
            
            {/* Admin/Manager screens - accessible only to managers/admins */}
            {userRole !== 'worker' && (
              <>
                <Stack.Screen name="IncidentManagement" component={IncidentManagementWithNavbar} />
                <Stack.Screen name="PermitToWork" component={PermitToWork} />
                <Stack.Screen name="ChemicalSafety" component={ChemicalSafetyScreen} />
                <Stack.Screen name="SafetyDashboard" component={SafetyDashboard} />
                <Stack.Screen name="CapaScreen" component={CapaScreen} />
                <Stack.Screen name="AuditAndInspection" component={AuditAndInspectionScreen} />
                <Stack.Screen name="SafetyTraining" component={SafetyTrainingScreen} />
                <Stack.Screen name="Reports" component={SafetyReportsScreen} />
                <Stack.Screen name="SafetyModule" component={SafetyModuleScreenWithoutNavbar} />
              </>
            )}
            
            {/* Worker Module - Full incident reporting flow (accessible to all but workers start here) */}
            <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
          </Stack.Navigator>
        ) : (
          <View style={styles.appContainer}>
            <LoginScreen onLogin={handleLogin} />
          </View>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  appContainer: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
});

export default App;