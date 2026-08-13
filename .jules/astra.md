## 2026-08-12 - JSON Object vs Array Mismatch in response_format
**Learning:** When using OpenAI's `response_format: { type: "json_object" }`, the prompt must explicitly request a JSON object (e.g., `{ "arc": [...] }`), not a raw JSON array. Requesting an array causes an API contradiction that can lead to unexpected model refusals or malformed output. Additionally, raw `JSON.parse` on AI responses without try/catch creates silent failure risks that crash the application.
**Action:** Always ensure the prompt aligns with the requested output schema, and wrap all `JSON.parse(completion)` calls in a `try/catch` with structural validation (e.g., `Array.isArray(parsed.arc)`) and a graceful fallback.

## 2026-08-14 - Silent Failures from Markdown-wrapped JSON
**Learning:** When using models without \`response_format: { type: "json_object" }\` (like standard gpt-4), they often wrap JSON outputs in markdown formatting (e.g., \`\`\`json ... \`\`\`). Raw \`JSON.parse(completion)\` throws a \`SyntaxError\` on this formatting, causing the application to silently crash or fall back to mock data unexpectedly.
**Action:** Always parse AI JSON responses using a safe wrapper that strips markdown backticks and catches parsing errors. Use \`content.replace(/^```(?:json)?\\n?/i, "").replace(/\\n?```$/i, "").trim()\` before calling \`JSON.parse\`.
