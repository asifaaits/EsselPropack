import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallScreen = width < 375;

// Update this path based on your actual logo location
// Try different paths if this doesn't work:
// const ESSEL_LOGO = require('../../assets/logo.jpg');
// const ESSEL_LOGO = require('../../../assets/logo.jpg');
// const ESSEL_LOGO = require('./assets/logo.jpg');
const ESSEL_LOGO = require('../assets/logo.png');

const Navbar = ({ onLogout, isHeaderHidden, navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', route: 'Home', icon: 'home' },
    { name: 'About Us', route: 'About', icon: 'info' },
    { name: 'Safety Modules', route: 'SafetyModules', icon: 'shield' },
    { name: 'Reports', route: 'Reports', icon: 'assessment' },
    { name: 'Training', route: 'Training', icon: 'school' },
    { name: 'Incidents', route: 'Incidents', icon: 'warning' },
    { name: 'Settings', route: 'Settings', icon: 'settings' },
  ];

  const userMenuItems = [
    { name: 'My Profile', icon: 'person', action: () => console.log('Profile') },
    { name: 'Account Settings', icon: 'settings', action: () => console.log('Settings') },
    { name: 'Help & Support', icon: 'help', action: () => console.log('Help') },
    { name: 'Logout', icon: 'logout', action: onLogout },
  ];

  const notifications = [
    { id: 1, title: 'Safety Alert', message: 'New safety protocol update', time: '2 min ago', read: false },
    { id: 2, title: 'System Maintenance', message: 'Scheduled maintenance tonight', time: '1 hour ago', read: true },
    { id: 3, title: 'Welcome', message: 'Welcome to Essel Propack Safety Portal', time: '1 day ago', read: true },
  ];

  const handleNavPress = (route) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(route);
    }
    closeMenu();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.navbar, isHeaderHidden && styles.headerHidden]}>
        {/* Logo and Brand */}
        <TouchableOpacity 
          style={styles.brandContainer} 
          onPress={() => handleNavPress('Home')}
          activeOpacity={0.7}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={ESSEL_LOGO} 
              style={styles.logo} 
              resizeMode="contain"
              onError={(e) => console.log('Logo load error:', e.nativeEvent.error)}
            />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.companyName}>ESSEL PROPACK</Text>
            <Text style={styles.companyTagline}>Safety First</Text>
          </View>
        </TouchableOpacity>

        {/* Desktop Navigation - Show on tablets and larger screens */}
        {width >= 768 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.navMenu}
            contentContainerStyle={styles.navMenuContent}
          >
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => handleNavPress(item.route)}
                activeOpacity={0.7}
              >
                <Icon name={item.icon} size={20} color="#11269C" style={styles.navIcon} />
                <Text style={styles.navText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setShowNotifications(!showNotifications)}
            activeOpacity={0.7}
          >
            <Icon name="notifications" size={24} color="#11269C" />
            {notifications.filter(n => !n.read).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notifications.filter(n => !n.read).length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setShowUserMenu(!showUserMenu)}
            activeOpacity={0.7}
          >
            <Icon name="person" size={24} color="#11269C" />
           
          </TouchableOpacity>

          
        </View>

      
        {/* Notifications Dropdown */}
        {showNotifications && (
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownContent} showsVerticalScrollIndicator={false}>
              {notifications.map(notification => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIcon}>
                    <Icon 
                      name="circle" 
                      size={8} 
                      color={notification.read ? 'transparent' : '#11269C'} 
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.dropdownFooter}>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllBtnText}>View All Notifications</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <View style={styles.userDropdown}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Icon name="person" size={32} color="#11269C" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>John Doe</Text>
                <Text style={styles.userRole}>Safety Manager</Text>
                <Text style={styles.userEmail}>john.doe@esselpropack.com</Text>
              </View>
            </View>
            <View style={styles.userMenuItems}>
              {userMenuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.userMenuItem, item.name === 'Logout' && styles.logoutMenuItem]}
                  onPress={() => {
                    item.action();
                    setShowUserMenu(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    color={item.name === 'Logout' ? '#d32f2f' : '#666'}
                  />
                  <Text style={[
                    styles.userMenuItemText,
                    item.name === 'Logout' && styles.logoutText
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(1, 4, 54, 2)',
  },

  navbar: {
    marginTop:25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaf6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: Platform.OS === 'ios' ? 88 : 64,
    zIndex: 1000,
  },
  headerHidden: {
    display: 'none',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: isTablet ? 0.3 : 1,
  },
  logoContainer: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 8 : 12,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  logo: {
    width: isSmallScreen ? 35 : 45,
    height: isSmallScreen ? 35 : 45,
  },
  brandText: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '800',
    color: '#11269C',
    letterSpacing: 0.5,
  },
  companyTagline: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
  navMenu: {
    flex: 1,
    maxWidth: isTablet ? 500 : 400,
  },
  navMenuContent: {
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  navIcon: {
    marginRight: 4,
  },
  navText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: isTablet ? 0.2 : 0.4,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f5f7ff',
    borderWidth: 1,
    borderColor: '#e8eaf6',
    position: 'relative',
  },
  dropdownArrow: {
    marginLeft: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f5f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mobileMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9faff',
  },
  mobileLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  mobileLogo: {
    width: 45,
    height: 45,
  },
  mobileBrandContainer: {
    flex: 1,
  },
  mobileBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#11269C',
    marginBottom: 2,
  },
  mobileTagline: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f5f7ff',
    borderRadius: 8,
  },
  mobileMenuItems: {
    maxHeight: 500,
  },
  userInfoMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9faff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatarMobile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetailsMobile: {
    flex: 1,
  },
  userNameMobile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userRoleMobile: {
    fontSize: 14,
    color: '#666',
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  mobileMenuIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  mobileMenuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 70,
    right: 20,
    width: Math.min(width * 0.9, 350),
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e8eaf6',
    zIndex: 1001,
    maxHeight: 400,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9faff',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11269C',
  },
  dropdownContent: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  unreadNotification: {
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    paddingTop: 4,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  dropdownFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewAllBtn: {
    padding: 12,
    backgroundColor: '#f5f7ff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8eaf6',
  },
  viewAllBtnText: {
    fontSize: 14,
    color: '#11269C',
    fontWeight: '600',
  },
  userDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 70,
    right: 20,
    width: Math.min(width * 0.9, 320),
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e8eaf6',
    zIndex: 1001,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9faff',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
  },
  userMenuItems: {
    padding: 8,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  logoutMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
    paddingTop: 16,
  },
  userMenuItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
});

export default Navbar;