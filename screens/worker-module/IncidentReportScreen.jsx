// src/screens/worker-module/IncidentReportScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { IncidentProvider, useIncident } from './context/IncidentContext';
import WelcomeScreen from './WelcomeScreen';
import CameraScreen from './CameraScreen';
import LocationScreen from './LocationScreen';
import BodyMapScreen from './BodyMapScreen';
import DetailsScreen from './DetailsScreen';
import ReviewScreen from './ReviewScreen';
import SuccessScreen from './SuccessScreen';

const IncidentReportContent = ({ navigation, onLogout, userData }) => {
  const { currentStep, setCurrentStep, resetIncident } = useIncident();
  const [showWelcome, setShowWelcome] = useState(true);

  console.log('🔵 IncidentReportContent - Props received:', { 
    onLogoutExists: !!onLogout,
    onLogoutType: typeof onLogout,
    userDataExists: !!userData 
  });

  const handleStart = () => {
    setShowWelcome(false);
    setCurrentStep(1);
  };

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const goToPreviousStep = () => {
    if (currentStep === 1) {
      setShowWelcome(true);
      setCurrentStep(1);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleFinish = () => {
    resetIncident();
    setShowWelcome(true);
    setCurrentStep(1);
  };

  // Show Welcome Screen first
  if (showWelcome) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F1419" />
        <WelcomeScreen 
          onStart={handleStart}
          onLogout={onLogout} // Pass the onLogout function
          userData={userData}
        />
      </SafeAreaView>
    );
  }

  // Show the incident reporting flow
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CameraScreen 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 2:
        return (
          <LocationScreen 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 3:
        return (
          <BodyMapScreen 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 4:
        return (
          <DetailsScreen 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 5:
        return (
          <ReviewScreen 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 6:
        return <SuccessScreen onFinish={handleFinish} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1419" />
      {renderStep()}
    </SafeAreaView>
  );
};

const IncidentReportScreen = (props) => {
  console.log('🟢 IncidentReportScreen - ALL PROPS:', props);
  console.log('🟢 onLogout in props:', props.onLogout);
  console.log('🟢 onLogout type:', typeof props.onLogout);
  console.log('🟢 userData in props:', props.userData);
  
  // Destructure props for clarity
  const { navigation, route, userData, onLogout } = props;
  
  return (
    <IncidentProvider>
      <IncidentReportContent 
        navigation={navigation}
        onLogout={onLogout} // Pass directly
        userData={userData}
      />
    </IncidentProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
});

export default IncidentReportScreen;