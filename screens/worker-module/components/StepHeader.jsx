import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const StepHeader = ({ step, totalSteps, title, onBack }) => {
  return (
    <LinearGradient
      colors={['#030e8b', '#030e8b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <View style={styles.backBtnInner}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>{step}/{totalSteps}</Text>
        </View>
      </View>
      
      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i < step ? styles.progressFilled : styles.progressEmpty,
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#020c75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF',
    flex: 1,
   
    letterSpacing: 0.5,
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFilled: {
    backgroundColor: '#FFFFFF',
  },
  progressEmpty: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default StepHeader;