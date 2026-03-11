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
const chartWidth = width - 40;

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

  // Stats data
  const statsData = [
    { id: 1, title: 'ACTIVE PTW', value: '28', icon: 'file-signature', color: '#11269C', bgColor: '#EEF2FF' },
    { id: 2, title: 'OPEN INCIDENTS', value: '14', icon: 'exclamation-circle', color: '#DC2626', bgColor: '#FEE2E2' },
    { id: 3, title: 'CAPA IN PROGRESS', value: '9', icon: 'check-double', color: '#F59E0B', bgColor: '#FEF3C7' },
    { id: 4, title: 'CHEMICALS', value: '47', icon: 'flask', color: '#10B981', bgColor: '#D1FAE5' },
  ];

  // Location Distribution Data
  const locationData = [
    { name: 'Main Plant - Building A', value: 8, color: '#10B981' },
    { name: 'Warehouse - Section B', value: 6, color: '#3B82F6' },
    { name: 'Administrative Block', value: 3, color: '#F59E0B' },
    { name: 'Production Line 2', value: 4, color: '#EF4444' },
    { name: 'Maintenance Workshop', value: 3, color: '#8B5CF6' },
  ];

  // People Count Data
  const peopleCountData = [
    { location: 'Main Plant - Building A', count: 45 },
    { location: 'Warehouse - Section B', count: 28 },
    { location: 'Administrative Block', count: 15 },
    { location: 'Production Line 2', count: 32 },
    { location: 'Maintenance Workshop', count: 18 },
  ];

  // PTW Status Data
  const ptwStatusData = [
    { name: 'Active', value: 8, color: '#10B981' },
    { name: 'Pending', value: 6, color: '#F59E0B' },
    { name: 'Completed', value: 7, color: '#11269C' },
    { name: 'Cancelled', value: 3, color: '#DC2626' },
  ];

  // Work Types Data
  const workTypesData = [
    { name: 'Hot Work', value: 5, color: '#FF6B35' },
    { name: 'Height Work', value: 4, color: '#DC2626' },
    { name: 'Electrical', value: 6, color: '#F59E0B' },
    { name: 'Confined Space', value: 3, color: '#3B82F6' },
    { name: 'Hazardous Material', value: 2, color: '#8B5CF6' },
    { name: 'Others', value: 4, color: '#6B7280' },
  ];

  // Work Types by Location Data
  const workTypesByLocation = [
    { 
      location: 'Main Plant - Building A', 
      hotWork: 2, 
      heightWork: 2, 
      electrical: 3, 
      confined: 0, 
      hazardous: 0, 
      others: 1,
      total: 8
    },
    { 
      location: 'Warehouse - Section B', 
      hotWork: 0, 
      heightWork: 2, 
      electrical: 2, 
      confined: 1, 
      hazardous: 0, 
      others: 1,
      total: 6
    },
    { 
      location: 'Administrative Block', 
      hotWork: 0, 
      heightWork: 0, 
      electrical: 1, 
      confined: 0, 
      hazardous: 0, 
      others: 2,
      total: 3
    },
    { 
      location: 'Production Line 2', 
      hotWork: 2, 
      heightWork: 0, 
      electrical: 0, 
      confined: 0, 
      hazardous: 1, 
      others: 1,
      total: 4
    },
    { 
      location: 'Maintenance Workshop', 
      hotWork: 0, 
      heightWork: 0, 
      electrical: 0, 
      confined: 2, 
      hazardous: 0, 
      others: 1,
      total: 3
    },
  ];

  // PTW Status by Location Data
  const statusByLocation = [
    { 
      location: 'Main Plant - Building A', 
      active: 3, 
      pending: 2, 
      completed: 2, 
      cancelled: 1,
      total: 8
    },
    { 
      location: 'Warehouse - Section B', 
      active: 2, 
      pending: 1, 
      completed: 2, 
      cancelled: 1,
      total: 6
    },
    { 
      location: 'Administrative Block', 
      active: 1, 
      pending: 1, 
      completed: 1, 
      cancelled: 0,
      total: 3
    },
    { 
      location: 'Production Line 2', 
      active: 1, 
      pending: 1, 
      completed: 1, 
      cancelled: 1,
      total: 4
    },
    { 
      location: 'Maintenance Workshop', 
      active: 1, 
      pending: 1, 
      completed: 1, 
      cancelled: 0,
      total: 3
    },
  ];

  // Chemical Hazard Data - EXACT values matching screenshot
  const chemicalHazardData = [
    { name: 'Flammable', value: 12, color: '#FF6B35' },
    { name: 'Toxic', value: 8, color: '#DC2626' },
    { name: 'Corrosive', value: 10, color: '#F59E0B' },
    { name: 'Oxidizing', value: 5, color: '#3B82F6' },
    { name: 'Explosive', value: 3, color: '#8B5CF6' },
    { name: 'Other', value: 7, color: '#6B7280' },
  ];

  // Chemical Location Data - EXACT values matching screenshot
  const chemicalLocationData = [
    { name: 'Lab-01', value: 15, color: '#10B981' },
    { name: 'Lab-02', value: 12, color: '#3B82F6' },
    { name: 'Storage-03', value: 18, color: '#F59E0B' },
  ];

  // Training Data
  const trainingCompletion = 68;
  const courseStatusData = [
    { name: 'Completed', value: 3, color: '#10B981' },
    { name: 'In Progress', value: 4, color: '#F59E0B' },
    { name: 'Not Started', value: 1, color: '#6B7280' },
  ];
  const monthlyCompletions = [12, 15, 18, 14, 20, 22];

  // Department Data
  const departmentData = [
    { name: 'Maintenance', value: 8, color: '#11269C' },
    { name: 'Electrical', value: 6, color: '#4A90E2' },
    { name: 'Civil', value: 4, color: '#10B981' },
    { name: 'Process', value: 3, color: '#F59E0B' },
    { name: 'Facilities', value: 3, color: '#DC2626' },
  ];

  // Incident Types Data
  const incidentTypesData = [
    { name: 'Injury', value: 7, color: '#DC2626' },
    { name: 'Near Miss', value: 4, color: '#F59E0B' },
    { name: 'Property Damage', value: 3, color: '#3B82F6' },
    { name: 'Vehicle', value: 2, color: '#10B981' },
    { name: 'Environmental', value: 2, color: '#8B5CF6' },
  ];

  // CAPA Priority Data
  const capaPriorityData = [
    { name: 'High', value: 4, color: '#DC2626' },
    { name: 'Medium', value: 6, color: '#F59E0B' },
    { name: 'Low', value: 2, color: '#10B981' },
  ];

  // Monthly Incident Trend Data
  const monthlyIncidentData = [3, 2, 4, 2, 3, 4];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Work Types Stacked Bar Chart
  const WorkTypesStackedBar = () => {
    const maxValue = 8;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartMainTitle}>Work Types by Location</Text>
        <Text style={styles.yAxisLabel}>Number of PTWs</Text>
        
        <View style={styles.chartArea}>
          <View style={styles.yAxis}>
            <Text style={styles.yAxisText}>8</Text>
            <Text style={styles.yAxisText}>6</Text>
            <Text style={styles.yAxisText}>4</Text>
            <Text style={styles.yAxisText}>2</Text>
            <Text style={styles.yAxisText}>0</Text>
          </View>
          
          <View style={styles.chartGrid}>
            <View style={styles.gridLines}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, styles.lastGridLine]} />
            </View>
            
            <View style={styles.barsContainer}>
              {workTypesByLocation.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.stackedBar}>
                    {item.others > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.others / maxValue) * 100}%`, backgroundColor: '#6B7280' }]} />
                    )}
                    {item.hazardous > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.hazardous / maxValue) * 100}%`, backgroundColor: '#8B5CF6' }]} />
                    )}
                    {item.confined > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.confined / maxValue) * 100}%`, backgroundColor: '#3B82F6' }]} />
                    )}
                    {item.electrical > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.electrical / maxValue) * 100}%`, backgroundColor: '#F59E0B' }]} />
                    )}
                    {item.heightWork > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.heightWork / maxValue) * 100}%`, backgroundColor: '#DC2626' }]} />
                    )}
                    {item.hotWork > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.hotWork / maxValue) * 100}%`, backgroundColor: '#FF6B35' }]} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.xAxisContainer}>
          {workTypesByLocation.map((item, index) => (
            <Text key={index} style={styles.xAxisLabel} numberOfLines={2}>
              {item.location.split(' - ')[0]}
            </Text>
          ))}
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF6B35' }]} />
              <Text style={styles.legendText}>Hot Work</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendText}>Height Work</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Electrical</Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Confined Space</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Hazardous</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.legendText}>Others</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // PTW Status Stacked Bar Chart
  const StatusStackedBar = () => {
    const maxValue = 8;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartMainTitle}>PTW Status by Location</Text>
        <Text style={styles.yAxisLabel}>Number of PTWs</Text>
        
        <View style={styles.chartArea}>
          <View style={styles.yAxis}>
            <Text style={styles.yAxisText}>8</Text>
            <Text style={styles.yAxisText}>6</Text>
            <Text style={styles.yAxisText}>4</Text>
            <Text style={styles.yAxisText}>2</Text>
            <Text style={styles.yAxisText}>0</Text>
          </View>
          
          <View style={styles.chartGrid}>
            <View style={styles.gridLines}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={[styles.gridLine, styles.lastGridLine]} />
            </View>
            
            <View style={styles.barsContainer}>
              {statusByLocation.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.stackedBar}>
                    {item.cancelled > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.cancelled / maxValue) * 100}%`, backgroundColor: '#DC2626' }]} />
                    )}
                    {item.completed > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.completed / maxValue) * 100}%`, backgroundColor: '#3B82F6' }]} />
                    )}
                    {item.pending > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.pending / maxValue) * 100}%`, backgroundColor: '#F59E0B' }]} />
                    )}
                    {item.active > 0 && (
                      <View style={[styles.barSegment, { height: `${(item.active / maxValue) * 100}%`, backgroundColor: '#10B981' }]} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.xAxisContainer}>
          {statusByLocation.map((item, index) => (
            <Text key={index} style={styles.xAxisLabel} numberOfLines={2}>
              {item.location.split(' - ')[0]}
            </Text>
          ))}
        </View>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Active</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.legendText}>Cancelled</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

// Chemical Hazard Chart - With properly aligned Y-axis and consistent spacing
const ChemicalHazardChart = () => {
  const maxValue = 12;
  const chemicalHazardData = [
    { name: 'Flammable', value: 12, color: '#FF6B35' },
    { name: 'Toxic', value: 8, color: '#DC2626' },
    { name: 'Corrosive', value: 10, color: '#F59E0B' },
    { name: 'Oxidizing', value: 5, color: '#3B82F6' },
    { name: 'Explosive', value: 3, color: '#8B5CF6' },
    { name: 'Other', value: 7, color: '#6B7280' },
  ];
  
  // Generate Y-axis values from 0 to maxValue with equal steps
  const yAxisValues = [12, 10, 8, 6, 4, 2, 0];
  
  return (
    <View style={styles.chemicalCard}>
      <Text style={styles.chemicalTitle}>Chemical Inventory by Hazard Class</Text>
      
      {/* Chart container with Y-axis */}
      <View style={styles.chemicalChartContainer}>
        {/* Y-axis labels with consistent spacing */}
        <View style={styles.chemicalYAxis}>
          {yAxisValues.map((value, index) => (
            <Text key={index} style={styles.chemicalYAxisText}>{value}</Text>
          ))}
        </View>
        
        {/* Bars and grid */}
        <View style={styles.chemicalBarsArea}>
          {/* Grid lines - exactly matching Y-axis positions */}
          <View style={styles.chemicalGridContainer}>
            {yAxisValues.map((_, index) => (
              <View key={index} style={styles.chemicalGridLine} />
            ))}
          </View>
          
          {/* Bars with labels */}
          <View style={styles.chemicalBarsWrapper}>
            {chemicalHazardData.map((item, index) => (
              <View key={index} style={styles.chemicalBarColumn}>
                <View style={styles.chemicalBarContainer}>
                  <View 
                    style={[
                      styles.chemicalBarFill, 
                      { 
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chemicalBarLabel}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* X-axis title */}
      <Text style={styles.chemicalXAxisTitle}>Hazard Class</Text>
      
      {/* Color boxes legend */}
      <View style={styles.chemicalLegend}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#FF6B35' }]} />
            <Text style={styles.legendText}>Flammable</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.legendText}>Toxic</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Corrosive</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Oxidizing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Explosive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.legendText}>Other</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Chemical Location Chart - Fixed positioning with proper spacing
const ChemicalLocationChart = () => {
  const maxValue = 18;
  const chemicalLocationData = [
    { name: 'Lab-01', value: 15, color: '#10B981' },
    { name: 'Lab-02', value: 12, color: '#3B82F6' },
    { name: 'Storage-03', value: 18, color: '#F59E0B' },
  ];
  
  // Generate Y-axis values from 0 to maxValue with equal steps
  const yAxisValues = [18, 16, 14, 12, 10, 8, 6, 4, 2, 0];
  
  return (
    <View style={styles.chemicalCard}>
      <Text style={styles.chemicalTitle}>Chemicals by Storage Location</Text>
      
      {/* Chart container with proper spacing */}
      <View style={styles.locationChartWrapper}>
        {/* Y-axis values with consistent spacing */}
        <View style={styles.locationYAxis}>
          {yAxisValues.map((value, index) => (
            <Text key={index} style={styles.locationYAxisText}>{value}</Text>
          ))}
        </View>
        
        {/* Bars and grid */}
        <View style={styles.locationBarsArea}>
          {/* Grid lines - exactly matching Y-axis positions */}
          <View style={styles.locationGridContainer}>
            {yAxisValues.map((_, index) => (
              <View key={index} style={styles.locationGridLine} />
            ))}
          </View>
          
          {/* Bars */}
          <View style={styles.locationBarsRow}>
            {chemicalLocationData.map((item, index) => (
              <View key={index} style={styles.locationBarColumn}>
                <View 
                  style={[
                    styles.locationBar, 
                    { 
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
                <Text style={styles.locationBarLabel}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* X-axis title */}
      <Text style={styles.locationXAxisTitle}>Storage Location</Text>
    </View>
  );
};

  // Gauge Chart Component
  const GaugeChart = ({ percentage }) => (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeWrapper}>
        <View style={[styles.gaugeFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.gaugeValue}>{percentage}% Completed</Text>
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
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Dashboard</Text>
          <View style={styles.dateTag}>
            <Icon name="calendar-check" size={12} color="#11269C" />
            <Text style={styles.dateText}>13 FEB 2026</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* PTW Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="file-signature" size={18} color="#11269C" /> PTW Analytics
          </Text>

          {/* Location Distribution */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Distribution</Text>
            <Text style={styles.cardSubtitle}>PTWs by Location</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <PieChart
                  data={locationData}
                  width={chartWidth}
                  height={180}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
                  }}
                  accessor="value"
                  paddingLeft="15"
                  absolute
                  backgroundColor="transparent"
                />
              </Suspense>
            </View>
            <View style={styles.locationList}>
              {locationData.map((item, index) => (
                <Text key={index} style={styles.locationText}>
                  {item.value} {item.name}
                </Text>
              ))}
            </View>
          </View>

          {/* People Count & Supervisors */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>People Count & Supervisors</Text>
            <Text style={styles.cardSubtitle}>Number of People</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <BarChart
                  data={{
                    labels: peopleCountData.map(item => item.location.split(' - ')[0]),
                    datasets: [{ data: peopleCountData.map(item => item.count) }],
                  }}
                  width={chartWidth}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                  yAxisLabel=""
                  yAxisSuffix=""
                  segments={5}
                />
              </Suspense>
            </View>
            <View style={styles.locationList}>
              {peopleCountData.map((item, index) => (
                <Text key={index} style={styles.locationText}>{item.location}</Text>
              ))}
            </View>
          </View>

          {/* PTW Status Distribution */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PTW Status Distribution</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <PieChart
                  data={ptwStatusData}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="value"
                  paddingLeft="15"
                  absolute
                  backgroundColor="transparent"
                />
              </Suspense>
            </View>
            <Text style={styles.totalText}>Total: 24</Text>
            <View style={styles.legendRow}>
              {ptwStatusData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Work Types by Location */}
          <WorkTypesStackedBar />

          {/* PTW Status by Location */}
          <StatusStackedBar />

          {/* Work Type Distribution */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Work Type Distribution</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <PieChart
                  data={workTypesData}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="value"
                  paddingLeft="15"
                  absolute
                  backgroundColor="transparent"
                />
              </Suspense>
            </View>
            <View style={styles.workTypesGrid}>
              {workTypesData.map((item, index) => (
                <View key={index} style={styles.workTypeItem}>
                  <View style={[styles.workTypeDot, { backgroundColor: item.color }]} />
                  <Text style={styles.workTypeText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Monthly Incident Trend */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Incident Trend</Text>
            <View style={styles.monthLabels}>
              {months.map((month, index) => (
                <Text key={index} style={styles.monthLabel}>{month}</Text>
              ))}
            </View>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <LineChart
                  data={{
                    labels: months,
                    datasets: [{
                      data: monthlyIncidentData,
                      color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
                      strokeWidth: 3,
                    }],
                  }}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
                  }}
                  bezier
                  withDots={true}
                  withShadow={true}
                />
              </Suspense>
            </View>
          </View>
        </View>

        {/* Chemical Safety Analytics - UPDATED to match screenshot exactly */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="flask" size={18} color="#10B981" /> Chemical Safety Analytics
          </Text>

          {/* Chemical Inventory by Hazard Class */}
          <ChemicalHazardChart />

          {/* Chemicals by Storage Location */}
          <ChemicalLocationChart />
        </View>

        {/* Training Analytics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="graduation-cap" size={18} color="#3B82F6" /> Training Analytics
          </Text>

          {/* Training Completion */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Training Completion</Text>
            <GaugeChart percentage={trainingCompletion} />
          </View>

          {/* Course Status */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Course Status</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <PieChart
                  data={courseStatusData}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="value"
                  paddingLeft="15"
                  absolute
                  backgroundColor="transparent"
                />
              </Suspense>
            </View>
            <View style={styles.legendRow}>
              {courseStatusData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Monthly Completions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Completions</Text>
            <View style={styles.monthLabels}>
              {months.map((month, index) => (
                <Text key={index} style={styles.monthLabel}>{month}</Text>
              ))}
            </View>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <BarChart
                  data={{
                    labels: months,
                    datasets: [{ data: monthlyCompletions }],
                  }}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                />
              </Suspense>
            </View>
          </View>
        </View>

        {/* Department & Incident Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="hard-hat" size={18} color="#DC2626" /> Department & Incident Analysis
          </Text>

          {/* PTW by Department */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PTW by Department</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <BarChart
                  data={{
                    labels: departmentData.map(item => item.name),
                    datasets: [{ data: departmentData.map(item => item.value) }],
                  }}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                />
              </Suspense>
            </View>
          </View>

          {/* Incident Types */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Incident Types</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <PieChart
                  data={incidentTypesData}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="value"
                  paddingLeft="15"
                  absolute
                  backgroundColor="transparent"
                />
              </Suspense>
            </View>
            <View style={styles.incidentLegend}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                  <Text style={styles.legendText}>Injury</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendText}>Near Miss</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.legendText}>Property Damage</Text>
                </View>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Vehicle</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.legendText}>Environmental</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CAPA by Priority */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CAPA by Priority</Text>
            <View style={styles.chartWrapper}>
              <Suspense fallback={<ChartLoader />}>
                <BarChart
                  data={{
                    labels: capaPriorityData.map(item => item.name),
                    datasets: [{ data: capaPriorityData.map(item => item.value) }],
                  }}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                  }}
                  fromZero
                  showValuesOnTopOfBars
                />
              </Suspense>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(17, 38, 156, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  style: { borderRadius: 16 },
  propsForLabels: { fontSize: 10, fontWeight: '600' },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop:20,
    paddingVertical: 16,
    backgroundColor: '#021476',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginLeft: 8,
  },
  dateTag: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 40,
    gap: 8,
  },
  dateText: {
    color: '#11269C',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 36) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    lineHeight: 32,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationList: {
    marginTop: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginVertical: 2,
  },
  totalText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#11269C',
    marginVertical: 8,
  },
  // Chart Styles for Stacked Bars
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  chartMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 30,
  },
  chartArea: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 10,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartGrid: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  lastGridLine: {
    backgroundColor: '#D1D5DB',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 5,
  },
  barColumn: {
    width: 40,
    height: '100%',
    justifyContent: 'flex-end',
  },
  stackedBar: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barSegment: {
    width: '100%',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  xAxisLabel: {
    width: 60,
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  legendContainer: {
    marginTop: 20,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Chemical Chart Styles - EXACT match
  chemicalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  chemicalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  chemicalBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  chemicalLabel: {
    width: 80,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  chemicalBarTrack: {
    flex: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  chemicalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chemicalValue: {
    width: 25,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'right',
  },
  chemicalScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 88,
    marginTop: 12,
    marginBottom: 16,
  },
  chemicalScaleNum: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  chemicalLegend: {
    marginTop: 8,
  },
  // Location Chart Styles - Vertical bars
  locationChartArea: {
    flexDirection: 'row',
    height: 220,
    marginTop: 10,
  },
  locationYAxis: {
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  locationYAxisText: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '500',
  },
  locationBarsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    position: 'relative',
  },
  locationGridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  locationGridLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  locationBarColumn: {
    width: 50,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  locationBar: {
    width: 30,
    borderRadius: 4,
    marginBottom: 8,
  },
  locationBarLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Work Types Grid
  workTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  workTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 6,
  },
  workTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 6,
  },
  workTypeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Month Labels
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Gauge Styles
  gaugeContainer: {
    alignItems: 'center',
    padding: 8,
  },
  gaugeWrapper: {
    width: '100%',
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  gaugeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11269C',
  },
  incidentLegend: {
    marginTop: 12,
  },
  chartLoader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
// Chemical Chart Styles - Completely fixed and consolidated
chemicalCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  marginBottom: 16,
},
chemicalTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#000',
  marginBottom: 20,
},
// Main chart container with Y-axis and bars
chemicalChartContainer: {
  flexDirection: 'row',
  height: 220,
  marginBottom: 10,
},
// Y-axis styles
chemicalYAxis: {
  width: 35,
  height: 200,
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  paddingRight: 8,
  marginTop: 0,
},
chemicalYAxisText: {
  fontSize: 10,
  color: '#6B7280',
  fontWeight: '500',
  textAlign: 'right',
  lineHeight: 20, // This creates even spacing
  height: 20, // Fixed height for each label
},
// Bars area with grid
chemicalBarsArea: {
  flex: 1,
  position: 'relative',
  height: 200,
},
// Grid lines container
chemicalGridContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 200,
  justifyContent: 'space-between',
},
chemicalGridLine: {
  height: 1,
  backgroundColor: '#E5E7EB',
  width: '100%',
},
// Bars wrapper
chemicalBarsWrapper: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  height: 200,
  paddingHorizontal: 5,
},
// Individual bar column
chemicalBarColumn: {
  width: 45,
  alignItems: 'center',
  height: 200,
  justifyContent: 'flex-end',
},
// Bar container
chemicalBarContainer: {
  width: 30,
  height: 180, // Leave room for labels
  justifyContent: 'flex-end',
  marginBottom: 0, // Space for label
},
// Bar fill
chemicalBarFill: {
  width: '100%',
  borderRadius: 4,
},
// Bar label
chemicalBarLabel: {
  fontSize: 10,
  color: '#374151',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 5,
  width: 60,
  position: 'absolute',
  bottom: -20,
  left: -7,
},
// X-axis title
chemicalXAxisTitle: {
  fontSize: 11,
  color: '#6B7280',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 10,
  marginBottom: 15,
},
// Legend styles
chemicalLegend: {
  marginTop: 16,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
},
legendColorBox: {
  width: 14,
  height: 14,
  borderRadius: 3,
  marginRight: 6,
},
legendRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginVertical: 2,
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 8,
  marginVertical: 2,
},
legendText: {
  fontSize: 10,
  color: '#6B7280',
  fontWeight: '500',
},

// Location Chart Styles - Fixed positioning with proper spacing
locationChartWrapper: {
  flexDirection: 'row',
  height: 220,
  marginTop: 10,
  marginBottom: 10,
},
locationYAxis: {
  width: 35,
  height: 200,
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  paddingRight: 8,
},
locationYAxisText: {
  fontSize: 10,
  color: '#6B7280',
  fontWeight: '500',
  textAlign: 'right',
  lineHeight: 20,
  height: 20,
},
locationBarsArea: {
  flex: 1,
  position: 'relative',
  height: 200,
},
locationGridContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 200,
  justifyContent: 'space-between',
},
locationGridLine: {
  height: 1,
  backgroundColor: '#E5E7EB',
  width: '100%',
},
locationBarsRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'flex-end',
  height: 200,
  paddingHorizontal: 5,
},
locationBarColumn: {
  width: 60,
  alignItems: 'center',
  height: 200,
  justifyContent: 'flex-end',
},
locationBar: {
  width: 35,
  borderRadius: 4,
  marginBottom: 0, // Space for label
},
locationBarLabel: {
  fontSize: 10,
  color: '#374151',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 5,
  position: 'absolute',
  bottom: -20,
  width: 60,
},
locationXAxisTitle: {
  fontSize: 11,
  color: '#6B7280',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 5,
},

});
export default SafetyDashboard;