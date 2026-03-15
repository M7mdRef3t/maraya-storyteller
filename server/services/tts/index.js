import { ttsOpenAI } from './openai.js';
import { ttsGoogle } from './google.js';
import { logDebug, logError } from '../../logger.js';

/**
 * Global TTS Dispatcher
 */
export async function generateNarrationAudio({
    text,
    outputMode = 'ar_fusha',
    mood = 'hope',
    provider = process.env.TTS_PROVIDER || 'google'
}) {
    const isArabic = outputMode.startsWith('ar');

    // Mapping outputMode to appropriate voice
    const voiceConfig = isArabic
        ? {
            openai: 'nova',
            google: outputMode === 'ar_egyptian' ? 'ar-XA-Standard-A' : 'ar-XA-Wavenet-B',
            lang: 'ar-XA'
        }
        : {
            openai: 'alloy',
            google: 'en-US-Neural2-F',
            lang: 'en-US'
        };

    try {
        if (provider === 'openai' && process.env.OPENAI_API_KEY) {
            logDebug(`[tts] Generating via OpenAI (${voiceConfig.openai})`);
            return await ttsOpenAI({
                text,
                voice: voiceConfig.openai,
                format: 'mp3',
                mood,
                outputMode
            });
        }

        // Default to Google for compliance
        logDebug(`[tts] Generating via Google Cloud (${voiceConfig.google})`);
        return await ttsGoogle({
            text,
            languageCode: voiceConfig.lang,
            voiceName: voiceConfig.google,
            format: 'mp3'
        });

    } catch (err) {
        logError(`[tts] Provider ${provider} failed: ${err.message}. Falling back to system...`);
        throw err;
    }
}
