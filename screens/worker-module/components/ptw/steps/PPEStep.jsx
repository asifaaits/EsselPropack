// src/components/ptw/steps/PPEStep.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../../../constants/colors';
import { stepStyles } from './StepStyles';

const ppeOptions = [
  { id: 'ppe1', value: 'cut_gloves', label: 'Cut Resistant Gloves' },
  { id: 'ppe2', value: 'safety_glasses', label: 'Safety Glasses' },
  { id: 'ppe3', value: 'goggles', label: 'Goggles' },
  { id: 'ppe4', value: 'hard_hat', label: 'Hard Hat' },
  { id: 'ppe5', value: 'ht_gloves', label: 'HT Gloves' },
  { id: 'ppe6', value: 'heat_jacket', label: 'Heat Jacket' },
  { id: 'ppe7', value: 'respirator', label: 'Respirator' },
  { id: 'ppe8', value: 'face_shield', label: 'Face Shield' },
  { id: 'ppe9', value: 'radiant_gloves', label: 'Radiant Gloves' },
  { id: 'ppe10', value: 'electrical_gloves', label: 'Electrical Gloves' },
  { id: 'ppe11', value: 'safety_shoes', label: 'Safety Shoes' },
  { id: 'ppe12', value: 'fall_protection', label: 'Fall Protection' },
  { id: 'ppe13', value: 'full_face', label: 'Full Face PPE' },
  { id: 'ppe14', value: 'safety_belt', label: 'Safety Belt' },
  { id: 'ppe15', value: 'gumboots', label: 'Gumboots' },
  { id: 'ppe16', value: 'ear_plugs', label: 'Ear Plugs' },
  { id: 'ppe17', value: 'dust_masks', label: 'Dust Masks' },
  { id: 'ppe18', value: 'half_face', label: 'Half Face' },
  { id: 'ppe19', value: 'supplied_air', label: 'Supplied Air' },
  { id: 'ppe20', value: 'safety_harness', label: 'Safety Harness' }
];

const PPEStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [localData, setLocalData] = useState({
    ppe: formData.ppe || [],
    ptwIssuer: formData.ptwIssuer || '',
    ppeVerifyTime: formData.ppeVerifyTime || '',
    ppeVerify: formData.ppeVerify || false,
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));
  const handleSwitchChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));

  const handlePPEChange = (value) => {
    setLocalData(prev => {
      const current = prev.ppe || [];
      return current.includes(value)
        ? { ...prev, ppe: current.filter(item => item !== value) }
        : { ...prev, ppe: [...current, value] };
    });
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && event.type === 'set') {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      handleInputChange('ppeVerifyTime', `${hours}:${minutes}`);
    }
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    if (!localData.ptwIssuer?.trim()) {
      Alert.alert('Validation Error', 'PTW Issuer Name is required');
      return;
    }

    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    onComplete({
      ppe: localData.ppe,
      ptwIssuer: localData.ptwIssuer,
      ppeVerifyTime: localData.ppeVerifyTime,
      ppeVerify: localData.ppeVerify,
    }, 'PPE selection completed');
  };

  const handleFocus = () => {
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 200, animated: true }), 100);
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>PPE Required</Text>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Selected PPE:</Text>
          <View style={stepStyles.viewTags}>
            {(localData.ppe || []).map((ppe, i) => {
              const opt = ppeOptions.find(o => o.value === ppe);
              return <Text key={i} style={stepStyles.viewTag}>{opt?.label || ppe}</Text>;
            })}
            {!localData.ppe?.length && <Text style={stepStyles.viewValue}>No PPE selected</Text>}
          </View>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>PTW Issuer:</Text>
          <Text style={stepStyles.viewValue}>{localData.ptwIssuer || 'N/A'}</Text>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Verification:</Text>
          <Text style={stepStyles.viewValue}>{localData.ppeVerify ? '✓ Verified' : '✗ Not Verified'}</Text>
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
          <Text style={stepStyles.stepHeaderTitle}>Personal Protective Equipment</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Contractor</Text></View>
        </View>

        <View style={stepStyles.infoBox}>
          <Icon name="shield" size={24} color={COLORS.info} />
          <Text style={stepStyles.infoBoxText}>Select all PPE that will be required for this job.</Text>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Select Required PPE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ppeOptions.map(option => (
                <TouchableOpacity key={option.id} style={{
                  width: '48%', padding: 10,
                  backgroundColor: localData.ppe?.includes(option.value) ? COLORS.primary + '20' : COLORS.grey[100],
                  borderRadius: 6, borderWidth: 1,
                  borderColor: localData.ppe?.includes(option.value) ? COLORS.primary : COLORS.grey[300],
                  flexDirection: 'row', alignItems: 'center',
                }} onPress={() => handlePPEChange(option.value)}>
                  <View style={{ marginRight: 6, width: 20 }}>
                    {localData.ppe?.includes(option.value) && <Icon name="check-circle" size={16} color={COLORS.primary} />}
                  </View>
                  <Text style={{ fontSize: 12, flex: 1, color: COLORS.grey[700] }} numberOfLines={1}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>PTW Issuer Name <Text style={stepStyles.required}>*</Text></Text>
            <TextInput style={stepStyles.input} value={localData.ptwIssuer}
              onChangeText={(v) => handleInputChange('ptwIssuer', v)}
              placeholder="Enter your name" placeholderTextColor={COLORS.grey[500]}
              onFocus={handleFocus} returnKeyType="done" />
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Verification Time</Text>
            <TouchableOpacity style={stepStyles.input} onPress={() => setShowTimePicker(true)}>
              <Text style={{ color: localData.ppeVerifyTime ? COLORS.grey[800] : COLORS.grey[500] }}>
                {localData.ppeVerifyTime || 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 16 }}>
            <Switch value={localData.ppeVerify} onValueChange={(v) => handleSwitchChange('ppeVerify', v)}
              trackColor={{ false: COLORS.grey[300], true: COLORS.success }} />
            <Text style={{ flex: 1, color: COLORS.grey[700] }}>✓ I verify that all equipment & PPE are safe for use</Text>
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 5 & Continue</Text>
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          <DateTimePicker value={new Date()} mode="time" is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PPEStep;