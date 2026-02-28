import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;

// Lazy load heavy chart components
const BarChart = lazy(() => import('react-native-chart-kit').then(module => ({ default: module.BarChart })));
const PieChart = lazy(() => import('react-native-chart-kit').then(module => ({ default: module.PieChart })));
const LineChart = lazy(() => import('react-native-chart-kit').then(module => ({ default: module.LineChart })));

// Loading component for charts
const ChartLoader = () => (
  <View style={styles.chartLoader}>
    <ActivityIndicator size="small" color="#11269C" />
  </View>
);

const SafetyDashboard = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState('');
  const [chartsReady, setChartsReady] = useState(false);

  // Get current date on component mount
  useEffect(() => {
    const date = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options).toUpperCase().replace(',', '');
    setCurrentDate(formattedDate);
    
    // Mark charts as ready after a tiny delay to ensure UI renders first
    setTimeout(() => setChartsReady(true), 100);
  }, []);

  // ========== DATA STRUCTURES ==========
  const ptwData = {
    total: 24,
    active: 8,
    pending: 6,
    completed: 7,
    cancelled: 3,
    work_types: {
      "Hot Work": 5,
      "Height Work": 4,
      Electrical: 6,
      "Confined Space": 3,
      "Hazardous Material": 2,
      Others: 4,
    },
    departments: {
      Maint: 8,
      Elect: 6,
      Civil: 4,
      Process: 3,
      Facilities: 3,
    },
  };

  const incidentData = {
    total: 18,
    open: 5,
    investigating: 4,
    closed: 9,
    severity: {
      Critical: 2,
      Major: 5,
      Minor: 8,
      "Near Miss": 3,
    },
    types: {
      Injury: 7,
      "Near Miss": 4,
      "Property Damage": 3,
      Vehicle: 2,
      Environmental: 2,
    },
    monthly_trend: [3, 2, 4, 2, 3, 4],
  };

  const auditData = {
    total: 15,
    open: 4,
    investigating: 3,
    closed: 8,
    scores: [92, 78, 85, 95, 88, 82, 90, 75, 88, 92, 85, 79, 91, 87, 83],
  };

  const capaData = {
    total: 12,
    pending: 5,
    verification: 3,
    closed: 4,
    priority: {
      High: 4,
      Medium: 6,
      Low: 2,
    },
  };

  const chemicalData = {
    total: 45,
    active: 38,
    expired: 5,
    disposed: 2,
    hazards: {
      Flammable: 12,
      Toxic: 8,
      Corrosive: 10,
      Oxidizing: 5,
      Explosive: 3,
      Other: 7,
    },
    locations: {
      "Lab-01": 15,
      "Lab-02": 12,
      "Storage-03": 18,
    },
  };

  const trainingData = {
    total_courses: 8,
    completed: 3,
    in_progress: 4,
    not_started: 1,
    completion_rate: 68,
    avg_score: 87,
    monthly_completions: [12, 15, 18, 14, 20, 22],
  };

  // Stats data with navigation routes
  const statsData = [
    { 
      id: 1, 
      route: "PermitToWork",
      title: 'Active PTW', 
      value: '28', 
      icon: 'file-signature', 
      color: '#11269C', 
      change: '+12%',
      bgColor: 'rgba(17, 38, 156, 0.1)',
    },
    { 
      id: 2, 
      route: "IncidentManagement",
      title: 'Open Incidents', 
      value: '14', 
      icon: 'exclamation-circle', 
      color: '#bf0505', 
      change: '-5%',
      bgColor: 'rgba(220, 38, 38, 0.1)',
    },
    { 
      id: 3, 
      route: "CapaScreen",
      title: 'CAPA in Progress', 
      value: '9', 
      icon: 'check-double', 
      color: '#d18606', 
      change: '+3%',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    { 
      id: 4, 
      route: "ChemicalSafety",
      title: 'Chemicals', 
      value: '47', 
      icon: 'flask', 
      color: '#02aa12', 
      change: '+8%',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  ];

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
    propsForLabels: {
      fontSize: 10,
      fontWeight: '600',
    },
  };

  // Prepare chart data
  const ptwStatusPieData = [
    { name: 'Active', population: ptwData.active, color: '#10b981', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Pending', population: ptwData.pending, color: '#f59e0b', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Completed', population: ptwData.completed, color: '#11269C', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Cancelled', population: ptwData.cancelled, color: '#dc2626', legendFontColor: '#374151', legendFontSize: 12 },
  ];

  const workTypeData = Object.keys(ptwData.work_types).map((key, index) => ({
    name: key,
    population: ptwData.work_types[key],
    color: ['#ff6b35', '#dc2626', '#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'][index],
    legendFontColor: '#374151',
    legendFontSize: 12,
  }));

  const hazardData = Object.keys(chemicalData.hazards).map((key, index) => ({
    name: key,
    population: chemicalData.hazards[key],
    color: ['#ff6b35', '#dc2626', '#f59e0b', '#3b82f6', '#8b5cf6', '#6b7280'][index],
    legendFontColor: '#374151',
    legendFontSize: 12,
  }));

  const incidentTypeData = Object.keys(incidentData.types).map((key, index) => ({
    name: key,
    population: incidentData.types[key],
    color: ['#dc2626', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][index],
    legendFontColor: '#374151',
    legendFontSize: 12,
  }));

  const trainingCourseData = [
    { name: 'Completed', population: trainingData.completed, color: '#10b981', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'In Progress', population: trainingData.in_progress, color: '#f59e0b', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Not Started', population: trainingData.not_started, color: '#6b7280', legendFontColor: '#374151', legendFontSize: 12 },
  ];

  const locationData = {
    labels: Object.keys(chemicalData.locations),
    datasets: [{ data: Object.values(chemicalData.locations) }],
  };

  const deptData = {
    labels: Object.keys(ptwData.departments),
    datasets: [{ data: Object.values(ptwData.departments) }],
  };

  const capaPriorityData = {
    labels: Object.keys(capaData.priority),
    datasets: [{ data: Object.values(capaData.priority) }],
  };

  // Progress Bar Component
  const ProgressBar = ({ progress, color, height = 8, showPercentage = true }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { height }]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${progress}%`, backgroundColor: color }
          ]} 
        />
      </View>
      {showPercentage && <Text style={styles.progressText}>{progress}%</Text>}
    </View>
  );

  // Handle stat card press with navigation
  const handleStatPress = useCallback((route) => {
    if (route) {
      navigation.navigate(route);
    }
  }, [navigation]);

  // Handle back press
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
          <Text style={styles.headerTitle}>Safety Dashboard</Text>
          <View style={styles.dateTag}>
            <Icon name="calendar-check" size={12} color="#0410b5" />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>

        {/* Stats Grid with Navigation */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <TouchableOpacity 
              key={stat.id} 
              style={[
                styles.statCard,
                { 
                  backgroundColor: '#fff',
                  borderLeftWidth: 4,
                  borderLeftColor: stat.color,
                }
              ]}
              activeOpacity={0.7}
              onPress={() => handleStatPress(stat.route)}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                <Icon name={stat.icon} size={isSmallScreen ? 20 : 24} color={stat.color} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
                <View style={styles.statChangeContainer}>
                  <Icon 
                    name={stat.change.startsWith('+') ? 'arrow-up' : 'arrow-down'} 
                    size={8} 
                    color={stat.change.startsWith('+') ? '#10b981' : '#dc2626'} 
                  />
                  <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? '#10b981' : '#dc2626' }]}>
                    {stat.change}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts - Only render when ready */}
        {chartsReady && (
          <Suspense fallback={<ChartLoader />}>
            {/* PTW ANALYTICS SECTION */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Icon name="file-signature" size={18} color="#11269C" /> PTW Analytics
                </Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>24 Total</Text>
                </View>
              </View>

              <View style={styles.fourChartGrid}>
                {/* PTW Status Distribution */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Status Distribution</Text>
                    <View style={styles.chartDot} />
                  </View>
                  <View style={styles.canvasContainer}>
                    <PieChart
                      data={ptwStatusPieData}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 4 - 32)}
                      height={180}
                      chartConfig={chartConfig}
                      accessor="population"
                      paddingLeft="0"
                      absolute
                      hasLegend={false}
                      backgroundColor="transparent"
                    />
                  </View>
                  <View style={styles.chartFooter}>
                    <Text style={styles.chartTotal}>Total: {ptwData.total}</Text>
                    <View style={styles.legendContainer}>
                      {ptwStatusPieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                          <Text style={styles.legendText}>{item.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Work Type Distribution */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Work Type</Text>
                    <View style={styles.chartDot} />
                  </View>
                  <View style={styles.canvasContainer}>
                    <PieChart
                      data={workTypeData}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 4 - 32)}
                      height={180}
                      chartConfig={chartConfig}
                      accessor="population"
                      paddingLeft="0"
                      absolute
                      hasLegend={false}
                      backgroundColor="transparent"
                    />
                  </View>
                  <View style={styles.chartFooter}>
                    <View style={styles.legendContainer}>
                      {workTypeData.slice(0, 3).map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                          <Text style={styles.legendText}>{item.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Monthly Incident Trend */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Incident Trend</Text>
                    <View style={[styles.chartDot, { backgroundColor: '#dc2626' }]} />
                  </View>
                  <View style={styles.canvasContainer}>
                    <LineChart
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          data: incidentData.monthly_trend,
                          color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
                          strokeWidth: 3,
                        }],
                      }}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 4 - 32)}
                      height={180}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
                        fillShadowGradient: 'rgba(220, 38, 38, 0.1)',
                        fillShadowGradientOpacity: 1,
                      }}
                      bezier
                    />
                  </View>
                </View>

                {/* Audit Score Distribution */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Audit Scores</Text>
                    <View style={[styles.chartDot, { backgroundColor: '#3b82f6' }]} />
                  </View>
                  <View style={styles.canvasContainer}>
                    <BarChart
                      data={{
                        labels: ['75-79', '80-84', '85-89', '90-94', '95+'],
                        datasets: [{
                          data: [
                            auditData.scores.filter(s => s >= 75 && s < 80).length,
                            auditData.scores.filter(s => s >= 80 && s < 85).length,
                            auditData.scores.filter(s => s >= 85 && s < 90).length,
                            auditData.scores.filter(s => s >= 90 && s < 95).length,
                            auditData.scores.filter(s => s >= 95).length,
                          ],
                        }],
                      }}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 4 - 32)}
                      height={180}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      }}
                      fromZero
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* CHEMICAL SAFETY SECTION */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Icon name="flask" size={18} color="#11269C" /> Chemical Safety
                </Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{chemicalData.total} Chemicals</Text>
                </View>
              </View>

              <View style={styles.twoChartGrid}>
                {/* Chemical Hazard Classification */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>By Hazard Class</Text>
                    <View style={[styles.chartDot, { backgroundColor: '#ff6b35' }]} />
                  </View>
                  <View style={styles.canvasContainer}>
                    <BarChart
                      data={{
                        labels: hazardData.map(d => d.name.substring(0, 4)),
                        datasets: [{
                          data: hazardData.map(d => d.population),
                        }],
                      }}
                      width={isSmallScreen ? width - 64 : width - 64}
                      height={200}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                      }}
                      fromZero
                    />
                  </View>
                </View>

                {/* Chemical Location Distribution */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>By Location</Text>
                    <View style={[styles.chartDot, { backgroundColor: '#10b981' }]} />
                  </View>
                  <View style={styles.canvasContainer}>
                    <BarChart
                      data={locationData}
                      width={isSmallScreen ? width - 64 : width - 64}
                      height={200}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                      }}
                      fromZero
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* TRAINING SECTION */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Icon name="graduation-cap" size={18} color="#11269C" /> Training
                </Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{trainingData.completion_rate}% Complete</Text>
                </View>
              </View>

              <View style={styles.threeChartGrid}>
                {/* Training Completion Progress Bar */}
                <View style={[styles.chartCard, styles.progressCard]}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Completion Progress</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressStats}>
                      <Text style={styles.progressStatValue}>{trainingData.completion_rate}%</Text>
                      <Text style={styles.progressStatLabel}>Overall Completion</Text>
                    </View>
                    <ProgressBar progress={trainingData.completion_rate} color="#10b981" height={12} />
                  </View>
                </View>

                {/* Course Status */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Course Status</Text>
                  </View>
                  <View style={styles.canvasContainer}>
                    <PieChart
                      data={trainingCourseData}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 3 - 32)}
                      height={180}
                      chartConfig={chartConfig}
                      accessor="population"
                      paddingLeft="15"
                      absolute
                      backgroundColor="transparent"
                    />
                  </View>
                </View>

                {/* Monthly Completions */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Monthly</Text>
                  </View>
                  <View style={styles.canvasContainer}>
                    <BarChart
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          data: trainingData.monthly_completions,
                        }],
                      }}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 3 - 32)}
                      height={180}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      }}
                      fromZero
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* DEPARTMENT & INCIDENT ANALYSIS */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Icon name="hard-hat" size={18} color="#11269C" /> Dept & Incident
                </Text>
              </View>

              <View style={styles.threeChartGrid}>
                {/* PTW by Department */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>PTW by Dept</Text>
                  </View>
                  <View style={styles.canvasContainer}>
                    <BarChart
                      data={deptData}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 3 - 32)}
                      height={180}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
                      }}
                      fromZero
                    />
                  </View>
                </View>

                {/* Incident Types */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Incident Types</Text>
                  </View>
                  <View style={styles.canvasContainer}>
                    <PieChart
                      data={incidentTypeData}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 3 - 32)}
                      height={180}
                      chartConfig={chartConfig}
                      accessor="population"
                      paddingLeft="15"
                      absolute
                      backgroundColor="transparent"
                    />
                  </View>
                </View>

                {/* CAPA by Priority */}
                <View style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>CAPA Priority</Text>
                  </View>
                  <View style={styles.canvasContainer}>
                    <BarChart
                      data={capaPriorityData}
                      width={isSmallScreen ? width - 64 : (isMediumScreen ? width / 2 - 40 : width / 3 - 32)}
                      height={180}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                      }}
                      fromZero
                    />
                  </View>
                </View>
              </View>
            </View>
          </Suspense>
        )}

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
    height: 75,
    backgroundColor: '#021476',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 23,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    borderRadius: 20,
    marginLeft: 3,
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
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    width: (width - 34) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '800',
    color: '#111827',
    lineHeight: isSmallScreen ? 28 : 32,
  },
  statLabel: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 30,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterToggleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#11269C',
  },
  fourChartGrid: {
    flexDirection: isSmallScreen ? 'column' : (isMediumScreen ? 'row' : 'row'),
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  threeChartGrid: {
    flexDirection: isSmallScreen ? 'column' : (isMediumScreen ? 'row' : 'row'),
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  twoChartGrid: {
    flexDirection: isSmallScreen ? 'column' : (isMediumScreen ? 'column' : 'row'),
    gap: 14,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
    width: isSmallScreen ? '100%' : (isMediumScreen ? (width / 2 - 22) : (width / 4 - 18)),
  },
  progressCard: {
    minHeight: 100,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#11269C',
  },
  canvasContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  chartFooter: {
    marginTop: 10,
  },
  chartTotal: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#11269C',
    marginBottom: 6,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  gaugeCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -20 }],
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#11269C',
  },
  gaugeLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Progress Bar Styles
  progressContainer: {
    paddingVertical: 8,
  },
  progressStats: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#11269C',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#11269C',
    minWidth: 40,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  courseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courseStatText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  scoreText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  chartLoader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SafetyDashboard;