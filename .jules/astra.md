## 2026-08-12 - JSON Object vs Array Mismatch in response_format
**Learning:** When using OpenAI's `response_format: { type: "json_object" }`, the prompt must explicitly request a JSON object (e.g., `{ "arc": [...] }`), not a raw JSON array. Requesting an array causes an API contradiction that can lead to unexpected model refusals or malformed output. Additionally, raw `JSON.parse` on AI responses without try/catch creates silent failure risks that crash the application.
**Action:** Always ensure the prompt aligns with the requested output schema, and wrap all `JSON.parse(completion)` calls in a `try/catch` with structural validation (e.g., `Array.isArray(parsed.arc)`) and a graceful fallback.

## 2026-08-14 - Silent Failures from Markdown-wrapped JSON
**Learning:** When using models without \`response_format: { type: "json_object" }\` (like standard gpt-4), they often wrap JSON outputs in markdown formatting (e.g., \`\`\`json ... \`\`\`). Raw \`JSON.parse(completion)\` throws a \`SyntaxError\` on this formatting, causing the application to silently crash or fall back to mock data unexpectedly.
**Action:** Always parse AI JSON responses using a safe wrapper that strips markdown backticks and catches parsing errors. Use \`content.replace(/^```(?:json)?\\n?/i, "").replace(/\\n?```$/i, "").trim()\` before calling \`JSON.parse\`.

## 2026-08-14 - Robust AI JSON Output Parsing Strategy
**Learning:** Standard AI output parsing using regex to strip markdown (e.g., `content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()`) is brittle because it anchors to the start (`^`) and end (`$`) of the string. If a model includes a conversational preamble (e.g., "Here is your output:\n```json\n...\n```") or postamble, the `.replace` fails, passing the entire raw string to `JSON.parse` which then throws a `SyntaxError` and causes an application crash or silent fallback.
**Action:** Use a resilient extraction pattern that actively searches for the JSON block instead of blindly replacing edges. e.g., `const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i); const cleaned = match ? match[1] : (content.match(/\{[\s\S]*\}/)?.[0] || content.match(/\[[\s\S]*\]/)?.[0] || content.trim());`. This ensures the JSON is successfully extracted even when wrapped in conversational text.
**Learning:** Standard AI output parsing using regex to strip markdown (e.g. `^```json`) can fail if the model includes a conversational preamble (e.g., "Here is your JSON..."). This results in a parsing crash or fallback. Wait, actually, `JSON.parse` is very strict. The current regex `content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()` anchors to the start (`^`) and end (`$`), making it fail if there is any preamble or postamble.
**Action:** When parsing AI responses for JSON, a more resilient pattern might be needed if models regularly output preambles, or we must use strict prompt engineering (`return ONLY valid JSON matching this schema... Do not include markdown, preamble, or explanation.`). Given the strict prompts in this repo, the `^...$` approach usually suffices, but we must ensure we don't accidentally modify un-staged junk files.

## 2024-05-18 - Missing Timeout Guard for External AI Calls
**Learning:** Unguarded AI API calls (like `openai.chat.completions.create` or `openai.embeddings.create`) can silently hang indefinitely when the model or network stalls. Without timeouts, the app doesn't hit our intended fallback mechanisms, causing poor UX and resource exhaustion.
**Action:** Always use the OpenAI SDK's native `{ timeout: ms }` option on external AI API calls with correctly calibrated durations (e.g., 60-120s for completions, 15s for embeddings). This rejects the hanging connection to free up underlying server network resources and triggers the app's graceful fallback logic.

## 2026-08-17 - Missing Retries for Batch Parallel AI Calls
**Learning:** Unguarded parallel AI calls, especially `openai.embeddings.create` mapped over an array, are extremely vulnerable to rate limiting (HTTP 429). A single 429 error within a `Promise.all` fails the entire batch, immediately triggering the app's fallback logic (e.g. mock data generation) despite other network requests succeeding. This degrades feature quality silently.
**Action:** Always wrap transient-prone AI API calls with a retry utility that utilizes exponential backoff with jitter. This is critical for both chat completions and embeddings, ensuring robust operation under load or network transient failures.

## 2026-08-20 - Unbounded Context Growth in Chat
**Learning:** Sending the entire conversation history in every API call causes unbounded token growth, leading to excessive costs and eventual token limit errors (400 Bad Request).
**Action:** Always bound the conversation history (e.g., `history.slice(-10)`) before sending it to the model to maintain context efficiency and prevent errors.
