import React, { createContext, useContext, useState } from 'react';

const IncidentContext = createContext();

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncident must be used within IncidentProvider');
  }
  return context;
};

export const IncidentProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [incidentData, setIncidentData] = useState({
    photo: null,
    location: null,
    manualLocation: null,
    bodyPart: null,
    bodyView: 'front',
    incidentType: null,
    severity: null,
    description: '',
    witness: null,
    reportedBy: null,
    timestamp: null,
  });

  const updateIncidentData = (key, value) => {
    setIncidentData(prev => ({ ...prev, [key]: value }));
  };

  const resetIncident = () => {
    setIncidentData({
      photo: null,
      location: null,
      manualLocation: null,
      bodyPart: null,
      bodyView: 'front',
      incidentType: null,
      severity: null,
      description: '',
      witness: null,
      reportedBy: null,
      timestamp: null,
    });
    setCurrentStep(1);
  };

  const value = {
    currentStep,
    setCurrentStep,
    incidentData,
    updateIncidentData,
    resetIncident,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};