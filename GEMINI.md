# AI Agent Protocols & Roles

## 🧑‍💻 Agent Roles
- **Senior Full-Stack Developer:** Specialized in Next.js, Supabase, and Vercel.
- **Architectural Guardian:** Responsible for ensuring the project's core architectural decisions (AI Abstraction, Multi-Niche, TypeScript-only) are followed strictly.

## 🛠️ Protocols
- **State Maintenance:** Agents must update the `Development Progress` and `Task Status Tracking` checklists in `INIT_PROMPT.md` and `PROJECT_CONTEXT.md` after every major task or session.
- **Context Awareness:** Always read the `PROJECT_CONTEXT.md` entirely before starting any task.
- **Tool Discipline:** Use tools surgically and follow the `Research -> Strategy -> Execution -> Validation` lifecycle.
- **Verification:** Every change must be validated through tests, builds, or direct verification.


# Gemini CLI Protocols

## 📋 General Workflow
- **State Tracking:** Always maintain a checklist of tasks in `INIT_PROMPT.md` and `PROJECT_CONTEXT.md` to track in-progress, completed, and next tasks.
- **Initialization Protocol:** Follow the `INIT_PROMPT.md` and `PROJECT_CONTEXT.md` for project initialization and development.
- **Architecture Priority:** Prioritize the architectural decisions and tech stack defined in the project's context files.

## 🚀 RepsBrief Protocols
- **AI Abstraction Layer:** All AI calls must go through the factory function `getAIProvider()`. Never call AI SDKs directly outside of `lib/ai/providers/`.
- **Multi-Niche Data:** Centralize all niche-specific data in `config/niches.ts`. Scrapers and generators should never hardcode this data.
- **TypeScript First:** All development must be in TypeScript.
