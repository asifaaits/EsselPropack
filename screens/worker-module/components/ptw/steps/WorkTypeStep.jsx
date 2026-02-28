// src/components/ptw/steps/WorkTypeStep.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const workTypeOptions = [
  { id: 'workHot', value: 'hot', label: 'Hot Work', icon: 'fire' },
  { id: 'workHeight', value: 'height', label: 'Work at Height', icon: 'ladder' },
  { id: 'workElectricalHT', value: 'electrical_ht', label: 'Electrical Work H.T.', icon: 'flash' },
  { id: 'workElectricalLT', value: 'electrical_lt', label: 'Electrical Work L.T.', icon: 'flash-outline' },
  { id: 'workElectricalShutdown', value: 'electrical_shutdown', label: 'Electrical Shutdown', icon: 'power-plug-off' },
  { id: 'workConfined', value: 'confined', label: 'Confined Space', icon: 'square-outline' },
  { id: 'workHazardous', value: 'hazardous', label: 'Hazardous Material', icon: 'biohazard' },
  { id: 'workLineBreaking', value: 'line_breaking', label: 'Line Breaking', icon: 'pipe' },
  { id: 'workMachineInstall', value: 'machine_install', label: 'Machine Installation', icon: 'cog' },
  { id: 'workPlumbing', value: 'plumbing', label: 'Plumbing', icon: 'pipe' },
  { id: 'workLifting', value: 'lifting', label: 'Lifting Operations', icon: 'crane' },
  { id: 'workService', value: 'service', label: 'Service/Repair', icon: 'wrench' },
  { id: 'workExcavation', value: 'excavation', label: 'Excavation', icon: 'excavator' },
  { id: 'workOther', value: 'other', label: 'Others', icon: 'dots-horizontal' }
];

const WorkTypeStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [localData, setLocalData] = useState({
    workType: formData.workType || [],
    otherWorkType: formData.otherWorkType || '',
    cancellationReason: formData.cancellationReason || '',
    workDescription: formData.workDescription || '',
    workLocation: formData.workLocation || '',
    safetyInstructions: formData.safetyInstructions || '',
  });

  const [showOtherWork, setShowOtherWork] = useState(localData.workType.includes('other'));
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));

  const handleWorkTypeChange = (value) => {
    setLocalData(prev => {
      const current = prev.workType || [];
      if (current.includes(value)) {
        if (value === 'other') setShowOtherWork(false);
        return { ...prev, workType: current.filter(item => item !== value) };
      } else {
        if (value === 'other') setShowOtherWork(true);
        return { ...prev, workType: [...current, value] };
      }
    });
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    if (!localData.workType?.length) {
      Alert.alert('Validation Error', 'Please select at least one work type');
      return;
    }
    if (localData.workType.includes('other') && !localData.otherWorkType) {
      Alert.alert('Validation Error', 'Please specify the other work type');
      return;
    }
    if (!localData.workDescription?.trim()) {
      Alert.alert('Validation Error', 'Work Description is required');
      return;
    }
    if (!localData.workLocation?.trim()) {
      Alert.alert('Validation Error', 'Work Location is required');
      return;
    }

    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    onComplete(localData, 'Work type and details completed');
  };

  const handleFocus = () => {
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 200, animated: true }), 100);
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Work Type Selection</Text>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Work Types:</Text>
          <View style={stepStyles.viewTags}>
            {(localData.workType || []).map((type, i) => {
              const opt = workTypeOptions.find(o => o.value === type);
              return <Text key={i} style={stepStyles.viewTag}>{opt?.label.split(' ').slice(1).join(' ') || type}</Text>;
            })}
          </View>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Description:</Text>
          <Text style={stepStyles.viewValue}>{localData.workDescription || 'N/A'}</Text>
        </View>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Location:</Text>
          <Text style={stepStyles.viewValue}>{localData.workLocation || 'N/A'}</Text>
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
          <Text style={stepStyles.stepHeaderTitle}>Work Type Selection</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Supervisor</Text></View>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Select Work Type <Text style={stepStyles.required}>*</Text></Text>
            <View style={{ gap: 8 }}>
              {workTypeOptions.map(option => (
                <TouchableOpacity key={option.id} style={{
                  flexDirection: 'row', alignItems: 'center', padding: 12,
                  backgroundColor: localData.workType?.includes(option.value) ? COLORS.primary + '20' : COLORS.grey[100],
                  borderRadius: 8, borderWidth: 1,
                  borderColor: localData.workType?.includes(option.value) ? COLORS.primary : COLORS.grey[300],
                }} onPress={() => handleWorkTypeChange(option.value)}>
                  <Icon name={option.icon} size={24} color={localData.workType?.includes(option.value) ? COLORS.primary : COLORS.grey[600]} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontWeight: '500', color: COLORS.grey[800] }}>{option.label}</Text>
                  </View>
                  {localData.workType?.includes(option.value) && <Icon name="check-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {showOtherWork && (
            <View style={stepStyles.inputGroup}>
              <Text style={stepStyles.inputLabel}>Specify Other Work Type</Text>
              <TextInput style={stepStyles.input} value={localData.otherWorkType}
                onChangeText={(v) => handleInputChange('otherWorkType', v)}
                placeholder="Describe the work type" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
            </View>
          )}

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Work Description <Text style={stepStyles.required}>*</Text></Text>
            <TextInput style={[stepStyles.input, stepStyles.textArea]} value={localData.workDescription}
              onChangeText={(v) => handleInputChange('workDescription', v)} multiline numberOfLines={4}
              placeholder="Detailed description of work" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Work Location <Text style={stepStyles.required}>*</Text></Text>
            <TextInput style={stepStyles.input} value={localData.workLocation}
              onChangeText={(v) => handleInputChange('workLocation', v)}
              placeholder="Exact location" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Specific Safety Instructions</Text>
            <TextInput style={[stepStyles.input, stepStyles.textArea]} value={localData.safetyInstructions}
              onChangeText={(v) => handleInputChange('safetyInstructions', v)} multiline numberOfLines={3}
              placeholder="Any specific safety procedures" placeholderTextColor={COLORS.grey[500]} onFocus={handleFocus} />
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 3 & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WorkTypeStep;