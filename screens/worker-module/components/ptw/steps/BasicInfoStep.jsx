// src/components/ptw/steps/BasicInfoStep.jsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../../../constants/colors';
import { stepStyles } from './StepStyles';

const BasicInfoStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [localData, setLocalData] = useState({
    permitDate: formData.permitDate || '',
    wcPolicyNo: formData.wcPolicyNo || '',
    wcExpDate: formData.wcExpDate || '',
    workmenCount: formData.workmenCount || '',
    actualPeople: formData.actualPeople || '',
    initiatorName: formData.initiatorName || '',
    departmentName: formData.departmentName || '',
    vendorFirm: formData.vendorFirm || '',
    contractorName: formData.contractorName || '',
    phoneNo: formData.phoneNo || '',
    serviceOrderReceived: formData.serviceOrderReceived || false,
    serviceOrderNo: formData.serviceOrderNo || '',
    workStartTime: formData.workStartTime || '',
    expectedCompletion: formData.expectedCompletion || '',
    safetyConfirm: formData.safetyConfirm || false,
  });

  const [showDatePicker, setShowDatePicker] = useState({ field: null, visible: false });
  const [showTimePicker, setShowTimePicker] = useState({ field: null, visible: false });
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));
  const handleSwitchChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker({ field: null, visible: false });
    if (selectedDate && event.type === 'set') {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      handleInputChange(showDatePicker.field, `${year}-${month}-${day}`);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker({ field: null, visible: false });
    if (selectedTime && event.type === 'set') {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      handleInputChange(showTimePicker.field, `${hours}:${minutes}`);
    }
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    const required = ['permitDate', 'workmenCount', 'actualPeople', 'initiatorName', 
      'departmentName', 'vendorFirm', 'contractorName', 'phoneNo', 'workStartTime', 'expectedCompletion'];
    
    const missing = required.filter(field => !localData[field] || localData[field].toString().trim() === '');
    if (missing.length > 0) {
      Alert.alert('Validation Error', `Please fill all required fields: ${missing.join(', ')}`);
      return;
    }
    if (!localData.safetyConfirm) {
      Alert.alert('Validation Error', 'You must confirm the safety statement');
      return;
    }

    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    onComplete(localData, 'Basic information completed');
  };

  const handleFocus = () => {
    setTimeout(() => {
      if (scrollViewRef.current) scrollViewRef.current.scrollTo({ y: 200, animated: true });
    }, 100);
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Basic Information</Text>
        {Object.entries({
          'Permit Date': localData.permitDate,
          'Initiator': localData.initiatorName,
          'Department': localData.departmentName,
          'Contractor': localData.contractorName,
          'Workmen Count': localData.workmenCount,
          'Start Time': localData.workStartTime,
        }).map(([label, value]) => (
          <View key={label} style={stepStyles.viewItem}>
            <Text style={stepStyles.viewLabel}>{label}:</Text>
            <Text style={stepStyles.viewValue}>{value || 'N/A'}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView ref={scrollViewRef} style={stepStyles.stepContainer}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={stepStyles.stepHeader}>
          <Text style={stepStyles.stepHeaderTitle}>Basic Information</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Supervisor</Text></View>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Permit Date <Text style={stepStyles.required}>*</Text></Text>
            <TouchableOpacity style={stepStyles.input} onPress={() => setShowDatePicker({ field: 'permitDate', visible: true })}>
              <Text style={{ color: localData.permitDate ? COLORS.grey[800] : COLORS.grey[500] }}>
                {localData.permitDate || 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput style={stepStyles.input} value={localData.wcPolicyNo} onChangeText={(v) => handleInputChange('wcPolicyNo', v)}
            placeholder="WC Policy No." placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />

          <TouchableOpacity style={stepStyles.input} onPress={() => setShowDatePicker({ field: 'wcExpDate', visible: true })}>
            <Text style={{ color: localData.wcExpDate ? COLORS.grey[800] : COLORS.grey[500] }}>
              {localData.wcExpDate || 'WC Expiry'}
            </Text>
          </TouchableOpacity>

          <TextInput style={stepStyles.input} value={localData.workmenCount} onChangeText={(v) => handleInputChange('workmenCount', v)}
            keyboardType="numeric" placeholder="Workmen Count *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          
          <TextInput style={stepStyles.input} value={localData.actualPeople} onChangeText={(v) => handleInputChange('actualPeople', v)}
            keyboardType="numeric" placeholder="Actual People *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          
          <TextInput style={stepStyles.input} value={localData.initiatorName} onChangeText={(v) => handleInputChange('initiatorName', v)}
            placeholder="Initiator Name *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          
          <TextInput style={stepStyles.input} value={localData.departmentName} onChangeText={(v) => handleInputChange('departmentName', v)}
            placeholder="Department Name *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          
          <TextInput style={stepStyles.input} value={localData.vendorFirm} onChangeText={(v) => handleInputChange('vendorFirm', v)}
            placeholder="Vendor Firm *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          
          <TextInput style={stepStyles.input} value={localData.contractorName} onChangeText={(v) => handleInputChange('contractorName', v)}
            placeholder="Contractor Name *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          
          <TextInput style={stepStyles.input} value={localData.phoneNo} onChangeText={(v) => handleInputChange('phoneNo', v)}
            keyboardType="phone-pad" placeholder="Phone Number *" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />

          {/* Service Order Received - Dark Blue */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }}>
            <Switch 
              value={localData.serviceOrderReceived} 
              onValueChange={(v) => handleSwitchChange('serviceOrderReceived', v)}
              trackColor={{ 
                false: COLORS.grey[300], 
                true: '#0820d9' // Dark blue when ON
              }}
              thumbColor={localData.serviceOrderReceived ? '#e6e7ea' : '#f4f3f4'}
            />
            <Text style={{ color: COLORS.grey[700], fontWeight: '500' }}>Service Order Received</Text>
          </View>

          {localData.serviceOrderReceived && (
            <TextInput style={stepStyles.input} value={localData.serviceOrderNo} onChangeText={(v) => handleInputChange('serviceOrderNo', v)}
              placeholder="Service Order No." placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          )}

          <TouchableOpacity style={stepStyles.input} onPress={() => setShowTimePicker({ field: 'workStartTime', visible: true })}>
            <Text style={{ color: localData.workStartTime ? COLORS.grey[800] : COLORS.grey[500] }}>
              {localData.workStartTime || 'Start Time *'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={stepStyles.input} onPress={() => setShowTimePicker({ field: 'expectedCompletion', visible: true })}>
            <Text style={{ color: localData.expectedCompletion ? COLORS.grey[800] : COLORS.grey[500] }}>
              {localData.expectedCompletion || 'End Time *'}
            </Text>
          </TouchableOpacity>

          <View style={[stepStyles.warningBox, { marginVertical: 16 }]}>
            <Icon name="shield-alert" size={24} color="#FF9800" /> {/* Orange icon */}
            <Text style={stepStyles.warningBoxText}>I confirm all workers adhere to safety guidelines and have appropriate PPE.</Text>
          </View>

          {/* Safety Confirmation - Orange */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Switch 
              value={localData.safetyConfirm} 
              onValueChange={(v) => handleSwitchChange('safetyConfirm', v)}
              trackColor={{ 
                false: COLORS.grey[300], 
                true: '#FF9800' // Orange when ON
              }}
              thumbColor={localData.safetyConfirm ? '#FFFFFF' : '#f4f3f4'}
            />
            <Text style={{ flex: 1, color: COLORS.grey[700], fontWeight: '500' }}>
              I confirm the above safety statement
            </Text>
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 1 & Continue</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker.visible && (
          <DateTimePicker value={new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
        )}
        {showTimePicker.visible && (
          <DateTimePicker value={new Date()} mode="time" is24Hour={true} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BasicInfoStep;