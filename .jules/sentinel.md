# Sentinel Security Learnings

## 2026-05-06: Fail-Closed Security Posture for Secrets
- **Learning**: Using hardcoded string fallbacks for critical secrets (like `JWT_SECRET`) creates a severe vulnerability if the environment variable is accidentally omitted in production.
- **Action**: Implement a fail-closed posture by explicitly checking for required environment variables during module initialization and throwing an error if they are missing. This ensures the application refuses to run in an insecure state.
