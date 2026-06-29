import Document from '../models/Document.js';
import pipelineOrchestrator from '../services/pipelineOrchestrator.js';
import path from 'path';

export const uploadDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const { projectId } = req.params;
    const documents = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const doc = await Document.create({
        projectId,
        userId: req.user._id,
        fileName: file.key.split('/').pop(),
        originalName: file.originalname,
        fileType: ext === 'yml' ? 'yaml' : ext,
        mimeType: file.mimetype,
        fileSize: file.size,
        s3Key: file.key,
        s3Url: file.location,
        status: 'uploaded',
      });
      documents.push(doc);
    }

    // Trigger pipeline asynchronously
    const documentIds = documents.map((d) => d._id);
    pipelineOrchestrator
      .processDocuments(projectId, req.user._id, documentIds)
      .catch((err) => console.error('Pipeline error:', err.message));

    res.status(201).json({
      success: true,
      data: {
        documents,
        message: `${documents.length} document(s) uploaded. Processing and review generation started.`,
        processingStatus: 'started',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: { documents } });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.status(200).json({ success: true, data: { document: doc } });
  } catch (error) {
    next(error);
  }
};

export const getProcessingStatus = async (req, res, next) => {
  try {
    const documents = await Document.find({ projectId: req.params.projectId })
      .select('fileName status processingError chunkCount')
      .lean();

    const allProcessed = documents.every((d) => d.status === 'processed' || d.status === 'failed');
    const anyFailed = documents.some((d) => d.status === 'failed');

    res.status(200).json({
      success: true,
      data: {
        documents,
        overallStatus: allProcessed
          ? anyFailed
            ? 'completed_with_errors'
            : 'completed'
          : 'processing',
      },
    });
  } catch (error) {
    next(error);
  }
};
