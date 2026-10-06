import pdfParse from 'pdf-parse';
import officeparser from 'officeparser';
import yaml from 'js-yaml';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/aws.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import ocrService from './ocrService.js';
import guardrailService from './guardrailService.js';

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
      case 'doc':
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
      return this._finalizeText(data.text, { source: 'pdf' });
    } catch (error) {
      logger.error('PDF extraction failed', { error: error.message });
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async _extractDocx(buffer) {
    try {
      const parseFn = officeparser.parseOffice || officeparser.parseOfficeAsync || officeparser.default;
      if (typeof parseFn !== 'function') {
        throw new Error('No supported DOCX parser function is available');
      }

      const res = await parseFn(buffer);
      let text = '';
      if (typeof res === 'string') {
        text = res;
      } else if (res && typeof res.toText === 'function') {
        text = res.toText();
      } else if (res && typeof res.toString === 'function' && res.toString() !== '[object Object]') {
        text = res.toString();
      } else if (res && res.content) {
        text = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);
      } else {
        text = String(res || '');
      }

      return this._finalizeText(text, { source: 'docx' });
    } catch (error) {
      logger.error('DOCX extraction failed', { error: error.message });
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
  }

  _extractText(buffer) {
    return this._finalizeText(buffer.toString('utf-8'), { source: 'text' });
  }

  _extractJson(buffer) {
    try {
      const json = JSON.parse(buffer.toString('utf-8'));
      // Pretty-print JSON for better chunking
      return this._finalizeText(JSON.stringify(json, null, 2), { source: 'json' });
    } catch (error) {
      // If not valid JSON, treat as plain text
      return this._finalizeText(buffer.toString('utf-8'), { source: 'json-fallback' });
    }
  }

  _extractYaml(buffer) {
    try {
      const text = buffer.toString('utf-8');
      const parsed = yaml.load(text);
      // Convert to readable string format
      return this._finalizeText(yaml.dump(parsed, { lineWidth: -1, noRefs: true }), { source: 'yaml' });
    } catch (error) {
      return this._finalizeText(buffer.toString('utf-8'), { source: 'yaml-fallback' });
    }
  }

  async _extractImage(buffer) {
    try {
      const result = await ocrService.processImage(buffer);
      guardrailService.assertSafeDocumentText(result.text, { ocr: true });
      return this._finalizeText(result.text, { source: 'ocr', ocr: true });
    } catch (error) {
      logger.error('Image OCR extraction failed', { error: error.message });
      throw new Error(`Image extraction failed: ${error.message}`);
    }
  }

  _finalizeText(text, { source = 'unknown', ocr = false } = {}) {
    const cleaned = this._cleanText(text);
    guardrailService.assertSafeDocumentText(cleaned, { ocr });
    return guardrailService.sanitizeText(cleaned, { maxLength: source === 'ocr' ? 50000 : 500000 });
  }

  /**
   * Clean extracted text: normalize whitespace, remove control characters
   */
  _cleanText(text) {
    const raw = typeof text === 'string'
      ? text
      : (text && typeof text.toText === 'function' ? text.toText() : String(text || ''));
    return raw
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
