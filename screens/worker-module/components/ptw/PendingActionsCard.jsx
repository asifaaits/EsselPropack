// src/components/ptw/PendingActionsCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../constants/colors';
import { ROLES } from '../../../constants/roles';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const PendingActionsCard = ({ pendingPTWs, onSelectPTW, workflowService, userRole }) => {
  if (!pendingPTWs || pendingPTWs.length === 0) return null;

  // Get role-specific title
  const getRoleTitle = () => {
    switch(userRole) {
      case ROLES.SUPERVISOR:
        return 'Pending Your Action (Supervisor)';
      case ROLES.CONTRACTOR:
        return 'Pending Your Action (Contractor)';
      case ROLES.SAFETY_OFFICER:
        return 'Pending Your Action (Safety Officer)';
      default:
        return 'Pending Your Action';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="clock-alert" size={24} color={COLORS.warning} />
        <Text style={styles.headerText}>
          {getRoleTitle()} ({pendingPTWs.length})
        </Text>
      </View>

      <View style={styles.list}>
        {pendingPTWs.map((ptw) => {
          const summary = workflowService.getWorkflowSummary(ptw);
          return (
            <TouchableOpacity 
              key={ptw.id} 
              style={styles.item} 
              onPress={() => onSelectPTW(ptw)}
              activeOpacity={0.7}
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>
                  <Text style={styles.itemId}>{ptw.id}</Text>
                </Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {ptw.workDescription?.substring(0, 60)}
                  {ptw.workDescription?.length > 60 && '...'}
                </Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>
                    Step {summary.currentStep}: {summary.currentStepName}
                  </Text>
                  <Text style={styles.itemDetail}>
                    Location: {ptw.workLocation || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.itemAction}>
                <Text style={styles.actionButtonText}>Continue</Text>
                <Icon name="arrow-right" size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    backgroundColor: COLORS.warning + '20', 
    borderRadius: 12, 
    padding: isSmallScreen ? 12 : 16, 
    marginBottom: 20,
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.warning 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 16 
  },
  headerText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.grey[800],
    flex: 1,
  },
  list: { 
    gap: 12 
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderRadius: 8, 
    padding: isSmallScreen ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: { 
    flex: 1,
    marginRight: 8,
  },
  itemTitle: { 
    fontSize: 14, 
    color: COLORS.grey[800], 
    marginBottom: 4 
  },
  itemId: { 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  itemDescription: {
    fontSize: 13,
    color: COLORS.grey[600],
    marginBottom: 6,
  },
  itemDetails: { 
    flexDirection: 'row', 
    gap: 12, 
    flexWrap: 'wrap' 
  },
  itemDetail: { 
    fontSize: 11, 
    color: COLORS.grey[600],
    backgroundColor: COLORS.grey[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default PendingActionsCard;