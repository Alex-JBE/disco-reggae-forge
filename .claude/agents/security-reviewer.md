---
name: security-reviewer
description: Review API routes for prompt injection and key exposure risks
---
Focus on: src/app/api/*/route.ts — check for unsanitized user input passed directly to Claude, missing API key validation, and exposed internals.
