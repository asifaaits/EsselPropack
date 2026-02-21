import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import StepHeader from './components/StepHeader';
import PrimaryButton from './components/PrimaryButton';
import { useIncident } from './context/IncidentContext';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ onNext, onBack }) => {
  const cameraRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const { incidentData, updateIncidentData } = useIncident();
  const [previewUri, setPreviewUri] = useState(incidentData.photo);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const [cameraType, setCameraType] = useState('back');
  
  // Animation values
  const shutterAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  
  const device = useCameraDevice(cameraType);
  const { hasPermission, requestPermission } = useCameraPermission();

  // Pulse animation for capture button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Reset permission state when component mounts
  useEffect(() => {
    setPermissionChecked(false);
  }, []);

  const handleRequestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'SafeReport needs access to your camera to document incidents for safety reporting.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Grant Permission',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionChecked(true);
        } else {
          Alert.alert(
            'Permission Denied',
            'Camera access is essential for incident reporting. You can enable it in settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const permission = await requestPermission();
      setPermissionChecked(true);
    }
  };

  const shouldShowPermission = () => {
    return !permissionChecked;
  };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    
    // Shutter animation
    Animated.sequence([
      Animated.timing(shutterAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shutterAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: flashMode,
      });
      
      const uri = `file://${photo.path}`;
      setPreviewUri(uri);
      updateIncidentData('photo', uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
      console.error(error);
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
    updateIncidentData('photo', null);
  };

  const handleConfirm = () => {
    if (previewUri) {
      onNext();
    }
  };

  const toggleFlash = () => {
    const modes = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
    
    // Flash animation
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleCamera = () => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  };

  const getFlashIcon = () => {
    switch(flashMode) {
      case 'on': return 'flash-on';
      case 'auto': return 'flash-auto';
      default: return 'flash-off';
    }
  };

  // Permission Screen
  if (shouldShowPermission()) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e8eaf6']} style={styles.container}>
        <StepHeader step={1} totalSteps={5} title="Camera Permission" onBack={onBack} />
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <LinearGradient
              colors={['#030e8b', '#030e8b']}
              style={styles.permissionIcon}
            >
              <Icon name="photo-camera" size={48} color="#fff" />
            </LinearGradient>
          </View>
          
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To document incidents effectively, we need access to your camera. 
            Your photos help create accurate safety reports.
          </Text>
          
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#030e8b', '#030e8b']}
              style={styles.permissionButtonGradient}
            >
              <Icon name="lock-open" size={20} color="#fff" />
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.permissionLaterButton}
            onPress={onBack}
          >
            <Text style={styles.permissionLaterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // No Permission Screen
  if (!hasPermission) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e8eaf6']} style={styles.container}>
        <StepHeader step={1} totalSteps={5} title="Camera Permission" onBack={onBack} />
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIconContainer, styles.errorIconContainer]}>
            <LinearGradient
              colors={['#b71c1c', '#d32f2f']}
              style={styles.permissionIcon}
            >
              <Icon name="camera-off" size={48} color="#fff" />
            </LinearGradient>
          </View>
          
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            Without camera access, you won't be able to attach photos to your incident reports. 
            You can enable it in your device settings.
          </Text>
          
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={() => setPermissionChecked(false)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#030e8b', '#030e8b']}
              style={styles.permissionButtonGradient}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.permissionButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // No Device Screen
  if (!device) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e8eaf6']} style={styles.container}>
        <StepHeader step={1} totalSteps={5} title="Camera" onBack={onBack} />
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIconContainer, styles.errorIconContainer]}>
            <LinearGradient
              colors={['#b71c1c', '#d32f2f']}
              style={styles.permissionIcon}
            >
              <Icon name="error" size={48} color="#fff" />
            </LinearGradient>
          </View>
          
          <Text style={styles.permissionTitle}>No Camera Found</Text>
          <Text style={styles.permissionText}>
            We couldn't detect a camera on your device. Please check your device hardware.
          </Text>
          
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={onBack}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#030e8b', '#030e8b']}
              style={styles.permissionButtonGradient}
            >
              <Icon name="arrow-back" size={20} color="#fff" />
              <Text style={styles.permissionButtonText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Preview Screen
  if (previewUri) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e8eaf6']} style={styles.container}>
        <StepHeader step={1} totalSteps={5} title="Photo Preview" onBack={onBack} />
        
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.previewGradient}
          >
            <View style={styles.previewBadge}>
              <Icon name="check-circle" size={24} color="#4caf50" />
              <Text style={styles.previewBadgeText}>Photo captured successfully</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            onPress={handleRetake}
            style={[styles.actionButton, styles.retakeButton]}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={24} color='#030e8b' />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.actionButton, styles.confirmButton]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#030e8b', '#030e8b']}
              style={styles.confirmButtonGradient}
            >
              <Icon name="check" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Camera Screen
  return (
    <View style={styles.container}>
      <StepHeader step={1} totalSteps={5} title="Take Photo" onBack={onBack} />
      
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
          enableZoomGesture={true}
        />
        
        {/* Shutter animation overlay */}
        <Animated.View 
          style={[
            styles.shutterOverlay,
            {
              opacity: shutterAnim,
            }
          ]} 
        />
        
        {/* Camera Controls Overlay */}
        <View style={styles.cameraControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <Animated.View style={{
              transform: [{ scale: flashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2]
              }) }]
            }}>
              <Icon name={getFlashIcon()} size={24} color="#fff" />
            </Animated.View>
            <View style={styles.controlBadge}>
              <Text style={styles.controlBadgeText}>{flashMode.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleCamera}
            activeOpacity={0.7}
          >
            <Icon name="flip-camera-ios" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Focus Frame */}
        <View style={styles.focusFrame}>
          <View style={styles.focusCornerTL} />
          <View style={styles.focusCornerTR} />
          <View style={styles.focusCornerBL} />
          <View style={styles.focusCornerBR} />
        </View>
        
        {/* Camera Hint */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.cameraHintContainer}
        >
          <Text style={styles.cameraHint}>
            <Icon name="info" size={16} color="#fff" /> Position the incident in the frame
          </Text>
        </LinearGradient>
      </View>

      {/* Capture Button */}
      <View style={styles.captureRow}>
        <TouchableOpacity
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.8}
        >
          <Animated.View style={[
            styles.captureBtn,
            capturing && styles.capturing,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <LinearGradient
              colors={['#1a237e', '#283593']}
              style={styles.captureBtnGradient}
            >
              <View style={styles.captureBtnInner} />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.captureHint}>Tap to capture</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  // Permission Screen Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionIconContainer: {
    marginBottom: 24,
  },
  errorIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  permissionButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionLaterButton: {
    padding: 12,
  },
  permissionLaterText: {
    color: '#999',
    fontSize: 14,
  },
  // Camera Screen Styles
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#030e8b',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  camera: {
    flex: 1,
  },
  shutterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  cameraControls: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#030e8b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  controlBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  focusFrame: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    bottom: '30%',
  },
  focusCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
    borderTopLeftRadius: 12,
  },
  focusCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
    borderTopRightRadius: 12,
  },
  focusCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#fff',
    borderBottomLeftRadius: 12,
  },
  focusCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
    borderBottomRightRadius: 12,
  },
  cameraHintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cameraHint: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captureRow: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 8,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  captureBtnGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#030e8b',
  },
  capturing: {
    opacity: 0.7,
  },
  captureHint: {
    marginTop: 12,
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  // Preview Screen Styles
  previewContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#030e8b',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  preview: {
    flex: 1,
  },
  previewGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retakeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor:'#030e8b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retakeButtonText: {
    color: '#030e8b',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    borderWidth: 0,
  },
  confirmButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;