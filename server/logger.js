const MAX_LOG_CHARS = 1000;

function getEnv() {
  return {
    logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),
    secrets: [process.env.GEMINI_API_KEY || ''].filter((value) => value.length >= 4),
  };
}

function redactSecrets(text, secrets) {
  let sanitized = text;
  secrets.forEach((secret) => {
    sanitized = sanitized.split(secret).join('[REDACTED]');
  });
  return sanitized;
}

function truncate(text) {
  if (text.length <= MAX_LOG_CHARS) return text;
  return `${text.slice(0, MAX_LOG_CHARS)}... [TRUNCATED]`;
}

export function sanitizeForLog(value, options = {}) {
  const { isDebug = false, secrets = [] } = options;

  let normalized = value;
  if (value instanceof Error) {
    normalized = isDebug ? (value.stack || value.message) : value.message;
  } else if (typeof value === 'object' && value !== null) {
    try {
      normalized = JSON.stringify(value);
    } catch {
      normalized = '[Unserializable Object]';
    }
  }

  if (typeof normalized !== 'string') {
    return normalized;
  }

  return truncate(redactSecrets(normalized, secrets));
}

function toLogPayload(args, isDebug) {
  const { secrets } = getEnv();
  return args.map((arg) => sanitizeForLog(arg, { isDebug, secrets }));
}

export function log(...args) {
  console.log('[maraya]', ...toLogPayload(args, false));
}

export function logDebug(...args) {
  const { logLevel } = getEnv();
  if (logLevel !== 'debug') return;
  console.log('[maraya:debug]', ...toLogPayload(args, true));
}

export function logError(...args) {
  const { logLevel } = getEnv();
  const isDebug = logLevel === 'debug';
  console.error('[maraya:error]', ...toLogPayload(args, isDebug));
}
