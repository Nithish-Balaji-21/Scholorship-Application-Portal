import { axiosInstance as api } from './api';

export const fileService = {
  // Upload file to server
  uploadFile: async (file, type = 'document') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // You can use this to show upload progress
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File upload failed');
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (files, type = 'document') => {
    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      formData.append('type', type);

      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File upload failed');
    }
  },

  // Delete file from server
  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/upload/${fileId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File deletion failed');
    }
  },

  // Get file URL for viewing/downloading
  getFileUrl: (filePath) => {
    if (!filePath) return null;
    
    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Construct URL for local files
    // VITE_API_URL includes /api, so we need to remove it for static file URLs
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace(/\/api$/, ''); // Remove trailing /api
    
    // Ensure filePath starts with /uploads
    let normalizedPath = filePath;
    if (normalizedPath.startsWith('/api/uploads')) {
      normalizedPath = normalizedPath.replace('/api/uploads', '/uploads');
    } else if (!normalizedPath.startsWith('/uploads')) {
      normalizedPath = normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath;
      if (!normalizedPath.startsWith('/uploads')) {
        normalizedPath = '/uploads/' + normalizedPath.replace(/^\//, '');
      }
    }
    
    return `${baseUrl}${normalizedPath}`;
  },

  // Download file
  downloadFile: async (fileId, fileName) => {
    try {
      const response = await api.get(`/upload/download/${fileId}`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File download failed');
    }
  },

  // Validate file before upload
  validateFile: (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
      throw new Error(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file type icon
  getFileIcon: (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📘',
      docx: '📘',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      txt: '📝',
      default: '📁'
    };
    
    return iconMap[extension] || iconMap.default;
  }
};