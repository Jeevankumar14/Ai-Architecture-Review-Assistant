import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../config/aws.js';
import env from '../config/env.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const SUPPORTED_EXTENSIONS = new Set([
  '.pdf', '.docx', '.doc', '.txt', '.json', '.yaml', '.yml', '.md',
  '.png', '.jpg', '.jpeg', '.webp'
]);

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
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Unsupported file type: ${ext}. Supported formats are PDF, DOCX, DOC, TXT, JSON, YAML, MD, PNG, JPG, JPEG, WEBP.`));
    }
    cb(null, true);
  },
});

export const uploadDocuments = upload.array('documents', 10);

export { MAX_FILE_SIZE };
