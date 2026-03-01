/**
 * Arabic Text Chunking for TTS / Narration
 */

export function chunkArabic(text, { min = 45, max = 160 } = {}) {
    if (!text || typeof text !== 'string') return [];

    // 1. Clean extra spaces and unify punctuation
    const cleaned = text.replace(/\s+/g, " ").trim();

    // 2. Split by major punctuation while keeping the punctuation with the chunk
    // Uses Positive Lookbehind to include . ! ? ، ; ... etc
    const parts = cleaned.split(/(?<=[\.\!\؟\!\…،;])\s+/);

    const out = [];
    let currentBuffer = "";

    const flushBuffer = () => {
        const trimmed = currentBuffer.trim();
        if (trimmed) out.push(trimmed);
        currentBuffer = "";
    };

    for (const part of parts) {
        if (!part) continue;

        // Check if adding this part exceeds max length
        if ((currentBuffer + " " + part).trim().length <= max) {
            currentBuffer = (currentBuffer ? currentBuffer + " " : "") + part;
        } else {
            // If adding exceeds max, flush current buffer if it meets min length
            if (currentBuffer.length >= min) {
                flushBuffer();

                // If the part itself is longer than max, we might need nested split
                if (part.length > max) {
                    const subParts = part.split(/(?<=،)\s+/); // Try splitting on commas
                    for (const sub of subParts) {
                        if ((currentBuffer + " " + sub).trim().length <= max) {
                            currentBuffer = (currentBuffer ? currentBuffer + " " : "") + sub;
                        } else {
                            flushBuffer();
                            currentBuffer = sub;
                        }
                    }
                } else {
                    currentBuffer = part;
                }
            } else {
                // Current buffer is too small, just append even if it exceeds max slightly
                // or prioritize getting it out.
                currentBuffer = (currentBuffer ? currentBuffer + " " : "") + part;
                flushBuffer();
            }
        }
    }

    flushBuffer();

    // 3. Final Pass: Merge very short trailing chunks if possible
    const merged = [];
    for (const chunk of out) {
        if (merged.length > 0) {
            const lastIdx = merged.length - 1;
            if (merged[lastIdx].length + chunk.length < min + 10) {
                merged[lastIdx] += " " + chunk;
                continue;
            }
        }
        merged.push(chunk);
    }

    return merged;
}
