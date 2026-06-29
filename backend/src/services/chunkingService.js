import logger from '../utils/logger.js';

class ChunkingService {
  constructor() {
    this.maxChunkTokens = 800;
    this.overlapTokens = 200;
    this.avgCharsPerToken = 4; // Rough estimate
  }

  /**
   * Chunk document text intelligently using section awareness
   */
  chunkDocument(text, metadata = {}) {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Try section-based splitting first
    const sections = this._splitBySections(text);

    const chunks = [];
    let globalIndex = 0;

    for (const section of sections) {
      const sectionChunks = this._chunkSection(section.content, section.heading);

      for (const chunkContent of sectionChunks) {
        chunks.push({
          content: chunkContent,
          chunkIndex: globalIndex++,
          tokenCount: this._estimateTokens(chunkContent),
          metadata: {
            ...metadata,
            section: section.heading || 'General',
          },
        });
      }
    }

    logger.info('Document chunked', {
      totalChunks: chunks.length,
      totalTokens: chunks.reduce((sum, c) => sum + c.tokenCount, 0),
    });

    return chunks;
  }

  /**
   * Split text by markdown headers or numbered sections
   */
  _splitBySections(text) {
    const sectionRegex = /(?:^|\n)(#{1,4}\s+.+|(?:\d+\.)+\s+.+)/gm;
    const sections = [];
    let lastIndex = 0;
    let lastHeading = '';
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const content = text.slice(lastIndex, match.index).trim();
        if (content) {
          sections.push({ heading: lastHeading, content });
        }
      }
      lastHeading = match[1].replace(/^#+\s*/, '').trim();
      lastIndex = match.index + match[0].length;
    }

    // Remaining content
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      sections.push({ heading: lastHeading, content: remaining });
    }

    // If no sections found, return entire text as one section
    if (sections.length === 0) {
      sections.push({ heading: '', content: text });
    }

    return sections;
  }

  /**
   * Chunk a section into token-limited pieces with overlap
   */
  _chunkSection(text, heading) {
    const maxChars = this.maxChunkTokens * this.avgCharsPerToken;
    const overlapChars = this.overlapTokens * this.avgCharsPerToken;

    if (text.length <= maxChars) {
      return [heading ? `${heading}\n\n${text}` : text];
    }

    const chunks = [];
    const sentences = this._splitSentences(text);
    let currentChunk = heading ? `${heading}\n\n` : '';
    let overlapBuffer = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChars && currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());

        // Create overlap from end of current chunk
        overlapBuffer = currentChunk.slice(-overlapChars);
        currentChunk = overlapBuffer + sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Split text into sentences while preserving structure
   */
  _splitSentences(text) {
    // Split on sentence boundaries but keep paragraph breaks
    return text.split(/(?<=[.!?])\s+|(?:\n\n)/g).filter(s => s.trim().length > 0).map(s => s + ' ');
  }

  /**
   * Estimate token count (rough approximation)
   */
  _estimateTokens(text) {
    return Math.ceil(text.length / this.avgCharsPerToken);
  }
}

export default new ChunkingService();
