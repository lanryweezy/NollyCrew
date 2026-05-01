## 2024-04-28 - ARIA Labels for Navigation Icons\n**Learning:** Icon-only navigation buttons must always include aria-label attributes to ensure they are accessible via screen readers.\n**Action:** Will systematically verify and add aria-labels whenever creating or reviewing icon-only buttons.
## 2024-05-19 - Added ARIA labels to Icon-Only Buttons
**Learning:** Found multiple instances where icon-only buttons (bookmark, share, close) lack text alternatives, hindering screen reader users. This is a common accessibility pattern that needs consistent attention across components.
**Action:** Always ensure `aria-label` or `aria-labelledby` is present on interactive elements that do not contain text content.
