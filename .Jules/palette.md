## 2024-05-22 - SpaceUpload Accessibility
**Learning:** The 'SpaceUpload' component's file input was hidden using 'display: none', making it inaccessible to keyboard and screen reader users. The 'visually-hidden' CSS pattern is a reliable fix for this specific React component structure.
**Action:** Always check file inputs in this repo for 'display: none' and replace with '.visually-hidden' utility class.
