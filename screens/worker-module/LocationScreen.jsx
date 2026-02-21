import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import StepHeader from './components/StepHeader';
import PrimaryButton from './components/PrimaryButton';
import { useIncident } from './context/IncidentContext';

const LocationScreen = ({ onNext, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [coords, setCoords] = useState(null);
  const { incidentData, updateIncidentData } = useIncident();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentLocation();
    
    // Pulse animation for location marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation for content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      const status = await check(permission);
      
      if (status === RESULTS.DENIED) {
        const requestStatus = await request(permission);
        if (requestStatus !== RESULTS.GRANTED) {
          setError('Location permission denied');
          setUseManual(true);
          setLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(location);
          updateIncidentData('location', location);
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setUseManual(true);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      setError('Failed to get location');
      setUseManual(true);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (useManual && manualInput.trim()) {
      updateIncidentData('manualLocation', manualInput.trim());
      onNext();
    } else if (coords) {
      onNext();
    }
  };

  const canProceed = useManual ? manualInput.trim().length > 0 : !!coords;

  return (
    <View style={styles.container}>
      <StepHeader step={2} totalSteps={5} title="Incident Location" onBack={onBack} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {loading ? (
            <View style={styles.loadingContainer}>
              {/* Removed animation from loading icon */}
              <View style={styles.loadingIcon}>
                <LinearGradient
                  colors={['#030e8b', '#030e8b']}
                  style={styles.loadingGradient}
                >
                  <Icon name="location-on" size={48} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.loadingTitle}>Detecting Location</Text>
              <Text style={styles.loadingText}>
                Please wait while we get your current position...
              </Text>
              <ActivityIndicator size="large" color='#030e8b' style={styles.spinner} />
            </View>
          ) : useManual ? (
            <View style={styles.manualSection}>
              <LinearGradient
                colors={['#030e8b','#030e8b' ]}
                style={styles.infoCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.infoIconContainer}>
                  <Icon name="location-off" size={32} color="#fff" />
                </View>
                <Text style={styles.infoTitle}>GPS Unavailable</Text>
                <Text style={styles.infoDesc}>
                  {error || 'Please enter the incident location manually'}
                </Text>
              </LinearGradient>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Location Details</Text>
                <View style={styles.inputContainer}>
                  <Icon name="place" size={20} color='#030e8b' style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={manualInput}
                    onChangeText={setManualInput}
                    placeholder="e.g., Building A, Floor 2, Assembly Line 3"
                    placeholderTextColor="#999"
                    multiline
                  />
                </View>
                <Text style={styles.inputHint}>
                  Be as specific as possible for accurate reporting
                </Text>
              </View>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setUseManual(false);
                  getCurrentLocation();
                }}
              >
                <Icon name="refresh" size={20} color='#030e8b' />
                <Text style={styles.retryButtonText}>Try GPS Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locationSection}>
              <View style={styles.mapPreview}>
                <LinearGradient
                  colors={['rgba(26, 35, 126, 0.05)', 'rgba(40, 53, 147, 0.1)']}
                  style={styles.mapGradient}
                >
                  <View style={styles.mapContent}>
                    <Animated.View style={[
                      styles.mapMarker,
                      { transform: [{ scale: pulseAnim }] }
                    ]}>
                      <LinearGradient
                        colors={['#030e8b', '#030e8b']}
                        style={styles.markerGradient}
                      >
                        <Icon name="my-location" size={24} color="#fff" />
                      </LinearGradient>
                    </Animated.View>
                    <View style={styles.mapPinRing} />
                  </View>
                </LinearGradient>
              </View>

              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.coordCard}
              >
                <View style={styles.coordHeader}>
                  <View style={styles.coordIconBg}>
                    <Icon name="gps-fixed" size={24} color='#030e8b' />
                  </View>
                  <View style={styles.coordHeaderInfo}>
                    <Text style={styles.coordHeaderTitle}>Location Detected</Text>
                    <Text style={styles.coordHeaderSubtitle}>
                      Your current position has been captured
                    </Text>
                  </View>
                </View>

                <View style={styles.coordValues}>
                  <View style={styles.coordValueItem}>
                    <Text style={styles.coordValueLabel}>LATITUDE</Text>
                    <View style={styles.coordValueContent}>
                      <Icon name="arrow-upward" size={16} color="#4caf50" />
                      <Text style={styles.coordValueText}>
                        {coords?.latitude?.toFixed(6) || '0.000000'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.coordDivider} />
                  <View style={styles.coordValueItem}>
                    <Text style={styles.coordValueLabel}>LONGITUDE</Text>
                    <View style={styles.coordValueContent}>
                      <Icon name="arrow-forward" size={16} color="#ff9800" />
                      <Text style={styles.coordValueText}>
                        {coords?.longitude?.toFixed(6) || '0.000000'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.coordAccuracy}>
                  <Icon name="verified" size={16} color="#4caf50" />
                  <Text style={styles.coordAccuracyText}>
                    High accuracy location captured
                  </Text>
                </View>
              </LinearGradient>

              <TouchableOpacity
                style={styles.manualToggle}
                onPress={() => setUseManual(true)}
                activeOpacity={0.7}
              >
                <View style={styles.manualToggleContent}>
                  <Icon name="edit" size={20} color='#030e8b' />
                  <Text style={styles.manualToggleText}>
                    Enter Location Manually
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color='#030e8b'/>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={handleNext}
          disabled={!canProceed}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
    paddingHorizontal: 20,
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#030e8b',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  spinner: {
    marginTop: 16,
  },
  // Location Section Styles
  locationSection: {
    gap: 20,
  },
  mapPreview: {
    height: 240,
    borderRadius: 24,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mapGradient: {
    flex: 1,
  },
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapMarker: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 2,
  },
  markerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(26, 35, 126, 0.2)',
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
  },
  // Coord Card Styles
  coordCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  coordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  coordIconBg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordHeaderInfo: {
    flex: 1,
  },
  coordHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coordHeaderSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  coordValues: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 35, 126, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  coordValueItem: {
    flex: 1,
    gap: 8,
  },
  coordValueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
  },
  coordValueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a237e',
  },
  coordDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  coordAccuracy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  coordAccuracyText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
  },
  manualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
  },
  manualToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  manualToggleText: {
    fontSize: 15,
    color:'#030e8b',
    fontWeight: '500',
  },
  // Manual Section Styles
  manualSection: {
    gap: 24,
    paddingVertical: 8,
  },
  infoCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 16,
    elevation: 5,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  infoIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    minHeight: 100,
  },
  inputIcon: {
    marginTop: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor:'#030e8b',
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 15,
    color: '#030e8b',
    fontWeight: '600',
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

export default LocationScreen;