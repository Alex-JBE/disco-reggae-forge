---
name: new-api-route
description: Scaffold a new Next.js API route following project conventions
---
When creating a new API route in this project:
- Mirror the structure in src/app/api/generate/route.ts
- Use generateJazz() or generateJazzStream() from src/lib/claude.ts
- Accept POST with JSON body, return streaming or JSON response
- Load skill prompts from the skills/ directory if applicable
