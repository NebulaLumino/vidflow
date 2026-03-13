# Architecture Decision Records

This document records key architectural decisions made for the VidFlow project, including the context, decision, and consequences.

## ADR-001: Monorepo Structure

**Date**: February 2026

**Status**: Accepted

### Context

We need to organize code across multiple applications (web, mobile, extension) and shared packages. We evaluated three options: monorepo, polyrepo, or hybrid.

### Decision

Use a monorepo structure with pnpm workspaces and Turborepo for build orchestration.

**Structure:**

```
vidflow/
├── apps/           # Client applications
├── services/       # Backend microservices
├── packages/       # Shared packages
├── docs/           # Documentation
├── infra/          # Infrastructure as code
└── scripts/        # Build scripts
```

### Consequences

**Pros:**

- Single source of truth
- Easy code sharing between apps
- Simplified dependency management
- Atomic commits across projects

**Cons:**

- Repo size larger
- Requires tooling (Turborepo)
- CI/CD more complex

---

## ADR-002: Go for API Services

**Date**: February 2026

**Status**: Accepted

### Context

We need to choose the primary language for backend API services (Gateway, Worker). Options considered: Go, Node.js, Rust.

### Decision

Use Go (Golang) for the Gateway and Worker services.

### Rationale

- **Performance**: Go provides excellent concurrency with goroutines
- **Production ready**: Battle-tested at scale
- **Simplicity**: Easy to read and maintain
- **Ecosystem**: Strong standard library, good HTTP frameworks (Gin, Echo)
- **Team expertise**: Existing team experience with Go

### Consequences

**Pros:**

- High performance and low latency
- Simple deployment (single binary)
- Good concurrency model
- Strong typing

**Cons:**

- Less dynamic than Node.js
- Slower development for simple CRUD
- Fewer npm-like packages

---

## ADR-003: Python for Parser Service

**Date**: February 2026

**Status**: Accepted

### Context

The parser service needs to handle complex HTML parsing, browser automation, and rapid platform additions. We evaluated Python, Node.js, and Go.

### Decision

Use Python for the Parser service.

### Rationale

- **BeautifulSoup/Selenium**: Excellent HTML parsing libraries
- **Playwright**: First-class Python support
- **Rapid development**: Quick to add new platforms
- **ML ecosystem**: Future-ready for video analysis

### Consequences

**Pros:**

- Rich parsing libraries
- Easy platform implementation
- Good for web scraping

**Cons:**

- Slower than Go
- More memory usage
- Requires virtual environments

---

## ADR-004: Next.js for Web App

**Date**: February 2026

**Status**: Accepted

### Context

We need a modern, performant web framework. Options: Next.js, Remix, Gatsby, plain React.

### Decision

Use Next.js 14 with App Router.

### Rationale

- **Performance**: Server-side rendering and static generation
- **SEO**: Excellent for discoverability
- **Ecosystem**: Largest React meta-framework
- **Team experience**: Familiar technology
- **Vercel**: Easy deployment and optimization

### Consequences

**Pros:**

- Great performance out of the box
- Good SEO capabilities
- Large ecosystem
- Easy deployment

**Cons:**

- Learning curve for App Router
- Some complexity with caching

---

## ADR-005: PostgreSQL for Primary Database

**Date**: February 2026

**Status**: Accepted

### Context

We need a reliable relational database. Options: PostgreSQL, MySQL, MongoDB.

### Decision

Use PostgreSQL 15.

### Rationale

- **ACID compliance**: Data integrity
- **JSON support**: Flexible schemas
- **Performance**: Excellent for complex queries
- **Replication**: Good HA options
- **Team expertise**: Familiar technology

### Consequences

**Pros:**

- Robust and reliable
- Good performance
- Rich feature set
- Strong community

**Cons:**

- Requires more setup than SQLite
- Horizontal scaling requires work

---

## ADR-006: Tailwind CSS for Styling

**Date**: February 2026

**Status**: Accepted

### Context

We need a styling solution. Options: Tailwind, CSS Modules, Styled Components.

### Decision

Use Tailwind CSS.

### Rationale

- **Speed**: Utility-first is fast
- **Consistency**: Design tokens
- **Maintenance**: Easy to change globally
- **Performance**: Zero runtime overhead

### Consequences

**Pros:**

- Fast development
- Consistent styling
- Small bundle size

**Cons:**

- Learning curve
- Can lead to messy templates

---

## ADR-007: React for UI Framework

**Date**: February 2026

**Status**: Accepted

### Context

We need a UI framework for all client applications. Options: React, Vue, Svelte.

### Decision

Use React across all applications.

### Rationale

- **Unified codebase**: Share components between web and mobile
- **Ecosystem**: Largest component library
- **Team experience**: Familiar technology
- **Extension support**: Works well in Chrome extensions

### Consequences

**Pros:**

- Component reusability
- Large ecosystem
- Good tooling

**Cons:**

- Bundle size larger than alternatives
- JavaScript-heavy

---

## ADR-008: TypeScript Everywhere

**Date**: February 2026

**Status**: Accepted

### Context

We need type safety across the codebase. Options: TypeScript, JavaScript, Flow.

### Decision

Use TypeScript for all projects.

### Rationale

- **Type safety**: Catch errors at compile time
- **Documentation**: Self-documenting code
- **Refactoring**: Safe changes
- **IDE support**: Better developer experience

### Consequences

**Pros:**

- Fewer runtime errors
- Better code quality
- Self-documenting

**Cons:**

- Slower initial development
- Type maintenance overhead

---

## ADR-009: Manifest V3 for Chrome Extension

**Date**: February 2026

**Status**: Accepted

### Context

Chrome is migrating from Manifest V2 to V3. We need to choose which version to target.

### Decision

Use Manifest V3.

### Rationale

- **Future-proof**: V2 is deprecated
- **Security**: Better sandboxing
- **Performance**: Service workers
- **Chrome Web Store**: Required for new extensions

### Consequences

**Pros:**

- Future-proof
- Better security
- Modern APIs

**Cons:**

- More complex than V2
- Background script limitations

---

## ADR-010: Taro for Mini Program

**Date**: February 2026

**Status**: Accepted

### Context

We need a framework for WeChat Mini Program. Options: Taro, UniApp, native development.

### Decision

Use Taro with React.

### Rationale

- **React**: Matches our web framework
- **Cross-platform**: Compile to multiple mini programs
- **Ecosystem**: Good component library
- **Maintenance**: Active development

### Consequences

**Pros:**

- Code sharing with web
- Multi-platform output
- Good performance

**Cons:**

- Platform-specific quirks
- Requires testing on each platform

---

## ADR-011: RabbitMQ for Job Queue

**Date**: February 2026

**Status**: Accepted

### Context

We need a message queue for job processing. Options: RabbitMQ, Redis, AWS SQS.

### Decision

Use RabbitMQ.

### Rationale

- **Reliability**: Proven at scale
- **Flexibility**: Multiple exchange types
- **Management**: Good UI
- **Team experience**: Familiar technology

### Consequences

**Pros:**

- Reliable message delivery
- Flexible routing
- Good monitoring

**Cons:**

- Requires cluster for HA
- More complex than Redis

---

## ADR-012: Redis for Caching

**Date**: February 2026

**Status**: Accepted

### Context

We need a caching layer. Options: Redis, Memcached, in-memory.

### Decision

Use Redis.

### Rationale

- **Versatile**: Multiple data structures
- **Persistence**: Optional disk storage
- **Performance**: Excellent speed
- **Ecosystem**: Good client libraries

### Consequences

**Pros:**

- Fast caching
- Multiple data types
- Good scalability

**Cons:**

- Memory intensive
- Requires cluster for HA
