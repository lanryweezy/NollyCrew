## 2024-05-18 - Missing ARIA Labels on Options Buttons
**Learning:** Icon-only buttons used for extra actions (like `<MoreVertical />` options buttons) in lists/cards often lack `aria-label`s, rendering them completely opaque to screen reader users.
**Action:** When creating or reviewing components with card or list layouts, proactively ensure all icon-only action buttons (especially those common ones like "edit", "delete", or "options") have descriptive `aria-label`s.
