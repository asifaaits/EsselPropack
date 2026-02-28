// src/components/ptw/steps/RiskAssessmentStep.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const RiskAssessmentStep = ({ 
  formData, setFormData, onComplete, canEdit, user,
  riskRows: parentRiskRows, setRiskRows: setParentRiskRows 
}) => {
  // Use a ref to store the actual data without causing re-renders
  const riskRowsRef = useRef(
    parentRiskRows.length > 0 ? parentRiskRows : [
      { id: Date.now(), description: '', status: 'open', responsible: '', mitigation: '' }
    ]
  );
  
  // State for dropdown
  const [showStatusDropdown, setShowStatusDropdown] = useState(null); // stores row id of open dropdown
  const [renderVersion, setRenderVersion] = useState(0);
  const [activeField, setActiveField] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const scrollViewRef = useRef(null);
  const fieldPositions = useRef({});
  const pendingUpdates = useRef({});

  // Status options
  const statusOptions = [
    { value: 'open', label: 'Open', color: COLORS.warning, bgColor: COLORS.warning + '20' },
    { value: 'mitigated', label: 'Mitigated', color: COLORS.info, bgColor: COLORS.info + '20' },
    { value: 'closed', label: 'Closed', color: COLORS.success, bgColor: COLORS.success + '20' },
  ];

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setActiveField(null);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Force re-render when rows are added/removed
  const forceRender = useCallback(() => {
    setRenderVersion(v => v + 1);
  }, []);

  const addRiskRow = useCallback(() => {
    riskRowsRef.current = [
      ...riskRowsRef.current,
      {
        id: Date.now(),
        description: '',
        status: 'open',
        responsible: '',
        mitigation: '',
      }
    ];
    forceRender();
    
    // Scroll to bottom after adding new row
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [forceRender]);

  const updateRiskRow = useCallback((id, field, value) => {
    // Update the ref directly without causing re-render
    const index = riskRowsRef.current.findIndex(row => row.id === id);
    if (index !== -1) {
      riskRowsRef.current[index] = {
        ...riskRowsRef.current[index],
        [field]: value
      };
    }
    // Force re-render to update the displayed status
    if (field === 'status') {
      forceRender();
    }
  }, [forceRender]);

  const removeRiskRow = useCallback((id) => {
    if (riskRowsRef.current.length > 1) {
      riskRowsRef.current = riskRowsRef.current.filter(row => row.id !== id);
      forceRender();
    } else {
      Alert.alert('Cannot Remove', 'At least one risk assessment row is required');
    }
  }, [forceRender]);

  const handleComplete = useCallback(() => {
    Keyboard.dismiss();
    
    const validRows = riskRowsRef.current.filter(row => row.description?.trim() && row.mitigation?.trim());
    if (validRows.length === 0) {
      Alert.alert('Validation Error', 'Please identify at least one risk and its mitigation');
      return;
    }

    // Update parent state only when completing
    setParentRiskRows([...riskRowsRef.current]);

    const stepData = {
      risks: riskRowsRef.current.filter(row => row.description?.trim()),
      totalRisks: riskRowsRef.current.filter(row => row.description?.trim()).length,
      openRisks: riskRowsRef.current.filter(row => row.status === 'open').length,
      mitigatedRisks: riskRowsRef.current.filter(row => row.status === 'mitigated').length,
      closedRisks: riskRowsRef.current.filter(row => row.status === 'closed').length,
    };

    onComplete(stepData, 'Risk assessment completed');
  }, [setParentRiskRows, onComplete]);

  const handleFocus = useCallback((fieldId, index) => {
    setActiveField(fieldId);
    setShowStatusDropdown(null); // Close dropdown when focusing on other fields
    
    // Calculate position - each row is about 450px
    const estimatedPosition = 100 + (index * 450);
    
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ 
          y: estimatedPosition, 
          animated: true 
        });
      }
    }, 100);
  }, []);

  const getStatusStyle = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return {
      backgroundColor: option?.bgColor || COLORS.grey[100],
      color: option?.color || COLORS.grey[700],
      label: option?.label || status.charAt(0).toUpperCase() + status.slice(1)
    };
  };

  // Use the ref data for rendering
  const currentRows = riskRowsRef.current;

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={[stepStyles.viewOnlyTitle, { color: COLORS.grey[900] }]}>Risk Assessment</Text>
        {parentRiskRows.map((row, index) => {
          const statusStyle = getStatusStyle(row.status);
          return (
            <View key={row.id} style={{ 
              marginBottom: 16, 
              padding: 12, 
              backgroundColor: COLORS.grey[100], 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: COLORS.grey[300]
            }}>
              <Text style={{ fontWeight: '600', marginBottom: 8, color: COLORS.primary }}>
                Risk #{index + 1}
              </Text>
              <Text style={{ marginBottom: 4, color: COLORS.grey[900] }}>
                <Text style={{ fontWeight: '600', color: COLORS.grey[900] }}>Description:</Text> {row.description || 'N/A'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', marginRight: 8, color: COLORS.grey[900] }}>Status:</Text>
                <View style={{ 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  borderRadius: 12,
                  backgroundColor: statusStyle.backgroundColor,
                }}>
                  <Text style={{ color: statusStyle.color, fontWeight: '600' }}>
                    {statusStyle.label}
                  </Text>
                </View>
              </View>
              <Text style={{ marginBottom: 4, color: COLORS.grey[900] }}>
                <Text style={{ fontWeight: '600', color: COLORS.grey[900] }}>Responsible:</Text> {row.responsible || 'N/A'}
              </Text>
              <Text style={{ color: COLORS.grey[900] }}>
                <Text style={{ fontWeight: '600', color: COLORS.grey[900] }}>Mitigation:</Text> {row.mitigation || 'N/A'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={stepStyles.stepContainer}
        showsVerticalScrollIndicator={true} 
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ 
          paddingBottom: keyboardVisible ? 250 : 100 
        }}
        scrollEventThrottle={16}
      >
        <View style={stepStyles.stepHeader}>
          <Text style={stepStyles.stepHeaderTitle}>Risk Assessment</Text>
          <View style={stepStyles.stepRoleBadge}>
            <Text style={stepStyles.stepRoleBadgeText}>Contractor</Text>
          </View>
        </View>

        <View style={stepStyles.infoBox}>
          <Icon name="alert" size={24} color={COLORS.info} />
          <Text style={[stepStyles.infoBoxText, { color: COLORS.grey[800] }]}>
            Identify all risks, assign responsibilities, and define mitigation measures.
          </Text>
        </View>

        <View style={stepStyles.formGrid}>
          {currentRows.map((row, index) => {
            const statusStyle = getStatusStyle(row.status);
            
            return (
              <View 
                key={row.id} 
                style={{ 
                  marginBottom: 24, 
                  backgroundColor: COLORS.white, 
                  padding: 16, 
                  borderRadius: 12, 
                  borderWidth: 2, 
                  borderColor: activeField?.includes(row.id.toString()) ? COLORS.primary : COLORS.grey[200],
                }}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.grey[200]
                }}>
                  <Text style={{ 
                    fontWeight: '700', 
                    fontSize: 16,
                    color: COLORS.primary 
                  }}>
                    Risk #{index + 1}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => removeRiskRow(row.id)} 
                    activeOpacity={0.7}
                    style={{ padding: 4 }}
                  >
                    <Icon name="delete" size={22} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
                    Risk Description
                  </Text>
                  <TextInput 
                    style={[
                      stepStyles.input, 
                      { 
                        minHeight: 60,
                        borderColor: activeField === `desc_${row.id}` ? COLORS.primary : COLORS.grey[300],
                        borderWidth: activeField === `desc_${row.id}` ? 2 : 1,
                        color: COLORS.grey[900], // Explicit text color for Android
                        textAlign: 'left',
                        textAlignVertical: 'top',
                        includeFontPadding: false, // Fix for Android
                        padding: Platform.OS === 'android' ? 12 : 8, // Adjust padding for Android
                      }
                    ]} 
                    defaultValue={row.description}
                    onChangeText={(v) => updateRiskRow(row.id, 'description', v)}
                    placeholder="Describe the risk in detail" 
                    placeholderTextColor={COLORS.grey[500]}
                    multiline 
                    numberOfLines={3}
                    textAlignVertical="top"
                    onFocus={() => handleFocus(`desc_${row.id}`, index)}
                    onBlur={() => setActiveField(null)}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
                    Risk Status
                  </Text>
                  
                  {/* Dropdown Button */}
                  <TouchableOpacity
                    style={[
                      stepStyles.input,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: statusStyle.backgroundColor,
                        borderColor: activeField === `status_${row.id}` ? COLORS.primary : statusStyle.color,
                        borderWidth: activeField === `status_${row.id}` ? 2 : 1,
                        minHeight: 48, // Ensure consistent height
                      }
                    ]}
                    onPress={() => {
                      setShowStatusDropdown(showStatusDropdown === row.id ? null : row.id);
                      setActiveField(`status_${row.id}`);
                    }}
                  >
                    <Text style={{ color: statusStyle.color, fontWeight: '600', fontSize: 14 }}>
                      {statusStyle.label}
                    </Text>
                    <Icon 
                      name={showStatusDropdown === row.id ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={statusStyle.color} 
                    />
                  </TouchableOpacity>

                  {/* Dropdown Modal */}
                  <Modal
                    visible={showStatusDropdown === row.id}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                      setShowStatusDropdown(null);
                      setActiveField(null);
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      activeOpacity={1}
                      onPress={() => {
                        setShowStatusDropdown(null);
                        setActiveField(null);
                      }}
                    >
                      <View style={{
                        backgroundColor: COLORS.white,
                        borderRadius: 12,
                        padding: 8,
                        width: '80%',
                        maxWidth: 300,
                      }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: COLORS.primary,
                          padding: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: COLORS.grey[200],
                        }}>
                          Select Risk Status
                        </Text>
                        
                        {statusOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: 16,
                              borderBottomWidth: 1,
                              borderBottomColor: COLORS.grey[100],
                              backgroundColor: row.status === option.value ? option.bgColor : 'transparent',
                            }}
                            onPress={() => {
                              updateRiskRow(row.id, 'status', option.value);
                              setShowStatusDropdown(null);
                              setActiveField(null);
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: option.color,
                              }} />
                              <Text style={{
                                fontSize: 15,
                                color: COLORS.grey[900], // Changed to dark color for visibility
                                fontWeight: row.status === option.value ? '600' : '400',
                              }}>
                                {option.label}
                              </Text>
                            </View>
                            {row.status === option.value && (
                              <Icon name="check" size={20} color={option.color} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
                    Responsible Person
                  </Text>
                  <TextInput 
                    style={[
                      stepStyles.input, 
                      { 
                        borderColor: activeField === `resp_${row.id}` ? COLORS.primary : COLORS.grey[300],
                        borderWidth: activeField === `resp_${row.id}` ? 2 : 1,
                        color: COLORS.grey[900], // Explicit text color
                        textAlign: 'left',
                        includeFontPadding: false,
                        padding: Platform.OS === 'android' ? 12 : 8,
                      }
                    ]} 
                    defaultValue={row.responsible}
                    onChangeText={(v) => updateRiskRow(row.id, 'responsible', v)}
                    placeholder="Name of responsible person" 
                    placeholderTextColor={COLORS.grey[500]} 
                    onFocus={() => handleFocus(`resp_${row.id}`, index)}
                    onBlur={() => setActiveField(null)}
                  />
                </View>

                <View>
                  <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
                    Mitigation Measures
                  </Text>
                  <TextInput 
                    style={[
                      stepStyles.input, 
                      stepStyles.textArea, 
                      { 
                        minHeight: 80,
                        borderColor: activeField === `mit_${row.id}` ? COLORS.primary : COLORS.grey[300],
                        borderWidth: activeField === `mit_${row.id}` ? 2 : 1,
                        color: COLORS.grey[900], // Explicit text color
                        textAlign: 'left',
                        textAlignVertical: 'top',
                        includeFontPadding: false,
                        padding: Platform.OS === 'android' ? 12 : 8,
                      }
                    ]} 
                    defaultValue={row.mitigation}
                    onChangeText={(v) => updateRiskRow(row.id, 'mitigation', v)}
                    placeholder="Describe mitigation measures" 
                    placeholderTextColor={COLORS.grey[500]}
                    multiline 
                    numberOfLines={4}
                    textAlignVertical="top"
                    onFocus={() => handleFocus(`mit_${row.id}`, index)}
                    onBlur={() => setActiveField(null)}
                  />
                </View>
              </View>
            );
          })}

          <TouchableOpacity 
            style={{ 
              padding: 16, 
              backgroundColor: COLORS.primary + '10', 
              borderRadius: 12, 
              alignItems: 'center',
              borderWidth: 2,
              borderColor: COLORS.primary,
              borderStyle: 'dashed',
              marginTop: 8,
            }}
            onPress={addRiskRow}
            activeOpacity={0.7}
          >
            <Icon name="plus" size={24} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontWeight: '600', marginTop: 4 }}>
              Add New Risk
            </Text>
          </TouchableOpacity>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity 
            style={stepStyles.completeButton} 
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={stepStyles.completeButtonText}>Complete Step 7 & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RiskAssessmentStep;