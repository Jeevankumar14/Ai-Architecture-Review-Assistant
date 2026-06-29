import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../config/aws.js';
import env from '../config/env.js';

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'application/json': 'json',
  'text/yaml': 'yaml',
  'application/x-yaml': 'yaml',
  'text/x-yaml': 'yaml',
  'text/markdown': 'md',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const allowedExts = ['pdf', 'docx', 'txt', 'json', 'yaml', 'yml', 'md', 'png', 'jpg', 'jpeg', 'webp'];

  // SECURITY: Prevent MIME-type spoofing. Both the extension AND the Content-Type header must exactly match.
  if (ALLOWED_TYPES[file.mimetype] && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Security Alert: Invalid file type or spoofed extension. Accepted: PDF, DOCX, TXT, JSON, YAML, MD, PNG, JPG, WEBP`), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: env.s3BucketName,
    metadata: (req, file, cb) => {
      cb(null, {
        originalName: file.originalname,
        uploadedBy: req.user?._id?.toString() || 'unknown',
        projectId: req.params?.projectId || 'unknown',
      });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;
      const key = `${env.s3UploadPrefix}/${req.params?.projectId || 'general'}/${uniqueName}`;
      cb(null, key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per upload
  },
});

export const uploadDocuments = upload.array('documents', 10);

export { ALLOWED_TYPES, MAX_FILE_SIZE };
