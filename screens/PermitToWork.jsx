import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAuth } from './worker-module/context/AuthContext';
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

const THEME = {
  primary: '#031071',
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

const PermitToWork = ({ route, userData }) => {
  const navigation = useNavigation();
  const { user: authUser } = useAuth();

  const normalizeUserData = (inputUser) => {
  if (!inputUser) {
    return {
      role_name: 'Unknown',
      s_full_name: 'Unknown User',
      s_email: 'unknown',
      name: 'Unknown User',
      fullName: 'Unknown User',
      role: { role_name: 'Unknown' }
    };
  }

  // Extract role name
  let role_name = 'Unknown';
  if (inputUser.role_name) {
    role_name = inputUser.role_name;
  } else if (inputUser.role?.role_name) {
    role_name = inputUser.role.role_name;
  } else if (inputUser.role?.name) {
    role_name = inputUser.role.name;
  } else if (inputUser.userRole) {
    role_name = inputUser.userRole;
  } else if (typeof inputUser.role === 'string') {
    role_name = inputUser.role;
  }

  // Extract full name
  let s_full_name = 'Unknown User';
  if (inputUser.s_full_name) {
    s_full_name = inputUser.s_full_name;
  } else if (inputUser.fullName) {
    s_full_name = inputUser.fullName;
  } else if (inputUser.name) {
    s_full_name = inputUser.name;
  } else if (inputUser.username) {
    s_full_name = inputUser.username;
  }

  // Return normalized user with isAdmin flag
  return {
    ...inputUser,
    role_name,
    s_full_name,
    displayName: s_full_name,
    displayRole: role_name,
    isAdmin: role_name === ROLES.ADMIN,  // This is important!
    isSupervisor: role_name === ROLES.SUPERVISOR,
    isContractor: role_name === ROLES.CONTRACTOR,
    isSafetyOfficer: role_name === ROLES.SAFETY_OFFICER,
  };
};

  const user = normalizeUserData(authUser || route?.params?.userData);

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

  // Form state - consolidated to avoid duplication
  const [formState, setFormState] = useState({
    // Basic Info
    permitDate: '',
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
    
    // Security
    securitySupervisor: '',
    idCheck: [],
    
    // Work Type
    workType: [],
    otherWorkType: '',
    cancellationReason: '',
    workDescription: '',
    workLocation: '',
    safetyInstructions: '',
    
    // Equipment & PPE
    equipment: [],
    ppe: [],
    
    // TBT
    tbtContractor: '',
    tbtTime: '',
    tbtConfirm: false,
    tbt: [],
    
    // Authorization
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
    
    // Closure
    permitStatus: '',
    closureDate: '',
    closureTime: '',
    closureRemarks: '',
    signature: null,
    
    // Meta
    id: '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    workflow: null,
  });

  // Dynamic data for steps
  const [attendanceRows, setAttendanceRows] = useState([
    { id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: '' }
  ]);
  
  const [riskRows, setRiskRows] = useState([
    { id: Date.now(), description: '', status: 'open', responsible: '', mitigation: '' }
  ]);

  const [currentStep, setCurrentStep] = useState(1);

  // Load PTWs from AsyncStorage on mount
  useEffect(() => {
    loadPTWs();
  }, []);

  const loadPTWs = async () => {
    try {
      const stored = await AsyncStorage.getItem('ptwList');
      if (stored) {
        setPtwList(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading PTWs:', error);
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
    if (user?.role_name !== ROLES.SUPERVISOR && user?.role_name !== ROLES.ADMIN) {
      Alert.alert('Permission Denied', 'Only Supervisors and Admins can create new PTWs');
      return;
    }

    const newId = generatePTWId();
    const workflow = PTWWorkflowService.initializeWorkflow(
      user?.s_full_name || 'User',
      user?.role_name || ROLES.SUPERVISOR
    );

    // Reset form state for new PTW
    setFormState({
      ...formState,
      id: newId,
      permitDate: new Date().toISOString().split('T')[0],
      initiatorName: user?.s_full_name || '',
      workLocation: '',
      contractorName: '',
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
    if (!PTWWorkflowService.canEditPTW(user, ptw)) {
      Alert.alert('Permission Denied', 'You cannot edit this PTW at this stage');
      return;
    }

    // Load PTW data into form state
    setFormState(ptw);
    setSelectedPTW(ptw);
    setModalMode('edit');
    setShowDashboard(false);
    setCurrentStep(ptw.workflow?.currentStep || 1);

    // Load attendance and risk rows if they exist
    if (ptw.workflow?.stepData?.[2]?.attendance) {
      setAttendanceRows(ptw.workflow.stepData[2].attendance);
    }
    if (ptw.workflow?.stepData?.[7]?.risks) {
      setRiskRows(ptw.workflow.stepData[7].risks);
    }
  };

  const handleDeletePTW = async (id) => {
    if (user?.role_name !== ROLES.ADMIN) {
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
    // Get the current PTW data
    const currentPTW = selectedPTW || formState;
    
    if (!currentPTW.id) {
      Alert.alert('Error', 'No PTW selected');
      return;
    }

    const stepNumber = currentStep;

    // Double-check permission
    if (!PTWWorkflowService.canEditPTW(user, currentPTW)) {
      Alert.alert('Permission Denied', 'You do not have permission to complete this step');
      return;
    }

    if (!PTWWorkflowService.isStepAvailableForUser(user, stepNumber, currentPTW)) {
      Alert.alert('Permission Denied', 'This step is not available for you to complete');
      return;
    }

    // Update form state with step data
    const updatedFormState = {
      ...currentPTW,
      ...stepData,
    };

    // Add step-specific data to workflow
    if (!updatedFormState.workflow) {
      updatedFormState.workflow = PTWWorkflowService.initializeWorkflow(
        user?.s_full_name || 'User',
        user?.role_name
      );
    }

    // Complete the step using workflow service
    const updatedPTW = PTWWorkflowService.completeStep(
      updatedFormState,
      stepNumber,
      user,
      stepData,
      notes
    );

    // Update local state
    if (selectedPTW) {
      setSelectedPTW(updatedPTW);
    }
    setFormState(updatedPTW);

    // Update the list
    const updatedList = ptwList.map(p => 
      p.id === updatedPTW.id ? updatedPTW : p
    );
    setPtwList(updatedList);
    savePTWs(updatedList);

    // Handle navigation
    if (stepNumber === 10) {
      Alert.alert('Success', 'PTW has been completed!');
      setShowDashboard(true);
      setSelectedPTW(null);
    } else {
      setCurrentStep(stepNumber + 1);
      Alert.alert('Success', `Step ${stepNumber} completed successfully!`);
    }
  };

  const handleRejectStep = () => {
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    const currentPTW = selectedPTW || formState;
    const stepNumber = currentStep;

    // You'll need to implement rejectStep in PTWWorkflowService
    // For now, just go back to previous step
    const updatedList = ptwList.map(p => p.id === currentPTW.id ? currentPTW : p);
    setPtwList(updatedList);
    savePTWs(updatedList);

    setShowRejectModal(false);
    setRejectReason('');
    setCurrentStep(stepNumber - 1);

    Alert.alert('Step Rejected', 'Step rejected and sent back to previous stage');
  };

  const handleCancelPTW = () => {
    if (user?.role_name !== ROLES.ADMIN && user?.role_name !== ROLES.SUPERVISOR) {
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

            const currentPTW = selectedPTW || formState;
            const updatedPTW = {
              ...currentPTW,
              status: 'cancelled',
              workflow: {
                ...currentPTW.workflow,
                status: 'cancelled',
                timeline: [
                  ...(currentPTW.workflow?.timeline || []),
                  {
                    step: currentStep,
                    action: 'cancelled',
                    by: user?.s_full_name,
                    byRole: user?.role_name,
                    at: new Date().toISOString(),
                    note: reason,
                  }
                ]
              }
            };

            const updatedList = ptwList.map(p => p.id === updatedPTW.id ? updatedPTW : p);
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
    // This is for final submission of a new PTW (Step 1 completion triggers workflow)
    if (!formState.workflow) {
      const workflow = PTWWorkflowService.initializeWorkflow(
        user?.s_full_name || 'User',
        user?.role_name
      );
      
      const newPTW = {
        ...formState,
        id: formState.id || generatePTWId(),
        status: 'in_progress',
        workflow,
      };

      const updatedList = [...ptwList, newPTW];
      setPtwList(updatedList);
      await savePTWs(updatedList);
      setShowDashboard(true);
      Alert.alert('Success', 'PTW created successfully!');
    }
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

  const updateFormData = useCallback((updates) => {
    setFormState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Get filtered PTWs
  const filteredPTWs = ptwList.filter(ptw => {
    const matchesSearch =
      (ptw.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.initiatorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.contractorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.workLocation?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ptw.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get pending actions
  const pendingPTWs = PTWWorkflowService.getUserPendingActions(user, ptwList);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return THEME.warning;
      case 'completed': return THEME.success;
      case 'cancelled': return THEME.danger;
      default: return THEME.grey[600];
    }
  };

  const renderCurrentStep = () => {
  const currentPTW = selectedPTW || formState;
  
  // Check permissions - ADMIN should always have access
  const canEdit = PTWWorkflowService.canEditPTW(user, currentPTW);
  const isStepAvailable = PTWWorkflowService.isStepAvailableForUser(
    user,
    currentStep,
    currentPTW
  );
  
  // For ADMIN, always allow editing regardless of step availability
  const userCanEdit = user?.isAdmin || (canEdit && isStepAvailable);

  console.log('Permission check:', {
    userRole: user?.role_name,
    isAdmin: user?.isAdmin,
    canEdit,
    isStepAvailable,
    userCanEdit,
    currentStep
  });

  // Base props for all steps
  const baseProps = {
    formData: currentPTW,
    setFormData: updateFormData,
    user,
    onComplete: handleCompleteStep,
    onReject: () => setShowRejectModal(true),
    canEdit: userCanEdit,
  };
    // Add step-specific props
    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...baseProps} />;
        
      case 2:
        return (
          <SecurityVerificationStep 
            {...baseProps}
            attendanceRows={attendanceRows}
            setAttendanceRows={setAttendanceRows}
          />
        );
        
      case 3:
        return <WorkTypeStep {...baseProps} />;
        
      case 4:
        return <EquipmentStep {...baseProps} />;
        
      case 5:
        return <PPEStep {...baseProps} />;
        
      case 6:
        return <ChecklistsStep {...baseProps} />;
        
      case 7:
        return (
          <RiskAssessmentStep 
            {...baseProps}
            riskRows={riskRows}
            setRiskRows={setRiskRows}
          />
        );
        
      case 8:
        return <TBTStep {...baseProps} />;
        
      case 9:
        return <AuthorizationStep {...baseProps} />;
        
      case 10:
        return <ClosureStep {...baseProps} />;
        
      default:
        return null;
    }
  };

  // Dashboard Component
  const Dashboard = () => {
    return (
      <ScrollView
        style={styles.dashboard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.dashboardContent}
      >
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.dashboardTitle}>Permit to Work</Text>
            <Text style={styles.dashboardSubtitle}>
              Welcome, {user?.s_full_name || 'User'}
            </Text>
          </View>
          {(user?.role_name === ROLES.SUPERVISOR || user?.role_name === ROLES.ADMIN) && (
            <TouchableOpacity style={styles.createButton} onPress={handleAddNewPTW}>
              <Icon name="plus" size={20} color={THEME.white} />
              <Text style={styles.createButtonText}>New Permit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pending Actions */}
        {pendingPTWs.length > 0 && (
          <View style={styles.sectionContainer}>
            <PendingActionsCard
              pendingPTWs={pendingPTWs}
              onSelectPTW={handleEditPTW}
              workflowService={PTWWorkflowService}
              userRole={user?.role_name}
            />
          </View>
        )}

        {/* Stats */}
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
                        {ptw.initiatorName || 'Not assigned'}
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
                    <TouchableOpacity style={styles.actionIcon} onPress={() => handleViewPTW(ptw)}>
                      <Icon name="eye" size={18} color={THEME.info} />
                    </TouchableOpacity>

                    {canEdit && (
                      <TouchableOpacity style={styles.actionIcon} onPress={() => handleEditPTW(ptw)}>
                        <Icon name="pencil" size={18} color={THEME.accent} />
                      </TouchableOpacity>
                    )}

                    {user?.role_name === ROLES.ADMIN && (
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
                {selectedPTW.workflow?.steps?.map((step) => (
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
    const currentPTW = selectedPTW || formState;
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
              {currentPTW.id && (
                <Text style={styles.formId}>{currentPTW.id}</Text>
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

          {/* Step Navigation */}
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

              let canAccess = false;
              if (user?.role_name === ROLES.ADMIN) {
                canAccess = true;
              } else if (currentPTW.workflow) {
                if (isCompleted) {
                  canAccess = true;
                } else if (step === currentPTW.workflow.currentStep) {
                  canAccess = user?.role_name === requiredRole;
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

// Styles remain the same as in your original code...
const styles = StyleSheet.create({
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
    backgroundColor: THEME.success,
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
    backgroundColor: THEME.success,
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
    backgroundColor: THEME.success,
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