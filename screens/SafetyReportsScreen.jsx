import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
 TouchableOpacity, 
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const SafetyReportsScreen = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#f1f2f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Safety Reports Dashboard</Text>
        </View>

        {/* SECTION 1: PERMIT TO WORK */}
        <View style={styles.reportSection}>
          <View style={[styles.sectionDivider, styles.ptwHeader]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="file-signature" size={22} color="#11269C" />
              <Text style={styles.sectionTitle}>PTW</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Icon name="calendar-alt" size={12} color="#fff" />
              <Text style={styles.sectionBadgeText}>13 FEB</Text>
            </View>
          </View>

          {/* PTW stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#eef2ff' }]}>
                <Icon name="file-signature" size={24} color="#11269C" />
              </View>
              <View>
                <Text style={styles.statNumber}>28</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
                <Icon name="clock" size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e6f7e6' }]}>
                <Icon name="check-circle" size={24} color="#059669" />
              </View>
              <View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Issued</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="hard-hat" size={24} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.statNumber}>6</Text>
                <Text style={styles.statLabel}>High risk</Text>
              </View>
            </View>
          </View>

          {/* PTW table */}
          <View style={styles.tableWrapper}>
            <View style={styles.tableHeader}>
              <Icon name="list-ul" size={18} color="#11269C" />
              <Text style={styles.tableTitle}>Active permits</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: 70 }]}>ID</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Type</Text>
                  <Text style={[styles.tableHeaderCell, { width: 90 }]}>Location</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Initiator</Text>
                  <Text style={[styles.tableHeaderCell, { width: 70 }]}>Start</Text>
                  <Text style={[styles.tableHeaderCell, { width: 90 }]}>Status</Text>
                  <Text style={[styles.tableHeaderCell, { width: 60 }]}>PPE</Text>
                </View>

                {/* Table Rows */}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70, fontWeight: '600' }]}>PTW-101</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>🔥 Hot</Text>
                  <Text style={[styles.tableCell, { width: 90 }]}>Bldg A</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>Sarah J.</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>08:30</Text>
                  <View style={[styles.tableCell, { width: 90 }]}>
                    <View style={[styles.badge, styles.badgeIssued]}>
                      <Text style={[styles.badgeText, { color: '#1e40af' }]}>Issued</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Icon name="check-circle" size={16} color="#059669" />
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70, fontWeight: '600' }]}>PTW-108</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>🕳️ Confined</Text>
                  <Text style={[styles.tableCell, { width: 90 }]}>Tank 7B</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>Mike C.</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>09:45</Text>
                  <View style={[styles.tableCell, { width: 90 }]}>
                    <View style={[styles.badge, styles.badgeAwaiting]}>
                      <Text style={[styles.badgeText, { color: '#f39c12' }]}>Awaiting</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Icon name="clock" size={16} color="#f59e0b" />
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70, fontWeight: '600' }]}>PTW-112</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>⚡ Electrical</Text>
                  <Text style={[styles.tableCell, { width: 90 }]}>Substation</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>Lisa P.</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>10:15</Text>
                  <View style={[styles.tableCell, { width: 90 }]}>
                    <View style={[styles.badge, styles.badgeApproved]}>
                      <Text style={[styles.badgeText, { color: '#065f46' }]}>Approved</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Icon name="check-circle" size={16} color="#059669" />
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70, fontWeight: '600' }]}>PTW-119</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>⛰️ Height</Text>
                  <Text style={[styles.tableCell, { width: 90 }]}>Roof A</Text>
                  <Text style={[styles.tableCell, { width: 80 }]}>David K.</Text>
                  <Text style={[styles.tableCell, { width: 70 }]}>07:50</Text>
                  <View style={[styles.tableCell, { width: 90 }]}>
                    <View style={[styles.badge, styles.badgeIssued]}>
                      <Text style={[styles.badgeText, { color: '#1e40af' }]}>Issued</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 60 }]}>
                    <Icon name="check-circle" size={16} color="#059669" />
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.sectionSpacer} />

        {/* SECTION 2: SAFETY TRAINING */}
        <View style={styles.reportSection}>
          <View style={[styles.sectionDivider, styles.trainingHeader]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="graduation-cap" size={22} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Training</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.sectionBadgeText}>5 courses</Text>
            </View>
          </View>

          <View style={styles.trainingCardRow}>
            <View style={styles.moduleItem}>
              <View style={styles.moduleThumb}>
                <Icon name="video" size={30} color="#fff" />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>🔥 Fire</Text>
                </View>
              </View>
              <View style={styles.moduleBody}>
                <Text style={styles.moduleTitle}>Fire Safety</Text>
                <Text style={styles.moduleMeta}>In-progress · 2d ago</Text>
                <View style={styles.moduleFooter}>
                  <View style={[styles.badge, styles.badgeInProgress]}>
                    <Text style={styles.badgeText}>In Progress</Text>
                  </View>
                  <Icon name="file-pdf" size={14} color="#dc2626" style={styles.moduleIcon} />
                </View>
              </View>
            </View>

            <View style={styles.moduleItem}>
              <View style={styles.moduleThumb}>
                <Icon name="file-pdf" size={30} color="#fff" />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>PPE</Text>
                </View>
              </View>
              <View style={styles.moduleBody}>
                <Text style={styles.moduleTitle}>PPE Guide</Text>
                <Text style={styles.moduleMeta}>Not started</Text>
                <View style={[styles.badge, styles.badgeNotStarted]}>
                  <Text style={styles.badgeText}>Not Started</Text>
                </View>
              </View>
            </View>

            <View style={styles.moduleItem}>
              <View style={styles.moduleThumb}>
                <Icon name="chalkboard-teacher" size={30} color="#fff" />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>Confined</Text>
                </View>
              </View>
              <View style={styles.moduleBody}>
                <Text style={styles.moduleTitle}>Confined Space</Text>
                <Text style={styles.moduleMeta}>Completed</Text>
                <View style={[styles.badge, styles.badgeCompleted]}>
                  <Text style={styles.badgeText}>Completed</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.trainingCompliance}>
            <Icon name="chart-line" size={16} color="#f59e0b" />
            <Text style={styles.complianceText}>
              <Text style={{ fontWeight: '700' }}>68% compliance</Text> · 32 enrolled
            </Text>
          </View>
        </View>

        <View style={styles.sectionSpacer} />

        {/* SECTION 3: INCIDENT & INJURY */}
        <View style={styles.reportSection}>
          <View style={[styles.sectionDivider, styles.incidentHeader]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="exclamation-triangle" size={22} color="#dc2626" />
              <Text style={styles.sectionTitle}>Incident</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: '#dc2626' }]}>
              <Text style={styles.sectionBadgeText}>14 YTD</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="file-invoice" size={24} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.statNumber}>14</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
                <Icon name="clock" size={24} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Open</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e6f7e6' }]}>
                <Icon name="check-double" size={24} color="#059669" />
              </View>
              <View>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Closed</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="skull" size={24} color="#7f1d1d" />
              </View>
              <View>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>LTI</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: 70 }]}>ID</Text>
                  <Text style={[styles.tableHeaderCell, { width: 120 }]}>Title</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Type</Text>
                  <Text style={[styles.tableHeaderCell, { width: 70 }]}>Severity</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Status</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70 }]}>INC-001</Text>
                  <Text style={[styles.tableCell, { width: 120 }]}>Slip & Fall</Text>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={[styles.badge, styles.badgeInjury]}>
                      <Text style={[styles.badgeText, { color: '#991b1b' }]}>Injury</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View style={[styles.badge, styles.badgeMajor]}>
                      <Text style={styles.badgeText}>Major</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={[styles.badge, styles.badgeInvestigating]}>
                      <Text style={[styles.badgeText, { color: '#f39c12' }]}>Invest.</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70 }]}>INC-002</Text>
                  <Text style={[styles.tableCell, { width: 120 }]}>Near miss forklift</Text>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={[styles.badge, styles.badgeNearMiss]}>
                      <Text style={[styles.badgeText, { color: '#065f46' }]}>Near Miss</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View style={[styles.badge, styles.badgeNearMiss]}>
                      <Text style={[styles.badgeText, { color: '#065f46' }]}>—</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={[styles.badge, styles.badgeOpen]}>
                      <Text style={[styles.badgeText, { color: '#f39c12' }]}>Open</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 70 }]}>INC-003</Text>
                  <Text style={[styles.tableCell, { width: 120 }]}>Chemical splash</Text>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={[styles.badge, styles.badgeInjury]}>
                      <Text style={[styles.badgeText, { color: '#991b1b' }]}>Injury</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View style={[styles.badge, styles.badgeCritical]}>
                      <Text style={[styles.badgeText, { color: '#fff' }]}>Critical</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={[styles.badge, styles.badgeClosed]}>
                      <Text style={[styles.badgeText, { color: '#065f46' }]}>Closed</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          <View style={styles.severityBar}>
            <View style={styles.severityLabels}>
              <Text style={styles.severityLabel}>Critical 3</Text>
              <Text style={styles.severityLabel}>Major 5</Text>
              <Text style={styles.severityLabel}>Minor 6</Text>
              <Text style={styles.severityLabel}>Near miss 2</Text>
            </View>
            <View style={styles.severityBarTrack}>
              <View style={[styles.severityBarSegment, { width: '19%', backgroundColor: '#dc2626' }]} />
              <View style={[styles.severityBarSegment, { width: '31%', backgroundColor: '#f59e0b' }]} />
              <View style={[styles.severityBarSegment, { width: '38%', backgroundColor: '#4A90E2' }]} />
              <View style={[styles.severityBarSegment, { width: '12%', backgroundColor: '#2ECC71' }]} />
            </View>
          </View>
        </View>

        <View style={styles.sectionSpacer} />

        {/* SECTION 4: AUDIT & INSPECTION */}
        <View style={styles.reportSection}>
          <View style={[styles.sectionDivider, styles.auditHeader]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="clipboard-check" size={22} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Audit</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.sectionBadgeText}>8 audits</Text>
            </View>
          </View>

          <View style={styles.auditGrid}>
            <View style={styles.auditItem}>
              <Icon name="calendar-alt" size={24} color="#11269C" />
              <View>
                <Text style={{ fontWeight: '700' }}>Monthly Safety</Text>
                <View style={styles.auditMeta}>
                  <View style={[styles.badge, styles.badgeOpen]}>
                    <Text style={[styles.badgeText, { color: '#f39c12' }]}>Open</Text>
                  </View>
                  <Text style={styles.auditDate}>12 Feb</Text>
                </View>
              </View>
            </View>

            <View style={styles.auditItem}>
              <Icon name="flask" size={24} color="#11269C" />
              <View>
                <Text style={{ fontWeight: '700' }}>Chemical Storage</Text>
                <View style={styles.auditMeta}>
                  <View style={[styles.badge, styles.badgeInvestigating]}>
                    <Text style={[styles.badgeText, { color: '#f39c12' }]}>Verification</Text>
                  </View>
                  <Text style={styles.auditDate}>score 85%</Text>
                </View>
              </View>
            </View>

            <View style={styles.auditItem}>
              <Icon name="clipboard-list" size={24} color="#11269C" />
              <View>
                <Text style={{ fontWeight: '700' }}>Forklift insp.</Text>
                <View style={styles.auditMeta}>
                  <View style={[styles.badge, styles.badgeClosed]}>
                    <Text style={[styles.badgeText, { color: '#065f46' }]}>Closed</Text>
                  </View>
                  <Text style={styles.auditDate}>92%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.upcomingAudits}>
            <View style={styles.upcomingTitle}>
              <Icon name="calendar-alt" size={16} color="#11269C" />
              <Text style={styles.upcomingTitleText}>Upcoming</Text>
            </View>
            <View style={styles.tableWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>ID</Text>
                    <Text style={[styles.tableHeaderCell, { width: 120 }]}>Title</Text>
                    <Text style={[styles.tableHeaderCell, { width: 70 }]}>Date</Text>
                    <Text style={[styles.tableHeaderCell, { width: 80 }]}>Status</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: 70 }]}>AUD-204</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>Electrical safety</Text>
                    <Text style={[styles.tableCell, { width: 70 }]}>15 Feb</Text>
                    <View style={[styles.tableCell, { width: 80 }]}>
                      <View style={[styles.badge, styles.badgeOpen]}>
                        <Text style={[styles.badgeText, { color: '#f39c12' }]}>Scheduled</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: 70 }]}>AUD-208</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>5S housekeeping</Text>
                    <Text style={[styles.tableCell, { width: 70 }]}>16 Feb</Text>
                    <View style={[styles.tableCell, { width: 80 }]}>
                      <View style={[styles.badge, styles.badgeOpen]}>
                        <Text style={[styles.badgeText, { color: '#f39c12' }]}>Pending</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={styles.sectionSpacer} />

        {/* SECTION 5: CAPA */}
        <View style={styles.reportSection}>
          <View style={[styles.sectionDivider, styles.capaHeader]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="check-double" size={22} color="#059669" />
              <Text style={styles.sectionTitle}>CAPA</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: '#059669' }]}>
              <Text style={styles.sectionBadgeText}>9 active</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
                <Icon name="exclamation" size={24} color="#f39c12" />
              </View>
              <View>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                <Icon name="flask" size={24} color="#1e40af" />
              </View>
              <View>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Verification</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e6f7e6' }]}>
                <Icon name="check-circle" size={24} color="#059669" />
              </View>
              <View>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Closed</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="flag" size={24} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>High</Text>
              </View>
            </View>
          </View>

          <View style={styles.capaList}>
            <View style={styles.capaItem}>
              <View style={styles.capaItemLeft}>
                <View style={[styles.badgeHigh, { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.badgeHighText, { color: '#991b1b' }]}>HIGH</Text>
                </View>
                <Text style={styles.capaItemText}>CAPA-001 · Spill</Text>
              </View>
              <View style={[styles.badge, styles.badgePending]}>
                <Text style={styles.badgeText}>Pending</Text>
              </View>
            </View>

            <View style={styles.capaItem}>
              <View style={styles.capaItemLeft}>
                <View style={[styles.badgeMedium, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.badgeMediumText, { color: '#92400e' }]}>MEDIUM</Text>
                </View>
                <Text style={styles.capaItemText}>CAPA-002 · Pedestrian</Text>
              </View>
              <View style={[styles.badge, styles.badgePending]}>
                <Text style={styles.badgeText}>Pending</Text>
              </View>
            </View>

            <View style={styles.capaItem}>
              <View style={styles.capaItemLeft}>
                <View style={[styles.badgeHigh, { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.badgeHighText, { color: '#991b1b' }]}>HIGH</Text>
                </View>
                <Text style={styles.capaItemText}>CAPA-003 · PPE</Text>
              </View>
              <View style={[styles.badge, styles.badgeInvestigating]}>
                <Text style={[styles.badgeText, { color: '#f39c12' }]}>Verification</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionSpacer} />

        {/* SECTION 6: CHEMICAL SAFETY */}
        <View style={styles.reportSection}>
          <View style={[styles.sectionDivider, styles.chemicalHeader]}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="flask" size={22} color="#6b7280" />
              <Text style={styles.sectionTitle}>Chemicals</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: '#6b7280' }]}>
              <Text style={styles.sectionBadgeText}>47 items</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e5e7eb' }]}>
                <Icon name="flask" size={24} color="#4b5563" />
              </View>
              <View>
                <Text style={styles.statNumber}>47</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="fire" size={24} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Flammable</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <Icon name="exclamation-triangle" size={24} color="#d97706" />
              </View>
              <View>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Corrosive</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                <Icon name="clock" size={24} color="#991b1b" />
              </View>
              <View>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Expired</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeaderCell, { width: 90 }]}>Chemical</Text>
                  <Text style={[styles.tableHeaderCell, { width: 100 }]}>CAS</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Hazard</Text>
                  <Text style={[styles.tableHeaderCell, { width: 80 }]}>Location</Text>
                  <Text style={[styles.tableHeaderCell, { width: 60 }]}>Qty</Text>
                  <Text style={[styles.tableHeaderCell, { width: 70 }]}>Status</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 90 }]}>Acetone</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>67-64-1</Text>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={styles.hazardIcon}>
                      <Icon name="fire" size={12} color="#ff6b35" />
                      <Text style={styles.hazardText}> Flam.</Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, { width: 80 }]}>Lab-01</Text>
                  <Text style={[styles.tableCell, { width: 60 }]}>20L</Text>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View style={[styles.badge, styles.badgeApproved]}>
                      <Text style={[styles.badgeText, { color: '#065f46' }]}>Active</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 90 }]}>Sulfuric Acid</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>7664-93-9</Text>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={styles.hazardIcon}>
                      <Icon name="exclamation-triangle" size={12} color="#FFD700" />
                      <Text style={styles.hazardText}> Corr.</Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, { width: 80 }]}>Store-03</Text>
                  <Text style={[styles.tableCell, { width: 60 }]}>5L</Text>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View style={[styles.badge, styles.badgeApproved]}>
                      <Text style={[styles.badgeText, { color: '#065f46' }]}>Active</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 90 }]}>Sodium Hydroxide</Text>
                  <Text style={[styles.tableCell, { width: 100 }]}>1310-73-2</Text>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <View style={styles.hazardIcon}>
                      <Icon name="exclamation-triangle" size={12} color="#FFD700" />
                      <Text style={styles.hazardText}> Corr.</Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, { width: 80 }]}>Lab-02</Text>
                  <Text style={[styles.tableCell, { width: 60 }]}>10kg</Text>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View style={[styles.badge, styles.badgeExpired]}>
                      <Text style={[styles.badgeText, { color: '#991b1b' }]}>Expired</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          <View style={styles.chemicalActions}>
            <View style={styles.qrCard}>
              <Icon name="qrcode" size={24} color="#11269C" />
              <Text style={styles.chemicalActionText}>12 QR codes ready</Text>
            </View>
            <View style={styles.sdsCard}>
              <Icon name="file-pdf" size={24} color="#dc2626" />
              <Text style={styles.chemicalActionText}>SDS library · 47 docs</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionSpacer} />

        {/* RECENT ACTIVITY */}
        <View style={styles.reportSection}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Icon name="history" size={24} color="#11269C" />
              <Text style={styles.activityTitle}>Recent activity</Text>
            </View>
            <View style={styles.activityGrid}>
              <View style={styles.activityItem}>
                <Icon name="file-signature" size={16} color="#11269C" />
                <Text style={styles.activityText}>PTW-213 approved · just now</Text>
              </View>
              <View style={styles.activityItem}>
                <Icon name="exclamation-triangle" size={16} color="#dc2626" />
                <Text style={styles.activityText}>INC-002 near miss · 15m ago</Text>
              </View>
              <View style={styles.activityItem}>
                <Icon name="flask" size={16} color="#059669" />
                <Text style={styles.activityText}>Toluene added · 1h ago</Text>
              </View>
              <View style={styles.activityItem}>
                <Icon name="check-double" size={16} color="#059669" />
                <Text style={styles.activityText}>CAPA-003 closed · 2h ago</Text>
              </View>
            </View>
            <View style={styles.activityFooter}>
              <Text style={styles.activityFooterText}>⏱️ 13 Feb 2026</Text>
              <Text style={styles.activityFooterText}>Performance 87%</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 75,
    paddingTop: Platform.OS === 'android' ? 27 : 12,
    paddingVertical: 12,
    backgroundColor: '#021679',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#f9f4f4',
  },
  placeholder: {
    width: 40,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  pageHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#11269C',
    borderRadius: 16,
    shadowColor: '#11269C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pageTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: isSmallScreen ? 32 : 36,
  },
  reportSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    paddingBottom: 8,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 40,
    gap: 6,
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ptwHeader: {
    borderBottomColor: '#11269C',
  },
  trainingHeader: {
    borderBottomColor: '#f59e0b',
  },
  incidentHeader: {
    borderBottomColor: '#dc2626',
  },
  auditHeader: {
    borderBottomColor: '#3b82f6',
  },
  capaHeader: {
    borderBottomColor: '#059669',
  },
  chemicalHeader: {
    borderBottomColor: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableWrapper: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeIssued: {
    backgroundColor: '#dbeafe',
  },
  badgeAwaiting: {
    backgroundColor: '#FEF5E7',
  },
  badgeApproved: {
    backgroundColor: '#d1fae5',
  },
  badgeInProgress: {
    backgroundColor: '#fef3c7',
  },
  badgeNotStarted: {
    backgroundColor: '#fee2e2',
  },
  badgeCompleted: {
    backgroundColor: '#d1fae5',
  },
  badgeOpen: {
    backgroundColor: '#FEF5E7',
  },
  badgeClosed: {
    backgroundColor: '#d1fae5',
  },
  badgeInvestigating: {
    backgroundColor: '#FEF5E7',
  },
  badgeInjury: {
    backgroundColor: '#fee2e2',
  },
  badgeMajor: {
    backgroundColor: '#f59e0b',
  },
  badgeCritical: {
    backgroundColor: '#dc2626',
  },
  badgeNearMiss: {
    backgroundColor: '#d1fae5',
  },
  badgeExpired: {
    backgroundColor: '#fee2e2',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  trainingCardRow: {
    gap: 12,
    marginBottom: 12,
  },
  moduleItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 12,
  },
  moduleThumb: {
    height: 100,
    backgroundColor: '#11269C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbBadge: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  thumbBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#11269C',
  },
  moduleBody: {
    padding: 12,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  moduleMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleIcon: {
    marginLeft: 8,
  },
  trainingCompliance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9e7',
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#f59e0b',
    gap: 8,
  },
  complianceText: {
    fontSize: 13,
    color: '#000',
  },
  severityBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  severityLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  severityBarTrack: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#f0f2f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  severityBarSegment: {
    height: '100%',
  },
  auditGrid: {
    gap: 12,
    marginBottom: 16,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  auditMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  auditDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  upcomingAudits: {
    marginTop: 8,
  },
  upcomingTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  upcomingTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  capaList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  capaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  capaItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  capaItemText: {
    fontSize: 13,
    color: '#000',
    flex: 1,
  },
  badgeHigh: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeHighText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeMedium: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeMediumText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chemicalActions: {
    marginTop: 16,
    gap: 12,
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    padding: 14,
    borderRadius: 8,
    gap: 16,
  },
  sdsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 8,
    gap: 16,
  },
  chemicalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  hazardIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hazardText: {
    fontSize: 12,
    color: '#333',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  activityGrid: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  activityText: {
    fontSize: 13,
    color: '#000',
    flex: 1,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  activityFooterText: {
    fontSize: 12,
    color: '#6b7280',
  },
  sectionSpacer: {
    marginVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  bottomPadding: {
    height: 20,
  },
});

export default SafetyReportsScreen;