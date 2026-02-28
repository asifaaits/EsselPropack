import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './constants/colors';
import { ROLES } from './constants/roles';
import { PTWWorkflowService } from './services/PTWWorkflowService';
import WorkflowProgress from './worker-module/components/ptw/WorkflowProgress';
import PendingActionsCard from './worker-module/components/ptw/PendingActionsCard';
import BasicInfoStep from './worker-module/components/ptw/steps/BasicInfoStep';
import SecurityVerificationStep from './worker-module/components/ptw/steps/SecurityVerificationStep';
import WorkTypeStep from './worker-module/components/ptw/steps/WorkTypeStep';
import EquipmentStep from './worker-module/components/ptw/steps/EquipmentStep';
import PPEStep from './worker-module/components/ptw/steps/PPEStep';
import ChecklistsStep from './worker-module/components/ptw/steps/ChecklistsStep';
import RiskAssessmentStep from './worker-module/components/ptw/steps/RiskAssessmentStep';
import TBTStep from './worker-module/components/ptw/steps/TBTStep';
import AuthorizationStep from './worker-module/components/ptw/steps/AuthorizationStep';
import ClosureStep from './worker-module/components/ptw/steps/ClosureStep';

const { width } = Dimensions.get('window');

const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

// Updated color theme to match LandingPage
const THEME = {
  primary: '#031071', // Dark blue from LandingPage
  primaryDark: '#020a4d',
  white: '#FFFFFF',
  grey: {
    50: '#f8f9fc',
    100: '#f5f5fa',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  accent: '#f97316',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Initial PTW data with proper workflow states
const dummyPTWData = [
  {
    id: "PTW-2025-001",
    permitDate: "2025-02-13",
    initiatorName: "John Smith",
    departmentName: "Maintenance",
    vendorFirm: "ABC Contractors",
    contractorName: "Mike Contractor",
    workLocation: "Factory Floor - Area A",
    workDescription: "Welding repairs on conveyor belt",
    workType: ["hot", "height"],
    status: "in_progress",
    createdAt: "2025-02-13T09:30:00",
    ptwIssuer: "Sarah Williams",
    safetyConfirm: true,
    phoneNo: "+1 234-567-8901",
    workmenCount: "5",
    actualPeople: "4",
    workflow: {
      currentStep: 4,
      currentRole: ROLES.CONTRACTOR,
      status: "in_progress",
      steps: [
        { step: 1, name: "Basic Information", role: ROLES.SUPERVISOR, completed: true, completedBy: "John Smith", completedByRole: ROLES.SUPERVISOR, completedAt: "2025-02-13T09:35:00", status: "completed", data: {} },
        { step: 2, name: "Security Verification", role: ROLES.SUPERVISOR, completed: true, completedBy: "John Smith", completedByRole: ROLES.SUPERVISOR, completedAt: "2025-02-13T09:40:00", status: "completed", data: {} },
        { step: 3, name: "Work Type Selection", role: ROLES.SUPERVISOR, completed: true, completedBy: "John Smith", completedByRole: ROLES.SUPERVISOR, completedAt: "2025-02-13T09:45:00", status: "completed", data: {} },
        { step: 4, name: "Equipment Required", role: ROLES.CONTRACTOR, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "in_progress", data: {} },
        { step: 5, name: "PPE Required", role: ROLES.CONTRACTOR, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "pending", data: {} },
        { step: 6, name: "Safety Checklists", role: ROLES.CONTRACTOR, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "pending", data: {} },
        { step: 7, name: "Risk Assessment", role: ROLES.CONTRACTOR, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "pending", data: {} },
        { step: 8, name: "Tool Box Talk", role: ROLES.CONTRACTOR, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "pending", data: {} },
        { step: 9, name: "Authorization", role: ROLES.SAFETY_OFFICER, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "pending", data: {} },
        { step: 10, name: "Permit Closure", role: ROLES.SAFETY_OFFICER, completed: false, completedBy: null, completedByRole: null, completedAt: null, status: "pending", data: {} },
      ],
      completedSteps: [1, 2, 3],
      pendingSteps: [4, 5, 6, 7, 8, 9, 10],
      stepData: {},
      timeline: [
        { step: 1, action: "started", by: "John Smith", byRole: ROLES.SUPERVISOR, at: "2025-02-13T09:30:00" },
        { step: 1, action: "completed", by: "John Smith", byRole: ROLES.SUPERVISOR, at: "2025-02-13T09:35:00" },
        { step: 2, action: "completed", by: "John Smith", byRole: ROLES.SUPERVISOR, at: "2025-02-13T09:40:00" },
        { step: 3, action: "completed", by: "John Smith", byRole: ROLES.SUPERVISOR, at: "2025-02-13T09:45:00" },
        { step: 4, action: "started", by: null, byRole: ROLES.CONTRACTOR, at: "2025-02-13T09:45:00" },
      ],
      metadata: {
        createdBy: "John Smith", createdByRole: ROLES.SUPERVISOR, createdAt: "2025-02-13T09:30:00",
        lastModifiedBy: "John Smith", lastModifiedAt: "2025-02-13T09:45:00", completionPercentage: 30,
      },
    },
  },
  {
    id: "PTW-2025-002",
    permitDate: "2025-02-12",
    initiatorName: "Emily Davis",
    departmentName: "Electrical",
    vendorFirm: "XYZ Electricals",
    contractorName: "Robert Brown",
    workLocation: "Substation Room 2",
    workDescription: "HT panel maintenance",
    workType: ["electrical_ht", "electrical_shutdown"],
    status: "completed",
    createdAt: "2025-02-12T10:15:00",
    ptwIssuer: "David Miller",
    safetyConfirm: true,
    phoneNo: "+1 987-654-3210",
    workmenCount: "3",
    actualPeople: "3",
    workflow: {
      currentStep: 10,
      currentRole: ROLES.SAFETY_OFFICER,
      status: "completed",
      steps: Array.from({ length: 10 }, (_, i) => ({
        step: i + 1,
        name: PTWWorkflowService.stepNames[i + 1],
        role: PTWWorkflowService.stepRoles[i + 1],
        completed: true,
        completedBy: i < 3 ? "Emily Davis" : i < 8 ? "Robert Brown" : "David Miller",
        completedByRole: i < 3 ? ROLES.SUPERVISOR : i < 8 ? ROLES.CONTRACTOR : ROLES.SAFETY_OFFICER,
        completedAt: "2025-02-12T" + (10 + i) + ":00:00",
        status: "completed",
        data: {},
      })),
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      pendingSteps: [],
      stepData: {},
      timeline: [],
      metadata: {
        createdBy: "Emily Davis", createdByRole: ROLES.SUPERVISOR, createdAt: "2025-02-12T10:15:00",
        lastModifiedBy: "David Miller", lastModifiedAt: "2025-02-12T16:30:00", completionPercentage: 100,
      },
    },
  },
];

const PermitToWork = ({ route, userData }) => {
  const navigation = useNavigation();
  
  // Get user data with fallback
  const user = userData || route?.params?.userData || { 
    role: 'Unknown', 
    name: 'Unknown User',
    username: 'unknown'
  };
  
  const scrollViewRef = useRef(null);
  
  // State management
  const [showDashboard, setShowDashboard] = useState(true);
  const [ptwList, setPtwList] = useState([]);
  const [selectedPTW, setSelectedPTW] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showPTWModal, setShowPTWModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    permitDate: new Date().toISOString().split('T')[0],
    wcPolicyNo: '', 
    wcExpDate: '', 
    workmenCount: '', 
    actualPeople: '',
    initiatorName: '', 
    departmentName: '', 
    vendorFirm: '', 
    contractorName: '',
    phoneNo: '', 
    serviceOrderReceived: false, 
    serviceOrderNo: '',
    workStartTime: '', 
    expectedCompletion: '', 
    safetyConfirm: false,
    securitySupervisor: '', 
    idCheck: [], 
    workType: [], 
    otherWorkType: '',
    cancellationReason: '', 
    workDescription: '', 
    workLocation: '', 
    safetyInstructions: '',
    equipment: [], 
    ppe: [], 
    ptwIssuer: '', 
    ppeVerifyTime: '', 
    ppeVerify: false,
    tbtContractor: '', 
    tbtTime: '', 
    tbtConfirm: false, 
    tbt: [],
    issuerAuthName: '', 
    issuerAuthDate: '', 
    issuerAuthTime: '',
    approverName: '', 
    approverDate: '', 
    approverTime: '',
    authorizerName: '', 
    authorizerDate: '', 
    authorizerTime: '',
    workerName: '', 
    workerDate: '', 
    workerAmPm: 'AM',
    permitStatus: '', 
    closureDate: '', 
    closureTime: '', 
    closureRemarks: '',
    status: 'pending', 
    createdAt: new Date().toISOString(),
  });

  const [currentStep, setCurrentStep] = useState(1);
  
  // Attendance rows
  const [attendanceRows, setAttendanceRows] = useState([
    { id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: '' }
  ]);
  
  // Risk rows
  const [riskRows, setRiskRows] = useState([
    { id: Date.now(), description: '', status: 'open', responsible: '', mitigation: '' }
  ]);

  // Load PTWs from AsyncStorage on mount
  useEffect(() => {
    loadPTWs();
  }, []);

  const loadPTWs = async () => {
    try {
      const stored = await AsyncStorage.getItem('ptwList');
      if (stored) {
        setPtwList(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem('ptwList', JSON.stringify(dummyPTWData));
        setPtwList(dummyPTWData);
      }
    } catch (error) {
      console.error('Error loading PTWs:', error);
      setPtwList(dummyPTWData);
    }
  };

  const savePTWs = async (updatedList) => {
    try {
      await AsyncStorage.setItem('ptwList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error saving PTWs:', error);
    }
  };

  const generatePTWId = () => {
    const year = new Date().getFullYear();
    return `PTW-${year}-${String(ptwList.length + 1).padStart(3, '0')}`;
  };

  const handleAddNewPTW = () => {
    if (user?.role !== ROLES.SUPERVISOR && user?.role !== ROLES.ADMIN) {
      Alert.alert('Permission Denied', 'Only Supervisors and Admins can create new PTWs');
      return;
    }

    const newId = generatePTWId();
    const workflow = PTWWorkflowService.initializeWorkflow(
      user?.name || user?.username || 'User',
      user?.role || ROLES.SUPERVISOR
    );

    setFormData({
      ...formData,
      id: newId,
      permitDate: new Date().toISOString().split('T')[0],
      initiatorName: user?.name || 'New User',
      workLocation: 'To be assigned',
      contractorName: 'To be assigned',
      workmenCount: '0',
      actualPeople: '0',
      status: 'in_progress',
      workflow,
    });
    
    setAttendanceRows([{ id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: '' }]);
    setRiskRows([{ id: Date.now(), description: '', status: 'open', responsible: '', mitigation: '' }]);
    setCurrentStep(1);
    setShowDashboard(false);
    setModalMode('create');
  };

  const handleViewPTW = (ptw) => {
    setSelectedPTW(ptw);
    setShowPTWModal(true);
  };

  const handleEditPTW = (ptw) => {
    // Check if user can edit this PTW
    if (!PTWWorkflowService.canEditPTW(user, ptw)) {
      Alert.alert('Permission Denied', 'You cannot edit this PTW at this stage');
      return;
    }

    setFormData(ptw);
    setSelectedPTW(ptw);
    setModalMode('edit');
    setShowDashboard(false);
    setCurrentStep(ptw.workflow.currentStep);
    
    // Load attendance and risk rows if they exist in step data
    if (ptw.workflow.stepData?.[2]?.attendance) {
      setAttendanceRows(ptw.workflow.stepData[2].attendance);
    }
    if (ptw.workflow.stepData?.[7]?.risks) {
      setRiskRows(ptw.workflow.stepData[7].risks);
    }
  };

  const handleDeletePTW = async (id) => {
    if (user?.role !== ROLES.ADMIN) {
      Alert.alert('Permission Denied', 'Only Admins can delete PTWs');
      return;
    }

    Alert.alert(
      'Delete PTW',
      'Are you sure you want to delete this PTW?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedList = ptwList.filter(ptw => ptw.id !== id);
            setPtwList(updatedList);
            await savePTWs(updatedList);
          }
        }
      ]
    );
  };

  const handleCompleteStep = (stepData, notes = '') => {
    if (!selectedPTW && !formData.id) {
      Alert.alert('Error', 'No PTW selected');
      return;
    }

    const currentPTW = selectedPTW || formData;
    const stepNumber = currentStep;

    // Double-check permission before completing
    if (!PTWWorkflowService.canEditPTW(user, currentPTW)) {
      Alert.alert('Permission Denied', 'You do not have permission to complete this step');
      return;
    }

    if (!PTWWorkflowService.isStepAvailableForUser(user, stepNumber, currentPTW)) {
      Alert.alert('Permission Denied', 'This step is not available for you to complete');
      return;
    }

    // Proceed with completing the step
    const updatedPTW = PTWWorkflowService.completeStep(
      currentPTW,
      stepNumber,
      user,
      stepData,
      notes
    );

    if (selectedPTW) {
      setSelectedPTW(updatedPTW);
    } else {
      setFormData(updatedPTW);
    }

    const updatedList = ptwList.map(p => (p.id === updatedPTW.id ? updatedPTW : p));
    setPtwList(updatedList);
    savePTWs(updatedList);

    if (stepNumber === 10) {
      setShowDashboard(true);
      setSelectedPTW(null);
    } else {
      setCurrentStep(stepNumber + 1);
    }

    Alert.alert('Success', `Step ${stepNumber} completed successfully!`);
  };

  const handleRejectStep = () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    const currentPTW = selectedPTW || formData;
    const stepNumber = currentStep;

    const updatedPTW = PTWWorkflowService.rejectStep(
      currentPTW,
      stepNumber,
      user,
      rejectReason
    );

    if (selectedPTW) {
      setSelectedPTW(updatedPTW);
    } else {
      setFormData(updatedPTW);
    }

    const updatedList = ptwList.map(p => (p.id === updatedPTW.id ? updatedPTW : p));
    setPtwList(updatedList);
    savePTWs(updatedList);

    setShowRejectModal(false);
    setRejectReason('');
    setCurrentStep(stepNumber - 1);

    Alert.alert('Step Rejected', 'Step rejected and sent back to previous stage');
  };

  const handleCancelPTW = () => {
    if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.SUPERVISOR) {
      Alert.alert('Permission Denied', 'Only Admins and Supervisors can cancel PTWs');
      return;
    }

    Alert.prompt(
      'Cancel PTW',
      'Please enter cancellation reason:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel PTW',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason) return;
            
            const currentPTW = selectedPTW || formData;
            const updatedPTW = PTWWorkflowService.cancelPTW(currentPTW, user, reason);

            const updatedList = ptwList.map(p => (p.id === updatedPTW.id ? updatedPTW : p));
            setPtwList(updatedList);
            await savePTWs(updatedList);

            setShowDashboard(true);
            setSelectedPTW(null);
          }
        }
      ],
      'plain-text'
    );
  };

  const handleSubmit = async () => {
    let updatedList;
    
    // Ensure required fields have values
    const ptwToSave = {
      ...formData,
      initiatorName: formData.initiatorName || user?.name || 'Unknown',
      workLocation: formData.workLocation || 'Not specified',
      contractorName: formData.contractorName || 'Not assigned',
      workmenCount: formData.workmenCount || '0',
      actualPeople: formData.actualPeople || '0',
    };

    if (modalMode === 'edit' && selectedPTW) {
      updatedList = ptwList.map(ptw =>
        ptw.id === selectedPTW.id ? { ...ptwToSave, id: selectedPTW.id } : ptw
      );
    } else {
      const newPTW = { 
        ...ptwToSave, 
        id: generatePTWId(), 
        status: 'in_progress' 
      };
      updatedList = [...ptwList, newPTW];
    }
    
    setPtwList(updatedList);
    await savePTWs(updatedList);
    setShowDashboard(true);
    setModalMode('view');
    setSelectedPTW(null);
    Alert.alert('Success', `PTW ${modalMode === 'edit' ? 'updated' : 'created'} successfully!`);
  };

  const handleCancelForm = () => {
    Alert.alert(
      'Cancel',
      'Unsaved changes will be lost. Continue?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setShowDashboard(true);
            setSelectedPTW(null);
          }
        }
      ]
    );
  };

  const nextStep = () => {
    if (currentStep < 10) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBackPress = () => {
    if (!showDashboard) {
      handleCancelForm();
    } else {
      navigation.goBack();
    }
  };

  // Get filtered PTWs based on search and status
  const filteredPTWs = ptwList.filter(ptw => {
    const matchesSearch = 
      (ptw.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.initiatorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.contractorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.workLocation?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ptw.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get pending actions for current user
  const pendingPTWs = PTWWorkflowService.getUserPendingActions(user, ptwList);

  const getStatusColor = (status) => {
    switch(status) {
      case 'in_progress': return THEME.warning;
      case 'completed': return THEME.success;
      case 'cancelled': return THEME.danger;
      default: return THEME.grey[600];
    }
  };

  const renderCurrentStep = () => {
    const currentPTW = selectedPTW || formData;
    
    // Check if user can edit this PTW at current step
    const canEdit = PTWWorkflowService.canEditPTW(user, currentPTW);
    
    // Check if current step is available for this user
    const isStepAvailable = PTWWorkflowService.isStepAvailableForUser(
      user, 
      currentStep, 
      currentPTW
    );

    // User can only edit if they have permission AND the step is available
    const userCanEdit = canEdit && isStepAvailable;

    const stepProps = {
      formData: currentPTW,
      setFormData: (data) => {
        if (selectedPTW) {
          setSelectedPTW({ ...selectedPTW, ...data });
        } else {
          setFormData({ ...formData, ...data });
        }
      },
      user: user,
      onComplete: handleCompleteStep,
      onReject: () => setShowRejectModal(true),
      canEdit: userCanEdit,
      attendanceRows,
      setAttendanceRows,
      riskRows,
      setRiskRows,
    };

    switch (currentStep) {
      case 1: return <BasicInfoStep {...stepProps} />;
      case 2: return <SecurityVerificationStep {...stepProps} />;
      case 3: return <WorkTypeStep {...stepProps} />;
      case 4: return <EquipmentStep {...stepProps} />;
      case 5: return <PPEStep {...stepProps} />;
      case 6: return <ChecklistsStep {...stepProps} />;
      case 7: return <RiskAssessmentStep {...stepProps} />;
      case 8: return <TBTStep {...stepProps} />;
      case 9: return <AuthorizationStep {...stepProps} />;
      case 10: return <ClosureStep {...stepProps} />;
      default: return null;
    }
  };

  // Dashboard Component
  const Dashboard = () => {
    // Get pending actions for current user
    const pendingPTWs = PTWWorkflowService.getUserPendingActions(user, ptwList);
    
    return (
      <ScrollView 
        style={styles.dashboard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.dashboardContent}
      >
        {/* Header with user info inline */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardTitle}>Permit to Work</Text>
            <Text style={styles.dashboardSubtitle}>
              Welcome , {user?.name} ({user?.role})
            </Text>
          </View>
          {/* Show New Permit button only for Supervisors and Admins */}
          {(user?.role === ROLES.SUPERVISOR || user?.role === ROLES.ADMIN) && (
            <TouchableOpacity style={styles.createButton} onPress={handleAddNewPTW}>
              <Icon name="plus" size={20} color={THEME.white} />
              <Text style={styles.createButtonText}>New Permit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pending Actions Card */}
        {pendingPTWs.length > 0 && (
          <View style={styles.sectionContainer}>
            <PendingActionsCard
              pendingPTWs={pendingPTWs}
              onSelectPTW={handleEditPTW}
              workflowService={PTWWorkflowService}
              userRole={user?.role}
            />
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{ptwList.length}</Text>
              <Text style={styles.statLabel}>Total Permits</Text>
            </View>
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Text style={styles.statValue}>{ptwList.filter(p => p.status === 'in_progress').length}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={[styles.statCard, styles.statCardInfo]}>
              <Text style={styles.statValue}>{pendingPTWs.length}</Text>
              <Text style={styles.statLabel}>Pending Your Action</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Text style={styles.statValue}>{ptwList.filter(p => p.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.sectionContainer}>
          <View style={styles.filterSection}>
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color={THEME.grey[500]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search permits..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={THEME.grey[500]}
              />
            </View>
            
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterDropdown(true)}
            >
              <Icon name="filter-variant" size={18} color={THEME.primary} />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PTW List */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Permit Records</Text>
          <View style={styles.listContainer}>
            {filteredPTWs.map((ptw, index) => {
              const summary = PTWWorkflowService.getWorkflowSummary(ptw);
              const progressSteps = PTWWorkflowService.getProgressSteps(ptw);
              const canEdit = PTWWorkflowService.canEditPTW(user, ptw);
              const isPendingForUser = pendingPTWs.some(p => p.id === ptw.id);

              return (
                <TouchableOpacity 
                  key={ptw.id || index} 
                  style={[
                    styles.listItem,
                    isPendingForUser && styles.pendingListItem
                  ]}
                  onPress={() => handleViewPTW(ptw)}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemId}>{ptw.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ptw.status) }]}>
                      <Text style={styles.statusText}>
                        {ptw.status === 'in_progress' ? 'IN PROGRESS' : ptw.status?.toUpperCase() || 'UNKNOWN'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.listItemDetails}>
                    <View style={styles.listItemDetail}>
                      <Icon name="account" size={14} color={THEME.grey[600]} />
                      <Text style={styles.listItemDetailText}>
                        {ptw.initiatorName || user?.name || 'Not assigned'}
                      </Text>
                    </View>
                    <View style={styles.listItemDetail}>
                      <Icon name="map-marker" size={14} color={THEME.grey[600]} />
                      <Text style={styles.listItemDetailText} numberOfLines={1}>
                        {ptw.workLocation || 'Location not set'}
                      </Text>
                    </View>
                    <View style={styles.listItemDetail}>
                      <Icon name="calendar" size={14} color={THEME.grey[600]} />
                      <Text style={styles.listItemDetailText}>
                        {ptw.permitDate ? new Date(ptw.permitDate).toLocaleDateString() : 
                         ptw.createdAt ? new Date(ptw.createdAt).toLocaleDateString() : 
                         'Date not set'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Show current step for pending items */}
                  {isPendingForUser && ptw.workflow && (
                    <View style={styles.pendingStepBadge}>
                      <Text style={styles.pendingStepText}>
                        Action required: Step {ptw.workflow.currentStep} - {summary.currentStepName}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.progressContainer}>
                    <WorkflowProgress
                      steps={progressSteps}
                      percentage={summary.percentage}
                      compact={true}
                    />
                  </View>
                  
                  <View style={styles.listItemActions}>
                    {/* View button - everyone can view */}
                    <TouchableOpacity style={styles.actionIcon} onPress={() => handleViewPTW(ptw)}>
                      <Icon name="eye" size={18} color={THEME.info} />
                    </TouchableOpacity>
                    
                    {/* Edit button - show if user can edit */}
                    {canEdit && (
                      <TouchableOpacity style={styles.actionIcon} onPress={() => handleEditPTW(ptw)}>
                        <Icon name="pencil" size={18} color={THEME.accent} />
                      </TouchableOpacity>
                    )}
                    
                    {/* Delete button - only for admin */}
                    {user?.role === ROLES.ADMIN && (
                      <TouchableOpacity style={styles.actionIcon} onPress={() => handleDeletePTW(ptw.id)}>
                        <Icon name="delete" size={18} color={THEME.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredPTWs.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="file-document-outline" size={64} color={THEME.grey[400]} />
                <Text style={styles.emptyStateText}>No permits found</Text>
              </View>
            )}
          </View>
        </View>

        {/* Filter Dropdown Modal */}
        <Modal
          visible={showFilterDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFilterDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowFilterDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownTitle}>Filter by Status</Text>
              {['all', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    filterStatus === status && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    filterStatus === status && styles.dropdownItemTextSelected
                  ]}>
                    {status === 'all' ? 'All Permits' : 
                     status === 'in_progress' ? 'In Progress' :
                     status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                  {filterStatus === status && (
                    <Icon name="check" size={16} color={THEME.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    );
  };

  // View PTW Modal
  const ViewPTWModal = () => {
    if (!selectedPTW) return null;
    
    const summary = PTWWorkflowService.getWorkflowSummary(selectedPTW);
    const canEdit = PTWWorkflowService.canEditPTW(user, selectedPTW);

    return (
      <Modal
        visible={showPTWModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPTWModal(false);
          setSelectedPTW(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Permit Details</Text>
              <TouchableOpacity onPress={() => {
                setShowPTWModal(false);
                setSelectedPTW(null);
              }}>
                <Icon name="close" size={24} color={THEME.grey[600]} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Workflow Summary */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Workflow Status</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Current Stage:</Text>
                  <Text style={styles.detailValue}>{summary.currentStepName} ({summary.currentRole})</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Progress:</Text>
                  <View style={styles.progressContainer}>
                    <WorkflowProgress
                      steps={PTWWorkflowService.getProgressSteps(selectedPTW)}
                      percentage={summary.percentage}
                      compact={true}
                    />
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPTW.status) }]}>
                    <Text style={styles.statusText}>{summary.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              {/* Basic Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Basic Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Initiator:</Text>
                  <Text style={styles.detailValue}>{selectedPTW.initiatorName || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{selectedPTW.workLocation || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contractor:</Text>
                  <Text style={styles.detailValue}>{selectedPTW.contractorName || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Workmen:</Text>
                  <Text style={styles.detailValue}>{selectedPTW.workmenCount || '0'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{selectedPTW.workDescription || 'N/A'}</Text>
                </View>
              </View>

              {/* Step Timeline */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Step Timeline</Text>
                {selectedPTW.workflow.steps.map((step) => (
                  <View key={step.step} style={styles.timelineItem}>
                    <View style={styles.timelineMarker}>
                      {step.completed ? (
                        <Icon name="check-circle" size={20} color={THEME.success} />
                      ) : step.step === selectedPTW.workflow.currentStep ? (
                        <Icon name="clock-outline" size={20} color={THEME.warning} />
                      ) : (
                        <Icon name="circle-outline" size={20} color={THEME.grey[400]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStepName}>
                        Step {step.step}: {step.name} ({step.role})
                      </Text>
                      {step.completed ? (
                        <Text style={styles.timelineDetail}>
                          Completed by: {step.completedBy} on {new Date(step.completedAt).toLocaleString()}
                        </Text>
                      ) : step.step === selectedPTW.workflow.currentStep ? (
                        <Text style={styles.timelineDetail}>Currently in progress - waiting for {step.role}</Text>
                      ) : (
                        <Text style={styles.timelineDetail}>Pending</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              {canEdit && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.editButton]}
                  onPress={() => {
                    handleEditPTW(selectedPTW);
                    setShowPTWModal(false);
                  }}
                >
                  <Icon name="pencil" size={16} color={THEME.white} />
                  <Text style={styles.modalButtonText}>Continue Work</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.closeModalButton]}
                onPress={() => {
                  setShowPTWModal(false);
                  setSelectedPTW(null);
                }}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Form Component
  const PTWForm = () => {
    const currentPTW = selectedPTW || formData;
    const summary = PTWWorkflowService.getWorkflowSummary(currentPTW);

    return (
      <KeyboardAvoidingView 
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.formScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContentContainer}
        >
          {/* Form Header */}
          <View style={styles.formHeader}>
            <View style={styles.formHeaderTop}>
              <Text style={styles.formTitle}>
                {modalMode === 'edit' ? 'Edit Permit' : 'New Work Permit'}
              </Text>
              {formData.id && (
                <Text style={styles.formId}>{formData.id}</Text>
              )}
            </View>
            
            <View style={styles.formMeta}>
              <View style={styles.metaItem}>
                <Icon name="file-document-outline" size={14} color={THEME.grey[600]} />
                <Text style={styles.metaText}>EPL/SAF/F-01</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="calendar-refresh" size={14} color={THEME.grey[600]} />
                <Text style={styles.metaText}>Rev 01</Text>
              </View>
              {modalMode === 'edit' && (
                <View style={styles.editModeBadge}>
                  <Text style={styles.editModeText}>Editing</Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Workflow Progress</Text>
              <Text style={styles.progressPercentage}>{summary.percentage || 0}% Complete</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${summary.percentage || 0}%` }
                ]} 
              />
            </View>
            <View style={styles.progressStepsIndicator}>
              <Text style={styles.progressStepText}>
                Step {currentStep} of 10: {PTWWorkflowService.stepNames[currentStep]}
              </Text>
            </View>
          </View>

          {/* Step Navigation - Simplified circles for step selection */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.stepNavigator}
            contentContainerStyle={styles.stepNavigatorContent}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
              const isCurrentStep = step === currentStep;
              const isCompleted = currentPTW.workflow?.steps[step - 1]?.completed;
              const requiredRole = PTWWorkflowService.stepRoles[step];
              
              // Determine if user can access this step
              let canAccess = false;
              if (user?.role === ROLES.ADMIN) {
                canAccess = true;
              } else if (currentPTW.workflow) {
                // For completed steps, anyone can view them
                if (isCompleted) {
                  canAccess = true;
                } 
                // For current step, only users with correct role can access
                else if (step === currentPTW.workflow.currentStep) {
                  canAccess = user?.role === requiredRole;
                }
                // Future steps are not accessible
                else {
                  canAccess = false;
                }
              }

              return (
                <TouchableOpacity
                  key={step}
                  style={[
                    styles.stepCircleItem,
                    isCurrentStep && styles.stepCircleItemActive,
                    !canAccess && styles.stepCircleItemDisabled
                  ]}
                  onPress={() => canAccess && setCurrentStep(step)}
                  disabled={!canAccess}
                >
                  <View style={[
                    styles.stepCircle,
                    isCurrentStep && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted
                  ]}>
                    {isCompleted ? (
                      <Icon name="check" size={14} color={THEME.white} />
                    ) : (
                      <Text style={[
                        styles.stepCircleText,
                        isCurrentStep && styles.stepCircleTextActive
                      ]}>
                        {step}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepCircleLabel,
                    isCurrentStep && styles.stepCircleLabelActive
                  ]} numberOfLines={1}>
                    {PTWWorkflowService.stepNames[step].split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendCompleted]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendCurrent]} />
              <Text style={styles.legendText}>Current</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendPending]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
          </View>

          {/* Current Step Content */}
          <View style={styles.stepContent}>
            {renderCurrentStep()}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, styles.navPrev, currentStep === 1 && styles.navDisabled]}
              onPress={prevStep}
              disabled={currentStep === 1}
            >
              <Icon name="chevron-left" size={18} color={currentStep === 1 ? THEME.grey[500] : THEME.white} />
              <Text style={[styles.navButtonText, currentStep === 1 && styles.navTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            
            <Text style={styles.stepCounter}>{currentStep}/10</Text>
            
            {currentStep < 10 ? (
              <TouchableOpacity style={[styles.navButton, styles.navNext]} onPress={nextStep}>
                <Text style={styles.navButtonText}>Next</Text>
                <Icon name="chevron-right" size={18} color={THEME.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.navButton, styles.submitButton]} onPress={handleSubmit}>
                <Icon name="check" size={18} color={THEME.white} />
                <Text style={styles.navButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Reject Modal */}
        <Modal
          visible={showRejectModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.rejectModal}>
              <Text style={styles.rejectModalTitle}>Reject Step</Text>
              <Text style={styles.rejectModalSubtitle}>Please provide a reason for rejection:</Text>
              <TextInput
                style={styles.rejectInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Enter rejection reason..."
                multiline
                numberOfLines={3}
                placeholderTextColor={THEME.grey[500]}
              />
              <View style={styles.rejectModalActions}>
                <TouchableOpacity
                  style={[styles.rejectButton, styles.rejectCancel]}
                  onPress={() => setShowRejectModal(false)}
                >
                  <Text style={styles.rejectCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectButton, styles.rejectConfirm]}
                  onPress={handleRejectStep}
                >
                  <Text style={styles.rejectConfirmText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={THEME.primaryDark} barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.topBarBack}>
            <Icon name="arrow-left" size={24} color={THEME.white} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Permit to Work System</Text>
          <View style={styles.topBarPlaceholder} />
        </View>
        {showDashboard ? (
          <>
            <Dashboard />
            <ViewPTWModal />
          </>
        ) : (
          <PTWForm />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Add these new styles to your StyleSheet

progressBarContainer: {
  backgroundColor: THEME.white,
  borderRadius: 12,
  padding: SPACING.md,
  marginBottom: SPACING.md,
  borderWidth: 1,
  borderColor: THEME.grey[200],
},
progressHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.sm,
},
progressTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: THEME.primary,
},
progressPercentage: {
  fontSize: 14,
  fontWeight: '700',
  color: THEME.primary,
},
progressBarBackground: {
  height: 8,
  backgroundColor: THEME.grey[200],
  borderRadius: 4,
  overflow: 'hidden',
  marginBottom: SPACING.sm,
},
progressBarFill: {
  height: '100%',
  backgroundColor: "green",
  borderRadius: 4,
},
progressStepsIndicator: {
  marginTop: SPACING.xs,
},
progressStepText: {
  fontSize: 12,
  color: THEME.grey[600],
  fontStyle: 'italic',
},
stepCircleItem: {
  alignItems: 'center',
  paddingHorizontal: SPACING.sm,
  paddingVertical: SPACING.xs,
  minWidth: 60,
},
stepCircleItemActive: {
  borderBottomWidth: 2,
  borderBottomColor: THEME.primary,
},
stepCircleItemDisabled: {
  opacity: 0.5,
},
stepCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: THEME.grey[200],
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: SPACING.xs,
  borderWidth: 1,
  borderColor: 'transparent',
},
stepCircleActive: {
  backgroundColor: THEME.primary,
  borderColor: THEME.primary,
},
stepCircleCompleted: {
  backgroundColor: "green",
  borderColor: THEME.success,
},
stepCircleText: {
  fontSize: 14,
  color: THEME.grey[700],
  fontWeight: '600',
},
stepCircleTextActive: {
  color: THEME.white,
},
stepCircleLabel: {
  fontSize: 10,
  color: THEME.grey[600],
  textAlign: 'center',
},
stepCircleLabelActive: {
  color: THEME.primary,
  fontWeight: '600',
},
legendContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: SPACING.lg,
  marginBottom: SPACING.md,
  paddingVertical: SPACING.sm,
  backgroundColor: THEME.white,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: THEME.grey[200],
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.xs,
},
legendDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
},
legendCompleted: {
  backgroundColor: "green",
},
legendCurrent: {
  backgroundColor: THEME.primary,
},
legendPending: {
  backgroundColor: THEME.grey[400],
},
legendText: {
  fontSize: 12,
  color: THEME.grey[700],
},
  safeArea: { 
    flex: 1, 
    backgroundColor: THEME.primary 
  },
  container: { 
    flex: 1, 
    backgroundColor: THEME.grey[100] 
  },
  topBar: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.md,
    backgroundColor: THEME.primary, 
    elevation: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, 
    shadowRadius: 2,
  },
  topBarBack: { 
    padding: SPACING.xs 
  },
  topBarTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: THEME.white 
  },
  topBarPlaceholder: { 
    width: 32 
  },
  
  // Dashboard Styles
  dashboard: { 
    flex: 1 
  },
  dashboardContent: { 
    paddingBottom: SPACING.xl 
  },
  dashboardHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.lg,
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.grey[200],
  },
  dashboardTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: THEME.primary, 
    marginBottom: SPACING.xs 
  },
  dashboardSubtitle: { 
    fontSize: 13, 
    color: THEME.grey[600] 
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
    marginBottom: SPACING.md,
  },
  createButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.primary,
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.sm, 
    borderRadius: 8, 
    gap: SPACING.sm,
  },
  createButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: THEME.white 
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SPACING.sm 
  },
  statCard: {
    flex: 1, 
    minWidth: '45%', 
    backgroundColor: THEME.white,
    padding: SPACING.md, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: THEME.grey[200], 
    alignItems: 'center',
  },
  statCardWarning: {
    borderLeftWidth: 3,
    borderLeftColor: THEME.warning,
  },
  statCardInfo: {
    borderLeftWidth: 3,
    borderLeftColor: THEME.info,
  },
  statCardSuccess: {
    borderLeftWidth: 3,
    borderLeftColor: THEME.success,
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: THEME.primary, 
    marginBottom: SPACING.xs 
  },
  statLabel: { 
    fontSize: 12, 
    color: THEME.grey[600], 
    textTransform: 'uppercase' 
  },
  filterSection: { 
    flexDirection: 'row', 
    gap: SPACING.sm 
  },
  searchContainer: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.white,
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: THEME.grey[300], 
    paddingHorizontal: SPACING.sm,
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: SPACING.sm, 
    paddingHorizontal: SPACING.xs, 
    fontSize: 14 
  },
  filterButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.white,
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    borderRadius: 8,
    borderWidth: 1, 
    borderColor: THEME.grey[300], 
    gap: SPACING.xs,
  },
  filterButtonText: { 
    fontSize: 14, 
    color: THEME.primary, 
    fontWeight: '600' 
  },
  listContainer: {
    backgroundColor: THEME.white, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: THEME.grey[200],
    overflow: 'hidden',
  },
  listItem: { 
    padding: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.grey[200] 
  },
  pendingListItem: {
    backgroundColor: `${THEME.primary}08`,
  },
  listItemHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.sm 
  },
  listItemId: { 
    fontSize: 16, 
    color: THEME.primary, 
    fontWeight: '600' 
  },
  listItemDetails: { 
    marginBottom: SPACING.sm 
  },
  listItemDetail: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs, 
    marginBottom: SPACING.xs 
  },
  listItemDetailText: { 
    fontSize: 14, 
    color: THEME.grey[700] 
  },
  listItemActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: SPACING.lg 
  },
  actionIcon: { 
    padding: SPACING.xs 
  },
  statusBadge: { 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: SPACING.xs, 
    borderRadius: 12 
  },
  statusText: { 
    fontSize: 12, 
    color: THEME.white, 
    fontWeight: '600' 
  },
  pendingStepBadge: {
    backgroundColor: `${THEME.warning}20`,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  pendingStepText: {
    fontSize: 12,
    color: THEME.warning,
    fontWeight: '600',
  },
  emptyState: { 
    padding: SPACING.xxxl, 
    alignItems: 'center' 
  },
  emptyStateText: { 
    fontSize: 16, 
    color: THEME.grey[500], 
    marginTop: SPACING.md 
  },
  progressContainer: { 
    marginBottom: SPACING.md 
  },

  // Dropdown Styles
  dropdownOverlay: { 
    flex: 1, 
    backgroundColor: THEME.overlay, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  dropdownContainer: {
    width: '80%', 
    maxHeight: '70%', 
    backgroundColor: THEME.white,
    borderRadius: 12, 
    padding: SPACING.sm, 
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, 
    shadowRadius: 4,
  },
  dropdownTitle: { 
    fontSize: 16, 
    color: THEME.primary, 
    fontWeight: '600', 
    padding: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.grey[200] 
  },
  dropdownItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.grey[200] 
  },
  dropdownItemSelected: { 
    backgroundColor: `${THEME.primary}10` 
  },
  dropdownItemText: { 
    fontSize: 14, 
    color: THEME.grey[800] 
  },
  dropdownItemTextSelected: { 
    color: THEME.primary, 
    fontWeight: '600' 
  },

  // Form Styles
  formContainer: { 
    flex: 1 
  },
  formScrollView: { 
    flex: 1 
  },
  formContentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  formHeader: { 
    backgroundColor: THEME.white, 
    borderRadius: 12, 
    padding: SPACING.md, 
    marginTop: SPACING.lg,
    marginBottom: SPACING.md, 
    borderWidth: 1, 
    borderColor: THEME.grey[200] 
  },
  formHeaderTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.sm 
  },
  formTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: THEME.primary 
  },
  formId: { 
    fontSize: 14, 
    color: THEME.grey[600], 
    backgroundColor: THEME.grey[100], 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: SPACING.xs, 
    borderRadius: 12 
  },
  formMeta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.md 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs 
  },
  metaText: { 
    fontSize: 12, 
    color: THEME.grey[600] 
  },
  editModeBadge: { 
    backgroundColor: THEME.accent, 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: SPACING.xs, 
    borderRadius: 12 
  },
  editModeText: { 
    fontSize: 12, 
    color: THEME.white, 
    fontWeight: '600' 
  },
  stepNavigator: { 
    backgroundColor: THEME.white, 
    borderRadius: 12, 
    marginBottom: SPACING.md, 
    borderWidth: 1, 
    borderColor: THEME.grey[200] 
  },
  stepNavigatorContent: { 
    paddingHorizontal: SPACING.sm 
  },
  stepItem: { 
    alignItems: 'center', 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    minWidth: 80 
  },
  stepItemActive: { 
    borderBottomWidth: 2, 
    borderBottomColor: THEME.primary 
  },
  stepItemDisabled: { 
    opacity: 0.5 
  },
  stepIndicator: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: THEME.grey[200], 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: SPACING.xs 
  },
  stepIndicatorActive: { 
    backgroundColor: THEME.primary 
  },
  stepIndicatorCompleted: { 
    backgroundColor: THEME.success 
  },
  stepIndicatorText: { 
    fontSize: 12, 
    color: THEME.grey[700], 
    fontWeight: '600' 
  },
  stepIndicatorTextActive: { 
    color: THEME.white 
  },
  stepLabel: { 
    fontSize: 11, 
    color: THEME.grey[600] 
  },
  stepLabelActive: { 
    color: THEME.primary, 
    fontWeight: '600' 
  },
  stepContent: {
    marginBottom: SPACING.md,
  },
  navigationButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: THEME.white, 
    borderRadius: 12, 
    padding: SPACING.md, 
    borderWidth: 1, 
    borderColor: THEME.grey[200] 
  },
  navButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.sm, 
    borderRadius: 8, 
    gap: SPACING.xs 
  },
  navPrev: { 
    backgroundColor: THEME.primary 
  },
  navNext: { 
    backgroundColor: THEME.primary 
  },
  navDisabled: { 
    backgroundColor: THEME.grey[200] 
  },
  navButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: THEME.white 
  },
  navTextDisabled: { 
    color: THEME.grey[500] 
  },
  stepCounter: { 
    fontSize: 14, 
    color: THEME.grey[700], 
    fontWeight: '600' 
  },
  submitButton: { 
    backgroundColor: THEME.success 
  },

  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: THEME.overlay, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalView: { 
    width: '90%', 
    maxHeight: '80%', 
    backgroundColor: THEME.white, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SPACING.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.grey[200] 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: THEME.primary 
  },
  modalContent: { 
    padding: SPACING.lg 
  },
  modalFooter: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    padding: SPACING.lg, 
    borderTopWidth: 1, 
    borderTopColor: THEME.grey[200], 
    gap: SPACING.sm 
  },
  modalButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.sm, 
    borderRadius: 8, 
    gap: SPACING.xs 
  },
  editButton: { 
    backgroundColor: THEME.primary 
  },
  closeModalButton: { 
    backgroundColor: THEME.grey[600] 
  },
  modalButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: THEME.white 
  },

  // Detail View Styles
  detailSection: { 
    marginBottom: SPACING.lg 
  },
  detailSectionTitle: { 
    fontSize: 16, 
    color: THEME.primary, 
    fontWeight: '600', 
    marginBottom: SPACING.sm, 
    paddingBottom: SPACING.xs, 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.grey[200] 
  },
  detailRow: { 
    flexDirection: 'row', 
    marginBottom: SPACING.sm, 
    alignItems: 'center' 
  },
  detailLabel: { 
    fontSize: 14, 
    color: THEME.grey[600], 
    width: '35%' 
  },
  detailValue: { 
    fontSize: 14, 
    color: THEME.grey[800], 
    fontWeight: '500', 
    width: '65%' 
  },
  
  // Timeline Styles
  timelineItem: { 
    flexDirection: 'row', 
    gap: SPACING.sm, 
    marginBottom: SPACING.md 
  },
  timelineMarker: { 
    width: 24, 
    alignItems: 'center' 
  },
  timelineContent: { 
    flex: 1 
  },
  timelineStepName: { 
    fontSize: 14, 
    color: THEME.grey[800], 
    fontWeight: '600', 
    marginBottom: 2 
  },
  timelineDetail: { 
    fontSize: 12, 
    color: THEME.grey[600] 
  },

  // Reject Modal
  rejectModal: { 
    width: '80%', 
    backgroundColor: THEME.white, 
    borderRadius: 16, 
    padding: SPACING.lg 
  },
  rejectModalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: THEME.danger, 
    marginBottom: SPACING.sm 
  },
  rejectModalSubtitle: { 
    fontSize: 14, 
    color: THEME.grey[600], 
    marginBottom: SPACING.md 
  },
  rejectInput: { 
    borderWidth: 1, 
    borderColor: THEME.grey[300], 
    borderRadius: 8, 
    padding: SPACING.md, 
    marginBottom: SPACING.lg, 
    minHeight: 80, 
    textAlignVertical: 'top' 
  },
  rejectModalActions: { 
    flexDirection: 'row', 
    gap: SPACING.sm 
  },
  rejectButton: { 
    flex: 1, 
    padding: SPACING.md, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  rejectCancel: { 
    backgroundColor: THEME.grey[200] 
  },
  rejectCancelText: { 
    color: THEME.grey[700], 
    fontWeight: '600' 
  },
  rejectConfirm: { 
    backgroundColor: THEME.danger 
  },
  rejectConfirmText: { 
    color: THEME.white, 
    fontWeight: '600' 
  },
});

export default PermitToWork;