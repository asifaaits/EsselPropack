import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const IncidentAndInjuryScreen = () => {
  const navigation = useNavigation();
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  // Dropdown visibility states for form
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSeverityFormDropdown, setShowSeverityFormDropdown] = useState(false);
  const [showAffectedPersonsDropdown, setShowAffectedPersonsDropdown] = useState(false);

  // Incident form state
  const [incidentFormData, setIncidentFormData] = useState({
    title: '',
    dateTime: new Date(),
    location: '',
    type: '',
    severity: '',
    reporterName: 'John Smith',
    affectedPersons: [],
    description: ''
  });

  // Sample incident data
  const [incidents, setIncidents] = useState([
    {
      id: 'INC-2024-001',
      dateTime: 'Jan 15, 2024, 09:30 AM',
      title: 'Slip and Fall in Warehouse B',
      location: 'Building B - Warehouse',
      type: 'Injury',
      severity: 'Major',
      status: 'Investigating',
      reporter: 'Mike Johnson',
      description: 'Employee slipped on wet floor in warehouse aisle. Minor injury to right arm.',
      affectedPersons: ['John Smith (Employee)'],
    },
    {
      id: 'INC-2024-002',
      dateTime: 'Jan 14, 2024, 02:15 PM',
      title: 'Near Miss - Forklift Operation',
      location: 'Building A - Production',
      type: 'Near Miss',
      severity: 'Near Miss',
      status: 'Open',
      reporter: 'Sarah Chen',
      description: 'Forklift almost collided with pedestrian at intersection.',
      affectedPersons: ['None'],
    },
    {
      id: 'INC-2024-003',
      dateTime: 'Jan 13, 2024, 11:00 AM',
      title: 'Chemical Splash',
      location: 'Building A - Production',
      type: 'Injury',
      severity: 'Critical',
      status: 'Closed',
      reporter: 'Lisa Park',
      description: 'Chemical splash to face during decanting process. Employee sent to hospital.',
      affectedPersons: ['Mike Chen (Employee)'],
    },
    {
      id: 'INC-2024-004',
      dateTime: 'Jan 12, 2024, 04:45 PM',
      title: 'Falling Object',
      location: 'Warehouse',
      type: 'Property Damage',
      severity: 'Minor',
      status: 'Closed',
      reporter: 'David Kim',
      description: 'Box fell from shelf, damaged product packaging.',
      affectedPersons: ['None'],
    },
    {
      id: 'INC-2024-005',
      dateTime: 'Jan 11, 2024, 08:20 AM',
      title: 'Vehicle Incident',
      location: 'Parking Lot',
      type: 'Vehicle',
      severity: 'Major',
      status: 'Investigating',
      reporter: 'Security Desk',
      description: 'Company vehicle backed into light pole. Minor damage to vehicle.',
      affectedPersons: ['Robert Zhao (Driver)'],
    }
  ]);

  // Stats calculation with icons
  const statsData = [
    {
      id: 1,
      number: incidents.length,
      label: 'Total Incidents',
      icon: 'exclamation-triangle',
      color: '#4A90E2',
      bgColor: '#E8F2FC'
    },
    {
      id: 2,
      number: incidents.filter(i => i.severity === 'Major' || i.severity === 'Critical').length,
      label: 'Lost Time Injuries',
      icon: 'user-injured',
      color: '#E74C3C',
      bgColor: '#FDECEA'
    },
    {
      id: 3,
      number: incidents.filter(i => i.status === 'Investigating' || i.status === 'Open').length,
      label: 'Open Investigations',
      icon: 'search',
      color: '#F39C12',
      bgColor: '#FEF5E7'
    },
    {
      id: 4,
      number: incidents.filter(i => i.status === 'Closed').length,
      label: 'Closed Cases',
      icon: 'check-circle',
      color: '#2ECC71',
      bgColor: '#E8F8F0'
    }
  ];

  // Dropdown options
  const locationOptions = [
    'Building A - Production',
    'Building B - Warehouse',
    'Building C - Office',
    'Parking Lot',
    'Warehouse',
    'Loading Dock',
    'Cafeteria',
    'Main Entrance'
  ];

  const typeOptions = [
    'Injury',
    'Near Miss',
    'Property Damage',
    'Vehicle',
    'Environmental',
    'Fire',
    'Security',
    'Chemical Spill'
  ];

  const severityOptions = [
    'Critical',
    'Major',
    'Minor',
    'Near Miss'
  ];

  const affectedPersonsOptions = [
    'None',
    'John Smith (Employee)',
    'Mike Chen (Employee)',
    'Sarah Johnson (Visitor)',
    'Robert Zhao (Contractor)',
    'Lisa Park (Employee)',
    'David Kim (Employee)'
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleIncidentInputChange = (field, value) => {
    setIncidentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        handleIncidentInputChange('dateTime', selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDateConfirm = () => {
    handleIncidentInputChange('dateTime', tempDate);
    setShowIOSDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowIOSDatePicker(false);
    setShowDatePicker(false);
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleIncidentSubmit = () => {
    console.log('Incident reported:', incidentFormData);
    setShowIncidentForm(false);
    Alert.alert('Success', 'Incident reported successfully!');
  };

  const handleViewDetails = (incident) => {
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

  const handleEditIncident = (incident) => {
    // Implement edit functionality here
    Alert.alert('Info', 'Edit functionality will be implemented');
  };

  const handleDeletePress = (incident) => {
    setIncidentToDelete(incident);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (incidentToDelete) {
      setIncidents(prevIncidents => 
        prevIncidents.filter(inc => inc.id !== incidentToDelete.id)
      );
      setShowDeleteModal(false);
      setIncidentToDelete(null);
      Alert.alert('Success', 'Incident deleted successfully');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setIncidentToDelete(null);
  };

  const filterIncidents = () => {
    return incidents.filter(incident => {
      const matchesStatus = !statusFilter || incident.status === statusFilter;
      const matchesSeverity = !severityFilter || incident.severity === severityFilter;
      const matchesSearch = !searchTerm || 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reporter.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSeverity && matchesSearch;
    });
  };

  const getTypeBadgeStyle = (type) => {
    switch(type.toLowerCase()) {
      case 'injury':
        return { backgroundColor: '#FDECEA', color: '#E74C3C' };
      case 'near miss':
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
      case 'property damage':
        return { backgroundColor: '#FFEEEE', color: '#FF6B6B' };
      case 'vehicle':
        return { backgroundColor: '#E8F4F8', color: '#45B7D1' };
      default:
        return { backgroundColor: '#F0F9F8', color: '#4ECDC4' };
    }
  };

  const getSeverityStyle = (severity) => {
    switch(severity.toLowerCase()) {
      case 'critical':
        return { backgroundColor: '#FDECEA', color: '#E74C3C' };
      case 'major':
        return { backgroundColor: '#FEF5E7', color: '#F39C12' };
      case 'minor':
        return { backgroundColor: '#E8F2FC', color: '#4A90E2' };
      case 'near miss':
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
      default:
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
    }
  };

  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'open':
        return { backgroundColor: '#FEF5E7', color: '#F39C12' };
      case 'investigating':
        return { backgroundColor: '#E8F2FC', color: '#4A90E2' };
      case 'closed':
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
      default:
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
    }
  };

  const filteredIncidents = filterIncidents();

  const renderDropdown = (visible, options, onSelect, onClose, selectedValue, isMultiSelect = false) => {
    if (!visible) return null;
    
    return (
      <View style={styles.dropdownMenu}>
        <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownMenuItem,
                (isMultiSelect ? selectedValue.includes(option) : selectedValue === option) && styles.dropdownMenuItemSelected
              ]}
              onPress={() => {
                if (isMultiSelect) {
                  const newValue = selectedValue.includes(option)
                    ? selectedValue.filter(item => item !== option)
                    : [...selectedValue, option];
                  onSelect(newValue);
                } else {
                  onSelect(option);
                  onClose();
                }
              }}
            >
              {isMultiSelect ? (
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    selectedValue.includes(option) && styles.checkboxChecked
                  ]}>
                    {selectedValue.includes(option) && (
                      <Icon name="check" size={10} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.dropdownMenuItemText}>{option}</Text>
                </View>
              ) : (
                <>
                  <Text style={[
                    styles.dropdownMenuItemText,
                    selectedValue === option && styles.dropdownMenuItemTextSelected
                  ]}>
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Icon name="check" size={14} color="#11269C" />
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {isMultiSelect && (
          <TouchableOpacity
            style={styles.dropdownCloseButton}
            onPress={onClose}
          >
            <Text style={styles.dropdownCloseText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderStatCard = ({ item }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: item.bgColor }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statNumber}>{item.number}</Text>
        <Text style={styles.statLabel}>{item.label}</Text>
      </View>
    </View>
  );

  const renderIncidentCard = (incident) => (
    <TouchableOpacity
      key={incident.id}
      style={styles.incidentCard}
      activeOpacity={0.7}
      onPress={() => handleViewDetails(incident)}
    >
      {/* First Row: Incident ID and Type Badge */}
      <View style={styles.cardRow}>
        <Text style={styles.incidentId}>{incident.id}</Text>
        <View style={[styles.typeBadge, getTypeBadgeStyle(incident.type)]}>
          <Text style={[styles.badgeText, { color: getTypeBadgeStyle(incident.type).color }]}>
            {incident.type}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>{incident.title}</Text>

      {/* Date and Time */}
      <View style={styles.cardRow}>
        <View style={styles.infoWithIcon}>
          <Icon name="calendar-alt" size={12} color="#666" />
          <Text style={styles.infoText}>{incident.dateTime}</Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.cardRow}>
        <View style={styles.infoWithIcon}>
          <Icon name="map-marker-alt" size={12} color="#666" />
          <Text style={styles.infoText}>{incident.location}</Text>
        </View>
      </View>

      {/* Severity and Status Row */}
      <View style={styles.cardRow}>
        <View style={[styles.severityBadge, getSeverityStyle(incident.severity)]}>
          <Text style={[styles.badgeText, { color: getSeverityStyle(incident.severity).color }]}>
            {incident.severity}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(incident.status)]}>
          <Text style={[styles.badgeText, { color: getStatusStyle(incident.status).color }]}>
            {incident.status}
          </Text>
        </View>
      </View>

      {/* Reporter and Actions Row */}
      <View style={styles.cardRow}>
        <View style={styles.infoWithIcon}>
          <Icon name="user" size={12} color="#666" />
          <Text style={styles.infoText}>{incident.reporter}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleViewDetails(incident)}
          >
            <Icon name="eye" size={14} color="#11269C" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleEditIncident(incident)}
          >
            <Icon name="edit" size={14} color="#11269C" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeletePress(incident)}
          >
            <Icon name="trash-alt" size={14} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#fdfdfe" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident & Injury</Text>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => setShowIncidentForm(true)}
        >
          <Icon name="plus" size={16} color="#031779" />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Main ScrollView */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
      >
        {/* Stats Cards Grid */}
        <View style={styles.statsContainer}>
          <FlatList
            data={statsData}
            renderItem={renderStatCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.statsRow}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Recent Incidents & Injuries</Text>
          <View style={styles.recordCount}>
            <Text style={styles.recordCountText}>{filteredIncidents.length} records</Text>
          </View>
        </View>

        {/* Filters Bar */}
        <View style={styles.filtersBar}>
          <View style={styles.searchBox}>
            <Icon name="search" size={16} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search incidents..."
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.filterRow}>
            {/* Status Filter */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Text style={styles.filterButtonText}>
                {statusFilter || 'All Status'}
              </Text>
              <Icon name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>

            {/* Severity Filter */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSeverityDropdown(!showSeverityDropdown)}
            >
              <Text style={styles.filterButtonText}>
                {severityFilter || 'All Severity'}
              </Text>
              <Icon name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Status Dropdown */}
          {showStatusDropdown && (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={styles.filterDropdownItem}
                onPress={() => {
                  setStatusFilter('');
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={[styles.filterDropdownItemText, !statusFilter && styles.filterDropdownItemSelected]}>
                  All Status
                </Text>
              </TouchableOpacity>
              {['Open', 'Investigating', 'Closed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.filterDropdownItem}
                  onPress={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.filterDropdownItemText,
                    statusFilter === status && styles.filterDropdownItemSelected
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Severity Dropdown */}
          {showSeverityDropdown && (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={styles.filterDropdownItem}
                onPress={() => {
                  setSeverityFilter('');
                  setShowSeverityDropdown(false);
                }}
              >
                <Text style={[styles.filterDropdownItemText, !severityFilter && styles.filterDropdownItemSelected]}>
                  All Severity
                </Text>
              </TouchableOpacity>
              {['Critical', 'Major', 'Minor', 'Near Miss'].map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={styles.filterDropdownItem}
                  onPress={() => {
                    setSeverityFilter(severity);
                    setShowSeverityDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.filterDropdownItemText,
                    severityFilter === severity && styles.filterDropdownItemSelected
                  ]}>
                    {severity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Incident Cards */}
        <View style={styles.cardsContainer}>
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => renderIncidentCard(incident))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="exclamation-triangle" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>No incidents found</Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Report Incident Modal */}
      <Modal
        visible={showIncidentForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIncidentForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report New Incident</Text>
              <TouchableOpacity onPress={() => setShowIncidentForm(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              <View style={styles.modalBody}>
                {/* Incident Title */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Incident Title <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Brief description of incident"
                    placeholderTextColor="#999"
                    value={incidentFormData.title}
                    onChangeText={(value) => handleIncidentInputChange('title', value)}
                  />
                </View>

                {/* Reporter Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Reporter Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter reporter name"
                    placeholderTextColor="#999"
                    value={incidentFormData.reporterName}
                    onChangeText={(value) => handleIncidentInputChange('reporterName', value)}
                  />
                </View>

                {/* Date & Time */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date & Time <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        setTempDate(incidentFormData.dateTime);
                        setShowIOSDatePicker(true);
                      } else {
                        setShowDatePicker(true);
                      }
                    }}
                  >
                    <Text style={styles.dateText}>
                      {formatDateTime(incidentFormData.dateTime)}
                    </Text>
                    <Icon name="calendar" size={16} color="#11269C" />
                  </TouchableOpacity>
                </View>

                {/* Location Dropdown */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                  >
                    <Text style={incidentFormData.location ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                      {incidentFormData.location || 'Select location'}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#666" />
                  </TouchableOpacity>
                  {renderDropdown(
                    showLocationDropdown,
                    locationOptions,
                    (value) => handleIncidentInputChange('location', value),
                    () => setShowLocationDropdown(false),
                    incidentFormData.location
                  )}
                </View>

                {/* Incident Type Dropdown */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Incident Type <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <Text style={incidentFormData.type ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                      {incidentFormData.type || 'Select incident type'}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#666" />
                  </TouchableOpacity>
                  {renderDropdown(
                    showTypeDropdown,
                    typeOptions,
                    (value) => handleIncidentInputChange('type', value),
                    () => setShowTypeDropdown(false),
                    incidentFormData.type
                  )}
                </View>

                {/* Severity Dropdown */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Severity <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowSeverityFormDropdown(!showSeverityFormDropdown)}
                  >
                    <Text style={incidentFormData.severity ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                      {incidentFormData.severity || 'Select severity'}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#666" />
                  </TouchableOpacity>
                  {renderDropdown(
                    showSeverityFormDropdown,
                    severityOptions,
                    (value) => handleIncidentInputChange('severity', value),
                    () => setShowSeverityFormDropdown(false),
                    incidentFormData.severity
                  )}
                </View>

                {/* Affected Persons Dropdown */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Affected Persons</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowAffectedPersonsDropdown(!showAffectedPersonsDropdown)}
                  >
                    <Text style={incidentFormData.affectedPersons.length > 0 ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                      {incidentFormData.affectedPersons.length > 0 
                        ? `${incidentFormData.affectedPersons.length} selected` 
                        : 'Select affected persons'}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#666" />
                  </TouchableOpacity>
                  {renderDropdown(
                    showAffectedPersonsDropdown,
                    affectedPersonsOptions,
                    (value) => handleIncidentInputChange('affectedPersons', value),
                    () => setShowAffectedPersonsDropdown(false),
                    incidentFormData.affectedPersons,
                    true
                  )}
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Detailed Description <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe what happened, immediate actions taken, witnesses..."
                    placeholderTextColor="#999"
                    value={incidentFormData.description}
                    onChangeText={(value) => handleIncidentInputChange('description', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowIncidentForm(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleIncidentSubmit}
                >
                  <Text style={styles.modalButtonText}>Submit Incident</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={incidentFormData.dateTime}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* iOS Date Picker Modal */}
      {showIOSDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showIOSDatePicker}
          onRequestClose={handleDateCancel}
        >
          <View style={styles.iosPickerOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={handleDateCancel}>
                  <Text style={styles.iosPickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosPickerTitle}>Select Date & Time</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={onDateChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Incident Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedIncident && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Incident ID:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.id}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Title:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.title}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Date & Time:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.dateTime}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.location}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Type:</Text>
                    <View style={[styles.typeBadge, getTypeBadgeStyle(selectedIncident.type)]}>
                      <Text style={[styles.badgeText, { color: getTypeBadgeStyle(selectedIncident.type).color }]}>
                        {selectedIncident.type}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Severity:</Text>
                    <View style={[styles.severityBadge, getSeverityStyle(selectedIncident.severity)]}>
                      <Text style={[styles.badgeText, { color: getSeverityStyle(selectedIncident.severity).color }]}>
                        {selectedIncident.severity}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.statusBadge, getStatusStyle(selectedIncident.status)]}>
                      <Text style={[styles.badgeText, { color: getStatusStyle(selectedIncident.status).color }]}>
                        {selectedIncident.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Reported By:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.reporter}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Description:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.description}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Affected Persons:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.affectedPersons.join(', ')}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]}>
                    <Icon name="check" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Investigate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      handleEditIncident(selectedIncident);
                    }}
                  >
                    <Icon name="edit" size={16} color="#11269C" />
                    <Text style={styles.modalButtonTextSecondary}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonDanger]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      handleDeletePress(selectedIncident);
                    }}
                  >
                    <Icon name="trash-alt" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIcon}>
              <Icon name="exclamation-triangle" size={40} color="#E74C3C" />
            </View>
            <Text style={styles.confirmTitle}>Delete Incident</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete this incident? This action cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancel]}
                onPress={handleDeleteCancel}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmDelete]}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 77,
    paddingTop: 27,
    backgroundColor: '#021c67',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 2,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#f4f4f4',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f7f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  reportButtonText: {
    color: '#031364',
    fontSize: 14,
    fontWeight: '600',
  },
  mainScrollView: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f7fa',
  },
  statsRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11269C',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  titleSection: {
    backgroundColor: '#11269C',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  recordCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  recordCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  filtersBar: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#000',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: 180,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  filterDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterDropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  filterDropdownItemSelected: {
    color: '#11269C',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11269C',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: '#f5f7fa',
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#FDECEA',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.95,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f5f7fa',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f7fa',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f7fa',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2000,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownMenuItemSelected: {
    backgroundColor: '#f0f3ff',
  },
  dropdownMenuItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownMenuItemTextSelected: {
    color: '#11269C',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#11269C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#11269C',
  },
  dropdownCloseButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dropdownCloseText: {
    color: '#11269C',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f5f7fa',
  },
  pickerOptionSelected: {
    backgroundColor: '#11269C',
    borderColor: '#11269C',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  modalLabel: {
    width: 100,
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  modalValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#11269C',
  },
  modalButtonSecondary: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#11269C',
  },
  modalButtonDanger: {
    backgroundColor: '#E74C3C',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#11269C',
    fontSize: 14,
    fontWeight: '600',
  },
  iosPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iosPickerCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  iosPickerTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPickerDone: {
    color: '#11269C',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FDECEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancel: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  confirmCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDelete: {
    backgroundColor: '#E74C3C',
  },
  confirmDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default IncidentAndInjuryScreen;