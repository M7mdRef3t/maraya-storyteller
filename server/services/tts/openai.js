/**
 * OpenAI TTS Provider
 */

export async function ttsOpenAI({ text, voice = "nova", format = "mp3", speed = 1.0 }) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini-tts", // Optimized for speed/quality balance
            voice,
            input: text,
            response_format: format,
            speed,
            instructions: [
                "Speak in Egyptian Arabic (Cairene dialect), warm cinematic narrator.",
                "Natural pacing, clear articulation, avoid robotic prosody.",
                "Keep it intimate, slightly dramatic, not overly theatrical.",
                "Respect Arabic punctuation pauses and emphasize architectural metaphors."
            ].join(" "),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI TTS failed: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
