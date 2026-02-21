import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const SafetyDashboard = () => {
  const navigation = useNavigation();
  const [selectedPtwId, setSelectedPtwId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#11269C',
    },
  };

  // Stats data
  const statsData = [
    { id: 1, title: 'Active PTW', value: '28', icon: 'file-signature', color: '#11269C', change: '+12%' },
    { id: 2, title: 'Open Incidents', value: '14', icon: 'exclamation-circle', color: '#11269C', change: '-5%' },
    { id: 3, title: 'CAPA in Progress', value: '9', icon: 'check-double', color: '#11269C', change: '+3%' },
    { id: 4, title: 'Chemicals', value: '47', icon: 'flask', color: '#11269C', change: '+8%' },
  ];

  // Chart data
  const moduleChartData = {
    labels: ['PTW', 'Training', 'Incident', 'Audit', 'Chemical', 'CAPA'],
    datasets: [
      {
        data: [28, 12, 14, 8, 47, 9],
        color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [12, 5, 5, 2, 3, 5],
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Active', 'Pending'],
  };

  const incidentChartData = {
    labels: ['Critical', 'Major', 'Minor', 'Near Miss'],
    datasets: [
      {
        data: [3, 5, 6, 2],
        colors: [
          (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
          (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
          (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        ],
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Critical',
      population: 3,
      color: '#dc2626',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Major',
      population: 5,
      color: '#f59e0b',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Minor',
      population: 6,
      color: '#4A90E2',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Near Miss',
      population: 2,
      color: '#10b981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  // Module data
  const moduleData = [
    {
      id: 1,
      title: 'Permit to Work',
      icon: 'file-signature',
      active: '28 active',
      status: 'step 4/10',
      meta1: 'Hot, confined',
      meta2: '72% progress',
      badges: ['12 pending', '12 approved'],
      badgeColors: ['#FEF5E7', '#d1fae5'],
      badgeTextColors: ['#F39C12', '#065f46'],
    },
    {
      id: 2,
      title: 'Safety Training',
      icon: 'video',
      active: '5 courses',
      status: '32 enrolled',
      meta1: 'Fire safety',
      meta2: 'PPE guide',
      badges: ['In-progress 3', 'Not started 2'],
      badgeColors: ['#d1fae5', '#fee2e2'],
      badgeTextColors: ['#065f46', '#dc2626'],
    },
    {
      id: 3,
      title: 'Incident & Injury',
      icon: 'exclamation-triangle',
      active: '14 open',
      status: 'LTI 2',
      meta1: 'YTD: 14',
      meta2: 'Critical:3',
      badges: ['Investigating 5', 'Closed 7'],
      badgeColors: ['#FEF5E7', '#d1fae5'],
      badgeTextColors: ['#F39C12', '#065f46'],
    },
  ];

  // Resource data
  const resourceData = [
    { id: 1, title: 'SDS Library', description: '47 chemicals · updated today', icon: 'file-pdf' },
    { id: 2, title: 'QR Generator', description: '12 labels ready', icon: 'qrcode' },
    { id: 3, title: 'Scan QR', description: 'Last: Chem Bay-03', icon: 'camera' },
  ];

  // PTW Data
  const ptwData = [
    {
      id: 'PTW-101',
      type: 'Hot work',
      location: 'Bldg A, bay 4',
      initiator: 'Sarah Johnson',
      contractor: 'Prime Mech',
      startTime: '08:30',
      endTime: '16:30',
      status: 'Issued',
      statusColor: '#dbeafe',
      statusTextColor: '#1e40af',
      ppe: 'verified',
      priority: 'High',
    },
    {
      id: 'PTW-108',
      type: 'Confined space',
      location: 'Tank 7B',
      initiator: 'Mike Chen',
      contractor: 'Indus Services',
      startTime: '09:45',
      endTime: '15:00',
      status: 'Awaiting',
      statusColor: '#FEF5E7',
      statusTextColor: '#F39C12',
      ppe: 'pending',
      priority: 'Critical',
    },
    {
      id: 'PTW-112',
      type: 'Electrical LT',
      location: 'Substation 2',
      initiator: 'Lisa Park',
      contractor: 'Enercon',
      startTime: '10:15',
      endTime: '18:00',
      status: 'Approved',
      statusColor: '#d1fae5',
      statusTextColor: '#065f46',
      ppe: 'verified',
      priority: 'Medium',
    },
    {
      id: 'PTW-119',
      type: 'Work at height',
      location: 'Roof A, zone 3',
      initiator: 'David Kim',
      contractor: 'Roofmasters',
      startTime: '07:50',
      endTime: '15:30',
      status: 'Issued',
      statusColor: '#dbeafe',
      statusTextColor: '#1e40af',
      ppe: 'verified',
      priority: 'High',
    },
    {
      id: 'PTW-124',
      type: 'Line breaking',
      location: 'Piping gallery',
      initiator: 'Robert Zhao',
      contractor: 'PIPetech',
      startTime: '11:20',
      endTime: '19:00',
      status: 'Pending',
      statusColor: '#FEF5E7',
      statusTextColor: '#F39C12',
      ppe: 'pending',
      priority: 'Critical',
    },
    {
      id: 'PTW-131',
      type: 'Lifting ops',
      location: 'Warehouse B',
      initiator: 'Carlos Mendez',
      contractor: 'LiftCorp',
      startTime: '13:00',
      endTime: '20:30',
      status: 'Approved',
      statusColor: '#d1fae5',
      statusTextColor: '#065f46',
      ppe: 'verified',
      priority: 'Medium',
    },
  ];

  // Activity data
  const activityData = [
    { id: 1, icon: 'file-signature', text: 'PTW-213 approved · Hot work', time: 'just now', reporter: 'Sarah Johnson', timeColor: '#d1fae5', timeTextColor: '#065f46' },
    { id: 2, icon: 'exclamation-triangle', text: 'Near miss INC-2024-002 · Forklift', time: '15m ago', reporter: 'Sarah Chen', timeColor: '#FEF5E7', timeTextColor: '#F39C12' },
    { id: 3, icon: 'flask', text: 'Chemical added Toluene, CAS 108-88-3', time: '1h ago', reporter: 'QR generated', timeColor: '#E8F2FC', timeTextColor: '#4A90E2' },
    { id: 4, icon: 'clipboard', text: 'CAPA-2024-003 verification passed (PPE)', time: '2h ago', reporter: 'closed effective', timeColor: '#dcfce7', timeTextColor: '#166534' },
  ];

  // Filter PTW data
  const filteredPtwData = ptwData.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderPtwItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.ptwCard, selectedPtwId === item.id && styles.selectedPtwCard]}
      onPress={() => setSelectedPtwId(selectedPtwId === item.id ? null : item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.ptwCardHeader}>
        <View style={styles.ptwIdContainer}>
          <Text style={styles.ptwId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
            <Text style={[styles.statusText, { color: item.statusTextColor }]}>{item.status}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, 
          item.priority === 'Critical' && styles.criticalPriority,
          item.priority === 'High' && styles.highPriority,
          item.priority === 'Medium' && styles.mediumPriority,
        ]}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.ptwCardBody}>
        <View style={styles.ptwRow}>
          <Icon name="hard-hat" size={12} color="#666" />
          <Text style={styles.ptwLabel}>Type:</Text>
          <Text style={styles.ptwValue}>{item.type}</Text>
        </View>
        <View style={styles.ptwRow}>
          <Icon name="map-marker-alt" size={12} color="#666" />
          <Text style={styles.ptwLabel}>Location:</Text>
          <Text style={styles.ptwValue}>{item.location}</Text>
        </View>
        <View style={styles.ptwRow}>
          <Icon name="user" size={12} color="#666" />
          <Text style={styles.ptwLabel}>Initiator:</Text>
          <Text style={styles.ptwValue}>{item.initiator}</Text>
        </View>
        <View style={styles.ptwRow}>
          <Icon name="building" size={12} color="#666" />
          <Text style={styles.ptwLabel}>Contractor:</Text>
          <Text style={styles.ptwValue}>{item.contractor}</Text>
        </View>
        <View style={styles.ptwRow}>
          <Icon name="clock" size={12} color="#666" />
          <Text style={styles.ptwLabel}>Time:</Text>
          <Text style={styles.ptwValue}>{item.startTime} - {item.endTime}</Text>
        </View>
        <View style={styles.ptwRow}>
          <Icon name="check-circle" size={12} color={item.ppe === 'verified' ? '#059669' : '#f59e0b'} />
          <Text style={styles.ptwLabel}>PPE:</Text>
          <Text style={[styles.ptwValue, { color: item.ppe === 'verified' ? '#059669' : '#f59e0b' }]}>
            {item.ppe}
          </Text>
        </View>
      </View>

      {selectedPtwId === item.id && (
        <View style={styles.ptwActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="eye" size={16} color="#11269C" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="edit" size={16} color="#11269C" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="print" size={16} color="#11269C" />
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: 'rgba(17, 38, 156, 0.1)' }]}>
        <Icon name={item.icon} size={16} color="#11269C" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{item.text}</Text>
        <Text style={styles.activityReporter}>{item.reporter}</Text>
      </View>
      <View style={[styles.activityTime, { backgroundColor: item.timeColor }]}>
        <Text style={[styles.activityTimeText, { color: item.timeTextColor }]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#f0f1f5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.dateTag}>
            <Icon name="calendar-check" size={12} color="#0410b5" />
            <Text style={styles.dateText}>13 FEB 2026</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <TouchableOpacity key={stat.id} style={styles.statCard} activeOpacity={0.7}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(17, 38, 156, 0.1)' }]}>
                <Icon name={stat.icon} size={isSmallScreen ? 20 : 24} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
                <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#2E7D32' : '#D32F2F' }]}>
                  {stat.change}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Module Performance</Text>
            <View style={styles.pillBadge}>
              <Icon name="calendar-alt" size={10} color="#fff" />
              <Text style={styles.pillText}>Feb 2026</Text>
            </View>
          </View>

        {/* Module Activity Chart - Scrollable Version */}
<View style={styles.chartCard}>
  <View style={styles.chartHeader}>
    <Text style={styles.chartTitle}>Module activity</Text>
    <View style={styles.legendInline}>
      <View style={[styles.legendDot, { backgroundColor: '#11269C' }]} />
      <Text style={styles.legendText}>open/pending</Text>
    </View>
  </View>
  
  <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScrollView}>
    <View style={styles.chartWrapper}>
      <BarChart
        data={{
  labels: ['PTW', 'Training', 'Incident', 'Audit', 'Chemical', 'CAPA'],
  datasets: [
    {
      data: [28, 12, 14, 8, 47, 9],
      // Darker blue - reduced RGB values
        color: () => '#0A1A4A',
      strokeWidth: 2,
    },
    {
      data: [12, 5, 5, 2, 3, 5],
      // Darker orange - reduced RGB values
      color: () => '#8B4513',
      strokeWidth: 2,
    },
  ],
}}
        width={400} // Fixed width to accommodate all bars properly
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#e9ecf4',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 12,
          },
          barPercentage: 0.7,
          barRadius: 6,
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#707070',
            strokeDasharray: '0',
          },
          propsForLabels: {
            fontSize: 12,
            fontWeight: '600',
          },
          formatYLabel: (yLabel) => Math.round(yLabel).toString(),
        }}
        verticalLabelRotation={0}
        showValuesOnTopOfBars={false}
        fromZero
        withInnerLines={true}
        showBarTops={false}
        yAxisLabel=""
        yAxisSuffix=""
        style={styles.chart}
      />
    </View>
  </ScrollView>
  
  {/* Summary section like website */}
  <View style={styles.chartSummary}>
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#11269C' }]} />
      <Text style={styles.summaryText}>PTW:28</Text>
    </View>
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#3b82f6' }]} />
      <Text style={styles.summaryText}>Training:12</Text>
    </View>
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#f59e0b' }]} />
      <Text style={styles.summaryText}>CAPA:9</Text>
    </View>
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#4A90E2' }]} />
      <Text style={styles.summaryText}>Incident:14</Text>
    </View>
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#6b7280' }]} />
      <Text style={styles.summaryText}>Audit:8</Text>
    </View>
    <View style={styles.summaryItem}>
      <View style={[styles.summaryDot, { backgroundColor: '#10b981' }]} />
      <Text style={styles.summaryText}>Chemical:47</Text>
    </View>
  </View>
</View>

          {/* Incident Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Incidents by Severity</Text>
            <PieChart
              data={pieChartData}
              width={width - 64}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {/* Safety Modules */}
        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Modules</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modulesScroll}>
            {moduleData.map((module) => (
              <TouchableOpacity key={module.id} style={styles.moduleCard} activeOpacity={0.7}>
                <View style={styles.moduleThumbnail}>
                  <Icon name={module.icon} size={30} color="#fff" />
                  <View style={styles.moduleBadge}>
                    <Text style={styles.moduleBadgeText}>{module.active}</Text>
                  </View>
                </View>
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <View style={styles.moduleStatus}>
                    <Icon name="circle" size={8} color="#10b981" />
                    <Text style={styles.moduleStatusText}>{module.status}</Text>
                  </View>
                  <View style={styles.moduleMeta}>
                    <Text style={styles.metaText}>{module.meta1}</Text>
                    <Text style={styles.metaText}>{module.meta2}</Text>
                  </View>
                  <View style={styles.badgeContainer}>
                    {module.badges.map((badge, index) => (
                      <View key={index} style={[styles.miniBadge, { backgroundColor: module.badgeColors[index] }]}>
                        <Text style={[styles.miniBadgeText, { color: module.badgeTextColors[index] }]}>
                          {badge}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>SDS & Quick Access</Text>
          <View style={styles.resourceGrid}>
            {resourceData.map((resource) => (
              <TouchableOpacity key={resource.id} style={styles.resourceCard} activeOpacity={0.7}>
                <View style={[styles.resourceIcon, { backgroundColor: 'rgba(17, 38, 156, 0.1)' }]}>
                  <Icon name={resource.icon} size={20} color="#11269C" />
                </View>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceDescription}>{resource.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PTW Table */}
        <View style={styles.ptwSection}>
          <View style={styles.ptwHeader}>
            <View>
              <Text style={styles.ptwTitle}>Permit to Work</Text>
              <Text style={styles.ptwSubtitle}>Active & Pending · 28 permits</Text>
            </View>
            <View style={styles.ptwLastUpdated}>
              <Icon name="clock" size={12} color="#fff" />
              <Text style={styles.ptwLastUpdatedText}>10 min ago</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {['all', 'issued', 'awaiting', 'approved', 'pending'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterTabText, selectedFilter === filter && styles.activeFilterTabText]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* PTW List */}
          <FlatList
            data={filteredPtwData}
            renderItem={renderPtwItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.ptwList}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Icon name="history" size={20} color="#11269C" />
            <Text style={styles.activityTitle}>Recent Activity</Text>
          </View>
          <FlatList
            data={activityData}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height:75,
    backgroundColor: '#021476',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop:23,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    borderRadius: 20,
    marginLeft:3,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: '#f5f1f1',
  },
  dateTag: {
    backgroundColor: '#f3f4f8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  dateText: {
    color: '#021696',
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    width: (width - 32) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '800',
    color: '#000',
  },
  statLabel: {
    fontSize: isSmallScreen ? 10 : 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#000',
  },
  pillBadge: {
    backgroundColor: '#11269C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  pillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  modulesSection: {
    marginTop: 16,
    paddingLeft: 16,
  },
  modulesScroll: {
    marginTop: 8,
  },
  moduleCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  moduleThumbnail: {
    height: 80,
    backgroundColor: '#11269C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  moduleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#11269C',
  },
  moduleContent: {
    padding: 12,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  moduleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  moduleStatusText: {
    fontSize: 11,
    color: '#666',
  },
  moduleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#11269C',
    fontSize: 12,
    fontWeight: '600',
  },
  quickAccessSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  resourceGrid: {
    gap: 8,
    marginTop: 8,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 12,
    color: '#666',
  },
  ptwSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  ptwHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ptwTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  ptwSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  ptwLastUpdated: {
    backgroundColor: '#11269C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  ptwLastUpdatedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#11269C',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
  },
  ptwList: {
    gap: 8,
  },
  ptwCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  selectedPtwCard: {
    borderColor: '#11269C',
    borderWidth: 2,
  },
  ptwCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ptwIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ptwId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11269C',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  criticalPriority: {
    backgroundColor: '#fee2e2',
  },
  highPriority: {
    backgroundColor: '#FEF5E7',
  },
  mediumPriority: {
    backgroundColor: '#dbeafe',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1e293b',
  },
  ptwCardBody: {
    padding: 12,
    gap: 6,
  },
  ptwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ptwLabel: {
    fontSize: 11,
    color: '#999',
    width: 65,
  },
  ptwValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  ptwActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(17, 38, 156, 0.1)',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#11269C',
    fontWeight: '600',
  },
  activitySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  activityReporter: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  activityTime: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activityTimeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  // Add these to your styles object
chartScrollView: {
  marginBottom: 8,
},
chartWrapper: {
  paddingRight: 16, // Add padding at the end for better scrolling experience
},
chartHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
legendInline: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
legendDot: {
  width: 12,
  height: 12,
  borderRadius: 4,
},
legendText: {
  fontSize: 12,
  color: '#666',
},
chartSummary: {
  flexDirection: 'row',
  flexWrap: 'wrap', // Allow wrapping on small screens
  marginTop: 16,
  paddingHorizontal: 8,
  gap: 12, // Add gap between items
},
summaryItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  minWidth: 80, // Ensure minimum width for each item
},
summaryDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
},
summaryText: {
  fontSize: 12,
  color: '#333',
  fontWeight: '500',
},
});

export default SafetyDashboard;