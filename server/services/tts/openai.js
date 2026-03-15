/**
 * OpenAI TTS Provider
 */

export async function ttsOpenAI({ text, voice, format = "mp3", speed = 1.0, mood = "hope", outputMode = "judge_en" }) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    // Determine voice and speed based on mood and mode
    let selectedVoice = voice || "nova";
    let selectedSpeed = speed;
    let instructions = [];

    const isArabic = outputMode !== "judge_en";

    // Feature 10: Voice-Stress Narration
    // We physically manipulate the text sent to OpenAI to force the ML model into specific physiological performances (e.g. breathlessness, tremors).
    let modifiedText = text;

    // Hyper-localized persona logic
    switch (mood.toLowerCase()) {
        case "anxiety":
        case "confusion":
        case "fear":
            selectedVoice = isArabic ? "onyx" : "shimmer"; // Deeper/tenser voices
            selectedSpeed = 1.05; // Slightly faster, tense
            // Randomly inject ellipses for nervous stutters/pauses
            modifiedText = modifiedText.split(' ').map(word => Math.random() > 0.7 ? `${word}...` : word).join(' ');
            instructions.push(isArabic ? "Speak in Arabic with a tense, hurried, and anxious tone." : "Speak with a tense, hurried, and anxious tone.");
            break;
        case "anger":
        case "intense_dramatic":
            selectedVoice = isArabic ? "echo" : "onyx";
            selectedSpeed = 1.12; // Rush the speech
            // Strip out ALL commas and breathing pauses so the model gasps and rushes
            modifiedText = modifiedText.replace(/[,.،؛]/g, '');
            instructions.push(isArabic ? "Speak in Arabic with breathless, unyielding anger." : "Speak with breathless, unyielding anger.");
            break;
        case "loneliness":
        case "nostalgia":
        case "sadness":
            selectedVoice = isArabic ? "nova" : "nova"; // Soft, warm
            selectedSpeed = 0.9; // Slower, longing
            // Force heavy periods for depression/longing
            modifiedText = modifiedText.split(' ').map(word => Math.random() > 0.8 ? `${word}.` : word).join(' ');
            instructions.push(isArabic ? "Speak in Arabic with a slow, melancholic, and deeply longing tone. Pause often." : "Speak with a slow, melancholic, and deeply longing tone. Pause often.");
            break;
        case "hope":
        case "wonder":
        case "joy":
        default:
            selectedVoice = isArabic ? "shimmer" : "alloy"; // Bright, clear
            selectedSpeed = 0.95; // Steady, comforting
            instructions.push(isArabic ? "Speak in Arabic with a warm, hopeful, and cinematic tone. Clear articulation." : "Speak with a warm, hopeful, and cinematic tone. Clear articulation.");
            break;
    }

    // Dialect specific instructions
    if (outputMode === "ar_egyptian") {
        instructions.push("Use an authentic Egyptian dialect (Cairene). Warm, natural, avoiding robotic prosody.");
    } else if (outputMode === "ar_fusha") {
        instructions.push("Use formal, poetic Arabic (Fusha). Emphasize architectural metaphors grandly.");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "tts-1",
            voice: selectedVoice,
            input: modifiedText,
            response_format: format,
            speed: selectedSpeed,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI TTS failed: ${response.status} ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
