# Friendship Quiz — AI Context

This is the root AI instruction file.

## Required context

Read:

@./agent/AGENT.md
@./agent/RULES.md

## Task context

The current task is defined in:

@./agent/task.md

## Context selection

Do NOT automatically read every file in agent/.

Read additional files only when relevant:

- Product requirements → agent/MVP.md
- Architecture → agent/architecture.md
- Database → agent/database.md
- Schema → agent/Schema.md
- UI/UX → agent/design.md
- Decisions → agent/decisions.md
- Dependency graph → agent/GRAPH_CONTEXT.md
- Roadmap → agent/Implementation_plan_1.md

## Engineering principles

- MVP first.
- Do not over-engineer.
- Don't modify unrelated files.
- Don't invent architecture.
- Don't implement future scope.
- Validate server-side.
- Keep changes focused.
