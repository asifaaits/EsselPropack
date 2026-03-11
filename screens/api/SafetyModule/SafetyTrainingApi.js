import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

// Get the base URL based on platform
const getBaseURL = () => {
  // For Android emulator, use 10.0.2.2 for localhost
  // For iOS simulator, use localhost
  // For physical device, use your computer's IP address
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000'; // Change port as needed
    } else {
      return 'http://localhost:5000'; // Change port as needed
    }
  }
  return 'https://your-production-url.com'; // Change to your production URL
};

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get full file URL
export const getFullFileUrl = (filePath) => {
  if (!filePath) return null;

  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // If it's a data URL, return as is
  if (filePath.startsWith('data:')) {
    return filePath;
  }

  // If it's a local file URI
  if (filePath.startsWith('file://')) {
    return filePath;
  }

  // Clean the base URL
  const cleanBaseURL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

  // Ensure filePath starts with /uploads
  let cleanPath = filePath;
  if (!filePath.startsWith('/')) {
    cleanPath = `/${filePath}`;
  }

  // Make sure the path includes /uploads
  if (!cleanPath.includes('/uploads/')) {
    const filename = cleanPath.split('/').pop();
    if (filePath.includes('video')) {
      cleanPath = `/uploads/videos/${filename}`;
    } else if (filePath.includes('pdf')) {
      cleanPath = `/uploads/pdfs/${filename}`;
    } else if (filePath.includes('image') || filePath.includes('thumbnail')) {
      cleanPath = `/uploads/${filePath.includes('thumbnail') ? 'thumbnails' : 'images'}/${filename}`;
    }
  }

  return `${cleanBaseURL}${cleanPath}`;
};

// Helper function to create file object from URI
const createFileObject = (uri, type, name) => {
  return {
    uri,
    type: type || 'application/octet-stream',
    name: name || uri.split('/').pop(),
  };
};

// Helper function to transform course data URLs
const transformCourseUrls = (course) => {
  if (!course) return course;

  // Transform thumbnail URL
  if (course.s_thumbnail_url) {
    course.s_thumbnail_url = getFullFileUrl(course.s_thumbnail_url);
  }

  // Transform content URLs
  if (course.content && Array.isArray(course.content)) {
    course.content.forEach(item => {
      if (item.s_video_url) {
        item.s_video_url = getFullFileUrl(item.s_video_url);
      }
      if (item.s_pdf_url) {
        item.s_pdf_url = getFullFileUrl(item.s_pdf_url);
      }
      if (item.s_image_url) {
        item.s_image_url = getFullFileUrl(item.s_image_url);
      }

      // Also transform the url field used in frontend
      if (item.url) {
        item.url = getFullFileUrl(item.url);
      }
    });
  }

  return course;
};

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token =
        (await AsyncStorage.getItem('token')) ||
        (await AsyncStorage.getItem('session_token'));
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Transform URLs in the response data
    if (response.data) {
      // Single course
      if (response.data.course) {
        response.data.course = transformCourseUrls(response.data.course);
      }

      // Multiple courses
      if (response.data.courses && Array.isArray(response.data.courses)) {
        response.data.courses = response.data.courses.map(course =>
          transformCourseUrls(course)
        );
      }

      // Course content
      if (response.data.content && Array.isArray(response.data.content)) {
        response.data.content.forEach(item => {
          // Handle all possible URL fields
          if (item.s_video_url) {
            item.s_video_url = getFullFileUrl(item.s_video_url);
          }
          if (item.s_pdf_url) {
            item.s_pdf_url = getFullFileUrl(item.s_pdf_url);
          }
          if (item.s_image_url) {
            item.s_image_url = getFullFileUrl(item.s_image_url);
          }
          // Also set a generic url field for frontend convenience
          if (item.e_type === 'pdf' && item.s_pdf_url) {
            item.url = item.s_pdf_url;
          } else if (item.e_type === 'video' && item.s_video_url) {
            item.url = item.s_video_url;
          } else if (item.e_type === 'image' && item.s_image_url) {
            item.url = item.s_image_url;
          }
        });
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== Training Categories ====================
export const categoryAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/safety/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/safety/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post('/api/safety/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, categoryData) => {
    try {
      const response = await api.put(`/api/safety/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/safety/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Training Courses ====================
export const courseAPI = {
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/safety/courses${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/api/safety/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (courseData) => {
    try {
      // If there are files, use FormData
      if (courseData.hasFiles) {
        const formData = new FormData();
        const thumbnailFile =
          courseData.thumbnailFile ||
          (courseData.thumbnail && typeof courseData.thumbnail === 'object' && courseData.thumbnail.uri
            ? courseData.thumbnail
            : null);

        // Handle regular fields
        Object.keys(courseData).forEach((key) => {
          if (key !== 'hasFiles' && key !== 'content' && courseData[key] !== undefined && courseData[key] !== null) {
            if (key === 'thumbnail' && thumbnailFile) {
              // Handle thumbnail file
              formData.append('thumbnail', {
                uri: thumbnailFile.uri,
                type: thumbnailFile.type || 'image/jpeg',
                name: thumbnailFile.name || 'thumbnail.jpg',
              });
            } else if (typeof courseData[key] === 'object') {
              formData.append(key, JSON.stringify(courseData[key]));
            } else {
              formData.append(key, courseData[key]);
            }
          }
        });

        // Handle content with files
        if (courseData.content && Array.isArray(courseData.content)) {
          // Create content without file objects for JSON stringification
          const contentWithoutFiles = courseData.content.map(item => {
            const { file, ...itemWithoutFile } = item;
            return itemWithoutFile;
          });
          formData.append('content', JSON.stringify(contentWithoutFiles));

          // Append individual files with proper field names
          courseData.content.forEach((item, index) => {
            if (item.file) {
              formData.append(`file_${index}`, {
                uri: item.file.uri,
                type: item.file.type || 'application/octet-stream',
                name: item.file.name || `file_${index}`,
              });
            }
          });
        }

        const response = await api.post('/api/safety/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      // Regular JSON post
      const response = await api.post('/api/safety/courses', courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (id, courseData) => {
    try {
      if (courseData.hasFiles) {
        const formData = new FormData();
        const thumbnailFile =
          courseData.thumbnailFile ||
          (courseData.thumbnail && typeof courseData.thumbnail === 'object' && courseData.thumbnail.uri
            ? courseData.thumbnail
            : null);

        // Handle regular fields
        Object.keys(courseData).forEach((key) => {
          if (key !== 'hasFiles' && key !== 'content' && courseData[key] !== undefined && courseData[key] !== null) {
            if (key === 'thumbnail' && thumbnailFile) {
              formData.append('thumbnail', {
                uri: thumbnailFile.uri,
                type: thumbnailFile.type || 'image/jpeg',
                name: thumbnailFile.name || 'thumbnail.jpg',
              });
            } else if (typeof courseData[key] === 'object') {
              formData.append(key, JSON.stringify(courseData[key]));
            } else {
              formData.append(key, courseData[key]);
            }
          }
        });

        // Handle content with files
        if (courseData.content && Array.isArray(courseData.content)) {
          const contentWithoutFiles = courseData.content.map(item => {
            const { file, ...itemWithoutFile } = item;
            return itemWithoutFile;
          });
          formData.append('content', JSON.stringify(contentWithoutFiles));

          courseData.content.forEach((item, index) => {
            if (item.file) {
              formData.append(`file_${index}`, {
                uri: item.file.uri,
                type: item.file.type || 'application/octet-stream',
                name: item.file.name || `file_${index}`,
              });
            }
          });
        }

        const response = await api.put(`/api/safety/courses/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      const response = await api.put(`/api/safety/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/safety/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  togglePublish: async (id) => {
    try {
      const response = await api.patch(`/api/safety/courses/${id}/toggle-publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadThumbnail: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'thumbnail.jpg',
      });

      const response = await api.post(`/api/safety/courses/${id}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Course Content ====================
export const contentAPI = {
  getByCourseId: async (courseId) => {
    try {
      const response = await api.get(`/api/safety/courses/${courseId}/content`);

      // Transform URLs in content
      if (response.data.content && Array.isArray(response.data.content)) {
        response.data.content.forEach(item => {
          if (item.s_video_url) {
            item.s_video_url = getFullFileUrl(item.s_video_url);
          }
          if (item.s_pdf_url) {
            item.s_pdf_url = getFullFileUrl(item.s_pdf_url);
          }
          if (item.s_image_url) {
            item.s_image_url = getFullFileUrl(item.s_image_url);
          }
        });
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadVideo: async (courseId, file, contentData = {}) => {
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: file.uri,
        type: file.type || 'video/mp4',
        name: file.name || 'video.mp4',
      });
      formData.append('data', JSON.stringify(contentData));

      const response = await api.post(`/api/safety/courses/${courseId}/content/video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.content?.s_video_url) {
        response.data.content.s_video_url = getFullFileUrl(response.data.content.s_video_url);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadPDF: async (courseId, file, contentData = {}) => {
    try {
      const formData = new FormData();
      formData.append('pdf', {
        uri: file.uri,
        type: file.type || 'application/pdf',
        name: file.name || 'document.pdf',
      });
      formData.append('data', JSON.stringify(contentData));

      const response = await api.post(`/api/safety/courses/${courseId}/content/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.content?.s_pdf_url) {
        response.data.content.s_pdf_url = getFullFileUrl(response.data.content.s_pdf_url);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadImage: async (courseId, file, contentData = {}) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'image.jpg',
      });
      formData.append('data', JSON.stringify(contentData));

      const response = await api.post(`/api/safety/courses/${courseId}/content/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.content?.s_image_url) {
        response.data.content.s_image_url = getFullFileUrl(response.data.content.s_image_url);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (courseId, contentId, contentData) => {
    try {
      const response = await api.put(`/api/safety/courses/${courseId}/content/${contentId}`, contentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (courseId, contentId) => {
    try {
      const response = await api.delete(`/api/safety/courses/${courseId}/content/${contentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  reorder: async (courseId, contentOrder) => {
    try {
      const response = await api.post(`/api/safety/courses/${courseId}/content/reorder`, { contentOrder });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== User Progress ====================
export const progressAPI = {
  getUserAssignments: async (userId) => {
    try {
      const response = await api.get(`/api/safety/users/${userId}/assignments`);

      if (response.data.assignments && Array.isArray(response.data.assignments)) {
        response.data.assignments.forEach(assignment => {
          if (assignment.s_thumbnail_url) {
            assignment.s_thumbnail_url = getFullFileUrl(assignment.s_thumbnail_url);
          }
        });
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCourseProgress: async (userId, courseId) => {
    try {
      const response = await api.get(`/api/safety/users/${userId}/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markContentComplete: async (userId, courseId, contentId) => {
    try {
      const response = await api.post(`/api/safety/users/${userId}/courses/${courseId}/content/${contentId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateVideoPosition: async (userId, courseId, contentId, position) => {
    try {
      const response = await api.post(`/api/safety/users/${userId}/courses/${courseId}/content/${contentId}/position`, { position });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/api/safety/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Quiz Management ====================
export const quizAPI = {
  submitQuiz: async (userId, courseId, contentId, answers) => {
    try {
      const response = await api.post(`/api/safety/users/${userId}/courses/${courseId}/quiz/${contentId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getQuizAttempts: async (userId, courseId, contentId) => {
    try {
      const response = await api.get(`/api/safety/users/${userId}/courses/${courseId}/quiz/${contentId}/attempts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Course Assignment ====================
export const assignmentAPI = {
  assignToUser: async (courseId, userId, assignmentType = 'mandatory', dueDate = null) => {
    try {
      const response = await api.post(`/api/safety/courses/${courseId}/assign/user/${userId}`, {
        assignmentType,
        dueDate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  assignToDepartment: async (courseId, deptId, assignmentType = 'mandatory', dueDate = null) => {
    try {
      const response = await api.post(`/api/safety/courses/${courseId}/assign/department/${deptId}`, {
        assignmentType,
        dueDate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  assignToRole: async (courseId, roleId, assignmentType = 'mandatory', dueDate = null) => {
    try {
      const response = await api.post(`/api/safety/courses/${courseId}/assign/role/${roleId}`, {
        assignmentType,
        dueDate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCourseAssignments: async (courseId) => {
    try {
      const response = await api.get(`/api/safety/courses/${courseId}/assignments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  removeAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(`/api/safety/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Certificates ====================
export const certificateAPI = {
  getUserCertificates: async (userId) => {
    try {
      const response = await api.get(`/api/safety/users/${userId}/certificates`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downloadCertificate: async (certificateId) => {
    try {
      const response = await api.get(`/api/safety/certificates/${certificateId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyCertificate: async (certificateNumber) => {
    try {
      const response = await api.get(`/api/safety/certificates/verify/${certificateNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Reports ====================
export const reportAPI = {
  getCourseCompletionReport: async (courseId) => {
    try {
      const response = await api.get(`/api/safety/reports/courses/${courseId}/completion`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDepartmentReport: async (deptId) => {
    try {
      const response = await api.get(`/api/safety/reports/departments/${deptId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserTrainingReport: async (userId) => {
    try {
      const response = await api.get(`/api/safety/reports/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==================== Tags ====================
export const tagAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/safety/tags');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (tagName) => {
    try {
      const response = await api.post('/api/safety/tags', { s_name: tagName });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (tagId) => {
    try {
      const response = await api.delete(`/api/safety/tags/${tagId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default {
  category: categoryAPI,
  course: courseAPI,
  content: contentAPI,
  progress: progressAPI,
  quiz: quizAPI,
  assignment: assignmentAPI,
  certificate: certificateAPI,
  report: reportAPI,
  tag: tagAPI,
};