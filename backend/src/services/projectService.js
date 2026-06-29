import Project from '../models/Project.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import Review from '../models/Review.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/aws.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

class ProjectService {
  async create(userId, { name, description, tags }) {
    return Project.create({ userId, name, description, tags });
  }

  async listByUser(userId, { page = 1, limit = 20, status = 'active' }) {
    const skip = (page - 1) * limit;
    const query = { userId, status };

    const [projects, total] = await Promise.all([
      Project.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Project.countDocuments(query),
    ]);

    return { projects, total, page, pages: Math.ceil(total / limit) };
  }

  async getById(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }
    return project;
  }

  async update(projectId, userId, updates) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }
    return project;
  }

  async delete(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Cascade delete all related data
    const documents = await Document.find({ projectId }).select('s3Key');
    const sessionIds = await ChatSession.find({ projectId }).distinct('_id');

    // Delete files from S3
    const s3Keys = documents.map(d => d.s3Key).filter(Boolean);
    if (s3Keys.length > 0) {
      try {
        const deleteParams = {
          Bucket: env.s3BucketName,
          Delete: {
            Objects: s3Keys.map(key => ({ Key: key })),
            Quiet: true,
          },
        };
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        logger.info('Deleted associated S3 files', { projectId, count: s3Keys.length });
      } catch (error) {
        logger.error('Failed to delete S3 files during project deletion', { projectId, error: error.message });
      }
    }

    await Promise.all([
      DocumentChunk.deleteMany({ projectId }),
      Document.deleteMany({ projectId }),
      Review.deleteMany({ projectId }),
      ChatMessage.deleteMany({ sessionId: { $in: sessionIds } }),
      ChatSession.deleteMany({ projectId }),
      Project.findByIdAndDelete(projectId),
    ]);

    return { message: 'Project and all related data deleted' };
  }
}

export default new ProjectService();
