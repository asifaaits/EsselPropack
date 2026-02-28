// src/components/ptw/steps/AuthorizationStep.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const AuthorizationStep = ({ formData, setFormData, onComplete, onReject, canEdit, user }) => {
  const [localData, setLocalData] = useState({
    issuerAuthName: formData.issuerAuthName || '',
    issuerAuthDate: formData.issuerAuthDate || '',
    issuerAuthTime: formData.issuerAuthTime || '',
    approverName: formData.approverName || '',
    approverDate: formData.approverDate || '',
    approverTime: formData.approverTime || '',
    authorizerName: formData.authorizerName || '',
    authorizerDate: formData.authorizerDate || '',
    authorizerTime: formData.authorizerTime || '',
    workerName: formData.workerName || '',
    workerDate: formData.workerDate || '',
    workerAmPm: formData.workerAmPm || 'AM',
  });

  const [showDatePicker, setShowDatePicker] = useState({ visible: false, field: null });
  const [showTimePicker, setShowTimePicker] = useState({ visible: false, field: null });
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));

  const onDateChange = (event, selectedDate) => {
    if (selectedDate && showDatePicker.field && event.type === 'set') {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      handleInputChange(showDatePicker.field, `${year}-${month}-${day}`);
    }
    setShowDatePicker({ visible: false, field: null });
  };

  const onTimeChange = (event, selectedTime) => {
    if (selectedTime && showTimePicker.field && event.type === 'set') {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      handleInputChange(showTimePicker.field, `${hours}:${minutes}`);
    }
    setShowTimePicker({ visible: false, field: null });
  };

  const handleComplete = () => {
    Keyboard.dismiss();

    if (!localData.issuerAuthName?.trim()) {
      Alert.alert('Validation Error', 'Issuer authorization name is required');
      return;
    }
    if (!localData.approverName?.trim()) {
      Alert.alert('Validation Error', 'Approver name is required');
      return;
    }
    if (!localData.authorizerName?.trim()) {
      Alert.alert('Validation Error', 'Authorizer name is required');
      return;
    }

    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    onComplete({
      issuerAuth: { name: localData.issuerAuthName, date: localData.issuerAuthDate, time: localData.issuerAuthTime },
      approver: { name: localData.approverName, date: localData.approverDate, time: localData.approverTime },
      authorizer: { name: localData.authorizerName, date: localData.authorizerDate, time: localData.authorizerTime },
      workerConfirmation: { name: localData.workerName, date: localData.workerDate, session: localData.workerAmPm },
    }, 'Permit authorized successfully');
  };

  const handleFocus = () => {
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 200, animated: true }), 100);
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Authorization</Text>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Issuer:</Text>
          <Text style={stepStyles.viewValue}>{localData.issuerAuthName || 'N/A'}</Text>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Approver:</Text>
          <Text style={stepStyles.viewValue}>{localData.approverName || 'N/A'}</Text>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Authorizer:</Text>
          <Text style={stepStyles.viewValue}>{localData.authorizerName || 'N/A'}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView ref={scrollViewRef} style={stepStyles.stepContainer}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={stepStyles.stepHeader}>
          <Text style={stepStyles.stepHeaderTitle}>Authorization & Approvals</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Safety Officer</Text></View>
        </View>

        <View style={stepStyles.formGrid}>
          {/* Issuer Authorization */}
          <View style={{ marginBottom: 24, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 16 }}>
            <Text style={{ fontWeight: '600', color: COLORS.primary, marginBottom: 12 }}>📝 Issuer Authorization</Text>
            <TextInput style={[stepStyles.input, { marginBottom: 8 }]} value={localData.issuerAuthName}
              onChangeText={(v) => handleInputChange('issuerAuthName', v)}
              placeholder="Issuer Name" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowDatePicker({ visible: true, field: 'issuerAuthDate' })}>
                <Text style={{ color: localData.issuerAuthDate ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.issuerAuthDate || 'Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowTimePicker({ visible: true, field: 'issuerAuthTime' })}>
                <Text style={{ color: localData.issuerAuthTime ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.issuerAuthTime || 'Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Approver */}
          <View style={{ marginBottom: 24, borderWidth: 1, borderColor: COLORS.info, borderRadius: 8, padding: 16 }}>
            <Text style={{ fontWeight: '600', color: COLORS.info, marginBottom: 12 }}>✓ Approver (Section Head / HOD)</Text>
            <TextInput style={[stepStyles.input, { marginBottom: 8 }]} value={localData.approverName}
              onChangeText={(v) => handleInputChange('approverName', v)}
              placeholder="Approver Name" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowDatePicker({ visible: true, field: 'approverDate' })}>
                <Text style={{ color: localData.approverDate ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.approverDate || 'Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowTimePicker({ visible: true, field: 'approverTime' })}>
                <Text style={{ color: localData.approverTime ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.approverTime || 'Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Authorizer */}
          <View style={{ marginBottom: 24, borderWidth: 1, borderColor: COLORS.success, borderRadius: 8, padding: 16 }}>
            <Text style={{ fontWeight: '600', color: COLORS.success, marginBottom: 12 }}>⭐ Authorizer (Safety Manager / Unit Head)</Text>
            <TextInput style={[stepStyles.input, { marginBottom: 8 }]} value={localData.authorizerName}
              onChangeText={(v) => handleInputChange('authorizerName', v)}
              placeholder="Authorizer Name" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowDatePicker({ visible: true, field: 'authorizerDate' })}>
                <Text style={{ color: localData.authorizerDate ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.authorizerDate || 'Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowTimePicker({ visible: true, field: 'authorizerTime' })}>
                <Text style={{ color: localData.authorizerTime ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.authorizerTime || 'Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Worker Confirmation */}
          <View style={{ marginBottom: 24, borderWidth: 1, borderColor: COLORS.accent, borderRadius: 8, padding: 16 }}>
            <Text style={{ fontWeight: '600', color: COLORS.accent, marginBottom: 12 }}>👷 Worker Confirmation</Text>
            <TextInput style={[stepStyles.input, { marginBottom: 8 }]} value={localData.workerName}
              onChangeText={(v) => handleInputChange('workerName', v)}
              placeholder="Worker Name" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[stepStyles.input, { flex: 1 }]}
                onPress={() => setShowDatePicker({ visible: true, field: 'workerDate' })}>
                <Text style={{ color: localData.workerDate ? COLORS.grey[800] : COLORS.grey[500] }}>
                  {localData.workerDate || 'Date'}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                {['AM', 'PM'].map(period => (
                  <TouchableOpacity key={period} style={[stepStyles.input, { flex: 1, backgroundColor: localData.workerAmPm === period ? COLORS.primary + '20' : COLORS.white }]}
                    onPress={() => handleInputChange('workerAmPm', period)}>
                    <Text style={{ textAlign: 'center', color: COLORS.grey[700] }}>{period}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.danger, paddingVertical: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={onReject}>
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 2, backgroundColor: COLORS.success, paddingVertical: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleComplete}>
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>Authorize & Complete</Text>
            </TouchableOpacity>
          </View>
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

export default AuthorizationStep;