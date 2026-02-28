// src/components/ptw/steps/TBTStep.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const tbtOptions = [
  { id: 'tbt1', value: 'wear_ppe', label: 'Wear full PPE' },
  { id: 'tbt2', value: 'barricade', label: 'Put barricade & warning tape' },
  { id: 'tbt3', value: 'report_injury', label: 'Report any injury or unsafe act' },
  { id: 'tbt4', value: 'extinguisher', label: 'Keep extinguisher nearby' },
  { id: 'tbt5', value: 'safe_tools', label: 'Use only safe tools' },
  { id: 'tbt6', value: 'fire_alarm', label: 'Know fire alarm point' },
  { id: 'tbt7', value: 'stop_work', label: 'Stop work if unsafe or alarm rings' },
  { id: 'tbt8', value: 'ask_doubt', label: 'In case of doubt, stop work and ask' },
  { id: 'tbt9', value: 'keep_clean', label: 'Keep area clean and tidy' },
  { id: 'tbt10', value: 'assembly_point', label: 'Know assembly point' },
  { id: 'tbt11', value: 'follow_supervisor', label: 'Follow supervisor\'s instructions' },
];

const TBTStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [localData, setLocalData] = useState({
    tbtContractor: formData.tbtContractor || '',
    tbtTime: formData.tbtTime || '',
    tbtConfirm: formData.tbtConfirm || false,
    tbt: formData.tbt || [],
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));
  const handleSwitchChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));

  const handleTBTChange = (value) => {
    setLocalData(prev => {
      const current = prev.tbt || [];
      return current.includes(value)
        ? { ...prev, tbt: current.filter(item => item !== value) }
        : { ...prev, tbt: [...current, value] };
    });
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && event.type === 'set') {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      handleInputChange('tbtTime', `${hours}:${minutes}`);
    }
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    
    if (!localData.tbtContractor?.trim()) {
      Alert.alert('Validation Error', 'Contractor name is required');
      return;
    }
    if (!localData.tbt?.length) {
      Alert.alert('Validation Error', 'Please select at least one TBT instruction');
      return;
    }
    if (!localData.tbtConfirm) {
      Alert.alert('Validation Error', 'Please confirm that you have delivered the TBT');
      return;
    }

    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    onComplete({
      tbt: localData.tbt,
      tbtContractor: localData.tbtContractor,
      tbtTime: localData.tbtTime,
      tbtConfirm: localData.tbtConfirm,
      topicsCovered: localData.tbt.length,
    }, 'Tool Box Talk completed');
  };

  const handleFocus = () => {
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 200, animated: true }), 100);
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Tool Box Talk</Text>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Topics Covered:</Text>
          <View style={stepStyles.viewTags}>
            {(localData.tbt || []).map((topic, i) => {
              const opt = tbtOptions.find(o => o.value === topic);
              return <Text key={i} style={stepStyles.viewTag}>{opt?.label || topic}</Text>;
            })}
          </View>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Contractor:</Text>
          <Text style={stepStyles.viewValue}>{localData.tbtContractor || 'N/A'}</Text>
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
          <Text style={stepStyles.stepHeaderTitle}>Tool Box Talk</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Contractor</Text></View>
        </View>

        <View style={stepStyles.infoBox}>
          <Icon name="account-group" size={24} color={COLORS.info} />
          <Text style={stepStyles.infoBoxText}>Deliver the Tool Box Talk and verify understanding.</Text>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Safety Instructions <Text style={stepStyles.required}>*</Text></Text>
            <View style={{ gap: 8 }}>
              {tbtOptions.map(option => (
                <TouchableOpacity key={option.id} style={{
                  flexDirection: 'row', alignItems: 'center', padding: 12,
                  backgroundColor: localData.tbt?.includes(option.value) ? COLORS.primary + '20' : COLORS.grey[100],
                  borderRadius: 8, borderWidth: 1,
                  borderColor: localData.tbt?.includes(option.value) ? COLORS.primary : COLORS.grey[300],
                }} onPress={() => handleTBTChange(option.value)}>
                  <View style={[stepStyles.checkbox, localData.tbt?.includes(option.value) && stepStyles.checkboxChecked]}>
                    {localData.tbt?.includes(option.value) && <Icon name="check" size={16} color={COLORS.white} />}
                  </View>
                  <Text style={{ marginLeft: 8, flex: 1, color: COLORS.grey[700] }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Contractor Name <Text style={stepStyles.required}>*</Text></Text>
            <TextInput style={stepStyles.input} value={localData.tbtContractor}
              onChangeText={(v) => handleInputChange('tbtContractor', v)}
              placeholder="Enter your name" placeholderTextColor={COLORS.grey[500]}
              onFocus={handleFocus} returnKeyType="next" />
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>TBT Delivery Time</Text>
            <TouchableOpacity style={stepStyles.input} onPress={() => setShowTimePicker(true)}>
              <Text style={{ color: localData.tbtTime ? COLORS.grey[800] : COLORS.grey[500] }}>
                {localData.tbtTime || 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 16 }}>
            <Switch value={localData.tbtConfirm} onValueChange={(v) => handleSwitchChange('tbtConfirm', v)}
              trackColor={{ false: COLORS.grey[300], true: COLORS.success }} />
            <Text style={{ flex: 1, color: COLORS.grey[700] }}>
              I confirm that I have delivered the TBT and verified effectiveness
            </Text>
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 8 & Continue</Text>
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

export default TBTStep;