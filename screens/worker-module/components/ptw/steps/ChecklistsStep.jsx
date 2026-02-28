// src/components/ptw/steps/ChecklistsStep.jsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

const checklists = {
  lockout: [
    "Is power source isolated?",
    "Are lockout/tagout devices installed?",
    "Is isolation verified by testing?",
    "Are all energy sources identified?",
    "Is work area barricaded?"
  ],
  lineBreaking: [
    "Is line depressurized?",
    "Are blinds installed?",
    "Is chemical/gas content verified?",
    "Are MSDS available?",
    "Is emergency shower/eye wash accessible?"
  ],
  hotWork: [
    "Is hot work permit available?",
    "Is fire extinguisher available?",
    "Is area clear of combustibles?",
    "Is fire watch assigned?",
    "Are welding cables inspected?"
  ],
  confined: [
    "Is confined space permit available?",
    "Is gas test completed (O2, LEL, H2S)?",
    "Is ventilation adequate?",
    "Is rescue equipment available?",
    "Is attendant posted outside?"
  ],
  height: [
    "Is fall protection available?",
    "Is scaffold inspected?",
    "Is ladder secured?",
    "Is work area barricaded?",
    "Are tools secured with lanyards?"
  ]
};

const ChecklistsStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [checklistValues, setChecklistValues] = useState({});
  const scrollViewRef = useRef(null);

  const handleChecklistChange = (section, index, value) => {
    setChecklistValues(prev => ({
      ...prev,
      [`${section}_${index}`]: value,
    }));
  };

  const renderChecklist = (title, section, items) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 12 }}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, color: COLORS.grey[700] }}>{item}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {['yes', 'no', 'na'].map((option) => (
              <TouchableOpacity
                key={option}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => handleChecklistChange(section, index, option)}
                activeOpacity={0.7}
              >
                <View style={[stepStyles.radio, checklistValues[`${section}_${index}`] === option && stepStyles.radioSelected]} />
                <Text style={[stepStyles.radioLabel, { color: COLORS.grey[700] }]}>{option.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const handleComplete = () => {
    Keyboard.dismiss();
    
    const totalQuestions = Object.values(checklists).flat().length;
    const answeredQuestions = Object.keys(checklistValues).length;

    if (answeredQuestions < totalQuestions) {
      Alert.alert('Validation Error', 'Please complete all checklist items');
      return;
    }

    const hasNoResponses = Object.values(checklistValues).includes('no');

    const stepData = {
      checklists: checklistValues,
      hasNoResponses,
      requiresAttention: hasNoResponses,
    };

    onComplete(stepData, hasNoResponses ? 'Checklists completed with warnings' : 'All checklists completed');
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={stepStyles.viewOnlyTitle}>Safety Checklists</Text>
        <Text style={{ color: COLORS.grey[600] }}>Checklist data available after completion</Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView ref={scrollViewRef} style={stepStyles.stepContainer}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={stepStyles.stepHeader}>
          <Text style={stepStyles.stepHeaderTitle}>Safety Checklists</Text>
          <View style={stepStyles.stepRoleBadge}><Text style={stepStyles.stepRoleBadgeText}>Contractor</Text></View>
        </View>

        <View style={stepStyles.infoBox}>
          <Icon name="clipboard-check" size={24} color={COLORS.info} />
          <Text style={stepStyles.infoBoxText}>
            Complete all safety checklists. Mark "Yes" if compliant, "No" if not, or "N/A".
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          {renderChecklist('LOCKOUT / TAGOUT', 'lockout', checklists.lockout)}
          {renderChecklist('LINE BREAKING', 'lineBreaking', checklists.lineBreaking)}
          {renderChecklist('HOT WORK', 'hotWork', checklists.hotWork)}
          {renderChecklist('CONFINED SPACE', 'confined', checklists.confined)}
          {renderChecklist('HEIGHT WORK', 'height', checklists.height)}
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity style={stepStyles.completeButton} onPress={handleComplete}>
            <Text style={stepStyles.completeButtonText}>Complete Step 6 & Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChecklistsStep;