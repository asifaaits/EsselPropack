// src/components/ptw/steps/SecurityVerificationStep.jsx
import React, { useState, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const SecurityVerificationStep = ({ 
  formData, setFormData, onComplete, canEdit, user,
  attendanceRows: parentAttendanceRows, setAttendanceRows: setParentAttendanceRows 
}) => {
  const [localData, setLocalData] = useState({
    securitySupervisor: formData.securitySupervisor || '',
    idCheck: formData.idCheck || [],
  });

  const [localAttendanceRows, setLocalAttendanceRows] = useState(
    parentAttendanceRows.length > 0 ? parentAttendanceRows : 
    [{ id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: '' }]
  );

  const [showTimePicker, setShowTimePicker] = useState({ visible: false, rowId: null, field: null });
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));
  
  const handleArrayChange = (field, value) => {
    setLocalData(prev => {
      const current = prev[field] || [];
      return current.includes(value)
        ? { ...prev, [field]: current.filter(item => item !== value) }
        : { ...prev, [field]: [...current, value] };
    });
  };

  const updateAttendanceRow = (id, field, value) => {
    setLocalAttendanceRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addAttendanceRow = () => {
    setLocalAttendanceRows(prev => [...prev, {
      id: Date.now(), type: 'S', name: '', in_am: '', out_am: '', in_pm: '', out_pm: '', tbt_verified: ''
    }]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const onTimeChange = (event, selectedTime) => {
    if (showTimePicker.rowId && showTimePicker.field && selectedTime && event.type === 'set') {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      updateAttendanceRow(showTimePicker.rowId, showTimePicker.field, `${hours}:${minutes}`);
    }
    setShowTimePicker({ visible: false, rowId: null, field: null });
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    if (!localData.securitySupervisor?.trim()) {
      Alert.alert('Validation Error', 'Security Supervisor Name is required');
      return;
    }
    if (!localData.idCheck?.length) {
      Alert.alert('Validation Error', 'Please verify at least one ID type');
      return;
    }
    const invalidRows = localAttendanceRows.filter(row => row.name?.trim() && !row.tbt_verified);
    if (invalidRows.length) {
      Alert.alert('Validation Error', 'Complete TBT verification for all workers with names');
      return;
    }

    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    setParentAttendanceRows(localAttendanceRows);
    onComplete({
      securitySupervisor: localData.securitySupervisor,
      idCheck: localData.idCheck,
      attendance: localAttendanceRows.filter(row => row.name?.trim()),
    }, 'Security verification completed');
  };

  const handleFocus = () => {
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 200, animated: true }), 100);
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Security Verification</Text>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Security Supervisor:</Text>
          <Text style={stepStyles.viewValue}>{localData.securitySupervisor || 'N/A'}</Text>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Verified IDs:</Text>
          <View style={stepStyles.viewTags}>
            {(localData.idCheck || []).map((id, i) => <Text key={i} style={stepStyles.viewTag}>{id}</Text>)}
          </View>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Attendance Count:</Text>
          <Text style={stepStyles.viewValue}>{localAttendanceRows.filter(r => r.name?.trim()).length} workers</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView ref={scrollViewRef} style={stepStyles.stepContainer}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 150 }}>
        
        <View style={stepStyles.stepHeader}>
          <Text style={stepStyles.stepHeaderTitle}>Security Verification</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Supervisor</Text></View>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Security Supervisor Name <Text style={stepStyles.required}>*</Text></Text>
            <TextInput style={stepStyles.input} value={localData.securitySupervisor}
              onChangeText={(v) => handleInputChange('securitySupervisor', v)}
              placeholder="Enter security supervisor name" placeholderTextColor={COLORS.grey[500]}
              onFocus={handleFocus} returnKeyType="next" />
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Work Crew Identity Check</Text>
            <View style={stepStyles.checkboxGrid}>
              {['National ID', 'Driving Licence', 'Company ID', 'Passport'].map(type => {
                const value = type.toLowerCase().replace(' ', '_');
                return (
                  <TouchableOpacity key={type} style={stepStyles.checkboxItem} onPress={() => handleArrayChange('idCheck', value)}>
                    <View style={[stepStyles.checkbox, localData.idCheck?.includes(value) && stepStyles.checkboxChecked]}>
                      {localData.idCheck?.includes(value) && <Icon name="check" size={16} color={COLORS.white} />}
                    </View>
                    <Text style={stepStyles.checkboxLabel}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>TBT Attendance Verification</Text>
            <View style={stepStyles.infoBox}>
              <Icon name="information" size={20} color={COLORS.info} />
              <Text style={stepStyles.infoBoxText}>Mark attendance for Supervisor (S) and Workmen (W)</Text>
            </View>

            {localAttendanceRows.map((row, index) => (
              <View key={row.id} style={{ marginBottom: 16, backgroundColor: COLORS.white, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grey[200] }}>
                <Text style={{ fontWeight: '600', marginBottom: 8, color: COLORS.grey[800] }}>Worker #{index + 1}</Text>
                
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {['S', 'W'].map(t => (
                    <TouchableOpacity key={t} style={{ flex: 1, padding: 10, backgroundColor: row.type === t ? COLORS.primary : COLORS.grey[200], borderRadius: 6 }}
                      onPress={() => updateAttendanceRow(row.id, 'type', t)}>
                      <Text style={{ color: row.type === t ? COLORS.white : COLORS.grey[700], textAlign: 'center' }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput style={[stepStyles.input, { marginBottom: 8 }]} value={row.name}
                  onChangeText={(v) => updateAttendanceRow(row.id, 'name', v)} placeholder="Name"
                  placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {['in_am', 'out_am'].map(f => (
                    <TouchableOpacity key={f} style={[stepStyles.input, { flex: 1 }]}
                      onPress={() => setShowTimePicker({ visible: true, rowId: row.id, field: f })}>
                      <Text style={{ color: row[f] ? COLORS.grey[800] : COLORS.grey[500] }}>
                        {row[f] || (f === 'in_am' ? 'In AM' : 'Out AM')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {['in_pm', 'out_pm'].map(f => (
                    <TouchableOpacity key={f} style={[stepStyles.input, { flex: 1 }]}
                      onPress={() => setShowTimePicker({ visible: true, rowId: row.id, field: f })}>
                      <Text style={{ color: row[f] ? COLORS.grey[800] : COLORS.grey[500] }}>
                        {row[f] || (f === 'in_pm' ? 'In PM' : 'Out PM')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ flex: 1, color: COLORS.grey[700] }}>TBT Verified:</Text>
                  <TouchableOpacity style={[
                    { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, minWidth: 60, alignItems: 'center' },
                    { backgroundColor: row.tbt_verified === 'yes' ? COLORS.success : row.tbt_verified === 'no' ? COLORS.danger : COLORS.grey[200] }
                  ]} onPress={() => {
                    const next = row.tbt_verified === 'yes' ? 'no' : row.tbt_verified === 'no' ? '' : 'yes';
                    updateAttendanceRow(row.id, 'tbt_verified', next);
                  }}>
                    <Text style={{ color: COLORS.white, textAlign: 'center', fontWeight: '600' }}>
                      {row.tbt_verified === 'yes' ? '✓' : row.tbt_verified === 'no' ? '✗' : '?'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={{ padding: 14, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
              onPress={addAttendanceRow}>
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>+ Add Worker</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 2 & Continue</Text>
          </TouchableOpacity>
        </View>

        {showTimePicker.visible && (
          <DateTimePicker value={new Date()} mode="time" is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SecurityVerificationStep;