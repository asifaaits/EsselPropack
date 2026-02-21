import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import PrimaryButton from './components/PrimaryButton';

const { width } = Dimensions.get('window');

const SuccessScreen = ({ onFinish }) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Zoom animation for tick container
  const zoomAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('✅ SuccessScreen mounted!');

    // Entrance animation - scale in the circle
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.elastic(1.5),
      useNativeDriver: true,
    }).start();

    // Continuous zoom in/out animation for tick container
    Animated.loop(
      Animated.sequence([
        Animated.timing(zoomAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(zoomAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade and slide animations for content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get current date and time
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  const dateString = now.toLocaleDateString([], { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  // Generate random report ID
  const reportId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e8eaf6']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Check Circle with Zoom In/Out */}
        <Animated.View style={[
          styles.checkCircle,
          {
            transform: [
              { scale: scaleAnim },
            ]
          }
        ]}>
          <LinearGradient
            colors={['rgba(2, 148, 63, 0.1)', 'rgba(2, 148, 63, 0.2)']}
            style={styles.checkCircleGradient}
          >
            <Animated.View style={[
              styles.checkInner,
              {
                transform: [
                  { scale: zoomAnim }
                ]
              }
            ]}>
              <LinearGradient
                colors={['#00C853', '#00BFA5']}
                style={styles.checkGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="check" size={52} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Text Section with Animation */}
        <Animated.View style={[
          styles.textSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={styles.title}>Success!</Text>
          <Text style={styles.subtitle}>
            Your incident report has been submitted and recorded successfully
          </Text>
        </Animated.View>

        {/* Info Card */}
        <Animated.View style={[
          styles.infoCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <LinearGradient
            colors={['#030e8b', '#1521a4']}
            style={styles.infoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.infoHeader}>
              <Icon name="receipt" size={24} color="#fff" />
              <View style={styles.infoHeaderText}>
                <Text style={styles.infoHeaderTitle}>Report Confirmed</Text>
                <Text style={styles.infoHeaderSubtitle}>#{reportId}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="access-time" size={18} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Submitted at</Text>
                <Text style={styles.infoValue}>{timeString}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar-today" size={18} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{dateString}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="verified" size={18} color="#fff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Successfully Recorded</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Footer with Done Button */}
      <Animated.View style={[
        styles.footer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: [0, 30],
            })
          }]
        }
      ]}>
        <PrimaryButton 
          label="Done" 
          onPress={onFinish}
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Animated Check Circle
  checkCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginTop:40,
    overflow: 'hidden',
  },
  checkCircleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text Section
  textSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#030e8b',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  // Info Card
  infoCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#030e8b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  infoGradient: {
    padding: 15,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoHeaderText: {
    flex: 1,
  },
  infoHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  infoHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
  },
});

export default SuccessScreen;