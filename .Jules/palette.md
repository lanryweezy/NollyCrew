## 2024-04-28 - ARIA Labels for Navigation Icons\n**Learning:** Icon-only navigation buttons must always include aria-label attributes to ensure they are accessible via screen readers.\n**Action:** Will systematically verify and add aria-labels whenever creating or reviewing icon-only buttons.
## 2024-05-19 - Added ARIA labels to Icon-Only Buttons
**Learning:** Found multiple instances where icon-only buttons (bookmark, share, close) lack text alternatives, hindering screen reader users. This is a common accessibility pattern that needs consistent attention across components.
**Action:** Always ensure `aria-label` or `aria-labelledby` is present on interactive elements that do not contain text content.
## 2024-05-19 - Added ARIA labels to Utility Dashboard Icons
**Learning:** Found multiple instances where utility icon-only buttons (like edit, delete, and navigation arrows) within dashboard components (e.g. `ResourceAllocation`, `RiskManagementDashboard`, `GanttChart`) were missing `aria-label`s. Because these lists of items map to similar buttons, it's crucial to provide context-aware labels (e.g., "Delete resource X") rather than generic ones.
**Action:** When creating or reviewing lists or cards with action buttons in dashboard components, ensure all icon-only `Button size="icon"` elements have descriptive and context-aware `aria-label`s.
