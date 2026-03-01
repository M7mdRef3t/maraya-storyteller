/**
 * Google Cloud Text-to-Speech Provider
 */

export async function ttsGoogle({
    text,
    languageCode = "ar-XA",
    voiceName = "ar-XA-Wavenet-A",
    format = "mp3"
}) {
    const apiKey = process.env.GEMINI_API_KEY; // Using the same key if it's a GCP key

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set (required for Google TTS REST fallback)');
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: { text },
            voice: {
                languageCode,
                name: voiceName,
                ssmlGender: "FEMALE"
            },
            audioConfig: {
                audioEncoding: format.toUpperCase() === 'MP3' ? 'MP3' : 'OGG_OPUS',
                speakingRate: 0.95,
                pitch: 0.0
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google TTS failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
        throw new Error('Google TTS: No audioContent returned');
    }

    return Buffer.from(data.audioContent, 'base64');
}
