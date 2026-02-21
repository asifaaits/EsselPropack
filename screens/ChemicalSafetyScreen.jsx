import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const ChemicalSafetyScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHazard, setSelectedHazard] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [showHazardDropdown, setShowHazardDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [chemicals, setChemicals] = useState([
    {
      id: 1,
      name: 'Acetone',
      casNo: '67-64-1',
      formula: 'C3H6O',
      hazard: 'Flammable',
      hazardIcon: 'fire',
      hazardColor: '#ff6b35',
      location: 'Lab-01',
      quantity: '20L',
      status: 'Active',
      expiryDate: '2024-12-31',
      ghsClass: 'Category 2',
    },
    {
      id: 2,
      name: 'Sulfuric Acid',
      casNo: '7664-93-9',
      formula: 'H2SO4',
      hazard: 'Corrosive',
      hazardIcon: 'exclamation-triangle',
      hazardColor: '#ff9800',
      location: 'Storage-03',
      quantity: '5L',
      status: 'Active',
      expiryDate: '2024-11-30',
      ghsClass: 'Category 1A',
    },
    {
      id: 3,
      name: 'Sodium Hydroxide',
      casNo: '1310-73-2',
      formula: 'NaOH',
      hazard: 'Corrosive',
      hazardIcon: 'exclamation-triangle',
      hazardColor: '#ff9800',
      location: 'Lab-02',
      quantity: '10kg',
      status: 'Expired',
      expiryDate: '2023-12-15',
      ghsClass: 'Category 1B',
    },
  ]);

  const [newChemical, setNewChemical] = useState({
    name: '',
    casNo: '',
    formula: '',
    physicalState: 'liquid',
    hazardClassification: [],
    signalWord: '',
    hazardStatements: '',
    ppeRequired: [],
    storageLocation: '',
    quantity: '',
    expiryDate: '',
    temperature: '',
    sdsFile: null,
    labelImage: null,
  });

  const navItems = [
    { id: 'register', label: 'Register', icon: 'file-alt' },
    { id: 'add', label: 'Add', icon: 'flask' },
    { id: 'qrcodes', label: 'QR Codes', icon: 'qrcode' },
    { id: 'scan', label: 'Scan', icon: 'camera' },
    { id: 'documents', label: 'SDS', icon: 'file-alt' },
  ];

  const hazardOptions = [
    { label: 'All Hazards', value: 'all' },
    { label: 'Flammable', value: 'flammable' },
    { label: 'Corrosive', value: 'corrosive' },
    { label: 'Toxic', value: 'toxic' },
    { label: 'Oxidizing', value: 'oxidizing' },
  ];

  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    { label: 'Lab-01', value: 'Lab-01' },
    { label: 'Lab-02', value: 'Lab-02' },
    { label: 'Storage-03', value: 'Storage-03' },
  ];

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
  ];

  const hazardClasses = ['Flammable', 'Toxic', 'Corrosive', 'Oxidizing', 'Explosive', 'Health Hazard'];
  const ppeItems = ['Gloves', 'Goggles', 'Lab Coat', 'Face Shield', 'Respirator', 'Safety Shoes'];

  const getHazardIcon = (hazard) => {
    switch (hazard?.toLowerCase()) {
      case 'flammable': return 'fire';
      case 'corrosive': return 'exclamation-triangle';
      case 'toxic': return 'skull-crossbones';
      case 'oxidizing': return 'bolt';
      case 'explosive': return 'bomb';
      default: return 'flask';
    }
  };

  const getHazardColor = (hazard) => {
    switch (hazard?.toLowerCase()) {
      case 'flammable': return '#ff6b35';
      case 'corrosive': return '#ff9800';
      case 'toxic': return '#9c27b0';
      case 'oxidizing': return '#2196f3';
      case 'explosive': return '#f44336';
      default: return '#666';
    }
  };

  const filteredChemicals = chemicals.filter(chem => {
    const matchesSearch = chem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chem.casNo.includes(searchTerm);
    const matchesHazard = selectedHazard === 'all' || chem.hazard.toLowerCase().includes(selectedHazard);
    const matchesLocation = selectedLocation === 'all' || chem.location === selectedLocation;
    const matchesStatus = selectedStatus === 'all' || chem.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesHazard && matchesLocation && matchesStatus;
  });

  const toggleHazardClassification = (hazard) => {
    setNewChemical(prev => ({
      ...prev,
      hazardClassification: prev.hazardClassification.includes(hazard)
        ? prev.hazardClassification.filter(item => item !== hazard)
        : [...prev.hazardClassification, hazard]
    }));
  };

  const togglePPE = (ppe) => {
    setNewChemical(prev => ({
      ...prev,
      ppeRequired: prev.ppeRequired.includes(ppe)
        ? prev.ppeRequired.filter(item => item !== ppe)
        : [...prev.ppeRequired, ppe]
    }));
  };

  const handleAddChemical = () => {
    if (!newChemical.name || !newChemical.casNo) {
      Alert.alert('Error', 'Please fill in required fields: Chemical Name and CAS Number');
      return;
    }

    const newChem = {
      id: chemicals.length + 1,
      name: newChemical.name,
      casNo: newChemical.casNo,
      formula: newChemical.formula,
      hazard: newChemical.hazardClassification[0] || 'Other',
      hazardIcon: getHazardIcon(newChemical.hazardClassification[0]),
      hazardColor: getHazardColor(newChemical.hazardClassification[0]),
      location: newChemical.storageLocation || 'Unassigned',
      quantity: newChemical.quantity || '0',
      status: 'Active',
      expiryDate: newChemical.expiryDate || new Date().toISOString().split('T')[0],
      ghsClass: newChemical.hazardClassification[0] || 'Not Classified',
    };

    setChemicals([...chemicals, newChem]);
    setNewChemical({
      name: '',
      casNo: '',
      formula: '',
      physicalState: 'liquid',
      hazardClassification: [],
      signalWord: '',
      hazardStatements: '',
      ppeRequired: [],
      storageLocation: '',
      quantity: '',
      expiryDate: '',
      temperature: '',
      sdsFile: null,
      labelImage: null,
    });
    setActiveTab('register');
    Alert.alert('Success', 'Chemical added successfully!');
  };

  const handleDeleteChemical = (id) => {
    Alert.alert(
      'Delete Chemical',
      'Are you sure you want to delete this chemical?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChemicals(chemicals.filter(chem => chem.id !== id));
            Alert.alert('Success', 'Chemical deleted successfully');
          },
        },
      ]
    );
  };

  const handleViewQR = (chemical) => {
    setSelectedChemical(chemical);
    setShowQRModal(true);
  };

  const handleScanQR = () => {
    Alert.alert('Scan QR', 'Camera functionality would open here');
  };

  // Dropdown Component
  const Dropdown = ({ visible, options, selected, onSelect, onClose }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.dropdownOverlay} onPress={onClose}>
        <View style={styles.dropdownContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  selected === option.value && styles.dropdownItemActive
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selected === option.value && styles.dropdownItemTextActive
                ]}>
                  {option.label}
                </Text>
                {selected === option.value && (
                  <Icon name="check" size={14} color="#11269C" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Chemical Card Component (Replaces Table)
  const ChemicalCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chemicalCard, item.status === 'Expired' && styles.expiredCard]}
      activeOpacity={0.7}
    >
      <View style={styles.chemicalCardHeader}>
        <View style={styles.chemicalTitleContainer}>
          <Text style={styles.chemicalCardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.chemicalCardFormula}>{item.formula}</Text>
        </View>
        <View style={[styles.hazardBadge, { backgroundColor: `${item.hazardColor}20` }]}>
          <Icon name={item.hazardIcon} size={14} color={item.hazardColor} />
          <Text style={[styles.hazardBadgeText, { color: item.hazardColor }]}>{item.hazard}</Text>
        </View>
      </View>

      <View style={styles.chemicalCardContent}>
        <View style={styles.chemicalCardRow}>
          <View style={styles.chemicalCardItem}>
            <Icon name="barcode" size={14} color="#666" />
            <Text style={styles.chemicalCardLabel}>CAS :</Text>
            <Text style={styles.chemicalCardValue}>{item.casNo}</Text>
          </View>
          <View style={styles.chemicalCardItem}>
            <Icon name="map-marker-alt" size={14} color="#666" />
            <Text style={styles.chemicalCardLabel}>Loc :</Text>
            <Text style={styles.chemicalCardValue}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.chemicalCardRow}>
          <View style={styles.chemicalCardItem}>
            <Icon name="flask" size={14} color="#666" />
            <Text style={styles.chemicalCardLabel}>Qty :</Text>
            <Text style={styles.chemicalCardValue}>{item.quantity}</Text>
          </View>
          <View style={styles.chemicalCardItem}>
            <Icon name="calendar-alt" size={14} color="#666" />
            <Text style={styles.chemicalCardLabel}>Exp :</Text>
            <Text style={[
              styles.chemicalCardValue,
              item.status === 'Expired' && styles.expiredText
            ]}>
              {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chemicalCardActions}>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.qrActionButton]}
          onPress={() => handleViewQR(item)}
        >
          <Icon name="qrcode" size={15} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cardActionButton, styles.viewActionButton]}>
          <Icon name="eye" size={15} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cardActionButton, styles.editActionButton]}>
          <Icon name="edit" size={15} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.deleteActionButton]}
          onPress={() => handleDeleteChemical(item.id)}
        >
          <Icon name="trash" size={15} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {item.status === 'Expired' && (
        <View style={styles.cardExpiredBadge}>
          <Text style={styles.cardExpiredText}>EXPIRED</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRegisterTab = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={16} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or CAS..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Filter Dropdowns */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowHazardDropdown(true)}
        >
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {hazardOptions.find(opt => opt.value === selectedHazard)?.label || 'Hazard'}
          </Text>
          <Icon name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowLocationDropdown(true)}
        >
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {locationOptions.find(opt => opt.value === selectedLocation)?.label || 'Location'}
          </Text>
          <Icon name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusDropdown(true)}
        >
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Status'}
          </Text>
          <Icon name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>
      </View>

      <Dropdown
        visible={showHazardDropdown}
        options={hazardOptions}
        selected={selectedHazard}
        onSelect={setSelectedHazard}
        onClose={() => setShowHazardDropdown(false)}
      />
      <Dropdown
        visible={showLocationDropdown}
        options={locationOptions}
        selected={selectedLocation}
        onSelect={setSelectedLocation}
        onClose={() => setShowLocationDropdown(false)}
      />
      <Dropdown
        visible={showStatusDropdown}
        options={statusOptions}
        selected={selectedStatus}
        onSelect={setSelectedStatus}
        onClose={() => setShowStatusDropdown(false)}
      />

      {/* Chemicals List */}
      <FlatList
        data={filteredChemicals}
        renderItem={({ item }) => <ChemicalCard item={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="flask" size={50} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No chemicals found</Text>
          </View>
        }
      />
    </View>
  );

  const renderAddTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.addTabContent}
    >
      <View style={styles.formCard}>
        {/* Basic Information */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              Chemical Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Acetone"
              placeholderTextColor="#9ca3af"
              value={newChemical.name}
              onChangeText={(text) => setNewChemical({...newChemical, name: text})}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              CAS Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., 67-64-1"
              placeholderTextColor="#9ca3af"
              value={newChemical.casNo}
              onChangeText={(text) => setNewChemical({...newChemical, casNo: text})}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>Formula</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., C3H6O"
                placeholderTextColor="#9ca3af"
                value={newChemical.formula}
                onChangeText={(text) => setNewChemical({...newChemical, formula: text})}
              />
            </View>
            
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>Physical State</Text>
              <View style={styles.radioGroup}>
                {['solid', 'liquid', 'gas'].map(state => (
                  <TouchableOpacity
                    key={state}
                    style={styles.radioOption}
                    onPress={() => setNewChemical({...newChemical, physicalState: state})}
                  >
                    <View style={[
                      styles.radioCircle,
                      newChemical.physicalState === state && styles.radioCircleSelected
                    ]}>
                      {newChemical.physicalState === state && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>
                      {state === 'solid' ? 'Solid' : state === 'liquid' ? 'Liquid' : 'Gas'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Hazard Information */}
        <View style={styles.formSection}>
          <View style={styles.hazardSectionTitle}>
            <Icon name="exclamation-triangle" size={18} color="#ff9800" />
            <Text style={styles.formSectionTitle}> Hazard Information</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Hazard Classification (GHS)</Text>
            <View style={styles.checkboxGrid}>
              {hazardClasses.map(hazard => (
                <TouchableOpacity
                  key={hazard}
                  style={styles.checkboxItem}
                  onPress={() => toggleHazardClassification(hazard)}
                >
                  <View style={[
                    styles.checkbox,
                    newChemical.hazardClassification.includes(hazard) && styles.checkboxChecked
                  ]}>
                    {newChemical.hazardClassification.includes(hazard) && (
                      <Icon name="check" size={10} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel} numberOfLines={1}>{hazard}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Signal Word</Text>
            <View style={styles.radioGroupHorizontal}>
              {['danger', 'warning'].map(word => (
                <TouchableOpacity
                  key={word}
                  style={styles.radioOption}
                  onPress={() => setNewChemical({...newChemical, signalWord: word})}
                >
                  <View style={[
                    styles.radioCircle,
                    newChemical.signalWord === word && styles.radioCircleSelected
                  ]}>
                    {newChemical.signalWord === word && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>
                    {word.charAt(0).toUpperCase() + word.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setNewChemical({...newChemical, signalWord: ''})}
              >
                <View style={[
                  styles.radioCircle,
                  newChemical.signalWord === '' && styles.radioCircleSelected
                ]}>
                  {newChemical.signalWord === '' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>None</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Hazard Statements</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Enter hazard statements (H-phrases)..."
              placeholderTextColor="#9ca3af"
              value={newChemical.hazardStatements}
              onChangeText={(text) => setNewChemical({...newChemical, hazardStatements: text})}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>PPE Required</Text>
            <View style={styles.checkboxGrid}>
              {ppeItems.map(ppe => (
                <TouchableOpacity
                  key={ppe}
                  style={styles.checkboxItem}
                  onPress={() => togglePPE(ppe)}
                >
                  <View style={[
                    styles.checkbox,
                    newChemical.ppeRequired.includes(ppe) && styles.checkboxChecked
                  ]}>
                    {newChemical.ppeRequired.includes(ppe) && (
                      <Icon name="check" size={10} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel} numberOfLines={1}>{ppe}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Storage & Handling */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Storage & Handling</Text>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>Storage Location</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Lab-01"
                placeholderTextColor="#9ca3af"
                value={newChemical.storageLocation}
                onChangeText={(text) => setNewChemical({...newChemical, storageLocation: text})}
              />
            </View>
            
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>Quantity</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 20L"
                placeholderTextColor="#9ca3af"
                value={newChemical.quantity}
                onChangeText={(text) => setNewChemical({...newChemical, quantity: text})}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>Expiry Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={newChemical.expiryDate}
                onChangeText={(text) => setNewChemical({...newChemical, expiryDate: text})}
              />
            </View>
            
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>Temperature</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 2-8°C"
                placeholderTextColor="#9ca3af"
                value={newChemical.temperature}
                onChangeText={(text) => setNewChemical({...newChemical, temperature: text})}
              />
            </View>
          </View>
        </View>

        {/* Documents */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Documents</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Upload SDS (PDF)</Text>
            <TouchableOpacity style={styles.fileUpload}>
              <Icon name="upload" size={24} color="#9ca3af" />
              <Text style={styles.fileUploadText}>Upload Safety Data Sheet</Text>
              <Text style={styles.fileUploadSubtext}>PDF files only</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Upload Label Image</Text>
            <TouchableOpacity style={styles.fileUpload}>
              <Icon name="upload" size={24} color="#9ca3af" />
              <Text style={styles.fileUploadText}>Upload chemical label</Text>
              <Text style={styles.fileUploadSubtext}>JPG, PNG, GIF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Actions */}
        <View style={styles.formActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => setActiveTab('register')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleAddChemical}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.saveButtonText}>Save & QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderQRCodesTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.qrTabContent}
    >
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>QR Code Generation</Text>
        
        <View style={styles.chemicalSelector}>
          <Text style={styles.selectorLabel}>Select Chemical:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.chemicalChipScroll}
          >
            {chemicals.map(chem => (
              <TouchableOpacity
                key={chem.id}
                style={[
                  styles.chemicalChip,
                  selectedChemical?.id === chem.id && styles.chemicalChipActive
                ]}
                onPress={() => setSelectedChemical(chem)}
              >
                <Text style={[
                  styles.chemicalChipText,
                  selectedChemical?.id === chem.id && styles.chemicalChipTextActive
                ]} numberOfLines={1}>
                  {chem.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedChemical ? (
          <>
            <View style={styles.selectedChemicalInfo}>
              <Text style={styles.selectedChemicalName}>{selectedChemical.name}</Text>
              <View style={styles.selectedChemicalDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CAS :</Text>
                  <Text style={styles.detailValue}>{selectedChemical.casNo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Formula :</Text>
                  <Text style={styles.detailValue}>{selectedChemical.formula}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hazard :</Text>
                  <View style={[styles.hazardBadge, { 
                    backgroundColor: `${selectedChemical.hazardColor}20`,
                    marginLeft: 0 
                  }]}>
                    <Icon name={selectedChemical.hazardIcon} size={12} color={selectedChemical.hazardColor} />
                    <Text style={[styles.hazardBadgeText, { color: selectedChemical.hazardColor }]}>
                      {selectedChemical.hazard}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location :</Text>
                  <Text style={styles.detailValue}>{selectedChemical.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity :</Text>
                  <Text style={styles.detailValue}>{selectedChemical.quantity}</Text>
                </View>
              </View>
            </View>

            <View style={styles.qrPreviewSection}>
              <View style={styles.qrPlaceholder}>
                <Icon name="qrcode" size={120} color="#09288e" />
                <Text style={styles.qrPreviewLabel}>QR Code Preview</Text>
              </View>

              <View style={styles.qrActionButtons}>
                <TouchableOpacity style={[styles.qrActionButton, styles.qrButtonPrimary]}>
                  <Icon name="download" alertsize={14} marginLeft="10" color="#fff" />
                  <Text style={styles.qrButtonText}>PNG</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.qrActionButton, styles.qrButtonSecondary]}>
                  <Icon name="download" size={14} marginLeft="10" color="#050505" />
                  <Text style={styles.qrButtonTextSecondary}>PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.qrActionButton, styles.qrButtonPrimary]}>
                  <Icon name="print" size={14} marginLeft="10" color="#fff" />
                  <Text style={styles.qrButtonText}>Print</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.qrActionButton, styles.qrButtonSecondary]}>
                  <Icon name="qrcode" size={14}  marginLeft="10" color="#0c0c0c" />
                  <Text style={styles.qrButtonTextSecondary}>New</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noChemicalSelected}>
            <Icon name="qrcode" size={50} color="#d1d5db" />
            <Text style={styles.noChemicalText}>Please select a chemical</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderScanTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.scanCard}>
        <View style={styles.cameraPlaceholder}>
          <Icon name="camera" size={50} color="#9ca3af" />
          <Text style={styles.cameraPlaceholderText}>Camera View</Text>
          <Text style={styles.cameraInstruction}>
            "Scan the QR code on chemical container"
          </Text>
        </View>
        
        <View style={styles.scanControls}>
          <TouchableOpacity style={styles.startScanButton} onPress={handleScanQR}>
            <Icon name="camera" size={18} color="#fff" />
            <Text style={styles.startScanText}>Start Scanning</Text>
          </TouchableOpacity>
          
          <View style={styles.manualEntryContainer}>
            <TextInput
              style={styles.manualEntryInput}
              placeholder="Enter QR code manually..."
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.manualEntryButton}>
              <Text style={styles.manualEntryButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDocumentsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.documentsTabContent}
    >
      <Text style={styles.documentsTitle}>SDS & Documents</Text>
      
      {chemicals.map(chem => (
        <TouchableOpacity key={chem.id} style={styles.documentCard}>
          <View style={styles.documentCardHeader}>
            <View style={styles.documentIconContainer}>
              <Icon name="file-pdf" size={30} color="#D32F2F" />
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>{chem.name}</Text>
              <Text style={styles.documentCas}>CAS : {chem.casNo}</Text>
              <View style={styles.documentHazard}>
                <Icon name={chem.hazardIcon} size={12} color={chem.hazardColor} />
                <Text style={[styles.documentHazardText, { color: chem.hazardColor }]}>
                  {chem.hazard}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.documentDetails}>
            <View style={styles.documentDetailItem}>
              <Icon name="map-marker-alt" size={12} color="#666" />
              <Text style={styles.documentDetailText}>Location : {chem.location}</Text>
            </View>
            <View style={styles.documentDetailItem}>
              <Icon name="calendar-alt" size={12} color="#666" />
              <Text style={[
                styles.documentDetailText,
                chem.status === 'Expired' && styles.expiredText
              ]}>
                Expiry : {new Date(chem.expiryDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.documentDetailItem}>
              <Icon name="flask" size={12} color="#666" />
              <Text style={styles.documentDetailText}>Quantity : {chem.quantity}</Text>
            </View>
          </View>

          <View style={styles.documentActions}>
            <TouchableOpacity style={[styles.docActionButton, styles.viewDocButton]}>
              <Icon name="eye" size={14} color="#fff" />
              <Text style={styles.docActionText}>View SDS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.docActionButton, styles.downloadDocButton]}>
              <Icon name="download" size={14} color="#0b0a0a" />
              <Text style={styles.docActionText2}>Download</Text>
            </TouchableOpacity>
          </View>

          {chem.status === 'Expired' && (
            <View style={styles.docExpiredBadge}>
              <Text style={styles.docExpiredText}>EXPIRED</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'register':
        return renderRegisterTab();
      case 'add':
        return renderAddTab();
      case 'qrcodes':
        return renderQRCodesTab();
      case 'scan':
        return renderScanTab();
      case 'documents':
        return renderDocumentsTab();
      default:
        return renderRegisterTab();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chemical Safety</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navBar}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navScrollContent}
          >
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  activeTab === item.id && styles.navItemActive
                ]}
                onPress={() => setActiveTab(item.id)}
              >
                <Icon 
                  name={item.icon} 
                  size={16} 
                  color={activeTab === item.id ? '#11269C' : '#6b7280'} 
                />
                <Text style={[
                  styles.navItemLabel,
                  activeTab === item.id && styles.navItemLabelActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        {renderTabContent()}

        {/* QR Code Modal */}
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>QR Code</Text>
                <TouchableOpacity onPress={() => setShowQRModal(false)}>
                  <Icon name="times" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {selectedChemical && (
                <View style={styles.modalBody}>
                  <View style={styles.modalQrPlaceholder}>
                    <Icon name="qrcode" size={150} color="#1976D2" />
                  </View>
                  <Text style={styles.modalChemicalName}>{selectedChemical.name}</Text>
                  <Text style={styles.modalChemicalCas}>CAS: {selectedChemical.casNo}</Text>
                  <Text style={styles.modalChemicalLocation}>Location: {selectedChemical.location}</Text>
                  
                  <View style={styles.modalQrActions}>
                    <TouchableOpacity style={[styles.modalQrButton, styles.modalQrButtonPrimary]}>
                      <Icon name="download" size={14} color="#fff" />
                      <Text style={styles.modalQrButtonText}>PNG</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalQrButton, styles.modalQrButtonSecondary]}>
                      <Icon name="download" size={14} color="#1976D2" />
                      <Text style={styles.modalQrButtonTextSecondary}>PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalQrButton, styles.modalQrButtonPrimary]}>
                      <Icon name="print" size={14} color="#fff" />
                      <Text style={styles.modalQrButtonText}>Print</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height:70,
    paddingTop:25,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#030578',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eef0f4',
  },
  headerRight: {
    width: 36,
  },
  navBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  navItemActive: {
    backgroundColor: '#eef2ff',
  },
  navItemLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 6,
  },
  navItemLabelActive: {
    color: '#11269C',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  addTabContent: {
    paddingBottom: 32,
  },
  qrTabContent: {
    paddingBottom: 32,
  },
  documentsTabContent: {
    paddingBottom: 32,
  },
  // Search & Filters
  searchContainer: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingLeft: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    marginRight: 4,
  },
  // Dropdown
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#eef2ff',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: '#11269C',
    fontWeight: '600',
  },
  // Chemical Card
  listContainer: {
    paddingBottom: 20,
  },
  chemicalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  expiredCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  chemicalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chemicalTitleContainer: {
    flex: 1,
  },
  chemicalCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  chemicalCardFormula: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8,
  },
  hazardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  chemicalCardContent: {
    marginBottom: 12,
  },
  chemicalCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chemicalCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chemicalCardLabel: {
    fontSize: 13,
    color: '#0a0a0b',
    marginLeft: 6,
    marginRight: 4,
  },
  chemicalCardValue: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  chemicalCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
   
  },
 
  cardExpiredBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#b50505',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardExpiredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  // Form Styles
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  formSectionTitle: {
    fontSize: 17,
    marginLeft:3,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 16,
  },
  hazardSectionTitle: {
    flexDirection: 'row',
    marginBottom: 16,
    marginLeft:2,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioGroupHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioCircleSelected: {
    borderColor: '#11269C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#11269C',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
    paddingRight: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#11269C',
    borderColor: '#11269C',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  fileUpload: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  fileUploadText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  fileUploadSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    height:45,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    height:45,
    backgroundColor: '#2e7d4f',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // QR Codes Tab
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 16,
  },
  chemicalSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  chemicalChipScroll: {
    flexGrow: 0,
  },
  chemicalChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chemicalChipActive: {
    backgroundColor: '#11269C',
    borderColor: '#11269C',
  },
  chemicalChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chemicalChipTextActive: {
    color: '#fff',
  },
  selectedChemicalInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  selectedChemicalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 8,
  },
  selectedChemicalDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    width: 65,
  },
  detailValue: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  qrPreviewSection: {
    alignItems: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    width: '100%',
    marginBottom: 16,
  },
  qrPreviewLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
  },
  qrActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  qrActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
    borderRadius:10,
    minWidth: 'calc(50% - 4px)',
  },
  qrButtonPrimary: {
    backgroundColor: '#0510ab',
  },
  qrButtonSecondary: {
    backgroundColor: '#dad5d5',
    borderWidth: 1,
    borderColor: '#e8edf2',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign:"center",
    fontWeight: '600',
    marginLeft: 6,
  },
  qrButtonTextSecondary: {
    color: '#0d0d0e',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
  noChemicalSelected: {
    alignItems: 'center',
    padding: 40,
  },
  noChemicalText: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 12,
  },
  // Scan Tab
  scanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cameraPlaceholder: {
    height: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  cameraPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
  },
  cameraInstruction: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  scanControls: {
    width: '100%',
  },
  startScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#051998',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  startScanText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualEntryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  manualEntryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  manualEntryButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
  },
  manualEntryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  // Documents Tab
  documentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11269C',
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  documentCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  documentCas: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  documentHazard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentHazardText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  documentDetails: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  documentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  documentDetailText: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 8,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  docActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  viewDocButton: {
    backgroundColor: '#040b94',
  },
  downloadDocButton: {
    backgroundColor: '#ebecef',
  },
  docActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
   docActionText2: {
    color: '#0b0b0b',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  docExpiredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  docExpiredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  expiredText: {
    color: '#dc2626',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11269C',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalQrPlaceholder: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalChemicalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalChemicalCas: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  modalChemicalLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  modalQrActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  modalQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  modalQrButtonPrimary: {
    backgroundColor: '#1976D2',
  },
  modalQrButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  modalQrButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalQrButtonTextSecondary: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ChemicalSafetyScreen;