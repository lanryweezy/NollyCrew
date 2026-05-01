## 2026-04-30 - Add Authentication to Missing Endpoints
**Vulnerability:** Found unauthenticated sensitive API endpoints: `/api/ai/casting` and `/api/users/:userId/reviews` where `authenticateToken` middleware was missing, exposing AI functionalities and user reviews to unauthorized access.
**Learning:** These endpoints were newly added but missing standard security controls, demonstrating the importance of reviewing new route handlers for missing authentication.
**Prevention:** Ensure that all endpoints under the `/api` route, particularly those dealing with PII, resource-intensive tasks (like AI operations), and data reads, utilize `authenticateToken` unless explicitly intended to be public.
