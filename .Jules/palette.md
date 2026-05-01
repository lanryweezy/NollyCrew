## 2024-05-15 - Widespread Missing ARIA Labels on Utility Icon Buttons
**Learning:** Found a recurring pattern across dashboard components (MilestoneTracker, ResourceAllocation, RiskManagementDashboard, etc.) where `<Button size="icon">` was used extensively for actions like Edit/Delete/Toggle without any `aria-label`s. This severely hinders screen reader accessibility for interactive elements.
**Action:** Always verify that utility icon buttons within mapped lists/arrays include context-aware ARIA labels (e.g., `aria-label={\`Edit \${item.name}\`}`).
