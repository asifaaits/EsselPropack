import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import StepHeader from './components/StepHeader';
import PrimaryButton from './components/PrimaryButton';
import { BodyOutline, SelectedHighlight } from './components/BodyOutline';
import { useIncident } from './context/IncidentContext';

const SVG_WIDTH = 300;
const SVG_HEIGHT = 390;

const BODY_PARTS_FRONT = [
  { id: 'head', label: 'Head', x: 150, y: 35, r: 28, view: 'front' },
  { id: 'neck', label: 'Neck', x: 150, y: 72, r: 12, view: 'front' },
  { id: 'left_shoulder', label: 'Left Shoulder', x: 110, y: 95, r: 18, view: 'front' },
  { id: 'right_shoulder', label: 'Right Shoulder', x: 190, y: 95, r: 18, view: 'front' },
  { id: 'chest', label: 'Chest', x: 150, y: 120, r: 30, view: 'front' },
  { id: 'left_arm', label: 'Left Arm', x: 82, y: 145, r: 16, view: 'front' },
  { id: 'right_arm', label: 'Right Arm', x: 218, y: 145, r: 16, view: 'front' },
  { id: 'abdomen', label: 'Abdomen', x: 150, y: 170, r: 25, view: 'front' },
  { id: 'left_hand', label: 'Left Hand', x: 68, y: 210, r: 14, view: 'front' },
  { id: 'right_hand', label: 'Right Hand', x: 232, y: 210, r: 14, view: 'front' },
  { id: 'left_thigh', label: 'Left Thigh', x: 128, y: 230, r: 20, view: 'front' },
  { id: 'right_thigh', label: 'Right Thigh', x: 172, y: 230, r: 20, view: 'front' },
  { id: 'left_knee', label: 'Left Knee', x: 128, y: 280, r: 14, view: 'front' },
  { id: 'right_knee', label: 'Right Knee', x: 172, y: 280, r: 14, view: 'front' },
  { id: 'left_shin', label: 'Left Shin', x: 128, y: 320, r: 16, view: 'front' },
  { id: 'right_shin', label: 'Right Shin', x: 172, y: 320, r: 16, view: 'front' },
  { id: 'left_foot', label: 'Left Foot', x: 125, y: 365, r: 14, view: 'front' },
  { id: 'right_foot', label: 'Right Foot', x: 175, y: 365, r: 14, view: 'front' },
];

const BODY_PARTS_BACK = [
  { id: 'head_back', label: 'Back of Head', x: 150, y: 35, r: 28, view: 'back' },
  { id: 'neck_back', label: 'Back of Neck', x: 150, y: 72, r: 12, view: 'back' },
  { id: 'left_shoulder_back', label: 'Left Shoulder', x: 110, y: 95, r: 18, view: 'back' },
  { id: 'right_shoulder_back', label: 'Right Shoulder', x: 190, y: 95, r: 18, view: 'back' },
  { id: 'upper_back', label: 'Upper Back', x: 150, y: 120, r: 30, view: 'back' },
  { id: 'left_arm_back', label: 'Left Arm', x: 82, y: 145, r: 16, view: 'back' },
  { id: 'right_arm_back', label: 'Right Arm', x: 218, y: 145, r: 16, view: 'back' },
  { id: 'lower_back', label: 'Lower Back', x: 150, y: 170, r: 25, view: 'back' },
  { id: 'left_hand_back', label: 'Left Hand', x: 68, y: 210, r: 14, view: 'back' },
  { id: 'right_hand_back', label: 'Right Hand', x: 232, y: 210, r: 14, view: 'back' },
  { id: 'left_glute', label: 'Left Hip', x: 128, y: 215, r: 18, view: 'back' },
  { id: 'right_glute', label: 'Right Hip', x: 172, y: 215, r: 18, view: 'back' },
  { id: 'left_hamstring', label: 'Left Hamstring', x: 128, y: 250, r: 18, view: 'back' },
  { id: 'right_hamstring', label: 'Right Hamstring', x: 172, y: 250, r: 18, view: 'back' },
  { id: 'left_calf', label: 'Left Calf', x: 128, y: 310, r: 16, view: 'back' },
  { id: 'right_calf', label: 'Right Calf', x: 172, y: 310, r: 16, view: 'back' },
  { id: 'left_heel', label: 'Left Heel', x: 125, y: 365, r: 14, view: 'back' },
  { id: 'right_heel', label: 'Right Heel', x: 175, y: 365, r: 14, view: 'back' },
];

// Combine all parts for easy lookup
const ALL_BODY_PARTS = [...BODY_PARTS_FRONT, ...BODY_PARTS_BACK];

const BodyMapScreen = ({ onNext, onBack }) => {
  const { incidentData, updateIncidentData } = useIncident();
  const [currentView, setCurrentView] = useState('front');
  const [selectedParts, setSelectedParts] = useState([]); // Array of part IDs
  const { width: screenWidth } = useWindowDimensions();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const badgeScaleAnim = useState(new Animated.Value(1))[0];

  // Load previously selected parts from context if available
  useEffect(() => {
    if (incidentData.bodyParts && incidentData.bodyParts.length > 0) {
      // Find the part IDs from the labels
      const partIds = [];
      incidentData.bodyParts.forEach(label => {
        const part = ALL_BODY_PARTS.find(p => p.label === label);
        if (part) {
          partIds.push(part.id);
        }
      });
      setSelectedParts(partIds);
    }

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate badge when selection changes
  useEffect(() => {
    if (selectedParts.length > 0) {
      Animated.sequence([
        Animated.timing(badgeScaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedParts.length]);

  const currentParts = currentView === 'front' ? BODY_PARTS_FRONT : BODY_PARTS_BACK;
  const selectedPartsData = ALL_BODY_PARTS.filter(p => selectedParts.includes(p.id));

  const displayWidth = Math.min(screenWidth - 40, 340);
  const scale = displayWidth / SVG_WIDTH;
  const displayHeight = SVG_HEIGHT * scale;

  const handleSelect = (partId) => {
    setSelectedParts(prev => {
      if (prev.includes(partId)) {
        // If already selected, remove it
        return prev.filter(id => id !== partId);
      } else {
        // If not selected, add it
        return [...prev, partId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedPartsData.length === 0) return;
    
    const selectedLabels = selectedPartsData.map(p => p.label);
    
    // Store in context
    updateIncidentData('bodyParts', selectedLabels);
    updateIncidentData('bodyPartsCount', selectedLabels.length);
    updateIncidentData('lastBodyView', currentView);
    
    onNext();
  };

  const clearAll = () => {
    setSelectedParts([]);
  };

  // Group selected parts by view for display
  const frontSelected = selectedPartsData.filter(p => p.view === 'front');
  const backSelected = selectedPartsData.filter(p => p.view === 'back');

  return (
    <View style={styles.container}>
      <StepHeader step={3} totalSteps={5} title="Injury Location" onBack={onBack} />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* View Toggle with enhanced design */}
          <View style={styles.toggleContainer}>
            <LinearGradient
              colors={['#f0f2f5', '#e8eaed']}
              style={styles.toggleRow}
            >
              <TouchableOpacity
                onPress={() => setCurrentView('front')}
                style={[styles.toggleBtn, currentView === 'front' && styles.toggleActive]}
                activeOpacity={0.7}
              >
                {currentView === 'front' ? (
                  <LinearGradient
                    colors={['#030e8b','#030e8b']}
                    style={styles.toggleGradient}
                  >
                    <Icon name="accessibility" size={18} color="#fff" />
                    <Text style={[styles.toggleText, styles.toggleTextActive]}>Front</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Icon name="accessibility" size={18} color="#666" />
                    <Text style={styles.toggleText}>Front</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setCurrentView('back')}
                style={[styles.toggleBtn, currentView === 'back' && styles.toggleActive]}
                activeOpacity={0.7}
              >
                {currentView === 'back' ? (
                  <LinearGradient
                    colors={['#030e8b', '#030e8b']}
                    style={styles.toggleGradient}
                  >
                    <Icon name="accessibility" size={18} color="#fff" />
                    <Text style={[styles.toggleText, styles.toggleTextActive]}>Back</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <Icon name="accessibility" size={18} color="#666" />
                    <Text style={styles.toggleText}>Back</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.bodyContainer}>
            <View style={styles.hintContainer}>
              <Icon name="touch-app" size={16} color='#030e8b' />
              <Text style={styles.bodyHint}>Tap multiple injured body parts</Text>
            </View>

            {/* Body SVG Container */}
            <View style={[styles.svgWrapper, { width: displayWidth, height: displayHeight }]}>
              <Svg width={displayWidth} height={displayHeight} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                <BodyOutline />
                {/* Show highlights for all selected parts that are visible in current view */}
                {selectedPartsData
                  .filter(p => p.view === currentView)
                  .map(part => (
                    <SelectedHighlight key={part.id} part={part} />
                  ))}
              </Svg>

              {/* Touchable areas for body parts */}
              {currentParts.map(part => {
                const touchSize = Math.max(part.r * 2 * scale, 36);
                const left = part.x * scale - touchSize / 2;
                const top = part.y * scale - touchSize / 2;
                const isSelected = selectedParts.includes(part.id);
                
                return (
                  <TouchableOpacity
                    key={part.id}
                    onPress={() => handleSelect(part.id)}
                    style={[
                      styles.touchableArea,
                      {
                        left,
                        top,
                        width: touchSize,
                        height: touchSize,
                        borderRadius: touchSize / 2,
                      }
                    ]}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>

            {/* Selection Summary */}
            {selectedPartsData.length > 0 ? (
              <Animated.View style={[styles.selectedInfo, { transform: [{ scale: badgeScaleAnim }] }]}>
                <LinearGradient
                  colors={['#030e8b', '#030e8b']}
                  style={styles.selectedBadge}
                >
                  <View style={styles.selectedBadgeIcon}>
                    <Icon name="checklist" size={18} color="#fff" />
                  </View>
                  <Text style={styles.selectedText}>
                    {selectedPartsData.length} {selectedPartsData.length === 1 ? 'Area' : 'Areas'} Selected
                  </Text>
                </LinearGradient>
                
                {/* Selected parts list */}
                <View style={styles.selectedList}>
                  {frontSelected.length > 0 && (
                    <View style={styles.viewGroup}>
                      <View style={styles.viewGroupHeader}>
                        <Icon name="arrow-forward" size={16} color='#030e8b'/>
                        <Text style={styles.viewGroupTitle}>Front View</Text>
                        <View style={styles.viewGroupCount}>
                          <Text style={styles.viewGroupCountText}>{frontSelected.length}</Text>
                        </View>
                      </View>
                      {frontSelected.map(part => (
                        <View key={part.id} style={styles.selectedListItem}>
                          <View style={styles.selectedListItemBullet} />
                          <Text style={styles.selectedListItemText}>{part.label}</Text>
                          <TouchableOpacity 
                            onPress={() => handleSelect(part.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Icon name="close" size={18} color="#ff4757" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {backSelected.length > 0 && (
                    <>
                      {frontSelected.length > 0 && <View style={styles.groupDivider} />}
                      <View style={styles.viewGroup}>
                        <View style={styles.viewGroupHeader}>
                          <Icon name="arrow-back" size={16} color='#030e8b' />
                          <Text style={styles.viewGroupTitle}>Back View</Text>
                          <View style={styles.viewGroupCount}>
                            <Text style={styles.viewGroupCountText}>{backSelected.length}</Text>
                          </View>
                        </View>
                        {backSelected.map(part => (
                          <View key={part.id} style={styles.selectedListItem}>
                            <View style={styles.selectedListItemBullet} />
                            <Text style={styles.selectedListItemText}>{part.label}</Text>
                            <TouchableOpacity 
                              onPress={() => handleSelect(part.id)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Icon name="close" size={18} color="#ff4757" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {selectedPartsData.length > 1 && (
                    <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                      <Icon name="delete-sweep" size={18} color="#ff4757" />
                      <Text style={styles.clearButtonText}>Clear All Selections</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Icon name="pan-tool" size={32} color='#030e8b' />
                </View>
                <Text style={styles.emptyStateTitle}>No Areas Selected</Text>
                <Text style={styles.emptyStateText}>
                  Tap on the body diagram to mark injured areas
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer with Continue Button */}
      <View style={styles.footer}>
        <PrimaryButton
          label={selectedPartsData.length > 0 ? `Continue (${selectedPartsData.length})` : 'Continue'}
          onPress={handleContinue}
          disabled={selectedPartsData.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Enhanced Toggle Styles
  toggleContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    width: '100%',
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#666',
    marginLeft: 4,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  // Body Container Styles
  bodyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    borderRadius: 20,
  },
  bodyHint: {
    fontSize: 14,
    color: '#030e8b',
    fontWeight: '500',
  },
  svgWrapper: {
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  touchableArea: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Selection Summary Styles
  selectedInfo: {
    width: '100%',
    marginTop: 24,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedBadgeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  selectedList: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  viewGroup: {
    marginBottom: 8,
  },
  viewGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  viewGroupTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#030e8b',
    marginLeft: 8,
    flex: 1,
  },
  viewGroupCount: {
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  viewGroupCountText: {
    fontSize: 12,
    color:'#030e8b',
    fontWeight: '600',
  },
  selectedListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedListItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#030e8b',
    marginRight: 10,
  },
  selectedListItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: '600',
  },
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 30,
  },
  emptyStateIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: '#f5f7fa',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});

export default BodyMapScreen;