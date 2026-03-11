import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import { pick, types, isCancel } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import API services
import {
  categoryAPI,
  courseAPI,
  progressAPI,
  quizAPI,
  contentAPI,
} from './api/SafetyModule/SafetyTrainingApi';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isTablet = width >= 768;

// Responsive spacing helper
const spacing = {
  xs: isSmallScreen ? 4 : 6,
  sm: isSmallScreen ? 8 : 12,
  md: isSmallScreen ? 12 : 16,
  lg: isSmallScreen ? 16 : 20,
  xl: isSmallScreen ? 20 : 24,
};

// Font sizes helper
const fontSize = {
  xs: isSmallScreen ? 10 : 12,
  sm: isSmallScreen ? 12 : 14,
  md: isSmallScreen ? 14 : 16,
  lg: isSmallScreen ? 16 : 18,
  xl: isSmallScreen ? 18 : 20,
  xxl: isSmallScreen ? 20 : 22,
};

const SafetyTrainingScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId: routeUserId } = route.params || {}; // optional param
  const [userId, setUserId] = useState(routeUserId ?? null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedItems, setCompletedItems] = useState({});
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Add/Edit/Delete states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [trainingCards, setTrainingCards] = useState([]);
  const [authError, setAuthError] = useState(null);
  
  const videoRef = useRef(null);

  // Resolve userId even when navigation param is missing.
  useEffect(() => {
    let isMounted = true;

    const resolveUserId = async () => {
      if (routeUserId) {
        if (isMounted) setUserId(routeUserId);
        return;
      }

      try {
        const storedUser =
          (await AsyncStorage.getItem('user')) ||
          (await AsyncStorage.getItem('session_user'));

        if (!storedUser) return;

        const u = JSON.parse(storedUser);
        const resolved =
          u?.id ?? u?.pk_user_id ?? u?.userId ?? u?._id ?? null;

        if (isMounted) setUserId(resolved);
      } catch (e) {
        console.error('Error resolving userId:', e);
      }
    };

    resolveUserId();
    return () => {
      isMounted = false;
    };
  }, [routeUserId]);

  const trainingTypes = [
    { id: 'video', name: 'Video', icon: 'video' },
    { id: 'mixed', name: 'Mixed', icon: 'layer-group' },
    { id: 'pdf', name: 'PDF', icon: 'file-pdf' },
  ];

  // Add Training form state
  const [formData, setFormData] = useState({
    fk_category_id: '',
    title: '',
    subtitle: '',
    description: '',
    thumbnail: '',
    thumbnailFile: null,
    type: 'mixed',
    duration: '',
    instructor: '',
    content: [],
    hasFiles: false,
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    id: null,
    fk_category_id: '',
    title: '',
    subtitle: '',
    description: '',
    thumbnail: '',
    thumbnailFile: null,
    type: 'mixed',
    duration: '',
    instructor: '',
    content: [],
    hasFiles: false,
  });

  // Load categories and courses on mount
  useEffect(() => {
    loadCategories();
    loadCourses();
  }, []);

  // Load user progress when selected card changes
  useEffect(() => {
    if (userId && selectedCard && selectedCard.content) {
      loadUserProgress(selectedCard.id);
    }
  }, [userId, selectedCard]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      if (error.status === 401) {
        setAuthError('Session expired. Please login again.');
      }
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      
      // Transform API response to match component structure
      const transformedCourses = (response.courses || []).map(course => ({
        id: course.id,
        categoryId: course.fk_category_id,
        title: course.s_title,
        subtitle: course.s_subtitle,
        description: course.s_description,
        thumbnail: course.s_thumbnail_url,
        postedTime: formatDate(course.dt_created_at),
        batchStatus: 'not-started', // Default status
        type: course.e_type,
        duration: course.s_duration,
        instructor: course.s_instructor,
        content: [], // Content will be loaded when card is clicked
      }));
      
      setTrainingCards(transformedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      if (error.status === 401) {
        setAuthError('Session expired. Please login again.');
      }
      Alert.alert('Error', 'Failed to load training courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserProgress = async (courseId) => {
    if (!userId) return;
    
    try {
      const response = await progressAPI.getCourseProgress(userId, courseId);
      
      // Convert progress to completedItems format
      const completed = {};
      if (response.progress && selectedCard?.content) {
        response.progress.forEach(item => {
          if (item.b_is_completed) {
            const contentIndex = selectedCard.content.findIndex(
              c => c.id === item.fk_content_id
            );
            if (contentIndex !== -1) {
              completed[`${courseId}-${contentIndex}`] = true;
            }
          }
        });
      }
      setCompletedItems(completed);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Get category name by id
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.s_name : 'Select Category';
  };

  // Get category color by id (you may want to store colors in backend)
  const getCategoryColor = (categoryId) => {
    const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
    const index = categories.findIndex(c => c.id === categoryId) % colors.length;
    return colors[index] || '#6b7280';
  };

  // Get category icon by id
  const getCategoryIcon = (categoryId) => {
    const icons = ['fire', 'hard-hat', 'bolt', 'flask', 'cube'];
    const index = categories.findIndex(c => c.id === categoryId) % icons.length;
    return icons[index] || 'tag';
  };

  // Reset add form
  const resetAddForm = () => {
    setFormData({
      fk_category_id: '',
      title: '',
      subtitle: '',
      description: '',
      thumbnail: '',
      thumbnailFile: null,
      type: 'mixed',
      duration: '',
      instructor: '',
      content: [],
      hasFiles: false,
    });
    setShowAddForm(false);
    setShowCategoryDropdown(false);
    setShowTypeDropdown(false);
  };

  // Reset edit form
  const resetEditForm = () => {
    setEditingCard(null);
    setEditFormData({
      id: null,
      fk_category_id: '',
      title: '',
      subtitle: '',
      description: '',
      thumbnail: '',
      thumbnailFile: null,
      type: 'mixed',
      duration: '',
      instructor: '',
      content: [],
      hasFiles: false,
    });
    setShowEditForm(false);
    setShowCategoryDropdown(false);
    setShowTypeDropdown(false);
  };

  // Open edit form
  const openEditForm = async (card) => {
    setShowCardMenu(null);
    setEditingCard(card);
    setLoading(true);

    try {
      // Fetch full course details so thumbnail + content are available
      const response = await courseAPI.getById(card.id);
      const course = response?.course || card;

      const transformedContent = (course.content || []).map((item) => ({
        id: item.id,
        type: item.e_type ?? item.type,
        title: item.s_title ?? item.title,
        description: item.s_description ?? item.description,
        sourceType: item.s_source_type ?? item.sourceType,
        url: item.s_video_url || item.s_pdf_url || item.s_image_url || item.url,
        duration: item.s_video_duration ?? item.duration,
        fileName: item.s_video_file_name || item.s_pdf_file_name || item.s_image_file_name || item.fileName,
        size: item.s_video_file_size || item.s_pdf_file_size || item.s_image_file_size || item.size,
        dimensions: item.s_image_dimensions ?? item.dimensions,
        content: item.t_text_content ?? item.content,
        questions: Array.isArray(item.questions)
          ? item.questions.map((q) => ({
              ...q,
              options: Array.isArray(q.options)
                ? q.options.map((opt) => (typeof opt === 'object' ? opt.s_option_text || String(opt) : opt))
                : [],
            }))
          : [],
      }));

      setEditFormData({
        id: course.id ?? card.id,
        fk_category_id: course.fk_category_id ?? card.categoryId ?? '',
        title: course.s_title ?? card.title ?? '',
        subtitle: course.s_subtitle ?? card.subtitle ?? '',
        description: course.s_description ?? card.description ?? '',
        thumbnail: course.s_thumbnail_url ?? card.thumbnail ?? '',
        thumbnailFile: null,
        type: course.e_type ?? card.type ?? 'mixed',
        duration: course.s_duration ?? card.duration ?? '',
        instructor: course.s_instructor ?? card.instructor ?? '',
        content: JSON.parse(JSON.stringify(transformedContent)),
        hasFiles: false,
      });

      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading course for edit:', error);
      Alert.alert('Error', 'Failed to load course for editing');
    } finally {
      setLoading(false);
    }
  };

  // Handle thumbnail file change
  const handleThumbnailFileChange = (isEdit = false) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', 'Error selecting image: ' + response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        if (isEdit) {
          setEditFormData((prev) => ({
            ...prev,
            thumbnail: source.uri,
            thumbnailFile: {
              uri: response.assets[0].uri,
              type: response.assets[0].type,
              name: response.assets[0].fileName || 'image.jpg',
            },
            hasFiles: true,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            thumbnail: source.uri,
            thumbnailFile: {
              uri: response.assets[0].uri,
              type: response.assets[0].type,
              name: response.assets[0].fileName || 'image.jpg',
            },
            hasFiles: true,
          }));
        }
      }
    });
  };

  // Update form field
  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Update edit form field
  const updateEditFormField = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add content item to form
  const addContentItem = (type, isEdit = false) => {
    const newItem =
      type === 'text'
        ? { type: 'text', title: '', content: '' }
        : type === 'video'
          ? {
              type: 'video',
              title: '',
              url: '',
              duration: '',
              description: '',
              sourceType: 'link',
              file: null,
              fileName: '',
            }
          : type === 'pdf'
            ? {
                type: 'pdf',
                title: '',
                url: '',
                fileName: '',
                size: '',
                sourceType: 'link',
                file: null,
              }
            : type === 'image'
              ? {
                  type: 'image',
                  title: '',
                  url: '',
                  fileName: '',
                  size: '',
                  dimensions: '',
                  sourceType: 'link',
                  file: null,
                }
              : type === 'quiz'
                ? {
                    type: 'quiz',
                    title: '',
                    questions: [],
                  }
                : null;

    if (newItem) {
      if (isEdit) {
        setEditFormData((prev) => ({
          ...prev,
          content: [...prev.content, newItem],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          content: [...prev.content, newItem],
        }));
      }
    }
  };

  // Update content item
  const updateContentItem = (index, field, value, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const content = [...prev.content];
        content[index] = { ...content[index], [field]: value };
        return { ...prev, content };
      });
    } else {
      setFormData((prev) => {
        const content = [...prev.content];
        content[index] = { ...content[index], [field]: value };
        return { ...prev, content };
      });
    }
  };

  // Remove content item
  const removeContentItem = (index, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => ({
        ...prev,
        content: prev.content.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        content: prev.content.filter((_, i) => i !== index),
      }));
    }
  };

  // Add quiz question
  const addQuizQuestion = (contentIndex, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const content = [...prev.content];
        if (!content[contentIndex].questions) {
          content[contentIndex].questions = [];
        }
        content[contentIndex].questions.push({
          question: '',
          options: ['', '', ''],
          correct: 0,
        });
        return { ...prev, content };
      });
    } else {
      setFormData((prev) => {
        const content = [...prev.content];
        if (!content[contentIndex].questions) {
          content[contentIndex].questions = [];
        }
        content[contentIndex].questions.push({
          question: '',
          options: ['', '', ''],
          correct: 0,
        });
        return { ...prev, content };
      });
    }
  };

  // Update quiz question
  const updateQuizQuestion = (contentIndex, questionIndex, field, value, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const content = [...prev.content];
        if (field === 'question') {
          content[contentIndex].questions[questionIndex].question = value;
        } else if (field === 'correct') {
          content[contentIndex].questions[questionIndex].correct = parseInt(value);
        }
        return { ...prev, content };
      });
    } else {
      setFormData((prev) => {
        const content = [...prev.content];
        if (field === 'question') {
          content[contentIndex].questions[questionIndex].question = value;
        } else if (field === 'correct') {
          content[contentIndex].questions[questionIndex].correct = parseInt(value);
        }
        return { ...prev, content };
      });
    }
  };

  // Update quiz option
  const updateQuizOption = (contentIndex, questionIndex, optionIndex, value, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const content = [...prev.content];
        content[contentIndex].questions[questionIndex].options[optionIndex] = value;
        return { ...prev, content };
      });
    } else {
      setFormData((prev) => {
        const content = [...prev.content];
        content[contentIndex].questions[questionIndex].options[optionIndex] = value;
        return { ...prev, content };
      });
    }
  };

  // Remove quiz question
  const removeQuizQuestion = (contentIndex, questionIndex, isEdit = false) => {
    if (isEdit) {
      setEditFormData((prev) => {
        const content = [...prev.content];
        content[contentIndex].questions = content[contentIndex].questions.filter(
          (_, i) => i !== questionIndex
        );
        return { ...prev, content };
      });
    } else {
      setFormData((prev) => {
        const content = [...prev.content];
        content[contentIndex].questions = content[contentIndex].questions.filter(
          (_, i) => i !== questionIndex
        );
        return { ...prev, content };
      });
    }
  };

  // Handle video file upload
  const handleVideoFileUpload = async (index, isEdit = false) => {
    try {
      const options = {
        mediaType: 'video',
        includeBase64: false,
      };

      launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled video picker');
        } else if (response.error) {
          Alert.alert('Error', 'Error selecting video: ' + response.error);
        } else {
          const file = response.assets[0];
          const fileSize = formatFileSize(file.fileSize);
          
          // For now, set a placeholder duration
          const duration = '5:30';

          if (isEdit) {
            setEditFormData((prev) => {
              const content = [...prev.content];
              content[index] = {
                ...content[index],
                sourceType: 'upload',
                fileName: file.fileName || 'video.mp4',
                duration: duration,
                size: fileSize,
                file: {
                  uri: file.uri,
                  type: file.type,
                  name: file.fileName || 'video.mp4',
                },
                hasFiles: true,
              };
              return { ...prev, content: content, hasFiles: true };
            });
          } else {
            setFormData((prev) => {
              const content = [...prev.content];
              content[index] = {
                ...content[index],
                sourceType: 'upload',
                fileName: file.fileName || 'video.mp4',
                duration: duration,
                size: fileSize,
                file: {
                  uri: file.uri,
                  type: file.type,
                  name: file.fileName || 'video.mp4',
                },
                hasFiles: true,
              };
              return { ...prev, content: content, hasFiles: true };
            });
          }
        }
      });
    } catch (err) {
      Alert.alert('Error', 'Error selecting file: ' + err.message);
    }
  };


// Handle PDF file upload
const handlePDFFileUpload = async (index, isEdit = false) => {
  try {
    const [file] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
      // Ensure we get a readable local file URI on Android (file://...),
      // instead of a content:// provider URI that browsers can't open.
      copyTo: 'cachesDirectory',
    });
    
    const fileSize = formatFileSize(file.size);
    
    console.log('Selected PDF file:', file);

    const pdfUri = file.fileCopyUri || file.uri;

    const fileData = {
      sourceType: 'upload',
      fileName: file.name,
      size: fileSize,
      fileCopyUri: file.fileCopyUri || null,
      // IMPORTANT: Do NOT set url for uploads - let the server handle it
      // url: file.uri,  <-- REMOVE THIS LINE
      file: {
        uri: pdfUri,
        type: file.type || 'application/pdf',
        name: file.name,
      },
    };

    if (isEdit) {
      setEditFormData((prev) => {
        const content = [...prev.content];
        content[index] = {
          ...content[index],
          ...fileData,
        };
        return { 
          ...prev, 
          content: content, 
          hasFiles: true 
        };
      });
    } else {
      setFormData((prev) => {
        const content = [...prev.content];
        content[index] = {
          ...content[index],
          ...fileData,
        };
        return { 
          ...prev, 
          content: content, 
          hasFiles: true 
        };
      });
    }
  } catch (err) {
    if (isCancel(err)) {
      console.log('User cancelled');
    } else {
      Alert.alert('Error', 'Error selecting file: ' + err.message);
    }
  }
};
  // Handle image file upload
  const handleImageFileUpload = async (index, isEdit = false) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        Alert.alert('Error', 'Error selecting image: ' + response.error);
      } else {
        const file = response.assets[0];
        const fileSize = formatFileSize(file.fileSize);
        const dimensions = `${file.width} x ${file.height}`;

        if (isEdit) {
          setEditFormData((prev) => {
            const content = [...prev.content];
            content[index] = {
              ...content[index],
              sourceType: 'upload',
              fileName: file.fileName || 'image.jpg',
              size: fileSize,
              dimensions: dimensions,
              url: file.uri,
              file: {
                uri: file.uri,
                type: file.type,
                name: file.fileName || 'image.jpg',
              },
              hasFiles: true,
            };
            return { ...prev, content: content, hasFiles: true };
          });
        } else {
          setFormData((prev) => {
            const content = [...prev.content];
            content[index] = {
              ...content[index],
              sourceType: 'upload',
              fileName: file.fileName || 'image.jpg',
              size: fileSize,
              dimensions: dimensions,
              url: file.uri,
              file: {
                uri: file.uri,
                type: file.type,
                name: file.fileName || 'image.jpg',
              },
              hasFiles: true,
            };
            return { ...prev, content: content, hasFiles: true };
          });
        }
      }
    });
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

 // Handle submit training
const handleSubmitTraining = async () => {
  if (!formData.title.trim()) {
    Alert.alert('Error', 'Please enter a training title');
    return;
  }

  setLoading(true);
  
  try {
    // Prepare course data
    const courseData = {
      fk_category_id: formData.fk_category_id || null,
      s_title: formData.title,
      s_subtitle: formData.subtitle,
      s_description: formData.description,
      e_type: formData.type,
      s_duration: formData.duration,
      s_instructor: formData.instructor,
      content: formData.content.map((item) => {
        // For uploads, don't include the local URI in the url field
        if (item.sourceType === 'upload') {
          const { url, ...itemWithoutUrl } = item;
          return {
            ...itemWithoutUrl,
            // Include file info for upload
            file: item.file,
          };
        }
        // For links, include the URL
        return item;
      }),
      hasFiles: formData.hasFiles,
    };

    // Handle thumbnail file
    if (formData.thumbnailFile) {
      courseData.thumbnail = formData.thumbnailFile;
    } else if (formData.thumbnail) {
      courseData.thumbnail = formData.thumbnail;
    }

    await courseAPI.create(courseData);

    // Reload courses
    await loadCourses();

    resetAddForm();
    Alert.alert('Success', 'Training created successfully!');
  } catch (error) {
    console.error('Error creating training:', error);
    Alert.alert('Error', 'Failed to create training. Please try again.');
  } finally {
    setLoading(false);
  }
};

 // Handle edit submit
const handleEditSubmit = async () => {
  if (!editFormData.title.trim()) {
    Alert.alert('Error', 'Please enter a training title');
    return;
  }

  setLoading(true);

  try {
    // Prepare course data
    const courseData = {
      fk_category_id: editFormData.fk_category_id || null,
      s_title: editFormData.title,
      s_subtitle: editFormData.subtitle,
      s_description: editFormData.description,
      e_type: editFormData.type,
      s_duration: editFormData.duration,
      s_instructor: editFormData.instructor,
      content: editFormData.content.map((item) => {
        // For uploads, don't include the local URI in the url field
        if (item.sourceType === 'upload') {
          const { url, ...itemWithoutUrl } = item;
          return {
            ...itemWithoutUrl,
            // Include file info for upload
            file: item.file,
          };
        }
        // For links, include the URL
        return item;
      }),
      hasFiles: editFormData.hasFiles,
    };

    // Handle thumbnail file
    if (editFormData.thumbnailFile) {
      courseData.thumbnail = editFormData.thumbnailFile;
    }

    await courseAPI.update(editFormData.id, courseData);

    // Reload courses
    await loadCourses();

    resetEditForm();
    Alert.alert('Success', 'Training updated successfully!');
  } catch (error) {
    console.error('Error updating training:', error);
    Alert.alert('Error', 'Failed to update training. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Handle delete
  const handleDelete = async () => {
    if (showDeleteConfirm) {
      setLoading(true);
      
      try {
        await courseAPI.delete(showDeleteConfirm.id);
        
        // Reload courses
        await loadCourses();
        
        // If the deleted card was selected, go back
        if (selectedCard && selectedCard.id === showDeleteConfirm.id) {
          setSelectedCard(null);
          setShowDetailsModal(false);
        }
        
        setShowDeleteConfirm(null);
        Alert.alert('Success', 'Training deleted successfully!');
      } catch (error) {
        console.error('Error deleting training:', error);
        Alert.alert('Error', 'Failed to delete training. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate overall progress for a card
  const calculateProgress = (cardId) => {
    const card = trainingCards.find((c) => c.id === cardId);
    if (!card || !card.content) return 0;

    const contentItems = card.content.length;
    const completed = Object.keys(completedItems).filter(
      (key) => key.startsWith(`${cardId}-`) && completedItems[key]
    ).length;

    return contentItems > 0 ? Math.round((completed / contentItems) * 100) : 0;
  };

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

 const handleCardClick = async (card) => {
  setSelectedCard(card);
  setShowDetailsModal(true);

  try {
    setLoading(true);
    const response = await courseAPI.getById(card.id);
    
    console.log('Course API Response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.course) {
      // Transform the course data
      const transformedCourse = {
        ...response.course,
        id: response.course.id,
        title: response.course.s_title,
        subtitle: response.course.s_subtitle,
        description: response.course.s_description,
        thumbnail: response.course.s_thumbnail_url,
        postedTime: formatDate(response.course.dt_created_at),
        type: response.course.e_type,
        duration: response.course.s_duration,
        instructor: response.course.s_instructor,
        content: (response.course.content || []).map((item) => {
          // Determine the URL based on content type
          let url = null;
          
          if (item.e_type === 'pdf') {
            url = item.s_pdf_url || item.url || null;
          } else if (item.e_type === 'video') {
            url = item.s_video_url || item.url || null;
          } else if (item.e_type === 'image') {
            url = item.s_image_url || item.url || null;
          }
          
          // If it's a local file path, ensure it has file:// prefix
          if (url && !url.startsWith('http') && !url.startsWith('file://') && !url.startsWith('data:')) {
            // This might be a server path, prepend base URL
            url = `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
          }
          
          console.log(`Content item ${item.e_type} URL:`, url);
          
          return {
            id: item.id,
            type: item.e_type,
            title: item.s_title,
            description: item.s_description,
            sourceType: item.s_source_type,
            url: url,
            duration: item.s_video_duration,
            fileName: item.s_video_file_name || item.s_pdf_file_name || item.s_image_file_name,
            size: item.s_video_file_size || item.s_pdf_file_size || item.s_image_file_size,
            dimensions: item.s_image_dimensions,
            content: item.t_text_content,
            questions: Array.isArray(item.questions)
              ? item.questions.map(q => ({
                  ...q,
                  options: Array.isArray(q.options)
                    ? q.options.map(opt => typeof opt === 'object' ? opt.s_option_text || String(opt) : opt)
                    : []
                }))
              : [],
          };
        }),
      };

      setSelectedCard(transformedCourse);
      
      // Log transformed content for debugging
      console.log('Transformed content:', transformedCourse.content.map(c => ({
        type: c.type,
        title: c.title,
        url: c.url,
        fileName: c.fileName
      })));

      // Load user progress for this course
      if (userId) {
        await loadUserProgress(transformedCourse.id);
      }
    }
  } catch (error) {
    console.error('Error loading course details:', error);
    Alert.alert('Error', 'Failed to load course details');
  } finally {
    setLoading(false);
  }
};

  const handleBackClick = () => {
    setSelectedCard(null);
    setShowDetailsModal(false);
    setShowVideoPlayer(false);
    setActiveQuiz(null);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setIsFullscreen(false);
    Orientation.lockToPortrait();
  };

  const handlePlayVideo = (videoUrl, videoTitle) => {
    setCurrentVideo({ url: videoUrl, title: videoTitle });
    setShowVideoPlayer(true);
    setIsPaused(false);
    Orientation.unlockAllOrientations();
  };

  const handleCloseVideo = () => {
    setShowVideoPlayer(false);
    setCurrentVideo(null);
    setIsPaused(true);
    setIsFullscreen(false);
    Orientation.lockToPortrait();
  };

 const handleOpenPDF = async (pdfItem, cardId, itemIndex) => {
  // Debug: Log the entire pdfItem
  console.log('PDF Item in handleOpenPDF:', JSON.stringify(pdfItem, null, 2));
  
  // Try multiple possible locations for the URL
  let pdfUrl = null;
  
  // Check all possible places where the URL might be stored
  if (pdfItem.url) {
    pdfUrl = pdfItem.url;
  } else if (pdfItem.fileCopyUri) {
    pdfUrl = pdfItem.fileCopyUri;
  } else if (pdfItem.file && pdfItem.file.fileCopyUri) {
    pdfUrl = pdfItem.file.fileCopyUri;
  } else if (pdfItem.file && pdfItem.file.uri) {
    pdfUrl = pdfItem.file.uri;
  } else if (pdfItem.uri) {
    pdfUrl = pdfItem.uri;
  } else if (pdfItem.s_pdf_url) {
    pdfUrl = pdfItem.s_pdf_url;
  }
  
  if (!pdfUrl) {
    Alert.alert(
      'Error', 
      'No PDF file URL available to open. The file might not have been uploaded correctly.'
    );
    return;
  }

  Alert.alert(
    'Open PDF',
    `Open "${pdfItem.title}"?\n\nFile: ${pdfItem.fileName || 'document.pdf'}\nSize: ${pdfItem.size || 'Unknown'}`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open',
        onPress: async () => {
          try {
            // Android DocumentPicker often returns content:// URIs, which can't be opened in a browser.
            // Prefer a copied file:// URI when available.
            if (typeof pdfUrl === 'string' && pdfUrl.startsWith('content://')) {
              const fallback =
                pdfItem.fileCopyUri ||
                pdfItem.file?.fileCopyUri ||
                null;
              if (fallback && typeof fallback === 'string') {
                pdfUrl = fallback;
              } else {
                Alert.alert(
                  'Error',
                  'This PDF is a local content URI and cannot be opened directly. Please re-select the PDF so it can be copied locally.'
                );
                return;
              }
            }

            // Check if it's a local file URI
            if (typeof pdfUrl === 'string' && pdfUrl.startsWith('file://')) {
              // For iOS, check if file exists
              if (Platform.OS === 'ios') {
                const filePath = pdfUrl.replace('file://', '');
                const fileExists = await RNFS.exists(filePath);
                if (!fileExists) {
                  Alert.alert('Error', 'PDF file not found locally.');
                  return;
                }
              }
              
              await Linking.openURL(pdfUrl);
            } else {
              // For remote URLs
              await Linking.openURL(pdfUrl);
            }
            
            await markItemComplete(cardId, itemIndex);
          } catch (error) {
            console.error('Error opening PDF:', error);
            Alert.alert(
              'Error',
              Platform.OS === 'ios' 
                ? 'Could not open PDF. Make sure you have a PDF viewer app installed.'
                : 'Could not open PDF file'
            );
          }
        },
      },
    ]
  );
};

  const handleImageClick = (imageItem, cardId, itemIndex) => {
    setSelectedImage(imageItem);
    setShowImageModal(true);
    markItemComplete(cardId, itemIndex);
  };

  const markItemComplete = async (cardId, itemIndex) => {
    if (!userId) {
      Alert.alert('Error', 'Please login to track your progress');
      return;
    }

    const item = selectedCard.content[itemIndex];

    // Update local state
    setCompletedItems((prev) => ({
      ...prev,
      [`${cardId}-${itemIndex}`]: true,
    }));

    // Update backend
    try {
      await progressAPI.markContentComplete(userId, cardId, item.id);
    } catch (error) {
      console.error('Error marking content complete:', error);
    }
  };

  const handleVideoLoad = (data) => {
    setVideoDuration(data.duration);
  };

  const handleVideoProgress = (data) => {
    setVideoProgress(data.currentTime);
    
    if (selectedCard && currentVideo && data.currentTime / videoDuration > 0.9) {
      const videoIndex = selectedCard.content.findIndex(
        (item) => item.url === currentVideo.url
      );
      if (videoIndex !== -1 && !completedItems[`${selectedCard.id}-${videoIndex}`]) {
        markItemComplete(selectedCard.id, videoIndex);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPaused(true);
    if (selectedCard && currentVideo) {
      const videoIndex = selectedCard.content.findIndex(
        (item) => item.url === currentVideo.url
      );
      if (videoIndex !== -1) {
        markItemComplete(selectedCard.id, videoIndex);
      }
    }
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

  // Quiz functions
  const startQuiz = (quizItem, cardId, itemIndex) => {
    setActiveQuiz({ ...quizItem, cardId, itemIndex });
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const submitQuiz = async () => {
    setQuizSubmitted(true);
    const correct = activeQuiz.questions.filter(
      (q, idx) => quizAnswers[idx] === q.correct
    ).length;

    if (correct === activeQuiz.questions.length) {
      await markItemComplete(activeQuiz.cardId, activeQuiz.itemIndex);

      // Submit quiz attempt to backend
      if (userId) {
        try {
          await quizAPI.submitQuiz(
            userId,
            activeQuiz.cardId,
            activeQuiz.id,
            quizAnswers
          );
        } catch (error) {
          console.error('Error submitting quiz:', error);
        }
      }

      Alert.alert(
        'Quiz Completed!',
        `Congratulations! You scored ${correct}/${activeQuiz.questions.length}.`,
        [{ text: 'OK', onPress: () => setActiveQuiz(null) }]
      );
    } else {
      Alert.alert(
        'Quiz Results',
        `You scored ${correct}/${activeQuiz.questions.length}. Please review the material and try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Category Dropdown Component
  const CategoryDropdown = ({ selectedId, onSelect, isEdit = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsOpen(!isOpen)}>
          <View style={styles.dropdownButtonContent}>
            {selectedId ? (
              <View style={[styles.categoryChipSmall, { backgroundColor: getCategoryColor(selectedId) }]}>
                <Icon name={getCategoryIcon(selectedId)} size={fontSize.xs} color="#fff" />
                <Text style={styles.categoryChipTextSmall}>{getCategoryName(selectedId)}</Text>
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>Select Category</Text>
            )}
            <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={fontSize.sm} color="#6b7280" />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownList}>
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect('');
                  setIsOpen(false);
                }}>
                <Text style={styles.dropdownItemText}>None</Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(category.id);
                    setIsOpen(false);
                  }}>
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category.id) }]} />
                  <Text style={styles.dropdownItemText}>{category.s_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Type Dropdown Component
  const TypeDropdown = ({ selectedType, onSelect, isEdit = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getTypeIcon = (type) => {
      switch(type) {
        case 'video': return 'video';
        case 'mixed': return 'layer-group';
        case 'pdf': return 'file-pdf';
        default: return 'tag';
      }
    };

    const getTypeColor = (type) => {
      switch(type) {
        case 'video': return '#dc2626';
        case 'mixed': return '#8b5cf6';
        case 'pdf': return '#2563eb';
        default: return '#6b7280';
      }
    };

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsOpen(!isOpen)}>
          <View style={styles.dropdownButtonContent}>
            {selectedType ? (
              <View style={styles.typeChipSmall}>
                <Icon name={getTypeIcon(selectedType)} size={fontSize.xs} color={getTypeColor(selectedType)} />
                <Text style={[styles.typeChipTextSmall, { color: getTypeColor(selectedType) }]}>
                  {trainingTypes.find(t => t.id === selectedType)?.name || selectedType}
                </Text>
              </View>
            ) : (
              <Text style={styles.dropdownPlaceholder}>Select Type</Text>
            )}
            <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={fontSize.sm} color="#6b7280" />
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownList}>
            <ScrollView nestedScrollEnabled style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
              {trainingTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(type.id);
                    setIsOpen(false);
                  }}>
                  <Icon name={type.icon} size={fontSize.sm} color={getTypeColor(type.id)} />
                  <Text style={styles.dropdownItemText}>{type.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Render content item in form
  const renderFormContentItem = (item, index, isEdit = false) => {
    const updateItem = (field, value) => updateContentItem(index, field, value, isEdit);
    const removeItem = () => removeContentItem(index, isEdit);

    return (
      <View key={index} style={styles.formContentItem}>
        <View style={styles.formContentHeader}>
          <View style={styles.formContentTypeContainer}>
            <Icon 
              name={
                item.type === 'video' ? 'play-circle' :
                item.type === 'pdf' ? 'file-pdf' :
                item.type === 'image' ? 'image' :
                item.type === 'quiz' ? 'question-circle' : 'file-alt'
              } 
              size={fontSize.sm} 
              color={
                item.type === 'video' ? '#dc2626' :
                item.type === 'pdf' ? '#dc2626' :
                item.type === 'image' ? '#3b82f6' :
                item.type === 'quiz' ? '#8b5cf6' : '#6b7280'
              } 
            />
            <Text style={styles.formContentType}>
              {item.type === 'quiz' ? 'Quiz' : 
               item.type === 'image' ? 'Image' : 
               item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
          <TouchableOpacity onPress={removeItem} style={styles.removeContentBtn}>
            <Icon name="trash" size={fontSize.sm} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          value={item.title}
          onChangeText={(text) => updateItem('title', text)}
          placeholder={`${
            item.type === 'text'
              ? 'Section'
              : item.type === 'video'
                ? 'Video'
                : item.type === 'pdf'
                  ? 'Document'
                  : item.type === 'image'
                    ? 'Image'
                    : 'Quiz'
          } title`}
          placeholderTextColor="#9ca3af"
        />

        {item.type === 'text' && (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={item.content}
            onChangeText={(text) => updateItem('content', text)}
            placeholder="Content text..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}

        {item.type === 'video' && (
          <>
            <View style={styles.sourceToggle}>
              <TouchableOpacity
                style={[styles.sourceBtn, item.sourceType === 'link' && styles.sourceBtnActive]}
                onPress={() => {
                  updateItem('sourceType', 'link');
                  updateItem('url', '');
                  updateItem('file', null);
                }}>
                <Icon name="link" size={fontSize.xs} color={item.sourceType === 'link' ? '#fff' : '#6b7280'} />
                <Text style={[styles.sourceBtnText, item.sourceType === 'link' && styles.sourceBtnTextActive]}>
                  Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sourceBtn, item.sourceType === 'upload' && styles.sourceBtnActive]}
                onPress={() => {
                  updateItem('sourceType', 'upload');
                  updateItem('url', '');
                }}>
                <Icon name="upload" size={fontSize.xs} color={item.sourceType === 'upload' ? '#fff' : '#6b7280'} />
                <Text style={[styles.sourceBtnText, item.sourceType === 'upload' && styles.sourceBtnTextActive]}>
                  Upload
                </Text>
              </TouchableOpacity>
            </View>

            {item.sourceType === 'link' ? (
              <>
                <TextInput
                  style={styles.input}
                  value={item.url}
                  onChangeText={(text) => updateItem('url', text)}
                  placeholder="Video URL"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  value={item.duration}
                  onChangeText={(text) => updateItem('duration', text)}
                  placeholder="Duration (e.g. 8:45)"
                  placeholderTextColor="#9ca3af"
                />
              </>
            ) : (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={() => handleVideoFileUpload(index, isEdit)}>
                <Icon name="cloud-upload-alt" size={fontSize.lg} color="#3b82f6" />
                <Text style={styles.uploadText}>Choose video file</Text>
                {item.fileName && (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                    {item.duration && <Text style={styles.fileMeta}> • {item.duration}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TextInput
              style={[styles.input, styles.textArea]}
              value={item.description}
              onChangeText={(text) => updateItem('description', text)}
              placeholder="Description (optional)"
              multiline
              numberOfLines={2}
            />
          </>
        )}

        {item.type === 'pdf' && (
          <>
            <View style={styles.sourceToggle}>
              <TouchableOpacity
                style={[styles.sourceBtn, item.sourceType === 'link' && styles.sourceBtnActive]}
                onPress={() => {
                  updateItem('sourceType', 'link');
                  updateItem('url', '');
                  updateItem('file', null);
                  updateItem('fileName', '');
                  updateItem('size', '');
                }}>
                <Icon name="link" size={fontSize.xs} color={item.sourceType === 'link' ? '#fff' : '#6b7280'} />
                <Text style={[styles.sourceBtnText, item.sourceType === 'link' && styles.sourceBtnTextActive]}>
                  Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sourceBtn, item.sourceType === 'upload' && styles.sourceBtnActive]}
                onPress={() => {
                  updateItem('sourceType', 'upload');
                  updateItem('url', '');
                }}>
                <Icon name="upload" size={fontSize.xs} color={item.sourceType === 'upload' ? '#fff' : '#6b7280'} />
                <Text style={[styles.sourceBtnText, item.sourceType === 'upload' && styles.sourceBtnTextActive]}>
                  Upload
                </Text>
              </TouchableOpacity>
            </View>

            {item.sourceType === 'link' ? (
              <>
                <TextInput
                  style={styles.input}
                  value={item.url}
                  onChangeText={(text) => updateItem('url', text)}
                  placeholder="PDF URL"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  value={item.fileName}
                  onChangeText={(text) => updateItem('fileName', text)}
                  placeholder="File name (e.g. manual.pdf)"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  value={item.size}
                  onChangeText={(text) => updateItem('size', text)}
                  placeholder="Size (e.g. 2.4 MB)"
                  placeholderTextColor="#9ca3af"
                />
              </>
            ) : (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={() => handlePDFFileUpload(index, isEdit)}>
                <Icon name="cloud-upload-alt" size={fontSize.lg} color="#3b82f6" />
                <Text style={styles.uploadText}>Choose PDF file</Text>
                {item.fileName && (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                    {item.size && <Text style={styles.fileMeta}> • {item.size}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            )}
          </>
        )}

        {item.type === 'image' && (
          <>
            <View style={styles.sourceToggle}>
              <TouchableOpacity
                style={[styles.sourceBtn, item.sourceType === 'link' && styles.sourceBtnActive]}
                onPress={() => {
                  updateItem('sourceType', 'link');
                  updateItem('url', '');
                  updateItem('file', null);
                  updateItem('fileName', '');
                  updateItem('size', '');
                  updateItem('dimensions', '');
                }}>
                <Icon name="link" size={fontSize.xs} color={item.sourceType === 'link' ? '#fff' : '#6b7280'} />
                <Text style={[styles.sourceBtnText, item.sourceType === 'link' && styles.sourceBtnTextActive]}>
                  Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sourceBtn, item.sourceType === 'upload' && styles.sourceBtnActive]}
                onPress={() => {
                  updateItem('sourceType', 'upload');
                  updateItem('url', '');
                }}>
                <Icon name="upload" size={fontSize.xs} color={item.sourceType === 'upload' ? '#fff' : '#6b7280'} />
                <Text style={[styles.sourceBtnText, item.sourceType === 'upload' && styles.sourceBtnTextActive]}>
                  Upload
                </Text>
              </TouchableOpacity>
            </View>

            {item.sourceType === 'link' ? (
              <>
                <TextInput
                  style={styles.input}
                  value={item.url}
                  onChangeText={(text) => updateItem('url', text)}
                  placeholder="Image URL"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  value={item.fileName}
                  onChangeText={(text) => updateItem('fileName', text)}
                  placeholder="File name (e.g. image.jpg)"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  value={item.size}
                  onChangeText={(text) => updateItem('size', text)}
                  placeholder="Size (e.g. 1.2 MB)"
                  placeholderTextColor="#9ca3af"
                />
              </>
            ) : (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={() => handleImageFileUpload(index, isEdit)}>
                <Icon name="cloud-upload-alt" size={fontSize.lg} color="#3b82f6" />
                <Text style={styles.uploadText}>Choose image file</Text>
                {item.fileName && (
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                    {item.size && <Text style={styles.fileMeta}> • {item.size}</Text>}
                    {item.dimensions && <Text style={styles.fileMeta}> • {item.dimensions}</Text>}
                  </View>
                )}
              </TouchableOpacity>
            )}
          </>
        )}

        {item.type === 'quiz' && (
          <View style={styles.quizBuilder}>
            {item.questions &&
              item.questions.map((question, qIndex) => (
                <View key={qIndex} style={styles.quizQuestionItem}>
                  <View style={styles.quizQuestionHeader}>
                    <Text style={styles.questionNumber}>Question {qIndex + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeQuizQuestion(index, qIndex, isEdit)}>
                      <Icon name="times" size={fontSize.sm} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={question.question}
                    onChangeText={(text) =>
                      updateQuizQuestion(index, qIndex, 'question', text, isEdit)
                    }
                    placeholder="Enter your question"
                    placeholderTextColor="#9ca3af"
                  />
                  <View style={styles.optionsContainer}>
                    {question.options.map((option, oIndex) => (
                      <View key={oIndex} style={styles.optionRow}>
                        <TouchableOpacity
                          style={[
                            styles.correctRadio,
                            question.correct === oIndex && styles.correctRadioSelected,
                          ]}
                          onPress={() =>
                            updateQuizQuestion(index, qIndex, 'correct', oIndex, isEdit)
                          }>
                          {question.correct === oIndex && (
                            <Icon name="check" size={fontSize.xs} color="#fff" />
                          )}
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          value={option}
                          onChangeText={(text) =>
                            updateQuizOption(index, qIndex, oIndex, text, isEdit)
                          }
                          placeholder={`Option ${oIndex + 1}`}
                          placeholderTextColor="#9ca3af"
                        />
                        {question.correct === oIndex && (
                          <Text style={styles.correctBadge}>Correct</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            <TouchableOpacity
              style={styles.addQuestionBtn}
              onPress={() => addQuizQuestion(index, isEdit)}>
              <Icon name="plus-circle" size={fontSize.sm} color="#3b82f6" />
              <Text style={styles.addQuestionText}>Add Question</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render content item in detail view
  const renderContentItem = (item, index) => {
    const isCompleted = completedItems[`${selectedCard?.id}-${index}`];

    switch (item.type) {
      case 'video':
        return (
          <View key={index} style={[styles.contentItem, isCompleted && styles.completedItem]}>
            <View style={styles.contentHeader}>
              <Icon name="play-circle" size={fontSize.md} color={isCompleted ? '#059669' : '#dc2626'} />
              <Text style={[styles.contentTitle, isCompleted && styles.completedText]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.contentBadge}>
                <Text style={styles.badgeText}>Video</Text>
              </View>
              {isCompleted && (
                <Icon name="check-circle" size={fontSize.sm} color="#059669" style={styles.completedIcon} />
              )}
            </View>
            
            {item.description && (
              <Text style={styles.contentDescription}>{item.description}</Text>
            )}

            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => handlePlayVideo(item.url, item.title)}
            >
              <Icon name="play" size={fontSize.xs} color="#fff" />
              <Text style={styles.playButtonText}>Play Video</Text>
            </TouchableOpacity>

            {item.duration && (
              <Text style={styles.duration}>Duration: {item.duration}</Text>
            )}
          </View>
        );

      case 'pdf':
        return (
          <View key={index} style={[styles.contentItem, isCompleted && styles.completedItem]}>
            <TouchableOpacity
              style={styles.contentItemTouchable}
              onPress={() => handleOpenPDF(item, selectedCard.id, index)}
            >
              <View style={styles.contentHeader}>
                <Icon name="file-pdf" size={fontSize.md} color={isCompleted ? '#059669' : '#dc2626'} />
                <Text style={[styles.contentTitle, isCompleted && styles.completedText]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.contentBadge}>
                  <Text style={styles.badgeText}>PDF</Text>
                </View>
                {isCompleted && (
                  <Icon name="check-circle" size={fontSize.sm} color="#059669" style={styles.completedIcon} />
                )}
              </View>
              
              {item.description && (
                <Text style={styles.contentDescription}>{item.description}</Text>
              )}

              <View style={styles.fileInfo}>
                {item.fileName && <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>}
                {item.size && <Text style={styles.fileMeta}> • {item.size}</Text>}
              </View>
            </TouchableOpacity>
          </View>
        );

      case 'image':
        return (
          <View key={index} style={[styles.contentItem, isCompleted && styles.completedItem]}>
            <TouchableOpacity
              style={styles.contentItemTouchable}
              onPress={() => handleImageClick(item, selectedCard.id, index)}
            >
              <View style={styles.contentHeader}>
                <Icon name="image" size={fontSize.md} color={isCompleted ? '#059669' : '#3b82f6'} />
                <Text style={[styles.contentTitle, isCompleted && styles.completedText]} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={[styles.contentBadge, styles.imageBadge]}>
                  <Text style={styles.badgeText}>Image</Text>
                </View>
                {isCompleted && (
                  <Icon name="check-circle" size={fontSize.sm} color="#059669" style={styles.completedIcon} />
                )}
              </View>
              
              {item.description && (
                <Text style={styles.contentDescription}>{item.description}</Text>
              )}

              <View style={styles.fileInfo}>
                {item.fileName && <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>}
                {item.size && <Text style={styles.fileMeta}> • {item.size}</Text>}
                {item.dimensions && <Text style={styles.fileMeta}> • {item.dimensions}</Text>}
              </View>
            </TouchableOpacity>
          </View>
        );

      case 'text':
        return (
          <View key={index} style={[styles.contentItem, isCompleted && styles.completedItem]}>
            <View style={styles.contentHeader}>
              <Icon name="file-alt" size={fontSize.md} color={isCompleted ? '#059669' : '#6b7280'} />
              <Text style={[styles.contentTitle, isCompleted && styles.completedText]}>
                {item.title}
              </Text>
              {isCompleted && (
                <Icon name="check-circle" size={fontSize.sm} color="#059669" style={styles.completedIcon} />
              )}
            </View>
            
            <View style={styles.textContent}>
              <Text style={styles.textDescription}>{item.content}</Text>
            </View>

            {!isCompleted && (
              <TouchableOpacity
                style={styles.markCompleteButton}
                onPress={() => markItemComplete(selectedCard.id, index)}
              >
                <Icon name="check" size={fontSize.xs} color="#fff" />
                <Text style={styles.markCompleteText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'quiz':
        return (
          <View key={index} style={[styles.contentItem, isCompleted && styles.completedItem]}>
            <View style={styles.contentHeader}>
              <Icon name="question-circle" size={fontSize.md} color={isCompleted ? '#059669' : '#8b5cf6'} />
              <Text style={[styles.contentTitle, isCompleted && styles.completedText]}>
                {item.title}
              </Text>
              <View style={[styles.contentBadge, styles.quizBadge]}>
                <Text style={styles.badgeText}>Quiz</Text>
              </View>
              {isCompleted && (
                <Icon name="check-circle" size={fontSize.sm} color="#059669" style={styles.completedIcon} />
              )}
            </View>

            {activeQuiz && activeQuiz.title === item.title ? (
              <View style={styles.quizActive}>
                {item.questions.map((q, qIdx) => (
                  <View key={qIdx} style={styles.question}>
                    <Text style={styles.questionText}>{q.question}</Text>
                    <View style={styles.options}>
                      {q.options.map((opt, oIdx) => (
                        <TouchableOpacity
                          key={oIdx}
                          style={[
                            styles.option,
                            quizSubmitted && oIdx === q.correct && styles.correctOption,
                            quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== q.correct && styles.wrongOption,
                            quizAnswers[qIdx] === oIdx && styles.selectedOption,
                          ]}
                          onPress={() => !quizSubmitted && handleQuizAnswer(qIdx, oIdx)}
                          disabled={quizSubmitted}
                        >
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
                {!quizSubmitted ? (
                  <TouchableOpacity
                    style={styles.submitQuizButton}
                    onPress={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== item.questions.length}
                  >
                    <Text style={styles.submitQuizText}>Submit Answers</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.closeQuizButton}
                    onPress={() => setActiveQuiz(null)}
                  >
                    <Text style={styles.closeQuizText}>Close Quiz</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.quizPreview}>
                <Text style={styles.quizInfo}>
                  {item.questions?.length || 0} questions • Test your knowledge
                </Text>
                {!isCompleted && (
                  <TouchableOpacity
                    style={styles.startQuizButton}
                    onPress={() => startQuiz(item, selectedCard.id, index)}
                  >
                    <Text style={styles.startQuizText}>Start Quiz</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const renderTrainingCard = ({ item }) => {
    const progress = calculateProgress(item.id);
    const categoryColor = getCategoryColor(item.categoryId);
    
    return (
      <View style={styles.trainingCard}>
        <View style={styles.cardMenuContainer}>
          <TouchableOpacity
            style={styles.cardMenuBtn}
            onPress={() => setShowCardMenu(showCardMenu === item.id ? null : item.id)}>
            <Icon name="ellipsis-v" size={fontSize.sm} color="#6b7280" />
          </TouchableOpacity>
          {showCardMenu === item.id && (
            <View style={styles.cardMenuDropdown}>
              <TouchableOpacity
                style={[styles.cardMenuItem, styles.cardMenuItemEdit]}
                onPress={() => openEditForm(item)}>
                <Icon name="edit" size={fontSize.sm} color="#3b82f6" />
                <Text style={styles.cardMenuItemText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardMenuItem, styles.cardMenuItemDelete]}
                onPress={() => setShowDeleteConfirm(item)}>
                <Icon name="trash" size={fontSize.sm} color="#ef4444" />
                <Text style={styles.cardMenuItemText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleCardClick(item)}
        >
          <View style={styles.cardThumbnail}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Icon name="play" size={fontSize.lg} color="#fff" />
              </View>
            )}
            {item.categoryId && (
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                <Icon name={getCategoryIcon(item.categoryId)} size={fontSize.xs} color="#fff" />
                <Text style={styles.categoryBadgeText}>{getCategoryName(item.categoryId)}</Text>
              </View>
            )}
            {item.type === 'video' && (
              <View style={styles.videoIndicator}>
                <Icon name="play" size={fontSize.sm} color="#dc2626" />
              </View>
            )}
            {progress > 0 && (
              <View style={styles.progressOverlay}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
                <Text style={styles.progressText}>{progress}%</Text>
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
                <Icon name="calendar-alt" size={fontSize.xs} color="#6b7280" />
                <Text style={styles.postedTimeText}>{item.postedTime}</Text>
              </View>
              {item.duration && (
                <View style={styles.duration}>
                  <Icon name="clock" size={fontSize.xs} color="#6b7280" />
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              )}
            </View>

            <View style={[styles.batchStatus, { backgroundColor: getBatchStatusBgColor(item.batchStatus) }]}>
              <Icon name={getBatchStatusIcon(item.batchStatus)} size={fontSize.xs} color={getBatchStatusColor(item.batchStatus)} />
              <Text style={[styles.batchStatusText, { color: getBatchStatusColor(item.batchStatus) }]}>
                {getBatchStatusText(item.batchStatus)}
              </Text>
            </View>

            {item.instructor && (
              <Text style={styles.instructor}>By {item.instructor}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Auth error view
  if (authError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authErrorContainer}>
          <Icon name="exclamation-triangle" size={fontSize.xxl} color="#ef4444" />
          <Text style={styles.authErrorTitle}>Authentication Required</Text>
          <Text style={styles.authErrorMessage}>{authError}</Text>
          <TouchableOpacity
            style={styles.loginRedirectBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginRedirectText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#021679" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={fontSize.xl} color="#f1f2f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Training</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)} style={styles.addButton}>
          <Icon name="plus" size={fontSize.xl} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={fontSize.sm} color="#999" style={styles.searchIcon} />
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
            <Icon name="book-open" size={fontSize.xxl} color="#ccc" />
            <Text style={styles.emptyStateText}>No training courses found</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await loadCourses();
          setRefreshing(false);
        }}
      />

      {/* Add Training Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={false}
        onRequestClose={resetAddForm}>
        <SafeAreaView style={styles.modalSafeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Training</Text>
                <TouchableOpacity onPress={resetAddForm} style={styles.modalCloseBtn}>
                  <Icon name="times" size={fontSize.md} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Basic Information</Text>
                
                {/* Category Dropdown */}
                <Text style={styles.label}>Category <Text style={styles.optional}>(optional)</Text></Text>
                <CategoryDropdown 
                  selectedId={formData.fk_category_id}
                  onSelect={(id) => updateFormField('fk_category_id', id)}
                  isEdit={false}
                />

                {/* Type Dropdown */}
                <Text style={styles.label}>Type <Text style={styles.required}>*</Text></Text>
                <TypeDropdown 
                  selectedType={formData.type}
                  onSelect={(type) => updateFormField('type', type)}
                  isEdit={false}
                />
                
                <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => updateFormField('title', text)}
                  placeholder="e.g. Fire Safety & Extinguisher Usage"
                  placeholderTextColor="#9ca3af"
                />

                <Text style={styles.label}>Subtitle</Text>
                <TextInput
                  style={styles.input}
                  value={formData.subtitle}
                  onChangeText={(text) => updateFormField('subtitle', text)}
                  placeholder="e.g. Essential fire safety protocols"
                  placeholderTextColor="#9ca3af"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => updateFormField('description', text)}
                  placeholder="Brief description of the training"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Text style={styles.label}>Thumbnail</Text>
                <View style={styles.thumbnailInputGroup}>
                  <TextInput
                    style={[styles.input, styles.thumbnailUrlInput]}
                    value={
                      typeof formData.thumbnail === 'string' &&
                      !formData.thumbnail.startsWith('file://')
                        ? formData.thumbnail
                        : ''
                    }
                    onChangeText={(text) => updateFormField('thumbnail', text)}
                    placeholder="Image URL"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.thumbnailOr}>or</Text>
                  <TouchableOpacity
                    style={styles.thumbnailUploadBtn}
                    onPress={() => handleThumbnailFileChange(false)}>
                    <Icon name="upload" size={fontSize.sm} color="#3b82f6" />
                    <Text style={styles.thumbnailUploadText}>Choose</Text>
                  </TouchableOpacity>
                </View>
                {formData.thumbnail && (
                  <View style={styles.thumbnailPreviewWrap}>
                    <Image source={{ uri: formData.thumbnail }} style={styles.thumbnailPreview} />
                    <TouchableOpacity
                      style={styles.thumbnailClearBtn}
                      onPress={() => {
                        updateFormField('thumbnail', '');
                        updateFormField('thumbnailFile', null);
                      }}>
                      <Icon name="times" size={fontSize.xs} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.duration}
                      onChangeText={(text) => updateFormField('duration', text)}
                      placeholder="e.g. 15:30"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View style={styles.rowItem}>
                    <Text style={styles.label}>Instructor</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.instructor}
                      onChangeText={(text) => updateFormField('instructor', text)}
                      placeholder="e.g. John Smith"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <View style={styles.formSectionHeader}>
                  <Text style={styles.formSectionTitle}>Content Items</Text>
                </View>
                <View style={styles.addContentBtns}>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('text')}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('video')}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('pdf')}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('image')}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('quiz')}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Quiz</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.formHint}>
                  Add at least one content item, or leave empty to use the description as overview.
                </Text>

                <View style={styles.contentItemsList}>
                  {formData.content.map((item, index) => renderFormContentItem(item, index, false))}
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetAddForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTraining}>
                  <Icon name="check" size={fontSize.sm} color="#fff" />
                  <Text style={styles.submitBtnText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Training Modal */}
      <Modal
        visible={showEditForm}
        animationType="slide"
        transparent={false}
        onRequestClose={resetEditForm}>
        <SafeAreaView style={styles.modalSafeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Training</Text>
                <TouchableOpacity onPress={resetEditForm} style={styles.modalCloseBtn}>
                  <Icon name="times" size={fontSize.md} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Basic Information</Text>
                
                {/* Category Dropdown */}
                <Text style={styles.label}>Category <Text style={styles.optional}>(optional)</Text></Text>
                <CategoryDropdown 
                  selectedId={editFormData.fk_category_id}
                  onSelect={(id) => updateEditFormField('fk_category_id', id)}
                  isEdit={true}
                />

                {/* Type Dropdown */}
                <Text style={styles.label}>Type <Text style={styles.required}>*</Text></Text>
                <TypeDropdown 
                  selectedType={editFormData.type}
                  onSelect={(type) => updateEditFormField('type', type)}
                  isEdit={true}
                />
                
                <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.title}
                  onChangeText={(text) => updateEditFormField('title', text)}
                  placeholder="e.g. Fire Safety & Extinguisher Usage"
                  placeholderTextColor="#9ca3af"
                />

                <Text style={styles.label}>Subtitle</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.subtitle}
                  onChangeText={(text) => updateEditFormField('subtitle', text)}
                  placeholder="e.g. Essential fire safety protocols"
                  placeholderTextColor="#9ca3af"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editFormData.description}
                  onChangeText={(text) => updateEditFormField('description', text)}
                  placeholder="Brief description of the training"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Text style={styles.label}>Thumbnail</Text>
                <View style={styles.thumbnailInputGroup}>
                  <TextInput
                    style={[styles.input, styles.thumbnailUrlInput]}
                    value={
                      typeof editFormData.thumbnail === 'string' &&
                      !editFormData.thumbnail.startsWith('file://')
                        ? editFormData.thumbnail
                        : ''
                    }
                    onChangeText={(text) => updateEditFormField('thumbnail', text)}
                    placeholder="Image URL"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.thumbnailOr}>or</Text>
                  <TouchableOpacity
                    style={styles.thumbnailUploadBtn}
                    onPress={() => handleThumbnailFileChange(true)}>
                    <Icon name="upload" size={fontSize.sm} color="#3b82f6" />
                    <Text style={styles.thumbnailUploadText}>Choose</Text>
                  </TouchableOpacity>
                </View>
                {editFormData.thumbnail && (
                  <View style={styles.thumbnailPreviewWrap}>
                    <Image source={{ uri: editFormData.thumbnail }} style={styles.thumbnailPreview} />
                    <TouchableOpacity
                      style={styles.thumbnailClearBtn}
                      onPress={() => {
                        updateEditFormField('thumbnail', '');
                        updateEditFormField('thumbnailFile', null);
                      }}>
                      <Icon name="times" size={fontSize.xs} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      style={styles.input}
                      value={editFormData.duration}
                      onChangeText={(text) => updateEditFormField('duration', text)}
                      placeholder="e.g. 15:30"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  <View style={styles.rowItem}>
                    <Text style={styles.label}>Instructor</Text>
                    <TextInput
                      style={styles.input}
                      value={editFormData.instructor}
                      onChangeText={(text) => updateEditFormField('instructor', text)}
                      placeholder="e.g. John Smith"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <View style={styles.formSectionHeader}>
                  <Text style={styles.formSectionTitle}>Content Items</Text>
                </View>
                <View style={styles.addContentBtns}>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('text', true)}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('video', true)}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('pdf', true)}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('image', true)}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addContentBtn}
                    onPress={() => addContentItem('quiz', true)}>
                    <Icon name="plus" size={fontSize.xs} color="#fff" />
                    <Text style={styles.addContentBtnText}>Quiz</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.formHint}>
                  Add, edit, or remove content items.
                </Text>

                <View style={styles.contentItemsList}>
                  {editFormData.content.map((item, index) => renderFormContentItem(item, index, true))}
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetEditForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleEditSubmit}>
                  <Icon name="check" size={fontSize.sm} color="#fff" />
                  <Text style={styles.submitBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirm(null)}>
        <TouchableOpacity
          style={styles.deleteConfirmOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteConfirm(null)}>
          <View style={styles.deleteConfirmModal}>
            <View style={styles.deleteConfirmHeader}>
              <Icon name="times-circle" size={fontSize.xxl} color="#ef4444" />
              <Text style={styles.deleteConfirmTitle}>Delete Training</Text>
            </View>
            <Text style={styles.deleteConfirmMessage}>
              Are you sure you want to delete "{showDeleteConfirm?.title}"? This action cannot be undone
              and will remove all associated content and progress data.
            </Text>
            <View style={styles.deleteConfirmActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setShowDeleteConfirm(null)}>
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={handleDelete}>
                <Icon name="trash" size={fontSize.sm} color="#fff" />
                <Text style={styles.deleteConfirmBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleBackClick}>
        <SafeAreaView style={styles.modalSafeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalBackButton} onPress={handleBackClick}>
                <Icon name="arrow-left" size={fontSize.sm} color="#11269C" />
                <Text style={styles.modalBackText}>Back to Training List</Text>
              </TouchableOpacity>

              {selectedCard && (
                <View style={styles.detailContainer}>
                  <View style={styles.detailHeader}>
                    {selectedCard.thumbnail && (
                      <View style={styles.detailThumbnail}>
                        <Image source={{ uri: selectedCard.thumbnail }} style={styles.detailImage} />
                        {selectedCard.categoryId && (
                          <View style={[styles.detailCategoryBadge, { backgroundColor: getCategoryColor(selectedCard.categoryId) }]}>
                            <Icon name={getCategoryIcon(selectedCard.categoryId)} size={fontSize.xs} color="#fff" />
                            <Text style={styles.detailCategoryBadgeText}>{getCategoryName(selectedCard.categoryId)}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={styles.detailTitleSection}>
                      <Text style={styles.detailTitle}>{selectedCard.title}</Text>
                      <Text style={styles.detailSubtitle}>{selectedCard.subtitle}</Text>
                      
                      <View style={styles.progressSection}>
                        <View style={styles.progressBarContainer}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${calculateProgress(selectedCard.id)}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressPercentage}>
                          {calculateProgress(selectedCard.id)}% Complete
                        </Text>
                      </View>

                      <View style={styles.detailMeta}>
                        <View style={styles.detailPostedTime}>
                          <Icon name="calendar-alt" size={fontSize.xs} color="#6b7280" />
                          <Text style={styles.detailPostedText}>{selectedCard.postedTime}</Text>
                        </View>
                        {selectedCard.duration && (
                          <View style={styles.detailDuration}>
                            <Icon name="clock" size={fontSize.xs} color="#6b7280" />
                            <Text style={styles.detailDurationText}>{selectedCard.duration}</Text>
                          </View>
                        )}
                        <View style={[styles.detailBatchStatus, { backgroundColor: getBatchStatusBgColor(selectedCard.batchStatus) }]}>
                          <Icon name={getBatchStatusIcon(selectedCard.batchStatus)} size={fontSize.xs} color={getBatchStatusColor(selectedCard.batchStatus)} />
                          <Text style={[styles.detailBatchText, { color: getBatchStatusColor(selectedCard.batchStatus) }]}>
                            {getBatchStatusText(selectedCard.batchStatus)}
                          </Text>
                        </View>
                      </View>

                      {selectedCard.instructor && (
                        <Text style={styles.detailInstructor}>👤 {selectedCard.instructor}</Text>
                      )}

                      <Text style={styles.detailDescription}>{selectedCard.description}</Text>
                    </View>
                  </View>

                  <View style={styles.trainingContent}>
                    <Text style={styles.trainingContentTitle}>
                      Training Materials ({selectedCard.content?.length || 0} items)
                    </Text>

                    <View style={styles.contentList}>
                      {selectedCard.content.map((item, index) => (
                        <View key={index} style={styles.contentWrapper}>
                          <View style={styles.contentNumber}>
                            <Text style={styles.contentNumberText}>{index + 1}</Text>
                          </View>
                          {renderContentItem(item, index)}
                        </View>
                      ))}
                    </View>

                    {calculateProgress(selectedCard.id) === 100 && (
                      <View style={styles.completionBanner}>
                        <Icon name="check-circle" size={fontSize.xxl} color="#059669" />
                        <View style={styles.completionText}>
                          <Text style={styles.completionTitle}>Training Completed!</Text>
                          <Text style={styles.completionSubtitle}>
                            You have successfully completed all materials in this course.
                          </Text>
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
        onRequestClose={handleCloseVideo}>
        <View style={[styles.videoPlayerContainer, isFullscreen && styles.fullscreenVideo]}>
          <View style={styles.videoHeader}>
            <TouchableOpacity onPress={handleCloseVideo} style={styles.videoCloseButton}>
              <Icon name="times" size={fontSize.md} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {currentVideo?.title || 'Video Player'}
            </Text>
            <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
              <Icon name={isFullscreen ? 'compress' : 'expand'} size={fontSize.sm} color="#fff" />
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
                <Icon name={isPaused ? 'play' : 'pause'} size={fontSize.lg} color="#fff" />
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

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}>
        <TouchableOpacity 
          style={styles.imageModalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>{selectedImage?.title}</Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <Icon name="times" size={fontSize.md} color="#fff" />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: selectedImage?.url }} 
              style={styles.imageModalImage}
              resizeMode="contain"
            />
            {selectedImage?.fileName && (
              <View style={styles.imageModalFooter}>
                <Text style={styles.imageModalMeta}>{selectedImage.fileName}</Text>
                {selectedImage.size && (
                  <Text style={styles.imageModalMeta}> • {selectedImage.size}</Text>
                )}
                {selectedImage.dimensions && (
                  <Text style={styles.imageModalMeta}> • {selectedImage.dimensions}</Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: spacing.md,
    height: 70,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: '#021679',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 20,
  },
  addButton: {
    padding: spacing.xs,
    borderRadius: 40,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#f9f4f4',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 50,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#000',
    paddingVertical: Platform.OS === 'android' ? 0 : 10,
  },
  cardsGrid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  trainingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    width: isTablet ? (width - spacing.md * 3) / 2 : width - spacing.md * 2,
    alignSelf: 'center',
    position: 'relative',
  },
  cardMenuContainer: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 10,
  },
  cardMenuBtn: {
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
  cardMenuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
    minWidth: 120,
  },
  cardMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  cardMenuItemEdit: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardMenuItemDelete: {},
  cardMenuItemText: {
    fontSize: fontSize.sm,
    color: '#1f2937',
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
  categoryBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
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
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#10b981',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  progressText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    lineHeight: fontSize.md * 1.4,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    marginBottom: spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  postedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postedTimeText: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  batchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  batchStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  instructor: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  formHint: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    color: '#6b7280',
    fontWeight: 'normal',
    fontSize: fontSize.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    fontSize: fontSize.sm,
    color: '#1f2937',
    backgroundColor: '#fff',
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    marginBottom: spacing.sm,
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownPlaceholder: {
    fontSize: fontSize.sm,
    color: '#9ca3af',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2000,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: fontSize.sm,
    color: '#1f2937',
    flex: 1,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryChipSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryChipTextSmall: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  typeChipSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  typeChipTextSmall: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  thumbnailInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  thumbnailUrlInput: {
    flex: 1,
    minWidth: 150,
    marginBottom: 0,
  },
  thumbnailOr: {
    fontSize: fontSize.xs,
    color: '#9ca3af',
  },
  thumbnailUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  thumbnailUploadText: {
    fontSize: fontSize.xs,
    color: '#3b82f6',
    fontWeight: '500',
  },
  thumbnailPreviewWrap: {
    position: 'relative',
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  thumbnailPreview: {
    width: 100,
    height: 60,
    borderRadius: 4,
  },
  thumbnailClearBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rowItem: {
    flex: 1,
    minWidth: 120,
  },
  addContentBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  addContentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  addContentBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
  },
  contentItemsList: {
    gap: spacing.sm,
  },
  formContentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: spacing.xs,
  },
  formContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  formContentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formContentType: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  removeContentBtn: {
    padding: 2,
  },
  sourceToggle: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.sm,
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
  },
  sourceBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sourceBtnText: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  sourceBtnTextActive: {
    color: '#fff',
  },
  uploadArea: {
    padding: spacing.md,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: fontSize.xs,
    color: '#3b82f6',
    fontWeight: '500',
  },
  fileInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  fileName: {
    fontSize: fontSize.xs,
    color: '#4b5563',
    maxWidth: 150,
  },
  fileMeta: {
    fontSize: fontSize.xs,
    color: '#9ca3af',
  },
  quizBuilder: {
    marginTop: 4,
  },
  quizQuestionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quizQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  questionNumber: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#374151',
  },
  optionsContainer: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  correctRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctRadioSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  correctBadge: {
    position: 'absolute',
    right: 4,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#10b981',
  },
  addQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: spacing.xs,
  },
  addQuestionText: {
    fontSize: fontSize.xs,
    color: '#3b82f6',
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#021679',
  },
  submitBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  deleteConfirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmModal: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
  },
  deleteConfirmHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deleteConfirmTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: spacing.xs,
  },
  deleteConfirmMessage: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSize.sm * 1.4,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteCancelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#6b7280',
  },
  deleteConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  deleteConfirmBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalBackText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: spacing.xs,
  },
  detailContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailHeader: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: spacing.lg,
  },
  detailThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailCategoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailCategoryBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  detailTitleSection: {
    flex: 1,
  },
  detailTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 2,
  },
  detailSubtitle: {
    fontSize: fontSize.md,
    color: '#6b7280',
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressPercentage: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'right',
  },
  detailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailPostedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailPostedText: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  detailDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailDurationText: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  detailBatchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 20,
  },
  detailBatchText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  detailInstructor: {
    fontSize: fontSize.sm,
    color: '#4b5563',
    marginBottom: spacing.sm,
  },
  detailDescription: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    color: '#1f2937',
  },
  trainingContent: {
    marginTop: 4,
  },
  trainingContentTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: spacing.md,
  },
  contentList: {
    gap: spacing.sm,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    marginTop: 12,
  },
  contentNumberText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#4b5563',
  },
  contentItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentItemTouchable: {
    flex: 1,
  },
  completedItem: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  contentTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  completedText: {
    color: '#065f46',
  },
  completedIcon: {
    marginLeft: 'auto',
  },
  contentBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 12,
  },
  imageBadge: {
    backgroundColor: '#dbeafe',
  },
  quizBadge: {
    backgroundColor: '#ede9fe',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#dc2626',
  },
  contentDescription: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    marginBottom: spacing.sm,
    lineHeight: fontSize.xs * 1.5,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  playButtonText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  textContent: {
    marginTop: 4,
    padding: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  textDescription: {
    fontSize: fontSize.xs,
    color: '#4b5563',
    lineHeight: fontSize.xs * 1.5,
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  markCompleteText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  quizActive: {
    marginTop: spacing.sm,
  },
  question: {
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    padding: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedOption: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  correctOption: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  wrongOption: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionText: {
    fontSize: fontSize.xs,
    color: '#1f2937',
  },
  submitQuizButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitQuizText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  closeQuizButton: {
    backgroundColor: '#6b7280',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  closeQuizText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  quizPreview: {
    marginTop: spacing.sm,
  },
  quizInfo: {
    fontSize: fontSize.xs,
    color: '#6b7280',
    marginBottom: spacing.xs,
  },
  startQuizButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  startQuizText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#d1fae5',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  completionText: {
    flex: 1,
  },
  completionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 2,
  },
  completionSubtitle: {
    fontSize: fontSize.xs,
    color: '#047857',
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  videoCloseButton: {
    padding: 4,
  },
  videoTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: spacing.sm,
  },
  fullscreenButton: {
    padding: 4,
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
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: spacing.xs,
  },
  playPauseButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    color: '#fff',
    fontSize: fontSize.xs,
  },
  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#1f2937',
  },
  imageModalTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  imageModalImage: {
    width: '100%',
    height: height * 0.5,
  },
  imageModalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  imageModalMeta: {
    fontSize: fontSize.xs,
    color: '#6b7280',
  },
  authErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  authErrorTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  authErrorMessage: {
    fontSize: fontSize.sm,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loginRedirectBtn: {
    backgroundColor: '#021679',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  loginRedirectText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

export default SafetyTrainingScreen;