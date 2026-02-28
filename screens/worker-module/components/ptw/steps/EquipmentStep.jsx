// src/components/ptw/steps/EquipmentStep.jsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const equipmentOptions = [
  { id: 'eq1', value: 'three_phase', label: 'Three Phase Plug' },
  { id: 'eq2', value: 'extension', label: 'Extension Board' },
  { id: 'eq3', value: 'arc_welding', label: 'Arc Welding' },
  { id: 'eq4', value: 'gas_welding', label: 'Gas Welding' },
  { id: 'eq5', value: 'grinder', label: 'Grinder' },
  { id: 'eq6', value: 'single_phase', label: 'Single Phase Plug' },
  { id: 'eq7', value: 'cutter', label: 'Cutter' },
  { id: 'eq8', value: 'crowbar', label: 'Crowbar' },
  { id: 'eq9', value: 'axe', label: 'Axe' },
  { id: 'eq10', value: 'scythe', label: 'Scythe' },
  { id: 'eq11', value: 'scissor', label: 'Scissor' },
  { id: 'eq12', value: 'hoe', label: 'Hoe' },
  { id: 'eq13', value: 'strap', label: 'Strap' },
  { id: 'eq14', value: 'scissor_lift', label: 'Scissor Lift' },
  { id: 'eq15', value: 'crane', label: 'Crane' },
  { id: 'eq16', value: 'hydra', label: 'Hydra' },
  { id: 'eq17', value: 'farana', label: 'Farana' },
  { id: 'eq18', value: 'water_pump', label: 'Water Pump' },
  { id: 'eq19', value: 'forklift', label: 'Forklift' },
  { id: 'eq20', value: 'scaffolding', label: 'Scaffolding' },
  { id: 'eq21', value: 'ladder', label: 'Ladder' },
  { id: 'eq22', value: 'lockout_tagout', label: 'Lockout/Tagout' },
  { id: 'eq23', value: 'warning_signs', label: 'Warning Signs' },
  { id: 'eq24', value: 'oxygen_meter', label: 'Oxygen Meter' },
  { id: 'eq25', value: 'barricades', label: 'Barricades' },
  { id: 'eq26', value: 'barrier_tape', label: 'Barrier Tape' },
  { id: 'eq27', value: 'fire_powder', label: 'Fire Extinguisher' },
  { id: 'eq28', value: 'fire_co2', label: 'Fire Extinguisher CO2' },
  { id: 'eq29', value: 'multimeter', label: 'Multimeter' },
  { id: 'eq30', value: 'clamp_meter', label: 'Clamp Meter' }
];

const EquipmentStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [localData, setLocalData] = useState({ equipment: formData.equipment || [] });
  const scrollViewRef = useRef(null);

  const handleEquipmentChange = (value) => {
    setLocalData(prev => {
      const current = prev.equipment || [];
      return current.includes(value)
        ? { ...prev, equipment: current.filter(item => item !== value) }
        : { ...prev, equipment: [...current, value] };
    });
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    const updatedData = { ...formData, ...localData };
    setFormData(updatedData);
    onComplete({
      equipment: localData.equipment,
      equipmentCount: localData.equipment.length,
    }, 'Equipment selection completed');
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Equipment Required</Text>
        <View style={stepStyles.viewItem}>
          <Text style={stepStyles.viewLabel}>Selected Equipment:</Text>
          <View style={stepStyles.viewTags}>
            {(localData.equipment || []).map((eq, i) => {
              const opt = equipmentOptions.find(o => o.value === eq);
              return <Text key={i} style={stepStyles.viewTag}>{opt?.label || eq}</Text>;
            })}
            {!localData.equipment?.length && <Text style={stepStyles.viewValue}>No equipment selected</Text>}
          </View>
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
          <Text style={stepStyles.stepHeaderTitle}>Equipment Required</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Contractor</Text></View>
        </View>

        <View style={stepStyles.infoBox}>
          <Icon name="tools" size={24} color={COLORS.info} />
          <Text style={stepStyles.infoBoxText}>Select all equipment that will be used for this job.</Text>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={stepStyles.inputLabel}>Select Required Equipment</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {equipmentOptions.map(option => (
                <TouchableOpacity key={option.id} style={{
                  width: '48%', padding: 10,
                  backgroundColor: localData.equipment?.includes(option.value) ? COLORS.primary + '20' : COLORS.grey[100],
                  borderRadius: 6, borderWidth: 1,
                  borderColor: localData.equipment?.includes(option.value) ? COLORS.primary : COLORS.grey[300],
                  flexDirection: 'row', alignItems: 'center',
                }} onPress={() => handleEquipmentChange(option.value)}>
                  <View style={{ marginRight: 6, width: 20 }}>
                    {localData.equipment?.includes(option.value) && <Icon name="check-circle" size={16} color={COLORS.primary} />}
                  </View>
                  <Text style={{ fontSize: 12, flex: 1, color: COLORS.grey[700] }} numberOfLines={1}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 4 & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EquipmentStep;