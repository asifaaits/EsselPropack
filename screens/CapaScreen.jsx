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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const CapaScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [capas, setCapas] = useState([
    {
      id: 1,
      capaId: 'CAPA-2024-001',
      priority: 'High',
      title: 'Improve warehouse spill response procedures',
      source: 'Incident',
      date: '2024-02-15',
      status: 'Pending Action',
      description: 'Warehouse spill response procedures need improvement based on recent incident.',
      assignedTo: 'John Smith',
      dueDate: '2024-03-15',
    },
    {
      id: 2,
      capaId: 'CAPA-2024-002',
      priority: 'Medium',
      title: 'Forklift pedestrian safety enhancement',
      source: 'Incident',
      date: '2024-03-01',
      status: 'Pending Action',
      description: 'Implement additional safety measures for forklift pedestrian interactions.',
      assignedTo: 'Sarah Johnson',
      dueDate: '2024-04-01',
    },
    {
      id: 3,
      capaId: 'CAPA-2024-003',
      priority: 'High',
      title: 'Chemical handling PPE upgrade',
      source: 'Incident',
      date: '2024-02-01',
      status: 'In Verification',
      description: 'Upgrade PPE requirements for chemical handling operations.',
      assignedTo: 'Mike Chen',
      dueDate: '2024-03-20',
    },
    {
      id: 4,
      capaId: 'CAPA-2024-004',
      priority: 'Medium',
      title: 'Loading bay traffic management',
      source: 'Audit',
      date: '2024-01-30',
      status: 'Closed Effective',
      description: 'Implement traffic management system in loading bay area.',
      assignedTo: 'Lisa Park',
      dueDate: '2024-02-28',
    },
  ]);

  // Calculate statistics
  const stats = {
    total: capas.length,
    pending: capas.filter(c => c.status === 'Pending Action').length,
    verification: capas.filter(c => c.status === 'In Verification').length,
    closed: capas.filter(c => c.status === 'Closed Effective').length,
  };

  // Stats data with icons and colors
  const statsData = [
    {
      id: 1,
      title: 'Total CAPAs',
      value: stats.total,
      icon: 'clipboard-list',
      color: '#11269C',
      bgColor: 'rgba(17, 38, 156, 0.1)',
    },
    {
      id: 2,
      title: 'Pending Action',
      value: stats.pending,
      icon: 'clock',
      color: '#F39C12',
      bgColor: 'rgba(243, 156, 18, 0.1)',
    },
    {
      id: 3,
      title: 'In Verification',
      value: stats.verification,
      icon: 'check-circle',
      color: '#1e40af',
      bgColor: 'rgba(30, 64, 175, 0.1)',
    },
    {
      id: 4,
      title: 'Closed Effective',
      value: stats.closed,
      icon: 'check-double',
      color: '#166534',
      bgColor: 'rgba(22, 101, 52, 0.1)',
    },
  ];

  // Filter CAPAs
  const filteredCapas = capas.filter(capa => {
    const matchesSearch = capa.capaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capa.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || capa.priority.toLowerCase() === selectedPriority.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || capa.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewDetails = (capa) => {
    setSelectedCapa(capa);
    setShowDetailsModal(true);
  };

  const handleDeleteCapa = (id) => {
    // In a real app, you'd show a confirmation modal
    setCapas(prev => prev.filter(capa => capa.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return '#991b1b';
      case 'medium': return '#92400e';
      case 'low': return '#166534';
      default: return '#64748b';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return '#fee2e2';
      case 'medium': return '#fef3c7';
      case 'low': return '#dcfce7';
      default: return '#e2e8f0';
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending action': return '#92400e';
      case 'in verification': return '#1e40af';
      case 'closed effective': return '#166534';
      default: return '#64748b';
    }
  };

  const getStatusBgColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending action': return '#fef3c7';
      case 'in verification': return '#dbeafe';
      case 'closed effective': return '#dcfce7';
      default: return '#e2e8f0';
    }
  };

  const renderCapaItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.capaCard}
      activeOpacity={0.7}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.capaCardHeader}>
        <Text style={styles.capaId}>{item.capaId}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityBgColor(item.priority) }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
      </View>

      <Text style={styles.capaTitle} numberOfLines={2}>{item.title}</Text>

      <View style={styles.capaDetails}>
        <View style={styles.detailRow}>
          <Icon name="clipboard" size={12} color="#666" />
          <Text style={styles.detailLabel}>Source:</Text>
          <Text style={styles.detailValue}>{item.source}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={12} color="#666" />
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.capaCardFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewDetails(item)}
          >
            <Icon name="eye" size={14} color="#11269C" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {}}
          >
            <Icon name="edit" size={14} color="#11269C" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteCapa(item.id)}
          >
            <Icon name="trash" size={14} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDocumentItem = ({ item }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>{item.capaId}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityBgColor(item.priority) }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
      </View>
      
      <Text style={styles.documentSubtitle}>{item.title}</Text>
      
      <View style={styles.documentDetails}>
        <View style={styles.detailRow}>
          <Icon name="clipboard" size={12} color="#666" />
          <Text style={styles.detailLabel}>Source:</Text>
          <Text style={styles.detailValue}>{item.source}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={12} color="#666" />
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="tag" size={12} color="#666" />
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity style={[styles.docButton, styles.primaryButton]}>
          <Icon name="eye" size={14} color="#fff" />
          <Text style={styles.primaryButtonText}>View Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.docButton, styles.secondaryButton]}>
          <Icon name="download" size={14} color="#11269C" />
          <Text style={styles.secondaryButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#f0f0f4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CAPA</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main ScrollView */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
      >
        {/* Stats Cards - 2 Rows with Icons */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'register' && styles.activeTab]}
            onPress={() => setActiveTab('register')}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
              Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
            onPress={() => setActiveTab('documents')}
          >
            <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
              Documents
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={16} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search CAPA ID, Title or Source..."
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.filterRow}>
            {/* Priority Filter */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <Text style={styles.filterButtonText}>
                {selectedPriority === 'all' ? 'All Priorities' : selectedPriority}
              </Text>
              <Icon name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>

            {/* Status Filter */}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Text style={styles.filterButtonText}>
                {selectedStatus === 'all' ? 'All Status' : selectedStatus}
              </Text>
              <Icon name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Priority Dropdown */}
          {showPriorityDropdown && (
            <View style={styles.dropdown}>
              {['all', 'high', 'medium', 'low'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedPriority(priority);
                    setShowPriorityDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedPriority === priority && styles.dropdownItemSelected
                  ]}>
                    {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Status Dropdown */}
          {showStatusDropdown && (
            <View style={styles.dropdown}>
              {['all', 'pending action', 'in verification', 'closed effective'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedStatus(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedStatus === status && styles.dropdownItemSelected
                  ]}>
                    {status === 'all' ? 'All Status' : status.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content based on active tab */}
        {activeTab === 'register' ? (
          <View style={styles.contentContainer}>
            {filteredCapas.map((item) => renderCapaItem({ item }))}
            {filteredCapas.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="clipboard-list" size={50} color="#ccc" />
                <Text style={styles.emptyStateText}>No CAPAs found</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {filteredCapas.map((item) => renderDocumentItem({ item }))}
            {filteredCapas.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="file-alt" size={50} color="#ccc" />
                <Text style={styles.emptyStateText}>No documents found</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

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
              <Text style={styles.modalTitle}>CAPA Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedCapa && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>CAPA ID:</Text>
                    <Text style={styles.modalValue}>{selectedCapa.capaId}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Priority:</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityBgColor(selectedCapa.priority) }]}>
                      <Text style={[styles.priorityText, { color: getPriorityColor(selectedCapa.priority) }]}>
                        {selectedCapa.priority}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Title:</Text>
                    <Text style={styles.modalValue}>{selectedCapa.title}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Description:</Text>
                    <Text style={styles.modalValue}>{selectedCapa.description}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Source:</Text>
                    <Text style={styles.modalValue}>{selectedCapa.source}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Assigned To:</Text>
                    <Text style={styles.modalValue}>{selectedCapa.assignedTo}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedCapa.date).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Due Date:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedCapa.dueDate).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(selectedCapa.status) }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedCapa.status) }]}>
                        {selectedCapa.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]}>
                    <Icon name="check" size={16} color="#fff" />
                    <Text style={styles.modalButtonText}>Verify</Text>
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
    height:71,
    paddingTop:22,
    paddingVertical: 12,
    backgroundColor: '#061b78',
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
    color: '#faf6f6',
  },
  placeholder: {
    width: 40,
  },
  mainScrollView: {
    flex: 1,
  },
  // Updated stats styles - 2 rows with icons
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#f5f7fa',
  },
  statCard: {
    width: (width - 36) / 2, // 2 cards per row with gap
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#c0c1c4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    height: 90,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#051886',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  // Rest of the styles remain exactly the same
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#05215b',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#11269C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d0d0d',
  },
  activeTabText: {
    color: '#fff',
  },
  searchFilterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
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
  contentContainer: {
    padding: 16,
    gap: 12,
    backgroundColor: '#f5f7fa',
  },
  capaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  capaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capaId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11269C',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  capaTitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    lineHeight: 20,
  },
  capaDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    width: 45,
  },
  detailValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  capaCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    backgroundColor: '#f5f7fa',
    borderRadius: 6,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#11269C',
  },
  documentSubtitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
  },
  documentDetails: {
    marginBottom: 12,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  docButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#11269C',
  },
  secondaryButton: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#11269C',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#11269C',
    fontSize: 12,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalLabel: {
    width: 80,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  modalValue: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
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
    color: '#03105a',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CapaScreen;