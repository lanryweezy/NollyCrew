## 2026-04-28 - [Projects List Filtering Optimization]
**Learning:** Found redundant filtering of the `filteredProjects` array by `p.isOwner` directly in JSX of `client/src/pages/Projects.tsx`. Also `searchTerm.toLowerCase()` was evaluated inside the `.filter` loop instead of before it.
**Action:** Lift `searchTerm.toLowerCase()` out of the `.filter` iteration loop and wrap `filteredProjects.filter(p => p.isOwner)` in a `useMemo` hook. Next time, proactively look for array filtering inside render methods or JSX.
## 2026-05-01 - [React.memo in lists needs useCallback on parents]
**Learning:** Adding React.memo() to child components like `JobCard.tsx` inside loops is useless if the parent component passes down inline arrow functions for events like `onApply` or `onBookmark`. The inline functions recreate every render, invalidating the memoization.
**Action:** When memoizing list children, refactor the parent components to use `useCallback` for event handlers, and modify the child to pass required IDs back up through the callback so the parent doesn't need to close over loop variables.
## 2026-05-15 - [Consolidating Inline Array Filters for Metrics]
**Learning:** Found multiple `.filter().length` calls inside JSX to compute summary metrics. This results in traversing the array multiple times (O(N * M)) on every render, which is wasteful especially when components re-render frequently from state updates like form edits or search inputs.
**Action:** Extract inline summary counts from JSX into a single `useMemo` block that iterates over the array exactly once (O(N)) to accumulate all necessary metrics simultaneously. Always look for sequential `.filter()` operations operating on the same array during renders.
