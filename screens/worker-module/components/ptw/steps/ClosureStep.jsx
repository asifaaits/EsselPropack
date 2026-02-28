// src/components/ptw/steps/ClosureStep.jsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert,
  KeyboardAvoidingView, Platform, Keyboard, Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import SignatureScreen from 'react-native-signature-canvas';
import { stepStyles } from './StepStyles';
import { COLORS } from '../../../../constants/colors';

// Custom Signature Modal Component
const SignatureModal = ({ visible, onSave, onCancel }) => {
  const signatureRef = useRef();

  const handleSignature = (signature) => {
    onSave(signature);
  };

  const handleEmpty = () => {
    Alert.alert('Signature Required', 'Please provide your signature');
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const style = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      margin: 0;
      padding: 0;
    }
    .m-signature-pad--body {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin: 0;
      padding: 0;
    }
    .m-signature-pad--footer {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 10px;
    }
    .button {
      background-color: #11269C;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .button.clear {
      background-color: #6b7280;
    }
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: COLORS.white,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          height: '80%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: COLORS.primary,
            }}>
              Add Your Signature
            </Text>
            <TouchableOpacity onPress={onCancel} style={{ padding: 8 }}>
              <Icon name="close" size={24} color={COLORS.grey[600]} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              descriptionText="Sign above"
              clearText="Clear"
              confirmText="Save"
              webStyle={style}
              autoClear={false}
              imageType="image/png"
            />
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            gap: 10,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.grey[600],
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleClear}
            >
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleConfirm}
            >
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Updated Signature Pad Component
const SignaturePad = ({ onSave, disabled, signature }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSaveSignature = (sig) => {
    onSave(sig);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={{
          height: 150,
          borderWidth: 2,
          borderColor: signature ? COLORS.success : COLORS.grey[300],
          borderStyle: signature ? 'solid' : 'dashed',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: signature ? COLORS.success + '10' : COLORS.grey[100],
        }}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {signature ? (
          <>
            <Icon name="check-circle" size={48} color={COLORS.success} />
            <Text style={{ marginTop: 8, color: COLORS.success, fontWeight: '600' }}>
              Signature Added
            </Text>
            <Text style={{ marginTop: 4, color: COLORS.grey[600], fontSize: 12 }}>
              Tap to re-sign
            </Text>
          </>
        ) : (
          <>
            <Icon name="draw" size={48} color={COLORS.grey[500]} />
            <Text style={{ marginTop: 8, color: COLORS.grey[600] }}>
              Tap to add signature
            </Text>
          </>
        )}
      </TouchableOpacity>

      <SignatureModal
        visible={modalVisible}
        onSave={handleSaveSignature}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};

const ClosureStep = ({ formData, setFormData, onComplete, canEdit, user }) => {
  const [localData, setLocalData] = useState({
    permitStatus: formData.permitStatus || '',
    closureDate: formData.closureDate || '',
    closureTime: formData.closureTime || '',
    closureRemarks: formData.closureRemarks || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [signature, setSignature] = useState(formData.signature || null);
  const scrollViewRef = useRef(null);

  const handleInputChange = (field, value) => setLocalData(prev => ({ ...prev, [field]: value }));

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && event.type === 'set') {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      handleInputChange('closureDate', `${year}-${month}-${day}`);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && event.type === 'set') {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      handleInputChange('closureTime', `${hours}:${minutes}`);
    }
  };

  const handleComplete = () => {
    Keyboard.dismiss();
    
    if (!localData.permitStatus) {
      Alert.alert('Validation Error', 'Please select permit status (Extension or Closure)');
      return;
    }
    if (localData.permitStatus === 'closure' && (!localData.closureDate || !localData.closureTime)) {
      Alert.alert('Validation Error', 'Closure date and time are required');
      return;
    }
    if (!signature) {
      Alert.alert('Validation Error', 'Authorized signature is required');
      return;
    }

    const updatedData = { 
      ...formData, 
      ...localData, 
      signature: signature 
    };
    setFormData(updatedData);
    onComplete({
      permitStatus: localData.permitStatus,
      closureDate: localData.closureDate,
      closureTime: localData.closureTime,
      closureRemarks: localData.closureRemarks,
      signature: signature,
    }, localData.permitStatus === 'closure' ? 'Permit closed' : 'Extension requested');
  };

  if (!canEdit) {
    return (
      <ScrollView style={stepStyles.viewOnlyContainer} showsVerticalScrollIndicator={false}>
        <Text style={[stepStyles.viewOnlyTitle, { color: COLORS.grey[900] }]}>Permit Closure</Text>
        <View style={stepStyles.viewItem}>
          <Text style={[stepStyles.viewLabel, { color: COLORS.grey[800] }]}>Status:</Text>
          <Text style={[stepStyles.viewValue, { color: COLORS.grey[900] }]}>
            {localData.permitStatus === 'closure' ? 'CLOSED' : 
             localData.permitStatus === 'extension' ? 'EXTENSION' : 'N/A'}
          </Text>
        </View>
        {localData.closureDate && (
          <View style={stepStyles.viewItem}>
            <Text style={[stepStyles.viewLabel, { color: COLORS.grey[800] }]}>Closure Date:</Text>
            <Text style={[stepStyles.viewValue, { color: COLORS.grey[900] }]}>{localData.closureDate}</Text>
          </View>
        )}
        {signature && (
          <View style={[stepStyles.viewItem, { marginTop: 16 }]}>
            <Text style={[stepStyles.viewLabel, { color: COLORS.grey[800] }]}>Signature:</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
            }}>
              <Icon name="check-circle" size={20} color={COLORS.success} />
              <Text style={{ color: COLORS.grey[600], fontSize: 12 }}>Signed</Text>
            </View>
          </View>
        )}
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
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag" 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={stepStyles.stepHeader}>
          <Text style={[stepStyles.stepHeaderTitle, { color: COLORS.primary }]}>
            Permit Closure / Extension
          </Text>
          <View style={stepStyles.stepRoleBadge}>
            <Text style={stepStyles.stepRoleBadgeText}>Safety Officer</Text>
          </View>
        </View>

        <View style={stepStyles.infoBox}>
          <Icon name="alert" size={24} color={COLORS.info} />
          <Text style={[stepStyles.infoBoxText, { color: COLORS.grey[800] }]}>
            Complete this step to close the permit or request an extension.
          </Text>
        </View>

        <View style={stepStyles.formGrid}>
          <View style={stepStyles.inputGroup}>
            <Text style={[stepStyles.inputLabel, { marginBottom: 8, color: COLORS.grey[800] }]}>
              Permit Status <Text style={stepStyles.required}>*</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['extension', 'closure'].map(type => (
                <TouchableOpacity 
                  key={type} 
                  style={{
                    flex: 1, 
                    padding: 16, 
                    borderWidth: 2,
                    borderColor: localData.permitStatus === type ? 
                      (type === 'extension' ? COLORS.warning : COLORS.success) : COLORS.grey[300],
                    borderRadius: 12, 
                    alignItems: 'center',
                    backgroundColor: localData.permitStatus === type ? 
                      (type === 'extension' ? COLORS.warning + '10' : COLORS.success + '10') : COLORS.white,
                  }} 
                  onPress={() => handleInputChange('permitStatus', type)}
                >
                  <Icon 
                    name={type === 'extension' ? 'clock-outline' : 'check-circle'} 
                    size={28} 
                    color={localData.permitStatus === type ? 
                      (type === 'extension' ? COLORS.warning : COLORS.success) : COLORS.grey[600]} 
                  />
                  <Text style={{ 
                    marginTop: 8, 
                    fontWeight: '600',
                    color: localData.permitStatus === type ? 
                      (type === 'extension' ? COLORS.warning : COLORS.success) : COLORS.grey[600] 
                  }}>
                    {type === 'extension' ? 'Extension' : 'Closure'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {localData.permitStatus === 'closure' && (
            <>
              <View style={stepStyles.inputGroup}>
                <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
                  Closure Date <Text style={stepStyles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    stepStyles.input, 
                    { 
                      justifyContent: 'center',
                      borderColor: COLORS.grey[300],
                      borderWidth: 1,
                    }
                  ]} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ 
                    color: localData.closureDate ? COLORS.grey[900] : COLORS.grey[500],
                    fontSize: 14,
                  }}>
                    {localData.closureDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={stepStyles.inputGroup}>
                <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
                  Closure Time <Text style={stepStyles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    stepStyles.input, 
                    { 
                      justifyContent: 'center',
                      borderColor: COLORS.grey[300],
                      borderWidth: 1,
                    }
                  ]} 
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ 
                    color: localData.closureTime ? COLORS.grey[900] : COLORS.grey[500],
                    fontSize: 14,
                  }}>
                    {localData.closureTime || 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={stepStyles.inputGroup}>
            <Text style={[stepStyles.inputLabel, { marginBottom: 4, color: COLORS.grey[800] }]}>
              Remarks / Reason
            </Text>
            <TextInput 
              style={[
                stepStyles.input, 
                stepStyles.textArea, 
                { 
                  minHeight: 80,
                  borderColor: COLORS.grey[300],
                  borderWidth: 1,
                  color: COLORS.grey[900],
                  textAlignVertical: 'top',
                  padding: 12,
                }
              ]} 
              value={localData.closureRemarks}
              onChangeText={(v) => handleInputChange('closureRemarks', v)}
              placeholder={localData.permitStatus === 'closure' ? 'Enter closure details...' : 'Explain why extension is needed...'}
              placeholderTextColor={COLORS.grey[500]} 
              multiline 
              numberOfLines={3} 
            />
          </View>

          <View style={stepStyles.inputGroup}>
            <Text style={[stepStyles.inputLabel, { marginBottom: 8, color: COLORS.grey[800] }]}>
              Authorized Signature <Text style={stepStyles.required}>*</Text>
            </Text>
            <SignaturePad 
              onSave={(sig) => setSignature(sig)} 
              disabled={!canEdit}
              signature={signature}
            />
          </View>
        </View>

        <View style={stepStyles.stepActions}>
          <TouchableOpacity 
            style={[
              stepStyles.completeButton, 
              { 
                backgroundColor: localData.permitStatus === 'closure' ? COLORS.success : 
                  (localData.permitStatus === 'extension' ? COLORS.warning : COLORS.grey[400]),
              }
            ]} 
            onPress={handleComplete}
            disabled={!localData.permitStatus}
          >
            <Text style={stepStyles.completeButtonText}>
              {localData.permitStatus === 'closure' ? 'Close Permit' : 
               localData.permitStatus === 'extension' ? 'Request Extension' : 
               'Select Status First'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker 
            value={new Date()} 
            mode="date" 
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
            onChange={onDateChange} 
          />
        )}
        {showTimePicker && (
          <DateTimePicker 
            value={new Date()} 
            mode="time" 
            is24Hour={true} 
            display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
            onChange={onTimeChange} 
            style={{ backgroundColor: COLORS.white }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default ClosureStep;