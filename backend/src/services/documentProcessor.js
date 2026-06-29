import pdfParse from 'pdf-parse';
import officeparser from 'officeparser';
import yaml from 'js-yaml';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/aws.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import ocrService from './ocrService.js';

class DocumentProcessor {
  /**
   * Download file from S3 and extract text based on file type
   */
  async extractText(s3Key, fileType) {
    logger.info('Extracting text from document', { s3Key, fileType });

    const buffer = await this._downloadFromS3(s3Key);

    switch (fileType) {
      case 'pdf':
        return this._extractPdf(buffer);
      case 'docx':
        return this._extractDocx(buffer);
      case 'txt':
      case 'md':
        return this._extractText(buffer);
      case 'json':
        return this._extractJson(buffer);
      case 'yaml':
      case 'yml':
        return this._extractYaml(buffer);
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return this._extractImage(buffer);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async _downloadFromS3(key) {
    const command = new GetObjectCommand({
      Bucket: env.s3BucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async _extractPdf(buffer) {
    try {
      const data = await pdfParse(buffer);
      return this._cleanText(data.text);
    } catch (error) {
      logger.error('PDF extraction failed', { error: error.message });
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async _extractDocx(buffer) {
    try {
      const text = await officeparser.parseOfficeAsync(buffer);
      return this._cleanText(text);
    } catch (error) {
      logger.error('DOCX extraction failed', { error: error.message });
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  _extractText(buffer) {
    return this._cleanText(buffer.toString('utf-8'));
  }

  _extractJson(buffer) {
    try {
      const json = JSON.parse(buffer.toString('utf-8'));
      // Pretty-print JSON for better chunking
      return JSON.stringify(json, null, 2);
    } catch (error) {
      // If not valid JSON, treat as plain text
      return this._cleanText(buffer.toString('utf-8'));
    }
  }

  _extractYaml(buffer) {
    try {
      const text = buffer.toString('utf-8');
      const parsed = yaml.load(text);
      // Convert to readable string format
      return yaml.dump(parsed, { lineWidth: -1, noRefs: true });
    } catch (error) {
      return this._cleanText(buffer.toString('utf-8'));
    }
  }

  async _extractImage(buffer) {
    try {
      const result = await ocrService.processImage(buffer);
      return this._cleanText(result.text);
    } catch (error) {
      logger.error('Image OCR extraction failed', { error: error.message });
      throw new Error(`Image extraction failed: ${error.message}`);
    }
  }

  /**
   * Clean extracted text: normalize whitespace, remove control characters
   */
  _cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars
      .replace(/\n{3,}/g, '\n\n')        // Max 2 consecutive newlines
      .replace(/[ \t]+/g, ' ')           // Collapse whitespace
      .replace(/^ +| +$/gm, '')          // Trim lines
      .trim();
  }
}

export default new DocumentProcessor();
