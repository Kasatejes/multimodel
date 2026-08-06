import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'text/plain',
  'text/csv',
  'application/csv',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp3',
  'audio/webm',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
];

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|pptx|txt|csv|jpg|jpeg|png|webp|gif|mp3|wav|ogg|mp4|webm|mov)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported.`));
    }
  }
});
