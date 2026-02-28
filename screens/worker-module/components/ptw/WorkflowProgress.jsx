// src/components/ptw/WorkflowProgress.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';

const WorkflowProgress = ({ steps, percentage, onStepClick, compact = false }) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.compactPercentage}>{percentage}%</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepsIndicator}>
        {steps.map((step, index) => (
          <TouchableOpacity key={step.step} style={styles.stepIndicator} 
            onPress={() => onStepClick && onStepClick(step.step)}>
            <View style={[
              styles.stepMarker,
              step.completed && styles.stepMarkerCompleted,
              step.isCurrent && styles.stepMarkerCurrent,
              step.status === 'rejected' && styles.stepMarkerRejected,
            ]}>
              {step.completed ? (
                <Icon name="check" size={14} color={COLORS.white} />
              ) : (
                <Text style={[styles.stepMarkerText, step.isCurrent && styles.stepMarkerTextCurrent]}>
                  {step.step}
                </Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.stepConnector, step.completed && styles.stepConnectorCompleted]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressStats}>
        <Text style={styles.progressPercentage}><Text style={{ fontWeight: '700' }}>{percentage}%</Text> Complete</Text>
        <View style={styles.progressLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotCompleted]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotCurrent]} />
            <Text style={styles.legendText}>Current</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotPending]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, marginVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  stepsIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' },
  stepIndicator: { flex: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  stepMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.grey[200],
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.grey[200], zIndex: 2 },
  stepMarkerCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepMarkerCurrent: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, transform: [{ scale: 1.1 }] },
  stepMarkerRejected: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  stepMarkerText: { fontSize: 14, fontWeight: '600', color: COLORS.grey[600] },
  stepMarkerTextCurrent: { color: COLORS.white },
  stepConnector: { position: 'absolute', top: 18, left: 18, right: 0, height: 3, backgroundColor: COLORS.grey[200], zIndex: 1 },
  stepConnectorCompleted: { backgroundColor: COLORS.success },
  progressStats: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.grey[200] },
  progressPercentage: { fontSize: 14, color: COLORS.grey[700], marginBottom: 12 },
  progressLegend: { flexDirection: 'row', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendDotCompleted: { backgroundColor: COLORS.success },
  legendDotCurrent: { backgroundColor: COLORS.primary },
  legendDotPending: { backgroundColor: COLORS.grey[300], borderWidth: 1, borderColor: COLORS.grey[400] },
  legendText: { fontSize: 12, color: COLORS.grey[600] },
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 120 },
  progressBarContainer: { flex: 1, height: 6, backgroundColor: COLORS.grey[200], borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  compactPercentage: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
});

export default WorkflowProgress;