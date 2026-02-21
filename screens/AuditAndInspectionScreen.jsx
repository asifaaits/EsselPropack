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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const AuditAndInspectionScreen = () => {
  const navigation = useNavigation();
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showIncidentDropdown, setShowIncidentDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Dropdown states for form
  const [showSourceTypeDropdown, setShowSourceTypeDropdown] = useState(false);
  const [showTypePickerDropdown, setShowTypePickerDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAuditorDropdown, setShowAuditorDropdown] = useState(false);

  // Audit form state
  const [auditFormData, setAuditFormData] = useState({
    title: '',
    sourceType: '',
    linkedIncident: '',
    type: '',
    location: '',
    auditor: 'Sarah Johnson',
    scheduledDate: new Date(),
  });

  // Sample audit data
  const [audits, setAudits] = useState([
    {
      id: 'AUD-2024-001',
      title: 'Slip and Fall in Warehouse B',
      type: 'Safety',
      location: 'Building A',
      auditor: 'Sarah Johnson',
      scheduledDate: '2024-04-15',
      status: 'Open',
      score: '92%',
      description: 'Comprehensive safety audit of Building A production area.',
    },
    {
      id: 'AUD-2024-002',
      title: 'Quality Inspection - Warehouse B',
      type: 'Quality',
      location: 'Warehouse',
      auditor: 'Mike Chen',
      scheduledDate: '2024-04-10',
      status: 'Investigating',
      score: '85%',
      description: 'Quality inspection of stored materials and handling procedures.',
    },
    {
      id: 'AUD-2024-003',
      title: '5S Housekeeping Audit',
      type: '5S',
      location: 'Building B',
      auditor: 'Lisa Park',
      scheduledDate: '2024-04-05',
      status: 'Closed',
      score: '95%',
      description: '5S housekeeping and organization audit.',
    },
    {
      id: 'AUD-2024-004',
      title: 'Environmental Compliance Check',
      type: 'Environmental',
      location: 'Office',
      auditor: 'Sarah Johnson',
      scheduledDate: '2024-04-01',
      status: 'Closed',
      score: '88%',
      description: 'Environmental compliance and waste management audit.',
    },
    {
      id: 'AUD-2024-005',
      title: 'Incident Follow-up - Forklift Safety',
      type: 'Incident Follow-up',
      location: 'Building A',
      auditor: 'Mike Chen',
      scheduledDate: '2024-04-12',
      status: 'Open',
      score: '78%',
      description: 'Follow-up audit for forklift incident investigation.',
    },
    {
      id: 'AUD-2024-006',
      title: 'Behavioral Safety Observation',
      type: 'Behavioral',
      location: 'Building B',
      auditor: 'Lisa Park',
      scheduledDate: '2024-04-18',
      status: 'Scheduled',
      score: 'Pending',
      description: 'Behavioral safety observation in production area.',
    },
  ]);

  // Sample incidents for linking
  const availableIncidents = [
    { id: 'INC-2025-012', title: 'Chemical Spill - 5L solvent', date: '2025-04-01' },
    { id: 'INC-2025-015', title: 'Slip/Trip - Wet floor', date: '2025-04-05' },
    { id: 'INC-2025-008', title: 'Near miss - Forklift', date: '2025-03-25' },
    { id: 'INC-2025-010', title: 'Equipment damage', date: '2025-03-28' },
    { id: 'INC-2025-018', title: 'First aid - Laceration', date: '2025-04-03' },
  ];

  const sourceTypes = [
    { label: 'None - Standalone Audit', value: '' },
    { label: 'Link to Incident', value: 'Incident' },
    { label: 'Routine/Scheduled Audit', value: 'Routine' },
  ];

  const auditTypes = [
    'Safety', 'Quality', 'Environmental', '5S', 'Behavioral', 'Incident Follow-up'
  ];

  const locations = ['Building A', 'Building B', 'Warehouse', 'Office'];
  
  const auditors = ['Sarah Johnson', 'Mike Chen', 'Lisa Park'];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAuditInputChange = (field, value) => {
    setAuditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleAuditInputChange('scheduledDate', selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleAuditSubmit = () => {
    console.log('Audit scheduled:', auditFormData);
    setShowAuditForm(false);
    alert('Audit scheduled successfully!');
  };

  const handleViewDetails = (audit) => {
    setSelectedAudit(audit);
    setShowDetailsModal(true);
  };

  const filterAudits = () => {
    return audits.filter(audit => {
      const matchesStatus = !statusFilter || audit.status === statusFilter;
      const matchesType = !typeFilter || audit.type === typeFilter;
      const matchesSearch = !searchTerm || 
        audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
  };

  const getTypeBadgeStyle = (type) => {
    switch(type.toLowerCase()) {
      case 'safety':
        return { backgroundColor: '#FDECEA', color: '#E74C3C' };
      case 'quality':
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
      case 'environmental':
        return { backgroundColor: '#FFEEEE', color: '#FF6B6B' };
      case '5s':
        return { backgroundColor: '#E8F4F8', color: '#45B7D1' };
      case 'behavioral':
        return { backgroundColor: '#F0F9F8', color: '#4ECDC4' };
      case 'incident follow-up':
        return { backgroundColor: '#FEF5E7', color: '#F39C12' };
      default:
        return { backgroundColor: '#E8F2FC', color: '#4A90E2' };
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
      case 'scheduled':
        return { backgroundColor: '#E0E7FF', color: '#4F46E5' };
      default:
        return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
    }
  };

  const getScoreStyle = (score) => {
    if (score === 'Pending') return { backgroundColor: '#E5E7EB', color: '#6B7280' };
    const scoreNum = parseInt(score);
    if (scoreNum >= 90) return { backgroundColor: '#E8F8F0', color: '#2ECC71' };
    if (scoreNum >= 80) return { backgroundColor: '#E8F2FC', color: '#4A90E2' };
    if (scoreNum >= 70) return { backgroundColor: '#FEF5E7', color: '#F39C12' };
    return { backgroundColor: '#FDECEA', color: '#E74C3C' };
  };

  const filteredAudits = filterAudits();

  const renderAuditCard = ({ item }) => (
    <TouchableOpacity
      style={styles.auditCard}
      activeOpacity={0.7}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <Text style={styles.auditId}>{item.id}</Text>
          <View style={[styles.typeBadge, getTypeBadgeStyle(item.type)]}>
            <Text style={[styles.badgeText, { color: getTypeBadgeStyle(item.type).color }]}>
              {item.type}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={[styles.badgeText, { color: getStatusStyle(item.status).color }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Icon name="map-marker-alt" size={12} color="#666" />
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="user" size={12} color="#666" />
          <Text style={styles.detailLabel}>Auditor:</Text>
          <Text style={styles.detailValue}>{item.auditor}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="calendar" size={12} color="#666" />
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{item.scheduledDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="star" size={12} color="#666" />
          <Text style={styles.detailLabel}>Score:</Text>
          <View style={[styles.scoreBadge, getScoreStyle(item.score)]}>
            <Text style={[styles.badgeText, { color: getScoreStyle(item.score).color }]}>
              {item.score}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewDetails(item)}
        >
          <Icon name="eye" size={14} color="#11269C" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="edit" size={14} color="#11269C" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="play" size={14} color="#11269C" />
          <Text style={styles.actionButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Dropdown render function
  const renderDropdown = (items, selectedValue, onSelect, onClose, renderItem) => (
    <View style={styles.dropdownMenu}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.dropdownMenuItem}
          onPress={() => {
            onSelect(item);
            onClose();
          }}
        >
          {renderItem ? renderItem(item, selectedValue) : (
            <Text style={[
              styles.dropdownMenuItemText,
              selectedValue === (item.value || item) && styles.dropdownMenuItemSelected
            ]}>
              {item.label || item}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#f1f2f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit & Inspection</Text>
        <TouchableOpacity 
          style={styles.scheduleButton}
          onPress={() => setShowAuditForm(true)}
        >
          <Icon name="plus" size={16} color="#03197a" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - Fixed ScrollView structure */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Recent Audits & Inspections</Text>
          <View style={styles.recordCount}>
            <Text style={styles.recordCountText}>{filteredAudits.length} records</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={16} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search audits..."
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

            {/* Type Filter */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text style={styles.filterButtonText}>
                {typeFilter || 'All Types'}
              </Text>
              <Icon name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Status Dropdown */}
          {showStatusDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setStatusFilter('');
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, !statusFilter && styles.dropdownItemSelected]}>
                  All Status
                </Text>
              </TouchableOpacity>
              {['Open', 'Investigating', 'Closed', 'Scheduled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    statusFilter === status && styles.dropdownItemSelected
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Type Dropdown */}
          {showTypeDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setTypeFilter('');
                  setShowTypeDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, !typeFilter && styles.dropdownItemSelected]}>
                  All Types
                </Text>
              </TouchableOpacity>
              {['Safety', 'Quality', 'Environmental', '5S', 'Behavioral', 'Incident Follow-up'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setTypeFilter(type);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    typeFilter === type && styles.dropdownItemSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Audit Cards List */}
        <View style={styles.listContainer}>
          {filteredAudits.map((item) => renderAuditCard({ item }))}
          {filteredAudits.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="clipboard-list" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>No audits found</Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Schedule Audit Modal */}
      <Modal
        visible={showAuditForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuditForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule New Audit</Text>
              <TouchableOpacity onPress={() => setShowAuditForm(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                {/* Audit Source Section */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>
                    <Icon name="link" size={14} color="#11269C" /> Audit Source
                  </Text>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Link to Existing Record</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowSourceTypeDropdown(!showSourceTypeDropdown)}
                    >
                      <Text style={styles.pickerButtonText}>
                        {sourceTypes.find(s => s.value === auditFormData.sourceType)?.label || 'None - Standalone Audit'}
                      </Text>
                      <Icon name="chevron-down" size={12} color="#666" />
                    </TouchableOpacity>
                    
                    {showSourceTypeDropdown && (
                      <View style={styles.modalDropdown}>
                        {sourceTypes.map((type) => (
                          <TouchableOpacity
                            key={type.value}
                            style={styles.modalDropdownItem}
                            onPress={() => {
                              handleAuditInputChange('sourceType', type.value);
                              setShowSourceTypeDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.modalDropdownText,
                              auditFormData.sourceType === type.value && styles.dropdownItemSelected
                            ]}>
                              {type.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Incident Selection - Show when Incident is selected */}
                  {auditFormData.sourceType === 'Incident' && (
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Select Incident *</Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowIncidentDropdown(!showIncidentDropdown)}
                      >
                        <Text style={styles.pickerButtonText}>
                          {auditFormData.linkedIncident ? 
                            availableIncidents.find(i => i.id === auditFormData.linkedIncident)?.id + ' - ' + 
                            availableIncidents.find(i => i.id === auditFormData.linkedIncident)?.title 
                            : 'Select an incident...'}
                        </Text>
                        <Icon name="chevron-down" size={12} color="#666" />
                      </TouchableOpacity>
                      
                      {showIncidentDropdown && (
                        <View style={styles.modalDropdown}>
                          {availableIncidents.map((incident) => (
                            <TouchableOpacity
                              key={incident.id}
                              style={styles.modalDropdownItem}
                              onPress={() => {
                                handleAuditInputChange('linkedIncident', incident.id);
                                setShowIncidentDropdown(false);
                              }}
                            >
                              <View>
                                <Text style={[
                                  styles.modalDropdownText,
                                  auditFormData.linkedIncident === incident.id && styles.dropdownItemSelected
                                ]}>
                                  {incident.id} - {incident.title}
                                </Text>
                                <Text style={styles.incidentDate}>{incident.date}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      <Text style={styles.helpText}>
                        Audit will be linked to this incident for follow-up investigation
                      </Text>
                    </View>
                  )}
                </View>

                {/* Audit Details Section */}
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>
                    <Icon name="info-circle" size={14} color="#11269C" /> Audit Details
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Audit Title *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Monthly Safety Audit - Building A"
                      placeholderTextColor="#999"
                      value={auditFormData.title}
                      onChangeText={(value) => handleAuditInputChange('title', value)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Audit Type *</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowTypePickerDropdown(!showTypePickerDropdown)}
                    >
                      <Text style={styles.pickerButtonText}>
                        {auditFormData.type || 'Select Audit Type'}
                      </Text>
                      <Icon name="chevron-down" size={12} color="#666" />
                    </TouchableOpacity>
                    
                    {showTypePickerDropdown && (
                      <View style={styles.modalDropdown}>
                        {auditTypes.map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={styles.modalDropdownItem}
                            onPress={() => {
                              handleAuditInputChange('type', type);
                              setShowTypePickerDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.modalDropdownText,
                              auditFormData.type === type && styles.dropdownItemSelected
                            ]}>
                              {type}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 4 }]}>
                      <Text style={styles.label}>Location *</Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                      >
                        <Text style={styles.pickerButtonText}>
                          {auditFormData.location || 'Select Location'}
                        </Text>
                        <Icon name="chevron-down" size={12} color="#666" />
                      </TouchableOpacity>
                      
                      {showLocationDropdown && (
                        <View style={styles.modalDropdown}>
                          {locations.map((loc) => (
                            <TouchableOpacity
                              key={loc}
                              style={styles.modalDropdownItem}
                              onPress={() => {
                                handleAuditInputChange('location', loc);
                                setShowLocationDropdown(false);
                              }}
                            >
                              <Text style={[
                                styles.modalDropdownText,
                                auditFormData.location === loc && styles.dropdownItemSelected
                              ]}>
                                {loc}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={[styles.formGroup, { flex: 1, marginLeft: 4 }]}>
                      <Text style={styles.label}>Auditor *</Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowAuditorDropdown(!showAuditorDropdown)}
                      >
                        <Text style={styles.pickerButtonText}>
                          {auditFormData.auditor}
                        </Text>
                        <Icon name="chevron-down" size={12} color="#666" />
                      </TouchableOpacity>
                      
                      {showAuditorDropdown && (
                        <View style={styles.modalDropdown}>
                          {auditors.map((auditor) => (
                            <TouchableOpacity
                              key={auditor}
                              style={styles.modalDropdownItem}
                              onPress={() => {
                                handleAuditInputChange('auditor', auditor);
                                setShowAuditorDropdown(false);
                              }}
                            >
                              <Text style={[
                                styles.modalDropdownText,
                                auditFormData.auditor === auditor && styles.dropdownItemSelected
                              ]}>
                                {auditor}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Scheduled Date *</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateText}>
                        {formatDate(auditFormData.scheduledDate)}
                      </Text>
                      <Icon name="calendar" size={16} color="#11269C" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowAuditForm(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleAuditSubmit}
                >
                  <Text style={styles.modalButtonText}>Schedule Audit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={auditFormData.scheduledDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
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
              <Text style={styles.modalTitle}>Audit Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedAudit && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Audit ID:</Text>
                    <Text style={styles.modalValue}>{selectedAudit.id}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Title:</Text>
                    <Text style={styles.modalValue}>{selectedAudit.title}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Type:</Text>
                    <View style={[styles.typeBadge, getTypeBadgeStyle(selectedAudit.type)]}>
                      <Text style={[styles.badgeText, { color: getTypeBadgeStyle(selectedAudit.type).color }]}>
                        {selectedAudit.type}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedAudit.location}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Auditor:</Text>
                    <Text style={styles.modalValue}>{selectedAudit.auditor}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>{selectedAudit.scheduledDate}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.statusBadge, getStatusStyle(selectedAudit.status)]}>
                      <Text style={[styles.badgeText, { color: getStatusStyle(selectedAudit.status).color }]}>
                        {selectedAudit.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Score:</Text>
                    <View style={[styles.scoreBadge, getScoreStyle(selectedAudit.score)]}>
                      <Text style={[styles.badgeText, { color: getScoreStyle(selectedAudit.score).color }]}>
                        {selectedAudit.score}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Description:</Text>
                    <Text style={styles.modalValue}>{selectedAudit.description}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]}>
                    <Icon name="check" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Start Audit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]}>
                    <Icon name="edit" size={16} color="#11269C" />
                    <Text style={styles.modalButtonTextSecondary}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
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
    height: 75,
    paddingTop: 27,
    paddingVertical: 12,
    backgroundColor: '#021679',
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
    color: '#f9f4f4',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f1f7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  scheduleButtonText: {
    color: '#031a81',
    fontSize: 14,
    fontWeight: '600',
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    backgroundColor: '#11269C',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
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
  filtersContainer: {
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
  dropdown: {
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
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemSelected: {
    color: '#11269C',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  auditCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  auditId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11269C',
  },
  typeBadge: {
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
    marginBottom: 12,
    lineHeight: 20,
  },
  cardDetails: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    width: 50,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f7fa',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#11269C',
    fontWeight: '600',
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
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f5f7fa',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f7fa',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
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
  modalDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  modalDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  incidentPicker: {
    gap: 8,
  },
  incidentOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
  },
  incidentOptionSelected: {
    backgroundColor: '#11269C',
    borderColor: '#11269C',
  },
  incidentOptionText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  incidentOptionTextSelected: {
    color: '#fff',
  },
  incidentDate: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f5f7fa',
  },
  typeOptionSelected: {
    backgroundColor: '#11269C',
    borderColor: '#11269C',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#333',
  },
  typeOptionTextSelected: {
    color: '#fff',
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
    width: 80,
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
});
export default AuditAndInspectionScreen;