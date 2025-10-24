const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.body.type || 'documents';
    const uploadPath = path.join(uploadsDir, uploadType);
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'
  ];
  
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

// Upload single file
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract the actual upload directory type from the file's destination path
    const uploadType = path.basename(path.dirname(req.file.path));

    const fileInfo = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      type: uploadType,
    };

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        id: fileInfo.id,
        originalName: fileInfo.originalName,
        filename: fileInfo.filename,
        size: fileInfo.size,
        type: fileInfo.type,
        url: `/uploads/${uploadType}/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: error.message || 'File upload failed' });
  }
});

// Upload multiple files
router.post('/multiple', protect, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => {
      // Extract the actual upload directory type from the file's destination path
      const uploadType = path.basename(path.dirname(file.path));
      
      return {
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
        type: uploadType,
        url: `/uploads/${uploadType}/${file.filename}`,
      };
    });

    res.status(200).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles.map(file => ({
        id: file.id,
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        type: file.type,
        url: file.url,
      })),
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({ message: error.message || 'File upload failed' });
  }
});

// Serve uploaded files
router.get('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers
    const stat = fs.statSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Set content type based on file extension
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };

    const contentType = contentTypes[fileExtension] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
});

// Download file
router.get('/download/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // In a real application, you would look up the file info from database
    // For now, we'll assume the fileId is the filename
    const filename = fileId;
    
    // Search for the file in all type directories
    const typeDirectories = ['documents', 'images', 'profiles'];
    let filePath = null;
    let originalName = filename;

    for (const type of typeDirectories) {
      const testPath = path.join(uploadsDir, type, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    const stat = fs.statSync(filePath);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.setHeader('Content-Length', stat.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
});

// Delete file
router.delete('/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // In a real application, you would:
    // 1. Look up the file info from database
    // 2. Check if user has permission to delete
    // 3. Delete from database and filesystem
    
    // For now, we'll assume the fileId is the filename and search for it
    const filename = fileId;
    const typeDirectories = ['documents', 'images', 'profiles'];
    let filePath = null;

    for (const type of typeDirectories) {
      const testPath = path.join(uploadsDir, type, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Get file info
router.get('/info/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // In a real application, you would look up the file info from database
    // For now, we'll return basic info if file exists
    const filename = fileId;
    const typeDirectories = ['documents', 'images', 'profiles'];
    let filePath = null;
    let fileType = null;

    for (const type of typeDirectories) {
      const testPath = path.join(uploadsDir, type, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        fileType = type;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ message: 'File not found' });
    }

    const stat = fs.statSync(filePath);
    
    res.status(200).json({
      id: fileId,
      filename: filename,
      size: stat.size,
      type: fileType,
      uploadedAt: stat.birthtime,
      url: `/uploads/${fileType}/${filename}`,
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ message: 'Error getting file info' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: `File too large. Maximum size is ${(process.env.MAX_FILE_SIZE || 5242880) / (1024 * 1024)}MB` 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum is 10 files per upload' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected field name for file upload' 
      });
    }
  }
  
  res.status(400).json({ message: error.message || 'File upload error' });
});

module.exports = router;