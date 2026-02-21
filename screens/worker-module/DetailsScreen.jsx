import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import StepHeader from './components/StepHeader';
import PrimaryButton from './components/PrimaryButton';
import { useIncident } from './context/IncidentContext';

const INCIDENT_TYPES = [
  { id: 'slip', label: 'Slip / Trip / Fall', icon: 'warning', description: 'Loss of balance, falling from height' },
  { id: 'cut', label: 'Cut / Laceration', icon: 'content-cut', description: 'Open wound, bleeding, deep cut' },
  { id: 'burn', label: 'Burn / Scald', icon: 'whatshot', description: 'Thermal, chemical, or electrical burn' },
  { id: 'chemical', label: 'Chemical Exposure', icon: 'science', description: 'Skin contact, inhalation, ingestion' },
  { id: 'struck', label: 'Struck by Object', icon: 'construction', description: 'Hit by falling or moving object' },
  { id: 'caught', label: 'Caught in Machine', icon: 'precision-manufacturing', description: 'Entanglement, pinch points' },
  { id: 'electrical', label: 'Electrical Incident', icon: 'bolt', description: 'Shock, arc flash, electrocution' },
  { id: 'ergonomic', label: 'Ergonomic Injury', icon: 'accessibility', description: 'Repetitive strain, overexertion' },
  { id: 'vehicle', label: 'Vehicle Incident', icon: 'directions-car', description: 'Forklift, truck, mobile equipment' },
  { id: 'other', label: 'Other', icon: 'more-horiz', description: 'Any other type of incident' },
];

const SEVERITIES = [
  { key: 'low', label: 'Low', color: '#4CAF50', icon: 'check-circle' },
  { key: 'medium', label: 'Medium', color: '#FF9800', icon: 'warning' },
  { key: 'high', label: 'High', color: '#F44336', icon: 'error' },
];

const DetailsScreen = ({ onNext, onBack }) => {
  const { incidentData, updateIncidentData } = useIncident();
  const [type, setType] = useState(incidentData.incidentType);
  const [sev, setSev] = useState(incidentData.severity);
  const [desc, setDesc] = useState(incidentData.description || '');
  const [showTypes, setShowTypes] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Rotate arrow animation
    Animated.timing(rotateAnim, {
      toValue: showTypes ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showTypes]);

  const canProceed = !!type && !!sev;

  const handleContinue = () => {
    if (!canProceed) return;
    updateIncidentData('incidentType', type);
    updateIncidentData('severity', sev);
    updateIncidentData('description', desc);
    updateIncidentData('timestamp', new Date().toISOString());
    onNext();
  };

  const selectedTypeData = INCIDENT_TYPES.find(t => t.label === type);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StepHeader step={4} totalSteps={5} title="Incident Details" onBack={onBack} />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Enhanced Incident Type Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="category" size={18} color='#030e8b' />
              <Text style={styles.sectionLabel}>INCIDENT TYPE</Text>
              {type && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              onPress={() => setShowTypes(!showTypes)}
              style={[styles.dropdown, type && styles.dropdownActive]}
              activeOpacity={0.7}
            >
              {type ? (
                <View style={styles.dropdownSelected}>
                  <LinearGradient
                    colors={['#030e8b' , '#030e8b' ]}
                    style={styles.selectedIcon}
                  >
                    <Icon name={selectedTypeData?.icon || 'warning'} size={18} color="#fff" />
                  </LinearGradient>
                  <View style={styles.selectedTextContainer}>
                    <Text style={styles.dropdownText}>{type}</Text>
                    <Text style={styles.selectedDescription}>{selectedTypeData?.description}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.dropdownPlaceholder}>
                  <Icon name="search" size={20} color="#999" />
                  <Text style={styles.dropdownPlaceholderText}>Tap to select incident type</Text>
                </View>
              )}
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Icon name="expand-more" size={24} color={type ? '#030e8b'  : "#999"} />
              </Animated.View>
            </TouchableOpacity>

            {showTypes && (
              <View style={styles.typesList}>
                <LinearGradient
                  colors={['#ffffff', '#f8f9ff']}
                  style={styles.typesGradient}
                >
                  <Text style={styles.typesHeader}>Select Incident Type</Text>
                  {INCIDENT_TYPES.map(t => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => {
                        setType(t.label);
                        setShowTypes(false);
                      }}
                      style={[styles.typeItem, type === t.label && styles.typeItemActive]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.typeItemLeft}>
                        <View style={[styles.typeIcon, type === t.label && styles.typeIconActive]}>
                          <Icon 
                            name={t.icon} 
                            size={20} 
                            color={type === t.label ? "#fff" : '#030e8b' } 
                          />
                        </View>
                        <View style={styles.typeTextContainer}>
                          <Text style={[styles.typeItemText, type === t.label && styles.typeItemTextActive]}>
                            {t.label}
                          </Text>
                          <Text style={styles.typeDescription}>{t.description}</Text>
                        </View>
                      </View>
                      {type === t.label && (
                        <Icon name="check-circle" size={20} color='#030e8b' />
                      )}
                    </TouchableOpacity>
                  ))}
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Severity Section - KEPT EXACTLY THE SAME */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SEVERITY LEVEL</Text>
            
            <View style={styles.severityRow}>
              {SEVERITIES.map(s => (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSev(s.key)}
                  style={[
                    styles.severityBtn,
                    sev === s.key && { borderColor: s.color, backgroundColor: `${s.color}10` }
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon name={s.icon} size={24} color={s.color} />
                  <Text style={[styles.severityLabel, sev === s.key && { color: s.color, fontWeight: '600' }]}>
                    {s.label}
                  </Text>
                  {sev === s.key && (
                    <View style={[styles.severityCheck, { backgroundColor: s.color }]}>
                      <Icon name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Enhanced Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="description" size={18} color='#030e8b'  />
              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <Text style={styles.optionalText}>(Optional)</Text>
            </View>
            
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                value={desc}
                onChangeText={setDesc}
                placeholder="Briefly describe what happened..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              
              {/* Quick suggestion chips */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionChips}
                contentContainerStyle={styles.chipContainer}
              >
                {['Time', 'Location', 'Witnesses', 'Actions taken'].map((chip, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chip}
                    onPress={() => setDesc(prev => prev + (prev ? ' ' : '') + chip + ': ')}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.textAreaFooter}>
                <View style={styles.footerHint}>
                  <Icon name="info" size={14} color="#999" />
                  <Text style={styles.footerHintText}>Be specific for accurate reporting</Text>
                </View>
                <View style={styles.charCounter}>
                  <Text style={[styles.charCount, desc.length > 450 && styles.charCountWarning]}>
                    {desc.length}/500
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Summary Card */}
          <LinearGradient
            colors={['#ffffff', '#f8f9ff']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryHeader}>
              <Icon name="assignment" size={18} color='#030e8b'  />
              <Text style={styles.summaryTitle}>Report Summary</Text>
            </View>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>{type || 'Not selected'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Severity:</Text>
                <Text style={[
                  styles.summaryValue,
                  sev === 'high' && { color: '#F44336' },
                  sev === 'medium' && { color: '#FF9800' },
                  sev === 'low' && { color: '#4CAF50' },
                ]}>
                  {sev ? sev.charAt(0).toUpperCase() + sev.slice(1) : 'Not selected'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>

      {/* Enhanced Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
         
          <PrimaryButton
            label={canProceed ? "Review Report " : "Complete required fields"}
            onPress={handleContinue}
            disabled={!canProceed}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom:5,
    marginTop:5,
    letterSpacing: 0.5,
  },
  optionalText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  selectedBadge: {
    backgroundColor: '#e8eaf6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  selectedBadgeText: {
    fontSize: 10,
    color: '#030e8b' ,
    fontWeight: '500',
  },
  // Enhanced Dropdown Styles
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dropdownActive: {
    borderColor: '#030e8b' ,
    borderWidth: 1.5,
  },
  dropdownSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTextContainer: {
    flex: 1,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedDescription: {
    fontSize: 11,
    color: '#999',
  },
  dropdownPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownPlaceholderText: {
    fontSize: 15,
    color: '#999',
  },
  // Enhanced Types List
  typesList: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typesGradient: {
    padding: 12,
  },
  typesHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#030e8b' ,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  typeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconActive: {
    backgroundColor: '#030e8b' ,
  },
  typeTextContainer: {
    flex: 1,
  },
  typeItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  typeItemTextActive: {
    color: '#030e8b' ,
  },
  typeDescription: {
    fontSize: 11,
    color: '#999',
  },
  typeItemActive: {
    backgroundColor: '#f0f3ff',
  },
  // Severity Styles - KEPT EXACTLY THE SAME
  severityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  severityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  severityCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Enhanced TextArea Styles
  textAreaContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
  },
  suggestionChips: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  chipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipText: {
    fontSize: 12,
    color: '#1a237e',
    fontWeight: '500',
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerHintText: {
    fontSize: 11,
    color: '#999',
  },
  charCounter: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  charCountWarning: {
    color: '#F44336',
  },
  // Summary Card
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryContent: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  // Enhanced Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: '#f5f7fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerContent: {
    gap: 12,
  },
  // progressIndicator: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   gap: 8,
  // },
  // progressDot: {
  //   width: 8,
  //   height: 8,
  //   borderRadius: 4,
  //   backgroundColor: '#e0e0e0',
  // },
  // progressDotActive: {
  //   backgroundColor: '#030e8b' ,
  //   width: 20,
  // },
});

export default DetailsScreen;