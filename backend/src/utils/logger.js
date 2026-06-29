const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.DEBUG;

const timestamp = () => new Date().toISOString();

const logger = {
  error: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(JSON.stringify({ level: 'ERROR', timestamp: timestamp(), message, ...meta }));
    }
  },
  warn: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(JSON.stringify({ level: 'WARN', timestamp: timestamp(), message, ...meta }));
    }
  },
  info: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      console.log(JSON.stringify({ level: 'INFO', timestamp: timestamp(), message, ...meta }));
    }
  },
  debug: (message, meta = {}) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
      console.log(JSON.stringify({ level: 'DEBUG', timestamp: timestamp(), message, ...meta }));
    }
  },
};

export default logger;
