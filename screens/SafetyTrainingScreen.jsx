import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Modal,
  Image,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

const SafetyTrainingScreen = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef(null);

  const [trainingCards, setTrainingCards] = useState([
    {
      id: 1,
      title: 'Fire Safety & Extinguisher Usage',
      subtitle: 'Essential fire safety protocols',
      description:
        'Learn how to identify fire types and use different extinguishers effectively. Includes hands-on demonstration and safety procedures.',
      thumbnail:
        'https://mybites.io/wp-content/uploads/2021/11/Safety-training-at-the-warehouse.jpg',
      postedTime: '2 days ago',
      batchStatus: 'in-progress',
      type: 'video',
      videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', // Sample video URL
      content: [
        {
          type: 'video',
          title: 'Fire Extinguisher Demo',
          url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
        },
        {
          type: 'pdf',
          title: 'Fire Safety Manual',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        {
          type: 'text',
          title: 'Emergency Procedures',
          content:
            'In case of fire, follow RACE: Rescue, Alarm, Contain, Extinguish',
        },
      ],
    },
    {
      id: 2,
      title: 'PPE Selection and Inspection',
      subtitle: 'Personal Protective Equipment',
      description:
        'Comprehensive guide to selecting and inspecting various PPE including helmets, gloves, safety glasses, and harnesses.',
      thumbnail:
        'https://blr.com/app/uploads/2023/07/4-best-practices-for-new-employee-safety-training.jpg',
      postedTime: '5 days ago',
      batchStatus: 'not-started',
      type: 'pdf',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfName: 'PPE_Selection_Guide_2025.pdf',
      content: [
        {
          type: 'pdf',
          title: 'PPE Inspection Checklist',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        {
          type: 'text',
          title: 'PPE Maintenance Tips',
          content:
            'Inspect PPE before each use. Replace if damaged or expired.',
        },
      ],
    },
    {
      id: 3,
      title: 'Confined Space Entry',
      subtitle: 'Safety procedures and protocols',
      description:
        'Complete training on confined space entry procedures, gas testing, ventilation requirements, and emergency rescue.',
      thumbnail:
        'https://freakingfelix.com/wp-content/uploads/2024/04/training-survey.jpg',
      postedTime: '1 week ago',
      batchStatus: 'completed',
      type: 'video',
      videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
      content: [
        {
          type: 'video',
          title: 'Entry Procedures',
          url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
        },
        {
          type: 'pdf',
          title: 'Gas Testing Guide',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        { 
          type: 'pdf', 
          title: 'Rescue Plan', 
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
        },
        {
          type: 'text',
          title: 'Permit Requirements',
          content:
            'Always obtain valid confined space entry permit before proceeding.',
        },
      ],
    },
    {
      id: 4,
      title: 'Electrical Safety - Lockout/Tagout',
      subtitle: 'Control hazardous energy',
      description:
        'Learn proper lockout/tagout procedures for electrical equipment maintenance and repair work.',
      thumbnail:
        'https://www.thesafetymaster.com/wp-content/uploads/2022/06/health-and-safety-training-solutions.jpg',
      postedTime: '3 days ago',
      batchStatus: 'in-progress',
      type: 'mixed',
      content: [
        {
          type: 'text',
          title: 'LOTO Procedure',
          content:
            'Isolate energy sources, lock devices, verify zero energy state.',
        },
        {
          type: 'text',
          title: 'Equipment List',
          content:
            'All electrical panels, switchgear, and motor control centers.',
        },
      ],
    },
    {
      id: 5,
      title: 'Chemical Handling & MSDS',
      subtitle: 'Hazardous materials management',
      description:
        'Safe handling, storage, and disposal of hazardous chemicals. Understanding Material Safety Data Sheets.',
      thumbnail:
        'https://i0.wp.com/facilityresults.com/wp-content/uploads/2021/09/VideoODImage.jpeg',
      postedTime: '1 day ago',
      batchStatus: 'not-started',
      type: 'pdf',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfName: 'Chemical_Safety_Handbook.pdf',
      content: [
        {
          type: 'pdf',
          title: 'MSDS Collection',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        {
          type: 'text',
          title: 'Spill Response',
          content: 'Use spill kit, evacuate area, notify supervisor.',
        },
      ],
    },
  ]);

  const getBatchStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in-progress':
        return 'clock';
      case 'not-started':
        return 'times-circle';
      default:
        return 'circle';
    }
  };

  const getBatchStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#059669';
      case 'in-progress':
        return '#d97706';
      case 'not-started':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getBatchStatusBgColor = (status) => {
    switch (status) {
      case 'completed':
        return '#d1fae5';
      case 'in-progress':
        return '#fef3c7';
      case 'not-started':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const getBatchStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return status;
    }
  };

  const filteredCards = trainingCards.filter(
    (card) =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowDetailsModal(true);
  };

  const handleBackClick = () => {
    setSelectedCard(null);
    setShowDetailsModal(false);
    setShowVideoPlayer(false);
    setIsFullscreen(false);
    Orientation.lockToPortrait();
  };

  const handlePlayVideo = (videoUrl, videoTitle) => {
    setCurrentVideo({ url: videoUrl, title: videoTitle });
    setShowVideoPlayer(true);
    setIsPaused(false);
    // Allow both portrait and landscape for video
    Orientation.unlockAllOrientations();
  };

  const handleCloseVideo = () => {
    setShowVideoPlayer(false);
    setCurrentVideo(null);
    setIsPaused(true);
    setIsFullscreen(false);
    Orientation.lockToPortrait();
  };

  const handleOpenPDF = (pdfUrl, pdfTitle) => {
    // For web URLs, we can open in browser
    if (pdfUrl.startsWith('http')) {
      Linking.openURL(pdfUrl).catch(() => {
        Alert.alert('Error', 'Could not open PDF');
      });
    } else {
      Alert.alert('Info', `Opening PDF: ${pdfTitle}`);
    }
  };

  const handleVideoLoad = (data) => {
    setVideoDuration(data.duration);
  };

  const handleVideoProgress = (data) => {
    setVideoProgress(data.currentTime);
  };

  const handleVideoEnd = () => {
    setIsPaused(true);
    Alert.alert('Video Completed', 'You have finished watching this video.');
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderPDFCard = (pdfItem) => {
    if (!pdfItem || !pdfItem.url) return null;

    return (
      <TouchableOpacity
        style={styles.pdfHorizontalCard}
        onPress={() => handleOpenPDF(pdfItem.url, pdfItem.title || pdfItem.pdfName)}
      >
        <Icon name="file-pdf" size={24} color="#dc2626" />
        <Text style={styles.pdfName} numberOfLines={1}>
          {pdfItem.title || pdfItem.pdfName || 'PDF Document'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContentItem = (item, index) => {
    switch (item.type) {
      case 'video':
        return (
          <TouchableOpacity 
            key={index} 
            style={styles.contentItemVideo}
            onPress={() => handlePlayVideo(item.url, item.title)}
          >
            <Icon name="play-circle" size={20} color="#dc2626" />
            <Text style={styles.contentTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.videoBadge}>
              <Text style={styles.badgeText}>Video</Text>
            </View>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => handlePlayVideo(item.url, item.title)}
            >
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      case 'pdf':
        return (
          <TouchableOpacity
            key={index}
            style={styles.contentItemPdf}
            onPress={() => handleOpenPDF(item.url, item.title)}
          >
            <Icon name="file-pdf" size={20} color="#dc2626" />
            <Text style={styles.contentTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.pdfBadge}>
              <Text style={styles.badgeText}>PDF</Text>
            </View>
            <Text style={styles.openLink}>Open →</Text>
          </TouchableOpacity>
        );
      case 'text':
        return (
          <View key={index} style={styles.contentItemText}>
            <View style={styles.textContent}>
              <Text style={styles.textTitle}>{item.title}</Text>
              <Text style={styles.textDescription}>{item.content}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTrainingCard = ({ item }) => (
    <TouchableOpacity
      style={styles.trainingCard}
      activeOpacity={0.7}
      onPress={() => handleCardClick(item)}
    >
      <View style={styles.cardThumbnail}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Icon name="play" size={30} color="#fff" />
          </View>
        )}
        {item.type === 'video' && (
          <View style={styles.videoIndicator}>
            <Icon name="play" size={16} color="#dc2626" />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>

        <View style={styles.cardMeta}>
          <View style={styles.postedTime}>
            <Icon name="calendar-alt" size={10} color="#6b7280" />
            <Text style={styles.postedTimeText}>{item.postedTime}</Text>
          </View>
        </View>

        <View style={[styles.batchStatus, { backgroundColor: getBatchStatusBgColor(item.batchStatus) }]}>
          <Icon name={getBatchStatusIcon(item.batchStatus)} size={10} color={getBatchStatusColor(item.batchStatus)} />
          <Text style={[styles.batchStatusText, { color: getBatchStatusColor(item.batchStatus) }]}>
            {getBatchStatusText(item.batchStatus)}
          </Text>
        </View>

        {item.type === 'pdf' && renderPDFCard({ url: item.pdfUrl, title: item.pdfName })}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#f1f2f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Training</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search training courses..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Cards Grid */}
      <FlatList
        data={filteredCards}
        renderItem={renderTrainingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cardsGrid}
        showsVerticalScrollIndicator={false}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="book-open" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No training courses found</Text>
          </View>
        }
      />

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleBackClick}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalBackButton} onPress={handleBackClick}>
                <Icon name="arrow-left" size={16} color="#11269C" />
                <Text style={styles.modalBackText}>Back to Training List</Text>
              </TouchableOpacity>

              {selectedCard && (
                <View style={styles.detailContainer}>
                  <View style={styles.detailHeader}>
                    {selectedCard.thumbnail && (
                      <View style={styles.detailThumbnail}>
                        <Image source={{ uri: selectedCard.thumbnail }} style={styles.detailImage} />
                        {selectedCard.type === 'video' && (
                          <TouchableOpacity 
                            style={styles.playOverlay}
                            onPress={() => handlePlayVideo(selectedCard.videoUrl, selectedCard.title)}
                          >
                            <Icon name="play-circle" size={50} color="#fff" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <View style={styles.detailTitleSection}>
                      <Text style={styles.detailTitle}>{selectedCard.title}</Text>
                      <Text style={styles.detailSubtitle}>{selectedCard.subtitle}</Text>
                      
                      <View style={styles.detailMeta}>
                        <View style={styles.detailPostedTime}>
                          <Icon name="calendar-alt" size={12} color="#6b7280" />
                          <Text style={styles.detailPostedText}>{selectedCard.postedTime}</Text>
                        </View>
                        <View style={[styles.detailBatchStatus, { backgroundColor: getBatchStatusBgColor(selectedCard.batchStatus) }]}>
                          <Icon name={getBatchStatusIcon(selectedCard.batchStatus)} size={12} color={getBatchStatusColor(selectedCard.batchStatus)} />
                          <Text style={[styles.detailBatchText, { color: getBatchStatusColor(selectedCard.batchStatus) }]}>
                            {getBatchStatusText(selectedCard.batchStatus)}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.detailDescription}>{selectedCard.description}</Text>
                    </View>
                  </View>

                  <View style={styles.trainingContent}>
                    <Text style={styles.trainingContentTitle}>Training Materials</Text>

                    {selectedCard.type === 'video' && selectedCard.videoUrl && (
                      <View style={styles.videoSection}>
                        <Text style={styles.sectionSubtitle}>Main Video</Text>
                        <TouchableOpacity 
                          style={styles.videoPlayerPlaceholder}
                          onPress={() => handlePlayVideo(selectedCard.videoUrl, selectedCard.title)}
                        >
                          <Icon name="play-circle" size={50} color="#fff" />
                          <Text style={styles.videoPlaceholderText}>Video: {selectedCard.title}</Text>
                          <TouchableOpacity 
                            style={styles.playButtonLarge}
                            onPress={() => handlePlayVideo(selectedCard.videoUrl, selectedCard.title)}
                          >
                            <Text style={styles.playButtonLargeText}>Play Video</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </View>
                    )}

                    {selectedCard.type === 'pdf' && selectedCard.pdfUrl && (
                      <View style={styles.pdfSection}>
                        <Text style={styles.sectionSubtitle}>Main Document</Text>
                        {renderPDFCard({
                          url: selectedCard.pdfUrl,
                          title: selectedCard.pdfName,
                        })}
                      </View>
                    )}

                    {selectedCard.content && selectedCard.content.length > 0 && (
                      <View style={styles.additionalContent}>
                        <Text style={styles.sectionSubtitle}>Additional Resources</Text>
                        <View style={styles.contentList}>
                          {selectedCard.content.map((item, index) => renderContentItem(item, index))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        visible={showVideoPlayer}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseVideo}
      >
        <View style={[styles.videoPlayerContainer, isFullscreen && styles.fullscreenVideo]}>
          <View style={styles.videoHeader}>
            <TouchableOpacity onPress={handleCloseVideo} style={styles.videoCloseButton}>
              <Icon name="times" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {currentVideo?.title || 'Video Player'}
            </Text>
            <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
              <Icon name={isFullscreen ? 'compress' : 'expand'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: currentVideo?.url }}
              style={styles.videoPlayer}
              paused={isPaused}
              resizeMode="contain"
              onLoad={handleVideoLoad}
              onProgress={handleVideoProgress}
              onEnd={handleVideoEnd}
              repeat={false}
              controls={false}
              fullscreen={false}
            />
            
            {/* Video Controls */}
            <View style={styles.videoControls}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                <Icon name={isPaused ? 'play' : 'pause'} size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(videoProgress)}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(videoProgress / videoDuration) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(videoDuration)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    height: 70,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 10,
  },
  cardsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  trainingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    width: isTablet ? (width - 48) / 2 : width - 32,
    alignSelf: 'center',
  },
  cardThumbnail: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#1e3a8a',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postedTimeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  batchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  batchStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pdfHorizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    marginTop: 8,
  },
  pdfName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  detailContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 24,
  },
  detailThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitleSection: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  detailMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailPostedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailPostedText: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailBatchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  detailBatchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1f2937',
  },
  trainingContent: {
    marginTop: 8,
  },
  trainingContentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoPlayerPlaceholder: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    gap: 16,
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  playButtonLarge: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  playButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pdfSection: {
    marginBottom: 24,
  },
  additionalContent: {
    marginTop: 8,
  },
  contentList: {
    gap: 10,
  },
  contentItemVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    flexWrap: 'wrap',
  },
  contentItemPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    flexWrap: 'wrap',
  },
  contentItemText: {
    padding: 12,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  videoBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pdfBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dc2626',
  },
  playButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  openLink: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  textContent: {
    gap: 6,
  },
  textTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  textDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  // Video Player Styles
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  videoCloseButton: {
    padding: 8,
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 12,
  },
  fullscreenButton: {
    padding: 8,
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
  },
  playPauseButton: {
    padding: 10,
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#dc2626',
  },
});
export default SafetyTrainingScreen;