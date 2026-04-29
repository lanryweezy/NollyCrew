## 2026-04-28 - [Projects List Filtering Optimization]
**Learning:** Found redundant filtering of the `filteredProjects` array by `p.isOwner` directly in JSX of `client/src/pages/Projects.tsx`. Also `searchTerm.toLowerCase()` was evaluated inside the `.filter` loop instead of before it.
**Action:** Lift `searchTerm.toLowerCase()` out of the `.filter` iteration loop and wrap `filteredProjects.filter(p => p.isOwner)` in a `useMemo` hook. Next time, proactively look for array filtering inside render methods or JSX.
