import { Firestore } from '@google-cloud/firestore';

import { log, logDebug, logError } from '../logger.js';

export function isCredentialError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('could not load the default credentials')
    || message.includes('default credentials')
    || message.includes('application default credentials')
    || message.includes('project id')
    || message.includes('metadata')
    || message.includes('permission_denied')
    || message.includes('missing or insufficient permissions')
  );
}

export function getPersistenceBackendPreference() {
  const raw = String(process.env.PERSISTENCE_BACKEND || 'auto').trim().toLowerCase();
  if (raw === 'firestore' || raw === 'file') return raw;
  return 'auto';
}

export function shouldPreferFirestore() {
  const backend = getPersistenceBackendPreference();
  if (backend === 'file') return false;
  if (backend === 'firestore') return true;

  return (
    process.env.NODE_ENV === 'production'
    || Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    || Boolean(process.env.FIRESTORE_EMULATOR_HOST)
  );
}

export function createOptionalFirestore(featureName) {
  if (!shouldPreferFirestore()) {
    logDebug(`[persist] ${featureName} using file backend.`);
    return null;
  }

  try {
    const db = new Firestore();
    log(`[persist] ${featureName} initialized Firestore backend.`);
    return db;
  } catch (error) {
    logError(`[persist] ${featureName} failed to initialize Firestore; falling back to file.`, error);
    return null;
  }
}

