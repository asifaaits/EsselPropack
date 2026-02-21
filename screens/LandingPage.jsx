import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

// Only Safety Portal module for landing page
const safetyData = [
  {
    id: 1,
    title: 'Safety Portal',
    icon: 'shield-alt',
    route: 'SafetyModule',
    color: '#2E7D32',
    bgColor: 'rgba(46, 125, 50, 0.1)',
  },
];

// All modules for Safety Portal screen (with Dashboard as first)
const safetyPortalModules = [
  {
    id: 7,
    title: 'Dashboard',
    icon: 'chart-pie',
    route: 'SafetyDashboard',
    color: '#6A1B9A',
    bgColor: 'rgba(106, 27, 154, 0.1)',
  },
  {
    id: 2,
    title: 'Permit to Work',
    icon: 'file-signature',
    route: 'PermitToWork',
    color: '#1976D2',
    bgColor: 'rgba(25, 118, 210, 0.1)',
  },
  {
    id: 3,
    title: 'Incident Management',
    icon: 'first-aid',
    route: 'IncidentManagement',
    color: '#D32F2F',
    bgColor: 'rgba(230, 42, 42, 0.1)',
  },
  {
    id: 4,
    title: 'Chemical Safety',
    icon: 'flask',
    route: 'ChemicalSafety',
    color: '#de5708',
    bgColor: 'rgba(246, 114, 67, 0.1)',
  },
{
    id: 10,
    title: 'Audit & Inspection',
    icon: 'clipboard-check',
    route: 'AuditAndInspection',
    color: '#455A64',
    bgColor: 'rgba(69, 90, 100, 0.1)',
  },

  {
    id: 8,
    title: 'CAPA',
    icon: 'check-circle',
    route: 'CapaScreen',
    color: '#00796B',
    bgColor: 'rgba(0, 121, 107, 0.1)',
  },
   {
    id: 5,
    title: 'Safety Training',
    icon: 'graduation-cap',
    route: 'SafetyTraining',
    color: '#FFC107',
    bgColor: 'rgba(255, 193, 7, 0.1)',
  },
  {
    id: 9,
    title: 'Reports',
    icon: 'file-alt',
    route: 'Reports',
    color: '#E64A19',
    bgColor: 'rgba(230, 74, 25, 0.1)',
  },
  
];

// Quick action modules (all except Safety Portal) for Safety Module screen
const quickActionModules = safetyPortalModules;

const LandingPage = () => {
  const navigation = useNavigation();

  const handleCardPress = (route, title) => {
    if (title === 'Safety Portal') {
      navigation.navigate('SafetyModule', { module: title });
    } else {
      navigation.navigate(route);
    }
  };

 

  const renderCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.quickCard, { backgroundColor: item.bgColor }]}
      onPress={() => handleCardPress(item.route, item.title)}
      activeOpacity={0.7}
    >
      <View style={styles.quickCardInner}>
        <View style={[styles.quickIconBox, { backgroundColor: item.bgColor }]}>
          <Icon name={item.icon} size={isSmallScreen ? 22 : 26} color={item.color} />
        </View>
        <View style={styles.quickTextContainer}>
          <Text style={styles.quickTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.quickSubtitle} numberOfLines={1}>Access safety tools</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
    

        <View style={styles.quickGrid}>
          {safetyData.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.quickCardWrapper,
                (index % 2 === 0) && styles.quickCardEven,
                (index % 2 === 1) && styles.quickCardOdd
              ]}
            >
              {renderCard(item)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Safety Module Screen Component
export const SafetyModuleScreen = ({ route }) => {
  
  const navigation = useNavigation();
  const { module } = route.params;

// In SafetyModuleScreen component
const handleCardPress = (route) => {
  console.log('🔍 Attempting to navigate to:', route);
  console.log('📱 Available screens:', navigation.getState()?.routes.map(r => r.name));
  try {
    navigation.navigate(route);
    console.log('✅ Navigation successful');
  } catch (error) {
    console.error('❌ Navigation error:', error);
    alert(`Screen "${route}" not found. Check your navigation stack.`);
  }
};
  const handleSOSPress = () => {
    console.log('SOS Emergency triggered from Safety Module');
    // Add SOS emergency logic here
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderCard = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.quickCard, { backgroundColor: item.bgColor }]}
      onPress={() => handleCardPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.quickCardInner}>
        <View style={[styles.quickIconBox, { backgroundColor: item.bgColor }]}>
          <Icon name={item.icon} size={isSmallScreen ? 22 : 26} color={item.color} />
        </View>
        <View style={styles.quickTextContainer}>
          <Text style={styles.quickTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.quickSubtitle} numberOfLines={1}>Access safety tools</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
  
        {/* Navbar */}
         <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.navbar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#ecedf3" />
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>{module}</Text>
          <View style={styles.placeholder} />
        </View>

       
        <View style={styles.quickGrid}>
          {quickActionModules.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.quickCardWrapper,
                (index % 2 === 0) && styles.quickCardEven,
                (index % 2 === 1) && styles.quickCardOdd
              ]}
            >
              {renderCard(item)}
            </View>
          ))}
        </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5fa67',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    marginBottom:20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
heroSection: {
    backgroundColor: '#11269C',
    padding: isSmallScreen ? 20 : 28,
    paddingTop: Platform.OS === 'ios' ? 16 : 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    marginBottom: isSmallScreen ? 20 : 28,
  },
  heroTitle: {
    fontSize: isSmallScreen ? 24 : isTablet ? 34 : 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: isSmallScreen ? 30 : 36,
  },
  heroSubtitle: {
    fontSize: isSmallScreen ? 15 : 17,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 22 : 24,
    fontWeight: '500',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 15,
    marginTop: 10,
  },
  quickCardWrapper: {
    width: '50%',
    padding: 6,
  },
  quickCardEven: {
    paddingRight: 7,
  },
  quickCardOdd: {
    paddingLeft: 7,
  },
  quickCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: isSmallScreen ? 16 : 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    height: isSmallScreen ? 140 : 160,
    justifyContent: 'center',
  },
  quickCardInner: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  quickIconBox: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 233, 12, 0.05)',
  },
  quickTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  quickTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: isSmallScreen ? 20 : 22,
  },
  quickSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Navbar styles for Safety Module
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height:70,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingTop:20,
    backgroundColor: '#031071',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  navbarTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#ecedf3',
  },
  placeholder: {
    width: 40,
  },
  sosSection: {
    padding: 20,
  },
});

export default LandingPage;