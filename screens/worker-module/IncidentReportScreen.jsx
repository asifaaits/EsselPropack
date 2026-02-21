import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { IncidentProvider, useIncident } from './context/IncidentContext';
import WelcomeScreen from './WelcomeScreen';
import CameraScreen from './CameraScreen';
import LocationScreen from './LocationScreen';
import BodyMapScreen from './BodyMapScreen';
import DetailsScreen from './DetailsScreen';
import ReviewScreen from './ReviewScreen';
import SuccessScreen from './SuccessScreen';

const IncidentReportContent = ({ navigation, onLogout }) => {

  const { currentStep, setCurrentStep, resetIncident } = useIncident();
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStart = () => {
    setShowWelcome(false);
    setCurrentStep(1);
  };

  const goToNextStep = () => {
    console.log('Going to next step. Current:', currentStep);
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const goToPreviousStep = () => {
    console.log('Going to previous step. Current:', currentStep);
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
  onLogout={onLogout}   // 👈 PASS IT
/>

      </SafeAreaView>
    );
  }

  // Show the incident reporting flow
  const renderStep = () => {
    console.log('Rendering step:', currentStep);
    switch (currentStep) {
      case 1:
        return (
          <CameraScreen 
            onNext={goToNextStep} 
            onBack={() => {
              console.log('Camera back pressed');
              goToPreviousStep();
            }} 
          />
        );
      case 2:
        return (
          <LocationScreen 
            onNext={goToNextStep} 
            onBack={() => {
              console.log('Location back pressed');
              goToPreviousStep();
            }} 
          />
        );
      case 3:
        return (
          <BodyMapScreen 
            onNext={goToNextStep} 
            onBack={() => {
              console.log('BodyMap back pressed');
              goToPreviousStep();
            }} 
          />
        );
      case 4:
        return (
          <DetailsScreen 
            onNext={goToNextStep} 
            onBack={() => {
              console.log('Details back pressed');
              goToPreviousStep();
            }} 
          />
        );
      case 5:
        return (
          <ReviewScreen 
            onNext={goToNextStep} 
            onBack={() => {
              console.log('Review back pressed');
              goToPreviousStep();
            }} 
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

const IncidentReportScreen = ({ navigation, onLogout }) => {
  return (
    <IncidentProvider>
      <IncidentReportContent 
        navigation={navigation}
        onLogout={onLogout}
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