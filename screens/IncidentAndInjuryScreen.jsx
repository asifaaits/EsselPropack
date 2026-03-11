// screens/IncidentAndInjuryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-crop-picker';
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { useAuth } from './worker-module/context/AuthContext'; // Adjust the path based on your project structure
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import API
import {
  incidentAPI,
  affectedPersonAPI,
  bodyPartAPI,
  incidentImageAPI,
  incidentDocumentAPI,
} from './api/IncidentModule/IncidentAPI';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const IncidentAndInjuryScreen = () => {
  const navigation = useNavigation();
  
const { user, isAuthenticated, logout } = useAuth(); // Get auth from context
  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // API Data states
  const [incidents, setIncidents] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    lostTimeInjuries: 0,
    openInvestigations: 0,
    closedCases: 0,
  });

  // UI States
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState(null);

  // Form dropdown states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSeverityFormDropdown, setShowSeverityFormDropdown] = useState(false);
  const [showBodyPartFrontDropdown, setShowBodyPartFrontDropdown] = useState(false);
  const [showBodyPartBackDropdown, setShowBodyPartBackDropdown] = useState(false);
  const [showPersonTypeDropdown, setShowPersonTypeDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);

  // Form data
  const [incidentFormData, setIncidentFormData] = useState({
    incidentNumber: '',
    title: '',
    dateTime: new Date(),
    location: '',
    type: '',
    severity: '',
    reporterName: '',
    description: '',
    latitude: '',
    longitude: '',
  });

  // Location coordinates
  const [locationCoordinates, setLocationCoordinates] = useState({
    latitude: '',
    longitude: '',
  });

  // Uploaded images
  const [uploadedImages, setUploadedImages] = useState([]);

  // Uploaded documents
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // Affected persons list
  const [affectedPersonsList, setAffectedPersonsList] = useState([]);

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

  const personTypeOptions = [
    'Employee',
    'Contractor',
    'Visitor'
  ];

  const departmentOptions = [
    'Production',
    'Warehouse',
    'Maintenance',
    'Security',
    'Administration',
    'Management'
  ];

  // Predefined body parts
  const frontBodyParts = [
    { value: 'head-front', label: 'Head (Front View)' },
    { value: 'neck-front', label: 'Neck (Front View)' },
    { value: 'chest-front', label: 'Chest (Front View)' },
    { value: 'right-arm-front', label: 'Right Arm (Front View)' },
    { value: 'right-hand-front', label: 'Right Hand (Front View)' },
    { value: 'left-arm-front', label: 'Left Arm (Front View)' },
    { value: 'left-hand-front', label: 'Left Hand (Front View)' },
    { value: 'abdomen-front', label: 'Abdomen (Front View)' },
    { value: 'right-thigh-front', label: 'Right Thigh (Front View)' },
    { value: 'left-thigh-front', label: 'Left Thigh (Front View)' },
    { value: 'right-shin-front', label: 'Right Shin (Front View)' },
    { value: 'left-shin-front', label: 'Left Shin (Front View)' },
    { value: 'right-foot-front', label: 'Right Foot (Front View)' },
    { value: 'left-foot-front', label: 'Left Foot (Front View)' },
  ];

  const backBodyParts = [
    { value: 'head-back', label: 'Back of Head (Back View)' },
    { value: 'neck-back', label: 'Back of Neck (Back View)' },
    { value: 'upper-back', label: 'Upper Back (Back View)' },
    { value: 'lower-back', label: 'Lower Back (Back View)' },
    { value: 'right-arm-back', label: 'Right Arm (Back View)' },
    { value: 'right-hand-back', label: 'Right Hand (Back View)' },
    { value: 'left-arm-back', label: 'Left Arm (Back View)' },
    { value: 'left-hand-back', label: 'Left Hand (Back View)' },
    { value: 'right-hip-back', label: 'Right Hip (Back View)' },
    { value: 'left-hip-back', label: 'Left Hip (Back View)' },
    { value: 'right-hamstring-back', label: 'Right Hamstring (Back View)' },
    { value: 'left-hamstring-back', label: 'Left Hamstring (Back View)' },
    { value: 'right-calf-back', label: 'Right Calf (Back View)' },
    { value: 'left-calf-back', label: 'Left Calf (Back View)' },
    { value: 'right-heel-back', label: 'Right Heel (Back View)' },
    { value: 'left-heel-back', label: 'Left Heel (Back View)' },
  ];

  const allBodyParts = [...frontBodyParts, ...backBodyParts, ...bodyParts];

 
 // Load data when screen comes into focus
useFocusEffect(
  useCallback(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setInitialLoading(false); // Set loading to false if not authenticated
    }
  }, [isAuthenticated])
);

 
  // Load all data
  const loadData = async () => {
    await Promise.all([
      loadIncidents(),
      loadBodyParts(),
      loadStats()
    ]);
    setInitialLoading(false);
    setRefreshing(false);
  };

  // Load incidents with filters
  const loadIncidents = async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (severityFilter) filters.severity = severityFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await incidentAPI.getAll(filters);
      
      if (response.success && response.incidents) {
        const transformedIncidents = response.incidents.map(incident => ({
          id: incident.s_incident_number || incident.id,
          incidentId: incident.id,
          dateTime: incident.dt_incident,
          formattedDateTime: formatDateTime(incident.dt_incident),
          title: incident.s_title,
          location: incident.s_location,
          coordinates: {
            latitude: incident.s_latitude || '',
            longitude: incident.s_longitude || '',
          },
          type: incident.e_incident_type,
          severity: incident.e_severity,
          status: incident.e_status,
          reporter: incident.s_reporter_name,
          description: incident.t_description,
          images: incident.images || [],
          affectedPersons: incident.affectedPersons || [],
          createdAt: incident.dt_created_at,
          updatedAt: incident.dt_updated_at,
        }));
        setIncidents(transformedIncidents);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        setIsAuthenticated(false);
      } else {
        Alert.alert('Error', 'Failed to load incidents');
      }
    }
  };

  // Load body parts
  const loadBodyParts = async () => {
    try {
      const response = await bodyPartAPI.getAll();
      if (response.success && response.bodyParts) {
        const transformedBodyParts = response.bodyParts.map(part => ({
          value: part.id,
          label: part.s_label,
          view: part.e_view,
        }));
        setBodyParts(transformedBodyParts);
      }
    } catch (error) {
      console.error('Error loading body parts:', error);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await incidentAPI.getStats();
      if (response.success && response.stats) {
        setStats({
          totalIncidents: response.stats.totalIncidents || 0,
          lostTimeInjuries: response.stats.lostTimeInjuries || 0,
          openInvestigations: response.stats.openInvestigations || 0,
          closedCases: response.stats.closedCases || 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load single incident by ID
  const loadIncidentById = async (id) => {
    try {
      setLoading(true);
      const response = await incidentAPI.getById(id);
      
      if (response.success && response.incident) {
        const incident = response.incident;
        return {
          id: incident.s_incident_number || incident.id,
          incidentId: incident.id,
          dateTime: incident.dt_incident,
          formattedDateTime: formatDateTime(incident.dt_incident),
          title: incident.s_title,
          location: incident.s_location,
          coordinates: {
            latitude: incident.s_latitude || '',
            longitude: incident.s_longitude || '',
          },
          type: incident.e_incident_type,
          severity: incident.e_severity,
          status: incident.e_status,
          reporter: incident.s_reporter_name,
          description: incident.t_description,
          images: incident.images || [],
          affectedPersons: incident.affectedPersons || [],
          createdAt: incident.dt_created_at,
          updatedAt: incident.dt_updated_at,
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading incident:', error);
      Alert.alert('Error', 'Failed to load incident details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create incident
  const createIncident = async (formData, images, documents, persons) => {
    try {
      setLoading(true);
      
      const incidentData = {
        s_incident_number: formData.incidentNumber || `INC-${Date.now()}`,
        s_title: formData.title,
        dt_incident: formData.dateTime.toISOString(),
        s_location: formData.location,
        e_incident_type: formData.type,
        e_severity: formData.severity,
        s_reporter_name: formData.reporterName,
        t_description: formData.description,
        s_latitude: formData.latitude || null,
        s_longitude: formData.longitude || null
      };
      
      const response = await incidentAPI.create(incidentData);
      
      if (response.success && response.incident) {
        const incidentId = response.incident.id;
        
        // Upload images
        if (images.length > 0) {
          for (const image of images) {
            if (image.file) {
              try {
                await incidentImageAPI.add(incidentId, image.file, image.caption);
              } catch (imgError) {
                console.error('Error uploading image:', imgError);
              }
            }
          }
        }
        
        // Upload documents
        if (documents.length > 0) {
          for (const doc of documents) {
            if (doc.file) {
              try {
                await incidentDocumentAPI.add(incidentId, doc.file, {
                  s_file_name: doc.name,
                  s_file_type: doc.type,
                  i_file_size: doc.size,
                });
              } catch (docError) {
                console.error('Error uploading document:', docError);
              }
            }
          }
        }
        
        // Create affected persons
        if (persons.length > 0) {
          for (const person of persons) {
            const personData = {
              s_full_name: person.fullName,
              e_person_type: person.personType,
              s_department: person.department || null,
              s_outcome_description: person.outcomeDescription || null
            };
            
            try {
              const personResponse = await affectedPersonAPI.create(incidentId, personData);
              
              if (personResponse.success && personResponse.person && person.bodyParts.length > 0) {
                for (const bodyPartId of person.bodyParts) {
                  await bodyPartAPI.addToPerson(personResponse.person.id, bodyPartId);
                }
              }
            } catch (personError) {
              console.error('Error creating person:', personError);
            }
          }
        }
        
        Alert.alert('Success', 'Incident created successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating incident:', error);
      Alert.alert('Error', 'Failed to create incident');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update incident
  const updateIncident = async (incidentId, formData, images, documents, persons) => {
    try {
      setLoading(true);
      
      const incidentData = {
        s_title: formData.title,
        dt_incident: formData.dateTime.toISOString(),
        s_location: formData.location,
        e_incident_type: formData.type,
        e_severity: formData.severity,
        s_reporter_name: formData.reporterName,
        t_description: formData.description,
        s_latitude: formData.latitude || null,
        s_longitude: formData.longitude || null
      };
      
      const response = await incidentAPI.update(incidentId, incidentData);
      
      if (response.success) {
        // Handle new images
        if (images.length > 0) {
          for (const image of images) {
            if (image.file && !image.id) {
              await incidentImageAPI.add(incidentId, image.file, image.caption);
            }
          }
        }
        
        // Handle new documents
        if (documents.length > 0) {
          for (const doc of documents) {
            if (doc.file && !doc.id) {
              await incidentDocumentAPI.add(incidentId, doc.file, {
                s_file_name: doc.name,
                s_file_type: doc.type,
                i_file_size: doc.size,
              });
            }
          }
        }
        
        Alert.alert('Success', 'Incident updated successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating incident:', error);
      Alert.alert('Error', 'Failed to update incident');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete incident
  const deleteIncident = async (incidentId) => {
    try {
      setLoading(true);
      const response = await incidentAPI.delete(incidentId);
      
      if (response.success) {
        Alert.alert('Success', 'Incident deleted successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting incident:', error);
      Alert.alert('Error', 'Failed to delete incident');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update incident status
  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const response = await incidentAPI.updateStatus(incidentId, newStatus);
      
      if (response.success) {
        Alert.alert('Success', `Status updated to ${newStatus}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationCoordinates({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          setIncidentFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          Alert.alert('Success', 'Location captured successfully!');
        },
        (error) => {
          Alert.alert('Error', 'Error getting location: ' + error.message);
        }
      );
    } else {
      Alert.alert('Error', 'Geolocation is not supported by this device.');
    }
  };

  // Handle image picker
  const handleImagePicker = async () => {
    try {
      const image = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        includeBase64: true,
        maxFiles: 10,
      });

      const newImages = await Promise.all(image.map(async (img) => {
        const file = {
          uri: img.path,
          type: img.mime,
          name: img.filename || `image_${Date.now()}.jpg`,
          size: img.size,
          data: img.data,
        };

        return {
          id: `img-${Date.now()}-${Math.random()}`,
          file: file,
          preview: img.path,
          caption: '',
        };
      }));

      setUploadedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Image picker error:', error);
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

// Handle document picker - UPDATED for new package
const handleDocumentPicker = async () => {
  try {
    // The new package returns an array even for single files
    const results = await pick({
      allowMultiSelection: true,
      type: [types.allFiles], // or specify specific types like [types.pdf, types.images]
    });

    const newDocuments = results.map(doc => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      file: {
        uri: doc.uri,
        type: doc.type,
        name: doc.name,
        size: doc.size,
      },
      uploadDate: new Date().toISOString()
    }));

    setUploadedDocuments(prev => [...prev, ...newDocuments]);
  } catch (error) {
    // Check if user cancelled (error.code is now different)
    if (error.code === 'DOCUMENT_PICKER_CANCELED') {
      // User cancelled - ignore
      console.log('User cancelled document picker');
    } else {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  }
};
  // Remove image
  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Update image caption
  const updateImageCaption = (imageId, caption) => {
    setUploadedImages(prev =>
      prev.map(img => img.id === imageId ? { ...img, caption } : img)
    );
  };

  // Remove document
  const removeDocument = (docId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // Generate person ID
  const generatePersonId = () => {
    return `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add affected person
  const handleAddAffectedPerson = () => {
    setAffectedPersonsList([
      ...affectedPersonsList,
      { 
        id: generatePersonId(),
        fullName: '',
        name: '',
        personType: '',
        type: '',
        department: '',
        outcomeDescription: '',
        outcome: '',
        bodyParts: [] 
      },
    ]);
  };

  // Update affected person
  const handleAffectedPersonChange = (index, field, value) => {
    const updatedList = [...affectedPersonsList];
    updatedList[index][field] = value;
    if (field === 'fullName') updatedList[index].name = value;
    if (field === 'personType') updatedList[index].type = value;
    if (field === 'outcomeDescription') updatedList[index].outcome = value;
    setAffectedPersonsList(updatedList);
  };

  // Add body part to person
  const handleAddBodyPartToPerson = (personIndex, bodyPartValue) => {
    const updatedList = [...affectedPersonsList];
    if (!updatedList[personIndex].bodyParts.includes(bodyPartValue)) {
      updatedList[personIndex].bodyParts.push(bodyPartValue);
      setAffectedPersonsList(updatedList);
    }
  };

  // Remove body part from person
  const handleRemoveBodyPartFromPerson = (personIndex, bodyPartValue) => {
    const updatedList = [...affectedPersonsList];
    updatedList[personIndex].bodyParts = updatedList[personIndex].bodyParts.filter(
      bp => bp !== bodyPartValue
    );
    setAffectedPersonsList(updatedList);
  };

  // Remove affected person
  const handleRemoveAffectedPerson = (index) => {
    const updatedList = affectedPersonsList.filter((_, i) => i !== index);
    setAffectedPersonsList(updatedList);
  };

  // Get body part label
  const getBodyPartLabel = (value) => {
    const bodyPart = allBodyParts.find((part) => part.value === value);
    return bodyPart ? bodyPart.label : value;
  };

  // Format date time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Handle form input change
  const handleIncidentInputChange = (field, value) => {
    setIncidentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle date change
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

  // Handle date confirm for iOS
  const handleDateConfirm = () => {
    handleIncidentInputChange('dateTime', tempDate);
    setShowIOSDatePicker(false);
  };

  // Handle date cancel
  const handleDateCancel = () => {
    setShowIOSDatePicker(false);
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form submit
  const handleIncidentSubmit = async () => {
    // Validate required fields
    if (!incidentFormData.title || !incidentFormData.reporterName || 
        !incidentFormData.location || !incidentFormData.type || 
        !incidentFormData.severity || !incidentFormData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Prepare persons data
    const processedPersons = affectedPersonsList.map(person => ({
      fullName: person.fullName || person.name,
      personType: person.personType || person.type,
      department: person.department,
      outcomeDescription: person.outcomeDescription || person.outcome,
      bodyParts: person.bodyParts,
    }));

    let success = false;

    if (editingIncident) {
      success = await updateIncident(
        editingIncident.incidentId,
        incidentFormData,
        uploadedImages,
        uploadedDocuments,
        processedPersons
      );
    } else {
      success = await createIncident(
        incidentFormData,
        uploadedImages,
        uploadedDocuments,
        processedPersons
      );
    }

    if (success) {
      resetForm();
      await loadData();
    }
  };

  // Reset form
  const resetForm = () => {
    setShowIncidentForm(false);
    setEditingIncident(null);
    setIncidentFormData({
      incidentNumber: '',
      title: '',
      dateTime: new Date(),
      location: '',
      type: '',
      severity: '',
      reporterName: '',
      description: '',
      latitude: '',
      longitude: '',
    });
    setLocationCoordinates({ latitude: '', longitude: '' });
    setAffectedPersonsList([]);
    setUploadedImages([]);
    setUploadedDocuments([]);
  };

  // Handle edit incident
  const handleEditIncident = async (incident) => {
    const fullIncident = await loadIncidentById(incident.incidentId || incident.id);
    
    if (fullIncident) {
      setEditingIncident(fullIncident);
      setIncidentFormData({
        incidentNumber: fullIncident.id,
        title: fullIncident.title,
        dateTime: new Date(fullIncident.dateTime),
        location: fullIncident.location,
        type: fullIncident.type,
        severity: fullIncident.severity,
        reporterName: fullIncident.reporter,
        description: fullIncident.description || '',
        latitude: fullIncident.coordinates?.latitude || '',
        longitude: fullIncident.coordinates?.longitude || '',
      });
      setLocationCoordinates(
        fullIncident.coordinates || { latitude: '', longitude: '' }
      );
      
      const transformedPersons = (fullIncident.affectedPersons || []).map(person => ({
        id: person.id,
        fullName: person.name,
        name: person.name,
        personType: person.type,
        type: person.type,
        department: person.department,
        outcomeDescription: person.outcome,
        outcome: person.outcome,
        bodyParts: person.bodyParts || [],
      }));
      setAffectedPersonsList(transformedPersons);

      if (fullIncident.images) {
        const existingImages = fullIncident.images.map((img) => ({
          id: img.id,
          preview: img.url || img.s_image_url,
          caption: img.caption || img.s_caption || '',
        }));
        setUploadedImages(existingImages);
      }

      setShowIncidentForm(true);
      setShowDetailsModal(false);
    }
  };

  // Handle view incident
  const handleViewDetails = async (incident) => {
    const fullIncident = await loadIncidentById(incident.incidentId || incident.id);
    
    if (fullIncident) {
      setSelectedIncident(fullIncident);
      setShowDetailsModal(true);
    }
  };

  // Handle delete press
  const handleDeletePress = (incident) => {
    setIncidentToDelete(incident);
    setShowDeleteModal(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (incidentToDelete) {
      const success = await deleteIncident(incidentToDelete.incidentId || incidentToDelete.id);
      if (success) {
        await loadData();
      }
      setShowDeleteModal(false);
      setIncidentToDelete(null);
      setShowDetailsModal(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setIncidentToDelete(null);
  };

  // Handle update status
  const handleUpdateStatus = async (incidentId, newStatus) => {
    const success = await updateIncidentStatus(incidentId, newStatus);
    if (success) {
      await loadData();
      if (selectedIncident && selectedIncident.incidentId === incidentId) {
        setSelectedIncident(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  // Filter incidents
  const filterIncidents = () => {
    return incidents.filter((incident) => {
      const matchesStatus = !statusFilter || incident.status === statusFilter;
      const matchesSeverity = !severityFilter || incident.severity === severityFilter;
      const matchesSearch = !searchTerm ||
        (incident.title && incident.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incident.id && incident.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incident.location && incident.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incident.reporter && incident.reporter.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incident.description && incident.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSeverity && matchesSearch;
    });
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    setSeverityFilter('');
    setSearchTerm('');
    loadIncidents();
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Get type badge style
  const getTypeBadgeStyle = (type) => {
    switch(type?.toLowerCase()) {
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

  // Get severity style
  const getSeverityStyle = (severity) => {
    switch(severity?.toLowerCase()) {
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

  // Get status style
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
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

  // Get document icon
  const getDocumentIcon = (fileType) => {
    if (!fileType) return 'file-alt';
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-excel';
    if (fileType.includes('image')) return 'image';
    return 'file-alt';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Stats data for display
  const statsData = [
    {
      id: 1,
      number: stats.totalIncidents,
      label: 'Total Incidents',
      icon: 'exclamation-triangle',
      color: '#4A90E2',
      bgColor: '#E8F2FC'
    },
    {
      id: 2,
      number: stats.lostTimeInjuries,
      label: 'Lost Time Injuries',
      icon: 'user-injured',
      color: '#E74C3C',
      bgColor: '#FDECEA'
    },
    {
      id: 3,
      number: stats.openInvestigations,
      label: 'Open Investigations',
      icon: 'search',
      color: '#F39C12',
      bgColor: '#FEF5E7'
    },
    {
      id: 4,
      number: stats.closedCases,
      label: 'Closed Cases',
      icon: 'check-circle',
      color: '#2ECC71',
      bgColor: '#E8F8F0'
    }
  ];

  const filteredIncidents = filterIncidents();

  // Render dropdown
  const renderDropdown = (visible, options, onSelect, onClose, selectedValue, isMultiSelect = false) => {
    if (!visible) return null;
    
    return (
      <View style={styles.dropdownMenu}>
        <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
          {options.map((option) => (
            <TouchableOpacity
              key={typeof option === 'object' ? option.value : option}
              style={[
                styles.dropdownMenuItem,
                (isMultiSelect 
                  ? selectedValue.includes(typeof option === 'object' ? option.value : option)
                  : selectedValue === (typeof option === 'object' ? option.value : option)) 
                  && styles.dropdownMenuItemSelected
              ]}
              onPress={() => {
                const value = typeof option === 'object' ? option.value : option;
                if (isMultiSelect) {
                  const newValue = selectedValue.includes(value)
                    ? selectedValue.filter(item => item !== value)
                    : [...selectedValue, value];
                  onSelect(newValue);
                } else {
                  onSelect(value);
                  onClose();
                }
              }}
            >
              {isMultiSelect ? (
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    selectedValue.includes(typeof option === 'object' ? option.value : option) && styles.checkboxChecked
                  ]}>
                    {selectedValue.includes(typeof option === 'object' ? option.value : option) && (
                      <Icon name="check" size={10} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.dropdownMenuItemText}>
                    {typeof option === 'object' ? option.label : option}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[
                    styles.dropdownMenuItemText,
                    selectedValue === (typeof option === 'object' ? option.value : option) && styles.dropdownMenuItemTextSelected
                  ]}>
                    {typeof option === 'object' ? option.label : option}
                  </Text>
                  {selectedValue === (typeof option === 'object' ? option.value : option) && (
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

  // Render stat card
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

  // Render incident card
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
          <Text style={styles.infoText}>{incident.formattedDateTime}</Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.cardRow}>
        <View style={styles.infoWithIcon}>
          <Icon name="map-marker-alt" size={12} color="#666" />
          <Text style={styles.infoText}>{incident.location}</Text>
        </View>
      </View>

      {/* Coordinates if available */}
      {incident.coordinates && incident.coordinates.latitude && (
        <View style={styles.cardRow}>
          <View style={styles.infoWithIcon}>
            <Icon name="globe" size={12} color="#666" />
            <Text style={styles.infoText}>
              {parseFloat(incident.coordinates.latitude).toFixed(4)}, 
              {parseFloat(incident.coordinates.longitude).toFixed(4)}
            </Text>
          </View>
        </View>
      )}

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

      {/* Image count indicator */}
      {incident.images && incident.images.length > 0 && (
        <View style={styles.cardRow}>
          <View style={styles.infoWithIcon}>
            <Icon name="images" size={12} color="#666" />
            <Text style={styles.infoText}>{incident.images.length} image(s)</Text>
          </View>
        </View>
      )}

      {/* Affected persons count */}
      {incident.affectedPersons && incident.affectedPersons.length > 0 && (
        <View style={styles.cardRow}>
          <View style={styles.infoWithIcon}>
            <Icon name="user-injured" size={12} color="#666" />
            <Text style={styles.infoText}>{incident.affectedPersons.length} affected person(s)</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

 // Authentication check - now using context
if (!isAuthenticated && !initialLoading) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#fdfdfe" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident & Injury</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.authErrorContainer}>
        <Icon name="exclamation-triangle" size={50} color="#f39c12" />
        <Text style={styles.authErrorTitle}>Authentication Required</Text>
        <Text style={styles.authErrorMessage}>
          Please log in to access the Incident & Injury Management system.
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.authButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Loading Overlay */}
      {(loading || initialLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#11269c" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#fdfdfe" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident & Injury</Text>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => {
            resetForm();
            setShowIncidentForm(true);
          }}
        >
          <Icon name="plus" size={16} color="#031779" />
          <Text style={styles.reportButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Main ScrollView */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
              onSubmitEditing={loadIncidents}
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

          {/* Clear Filters Button */}
          {(statusFilter || severityFilter || searchTerm) && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}

          {/* Status Dropdown */}
          {showStatusDropdown && (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={styles.filterDropdownItem}
                onPress={() => {
                  setStatusFilter('');
                  setShowStatusDropdown(false);
                  loadIncidents();
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
                    loadIncidents();
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
                  loadIncidents();
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
                    loadIncidents();
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

      {/* Report/Edit Incident Modal */}
      <Modal
        visible={showIncidentForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIncidentForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIncident ? 'Edit Incident' : 'Report New Incident'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
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
                      {formatDateForDisplay(incidentFormData.dateTime)}
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

                {/* Location Coordinates */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Location Coordinates</Text>
                  <View style={styles.coordinatesRow}>
                    <TextInput
                      style={[styles.input, styles.coordinateInput]}
                      placeholder="Latitude"
                      placeholderTextColor="#999"
                      value={incidentFormData.latitude}
                      onChangeText={(value) => handleIncidentInputChange('latitude', value)}
                    />
                    <TextInput
                      style={[styles.input, styles.coordinateInput]}
                      placeholder="Longitude"
                      placeholderTextColor="#999"
                      value={incidentFormData.longitude}
                      onChangeText={(value) => handleIncidentInputChange('longitude', value)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.getLocationButton}
                    onPress={getCurrentLocation}
                  >
                    <Icon name="map-marker-alt" size={14} color="#fff" />
                    <Text style={styles.getLocationButtonText}>Get Current Location</Text>
                  </TouchableOpacity>
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

                {/* Images Upload Section */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Upload Images</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImagePicker}
                  >
                    <Icon name="camera" size={20} color="#11269C" />
                    <Text style={styles.uploadButtonText}>Select Images</Text>
                  </TouchableOpacity>
                  <Text style={styles.uploadHint}>Supported: JPG, PNG, GIF (Max 5MB each)</Text>
                </View>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <View style={styles.imagePreviewGrid}>
                    {uploadedImages.map((image) => (
                      <View key={image.id} style={styles.imagePreviewItem}>
                        <Image source={{ uri: image.preview }} style={styles.imagePreview} />
                        <View style={styles.imagePreviewOverlay}>
                          <TextInput
                            style={styles.imageCaptionInput}
                            placeholder="Caption"
                            placeholderTextColor="#999"
                            value={image.caption}
                            onChangeText={(text) => updateImageCaption(image.id, text)}
                          />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removeImage(image.id)}
                          >
                            <Icon name="times" size={12} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Documents Upload Section */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Supporting Documents</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleDocumentPicker}
                  >
                    <Icon name="paperclip" size={20} color="#11269C" />
                    <Text style={styles.uploadButtonText}>Select Documents</Text>
                  </TouchableOpacity>
                </View>

                {/* Document List */}
                {uploadedDocuments.length > 0 && (
                  <View style={styles.documentList}>
                    {uploadedDocuments.map((doc) => (
                      <View key={doc.id} style={styles.documentItem}>
                        <View style={styles.documentInfo}>
                          <Icon 
                            name={getDocumentIcon(doc.type)} 
                            size={16} 
                            color="#11269C" 
                          />
                          <View style={styles.documentDetails}>
                            <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                            <Text style={styles.documentSize}>{formatFileSize(doc.size)}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.removeDocumentButton}
                          onPress={() => removeDocument(doc.id)}
                        >
                          <Icon name="times" size={14} color="#E74C3C" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Affected Persons Section */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Affected Persons</Text>
                  
                  {affectedPersonsList.map((person, personIndex) => (
                    <View key={person.id} style={styles.personCard}>
                      <View style={styles.personHeader}>
                        <Text style={styles.personTitle}>
                          <Icon name="user" size={12} color="#11269C" /> Person {personIndex + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveAffectedPerson(personIndex)}
                        >
                          <Icon name="times" size={16} color="#E74C3C" />
                        </TouchableOpacity>
                      </View>

                      {/* Person Name */}
                      <TextInput
                        style={[styles.input, styles.personInput]}
                        placeholder="Full Name *"
                        placeholderTextColor="#999"
                        value={person.fullName}
                        onChangeText={(value) => handleAffectedPersonChange(personIndex, 'fullName', value)}
                      />

                      {/* Person Type Dropdown */}
                      <View style={styles.personRow}>
                        <TouchableOpacity
                          style={[styles.dropdownButton, styles.personTypeButton]}
                          onPress={() => {
                            setShowPersonTypeDropdown(personIndex);
                          }}
                        >
                          <Text style={person.personType ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                            {person.personType || 'Person Type *'}
                          </Text>
                          <Icon name="chevron-down" size={14} color="#666" />
                        </TouchableOpacity>

                        {/* Department Dropdown */}
                        <TouchableOpacity
                          style={[styles.dropdownButton, styles.personTypeButton]}
                          onPress={() => setShowDepartmentDropdown(personIndex)}
                        >
                          <Text style={person.department ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                            {person.department || 'Department'}
                          </Text>
                          <Icon name="chevron-down" size={14} color="#666" />
                        </TouchableOpacity>
                      </View>

                      {/* Person Type Dropdown Menu */}
                      {showPersonTypeDropdown === personIndex && renderDropdown(
                        true,
                        personTypeOptions,
                        (value) => {
                          handleAffectedPersonChange(personIndex, 'personType', value);
                          setShowPersonTypeDropdown(null);
                        },
                        () => setShowPersonTypeDropdown(null),
                        person.personType
                      )}

                      {/* Department Dropdown Menu */}
                      {showDepartmentDropdown === personIndex && renderDropdown(
                        true,
                        departmentOptions,
                        (value) => {
                          handleAffectedPersonChange(personIndex, 'department', value);
                          setShowDepartmentDropdown(null);
                        },
                        () => setShowDepartmentDropdown(null),
                        person.department
                      )}

                      {/* Outcome Description */}
                      <TextInput
                        style={[styles.input, styles.personInput]}
                        placeholder="Injury/Outcome"
                        placeholderTextColor="#999"
                        value={person.outcomeDescription}
                        onChangeText={(value) => handleAffectedPersonChange(personIndex, 'outcomeDescription', value)}
                      />

                      {/* Body Parts Section */}
                      <View style={styles.bodyPartsSection}>
                        <Text style={styles.bodyPartsLabel}>Affected Body Parts:</Text>
                        
                        {/* Selected Body Parts */}
                        <View style={styles.selectedBodyParts}>
                          {person.bodyParts.map((bodyPart) => (
                            <View key={bodyPart} style={styles.bodyPartTag}>
                              <Text style={styles.bodyPartTagText}>
                                {getBodyPartLabel(bodyPart)}
                              </Text>
                              <TouchableOpacity
                                onPress={() => handleRemoveBodyPartFromPerson(personIndex, bodyPart)}
                              >
                                <Icon name="times" size={10} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>

                        {/* Add Body Parts - Front View */}
                        <TouchableOpacity
                          style={styles.addBodyPartButton}
                          onPress={() => setShowBodyPartFrontDropdown(personIndex)}
                        >
                          <Text style={styles.addBodyPartButtonText}>+ Add Front Body Part</Text>
                        </TouchableOpacity>

                        {/* Front Body Parts Dropdown */}
                        {showBodyPartFrontDropdown === personIndex && renderDropdown(
                          true,
                          frontBodyParts,
                          (value) => {
                            handleAddBodyPartToPerson(personIndex, value);
                            setShowBodyPartFrontDropdown(null);
                          },
                          () => setShowBodyPartFrontDropdown(null),
                          [],
                          false
                        )}

                        {/* Add Body Parts - Back View */}
                        <TouchableOpacity
                          style={styles.addBodyPartButton}
                          onPress={() => setShowBodyPartBackDropdown(personIndex)}
                        >
                          <Text style={styles.addBodyPartButtonText}>+ Add Back Body Part</Text>
                        </TouchableOpacity>

                        {/* Back Body Parts Dropdown */}
                        {showBodyPartBackDropdown === personIndex && renderDropdown(
                          true,
                          backBodyParts,
                          (value) => {
                            handleAddBodyPartToPerson(personIndex, value);
                            setShowBodyPartBackDropdown(null);
                          },
                          () => setShowBodyPartBackDropdown(null),
                          [],
                          false
                        )}
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addPersonButton}
                    onPress={handleAddAffectedPerson}
                  >
                    <Icon name="plus" size={14} color="#11269C" />
                    <Text style={styles.addPersonButtonText}>Add Another Person</Text>
                  </TouchableOpacity>
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
                  onPress={resetForm}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleIncidentSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      {editingIncident ? 'Update Incident' : 'Submit Incident'}
                    </Text>
                  )}
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
          mode="datetime"
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
                    <Text style={styles.modalValue}>{selectedIncident.formattedDateTime}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedIncident.location}</Text>
                  </View>

                  {/* Coordinates */}
                  {selectedIncident.coordinates && selectedIncident.coordinates.latitude && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Coordinates:</Text>
                      <Text style={styles.modalValue}>
                        {selectedIncident.coordinates.latitude}, {selectedIncident.coordinates.longitude}
                      </Text>
                    </View>
                  )}

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

                  {/* Status Update Dropdown */}
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Update Status:</Text>
                    <View style={styles.statusUpdateContainer}>
                      {['Open', 'Investigating', 'Closed'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusOption,
                            selectedIncident.status === status && styles.statusOptionSelected,
                            getStatusStyle(status)
                          ]}
                          onPress={() => handleUpdateStatus(selectedIncident.incidentId, status)}
                        >
                          <Text style={[
                            styles.statusOptionText,
                            { color: getStatusStyle(status).color }
                          ]}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
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

                  {/* Images Display */}
                  {selectedIncident.images && selectedIncident.images.length > 0 && (
                    <View style={styles.modalImagesSection}>
                      <Text style={styles.modalSectionLabel}>Images:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedIncident.images.map((image) => (
                         <View style={styles.modalImageContainer}>
  {image.url || image.s_image_url ? (
    <Image 
      source={{ uri: image.url || image.s_image_url }} 
      style={styles.modalImage}
    />
  ) : (
    <View style={[styles.modalImage, styles.placeholderImage]}>
      <Icon name="image" size={30} color="#ccc" />
    </View>
  )}
</View>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Affected Persons Display */}
                  {selectedIncident.affectedPersons && selectedIncident.affectedPersons.length > 0 && (
                    <View style={styles.modalPersonsSection}>
                      <Text style={styles.modalSectionLabel}>Affected Persons:</Text>
                      {selectedIncident.affectedPersons.map((person) => (
                        <View key={person.id} style={styles.modalPersonCard}>
                          <Text style={styles.modalPersonName}>
                            <Icon name="user" size={12} color="#11269C" /> {person.name}
                          </Text>
                          <Text style={styles.modalPersonDetail}>Type: {person.type}</Text>
                          {person.department && (
                            <Text style={styles.modalPersonDetail}>Department: {person.department}</Text>
                          )}
                          {person.outcome && (
                            <Text style={styles.modalPersonDetail}>Outcome: {person.outcome}</Text>
                          )}
                          {person.bodyParts && person.bodyParts.length > 0 && (
                            <View style={styles.modalPersonBodyParts}>
                              <Text style={styles.modalPersonDetail}>Body Parts:</Text>
                              <View style={styles.modalBodyPartsList}>
                                {person.bodyParts.map((bodyPart) => (
                                  <View key={bodyPart} style={styles.modalBodyPartTag}>
                                    <Text style={styles.modalBodyPartText}>{getBodyPartLabel(bodyPart)}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      handleEditIncident(selectedIncident);
                    }}
                  >
                    <Icon name="edit" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Edit</Text>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  authErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authErrorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  authErrorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: '#11269c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  clearFiltersButton: {
    marginTop: 12,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#11269C',
    fontWeight: '600',
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
  coordinatesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  coordinateInput: {
    flex: 1,
  },
  getLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#11269C',
    padding: 12,
    borderRadius: 8,
  },
  getLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#11269C',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#11269C',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  imagePreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  imagePreviewItem: {
    width: (width - 64) / 2,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  imageCaptionInput: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 4,
    fontSize: 11,
    marginBottom: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentList: {
    marginTop: 8,
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  documentSize: {
    fontSize: 11,
    color: '#999',
  },
  removeDocumentButton: {
    padding: 8,
  },
  personCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11269C',
  },
  personInput: {
    marginBottom: 8,
  },
  personRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  personTypeButton: {
    flex: 1,
  },
  bodyPartsSection: {
    marginTop: 8,
  },
  bodyPartsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedBodyParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  bodyPartTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#11269C',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  bodyPartTagText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  addBodyPartButton: {
    backgroundColor: '#f0f3ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  addBodyPartButtonText: {
    fontSize: 12,
    color: '#11269C',
    fontWeight: '600',
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f3ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#11269C',
    borderStyle: 'dashed',
  },
  addPersonButtonText: {
    fontSize: 14,
    color: '#11269C',
    fontWeight: '600',
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
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 8,
  },
  modalImagesSection: {
    marginBottom: 12,
  },
  modalImageContainer: {
    marginRight: 8,
  },
  modalImage: {
    width: 100,
    height: 80,
    borderRadius: 6,
  },
  modalImageCaption: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  modalPersonsSection: {
    marginBottom: 12,
  },
  modalPersonCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  modalPersonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 4,
  },
  modalPersonDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  modalPersonBodyParts: {
    marginTop: 4,
  },
  modalBodyPartsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  modalBodyPartTag: {
    backgroundColor: '#11269C',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  modalBodyPartText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  statusUpdateContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    borderColor: '#11269C',
    borderWidth: 2,
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
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