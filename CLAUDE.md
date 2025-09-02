# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm dev             # Start development server with hot reload
pnpm build           # Type-check, compile and minify for production
pnpm build-only      # Build without type checking
pnpm preview         # Preview production build

# Testing
pnpm test            # Run unit tests with Vitest UI and coverage
# Note: README mentions pnpm test:unit but package.json uses pnpm test

# Code Quality
pnpm type-check      # Run Vue TypeScript compiler
pnpm lint            # Lint and auto-fix with ESLint
pnpm format          # Format code with Prettier
```

## Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Framework**: Element Plus (Chinese locale)
- **Styling**: UnoCSS (Tailwind 3 compatible) + SCSS
- **Testing**: Vitest + Vue Test Utils
- **HTTP Client**: Axios with custom interceptors
- **Real-time Communication**: WebSocket integration

## Architecture Overview

### Project Structure Philosophy
The codebase follows a modular architecture organized by business domains rather than technical layers. Each business module (monitor, task, warehouse, etc.) contains its own components, composables, and API services.

### Key Architectural Patterns

**API Layer**: Centralized HTTP service with token-based authentication, automatic error handling, and parameter serialization. All API modules export functions that return typed responses.

**State Management**: Pinia stores are minimal, primarily handling user authentication and app-wide settings. Most state is managed locally in components using Vue's reactivity.

**Component Architecture**: 
- Layout components handle navigation and page structure
- Business components are organized by module (warehouse/, monitor/, etc.)
- Shared components provide reusable UI elements
- TSX is used for complex components requiring dynamic rendering

**Composables Pattern**: Heavy use of composition functions for:
- WebSocket connections (robot status, tasks, alarms)
- Form handling and validation
- Table management with pagination
- Business logic abstraction

### Development Constraints

**TypeScript Rules**:
- No try/catch error handling (errors handled by interceptors)
- Use vite.config.ts alias rules for imports (@/ for src/)
- JSDoc comments required for functions and variables

**Vue Component Rules**:
- Composition API only
- SCSS with @apply directive for styling
- Avoid semantic HTML tags and native form elements
- Prefer Tailwind classes over custom CSS
- Comments in templates for complex sections

**Documentation Notes**:
- 总是给 Vue 组件中的函数和变量添加 JSDoc 注释

**Styling Approach**:
- UnoCSS with Tailwind 3 preset for utilities
- SCSS for component-specific styles using @apply
- Element Plus components with Chinese localization

### WebSocket Integration
Real-time features use WebSocket connections with token authentication. Multiple specialized composables handle different data streams (robot status, task updates, alarm notifications).

### Testing Strategy
Uses Vitest with Vue Test Utils. Tests are co-located with components in `__tests__/` directories. Coverage reporting is enabled by default.