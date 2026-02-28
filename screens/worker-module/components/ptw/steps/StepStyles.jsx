// src/components/ptw/steps/StepStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../../constants/colors';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export const stepStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.grey[100] },
  stepContainer: { flex: 1, padding: isSmallScreen ? 12 : 16 },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.grey[200],
    flexWrap: 'wrap',
  },
  stepHeaderTitle: { 
    fontSize: isSmallScreen ? 18 : 20, 
    fontWeight: '700', 
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  stepRoleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepRoleBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 12,
  },
  infoBoxText: { flex: 1, fontSize: 13, color: COLORS.grey[700] },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 12,
  },
  warningBoxText: { flex: 1, fontSize: 13, color: COLORS.grey[700], fontWeight: '500' },
  formGrid: { gap: isSmallScreen ? 12 : 16 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.grey[700], marginBottom: 6 },
  required: { color: COLORS.danger },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
    padding: isSmallScreen ? 10 : 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  
  // Responsive checkbox grid
  checkboxGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.grey[100],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    width: width < 400 ? '47%' : '48%',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkboxLabel: { fontSize: 12, color: COLORS.grey[800], flex: 1 },
  
  // Radio buttons
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  radioLabel: { fontSize: 13, color: COLORS.grey[700] },
  
  // Actions
  stepActions: { 
    marginTop: 20, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.grey[200] 
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: isSmallScreen ? 14 : 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  
  // View only
  viewOnlyContainer: { padding: isSmallScreen ? 12 : 16, backgroundColor: COLORS.white, borderRadius: 8 },
  viewOnlyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.primary, marginBottom: 12 },
  viewItem: { marginBottom: 10 },
  viewLabel: { fontSize: 11, color: COLORS.grey[600], marginBottom: 2 },
  viewValue: { fontSize: 13, color: COLORS.grey[800], fontWeight: '500' },
  viewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  viewTag: {
    backgroundColor: COLORS.grey[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    fontSize: 11,
    color: COLORS.grey[700],
  },
});