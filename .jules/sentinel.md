## 2025-02-15 - Input Validation Strategy
**Vulnerability:** Input Validation (Missing)
**Learning:** WebSocket handlers were trusting client inputs (emotion strings, choice text, base64 images) without validation, potentially allowing prompt injection or DoS via massive payloads.
**Prevention:** Implemented strict whitelist validation for enums (emotions), length/content sanitization for text, and format validation for base64 data before processing.
