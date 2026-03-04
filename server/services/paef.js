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
        this.disabled = false;
    }

    disableFirestore(message) {
        this.db = null;
        this.disabled = true;
        console.warn(message);
        console.warn('[paef] PAEF features will be disabled until the server restarts.');
    }

    isCredentialError(err) {
        const message = String(err?.message || '').toLowerCase();
        return (
            message.includes('could not load the default credentials')
            || message.includes('default credentials')
            || message.includes('application default credentials')
            || message.includes('metadata')
            || message.includes('project id')
        );
    }

    shouldAutoDisableLocally() {
        const isProduction = process.env.NODE_ENV === 'production';
        const hasExplicitCreds = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        const hasFirestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
        return !isProduction && !hasExplicitCreds && !hasFirestoreEmulator;
    }

    // Lazy Initialization of Firestore (Singleton pattern)
    init() {
        if (!this.db && !this.disabled) {
            const isEnabled = process.env.ENABLE_PAEF !== 'false';
            if (!isEnabled) {
                console.log('[paef] ENABLE_PAEF is false, bypassing Firestore.');
                return;
            }

            if (this.shouldAutoDisableLocally()) {
                this.disableFirestore('[paef] Local environment detected without GOOGLE_APPLICATION_CREDENTIALS or FIRESTORE_EMULATOR_HOST. Disabling PAEF.');
                console.warn('[paef] Set GOOGLE_APPLICATION_CREDENTIALS, FIRESTORE_EMULATOR_HOST, or NODE_ENV=production to enable Firestore.');
                return;
            }

            try {
                // Firestore client construction is sync, but credential resolution may fail later
                // on the first networked call. Those async credential errors are handled below.
                this.db = new Firestore();
                console.log('[paef] Firestore initialized successfully.');
            } catch (err) {
                this.disableFirestore('[paef] Firestore could not be initialized. PAEF features will be disabled.');
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
            if (this.isCredentialError(err)) {
                this.disableFirestore('[paef] Firestore ADC/project detection failed. Disabling PAEF for this process.');
                console.warn('[paef] To enable Firestore locally, run: gcloud auth application-default login');
                return;
            }
            console.error(`[paef] Error ensuring session doc ${docId}:`, err);
        }
    }

    /**
     * Reads pattern state from Firestore (async, fire-and-forget for updates)
     */
    async getPatternState({ userId, sessionId }) {
        this.init();
        if (!this.db) return null;

        const docId = this.getDocId(userId, sessionId);
        try {
            const docSnap = await this.db.collection(this.COLLECTION_NAME).doc(docId).get();
            return docSnap.exists ? docSnap.data() : null;
        } catch (err) {
            if (this.isCredentialError(err)) {
                this.disableFirestore('[paef] Firestore ADC/project detection failed during read. Disabling PAEF for this process.');
                console.warn('[paef] To enable Firestore locally, run: gcloud auth application-default login');
                return null;
            }
            console.error(`[paef] Error reading doc ${docId}:`, err);
            return null;
        }
    }

    /**
     * Fire-and-forget update to Firestore to keep computeInterventionPlan pure and fast
     */
    updatePatternState({ userId, sessionId }, updates) {
        if (!this.db) return;
        const docId = this.getDocId(userId, sessionId);
        this.db.collection(this.COLLECTION_NAME).doc(docId).update({
            ...updates,
            updatedAt: FieldValue.serverTimestamp()
        }).catch(err => {
            if (this.isCredentialError(err)) {
                this.disableFirestore('[paef] Firestore ADC/project detection failed during update. Disabling PAEF for this process.');
                console.warn('[paef] To enable Firestore locally, run: gcloud auth application-default login');
                return;
            }
            console.error(`[paef] Async update failed for ${docId}:`, err);
        });
    }

    /**
     * Computes the intervention plan. 
     * Wrapped in a 500ms Promise.race to guarantee it never stalls the stream.
     */
    async computeInterventionPlan({ userId, sessionId }, { command, context, v, sceneId, atIndex }) {
        const isEnabled = process.env.ENABLE_PAEF !== 'false';
        const fallbackPlan = { delayMs: 0, style: "none", message: "", bypassWindowMs: 0, v, sceneId, atIndex };

        if (!isEnabled || !this.db) {
            return fallbackPlan;
        }

        const computeLogic = async () => {
            try {
                const state = await this.getPatternState({ userId, sessionId });
                if (!state) return fallbackPlan;

                const paceState = state.patterns?.pace || { intensity: 0, resistance: 0, redirectCount: 0, lastRedirectTs: 0 };
                const now = Date.now();
                const timeSinceLast = paceState.lastRedirectTs > 0 ? now - paceState.lastRedirectTs : 999999;

                let newRedirectCount = paceState.redirectCount + 1;
                let newIntensity = paceState.intensity;

                // Simple aggressive spam detection (if redirects happen within 5 seconds of each other)
                if (timeSinceLast < 5000) {
                    newIntensity = Math.min(1.0, paceState.intensity + 0.2);
                } else {
                    newIntensity = Math.max(0.0, paceState.intensity - 0.1);
                }

                // Fire and forget update (pure-ish)
                this.updatePatternState({ userId, sessionId }, {
                    "patterns.pace.redirectCount": newRedirectCount,
                    "patterns.pace.intensity": newIntensity,
                    "patterns.pace.lastRedirectTs": now
                });

                // Decide intervention based on intensity
                if (newIntensity >= 0.6) {
                    return {
                        delayMs: 800,
                        style: "micro_text",
                        message: "Take a breath...",
                        bypassWindowMs: 600,
                        v,
                        sceneId,
                        atIndex
                    };
                }

                return fallbackPlan;
            } catch (err) {
                console.error(`[paef] computeLogic error:`, err);
                return fallbackPlan;
            }
        };

        const timeoutGuard = new Promise((resolve) => {
            setTimeout(() => {
                console.warn(`[paef] computeInterventionPlan timeout (500ms exceeded). Using fallback.`);
                resolve(fallbackPlan);
            }, 500);
        });

        return Promise.race([computeLogic(), timeoutGuard]);
    }
}

// Export a singleton instance
const paefService = new PAEFService();
export default paefService;
