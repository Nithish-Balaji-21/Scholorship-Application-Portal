import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const FileUpload = ({ 
  onUpload, 
  maxFiles = 5, 
  acceptedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'], 
  maxSize = 10, // MB
  label = "Upload Documents",
  description = "Upload your documents (PDF, DOC, DOCX, JPG, PNG)",
  type = "documents"
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Check file type
      const extension = file.name.split('.').pop().toLowerCase();
      if (!acceptedTypes.includes(extension)) {
        alert(`File ${file.name} is not an accepted file type. Accepted types: ${acceptedTypes.join(', ')}`);
        return false;
      }

      // Check file size
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSize) {
        alert(`File ${file.name} is too large. Maximum size: ${maxSize}MB`);
        return false;
      }

      return true;
    });

    // Check total file count
    if (files.length + validFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }

    const filesWithId = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      url: null,
      error: null
    }));

    setFiles(prev => [...prev, ...filesWithId]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);

    for (const fileItem of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        const formData = new FormData();
        formData.append('files', fileItem.file);
        formData.append('type', type);

        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id 
                ? { ...f, progress }
                : f
            ));
          }
        });

        if (response.data.success && response.data.data.length > 0) {
          const uploadedFile = response.data.data[0];
          
          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id 
              ? { 
                  ...f, 
                  status: 'completed', 
                  progress: 100, 
                  url: uploadedFile.url,
                  serverFilename: uploadedFile.filename 
                }
              : f
          ));

          // Call onUpload callback with file info
          if (onUpload) {
            onUpload({
              originalName: fileItem.name,
              filename: uploadedFile.filename,
              url: uploadedFile.url,
              size: fileItem.size,
              type: uploadedFile.mimetype
            });
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
        
        // Update file status to error
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error.response?.data?.message || 'Upload failed' 
              }
            : f
        ));
      }
    }

    setUploading(false);
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {acceptedTypes.join(', ').toUpperCase()} up to {maxSize}MB each
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.map(type => `.${type}`).join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files</h4>
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-gray-500">
                  {getFileIcon(fileItem.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileItem.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Indicator */}
                {fileItem.status === 'pending' && (
                  <span className="text-xs text-gray-500">Pending</span>
                )}
                {fileItem.status === 'uploading' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileItem.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{fileItem.progress}%</span>
                  </div>
                )}
                {fileItem.status === 'completed' && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Complete</span>
                  </div>
                )}
                {fileItem.status === 'error' && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Error</span>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileItem.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.some(f => f.status === 'pending') && (
        <button
          onClick={uploadFiles}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
        </button>
      )}

      {/* Error Messages */}
      {files.some(f => f.status === 'error') && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2">Upload Errors:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {files
              .filter(f => f.status === 'error')
              .map(f => (
                <li key={f.id}>
                  {f.name}: {f.error}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;