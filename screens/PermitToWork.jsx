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
  Switch,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

// Professional color palette
const COLORS = {
  primary: '#1E3A8A',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  secondary: '#059669',
  secondaryLight: '#10B981',
  accent: '#D97706',
  danger: '#DC2626',
  warning: '#F59E0B',
  success: '#059669',
  info: '#2563EB',
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

// Typography
const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

// Spacing
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Work Type Options with icons
const workTypeOptions = [
  { id: 'workHot', value: 'hot', label: 'Hot Work', description: 'Welding, Cutting, Grinding', icon: 'fire' },
  { id: 'workHeight', value: 'height', label: 'Work at Height', description: 'Scaffold, Roof, Ladder', icon: 'ladder' },
  { id: 'workElectricalHT', value: 'electrical_ht', label: 'Electrical Work H.T.', description: 'High Tension', icon: 'flash' },
  { id: 'workElectricalLT', value: 'electrical_lt', label: 'Electrical Work L.T.', description: 'Low Tension', icon: 'flash-outline' },
  { id: 'workElectricalShutdown', value: 'electrical_shutdown', label: 'Electrical Shutdown', description: 'Power Isolation', icon: 'power-plug-off' },
  { id: 'workConfined', value: 'confined', label: 'Confined Space', description: 'Tanks, Vessels, Pits', icon: 'square-outline' },
  { id: 'workHazardous', value: 'hazardous', label: 'Hazardous Material', description: 'Chemical Handling', icon: 'biohazard' },
  { id: 'workLineBreaking', value: 'line_breaking', label: 'Line Breaking', description: 'Process Piping', icon: 'pipe' },
  { id: 'workMachineInstall', value: 'machine_install', label: 'Machine Installation', description: 'Commissioning', icon: 'cog' },
  { id: 'workPlumbing', value: 'plumbing', label: 'Plumbing', description: 'Utility Line Work', icon: 'pipe' },
  { id: 'workLifting', value: 'lifting', label: 'Lifting Operations', description: 'Shifting/Dismantling', icon: 'crane' },
  { id: 'workService', value: 'service', label: 'Service/Repair', description: 'Machine Service', icon: 'wrench' },
  { id: 'workExcavation', value: 'excavation', label: 'Excavation', description: 'Civil Work', icon: 'excavator' },
  { id: 'workOther', value: 'other', label: 'Others', description: 'Specify', icon: 'dots-horizontal' }
];

// Equipment Options without icons
const equipmentOptions = [
  { id: 'eq1', value: 'three_phase', label: 'Three Phase Plug' },
  { id: 'eq2', value: 'extension', label: 'Extension Board' },
  { id: 'eq3', value: 'arc_welding', label: 'Arc Welding' },
  { id: 'eq4', value: 'gas_welding', label: 'Gas Welding' },
  { id: 'eq5', value: 'grinder', label: 'Grinder' },
  { id: 'eq6', value: 'single_phase', label: 'Single Phase Plug' },
  { id: 'eq7', value: 'cutter', label: 'Cutter' },
  { id: 'eq8', value: 'crowbar', label: 'Crowbar' },
  { id: 'eq9', value: 'axe', label: 'Axe' },
  { id: 'eq10', value: 'scythe', label: 'Scythe' },
  { id: 'eq11', value: 'scissor', label: 'Scissor' },
  { id: 'eq12', value: 'hoe', label: 'Hoe' },
  { id: 'eq13', value: 'strap', label: 'Strap' },
  { id: 'eq14', value: 'scissor_lift', label: 'Scissor Lift' },
  { id: 'eq15', value: 'crane', label: 'Crane' },
  { id: 'eq16', value: 'hydra', label: 'Hydra' },
  { id: 'eq17', value: 'farana', label: 'Farana' },
  { id: 'eq18', value: 'water_pump', label: 'Water Pump' },
  { id: 'eq19', value: 'forklift', label: 'Forklift' },
  { id: 'eq20', value: 'scaffolding', label: 'Scaffolding' },
  { id: 'eq21', value: 'ladder', label: 'Ladder' },
  { id: 'eq22', value: 'lockout_tagout', label: 'Lockout/Tagout' },
  { id: 'eq23', value: 'warning_signs', label: 'Warning Signs' },
  { id: 'eq24', value: 'oxygen_meter', label: 'Oxygen Meter' },
  { id: 'eq25', value: 'barricades', label: 'Barricades' },
  { id: 'eq26', value: 'barrier_tape', label: 'Barrier Tape' },
  { id: 'eq27', value: 'fire_powder', label: 'Fire Extinguisher' },
  { id: 'eq28', value: 'fire_co2', label: 'Fire Extinguisher CO2' },
  { id: 'eq29', value: 'multimeter', label: 'Multimeter' },
  { id: 'eq30', value: 'clamp_meter', label: 'Clamp Meter' }
];

// PPE Options without icons
const ppeOptions = [
  { id: 'ppe1', value: 'cut_gloves', label: 'Cut Resistant Gloves' },
  { id: 'ppe2', value: 'safety_glasses', label: 'Safety Glasses' },
  { id: 'ppe3', value: 'goggles', label: 'Goggles' },
  { id: 'ppe4', value: 'hard_hat', label: 'Hard Hat' },
  { id: 'ppe5', value: 'ht_gloves', label: 'HT Gloves' },
  { id: 'ppe6', value: 'heat_jacket', label: 'Heat Jacket' },
  { id: 'ppe7', value: 'respirator', label: 'Respirator' },
  { id: 'ppe8', value: 'face_shield', label: 'Face Shield' },
  { id: 'ppe9', value: 'radiant_gloves', label: 'Radiant Gloves' },
  { id: 'ppe10', value: 'electrical_gloves', label: 'Electrical Gloves' },
  { id: 'ppe11', value: 'safety_shoes', label: 'Safety Shoes' },
  { id: 'ppe12', value: 'fall_protection', label: 'Fall Protection' },
  { id: 'ppe13', value: 'full_face', label: 'Full Face PPE' },
  { id: 'ppe14', value: 'safety_belt', label: 'Safety Belt' },
  { id: 'ppe15', value: 'gumboots', label: 'Gumboots' },
  { id: 'ppe16', value: 'ear_plugs', label: 'Ear Plugs' },
  { id: 'ppe17', value: 'dust_masks', label: 'Dust Masks' },
  { id: 'ppe18', value: 'half_face', label: 'Half Face' },
  { id: 'ppe19', value: 'supplied_air', label: 'Supplied Air' },
  { id: 'ppe20', value: 'safety_harness', label: 'Safety Harness' }
];

// TBT Options with icons
const tbtOptions = [
  { id: 'tbt1', value: 'wear_ppe', label: 'Wear full PPE', icon: 'hard-hat' },
  { id: 'tbt2', value: 'barricade', label: 'Barricade & warning tape', icon: 'barrier' },
  { id: 'tbt3', value: 'report_injury', label: 'Report injury/unsafe act', icon: 'alert-circle' },
  { id: 'tbt4', value: 'extinguisher', label: 'Keep extinguisher nearby', icon: 'fire-extinguisher' },
  { id: 'tbt5', value: 'safe_tools', label: 'Use only safe tools', icon: 'tools' },
  { id: 'tbt6', value: 'fire_alarm', label: 'Know fire alarm point', icon: 'bell' },
  { id: 'tbt7', value: 'stop_work', label: 'Stop if unsafe', icon: 'hand-back-left' },
  { id: 'tbt8', value: 'ask_doubt', label: 'Ask if in doubt', icon: 'help-circle' },
  { id: 'tbt9', value: 'keep_clean', label: 'Keep area clean', icon: 'broom' },
  { id: 'tbt10', value: 'assembly_point', label: 'Know assembly point', icon: 'account-group' },
  { id: 'tbt11', value: 'follow_supervisor', label: 'Follow supervisor', icon: 'account-tie' }
];

// Checklists
const checklists = {
  lockout: [
    "Power source isolated?",
    "Lockout/tagout devices installed?",
    "Isolation verified by testing?",
    "All energy sources identified?",
    "Work area barricaded?"
  ],
  lineBreaking: [
    "Line depressurized?",
    "Blinds installed?",
    "Chemical/gas content verified?",
    "MSDS available?",
    "Emergency shower accessible?"
  ],
  hotWork: [
    "Hot work permit available?",
    "Fire extinguisher available?",
    "Area clear of combustibles?",
    "Fire watch assigned?",
    "Welding cables inspected?"
  ],
  confined: [
    "Confined space permit available?",
    "Gas test completed?",
    "Ventilation adequate?",
    "Rescue equipment available?",
    "Attendant posted outside?"
  ],
  height: [
    "Fall protection available?",
    "Scaffold inspected?",
    "Ladder secured?",
    "Work area barricaded?",
    "Tools secured with lanyards?"
  ]
};

// Dummy PTW Data
const dummyPTWData = [
  {
    id: "PTW-2025-001",
    permitDate: "2025-02-13",
    initiatorName: "John Smith",
    departmentName: "Maintenance",
    vendorFirm: "ABC Contractors",
    contractorName: "Mike Johnson",
    workLocation: "Factory Floor - Area A",
    workDescription: "Welding repairs on conveyor belt",
    workType: ["hot", "height"],
    status: "active",
    createdAt: "2025-02-13T09:30:00",
    ptwIssuer: "Sarah Williams",
    safetyConfirm: true,
    phoneNo: "+1 234-567-8901",
    workmenCount: "5",
    actualPeople: "4",
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
  },
  {
    id: "PTW-2025-003",
    permitDate: "2025-02-11",
    initiatorName: "James Wilson",
    departmentName: "Civil",
    vendorFirm: "PQR Constructions",
    contractorName: "William Taylor",
    workLocation: "Warehouse Extension",
    workDescription: "Excavation for foundation",
    workType: ["excavation", "lifting"],
    status: "pending",
    createdAt: "2025-02-11T14:20:00",
    ptwIssuer: "Jennifer Lee",
    safetyConfirm: false,
    phoneNo: "+1 555-123-4567",
    workmenCount: "8",
    actualPeople: "6",
  }
];

const PermitToWork = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  
  // State management
  const [showDashboard, setShowDashboard] = useState(true);
  const [ptwList, setPtwList] = useState(dummyPTWData);
  const [selectedPTW, setSelectedPTW] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showPTWModal, setShowPTWModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
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
  const [progress, setProgress] = useState(0);
  const [showOtherWork, setShowOtherWork] = useState(false);
  const [showServiceOrder, setShowServiceOrder] = useState(false);
  
  // Signature states
  const [signatures, setSignatures] = useState({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState('');
  const [signatureImage, setSignatureImage] = useState(null);
  
  // Attendance rows
  const [attendanceRows, setAttendanceRows] = useState([
    { id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: '' }
  ]);
  
  // Picker states
  const [showDatePicker, setShowDatePicker] = useState({ visible: false, field: null });
  const [showTimePicker, setShowTimePicker] = useState({ visible: false, rowId: null, field: null, timeValue: new Date() });
  const [showTypeDropdown, setShowTypeDropdown] = useState({ visible: false, rowId: null });
  const [showAmPmDropdown, setShowAmPmDropdown] = useState(false);
  
  // Risk rows
  const [riskRows, setRiskRows] = useState([
    { id: Date.now(), description: '', status: '', responsible: '', mitigation: '' }
  ]);

  // Checklist states
  const [checklistValues, setChecklistValues] = useState({
    lockout: {},
    lineBreaking: {},
    hotWork: {},
    confined: {},
    height: {}
  });

  const stepTitles = [
    "Basic Info",
    "Security",
    "Work Type",
    "Equipment",
    "PPE",
    "Checklists",
    "Risk",
    "TBT",
    "Authorization",
    "Closure"
  ];

  // Calculate progress
 useEffect(() => {
  calculateProgress();
  // REMOVED: any scrollTo calls
}, [formData]);

  const calculateProgress = () => {
    const requiredFields = [
      'permitDate', 'workmenCount', 'actualPeople', 'initiatorName',
      'departmentName', 'vendorFirm', 'contractorName', 'phoneNo',
      'workStartTime', 'expectedCompletion', 'safetyConfirm',
      'securitySupervisor', 'workDescription', 'workLocation',
      'ptwIssuer', 'tbtContractor'
    ];

    let filled = 0;
    requiredFields.forEach(field => {
      if (field === 'safetyConfirm') {
        if (formData[field]) filled++;
      } else if (Array.isArray(formData[field])) {
        if (formData[field].length > 0) filled++;
      } else if (formData[field] && formData[field].toString().trim() !== '') {
        filled++;
      }
    });

    const percentage = Math.min(95, Math.round((filled / requiredFields.length) * 100));
    setProgress(percentage);
  };

  const generatePTWId = () => {
    const year = new Date().getFullYear();
    return `PTW-${year}-${String(ptwList.length + 1).padStart(3, '0')}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  // FIXED: Prevent event propagation and ensure proper checkbox handling
const handleCheckboxPress = (field, value) => {
  // Directly update without any timeout or scroll effects
  setFormData(prev => {
    const current = prev[field] || [];
    if (current.includes(value)) {
      return { ...prev, [field]: current.filter(item => item !== value) };
    }
    return { ...prev, [field]: [...current, value] };
  });
};

  const handleWorkTypeChange = (value) => {
    setFormData(prev => {
      const current = prev.workType || [];
      if (current.includes(value)) {
        if (value === 'other') setShowOtherWork(false);
        return { ...prev, workType: current.filter(item => item !== value) };
      }
      if (value === 'other') setShowOtherWork(true);
      return { ...prev, workType: [...current, value] };
    });
  };

 
const handleAddNewPTW = () => {
  const newId = generatePTWId();
  setFormData({
    ...formData,
    id: newId,
    permitDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  });
  setAttendanceRows([{ id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: '' }]);
  setRiskRows([{ id: Date.now(), description: '', status: '', responsible: '', mitigation: '' }]);
  setSignatures({});
  setCurrentStep(1);
  setShowDashboard(false);
  setModalMode('create');
  // REMOVED: scrollViewRef.current?.scrollTo({ y: 0, animated: true });
};

  const handleViewPTW = (ptw) => {
    setSelectedPTW(ptw);
    setShowPTWModal(true);
  };

const handleEditPTW = (ptw) => {
  setFormData(ptw);
  setSelectedPTW(ptw);
  setModalMode('edit');
  setShowDashboard(false);
  setCurrentStep(1);
  // REMOVED: scrollViewRef.current?.scrollTo({ y: 0, animated: true });
};

  const handleDeletePTW = (id) => {
    Alert.alert(
      'Delete PTW',
      'Are you sure you want to delete this PTW?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setPtwList(prev => prev.filter(ptw => ptw.id !== id))
        }
      ]
    );
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.initiatorName || !formData.workLocation) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    let updatedList;
    if (modalMode === 'edit' && selectedPTW) {
      updatedList = ptwList.map(ptw =>
        ptw.id === selectedPTW.id ? { ...formData, id: selectedPTW.id } : ptw
      );
    } else {
      const newPTW = { ...formData, id: generatePTWId(), status: 'pending' };
      updatedList = [...ptwList, newPTW];
    }
    
    setPtwList(updatedList);
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
    // REMOVED: scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }
};

const prevStep = () => {
  if (currentStep > 1) {
    setCurrentStep(prev => prev - 1);
    // REMOVED: scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }
};
  
  const goToStep = (step) => {
  setCurrentStep(step);
  // REMOVED: scrollViewRef.current?.scrollTo({ y: 0, animated: true });
};

  const addAttendanceRow = () => {
    setAttendanceRows(prev => [...prev, { 
      id: Date.now(), 
      type: 'S', 
      name: '', 
      in_am: '', 
      out_am: '', 
      in_pm: '', 
      out_pm: '', 
      tbt_verified: '' 
    }]);
  };

  const updateAttendanceRow = (id, field, value) => {
    setAttendanceRows(prev =>
      prev.map(row => row.id === id ? { ...row, [field]: value } : row)
    );
  };

  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate && showDatePicker.field) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      handleInputChange(showDatePicker.field, dateString);
    }
    setShowDatePicker({ visible: false, field: null });
  };

  const openDatePicker = (field) => {
    setShowDatePicker({ visible: true, field });
  };

  // Time picker handlers
  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'set' && selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      if (showTimePicker.rowId && showTimePicker.field) {
        // Attendance row time
        updateAttendanceRow(showTimePicker.rowId, showTimePicker.field, timeString);
      } else if (showTimePicker.field) {
        // Form field time
        handleInputChange(showTimePicker.field, timeString);
      }
    }
    setShowTimePicker({ visible: false, rowId: null, field: null, timeValue: new Date() });
  };

  const openTimePicker = (field, rowId = null) => {
    setShowTimePicker({ visible: true, rowId, field, timeValue: new Date() });
  };

  const addRiskRow = () => {
    setRiskRows(prev => [...prev, { 
      id: Date.now(), 
      description: '', 
      status: '', 
      responsible: '', 
      mitigation: '' 
    }]);
  };

  const updateRiskRow = (id, field, value) => {
    setRiskRows(prev =>
      prev.map(row => row.id === id ? { ...row, [field]: value } : row)
    );
  };

  const removeRiskRow = (id) => {
    if (riskRows.length > 1) {
      setRiskRows(prev => prev.filter(row => row.id !== id));
    } else {
      Alert.alert('Cannot Remove', 'At least one risk row is required');
    }
  };

  const handleChecklistChange = (section, index, value) => {
    setChecklistValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [index]: value
      }
    }));
  };

  const openSignaturePad = (field) => {
    setCurrentSignatureField(field);
    setSignatureImage(null);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = () => {
    setSignatures(prev => ({ ...prev, [currentSignatureField]: 'signed' }));
    setShowSignatureModal(false);
  };

  const handleBackPress = () => {
    if (!showDashboard) {
      handleCancelForm();
    } else {
      navigation.goBack();
    }
  };

  const filteredPTWs = ptwList.filter(ptw => {
    const matchesSearch = 
      (ptw.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.initiatorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.contractorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ptw.workLocation?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ptw.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'completed': return COLORS.info;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.grey[600];
    }
  };

  const renderChecklist = (title, checklistName, items) => (
    <View style={styles.checklistSection}>
      <Text style={styles.checklistTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.checklistItem}
          onPress={() => {
            const current = checklistValues[checklistName]?.[index];
            const next = !current || current === 'no' ? 'yes' : current === 'yes' ? 'no' : 'yes';
            handleChecklistChange(checklistName, index, next);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.checklistText}>{item}</Text>
          <View style={styles.checklistOptions}>
            {['yes', 'no', 'na'].map(option => (
              <TouchableOpacity 
                key={option} 
                style={styles.radioOption}
                onPress={(e) => {
                  e.stopPropagation();
                  handleChecklistChange(checklistName, index, option);
                }}
              >
                <View style={[
                  styles.radioCircle,
                  checklistValues[checklistName]?.[index] === option && styles.radioSelected
                ]}>
                  {checklistValues[checklistName]?.[index] === option && (
                    <Text style={styles.radioSelectedText}>
                      {option === 'yes' ? '✓' : option === 'no' ? '✗' : '-'}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.radioText,
                  checklistValues[checklistName]?.[index] === option && styles.radioTextSelected
                ]}>
                  {option.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Filter options
  const filterOptions = [
    { id: 'all', value: 'all', label: 'All Permits' },
    { id: 'active', value: 'active', label: 'Active' },
    { id: 'pending', value: 'pending', label: 'Pending' },
    { id: 'completed', value: 'completed', label: 'Completed' },
    { id: 'cancelled', value: 'cancelled', label: 'Cancelled' },
  ];

  // Type options
  const typeOptions = [
    { id: 'S', value: 'S', label: 'Supervisor (S)' },
    { id: 'W', value: 'W', label: 'Worker (W)' },
  ];

  // AM/PM options
  const ampmOptions = [
    { id: 'AM', value: 'AM', label: 'AM' },
    { id: 'PM', value: 'PM', label: 'PM' },
  ];

  // Dashboard Component
  const Dashboard = () => (
    <View style={styles.dashboard}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.dashboardTitle}>Permit to Work</Text>
          <Text style={styles.dashboardSubtitle}>Manage work permits</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleAddNewPTW}>
          <Icon name="plus" size={20} color={COLORS.white} />
          <Text style={styles.createButtonText}>New Permit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{ptwList.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.success, borderLeftWidth: 3 }]}>
            <Text style={styles.statValue}>{ptwList.filter(p => p.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.warning, borderLeftWidth: 3 }]}>
            <Text style={styles.statValue}>{ptwList.filter(p => p.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.info, borderLeftWidth: 3 }]}>
            <Text style={styles.statValue}>{ptwList.filter(p => p.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={COLORS.grey[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search permits..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={COLORS.grey[500]}
            />
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(true)}
          >
            <Icon name="filter-variant" size={18} color={COLORS.primary} />
            <Text style={styles.filterButtonText}>
              {filterOptions.find(f => f.value === filterStatus)?.label || 'Filter'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PTW List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>Recent Permits</Text>
          </View>
          
          {filteredPTWs.map((ptw, index) => (
            <TouchableOpacity 
              key={ptw.id || index} 
              style={styles.listItem}
              onPress={() => handleViewPTW(ptw)}
              activeOpacity={0.7}
            >
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemId}>{ptw.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ptw.status) }]}>
                  <Text style={styles.statusText}>{(ptw.status || 'pending').toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.listItemDetails}>
                <View style={styles.listItemDetail}>
                  <Icon name="account" size={14} color={COLORS.grey[600]} />
                  <Text style={styles.listItemDetailText}>{ptw.initiatorName || '-'}</Text>
                </View>
                <View style={styles.listItemDetail}>
                  <Icon name="map-marker" size={14} color={COLORS.grey[600]} />
                  <Text style={styles.listItemDetailText} numberOfLines={1}>{ptw.workLocation || '-'}</Text>
                </View>
                <View style={styles.listItemDetail}>
                  <Icon name="calendar" size={14} color={COLORS.grey[600]} />
                  <Text style={styles.listItemDetailText}>
                    {new Date(ptw.permitDate || ptw.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.listItemActions}>
                <TouchableOpacity 
                  style={styles.actionIcon} 
                  onPress={() => handleViewPTW(ptw)}
                >
                  <Icon name="eye" size={18} color={COLORS.info} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionIcon} 
                  onPress={() => handleEditPTW(ptw)}
                >
                  <Icon name="pencil" size={18} color={COLORS.accent} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionIcon} 
                  onPress={() => handleDeletePTW(ptw.id)}
                >
                  <Icon name="delete" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {filteredPTWs.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="file-document-outline" size={64} color={COLORS.grey[400]} />
              <Text style={styles.emptyStateText}>No permits found</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownItem,
                  filterStatus === option.value && styles.dropdownItemSelected
                ]}
                onPress={() => {
                  setFilterStatus(option.value);
                  setShowFilterDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  filterStatus === option.value && styles.dropdownItemTextSelected
                ]}>
                  {option.label}
                </Text>
                {filterStatus === option.value && (
                  <Icon name="check" size={16} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  // View PTW Modal
  const ViewPTWModal = () => (
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
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Permit Details</Text>
            <TouchableOpacity onPress={() => {
              setShowPTWModal(false);
              setSelectedPTW(null);
            }}>
              <Icon name="close" size={24} color={COLORS.grey[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedPTW && (
              <View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Basic Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>PTW ID:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{new Date(selectedPTW.permitDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Initiator:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.initiatorName || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Department:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.departmentName || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(selectedPTW.status) }]}>
                      <Text style={styles.statusTextSmall}>{(selectedPTW.status || 'pending').toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Work Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.workLocation || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={[styles.detailValue, styles.detailDescription]} numberOfLines={3}>
                      {selectedPTW.workDescription || 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Contractor Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contractor:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.contractorName || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.phoneNo || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Workmen:</Text>
                    <Text style={styles.detailValue}>{selectedPTW.workmenCount || '0'}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.editButton]}
              onPress={() => {
                handleEditPTW(selectedPTW);
                setShowPTWModal(false);
              }}
            >
              <Icon name="pencil" size={16} color={COLORS.white} />
              <Text style={styles.modalButtonText}>Edit</Text>
            </TouchableOpacity>
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

  // Form Component
  const PTWForm = () => (
    <KeyboardAvoidingView 
      style={styles.formContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.formScrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
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
              <Icon name="file-document-outline" size={14} color={COLORS.grey[600]} />
              <Text style={styles.metaText}>EPL/SAF/F-01</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="calendar-refresh" size={14} color={COLORS.grey[600]} />
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
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>

        {/* Step Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.stepNavigator}
          contentContainerStyle={styles.stepNavigatorContent}
        >
          {stepTitles.map((title, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepItem,
                currentStep === index + 1 && styles.stepItemActive
              ]}
              onPress={() => goToStep(index + 1)}
            >
              <View style={[
                styles.stepIndicator,
                currentStep === index + 1 && styles.stepIndicatorActive,
                currentStep > index + 1 && styles.stepIndicatorCompleted
              ]}>
                {currentStep > index + 1 ? (
                  <Icon name="check" size={12} color={COLORS.white} />
                ) : (
                  <Text style={[
                    styles.stepIndicatorText,
                    currentStep === index + 1 && styles.stepIndicatorTextActive
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                currentStep === index + 1 && styles.stepLabelActive
              ]} numberOfLines={1}>
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Basic Information</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Permit Date <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openDatePicker('permitDate')}
                >
                  <Text style={formData.permitDate ? styles.inputText : styles.placeholderText}>
                    {formData.permitDate || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WC Policy No.</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wcPolicyNo}
                  onChangeText={(value) => handleInputChange('wcPolicyNo', value)}
                  placeholder="Policy number"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Policy Expiry</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openDatePicker('wcExpDate')}
                >
                  <Text style={formData.wcExpDate ? styles.inputText : styles.placeholderText}>
                    {formData.wcExpDate || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Workmen Count <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.workmenCount}
                  onChangeText={(value) => handleInputChange('workmenCount', value)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Actual People <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.actualPeople}
                  onChangeText={(value) => handleInputChange('actualPeople', value)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initiator <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.initiatorName}
                  onChangeText={(value) => handleInputChange('initiatorName', value)}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.departmentName}
                  onChangeText={(value) => handleInputChange('departmentName', value)}
                  placeholder="Department"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vendor/Firm <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.vendorFirm}
                  onChangeText={(value) => handleInputChange('vendorFirm', value)}
                  placeholder="Firm name"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contractor <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.contractorName}
                  onChangeText={(value) => handleInputChange('contractorName', value)}
                  placeholder="Contractor name"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.phoneNo}
                  onChangeText={(value) => handleInputChange('phoneNo', value)}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroupFull}>
                <View style={styles.switchRow}>
                  <Switch
                    value={formData.serviceOrderReceived}
                    onValueChange={(value) => {
                      handleInputChange('serviceOrderReceived', value);
                      setShowServiceOrder(value);
                    }}
                    trackColor={{ false: COLORS.grey[300], true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                  <Text style={styles.switchLabel}>Service Order Received</Text>
                </View>
              </View>

              {showServiceOrder && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Service Order No.</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.serviceOrderNo}
                    onChangeText={(value) => handleInputChange('serviceOrderNo', value)}
                    placeholder="Order number"
                    placeholderTextColor={COLORS.grey[500]}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Time <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openTimePicker('workStartTime')}
                >
                  <Text style={formData.workStartTime ? styles.inputText : styles.placeholderText}>
                    {formData.workStartTime || "HH:MM"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Time <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openTimePicker('expectedCompletion')}
                >
                  <Text style={formData.expectedCompletion ? styles.inputText : styles.placeholderText}>
                    {formData.expectedCompletion || "HH:MM"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroupFull}>
                <View style={styles.warningCard}>
                  <Icon name="shield-alert" size={24} color={COLORS.warning} />
                  <Text style={styles.warningText}>
                    I confirm all workers adhere to safety guidelines and are equipped with appropriate PPE.
                  </Text>
                </View>
                
                <View style={[styles.switchRow, styles.safetySwitch]}>
                  <Switch
                    value={formData.safetyConfirm}
                    onValueChange={(value) => handleInputChange('safetyConfirm', value)}
                    trackColor={{ false: COLORS.grey[300], true: COLORS.danger }}
                    thumbColor={COLORS.white}
                  />
                  <Text style={[styles.switchLabel, styles.safetySwitchLabel]}>
                    I confirm safety statement
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Contractor Signature</Text>
                <TouchableOpacity
                  style={styles.signatureButton}
                  onPress={() => openSignaturePad('contractorSig')}
                >
                  <Icon name="draw" size={20} color={COLORS.primary} />
                  <Text style={styles.signatureButtonText}>
                    {signatures.contractorSig ? '✓ Signed' : 'Tap to sign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Security Verification */}
        {currentStep === 2 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Security Verification</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Security Supervisor <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.securitySupervisor}
                  onChangeText={(value) => handleInputChange('securitySupervisor', value)}
                  placeholder="Supervisor name"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Identity Verification</Text>
                {['National ID', 'Driving Licence', 'Company ID'].map((item, index) => {
                  const value = item.toLowerCase().replace(' ', '_');
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.checkboxRow}
                      onPress={() => handleCheckboxPress('idCheck', value)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        formData.idCheck.includes(value) && styles.checkboxChecked
                      ]}>
                        {formData.idCheck.includes(value) && (
                          <Icon name="check" size={16} color={COLORS.white} />
                        )}
                      </View>
                      <Text style={[
                        styles.checkboxLabel,
                        formData.idCheck.includes(value) && styles.checkboxLabelChecked
                      ]}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>TBT Attendance</Text>
                <View style={styles.infoCard}>
                  <Icon name="information" size={18} color={COLORS.info} />
                  <Text style={styles.infoText}>Mark Supervisor (S) and Workmen (W)</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                      <Text style={[styles.tableHeaderCell, { width: 60 }]}>Type</Text>
                      <Text style={[styles.tableHeaderCell, { width: 120 }]}>Name</Text>
                      <Text style={[styles.tableHeaderCell, { width: 70 }]}>In AM</Text>
                      <Text style={[styles.tableHeaderCell, { width: 70 }]}>Out AM</Text>
                      <Text style={[styles.tableHeaderCell, { width: 70 }]}>In PM</Text>
                      <Text style={[styles.tableHeaderCell, { width: 70 }]}>Out PM</Text>
                      <Text style={[styles.tableHeaderCell, { width: 60 }]}>TBT</Text>
                      <Text style={[styles.tableHeaderCell, { width: 60 }]}>Sign</Text>
                    </View>
                    {attendanceRows.map((row, index) => (
                      <View key={row.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: 40 }]}>{index + 1}</Text>
                        <View style={[styles.tableCell, { width: 60 }]}>
                          <TouchableOpacity
                            style={[
                              styles.typeButton,
                              row.type && styles.typeButtonSelected
                            ]}
                            onPress={() => setShowTypeDropdown({ visible: true, rowId: row.id })}
                          >
                            <Text style={styles.typeButtonText}>{row.type || 'S'}</Text>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          style={[styles.tableCell, styles.tableInput, { width: 120 }]}
                          value={row.name}
                          onChangeText={(value) => updateAttendanceRow(row.id, 'name', value)}
                          placeholder="Name"
                          placeholderTextColor={COLORS.grey[500]}
                        />
                        <TouchableOpacity
                          style={[styles.tableCell, styles.timeButton, { width: 70 }]}
                          onPress={() => openTimePicker('in_am', row.id)}
                        >
                          <Text style={row.in_am ? styles.timeText : styles.placeholderText}>
                            {row.in_am || '--:--'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.tableCell, styles.timeButton, { width: 70 }]}
                          onPress={() => openTimePicker('out_am', row.id)}
                        >
                          <Text style={row.out_am ? styles.timeText : styles.placeholderText}>
                            {row.out_am || '--:--'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.tableCell, styles.timeButton, { width: 70 }]}
                          onPress={() => openTimePicker('in_pm', row.id)}
                        >
                          <Text style={row.in_pm ? styles.timeText : styles.placeholderText}>
                            {row.in_pm || '--:--'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.tableCell, styles.timeButton, { width: 70 }]}
                          onPress={() => openTimePicker('out_pm', row.id)}
                        >
                          <Text style={row.out_pm ? styles.timeText : styles.placeholderText}>
                            {row.out_pm || '--:--'}
                          </Text>
                        </TouchableOpacity>
                        <View style={[styles.tableCell, { width: 60 }]}>
                          <TouchableOpacity
                            style={[
                              styles.tbtButton,
                              row.tbt_verified === 'yes' && styles.tbtYes,
                              row.tbt_verified === 'no' && styles.tbtNo,
                            ]}
                            onPress={() => {
                              const next = row.tbt_verified === 'yes' ? 'no' : 
                                         row.tbt_verified === 'no' ? '' : 'yes';
                              updateAttendanceRow(row.id, 'tbt_verified', next);
                            }}
                          >
                            <Text style={styles.tbtButtonText}>
                              {row.tbt_verified === 'yes' ? '✓' : 
                               row.tbt_verified === 'no' ? '✗' : '-'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={[styles.tableCell, { width: 60 }]}>
                          <TouchableOpacity
                            style={styles.signButton}
                            onPress={() => openSignaturePad(`attendance_${row.id}`)}
                          >
                            <Icon name="draw" size={16} color={COLORS.white} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                
                <TouchableOpacity style={styles.addButton} onPress={addAttendanceRow}>
                  <Icon name="plus" size={18} color={COLORS.primary} />
                  <Text style={styles.addButtonText}>Add Row</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Security Signature</Text>
                <TouchableOpacity
                  style={styles.signatureButton}
                  onPress={() => openSignaturePad('securitySig')}
                >
                  <Icon name="draw" size={20} color={COLORS.primary} />
                  <Text style={styles.signatureButtonText}>
                    {signatures.securitySig ? '✓ Signed' : 'Tap to sign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Type Dropdown Modal */}
            <Modal
              visible={showTypeDropdown.visible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowTypeDropdown({ visible: false, rowId: null })}
            >
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setShowTypeDropdown({ visible: false, rowId: null })}
              >
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>Select Type</Text>
                  {typeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        if (showTypeDropdown.rowId) {
                          updateAttendanceRow(showTypeDropdown.rowId, 'type', option.value);
                        }
                        setShowTypeDropdown({ visible: false, rowId: null });
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}

        {/* Step 3: Work Type */}
        {currentStep === 3 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>3</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Work Type</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Select Work Type <Text style={styles.required}>*</Text></Text>
                <View style={styles.optionsGrid}>
                  {workTypeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        formData.workType.includes(option.value) && styles.optionCardSelected
                      ]}
                      onPress={() => handleWorkTypeChange(option.value)}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={option.icon} 
                        size={24} 
                        color={formData.workType.includes(option.value) ? COLORS.white : COLORS.primary} 
                      />
                      <View style={styles.optionContent}>
                        <Text style={[
                          styles.optionTitle,
                          formData.workType.includes(option.value) && styles.optionTitleSelected
                        ]}>
                          {option.label}
                        </Text>
                        {option.description && (
                          <Text style={[
                            styles.optionDescription,
                            formData.workType.includes(option.value) && styles.optionDescriptionSelected
                          ]}>
                            {option.description}
                          </Text>
                        )}
                      </View>
                      {formData.workType.includes(option.value) && (
                        <Icon name="check-circle" size={20} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {showOtherWork && (
                <View style={styles.inputGroupFull}>
                  <Text style={styles.inputLabel}>Specify Other Work Type</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.otherWorkType}
                    onChangeText={(value) => handleInputChange('otherWorkType', value)}
                    placeholder="Describe work type"
                    placeholderTextColor={COLORS.grey[500]}
                    multiline
                  />
                </View>
              )}

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Work Description <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.workDescription}
                  onChangeText={(value) => handleInputChange('workDescription', value)}
                  placeholder="Detailed description of work"
                  placeholderTextColor={COLORS.grey[500]}
                  multiline
                />
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Work Location <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.workLocation}
                  onChangeText={(value) => handleInputChange('workLocation', value)}
                  placeholder="Exact location"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Safety Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.safetyInstructions}
                  onChangeText={(value) => handleInputChange('safetyInstructions', value)}
                  placeholder="Specific safety procedures"
                  placeholderTextColor={COLORS.grey[500]}
                  multiline
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 4: Equipment - No Icons */}
        {currentStep === 4 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>4</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Equipment Required</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Select Equipment</Text>
                <View style={styles.optionsGrid}>
                  {equipmentOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCardSimple,
                        formData.equipment.includes(option.value) && styles.optionCardSimpleSelected
                      ]}
                      onPress={() => handleCheckboxPress('equipment', option.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.optionTitleSimple,
                        formData.equipment.includes(option.value) && styles.optionTitleSimpleSelected
                      ]}>
                        {option.label}
                      </Text>
                      {formData.equipment.includes(option.value) && (
                        <Icon name="check-circle" size={18} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Step 5: PPE - No Icons */}
        {currentStep === 5 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>5</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>PPE Required</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Select PPE</Text>
                <View style={styles.optionsGrid}>
                  {ppeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCardSimple,
                        formData.ppe.includes(option.value) && styles.optionCardSimpleSelected
                      ]}
                      onPress={() => handleCheckboxPress('ppe', option.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.optionTitleSimple,
                        formData.ppe.includes(option.value) && styles.optionTitleSimpleSelected
                      ]}>
                        {option.label}
                      </Text>
                      {formData.ppe.includes(option.value) && (
                        <Icon name="check-circle" size={18} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PTW Issuer <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.ptwIssuer}
                  onChangeText={(value) => handleInputChange('ptwIssuer', value)}
                  placeholder="Issuer name"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Verification Time</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openTimePicker('ppeVerifyTime')}
                >
                  <Text style={formData.ppeVerifyTime ? styles.inputText : styles.placeholderText}>
                    {formData.ppeVerifyTime || "HH:MM"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroupFull}>
                <View style={[styles.switchRow, styles.ppeConfirmBox]}>
                  <Switch
                    value={formData.ppeVerify}
                    onValueChange={(value) => handleInputChange('ppeVerify', value)}
                    trackColor={{ false: COLORS.grey[300], true: COLORS.success }}
                    thumbColor={COLORS.white}
                  />
                  <Text style={[styles.switchLabel, styles.ppeConfirmText]}>
                    Equipment & PPE verified
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>PTW Issuer Signature</Text>
                <TouchableOpacity
                  style={styles.signatureButton}
                  onPress={() => openSignaturePad('issuerSig')}
                >
                  <Icon name="draw" size={20} color={COLORS.primary} />
                  <Text style={styles.signatureButtonText}>
                    {signatures.issuerSig ? '✓ Signed' : 'Tap to sign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Step 6: Checklists */}
        {currentStep === 6 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>6</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Safety Checklists</Text>
            </View>

            <View>
              {renderChecklist('LOCKOUT / TAGOUT', 'lockout', checklists.lockout)}
              {renderChecklist('LINE BREAKING', 'lineBreaking', checklists.lineBreaking)}
              {renderChecklist('HOT WORK', 'hotWork', checklists.hotWork)}
              {renderChecklist('CONFINED SPACE', 'confined', checklists.confined)}
              {renderChecklist('HEIGHT WORK', 'height', checklists.height)}
            </View>
          </View>
        )}

        {/* Step 7: Risk Assessment */}
        {currentStep === 7 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>7</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Risk Assessment</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroupFull}>
                <View style={styles.infoCard}>
                  <Icon name="information" size={18} color={COLORS.info} />
                  <Text style={styles.infoText}>Identify risks and mitigation measures</Text>
                </View>

                {riskRows.map((row, index) => (
                  <View key={row.id} style={styles.riskCard}>
                    <View style={styles.riskHeader}>
                      <Text style={styles.riskNumber}>Risk #{index + 1}</Text>
                      <TouchableOpacity onPress={() => removeRiskRow(row.id)}>
                        <Icon name="delete" size={20} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                    
                    <TextInput
                      style={[styles.input, { marginBottom: SPACING.sm }]}
                      value={row.description}
                      onChangeText={(value) => updateRiskRow(row.id, 'description', value)}
                      placeholder="Describe the risk"
                      placeholderTextColor={COLORS.grey[500]}
                    />
                    
                    <View style={styles.statusContainer}>
                      {['open', 'closed', 'mitigated'].map(status => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            row.status === status && styles.statusButtonActive
                          ]}
                          onPress={() => updateRiskRow(row.id, 'status', status)}
                        >
                          <Text style={[
                            styles.statusButtonText,
                            row.status === status && styles.statusButtonTextActive
                          ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <TextInput
                      style={[styles.input, { marginBottom: SPACING.sm }]}
                      value={row.responsible}
                      onChangeText={(value) => updateRiskRow(row.id, 'responsible', value)}
                      placeholder="Responsible person"
                      placeholderTextColor={COLORS.grey[500]}
                    />
                    
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={row.mitigation}
                      onChangeText={(value) => updateRiskRow(row.id, 'mitigation', value)}
                      placeholder="Mitigation measures"
                      placeholderTextColor={COLORS.grey[500]}
                      multiline
                    />
                  </View>
                ))}
                
                <TouchableOpacity style={styles.addButton} onPress={addRiskRow}>
                  <Icon name="plus" size={18} color={COLORS.primary} />
                  <Text style={styles.addButtonText}>Add Risk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Step 8: TBT */}
        {currentStep === 8 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>8</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Tool Box Talk</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Safety Instructions</Text>
                <View style={styles.optionsGrid}>
                  {tbtOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        formData.tbt.includes(option.value) && styles.optionCardSelected
                      ]}
                      onPress={() => handleCheckboxPress('tbt', option.value)}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={option.icon} 
                        size={20} 
                        color={formData.tbt.includes(option.value) ? COLORS.white : COLORS.primary} 
                      />
                      <Text style={[
                        styles.optionTitle,
                        formData.tbt.includes(option.value) && styles.optionTitleSelected,
                        { flex: 1, marginLeft: SPACING.xs }
                      ]}>
                        {option.label}
                      </Text>
                      {formData.tbt.includes(option.value) && (
                        <Icon name="check-circle" size={18} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contractor <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.tbtContractor}
                  onChangeText={(value) => handleInputChange('tbtContractor', value)}
                  placeholder="Contractor name"
                  placeholderTextColor={COLORS.grey[500]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TBT Time</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openTimePicker('tbtTime')}
                >
                  <Text style={formData.tbtTime ? styles.inputText : styles.placeholderText}>
                    {formData.tbtTime || "HH:MM"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroupFull}>
                <View style={[styles.switchRow, styles.tbtConfirmBox]}>
                  <Switch
                    value={formData.tbtConfirm}
                    onValueChange={(value) => handleInputChange('tbtConfirm', value)}
                    trackColor={{ false: COLORS.grey[300], true: COLORS.info }}
                    thumbColor={COLORS.white}
                  />
                  <Text style={[styles.switchLabel, styles.tbtConfirmText]}>
                    TBT delivered & verified
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Contractor Signature</Text>
                <TouchableOpacity
                  style={styles.signatureButton}
                  onPress={() => openSignaturePad('tbtSig')}
                >
                  <Icon name="draw" size={20} color={COLORS.primary} />
                  <Text style={styles.signatureButtonText}>
                    {signatures.tbtSig ? '✓ Signed' : 'Tap to sign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Step 9: Authorization */}
        {currentStep === 9 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>9</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Authorization</Text>
            </View>

            <View style={styles.formGrid}>
              {/* Issuer Authorization */}
              <View style={[styles.authorizationCard, styles.issuerCard]}>
                <View style={styles.authorizationHeader}>
                  <Icon name="file-signature" size={18} color={COLORS.primary} />
                  <Text style={styles.authorizationTitle}>Issuer</Text>
                </View>
                
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={formData.issuerAuthName}
                  onChangeText={(value) => handleInputChange('issuerAuthName', value)}
                  placeholder="Name"
                  placeholderTextColor={COLORS.grey[500]}
                />
                
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openDatePicker('issuerAuthDate')}
                  >
                    <Text style={formData.issuerAuthDate ? styles.inputText : styles.placeholderText}>
                      {formData.issuerAuthDate || "Date"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openTimePicker('issuerAuthTime')}
                  >
                    <Text style={formData.issuerAuthTime ? styles.inputText : styles.placeholderText}>
                      {formData.issuerAuthTime || "Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={[styles.signatureButton, styles.smallSignature]}
                  onPress={() => openSignaturePad('authIssuerSig')}
                >
                  <Icon name="draw" size={16} color={COLORS.primary} />
                  <Text style={[styles.signatureButtonText, styles.smallText]}>
                    {signatures.authIssuerSig ? '✓ Signed' : 'Sign'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Approver */}
              <View style={[styles.authorizationCard, styles.approverCard]}>
                <View style={styles.authorizationHeader}>
                  <Icon name="check-circle" size={18} color={COLORS.info} />
                  <Text style={[styles.authorizationTitle, { color: COLORS.info }]}>Approver</Text>
                </View>
                
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={formData.approverName}
                  onChangeText={(value) => handleInputChange('approverName', value)}
                  placeholder="Name"
                  placeholderTextColor={COLORS.grey[500]}
                />
                
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openDatePicker('approverDate')}
                  >
                    <Text style={formData.approverDate ? styles.inputText : styles.placeholderText}>
                      {formData.approverDate || "Date"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openTimePicker('approverTime')}
                  >
                    <Text style={formData.approverTime ? styles.inputText : styles.placeholderText}>
                      {formData.approverTime || "Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={[styles.signatureButton, styles.smallSignature, { borderColor: COLORS.info }]}
                  onPress={() => openSignaturePad('authApproverSig')}
                >
                  <Icon name="draw" size={16} color={COLORS.info} />
                  <Text style={[styles.signatureButtonText, styles.smallText, { color: COLORS.info }]}>
                    {signatures.authApproverSig ? '✓ Signed' : 'Sign'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Authorizer */}
              <View style={[styles.authorizationCard, styles.authorizerCard]}>
                <View style={styles.authorizationHeader}>
                  <Icon name="star" size={18} color={COLORS.success} />
                  <Text style={[styles.authorizationTitle, { color: COLORS.success }]}>Authorizer</Text>
                </View>
                
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={formData.authorizerName}
                  onChangeText={(value) => handleInputChange('authorizerName', value)}
                  placeholder="Name"
                  placeholderTextColor={COLORS.grey[500]}
                />
                
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openDatePicker('authorizerDate')}
                  >
                    <Text style={formData.authorizerDate ? styles.inputText : styles.placeholderText}>
                      {formData.authorizerDate || "Date"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openTimePicker('authorizerTime')}
                  >
                    <Text style={formData.authorizerTime ? styles.inputText : styles.placeholderText}>
                      {formData.authorizerTime || "Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={[styles.signatureButton, styles.smallSignature, { borderColor: COLORS.success }]}
                  onPress={() => openSignaturePad('authAuthorizerSig')}
                >
                  <Icon name="draw" size={16} color={COLORS.success} />
                  <Text style={[styles.signatureButtonText, styles.smallText, { color: COLORS.success }]}>
                    {signatures.authAuthorizerSig ? '✓ Signed' : 'Sign'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Worker Confirmation */}
              <View style={[styles.authorizationCard, styles.workerCard]}>
                <View style={styles.authorizationHeader}>
                  <Icon name="account-hard-hat" size={18} color={COLORS.accent} />
                  <Text style={[styles.authorizationTitle, { color: COLORS.accent }]}>Worker</Text>
                </View>
                
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={formData.workerName}
                  onChangeText={(value) => handleInputChange('workerName', value)}
                  placeholder="Worker Name"
                  placeholderTextColor={COLORS.grey[500]}
                />
                
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.input, styles.halfInput, styles.smallInput]}
                    onPress={() => openDatePicker('workerDate')}
                  >
                    <Text style={formData.workerDate ? styles.inputText : styles.placeholderText}>
                      {formData.workerDate || "Date"}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.halfInput}>
                    <TouchableOpacity
                      style={styles.ampmSelector}
                      onPress={() => setShowAmPmDropdown(true)}
                    >
                      <Text style={styles.ampmText}>
                        {formData.workerAmPm || 'AM'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.signatureButton, styles.smallSignature, { borderColor: COLORS.accent }]}
                  onPress={() => openSignaturePad('workerSig')}
                >
                  <Icon name="draw" size={16} color={COLORS.accent} />
                  <Text style={[styles.signatureButtonText, styles.smallText, { color: COLORS.accent }]}>
                    {signatures.workerSig ? '✓ Signed' : 'Sign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* AM/PM Dropdown Modal */}
            <Modal
              visible={showAmPmDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowAmPmDropdown(false)}
            >
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setShowAmPmDropdown(false)}
              >
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>Select AM/PM</Text>
                  {ampmOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.dropdownItem,
                        formData.workerAmPm === option.value && styles.dropdownItemSelected
                      ]}
                      onPress={() => {
                        handleInputChange('workerAmPm', option.value);
                        setShowAmPmDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        formData.workerAmPm === option.value && styles.dropdownItemTextSelected
                      ]}>
                        {option.label}
                      </Text>
                      {formData.workerAmPm === option.value && (
                        <Icon name="check" size={16} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}

        {/* Step 10: Closure */}
        {currentStep === 10 && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>10</Text>
              </View>
              <Text style={styles.sectionHeaderTitle}>Permit Closure</Text>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Permit Status</Text>
                <View style={styles.statusRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusCard,
                      formData.permitStatus === 'extension' && styles.statusCardActive
                    ]}
                    onPress={() => handleInputChange('permitStatus', 'extension')}
                  >
                    <Icon 
                      name="clock-outline" 
                      size={24} 
                      color={formData.permitStatus === 'extension' ? COLORS.white : COLORS.grey[600]} 
                    />
                    <Text style={[
                      styles.statusCardText,
                      formData.permitStatus === 'extension' && styles.statusCardTextActive
                    ]}>
                      Extension
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusCard,
                      formData.permitStatus === 'closure' && styles.statusCardActive
                    ]}
                    onPress={() => handleInputChange('permitStatus', 'closure')}
                  >
                    <Icon 
                      name="close-circle" 
                      size={24} 
                      color={formData.permitStatus === 'closure' ? COLORS.white : COLORS.grey[600]} 
                    />
                    <Text style={[
                      styles.statusCardText,
                      formData.permitStatus === 'closure' && styles.statusCardTextActive
                    ]}>
                      Closure
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Closure Date</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openDatePicker('closureDate')}
                >
                  <Text style={formData.closureDate ? styles.inputText : styles.placeholderText}>
                    {formData.closureDate || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Closure Time</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => openTimePicker('closureTime')}
                >
                  <Text style={formData.closureTime ? styles.inputText : styles.placeholderText}>
                    {formData.closureTime || "HH:MM"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Remarks</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.closureRemarks}
                  onChangeText={(value) => handleInputChange('closureRemarks', value)}
                  placeholder="Closure details"
                  placeholderTextColor={COLORS.grey[500]}
                  multiline
                />
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Authorized Signature</Text>
                <TouchableOpacity
                  style={styles.signatureButton}
                  onPress={() => openSignaturePad('closureSig')}
                >
                  <Icon name="draw" size={20} color={COLORS.primary} />
                  <Text style={styles.signatureButtonText}>
                    {signatures.closureSig ? '✓ Signed' : 'Tap to sign'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, styles.navPrev, currentStep === 1 && styles.navDisabled]}
            onPress={prevStep}
            disabled={currentStep === 1}
          >
            <Icon name="chevron-left" size={18} color={currentStep === 1 ? COLORS.grey[500] : COLORS.white} />
            <Text style={[styles.navButtonText, currentStep === 1 && styles.navTextDisabled]}>Previous</Text>
          </TouchableOpacity>
          
          <Text style={styles.stepCounter}>{currentStep}/10</Text>
          
          {currentStep < 10 ? (
            <TouchableOpacity style={[styles.navButton, styles.navNext]} onPress={nextStep}>
              <Text style={styles.navButtonText}>Next</Text>
              <Icon name="chevron-right" size={18} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.navButton, styles.submitButton]} onPress={handleSubmit}>
              <Icon name="check" size={18} color={COLORS.white} />
              <Text style={styles.navButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker.visible && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker.visible && (
        <DateTimePicker
          value={showTimePicker.timeValue || new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* Signature Modal */}
      <Modal
        visible={showSignatureModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignatureModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signatureModal}>
            <View style={styles.signatureModalHeader}>
              <Text style={styles.signatureModalTitle}>Sign Document</Text>
              <TouchableOpacity onPress={() => setShowSignatureModal(false)}>
                <Icon name="close" size={24} color={COLORS.grey[600]} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.signatureCanvas}
              onPress={() => {
                // Simulate signature drawing
                setSignatureImage('signed');
              }}
              activeOpacity={0.7}
            >
              {signatureImage ? (
                <View style={styles.signaturePreview}>
                  <Icon name="check-circle" size={48} color={COLORS.success} />
                  <Text style={styles.signaturePreviewText}>Signature Added</Text>
                </View>
              ) : (
                <>
                  <Icon name="draw" size={64} color={COLORS.grey[400]} />
                  <Text style={styles.signatureCanvasText}>Tap to sign</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.signatureModalFooter}>
              <TouchableOpacity
                style={[styles.signatureModalButton, styles.signatureModalCancel]}
                onPress={() => setShowSignatureModal(false)}
              >
                <Text style={styles.signatureModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signatureModalButton, styles.signatureModalSave]}
                onPress={handleSignatureSave}
              >
                <Text style={styles.signatureModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.topBarBack}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.grey[100],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  topBarBack: {
    padding: SPACING.xs,
  },
  topBarTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 18,
  },
  topBarPlaceholder: {
    width: 32,
  },
  
  // Dashboard Styles
  dashboard: {
    flex: 1,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  dashboardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  dashboardSubtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[600],
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  createButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  dashboardContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
    textTransform: 'uppercase',
  },
  filterSection: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    paddingHorizontal: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    ...TYPOGRAPHY.body2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    gap: SPACING.xs,
  },
  filterButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  listHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
    backgroundColor: COLORS.grey[50],
  },
  listHeaderText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listItemId: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listItemDetails: {
    marginBottom: SPACING.sm,
  },
  listItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  listItemDetailText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
  },
  listItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.lg,
  },
  actionIcon: {
    padding: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyState: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.grey[500],
    marginTop: SPACING.md,
  },

  // Dropdown Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  dropdownItemText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[800],
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Form Styles
  formContainer: {
    flex: 1,
  },
  formScrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  formHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  formHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  formTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  formId: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[600],
    backgroundColor: COLORS.grey[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  formMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
  },
  editModeBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  editModeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.grey[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
    textAlign: 'right',
  },
  stepNavigator: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  stepNavigatorContent: {
    paddingHorizontal: SPACING.sm,
  },
  stepItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 80,
  },
  stepItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grey[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  stepIndicatorCompleted: {
    backgroundColor: COLORS.success,
  },
  stepIndicatorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[700],
    fontWeight: '600',
  },
  stepIndicatorTextActive: {
    color: COLORS.white,
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
    fontSize: 11,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionNumberText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
  },
  formGrid: {
    gap: SPACING.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupFull: {
    width: '100%',
  },
  inputLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
    padding: SPACING.sm,
    ...TYPOGRAPHY.body2,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  inputText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[800],
  },
  placeholderText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[500],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  switchLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
  },
  checkboxLabelChecked: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  warningText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
    flex: 1,
  },
  safetySwitch: {
    backgroundColor: COLORS.danger + '10',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger + '20',
  },
  safetySwitchLabel: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: SPACING.md,
    backgroundColor: COLORS.grey[50],
    gap: SPACING.sm,
  },
  signatureButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  infoText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.info,
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.grey[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[300],
  },
  tableHeaderCell: {
    padding: SPACING.xs,
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[700],
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
    alignItems: 'center',
  },
  tableCell: {
    padding: SPACING.xs,
    ...TYPOGRAPHY.caption,
  },
  tableInput: {
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 4,
    padding: SPACING.xs,
    ...TYPOGRAPHY.caption,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 4,
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[800],
  },
  typeButton: {
    width: 40,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  tbtButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grey[200],
  },
  tbtYes: {
    backgroundColor: COLORS.success,
  },
  tbtNo: {
    backgroundColor: COLORS.danger,
  },
  tbtButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  signButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
  },
  addButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
    flex: 1,
    minWidth: '48%',
  },
  optionCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionCardSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
    backgroundColor: COLORS.white,
    flex: 1,
    minWidth: '48%',
  },
  optionCardSimpleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[800],
    fontWeight: '500',
  },
  optionTitleSelected: {
    color: COLORS.white,
  },
  optionTitleSimple: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[800],
    fontWeight: '500',
    flex: 1,
  },
  optionTitleSimpleSelected: {
    color: COLORS.white,
  },
  optionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
  },
  optionDescriptionSelected: {
    color: COLORS.white + 'CC',
  },
  ppeConfirmBox: {
    backgroundColor: COLORS.success + '10',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  ppeConfirmText: {
    color: COLORS.success,
    fontWeight: '600',
  },
  checklistSection: {
    marginBottom: SPACING.lg,
  },
  checklistTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.grey[50],
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  checklistText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
    flex: 1,
    marginRight: SPACING.sm,
  },
  checklistOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.grey[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioSelectedText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  radioText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
  },
  radioTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  riskCard: {
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  riskNumber: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    alignItems: 'center',
    backgroundColor: COLORS.grey[50],
  },
  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: COLORS.white,
  },
  tbtConfirmBox: {
    backgroundColor: COLORS.info + '10',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.info + '20',
  },
  tbtConfirmText: {
    color: COLORS.info,
    fontWeight: '600',
  },
  authorizationCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  issuerCard: {
    borderColor: COLORS.primary,
  },
  approverCard: {
    borderColor: COLORS.info,
  },
  authorizerCard: {
    borderColor: COLORS.success,
  },
  workerCard: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '05',
  },
  authorizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  authorizationTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  smallInput: {
    padding: SPACING.xs,
    fontSize: 13,
  },
  smallSignature: {
    padding: SPACING.xs,
  },
  smallText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  halfInput: {
    flex: 1,
  },
  ampmSelector: {
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.grey[50],
  },
  ampmText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  statusCard: {
    flex: 1,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.grey[50],
  },
  statusCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusCardText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.grey[600],
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  statusCardTextActive: {
    color: COLORS.white,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    marginBottom: SPACING.lg,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  navPrev: {
    backgroundColor: COLORS.primary,
  },
  navNext: {
    backgroundColor: COLORS.primary,
  },
  navDisabled: {
    backgroundColor: COLORS.grey[200],
  },
  navButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  navTextDisabled: {
    color: COLORS.grey[500],
  },
  stepCounter: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[700],
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.success,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    gap: SPACING.sm,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  closeModalButton: {
    backgroundColor: COLORS.grey[600],
  },
  modalButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },

  // Detail View Styles
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailSectionTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[600],
    width: '35%',
  },
  detailValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[800],
    fontWeight: '500',
    width: '65%',
  },
  detailDescription: {
    backgroundColor: COLORS.grey[50],
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  statusBadgeSmall: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusTextSmall: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Signature Modal
  signatureModal: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  signatureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  signatureModalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
  },
  signatureCanvas: {
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.grey[300],
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.grey[50],
  },
  signatureCanvasText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.grey[500],
    marginTop: SPACING.sm,
  },
  signaturePreview: {
    alignItems: 'center',
  },
  signaturePreviewText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  signatureModalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  signatureModalButton: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  signatureModalCancel: {
    backgroundColor: COLORS.grey[200],
  },
  signatureModalSave: {
    backgroundColor: COLORS.primary,
  },
  signatureModalButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default PermitToWork;