/**
 * Google Cloud Text-to-Speech Provider
 */

async function getMetadataAccessToken() {
    const response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
        headers: {
            'Metadata-Flavor': 'Google',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Metadata token request failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    if (!payload?.access_token) {
        throw new Error('Metadata server did not return an access token');
    }

    return payload.access_token;
}

async function buildAuth() {
    try {
        const accessToken = await getMetadataAccessToken();
        return {
            url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };
    } catch {
        const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Neither Cloud metadata auth nor GOOGLE_TTS_API_KEY/GEMINI_API_KEY is available for Google TTS');
        }

        return {
            url: `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            headers: {},
        };
    }
}

export async function ttsGoogle({
    text,
    languageCode = "ar-XA",
    voiceName = "ar-XA-Wavenet-A",
    format = "mp3"
}) {
    const auth = await buildAuth();

    const response = await fetch(auth.url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...auth.headers,
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
