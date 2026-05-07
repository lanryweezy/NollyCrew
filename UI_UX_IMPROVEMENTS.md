# UI/UX Improvements for Casting App

## General / Global
1. **Dark/Light Mode Contrast**: Global UI elements like the Dashboard wrapper had hardcoded `bg-black text-white` classes which broke text visibility when the app was in Light Mode.
2. **Navigation Hierarchy**: The primary sidebar/navbar doesn't visually distinguish the active route clearly enough (needs stronger active states).
3. **Focus Indicators**: Keyboard focus indicators are missing or inconsistently styled across interactive elements (buttons, inputs), reducing accessibility.
4. **Loading States**: Add skeleton loaders instead of blank white screens or generic spinners when fetching data for pages like Projects or Dashboard.
5. **Toast Notifications**: Improve error and success feedback mechanisms. Currently, some actions fail silently or redirect without user feedback.
6. **Accessible Tooltips**: Icon-only buttons (like mute/unmute or generic actions) lack tooltip wrappers explaining their functionality for mouse users.
7. **Responsive Design**: Mobile padding and margins on the main layout are too tight, making content touch edges on smaller screens.
8. **Consistent Button Hierarchy**: Standardize primary vs. secondary actions. Some pages use primary-styled buttons for cancel/go-back actions.

## Dashboard
9. **Metric Card Readability**: The stat cards lacked contrast in their background colors compared to the main dashboard background.
10. **Chart Labels**: Tooltips on hover in charts (like the Casting Progress or Diversity metrics) need better formatting for numbers (e.g., adding percentages).
11. **Empty States**: The "Recent Activity" feed looks broken when there's no data. Needs a friendly "No recent activity" empty state illustration.

## Projects Page
12. **Project Card Actions**: The cards are large but have tiny interactive hit targets for actions like "Edit" or "View".
13. **Status Badges**: The contrast on status badges (e.g., "Active", "Completed") needs tuning; light colors often blend into the card backgrounds.

## Talent Page
14. **Filters**: The filter sidebar takes up too much real estate on desktop. It could be collapsible.
15. **Grid vs List View**: Add a toggle for grid vs. list view so users can scan more talent rows quickly if they don't need large headshots.
16. **Image Fallbacks**: Broken headshots or missing avatars need better default fallbacks (e.g., initials instead of a generic icon).

## Messages Page
17. **Chat Thread Differentiation**: Unread messages aren't distinctly prominent compared to read messages (needs a bold font or dot indicator).
18. **Message Input Area**: The text area should auto-expand as the user types a longer message.

## Jobs Page
19. **Job Details Modal**: The modal or drawer for viewing a job details can feel cramped; moving it to a dedicated route or wider slide-out would help.
20. **Application Flow**: The "Apply" button requires multiple clicks; a 1-click apply for internal talent would streamline UX.

## User Requested Additions
21. **Accessible tooltips**: Ensure all icon-only interactive elements have screen-reader and hover tooltips.
22. **Skeleton loaders**: Replace global loading spinners with contextual skeleton loaders for all major tables and grids.
23. **Toasts**: Add a global toast notification system for form submissions, auth events, and destructive actions.
24. **Responsive tweaks**: Fix mobile viewport padding and ensure modal dialogs don't overflow vertically on small screens.
