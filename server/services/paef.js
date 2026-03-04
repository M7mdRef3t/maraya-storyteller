import { Firestore, FieldValue } from '@google-cloud/firestore';

/**
 * PAEF (Progressive Awareness Expansion Framework) Service
 * MVP for Gemini Challenge
 * 
 * Uses Firestore with Application Default Credentials (ADC) to track session patterns.
 */

class PAEFService {
    constructor() {
        this.db = null;
        this.COLLECTION_NAME = 'paef_sessions';
        this.cache = new Map();
    }

    // Lazy Initialization of Firestore (Singleton pattern)
    init() {
        if (!this.db) {
            const isEnabled = process.env.ENABLE_PAEF !== 'false';
            if (!isEnabled) {
                console.log('[paef] ENABLE_PAEF is false, bypassing Firestore.');
                return;
            }

            try {
                // Attempt to initialize Firestore. 
                // If Google Application Default Credentials (ADC) are missing locally,
                // this will throw an error. We catch it to prevent server crash.
                this.db = new Firestore();
                console.log('[paef] Firestore initialized successfully.');
            } catch (err) {
                this.db = null;
                console.warn('[paef] Firestore could not be initialized (No ADC found). PAEF features will be disabled.');
                console.warn('[paef] To enable Firestore locally, run: gcloud auth application-default login');
            }

        }
    }

    getDocId(userId, sessionId) {
        const uid = userId || 'anonymous';
        return `${uid}_${sessionId}`;
    }

    /**
     * Ensures a document exists for the session.
     */
    async ensureSessionDoc({ userId, sessionId }) {
        this.init();
        if (!this.db) return;

        const docId = this.getDocId(userId, sessionId);
        const docRef = this.db.collection(this.COLLECTION_NAME).doc(docId);

        try {
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
                await docRef.set({
                    userId: userId || 'anonymous',
                    sessionId,
                    cycleId: '2026-W10',
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                    patterns: {
                        pace: {
                            intensity: 0.0,
                            resistance: 0.0,
                            redirectCount: 0,
                            lastRedirectTs: 0
                        }
                    }
                });
                console.log(`[paef] PAEF Firestore write ok: Created doc ${docId}`);
            }
        } catch (err) {
            console.error(`[paef] Error ensuring session doc ${docId}:`, err);
        }
    }

    /**
     * Stub for reading pattern state (Step B)
     */
    async getPatternState({ userId, sessionId }) {
        this.init();
        if (!this.db) return null;

        const docId = this.getDocId(userId, sessionId);
        try {
            const docSnap = await this.db.collection(this.COLLECTION_NAME).doc(docId).get();
            return docSnap.exists ? docSnap.data() : null;
        } catch (err) {
            console.error(`[paef] Error reading doc ${docId}:`, err);
            return null;
        }
    }

    /**
     * Stub for computing the intervention plan (Step B)
     */
    async computeInterventionPlan({ userId, sessionId }, { command, context, v }) {
        return {
            delayMs: 0,
            style: "none",
            message: "",
            bypassWindowMs: 0
        };
    }
}

// Export a singleton instance
const paefService = new PAEFService();
export default paefService;
