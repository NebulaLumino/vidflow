# BLUEPRINT.md — Distributed Video Download System

**Project Name:** VidFlow  
**Version:** 1.0.0  
**Last Updated:** February 25, 2026  
**Status:** Production Architecture  
**Owners:** Chief Software Architect  

---

## Table of Contents

1. [Project Vision & North Star](#section-1-project-vision--north-star)
2. [Monorepo Architecture](#section-2-monorepo-architecture)
3. [The `docs/` Folder — AI-Agent Documentation System](#section-3-the-docs-folder--ai-agent-documentation-system)
4. [`AGENTS.md` Specification](#section-4-agentsmd-specification)
5. [`CLAUDE.md` Specification](#section-5-claudemd-specification)
6. [`API.md` Specification](#section-6-apimd-specification)
7. [Backend Architecture — Deep Dive](#section-7-backend-architecture--deep-dive)
8. [Chrome Extension — Deep Dive](#section-8-chrome-extension--deep-dive)
9. [Next.js Web Application — Deep Dive](#section-9-nextjs-web-application--deep-dive)
10. [React Native Module](#section-10-react-native-module)
11. [WeChat Mini Program](#section-11-wechat-mini-program)
12. [Infrastructure & DevOps](#section-12-infrastructure--devops)
13. [Data Model & State Management](#section-13-data-model--state-management)
14. [Security & Compliance](#section-14-security--compliance)
15. [Testing Strategy](#section-15-testing-strategy)
16. [Development Workflow & Conventions](#section-16-development-workflow--conventions)
17. [MVP Definition & Phased Rollout](#section-17-mvp-definition--phased-rollout)
18. [Open-Source Dependency Map](#section-18-open-source-dependency-map)
19. [Risk Register & Mitigation](#section-19-risk-register--mitigation)
20. [Appendix](#section-20-appendix)

---

## SECTION 1: Project Vision & North Star

### 1.1 Mission Statement

The mission of this project is to build the world's most reliable, fastest, and most user-friendly distributed video download platform. We aim to democratize content access by providing free, one-click video downloads from every major video platform on the internet. Our platform serves as a universal bridge between content creators' videos and end users' local devices, with zero barriers to entry.

We believe that users should have the freedom to save videos they have legal rights to access—educational content, their own uploaded content, licensed materials they have permission to download, and public domain media. We do not exist to facilitate copyright infringement, and our architecture includes safeguards to respect content creators' rights while serving legitimate user needs.

### 1.2 Product Philosophy

Our product philosophy centers on three core principles that govern every decision:

**Simplicity Above All Else.** The user interface must be so intuitive that a child could use it. Every feature added must pass the simplicity test: if it requires explanation, it probably should not be in the primary user flow. The download process from pasting a URL to having a file on disk should take no more than three user actions. We measure success by how few clicks it takes to accomplish the user's goal.

**Speed as a Feature.** We treat latency as a critical metric, not an afterthought. Users abandon slow tools. Every component in our system is optimized for performance: the extension popup opens in under 200 milliseconds, the web app responds in under 100 milliseconds to URL submissions, and video parsing completes in under 10 seconds for standard videos. Speed is competitive advantage in this market.

**Reliability Over Features.** Users will forgive a missing feature they never knew they wanted, but they will never forgive a tool that does not work when they need it. Our system must achieve 99.9% uptime and 95%+ successful download completion rates. We build redundancy into every critical path. We test relentlessly. We deploy conservatively.

### 1.3 Target Users and Personas

We have identified four primary user personas that represent our core audience. Each persona informs specific architectural decisions.

**Persona 1: The Casual Downloader.** This user downloads videos occasionally—perhaps once a month—when they find something they want to watch offline during travel or when mobile data is unavailable. They do not care about technical details. They want the simplest possible experience: paste link, click download, done. They use primarily the web app or the extension when prompted by a browser. They represent approximately 60% of our user base but generate 20% of our traffic volume.

**Persona 2: The Power User.** This user downloads videos frequently—daily or multiple times per day. They may be content creators who need reference material, educators building course libraries, or researchers collecting video datasets. They care about quality options, format selection, and batch downloads. They understand the difference between 1080p and 4K. They provide the majority of our repeat traffic and are most likely to provide word-of-mouth referrals. They represent approximately 25% of users and 50% of volume.

**Persona 3: The Developer or Integrator.** This user wants to build products on top of our infrastructure. They may be building a content management system, an educational platform, or a media management tool. They need our API, our SDKs, and reliable documentation. They generate minimal direct revenue but expand our ecosystem reach. They represent approximately 10% of users and are critical to our long-term platform strategy.

**Persona 4: The Mobile-Only User.** This user accesses the internet exclusively from mobile devices. In China and Southeast Asia, this represents the majority of internet users. They do not use browser extensions. They access our web app or our embedded modules within other apps. They need mobile-optimized experiences with WeChat integration, local payment options, and region-specific content. They represent approximately 5% of current users but represent our highest growth segment.

### 1.4 Success Metrics and KPIs

Our success is measured against a defined set of key performance indicator that align with our business model. We track these metrics at multiple granularity levels: real-time dashboards for operational metrics, daily rollups for business metrics, and weekly analyses for trend identification.

**User Acquisition Metrics.** Chrome Extension installs serve as our primary acquisition channel. We target 10,000 installs within 90 days of launch, with a goal of 100,000 within the first year. Web app unique visitors should reach 50,000 monthly within six months. We track install-to-active-user conversion rate with a target of 40%—meaning 40% of people who install the extension should use it at least once within 30 days.

**Engagement Metrics.** Daily Active Users (DAU) is our primary engagement metric. We target 1,000 DAU within three months and 10,000 DAU within one year. Download success rate—the percentage of initiated downloads that complete successfully—must exceed 95%. Average downloads per active user per week should exceed 2.0 for our power user segment.

**Revenue Metrics.** Since our revenue model is advertising-only, we track ad revenue per thousand impressions (RPM), ad revenue per user (ARPU), and total advertising revenue. Initial target is $0.50 RPM for web traffic and $2.00 RPM for extension traffic (extension traffic typically commands higher CPMs due to higher intent). We need to achieve break-even operational costs at 50,000 daily active users.

**Technical Metrics.** API response time p95 must remain under 500 milliseconds. Parser success rate—successful video identification and metadata extraction—must exceed 90% for supported platforms. System uptime must exceed 99.9% measured monthly. Extension popup open time must remain under 200 milliseconds p95.

### 1.5 Competitive Landscape Analysis

The video downloading space has several established players, each with distinct strengths and weaknesses that inform our differentiation strategy.

**y2mate.com** is the current market leader with the highest search volume for "video download" queries. Y2mate succeeds because of aggressive SEO, supporting over 10,000 websites, and providing a no-nonsense web interface. Y2mate fails because of intrusive advertisements, slow parsing times, aggressive redirect behavior, and poor mobile experience. Users frequently complain about being redirected to unwanted sites, slow download speeds, and broken links. We can beat Y2mate on speed, user experience, and mobile optimization.

**savefrom.net** is a well-established alternative that pioneered the "one-click" download concept through browser extensions. Savefrom has strong brand recognition and decent SEO. Their weaknesses include limited platform support compared to y2mate, dated user interface, and their extension has been removed from Chrome Web Store multiple times due to policy violations. We can differentiate by maintaining Chrome Web Store compliance and offering better platform coverage than Savefrom.

**cobalt.tools** is a newer entrant that has gained significant developer credibility. Cobalt focuses on a clean, minimalist aesthetic and supports social media platforms specifically. Cobalt succeeds with design-conscious users and developers. Cobalt fails by supporting fewer platforms than competitors, lacking a browser extension, and having no mobile strategy. We can differentiate by offering the full platform coverage of y2mate with the user experience of cobalt.

**4kdownload.com** targets quality-conscious users willing to pay for premium features. 4kdownload has a solid desktop application but fails on accessibility (requires software installation), lacks a free tier, and has weak SEO presence. We can differentiate by offering their quality selection for free with advertising support.

### 1.6 The "10x Better" Thesis

This project is worth building because we can deliver a product that is 10x better than existing solutions across multiple dimensions simultaneously.

**Speed 10x Better.** Our architecture is designed for speed from the ground up. The median download time from URL submission to file completion should be under 30 seconds for standard videos, compared to the 2-5 minutes users experience on existing tools. This is achieved through intelligent pre-caching, optimized CDN routing, and parallel stream processing.

**Reliability 10x Better.** Existing tools break frequently because they lack automated testing and monitoring. Our system includes automated health checks that test parsing on every supported platform every 15 minutes. When a platform changes their API, we detect it within 15 minutes and alert the team. We target 99.9% uptime versus the 95% typical of competitors.

**User Experience 10x Better.** We eliminate the ad clutter, the redirect loops, and the confusing interfaces that plague existing tools. Our extension popup is lean and focused. Our web app loads instantly. Our mobile experience is native-level. Every interaction is designed to minimize user effort.

**Platform Coverage 10x Better.** We support more platforms than any competitor while maintaining higher success rates. Our modular parser architecture makes adding new platforms straightforward, allowing us to expand faster than competitors can respond.

### 1.7 Legal and Compliance Considerations

Video downloading exists in a legally complex space. We take a principled approach that respects both the letter and spirit of applicable laws while building a viable product.

**Platform Risk Tier System.** We categorize supported platforms into three risk tiers based on their terms of service, the legal precedent around downloading from them, and our assessment of enforcement likelihood.

**Green Tier (Low Risk):** Platforms where downloading is explicitly permitted or legally unambiguous. This includes Vimeo (pro accounts allow downloads), Bilibili (user-uploaded content with download buttons), Internet Archive, and public domain content platforms. We prioritize these platforms and feature them prominently.

**Yellow Tier (Moderate Risk):** Platforms where terms are ambiguous but enforcement is rare. This includes YouTube (technically violates Terms of Service but rarely enforced against personal use), TikTok, Instagram, Twitter/X, and Facebook. We support these platforms but include prominent disclaimers about personal use only. We implement rate limiting to prevent mass-scale downloading that would trigger enforcement.

**Red Tier (High Risk):** Platforms where downloading violates explicit terms and where enforcement actions have occurred. This includes Netflix, Disney+, HBO Max, and other premium streaming services. We do NOT support these platforms. Our parser service includes blocks to prevent parsing attempts on known streaming service URLs.

**DMCA Compliance.** We respond promptly to DMCA takedown requests. We maintain a registered DMCA agent and commit to responding within 48 hours to any valid request. We implement content identification to prevent re-uploading of copyrighted content to any future user-generated content features. We do not host any user-generated content—we merely facilitate downloading from third-party platforms.

**Data Privacy Compliance.** We comply with GDPR for European users and CCPA for California users. We collect minimal user data: we do not require registration, we do not track browsing history beyond our own properties, and we do not sell user data. Our analytics are aggregate-only. We provide data export and deletion capabilities as required by law.

---

## SECTION 2: Monorepo Architecture

### 2.1 Why Monorepo

We have chosen a monorepo architecture over a polyrepo approach for several interconnected reasons that compound to create significant development velocity advantages.

**Unified Dependency Management.** In a monorepo, we maintain a single source of truth for all internal package versions. When we update our shared TypeScript types in `/packages/shared/`, that update immediately propagates to all consumers without requiring version bumps, npm publishes, or dependency resolution complexity. This eliminates an entire category of "dependency hell" issues that plague polyrepo architectures.

**Atomic Changes.** When we need to add a new feature that spans the Chrome Extension, the backend API, and the web app, we can make all changes in a single atomic commit. This means no partial deployments, no version mismatches between services, and no coordination overhead across repositories. The git history tells the complete story of every feature.

**Simplified CI/CD.** We maintain one CI pipeline configuration that tests everything. When a developer opens a pull request, the entire system is tested together, catching integration issues that separate repo testing would miss. Deployment becomes simpler: we either deploy everything together or we do not deploy at all.

**AI-Agent Optimization.** The most important reason for monorepo in our context: AI coding agents work dramatically better with a monorepo structure. When Claude Code or Codex needs to understand how the extension connects to the backend, they can traverse the entire codebase in a single context. In a polyrepo, the agent would need to clone multiple repositories, understand multiple CI configurations, and track versions across repositories—adding friction and error potential at every step.

### 2.2 Package Manager and Workspace Configuration

We use **pnpm** as our package manager, chosen over npm and yarn for several specific advantages.

**pnpm Advantages.** pnpm uses a content-addressable storage mechanism that saves significant disk space by hardlinking packages that are shared across projects. In our monorepo with multiple Node.js applications, this reduction is substantial—typically 60-70% smaller node_modules directories compared to npm. pnpm also has superior handling of peer dependencies, reducing the "invalid peer dependency" warnings that plague npm and yarn. The workspace protocol in pnpm makes referencing internal packages seamless: we reference internal packages as `workspace:*` which resolves to the local package without needing to publish to a registry.

**Workspace Structure.** Our pnpm workspace is configured in the root `pnpm-workspace.yaml` file. All application directories in `/apps/` and all package directories in `/packages/` are included in the workspace. Service directories in `/services/` that contain Node.js components also participate in the workspace where applicable.

**Version Strategy.** We use a fixed version strategy for internal packages. All packages in the workspace share the same version number, defined in the root `package.json`. This simplifies version management and ensures that every part of the system is always on the same internal package versions. When a release is ready, we bump the version in one place and publish everything together.

### 2.3 Complete Directory Tree

The following represents the canonical directory structure for this project. Every folder and significant file is described with its purpose. This tree is the single source of truth for project organization.

```
/home/ubuntu/github/vidflow/
├── .github/                          # GitHub configuration
│   ├── workflows/                    # GitHub Actions CI/CD pipelines
│   │   ├── ci.yml                    # Continuous integration workflow
│   │   ├── deploy-extension.yml      # Chrome extension deployment
│   │   ├── deploy-web.yml             # Web application deployment
│   │   └── deploy-services.yml       # Backend services deployment
│   ├── ISSUE_TEMPLATE/               # GitHub issue templates
│   └── PULL_REQUEST_TEMPLATE.md      # PR description template
├── apps/                             # Frontend applications
│   ├── web/                          # Next.js web application
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router pages
│   │   │   │   ├── (marketing)/      # Marketing pages group
│   │   │   │   │   ├── page.tsx      # Landing page
│   │   │   │   │   └── layout.tsx    # Marketing layout
│   │   │   │   ├── (download)/       # Download tool pages group
│   │   │   │   │   ├── page.tsx      # Main download page
│   │   │   │   │   └── [platform]/   # Platform-specific download pages
│   │   │   │   ├── blog/             # SEO content pages
│   │   │   │   ├── legal/            # Legal pages (ToS, Privacy, DMCA)
│   │   │   │   ├── api/              # API routes for web hooks
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   └── not-found.tsx     # 404 page
│   │   │   ├── components/           # React components
│   │   │   │   ├── ui/               # Base UI components
│   │   │   │   ├── download/         # Download-specific components
│   │   │   │   ├── ad/               # Ad placement components
│   │   │   │   └── seo/              # SEO components
│   │   │   ├── lib/                  # Utility libraries
│   │   │   │   ├── api.ts            # API client
│   │   │   │   ├── analytics.ts      # Analytics integration
│   │   │   │   └── utils.ts          # General utilities
│   │   │   ├── hooks/                # React hooks
│   │   │   ├── contexts/             # React contexts
│   │   │   ├── styles/               # Global styles
│   │   │   └── types/                # Web-specific types
│   │   ├── public/                   # Static assets
│   │   │   ├── images/               # Images and graphics
│   │   │   ├── fonts/                # Custom fonts
│   │   │   └── locales/              # i18n translation files
│   │   ├── .env.example              # Environment variable template
│   │   ├── next.config.js            # Next.js configuration
│   │   ├── tailwind.config.ts        # Tailwind CSS configuration
│   │   ├── package.json              # Application dependencies
│   │   └── tsconfig.json             # TypeScript configuration
│   ├── extension/                    # Chrome Extension (Manifest V3)
│   │   ├── src/
│   │   │   ├── background/           # Service worker
│   │   │   │   ├── index.ts          # Background script entry
│   │   │   │   ├── messages.ts       # Message handling
│   │   │   │   └── storage.ts        # Background storage
│   │   │   ├── popup/                # Extension popup
│   │   │   │   ├── Popup.tsx         # Main popup component
│   │   │   │   ├── DownloadPanel.tsx # Download controls
│   │   │   │   └── VideoInfo.tsx    # Video metadata display
│   │   │   ├── content-scripts/      # Content script injection
│   │   │   │   ├── inject.ts         # Main injection script
│   │   │   │   ├── detectors/        # Platform-specific detectors
│   │   │   │   │   ├── youtube.ts    # YouTube detection
│   │   │   │   │   ├── tiktok.ts     # TikTok detection
│   │   │   │   │   └── ...
│   │   │   │   └── utils/            # Content script utilities
│   │   │   ├── options/              # Options page
│   │   │   │   ├── Options.tsx       # Options UI
│   │   │   │   └── Settings.tsx      # Settings management
│   │   │   ├── styles/               # Extension styles
│   │   │   └── types/                # Extension types
│   │   ├── icons/                    # Extension icons (various sizes)
│   │   ├── _locales/                 # i18n translation files
│   │   ├── manifest.json             # Manifest V3 definition
│   │   ├── package.json              # Extension dependencies
│   │   └── webpack.config.js         # Build configuration
│   ├── mobile/                       # React Native module
│   │   ├── src/
│   │   │   ├── VideoDownloader/      # Main component
│   │   │   ├── NativeBridge/         # Native module bridge
│   │   │   └── types/                # TypeScript types
│   │   ├── android/                  # Android native code
│   │   ├── ios/                      # iOS native code
│   │   ├── index.js                  # Entry point
│   │   └── package.json              # Module dependencies
│   └── mini-program/                 # WeChat Mini Program
│       ├── src/
│       │   ├── pages/                 # Mini program pages
│       │   │   ├── index/            # Home page
│       │   │   ├── download/         # Download page
│       │   │   └── profile/          # User profile
│       │   ├── components/           # Reusable components
│       │   ├── services/             # API services
│       │   ├── utils/                # Utilities
│       │   └── app.config.ts         # App configuration
│       ├── project.config.json       # Taro configuration
│       └── package.json              # Dependencies
├── services/                         # Backend microservices
│   ├── parser/                       # Video parsing service (Python)
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py               # FastAPI entry point
│   │   │   ├── api/                  # API routes
│   │   │   │   ├── routes.py         # Main routes
│   │   │   │   └── health.py         # Health checks
│   │   │   ├── core/                 # Core business logic
│   │   │   │   ├── parser.py         # Video parsing orchestration
│   │   │   │   ├── extractors/      # Platform extractors
│   │   │   │   ├── converter.py     # Format conversion
│   │   │   │   └── cache.py         # Caching logic
│   │   │   ├── models/               # Data models
│   │   │   │   ├── schemas.py        # Pydantic schemas
│   │   │   │   └── database.py      # DB models
│   │   │   └── utils/                # Utilities
│   │   ├── tests/                    # Service tests
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── Dockerfile                # Container definition
│   │   └── pyproject.toml           # Python project config
│   ├── gateway/                      # API Gateway (Go)
│   │   ├── cmd/
│   │   │   └── server/               # Main entry point
│   │   ├── internal/
│   │   │   ├── handlers/            # HTTP handlers
│   │   │   ├── middleware/           # Middleware (CORS, auth, etc.)
│   │   │   ├── services/             # Business logic
│   │   │   ├── router/              # Route definitions
│   │   │   └── config/              # Configuration
│   │   ├── pkg/                     # External packages
│   │   ├── go.mod                   # Go module definition
│   │   ├── go.sum                   # Go dependencies
│   │   └── Dockerfile              # Container definition
│   ├── worker/                       # Background job workers
│   │   ├── src/
│   │   │   ├── jobs/               # Job type definitions
│   │   │   ├── workers/            # Worker implementations
│   │   │   ├── queue/              # Queue management
│   │   │   └── metrics/             # Job metrics
│   │   ├── package.json             # Worker dependencies
│   │   └── Dockerfile              # Container definition
│   └── ads/                          # Ad service
│       ├── src/
│       │   ├── ad-server/           # Ad serving logic
│       │   ├── tracker/             # Impression/click tracking
│       │   ├── analytics/           # Revenue analytics
│       │   └── config/               # Ad network configs
│       ├── package.json
│       └── Dockerfile
├── packages/                         # Shared packages
│   ├── shared/                       # Shared TypeScript types and utilities
│   │   ├── src/
│   │   │   ├── types/               # TypeScript interfaces
│   │   │   │   ├── video.ts         # Video-related types
│   │   │   │   ├── api.ts           # API types
│   │   │   │   └── platform.ts      # Platform types
│   │   │   ├── constants/           # Shared constants
│   │   │   ├── utils/               # Utility functions
│   │   │   └── validation/          # Validation functions
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                           # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/         # Base UI components
│   │   │   │   ├── Button/          # Button component
│   │   │   │   ├── Input/           # Input component
│   │   │   │   ├── Modal/           # Modal component
│   │   │   │   └── ...
│   │   │   ├── hooks/               # Shared UI hooks
│   │   │   ├── styles/              # Global styles/themes
│   │   │   └── index.ts            # Package exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── sdk/                          # Client SDK
│       ├── src/
│       │   ├── index.ts             # Main SDK export
│       │   ├── client.ts            # HTTP client
│       │   ├── resources/          # Resource clients
│       │   │   ├── videos.ts        # Video resource
│       │   │   ├── platforms.ts    # Platform resource
│       │   │   └── analytics.ts    # Analytics resource
│       │   └── types/               # SDK-specific types
│       ├── package.json
│       └── tsconfig.json
├── docs/                             # AI-Agent Documentation (mirrors repo)
│   ├── BLUEPRINT.md                  # This document
│   ├── ARCHITECTURE.md              # System architecture overview
│   ├── API.md                       # API reference
│   ├── AGENTS.md                    # AI agent instructions
│   ├── CLAUDE.md                    # Claude-specific instructions
│   ├── DECISIONS.md                 # Architectural decision records
│   ├── GLOSSARY.md                  # Project terminology
│   ├── services/
│   │   ├── parser/
│   │   │   ├── README.md           # Parser service overview
│   │   │   ├── architecture.md     # Parser architecture
│   │   │   ├── platforms.md        # Supported platforms
│   │   │   └── integration.md      # Integration points
│   │   ├── gateway/
│   │   │   ├── README.md
│   │   │   └── routes.md
│   │   ├── worker/
│   │   │   ├── README.md
│   │   │   └── jobs.md
│   │   └── ads/
│   │       ├── README.md
│   │       └── placements.md
│   ├── apps/
│   │   ├── web/
│   │   │   ├── README.md
│   │   │   ├── pages.md
│   │   │   ├── seo.md
│   │   │   └── ads.md
│   │   ├── extension/
│   │   │   ├── README.md
│   │   │   ├── architecture.md
│   │   │   ├── popup-flow.md
│   │   │   └── platform-detection.md
│   │   ├── mobile/
│   │   │   └── README.md
│   │   └── mini-program/
│   │       ├── README.md
│   │       └── wechat-integration.md
│   ├── packages/
│   │   ├── shared/
│   │   │   └── README.md
│   │   ├── ui/
│   │   │   └── README.md
│   │   └── sdk/
│   │       └── README.md
│   └── guides/
│       ├── adding-platform.md      # Guide for adding new platform
│       ├── adding-ad-placement.md   # Guide for adding ads
│       └── troubleshooting.md       # Common issues
├── infra/                            # Infrastructure as Code
│   ├── terraform/                    # Terraform configurations
│   │   ├── modules/
│   │   │   ├── compute/             # Compute resources
│   │   │   ├── network/            # Network configuration
│   │   │   ├── storage/            # Storage resources
│   │   │   └── database/           # Database resources
│   │   ├── staging/                 # Staging environment
│   │   └── production/              # Production environment
│   ├── kubernetes/                  # K8s configurations
│   │   ├── base/                    # Base K8s manifests
│   │   │   ├── deployments/
│   │   │   ├── services/
│   │   │   └── configmaps/
│   │   ├── overlays/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── kustomization.yaml
│   └── docker/
│       ├── docker-compose.yml       # Local development
│       └── Dockerfile.template      # Service Dockerfile template
├── scripts/                          # Build and deployment scripts
│   ├── build.sh                     # Build all packages
│   ├── deploy.sh                    # Deploy to environment
│   ├── test.sh                      # Run all tests
│   ├── lint.sh                      # Run linting
│   └── utils/                       # Shared script utilities
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
├── pnpm-workspace.yaml             # pnpm workspace config
├── package.json                    # Root package.json
├── tsconfig.base.json              # Base TypeScript config
├── eslint.config.js                # ESLint configuration
├── prettier.config.js              # Prettier configuration
├── turbo.json                      # Turborepo configuration
├── README.md                       # Project README
└── LICENSE                         # Project license
```

### 2.4 Dependency Graph Between Packages

Understanding the dependency relationships between packages is critical for understanding how changes propagate through the system. The following describes the official dependency direction for all significant relationships.

**Tier 1: Foundation Packages.** These packages have no internal dependencies and are built upon by everything else.

`/packages/shared/` depends on nothing internal. It contains only TypeScript type definitions, constants, and validation utilities that have no dependencies on other packages. This package is consumed by every other package in the system.

`/packages/ui/` depends on `/packages/shared/` for type definitions. It contains no business logic, only presentation components. It is consumed by all frontend applications.

**Tier 2: Service Packages.** These packages depend on foundation packages and provide services to applications.

`/packages/sdk/` depends on `/packages/shared/` for API types. It provides an HTTP client wrapper that all frontend applications use to communicate with the backend. The SDK encapsulates authentication, request formatting, and response parsing.

`/services/gateway/` is a standalone Go service with no internal package dependencies. It is the entry point for all backend API traffic and routes to downstream services.

**Tier 3: Applications.** These packages consume foundation and service packages.

`/apps/web/` depends on `/packages/shared/`, `/packages/ui/`, and `/packages/sdk/`. The web application uses shared types, UI components, and the SDK to communicate with the backend.

`/apps/extension/` depends on `/packages/shared/` and `/packages/sdk/`. The Chrome extension uses shared types for video metadata and the SDK for API communication. It does not use `/packages/ui/` because Chrome extensions have their own component architecture.

`/apps/mobile/` depends on `/packages/shared/` and may optionally use `/packages/sdk/`. The React Native module is designed to be embedded in host applications, so its dependencies are minimal.

`/apps/mini-program/` depends on `/packages/shared/` and has its own service layer for API communication.

**Tier 4: Backend Services.** These services communicate with each other via network protocols, not internal imports.

The Parser service (`/services/parser/`) is a Python FastAPI application. It has no Node.js dependencies. It exposes an HTTP API that the Gateway calls.

The Worker service (`/services/worker/`) is a Node.js application that depends on `/packages/shared/` for job type definitions. It communicates with the Parser via HTTP and with Redis for queue management.

The Ad service (`/services/ads/`) is a Node.js application that depends on `/packages/shared/` for ad-related types. It communicates with external ad networks and provides an API for ad configuration.

### 2.5 Build Pipeline Strategy

Our build pipeline is orchestrated using **Turborepo** in combination with pnpm workspaces. Turborepo provides intelligent task scheduling and caching that dramatically speeds up builds in a monorepo context.

**Task Graph.** We define tasks in `turbo.json` that describe the dependency graph between package builds. For example, the `build` task depends on `^build`, meaning that when building any package, Turborepo first builds all of its dependencies.

**Caching Strategy.** Turborepo caches build outputs based on the inputs to each task (source files, configuration, dependencies). When a developer makes a change to `/packages/shared/`, Turborepo detects that all packages depending on shared need to be rebuilt, but unrelated packages are cached. Cache artifacts are stored locally during development and in the cloud (Vercel or similar) in CI.

**Pipeline Stages.** Our CI pipeline executes in distinct stages: lint, typecheck, test, build, and deploy. Each stage must pass before the next begins. Failed stages produce artifacts that help diagnose the failure.

**Change Propagation.** When a change is made to `/packages/shared/`, the following cascade occurs automatically: tests for shared run first, then shared is built, then all dependent packages (ui, sdk, web, extension) are built and tested, then applications are built. This ensures no breaking changes slip through.

### 2.6 Versioning Strategy for Internal Packages

We use a **synchronized version** strategy where all packages in the workspace share the same version. This is defined in the root `package.json` and propagated via pnpm workspace resolution.

**Version Location.** The canonical version number lives in `/package.json` at the repository root. Every package's `package.json` references this version via the workspace protocol: `"version": "workspace:*"` or simply by omitting the version field entirely and relying on pnpm's workspace resolution.

**Release Process.** When we prepare a release, we update the version in the root `package.json` using a conventional-commits-based automated release tool (Changesets or semantic-release). This triggers version bumps in all packages simultaneously, followed by publishing to their respective registries (npm for packages, container registries for services).

**Breaking Changes.** When a breaking change is introduced that affects multiple packages, we document it in the changelog and ensure that dependent packages have appropriate peer dependency version ranges. However, because we synchronize versions, we can make breaking changes across the entire system atomically.

---

## SECTION 3: The `docs/` Folder — AI-Agent Documentation System

### 3.1 Overview and Purpose

The `docs/` folder is our most critical developer experience infrastructure. It exists to ensure that any AI agent (Claude Code, Codex, Cursor, or any future AI coding assistant) can understand any part of our system without reading thousands of lines of code. The docs are designed to be read by an AI that has no prior context about our project and needs to become productive immediately.

The documentation follows a **mirror structure**: for every significant module in the repository, there is a corresponding document in `docs/`. This creates a predictable navigation pattern that AI agents can follow. When an agent needs to work on `/services/parser/`, it knows to look at `/docs/services/parser/README.md` first.

The documentation is written for AI consumption first, human consumption second. This means the documents prioritize precision, completeness, and algorithmic clarity over narrative flow. Every statement should be verifiable against the codebase.

### 3.2 Mirror Structure Definition

The `docs/` folder mirrors the repository structure with specific mapping rules. The following defines the exact correspondence between code directories and documentation files.

**Root Documentation Files.** These files exist at the top level of `docs/` and provide overall project context.

`docs/BLUEPRINT.md` is the master architectural document—the one you are reading now. It provides the 10,000-foot view of the entire system and links to all other documentation.

`docs/ARCHITECTURE.md` provides a system-wide architecture overview with all major diagrams. While BLUEPRINT covers "what" and "why," ARCHITECTURE covers "how the pieces connect."

`docs/API.md` is the complete API reference for all backend services. It documents every endpoint, request format, response format, and error code.

`docs/AGENTS.md` contains instructions for any AI agent working in this repository. It covers conventions, workflows, and patterns.

`docs/CLAUDE.md` contains Claude-specific instructions that take advantage of Claude Code's unique capabilities and limitations.

`docs/DECISIONS.md` contains Architectural Decision Records (ADRs) that document why specific technical choices were made.

`docs/GLOSSARY.md` defines project-specific terminology to ensure consistent understanding.

**Services Documentation.** Each service in `/services/` has a dedicated documentation folder.

`/docs/services/parser/` contains all documentation for the Python parser service. This includes `README.md` (overview), `architecture.md` (detailed design), `platforms.md` (supported platforms and their quirks), and `integration.md` (how to integrate with the parser).

`/docs/services/gateway/` contains documentation for the Go API gateway. This includes `README.md` and `routes.md` (endpoint documentation).

`/docs/services/worker/` contains documentation for the background job workers. This includes `README.md` and `jobs.md` (job type definitions).

`/docs/services/ads/` contains documentation for the ad service. This includes `README.md` and `placements.md` (ad placement types).

**Applications Documentation.** Each application in `/apps/` has a dedicated documentation folder.

`/docs/apps/web/` contains documentation for the Next.js web application. This includes `README.md`, `pages.md` (page-by-page breakdown), `seo.md` (SEO strategy), and `ads.md` (ad placement strategy).

`/docs/apps/extension/` contains documentation for the Chrome extension. This includes `README.md`, `architecture.md` (Manifest V3 structure), `popup-flow.md` (user interaction flow), and `platform-detection.md` (how videos are detected on each platform).

`/docs/apps/mobile/` contains documentation for the React Native module.

`/docs/apps/mini-program/` contains documentation for the WeChat Mini Program, including `README.md` and `wechat-integration.md`.

**Packages Documentation.** Each package in `/packages/` has a documentation file.

`/docs/packages/shared/README.md` documents the shared types and utilities.

`/docs/packages/ui/README.md` documents the UI component library.

`/docs/packages/sdk/README.md` documents the client SDK.

**Guides.** The `/docs/guides/` folder contains step-by-step guides for common tasks.

`adding-platform.md` is a checklist and workflow for adding support for a new video platform.

`adding-ad-placement.md` is a checklist and workflow for adding a new ad placement.

`troubleshooting.md` documents common issues and their solutions.

### 3.3 Required Content for Each Documentation File

Every module documentation file must contain specific sections. These sections are mandatory and must be maintained in sync with the code.

**Module Purpose (Required).** Every documentation file must begin with a 2-3 paragraph description of what the module does, why it exists, and what problem it solves. This should be written as if explaining to a new team member.

**Architecture Diagram Description (Required).** Each documentation file must describe what architecture diagram should exist for this module. This is not the diagram itself—it is a description of what the diagram should contain. For example: "The diagram should show the flow from incoming HTTP request through the routing layer, middleware chain, handler functions, and response serialization. It should标注 the key components: router, middleware stack, request context, response builder."

**Data Flow Specification (Required).** Every module documentation file must describe the complete data flow: what inputs the module receives, what transformations occur, what outputs are produced, and what side effects happen. This should be written as a numbered sequence.

For example, for the parser service: "1. HTTP request arrives with URL parameter. 2. URL is validated and normalized. 3. Platform detection identifies the video source. 4. Appropriate extractor is selected based on platform. 5. Extractor makes HTTP request to video platform. 6. Response is parsed to extract video metadata and stream URLs. 7. Metadata is cached in Redis with 1-hour TTL. 8. Response is formatted and returned to client."

**Dependencies Specification (Required).** Every documentation file must list: what this module depends on (inbound dependencies), what depends on this module (outbound dependencies), and what external services or libraries it uses. For each dependency, we note why it was chosen and what version constraints apply.

**Key Decisions (Required).** Every documentation file must document the key architectural decisions made in this module. This should include the decision, the alternatives considered, and why the chosen approach was selected. This section grows over time as the module evolves.

**Integration Points (Required).** Every documentation file must document how this module connects to other parts of the system. This includes API contracts, message formats, shared state, and network protocols.

**Edge Cases and Error Handling (Required).** Every documentation file must document what can go wrong and how each failure mode is handled. This should include specific error types, error codes, and retry strategies.

**Behavior Examples (Required).** Every documentation file must provide at least three examples of expected behavior, described in natural language. These are input-output pairs that demonstrate correct behavior. For example: "When a user submits a valid YouTube video URL, the parser should return video metadata including title, duration, thumbnail URL, and available quality options within 10 seconds."

**Testing Strategy (Required).** Every documentation file must describe how this module is tested: what test frameworks are used, what categories of tests exist, and where tests are located in the repository.

**Known Limitations (Required).** Every documentation file must document known limitations, unimplemented features, and technical debt. This ensures that developers (and AI agents) understand the current boundaries of the module.

### 3.4 Special Documentation Files

Several documentation files at the root of `docs/` have specific structures that are worth defining in detail.

**docs/ARCHITECTURE.md.** This file provides a comprehensive system architecture overview. It contains high-level diagrams showing how all services and applications connect. It describes the data flow from user action (clicking download) through the entire system to completion. It documents the network topology: what services run where, what load balancers exist, what CDNs are used. It covers security architecture: authentication flows, authorization boundaries, encryption in transit and at rest.

**docs/DECISIONS.md.** This file is structured as a collection of Architectural Decision Records (ADRs). Each ADR follows a standard format: Title, Status (Proposed, Accepted, Deprecated, Superseded), Context (the problem being solved), Decision (what we chose), Consequences (positive and negative). The ADRs are organized chronologically, with the newest at the top.

**docs/GLOSSARY.md.** This file defines all project-specific terminology. It ensures that when we say "parser service" or "extractor" or "quality option," everyone understands exactly what we mean. This is particularly important for AI agents, which might otherwise make incorrect assumptions based on common usage of these terms.

### 3.5 Documentation Update Protocol

Documentation is not optional. It is a first-class deliverable alongside code. The following protocol ensures documentation stays in sync with implementation.

**The Golden Rule.** Any time code is written, modified, or deleted in a module, the corresponding documentation in `docs/` MUST be updated to reflect the change. This is not a suggestion—it is a hard requirement enforced by CI.

**What to Update.** When code changes, the developer (or AI agent) must identify which documentation sections are affected. Typically, this includes: Data Flow Specification (if the flow changed), Behavior Examples (if outputs changed), Integration Points (if interfaces changed), and Known Limitations (if bugs were fixed).

**Update Timing.** Documentation updates should happen in the same commit as the code change. The documentation is considered part of the implementation. A commit that changes behavior without updating documentation is an incomplete commit.

**Documentation Review.** Code review must include documentation review. Reviewers should verify that documentation accurately reflects the code. If documentation is missing or inaccurate, the PR cannot be merged.

**Stale Documentation Detection.** We implement automated checks to detect documentation that may be stale. This includes: checking that all documented modules still exist in the codebase, checking that documentation sections have not gone too long without updates (git blame on docs files), and running tests that verify documented behaviors match actual behaviors.

### 3.6 Context Loading Strategy for AI Agents

When an AI agent is asked to work on a specific part of the system, it should follow a specific sequence to load context. This strategy optimizes for the agent to become productive as quickly as possible.

**For Backend Services.** When working on any backend service, the agent should read in this order: First, read `docs/services/[service]/README.md` to understand the service's purpose and high-level architecture. Second, read `docs/ARCHITECTURE.md` to understand how this service fits into the broader system. Third, read `docs/API.md` to understand the external interface. Fourth, read the specific documentation files for this service (architecture.md, platforms.md, etc.) depending on the task.

**For Frontend Applications.** When working on any frontend application, the agent should read in this order: First, read `docs/apps/[app]/README.md` to understand the application's purpose. Second, read the relevant platform-specific documentation (popup-flow.md for extension, pages.md for web). Third, read `docs/packages/sdk/README.md` to understand how the frontend communicates with the backend. Fourth, read `docs/ARCHITECTURE.md` for system context.

**For Shared Packages.** When working on shared packages, the agent should read in this order: First, read `docs/packages/[package]/README.md`. Second, read `docs/ARCHITECTURE.md` to understand how this package fits in the architecture. Third, examine the package's TypeScript types directly to understand the exact shapes.

**For Cross-Module Changes.** When working on a feature that spans multiple modules, the agent should read all relevant module documentation files before beginning implementation. This ensures the agent understands all affected components.

---

## SECTION 4: `AGENTS.md` Specification

### 4.1 Purpose and Scope

`AGENTS.md` serves as the comprehensive instruction manual for any AI coding agent operating in this repository. While `CLAUDE.md` is specifically tailored for Claude Code, `AGENTS.md` provides general guidance applicable to any AI agent (Codex, Cursor, Devin, or future assistants). This file should be the first thing any AI agent reads when joining this project.

### 4.2 Repository Orientation

When an AI agent first encounters this repository, it should understand the project in approximately 60 seconds by reading this section.

**Project Type.** This is a monorepo containing a distributed video download system. The system consists of multiple frontend applications (Chrome extension, web app, mobile module, Mini Program) and multiple backend services (parser, gateway, worker, ads).

**Key Directories.** The agent should understand: `/apps/` contains all frontend applications. `/services/` contains all backend services. `/packages/` contains shared code used by multiple applications. `/docs/` contains AI-readable documentation. `/infra/` contains infrastructure as code.

**Entry Points.** For the web app: `/apps/web/src/app/page.tsx`. For the extension: `/apps/extension/src/background/index.ts`. For the parser service: `/services/parser/app/main.py`. For the gateway: `/services/gateway/cmd/server/main.go`.

### 4.3 File and Folder Conventions

This project enforces specific naming and organizational conventions that AI agents must follow.

**File Naming.** TypeScript and JavaScript files use kebab-case for components (video-player.tsx), camelCase for utilities (parseUrl.ts), and PascalCase for types and interfaces (VideoMetadata.ts). Python files use snake_case (video_parser.py). Go files use snake_case for filenames (video_parser.go). Configuration files use the convention of the tool (tsconfig.json, Dockerfile, docker-compose.yml).

**Folder Organization.** Feature folders in applications should be organized by domain, not by file type. Instead of having separate folders for components, hooks, and utils within a feature, group them together: `/features/download/` contains all code related to the download feature.

**Import Conventions.** All imports from internal packages must use the package name, not relative paths. Correct: `import { Video } from '@shared/types'`. Incorrect: `import { Video } from '../../../shared/types'`.

### 4.4 Documentation Navigation

AI agents must follow the documentation navigation strategy described in Section 3.6. The agent should never begin implementing a feature without first reading the relevant documentation files.

**Documentation-First Workflow.** The sequence is: Read docs → Understand context → Examine relevant code → Implement change → Update docs → Test.

**When Docs Are Missing.** If the agent encounters a module that lacks documentation, it should create the missing documentation before implementing any changes. This ensures the documentation system remains complete.

### 4.5 Cross-Package Change Handling

When a change affects multiple packages or services, the agent must coordinate the changes carefully.

**Change Propagation.** If a change to `/packages/shared/` is required, the agent must identify all consumers and update them accordingly. The build will fail if consumers have incompatible types. The agent should run the build after each consumer update to catch mismatches early.

**Service-to-Service Changes.** If a change to a backend service's API is required, the agent must update: the service itself, the API documentation in `/docs/API.md`, any client SDKs in `/packages/sdk/`, and any frontend consumers.

**Atomic Commits.** All related changes should be committed together. The commit message should clearly indicate that this is a cross-package change.

### 4.6 Commit Message Format

All commit messages must follow the Conventional Commits specification. This enables automated versioning and changelog generation.

**Format.** `type(scope): description`

**Types.** `feat` for new features, `fix` for bug fixes, `docs` for documentation changes, `style` for formatting changes, `refactor` for code restructuring, `test` for test additions, `chore` for maintenance tasks, `perf` for performance improvements, `ci` for CI/CD changes.

**Examples.** `feat(extension): add TikTok video detection`, `fix(parser): handle YouTube age-gated videos`, `docs: update platform support matrix`, `refactor(gateway): simplify rate limiting logic`.

**Breaking Changes.** If a commit contains breaking changes, it must include `BREAKING CHANGE:` in the body with an explanation.

### 4.7 Pull Request Description Format

Every pull request must include a specific structure to help reviewers (both human and AI) understand the change.

**Required Sections.** Title (follows commit message format), Summary (2-3 sentences describing what and why), Testing (how this was tested), Checklist (all items completed), Screenshots (if UI changes), Related Issues (any linked issues).

**Reviewer Assignment.** The PR should be assigned to the appropriate reviewer. For documentation-only changes, no reviewer may be required. For security-sensitive changes, a human security review is required.

### 4.8 Testing Requirements

All code must be tested. The following specifies what, where, and how to test.

**Unit Tests.** Every utility function, parser extractor, and business logic component must have unit tests. Tests live in a `__tests__/` folder adjacent to the source file, or in a `tests/` folder at the package root. Test files follow the naming convention `filename.test.ts` or `filename.spec.ts`.

**Integration Tests.** Every API endpoint must have integration tests that verify the complete request-response cycle. These live in `/tests/integration/` at the service root.

**E2E Tests.** Critical user flows (e.g., complete download journey) must have end-to-end tests. These live in `/tests/e2e/` at the project root.

**Test Frameworks.** JavaScript/TypeScript uses Vitest. Python uses pytest. Go uses the standard testing package.

**Coverage Requirements.** Unit test coverage should exceed 80% for business logic. Critical paths (parsing, download completion) should exceed 90%.

### 4.9 Error Handling Patterns

All errors in this project follow specific patterns that AI agents must implement.

**Error Creation.** Errors are created using centralized error factory functions, not ad-hoc error objects. In TypeScript: `new ApiError(statusCode, code, message)`. In Python: `raise APIException(status_code, code, message)`. In Go: `errors.New()` with structured error types.

**Error Propagation.** Errors are propagated up the call stack with context added at each layer. A low-level parsing error becomes a user-friendly error at the API boundary.

**Error Logging.** All errors are logged with structured logging (JSON) that includes error code, message, stack trace (in development), request ID (if applicable), and relevant context.

**Error Responses.** API errors return consistent response shapes: `{ "error": { "code": "string", "message": "string", "requestId": "string" } }`.

### 4.10 Logging Patterns

All services use structured JSON logging for machine parseability and human readability.

**Log Levels.** `debug` for detailed diagnostic information, `info` for significant events, `warn` for unexpected but handled situations, `error` for failures that require attention.

**Log Format.** Every log entry includes: timestamp (ISO 8601), level, message, service name, environment, and any relevant context fields. Example: `{ "timestamp": "2026-02-25T12:00:00Z", "level": "info", "message": "Download completed", "service": "parser", "videoId": "abc123", "duration": 5.2 }`.

**What to Log.** Log all significant events: service startup/shutdown, request received, response sent, background job started/completed/failed, cache hits/misses, external API calls.

### 4.11 Environment Variable Conventions

Environment variables follow specific naming and management conventions.

**Naming.** Use SCREAMING_SNAKE_CASE. Prefix with the service name for service-specific variables (e.g., `PARSER_TIMEOUT`, `GATEWAY_PORT`). Use common prefixes for shared variables (e.g., `REDIS_URL`, `DATABASE_URL`).

**Documentation.** Every environment variable must be documented in a `.env.example` file at the project root and in the service-specific documentation.

**Access.** In Node.js: use the `dotenv` package and access via `process.env`. In Python: use `pydantic-settings`. In Go: use `viper`.

### 4.12 Adding a New Video Platform

Supporting a new video platform is a common task. The following workflow should be followed.

**Step 1: Research.** Read `docs/services/parser/platforms.md` to understand the platform support strategy. Research the target platform: what is the video hosting mechanism, are there APIs, what are the rate limits, what is the legal risk tier.

**Step 2: Design.** Document the approach in a draft ADR if significant architectural decisions are needed. Otherwise, proceed to implementation.

**Step 3: Implement Extractor.** Create a new extractor in `/services/parser/app/core/extractors/` following the existing extractor pattern. Implement the required interface methods.

**Step 4: Add to Registry.** Register the extractor in the platform registry with the appropriate URL patterns and configuration.

**Step 5: Test.** Write unit tests for the extractor. Test manually against real videos if possible (with appropriate rate limiting).

**Step 6: Update Docs.** Update `/docs/services/parser/platforms.md` with the new platform. Update `/docs/API.md` if the API surface changed.

**Step 7: Deploy.** Deploy to staging, verify with automated tests, deploy to production.

### 4.13 Adding a New Ad Placement

Adding a new ad placement follows a specific workflow.

**Step 1: Define Placement.** Document the placement type (banner, interstitial, rewarded video), dimensions, position, and targeting criteria.

**Step 2: Update Ad Service.** Add the placement configuration to the ad service database and configuration.

**Step 3: Implement Frontend.** Add the ad component to the appropriate frontend application, following the existing component patterns.

**Step 4: Configure Networks.** Configure the placement in all integrated ad networks (Google AdSense, etc.).

**Step 5: Test.** Verify ads render correctly. Test ad blocking detection. Verify impression tracking.

**Step 6: Update Docs.** Document the new placement in `/docs/apps/[app]/ads.md`.

### 4.14 Common Pitfalls

AI agents should be aware of these common pitfalls and avoid them.

**Forgetting to Update Docs.** The most common pitfall. Always update documentation in the same commit as code changes.

**Circular Dependencies.** Be careful when importing between packages. If package A imports from package B, package B cannot import from package A.

**Environment Variable Typos.** Environment variables are easy to misspell. Use the exact names from `.env.example`.

**Not Testing Edge Cases.** Always consider: empty inputs, malformed inputs, network failures, rate limit exceeded, platform API changes.

---

## SECTION 5: `CLAUDE.md` Specification

### 5.1 Purpose and Audience

`CLAUDE.md` provides Claude Code-specific instructions that take advantage of Claude's unique capabilities and constraints. While `AGENTS.md` covers general patterns, `CLAUDE.md` provides Claude-specific guidance. This file is essential because Claude Code operates differently from other AI coding assistants.

### 5.2 Context Window Management

Claude Code has a context window limitation that requires careful management.

**Context Prioritization.** When working on a task, prioritize reading the most relevant files first. Do not attempt to read entire large files—read specific sections as needed. Use the line number parameters in the Read tool to fetch specific ranges.

**Working Set.** Keep a mental model of which files constitute your "working set"—the files you are actively reading and modifying. When context gets full, summarize what you've learned and clear the less relevant files from your working set.

**Documentation as Cache.** The documentation files in `/docs/` serve as a compressed cache of knowledge about the codebase. Always prefer reading documentation over reading code when the documentation is sufficient. Only read code when you need specifics not in the docs.

### 5.3 Task Breakdown Strategy

Claude should break large tasks into manageable steps rather than attempting everything at once.

**Iterative Implementation.** Implement one logical piece at a time. For example, when adding a new video platform: first the extractor, then the tests, then the documentation. Do not write all the code and then try to fix everything.

**Verification After Each Step.** After each logical step, verify the change works by running relevant tests or doing a manual check. This prevents cascading errors.

**Checkpoint Commits.** After each successful step, the changes are complete enough to be useful even if subsequent steps fail. Commit after each step.

### 5.4 Handling Ambiguity

When requirements are ambiguous, Claude should seek clarification rather than making assumptions.

**When to Ask.** If a requirement is ambiguous in a way that affects the implementation, ask for clarification. For example: "Should this endpoint return paginated results or all results?" is a clarifying question worth asking.

**When to Proceed.** If ambiguity is about implementation details rather than requirements, make a reasonable default choice and document it in the code. For example: "I'll use the standard REST response format since none was specified."

**Document Assumptions.** When making assumptions, document them in code comments so future maintainers understand why a particular choice was made.

### 5.5 Pre-Reading Strategy by Module

Before touching any module, Claude should read specific documentation in a specific order.

**For Backend Services.** Always read these in order: `docs/services/[service]/README.md` → `docs/ARCHITECTURE.md` → `docs/API.md` → The service's specific documentation files.

**For Frontend Apps.** Always read: `docs/apps/[app]/README.md` → The app's specific documentation → `docs/packages/sdk/README.md`.

**For Shared Packages.** Always read: `docs/packages/[package]/README.md` → The package's types directly if needed.

**For Infrastructure.** Always read: `docs/ARCHITECTURE.md` → `docs/INFRASTRUCTURE.md` (if exists) → The relevant Terraform/Kubernetes files.

### 5.6 Claude's Role Boundaries

Claude should understand what decisions it should make independently versus what requires human approval.

**Can Decide Independently.** Formatting, naming conventions, test structure, refactoring that does not change behavior, documentation updates, dependency updates that do not cause breaking changes.

**Must Consult.** API design changes, new feature requirements, security-related changes, changes that affect multiple services, breaking changes, changes that affect the build or deployment process.

**Must Not Decide.** Business model changes, pricing (if any), legal decisions, marketing strategy, hiring decisions.

### 5.7 Dependency Update Handling

When dependency updates are needed, Claude should follow a careful process.

**Patch Updates.** Update patch versions (e.g., 1.0.0 → 1.0.1) safely. Run tests to verify nothing breaks.

**Minor Updates.** Update minor versions (e.g., 1.0.0 → 1.1.0) with care. Read changelogs. Run full test suites.

**Major Updates.** Do not attempt major version updates (e.g., 1.0.0 → 2.0.0) without explicit instruction. These often require code changes and should be discussed.

**Security Updates.** Prioritize security updates. Apply them as soon as verified.

### 5.8 Test Writing Approach

Claude should write tests that are maintainable and provide value.

**Test Structure.** Follow the existing test structure in each module. If tests use a particular pattern, maintain consistency.

**What to Test.** Test behavior, not implementation. Focus on what the code does, not how it does it. Test edge cases and error conditions, not just happy paths.

**Test Maintainability.** Write tests that are easy to understand and modify. Use descriptive test names. Keep tests short and focused.

### 5.9 Secrets and Environment Variables

Claude must be extremely careful with secrets and environment variables.

**Never Commit Secrets.** Never write secrets, API keys, passwords, or tokens to the codebase. They belong in environment variables, not in code or configuration files that are committed.

**Use .env.example.** When adding a new environment variable, add it to `.env.example` with a placeholder value and document it.

**Detection.** If Claude encounters what appears to be a secret in the codebase (accidental commit), flag it immediately for removal.

### 5.10 When to Ask for Clarification

Claude should ask for clarification when requirements are unclear or when a task exceeds its capabilities.

**Clarification Needed.** Missing or contradictory requirements, unclear acceptance criteria, decisions that affect business logic, security-sensitive changes, multi-service coordination requirements.

**Proceed Without Asking.** Implementation details within clear requirements, standard patterns, obvious fixes, documentation improvements.

---

## SECTION 6: `API.md` Specification

### 6.1 API Design Philosophy

Our API follows RESTful principles with some RPC-style endpoints where appropriate. We prioritize backward compatibility, clear error semantics, and comprehensive documentation.

**REST Principles.** We use standard HTTP methods (GET, POST, PUT, DELETE) with clear semantics. Resource-oriented URLs represent entities. Standard status codes communicate outcomes. Hypermedia links provide discoverability where valuable.

**When to Use RPC.** For operations that do not map naturally to resources, we use RPC-style endpoints. For example, the video parsing operation is best modeled as an action: POST /parse is more appropriate than trying to create a "parse" resource.

**Versioning Strategy.** API versions are specified in the URL path: `/api/v1/`. We maintain backward compatibility within major versions. Breaking changes require a new major version.

### 6.2 Base URL Structure

All API endpoints follow a consistent URL structure.

**Production Base URL.** `https://api.videodownload.example.com/v1/`

**Staging Base URL.** `https://api-staging.videodownload.example.com/v1/`

**Internal Services.** Backend services communicate via internal URLs not exposed to external clients. Service discovery is handled by the infrastructure.

### 6.3 Authentication and Rate Limiting

**Authentication Methods.** We support two authentication methods: API Keys for developer clients and Session Tokens for first-party applications.

API Keys are issued to developer partners and carry rate limits based on tier. They are passed in the `X-API-Key` header.

Session Tokens are used by our own applications (web, extension). They are issued after a simple verification (or anonymously) and passed in the `Authorization` header as `Bearer <token>`.

**Rate Limiting Strategy.** Rate limits are enforced per IP address and per API key. Default limits: 100 requests per minute for free users, 1000 requests per minute for authenticated users with API keys. Parser endpoints have additional limits: 10 parsing requests per minute per IP.

Rate limit headers are included in every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### 6.4 Video Parsing Endpoints

These endpoints handle video URL parsing and metadata retrieval.

**POST /parse — Parse Video URL**

Purpose: Submit a video URL for parsing. Returns metadata and available quality options.

Request: `POST /api/v1/parse` with body `{ "url": "string", "options": { "includeFormats": boolean } }`

Response: `{ "id": "string", "status": "pending|processing|completed|failed", "platform": "string", "title": "string", "thumbnail": "string", "duration": number, "formats": [ { "formatId": "string", "quality": "string", "ext": "string", "filesize": number, "url": "string" } ] }`

Status Codes: 202 (accepted), 400 (invalid URL), 429 (rate limited), 500 (server error).

**GET /parse/{id} — Get Parse Result**

Purpose: Retrieve the result of a previously submitted parse request.

Response: Same as POST response with status field indicating current state.

**POST /download — Initiate Download**

Purpose: Request a download URL for a specific format.

Request: `{ "formatId": "string", "url": "string" }`

Response: `{ "downloadId": "string", "status": "pending|preparing|ready|failed", "downloadUrl": "string", "expiresAt": "timestamp" }`

This endpoint handles the download URL generation, which may involve format conversion or stream merging.

### 6.5 Platform Support Endpoints

**GET /platforms — List Supported Platforms**

Purpose: Get a list of all supported video platforms with their status.

Response: `{ "platforms": [ { "id": "string", "name": "string", "supported": boolean, "features": [ "video", "audio", "playlist" ], "rateLimit": number, "lastChecked": "timestamp" } ] }`

**GET /platforms/{id}/status — Check Platform Status**

Purpose: Check if a specific platform is currently available and responding.

Response: `{ "platform": "string", "status": "operational|degraded|down", "latency": number, "lastSuccess": "timestamp", "message": "string" }`

### 6.6 Ad Serving Endpoints

**GET /ads/config — Get Ad Configuration**

Purpose: Retrieve ad configuration for the current user/context.

Request Query: `placementIds=string,userId=string,country=string`

Response: `{ "placements": [ { "placementId": "string", "type": "banner|interstitial|rewarded", "adUnitId": "string", "config": object } ] }`

**POST /ads/impression — Track Impression**

Purpose: Record when an ad is displayed.

Request: `{ "adUnitId": "string", "placementId": "string", "impressionId": "string", "timestamp": "number", "country": "string" }`

Response: `{ "success": boolean }`

**POST /ads/click — Track Click**

Purpose: Record when an ad is clicked.

Request: `{ "adUnitId": "string", "placementId": "string", "impressionId": "string", "clickId": "string", "timestamp": "number" }`

Response: `{ "success": boolean }`

### 6.7 Analytics Endpoints

**GET /analytics/usage — Get Usage Statistics**

Purpose: Retrieve usage statistics for administrative purposes.

Query Parameters: `startDate=YYYY-MM-DD,endDate=YYYY-MM-DD,granularity=day|week|month`

Response: `{ "period": { "start": "date", "end": "date" }, "metrics": { "totalDownloads": number, "successfulDownloads": number, "successRate": number, "averageLatency": number, "topPlatforms": [ { "platform": "string", "count": number } ] } }`

**GET /analytics/popular — Get Popular Videos**

Purpose: Retrieve trending or popular videos across the platform.

Response: `{ "videos": [ { "url": "string", "title": "string", "platform": "string", "downloadCount": number, "trendScore": number } ] }`

### 6.8 Health and Monitoring Endpoints

**GET /health — Basic Health Check**

Purpose: Simple liveness probe.

Response: `{ "status": "healthy", "timestamp": "ISO8601" }`

**GET /health/ready — Readiness Check**

Purpose: Detailed readiness check including dependencies.

Response: `{ "status": "ready|not_ready", "checks": { "database": "ok|error", "redis": "ok|error", "parser": "ok|error" }, "errors": [ "string" ] }`

**GET /metrics — Prometheus Metrics**

Purpose: Prometheus-compatible metrics endpoint for monitoring.

Response: Prometheus text format with metrics for request latency, error rates, queue depths, and custom application metrics.

### 6.9 WebSocket for Real-Time Progress

For long-running operations (especially large video downloads), we provide a WebSocket endpoint for real-time progress updates.

**WebSocket Connection.** `wss://api.videodownload.example.com/v1/ws`

**Subscription.** Client sends: `{ "action": "subscribe", "jobId": "string" }`

**Progress Updates.** Server sends: `{ "type": "progress", "jobId": "string", "percent": number, "speed": number, "eta": number }`

**Completion.** Server sends: `{ "type": "complete", "jobId": "string", "downloadUrl": "string" }`

**Errors.** Server sends: `{ "type": "error", "jobId": "string", "code": "string", "message": "string" }`

### 6.10 SDK Usage Patterns

The client SDK (`/packages/sdk/`) wraps these endpoints with type-safe methods.

**Initialization.** `const client = new VideoDownloadClient({ apiKey: 'key' })`

**Parse Video.** `const result = await client.videos.parse('https://youtube.com/watch?v=...')`

**Get Download URL.** `const download = await client.videos.getDownload(result.formats[0].formatId, result.id)`

**Track Ad Impression.** `await client.ads.trackImpression({ adUnitId: '...', placementId: '...' })`

---

## SECTION 7: Backend Architecture — Deep Dive

### 7.1 Parser Service (Python)

The Parser Service is the core engine of our system. It wraps the yt-dlp library and provides a REST API for video parsing across all supported platforms.

**Technology Choice Rationale.** We chose Python for the parser service because the yt-dlp ecosystem is the most mature and actively maintained solution for video downloading. yt-dlp has over 100,000 stars on GitHub, updates multiple times per week to handle platform changes, and supports more websites than any other open-source project. Wrapping yt-dlp in Python allows us to leverage this massive community effort while exposing a clean API to our services.

**Service Architecture.** The parser service is built with FastAPI, chosen for its async capabilities, automatic OpenAPI documentation, and Pydantic integration for request/response validation. The service runs in Docker containers orchestrated by Kubernetes.

**Core Components.** The service contains several logical components that work together to parse videos.

The URL Normalizer takes raw user input and transforms it into a canonical form. It handles URL parameters, removes tracking elements, resolves short URLs, and identifies the platform. This component is critical because users paste many variations of the same URL.

The Platform Detector analyzes the normalized URL and identifies which extractor should handle it. It maintains a registry of URL patterns mapped to extractors. This registry is consulted before any parsing attempt.

The Extractor is the core component that interface with yt-dlp. Each extractor wraps yt-dlp's functionality with our specific configuration. The extractor handles authentication tokens, rate limiting, error handling, and response formatting. Extractors are designed to be pluggable—adding a new platform means creating a new extractor class.

The Cache Layer stores parsing results in Redis to avoid re-parsing the same videos repeatedly. Cache entries include video metadata, available formats, and thumbnail URLs. TTL varies by platform: 1 hour for frequently changing content, 24 hours for stable content.

The Format Converter handles cases where yt-dlp returns separate video and audio streams that need merging. It uses FFmpeg to combine streams into a single container. This is discussed in detail in the FFmpeg Integration section.

### 7.2 Supported Platforms

We support a comprehensive list of video platforms. Each platform presents unique challenges that our architecture addresses.

**YouTube.** Support includes standard videos, Shorts, live streams, and playlists. Challenges include: aggressive bot detection requiring proxy rotation, age-restricted videos requiring account integration, region-locked content, and frequent API changes. Our YouTube extractor implements multiple fallback strategies: direct extraction, proxy-based extraction, and cookie-based extraction for authenticated requests.

**TikTok.** Support includes videos with and without watermarks. The platform's API changes frequently, and the mobile and web endpoints differ. Our TikTok extractor supports both endpoints and chooses dynamically based on availability. Watermark removal is implemented through URL manipulation and metadata parsing.

**Instagram.** Support includes Reels, Stories, Posts, and Highlights. Instagram has strict rate limiting and often requires authentication. Our extractor implements exponential backoff and supports optional Instagram account integration for higher rate limits.

**Twitter/X.** Support includes videos, Spaces (audio), and GIFs. Twitter's API changes frequently and embeds are sometimes served from different CDNs. Our extractor handles all these variants.

**Bilibili.** Support includes videos, anime, and live streams from the Chinese platform. Bilibili has a complex anti-bot system. Our extractor uses a dedicated set of proxies and implements human-like behavior patterns.

**Additional Platforms.** We support Vimeo, Facebook, Reddit, Pinterest, Twitch clips, Douyin (Chinese TikTok), Xiaohongshu (RED), Weibo Videos, and many others. Each platform has a dedicated extractor with platform-specific configurations.

### 7.3 Quality Selection Logic

When a video is parsed, we return all available quality options to the user. The quality selection follows specific logic.

**Quality Tiers.** We categorize quality into tiers: 4K (2160p), 1080p, 720p, 480p, 360p, and Audio Only. Not all platforms offer all tiers—the available tiers depend on the source video.

**Format Types.** Each quality option has a format type: video+audio combined (best quality), video-only, audio-only, or adaptive streaming. We prioritize combined formats because they provide the best user experience.

**Default Selection.** When the user does not specify a preference, we default to the highest quality combined format available, with a cap at 1080p for free users (to conserve bandwidth and encourage premium tier adoption in the future).

### 7.4 Audio Extraction Flow

Audio extraction is a common use case for music, podcasts, and other audio content.

**Request Flow.** User requests "audio only" → System identifies audio streams → System selects highest quality audio format → System returns download URL for audio stream.

**Supported Formats.** Audio is returned in M4A (AAC) format by default, with MP3 available for compatibility. We prefer M4A because it offers better quality at the same bitrate.

**Conversion Pipeline.** If only video-only streams are available (common on some platforms), the system queues the video for audio extraction using FFmpeg to separate the audio track.

### 7.5 Format Conversion Pipeline

The format conversion pipeline handles stream merging and format transcoding.

**Stream Merging.** When yt-dlp returns separate video and audio streams (common for high-quality YouTube content), we need to merge them. The conversion pipeline receives the two stream URLs, downloads both, merges them using FFmpeg, and uploads the result to our storage or returns direct FFmpeg piping.

**Container Selection.** We use MP4 as the default container format for merged video due to broad compatibility. For audio-only extraction, we use M4A or MP3.

**Quality Preservation.** The conversion pipeline is designed to avoid re-encoding when possible (stream copy) to preserve quality and reduce processing time. Re-encoding is only triggered when container format conversion is required.

### 7.6 FFmpeg Integration Strategy

FFmpeg is a critical dependency for video processing. We use it for stream merging, format conversion, thumbnail extraction, and video metadata reading.

**FFmpeg Installation.** We use the official static builds of FFmpeg rather than system packages. This ensures consistent behavior across environments and simplifies deployment. Static builds are downloaded at Docker image build time.

**Resource Management.** FFmpeg operations are resource-intensive. We implement per-operation timeouts (10 minutes for standard videos, 30 minutes for long videos). We limit concurrent FFmpeg operations based on available system resources.

**Command Construction.** FFmpeg commands are constructed programmatically with careful attention to security. We use the `-i` flag for input, avoid shell command construction that could lead to injection, and validate all input parameters.

### 7.7 Caching Strategy

Caching is essential for performance and reducing platform load.

**What to Cache.** We cache: parsed video metadata (title, duration, thumbnail), available format lists, and download URLs (where allowed by platform).

**Cache Keys.** Cache keys are structured as `{platform}:{url_hash}:{options}`. The URL is hashed to create a consistent key regardless of URL normalization variations.

**TTL by Platform.** YouTube: 1 hour. TikTok: 30 minutes (content changes frequently). Instagram: 1 hour. Bilibili: 2 hours (stable content). Other platforms: 1 hour default.

**Cache Invalidation.** Automatic via TTL. Manual invalidation available for emergency updates when platform structures change.

### 7.8 Error Taxonomy

The parser service produces specific error types that are handled appropriately.

**Platform Errors.** Platform unreachable, platform rate limited, platform authentication failed, platform content not found. These are typically transient and retryable.

**Parsing Errors.** Unsupported URL, parsing failed, no formats available, age restriction, geo-blocking. These indicate the video cannot be downloaded.

**System Errors.** Redis unavailable, FFmpeg failure, internal timeout. These trigger alerts and may require operator intervention.

**Error Responses.** All errors are returned with a standard format: `{ "error": { "code": "string", "message": "string", "details": object, "retryable": boolean } }`.

### 7.9 API Gateway (Go)

The API Gateway is the single entry point for all client requests. It handles routing, authentication, rate limiting, and request validation.

**Technology Choice.** We chose Go for the gateway because of its excellent HTTP performance, low memory footprint, and rich standard library. Go's concurrency model (goroutines) makes it ideal for handling high-throughput API traffic.

**Routing Logic.** The gateway uses a custom router built on the standard library's `net/http`. Routes are defined in a declarative configuration that maps URL patterns to backend services. The router supports path parameters, query parameters, and method matching.

**Authentication.** The gateway validates API keys and session tokens. Valid requests are forwarded to backend services with authentication context included in headers.

**Rate Limiting.** Rate limiting is implemented in the gateway using a token bucket algorithm. Redis stores distributed rate limit counters. The gateway enforces limits before requests reach backend services.

**Request Validation.** The gateway validates request syntax and basic semantics (required fields present, values in expected ranges). Invalid requests are rejected immediately without reaching backend services.

**Response Formatting.** All responses from backend services are wrapped in a consistent envelope: `{ "data": object, "meta": { "requestId": "string", "timestamp": "ISO8601" } }`.

### 7.10 Worker Service

The Worker Service handles background jobs that should not block the main request-response cycle.

**Job Queue Architecture.** We use Redis with the BullMQ library for job queuing. Jobs are persisted in Redis and processed by worker processes. BullMQ provides reliability guarantees, automatic retries, and priority queues.

**Job Types.** The worker handles several job types.

Conversion Jobs process video format conversions that take significant time. These are queued when a user requests a format that requires merging.

Cleanup Jobs remove temporary files and cached data that exceeds retention periods.

Notification Jobs send emails, push notifications, or webhook callbacks when long-running jobs complete.

Analytics Jobs aggregate usage data and generate reports.

**Worker Scaling.** Workers scale horizontally based on queue depth. When queue depth exceeds a threshold, additional workers are spawned. When queue is empty, workers scale down.

**Job Priority.** We implement a priority system: User-initiated jobs have normal priority, System maintenance jobs have low priority. Within user jobs, smaller files are prioritized over larger ones.

### 7.11 Ad Service

The Ad Service manages advertising across all platforms.

**Ad Placement Management.** The service maintains a database of ad placements: their positions, sizes, targeting criteria, and rotation rules. Each placement has an ID that references ad network configurations.

**Impression Tracking.** Every ad display is tracked with timestamp, placement, user context, and ad network response. This data feeds revenue calculations.

**Click Tracking.** Click events are tracked separately and attributed to impressions for conversion analysis.

**Ad Blocking Detection.** We detect ad blockers to inform our ad strategy. Users with ad blockers may see alternative monetization approaches.

### 7.12 Open-Source Project Research

We have researched specific open-source projects for each backend component.

**yt-dlp (Video Parsing).** GitHub: ytdl-org/yt-dlp. Stars: 120,000+. License: Unlicense. Last Updated: Within 1 week. This is our core parsing engine. It supports over 1700 websites and is actively maintained by a large community. No alternatives come close to its coverage and reliability.

**FastAPI (Web Framework).** GitHub: tiangolo/fastapi. Stars: 70,000+. License: MIT. Last Updated: Within 1 week. FastAPI provides async capabilities, automatic documentation, and excellent performance. It integrates well with Pydantic for validation.

**Pydantic (Data Validation).** GitHub: pydantic/pydantic. Stars: 15,000+. License: MIT. Last Updated: Within 1 week. Pydantic provides runtime validation and generates TypeScript types.

**FFmpeg (Video Processing).** ffmpeg.org. This is the standard for video processing. We use static builds. No viable alternative exists for our use case.

**Redis (Cache and Queue).** redis.io. Redis is our primary caching and queue backend. It provides the data structures needed for rate limiting and job queues.

**BullMQ (Job Queue).** GitHub: taskforcesh/bullmq. Stars: 4,000+. License: MIT. Last Updated: Within 1 month. BullMQ provides a robust job queue on top of Redis.

---

## SECTION 8: Chrome Extension — Deep Dive

### 8.1 Overview and Priority

The Chrome Extension is our primary product—the main interface through which most users interact with our service. Its success determines our trajectory. We treat it with the highest priority in development, testing, and reliability.

### 8.2 Manifest V3 Architecture

The extension uses Manifest V3, Google's latest extension platform. This version introduces significant architectural changes from V2.

**Service Worker.** The background script runs as a service worker instead of a persistent background page. Service workers can be terminated by the browser at any time, requiring us to persist state in chrome.storage and re-initialize on each activation. This affects how we handle long-running operations and message passing.

**Content Scripts.** Content scripts run in the context of web pages, not the extension. They can access the DOM and communicate with the service worker via message passing. We use content scripts to detect video content on pages.

**Popup.** The popup is a separate HTML page that opens when users click the extension icon. It has access to extension APIs but cannot run continuously. The popup must initialize state on each open.

**Options Page.** A dedicated settings page allows users to configure preferences: default quality, download location, notification preferences.

### 8.3 Complete User Flow

The user flow from visiting a supported site to completing a download is as follows.

**Step 1: Page Load.** User navigates to a supported website (e.g., youtube.com/watch?v=xxx). The content script is injected automatically based on manifest match patterns.

**Step 2: Video Detection.** The content script runs on page load. It examines the DOM for video elements, looks for video data in JavaScript variables, and monitors network requests for video URLs. When a video is detected, the script sends a message to the service worker with video metadata.

**Step 3: Badge Update.** The service worker receives the detection message. It updates the extension icon badge to show a visual indicator that a video is available. The badge might show a checkmark or the number of detected videos.

**Step 4: User Opens Popup.** User clicks the extension icon. The popup opens (ideally in under 200ms). The popup retrieves current video information from the service worker.

**Step 5: Display Options.** The popup displays video information: title, thumbnail, duration. It shows available quality options in a dropdown. User selects their preferred quality.

**Step 6: Initiate Download.** User clicks the "Download" button. The popup sends a download request to the service worker.

**Step 7: API Request.** The service worker calls the backend API to initiate the download. It passes the video URL and selected quality. The API returns a download URL.

**Step 8: Download Execution.** The service worker uses the Chrome Downloads API to initiate the download. It creates a download job that the browser manages.

**Step 9: Progress Tracking.** The service worker monitors download progress via the Downloads API and sends progress updates to the popup. The popup displays a progress bar.

**Step 10: Completion.** When the download completes, the service worker shows a Chrome notification to the user. The popup updates to show "Download Complete."

### 8.4 Error Handling at Each Step

Every step in the user flow can fail. We handle each failure gracefully.

**Video Detection Failure.** If detection fails (page loaded too quickly, unusual page structure), the extension shows a "Video not detected" message in the popup. Users can manually enter the video URL.

**API Request Failure.** If the API is unavailable, we show a clear error message with retry option. We implement exponential backoff on retry.

**Download URL Expiration.** Download URLs expire after a period. If a URL expires before download starts, we automatically re-request a fresh URL.

**Network Interruption.** If the network fails during download, Chrome's Downloads API handles retry. If it fails repeatedly, we notify the user.

### 8.5 Content Script Architecture

Content scripts are the eyes and ears of our extension on web pages.

**Injection Strategy.** We use manifest declarative dynamic injection: content scripts are registered to run on specific URL patterns, but can also be injected programmatically when needed. This allows us to detect videos on pages that may not match our initial patterns.

**Platform Detection.** Each supported platform requires different detection strategies. For YouTube, we look for the player and video data in JavaScript objects. For TikTok, we parse API responses intercepted via the Fetch API. For each platform, we have a dedicated detector module.

**Message Protocol.** Content scripts communicate with the service worker via typed messages. Messages include: `VIDEO_DETECTED`, `VIDEO_REMOVED`, `GET_VIDEO_INFO`, `START_DOWNLOAD`.

### 8.6 Service Worker Lifecycle

Manifest V3 service workers have a lifecycle that we must accommodate.

**Initialization.** On each service worker start, we restore state from chrome.storage. We initialize the API client, load user preferences, and set up message listeners.

**Message Handling.** All significant state changes are persisted immediately. When receiving messages, we process them using current state without assuming prior context.

**Termination Handling.** The service worker can be terminated during idle periods. We do not rely on in-memory state persisting. All necessary data is stored in chrome.storage.

### 8.7 Storage Strategy

We use chrome.storage for persistent data and in-memory storage for ephemeral state.

**chrome.storage.local.** Stores user preferences (default quality, download path), known video metadata cache, and extension state. This persists across browser restarts.

**chrome.storage.session.** Stores temporary state for the current browsing session. This clears when the browser closes.

**chrome.storage.sync.** Stores user preferences that should sync across their Chrome profile (if they sign in). This is slower than local storage.

### 8.8 Permissions Model

We request only the minimum permissions necessary for functionality.

**activeTab.** Allows accessing the active tab when the user invokes the extension. Required for video detection.

**scripting.** Allows executing content scripts. Required for video detection.

**storage.** Allows storing user preferences. Required for persistence.

**notifications.** Allows showing download completion notifications. Optional.

**downloads.** Allows initiating downloads. Required for core functionality.

**We do NOT request:** full history access, all URLs access (we only access sites we declare in manifest), or browsing data access. These permissions would trigger additional review and are not necessary.

### 8.9 Chrome Web Store Compliance

Chrome Web Store has strict policies. We design with compliance in mind.

**Single Purpose.** The extension has a single clearly stated purpose: video downloading. We do not include unrelated features.

**No Obfuscation.** All code is readable JavaScript/TypeScript. We do not use code obfuscation or packing.

**Privacy Policy.** We maintain a privacy policy that accurately describes what data we collect (minimal) and how we use it.

**Review Process.** We expect initial review to take 1-2 weeks. Updates may take 1-3 days. We avoid features that commonly trigger rejections: cryptocurrency mining, aggressive advertising, data collection beyond what's disclosed.

### 8.10 Ad Placement in Extension

Monetizing the extension requires careful adherence to Chrome policies.

**Allowed Ad Placements.** We can display ads in the popup after a download completes, as a banner above the download options, or in the options page. We cannot inject ads into web pages or show interstitial ads that block functionality.

**Ad Loading.** Ads are loaded via our ad service, not directly from ad networks. This allows us to control what ads are shown and track performance.

**Ad Blocking Considerations.** We detect if the user has an ad blocker installed. If they do, we may show alternative messaging or disable certain features.

### 8.11 Update Mechanism

We use Chrome's built-in extension update mechanism.

**Manifest Version.** We use semantic versioning in the manifest: `version: "1.0.0"`.

**Update Checking.** Chrome checks for updates automatically every few hours. We can force an update check via the manifest `update_url`.

**Breaking Changes.** When we introduce breaking changes (new required permissions, new API usage), we implement migration logic that runs on extension update.

### 8.12 Video Detection Strategies by Platform

Each platform requires a unique detection approach.

**YouTube.** Detect the `player` JavaScript object, watch for `VIDEO_DATA` updates, and parse `ytd-video-primary-info-renderer` DOM elements. Monitor network requests for `videoplayback` endpoints.

**TikTok.** Intercept fetch requests to the TikTok API (`/api/item/detail/`). Parse the JSON response for video metadata.

**Instagram.** Detect the `xdt_api` responses that contain media information. Watch for changes to the main feed.

**Twitter/X.** Parse the `tweet` and `video` JSON data embedded in the page.

**General Approach.** For unknown platforms, we fall back to scanning the DOM for `<video>` elements and checking for known video URL patterns in network requests.

### 8.13 Performance Budget

We maintain strict performance budgets to ensure a responsive user experience.

**Popup Open Time.** Target: under 200ms p95. Achieved by lazy-loading non-critical components and caching video metadata.

**Detection Time.** Target: under 500ms after page load. Achieved by running detection immediately on content script injection.

**Memory Usage.** Target: under 50MB. Achieved by aggressive cleanup of cached data.

---

## SECTION 9: Next.js Web Application — Deep Dive

### 9.1 App Router Architecture

The web application uses Next.js 14+ with the App Router. This architecture provides server-side rendering, static generation, and API routes in a unified framework.

**Route Structure.** The `app/` directory contains all routes. We use route groups (folders in parentheses) to organize pages without affecting URLs: `(marketing)` for landing pages, `(download)` for the core tool.

**Server Components.** Most components are server components by default. This provides better performance and SEO. We use client components only where interactivity is needed (forms, buttons, state).

**Data Fetching.** Server components fetch data directly from our backend API. Client components use React Query or SWR for server state management.

### 9.2 Page-by-Page Breakdown

**Landing Page (page.tsx).** The home page serves as the primary acquisition channel. It contains: hero section with the main value proposition, feature highlights showing supported platforms, social proof (user counts, testimonials), call-to-action buttons linking to the download tool, and SEO content for primary keywords.

**Download Tool Page (download/page.tsx).** This is the core functionality. The user pastes a URL, selects options, and gets a download link. Components: URL input field with validation, platform auto-detection indicator, quality selector, format selector, download button, progress indicator, and ad placements.

**Platform Pages (download/[platform]/page.tsx).** Static pages optimized for each platform. Example: "Download YouTube Videos" page with platform-specific instructions, FAQ, and SEO content. These are statically generated for performance and SEO.

**Blog (/blog/).** SEO content hub with articles about video downloading tips, platform comparisons, and how-to guides. Statically generated from CMS or local markdown files.

**Legal Pages (/legal/).** Terms of Service, Privacy Policy, DMCA Policy. These are statically generated and must be kept up to date.

**FAQ (/faq/).** Help center with common questions. Content is structured for both human readers and SEO.

### 9.3 SEO Strategy

SEO is critical for organic user acquisition.

**Keyword Targeting.** Primary keywords: "download YouTube videos," "free video downloader," "TikTok downloader." Long-tail keywords: "how to download Instagram reels," "save videos offline."

**Dynamic Meta Tags.** Every page has unique meta tags generated from page content. Title, description, and Open Graph tags are dynamically set.

**Structured Data.** We implement JSON-LD schemas for articles (blog), FAQ (help center), and software application (download tool). This helps search engines understand content type.

**Sitemap.** We generate a dynamic sitemap that includes all static and dynamic pages. It's updated automatically when content changes.

**Core Web Vitals.** We optimize for LCP (under 2.5s), FID (under 100ms), and CLS (under 0.1). Ad placements are lazy-loaded to prevent CLS.

### 9.4 Ad Placement Strategy

The web app is our primary advertising revenue source.

**Homepage.** Header banner ad, inline ads between features, footer banner. Medium rectangle (300x250) and leaderboard (728x90) formats.

**Download Page.** Top banner, bottom banner, sidebar. Interstitial after first download is complete.

**Blog.** In-article ads every 400 words, between articles, sidebar. Various sizes.

**Ad Loading.** Ads load after main content is interactive to prevent blocking. We use Intersection Observer to load ads only when they approach the viewport.

### 9.5 Internationalization

We support multiple languages with English and Chinese as initial targets.

**Implementation.** Next.js i18n with next-intl or similar library. Language files in JSON format in `/public/locales/`.

**Routing.** Language prefix in URL: `/en/`, `/zh/`. Default to English.

**Content.** Marketing content is translated. Blog content may differ by region (some content only relevant in certain markets).

### 9.6 Analytics Integration

We integrate analytics to understand user behavior and optimize the product.

**Google Analytics 4.** Primary analytics tool. Tracks page views, events, conversions, and user journeys.

**Ad Conversion Tracking.** We track ad click-through rates and conversion events for revenue optimization.

**Custom Events.** Download completion, extension install, API errors—these are tracked as custom events.

---

## SECTION 10: React Native Module

### 10.1 Architecture Overview

The React Native module is designed to be embedded in third-party applications. It provides a complete video download UI and functionality as a drop-in component.

**Module Structure.** The module exposes a React Native component, `VideoDownloader`, that host apps can embed. It also exposes a native module for low-level file system access.

**No UI Framework Dependencies.** To minimize integration friction, the module does not depend on any specific UI library. It includes its own basic UI components styled with React Native's StyleSheet.

### 10.2 API Surface

The module exposes a simple API for host apps.

**Component Props.** `VideoDownloader` accepts: `initialUrl` (optional), `onDownloadComplete` callback, `onError` callback, `preferredQuality` (default: '1080p'), `theme` object for customization.

**Native Methods.** The native module exposes: `saveToGallery(filePath)` for saving downloads to the device gallery, `getDownloadPath()` for getting the app's download directory, and `requestPermissions()` for storage permissions.

### 10.3 Platform Differences

iOS and Android have different capabilities and restrictions.

**iOS.** Uses the Photos library for saving videos. Background downloads are limited. Uses native Share sheet.

**Android.** Uses MediaStore API for saving to gallery. Supports background downloads with WorkManager. Scoped storage requires different handling.

---

## SECTION 11: WeChat Mini Program

### 11.1 Framework Choice

We recommend **Taro** for the WeChat Mini Program. Taro provides React-like development experience with compilation to multiple platforms including WeChat Mini Program, H5, and React Native. This allows code sharing between our web app and Mini Program.

**Alternative Considered.** uni-app was considered but Taro's React integration aligns better with our existing codebase.

### 11.2 WeChat-Specific Considerations

WeChat Mini Programs have unique constraints.

**API Access.** WeChat provides limited APIs compared to web. We use `wx.request` for networking, `wx.downloadFile` for downloads, and `wx.saveVideoToPhotosAlbum` for saving to album.

**Navigation.** WeChat has its own navigation system. Pages are defined in `app.json` with routes.

**Ad Integration.** WeChat provides native ad components: `wx.createBannerAd`, `wx.createRewardedVideoAd`. We integrate these directly.

### 11.3 Content Moderation

Chinese internet regulations require content moderation.

**Policy Compliance.** We ensure no prohibited content is accessible. We implement content filtering on any user-generated content features.

**Data Storage.** User data must be stored on servers within mainland China if the app is deployed in China. We use Chinese cloud infrastructure for this.

---

## SECTION 12: Infrastructure & DevOps

### 12.1 Hosting Strategy

We use a multi-cloud strategy optimized for cost and performance.

**Frontend Hosting.** Vercel for the Next.js web application. Vercel provides excellent performance, automatic SSL, and zero-config deployments. Global CDN ensures fast page loads.

**Chrome Extension.** Chrome Web Store distribution. We maintain the extension package but don't control hosting.

**Backend Hosting.** Google Cloud Platform for backend services. GKE (Google Kubernetes Engine) provides managed Kubernetes. Cloud Run provides serverless containers for some workloads.

**Chinese Infrastructure.** For the WeChat Mini Program and Chinese users, we use Alibaba Cloud (Aliyun) with servers in mainland China.

### 12.2 Container Orchestration

**Development.** Docker Compose for local development. All services can be run locally with a single command. This ensures parity between dev and prod.

**Production.** Kubernetes on GKE. We use Kustomize for configuration management. Each service is deployed as a Deployment with HPA (Horizontal Pod Autoscaler) for scaling.

**Serverless.** Cloud Run for the parser service during low traffic. Cold starts are acceptable for parser requests.

### 12.3 CI/CD Pipeline

GitHub Actions powers our CI/CD.

**CI Workflow.** On every push: lint, typecheck, unit tests, build all packages, build all Docker images. Parallel jobs where possible.

**Deploy Workflow.** On merge to main: deploy to staging, run integration tests, deploy to production. Rollback is automatic on failure detection.

**Extension Deploy.** On version tag: build extension, upload to Chrome Web Store via CLI.

### 12.4 Environment Strategy

**Development.** Local development with Docker Compose. All config via `.env` files.

**Staging.** Full production-like environment on GKE. Uses real external services (Redis Cloud, etc.) but with smaller instances.

**Production.** Full-scale production on GKE. All resources are production-grade with redundancy.

### 12.5 Database and Storage

**Primary Database.** PostgreSQL on Cloud SQL. Stores user accounts, download history, analytics, and ad configurations.

**Cache and Queue.** Redis on Cloud Memorystore. Used for caching, rate limiting, and job queuing.

**File Storage.** Google Cloud Storage for temporary files, parsed thumbnails, and conversion outputs. TTL-based lifecycle policies delete old files.

### 12.6 Monitoring and Alerting

**Metrics.** Prometheus with Grafana dashboards. Key metrics: request rate, error rate, latency percentiles, queue depth, resource utilization.

**Logging.** Google Cloud Logging with structured JSON logs. Log-based alerts for error conditions.

**Tracing.** OpenTelemetry for distributed tracing. Helps diagnose issues across service boundaries.

**Alerting.** PagerDuty integration for on-call. Alerts for: high error rates, latency degradation, service downtime, unusual traffic patterns.

### 12.7 Cost Optimization

**Resource Sizing.** Right-size all resources. Monitor actual usage and adjust.

**Spot Instances.** Use spot/preemptible instances for batch workers where possible.

**Caching.** Aggressive caching reduces API calls and parsing load.

**Auto-scaling.** Scale to zero during off-peak for cost savings.

---

## SECTION 13: Data Model & State Management

### 13.1 Core Entities

**User.** Represents an anonymous or identified user. Properties: id, createdAt, lastSeenAt, country (optional), platform (extension/web/mobile). Stored in PostgreSQL.

**Download Request.** Represents a download initiated by a user. Properties: id, userId, url, platform, status, quality, format, createdAt, completedAt, fileSize, duration. Stored in PostgreSQL.

**Video Metadata.** Cached video information. Properties: platform, externalId, title, thumbnailUrl, duration, availableFormats, cachedAt. Stored in Redis with TTL.

**Platform.** Supported platform configuration. Properties: id, name, urlPatterns, rateLimit, status, features. Stored in PostgreSQL.

**Ad Impression.** Represents an ad display. Properties: id, placementId, userId, adUnitId, timestamp, country, blocked. Stored in PostgreSQL.

**Job.** Background job tracking. Properties: id, type, status, payload, progress, result, createdAt, completedAt, attempts. Stored in Redis (BullMQ).

### 13.2 State Management by Platform

**Extension.** Uses chrome.storage for persistence and React context for UI state. Download progress is tracked in service worker and synced to popup via messages.

**Web App.** Uses React Query for server state (API data). Uses React Context for UI state (theme, language). Uses local storage for preferences.

**Mobile.** Uses React Query or similar for server state. Uses React Context for local state.

**Mini Program.** Uses local page data for UI state. Uses WeChat's storage for persistence.

### 13.3 Cross-Platform State

Minimal state is shared across platforms. Each platform maintains its own user identity. Analytics events are aggregated but individual user journeys are not tracked across platforms.

---

## SECTION 14: Security & Compliance

### 14.1 Transport Security

**HTTPS Everywhere.** All traffic uses TLS 1.2+. HTTP redirects to HTTPS. HSTS headers enforce secure connections.

**Certificate Management.** Let's Encrypt certificates with automatic renewal via Certbot or ACM.

### 14.2 API Security

**Input Validation.** All inputs are validated at the API gateway. Reject malformed requests before they reach services.

**Injection Prevention.** Parameterized queries prevent SQL injection. Output encoding prevents XSS.

**Rate Limiting.** Per-IP and per-API-key rate limits prevent abuse. Higher limits for authenticated users.

### 14.3 Extension Security

**Content Security Policy.** Strict CSP in manifest. No eval, no inline scripts.

**Permission Minimization.** Request only necessary permissions. Review each permission's justification.

**Data Handling.** Minimize data collection. Do not track browsing history. Clear data on user request.

### 14.4 Privacy and Compliance

**GDPR (Europe).** Support data export, data deletion, consent management. Data processing agreements with all vendors.

**CCPA (California).** Similar to GDPR with California-specific requirements.

**Children's Privacy.** We do not knowingly collect data from children under 13. Age gates on appropriate content.

### 14.5 Anti-Abuse

**Bot Detection.** Implement CAPTCHAs for suspicious activity. Detect and block automated scraping.

**Fraud Prevention.** Monitor for unusual patterns: excessive downloads from single IP, coordinated download activity. Implement account freezes for abuse.

---

## SECTION 15: Testing Strategy

### 15.1 Testing Philosophy

We test to gain confidence that our system works correctly and to prevent regressions. Tests are first-class deliverables.

### 15.2 Unit Testing

**Coverage Target.** Minimum 80% code coverage for business logic. Higher coverage for critical paths (parsing, download completion).

**Framework.** Vitest for JavaScript/TypeScript. pytest for Python. Standard library testing for Go.

**Location.** Tests live alongside source code in `__tests__` folders or in a `tests/` directory at the package root.

### 15.3 Integration Testing

**API Tests.** Test each API endpoint end-to-end. Use real services or test doubles as appropriate.

**Service-to-Service.** Test communication between services. Use test databases and message queues.

### 15.4 E2E Testing

**Playwright.** We use Playwright for browser automation testing. Tests simulate real user flows: load extension, navigate to YouTube, detect video, download.

### 15.5 Parser Testing

**Platform Coverage Tests.** Automated tests that try parsing from each supported platform. Run on schedule (every 15 minutes).

**Alert on Failure.** If a platform parser fails, alert the team. Platform changes are common and must be addressed quickly.

### 15.6 Load Testing

**k6.** We use k6 for load testing. Tests simulate expected traffic patterns. Run before major deployments.

---

## SECTION 16: Development Workflow & Conventions

### 16.1 Branching Strategy

We use a simplified trunk-based development with short-lived feature branches.

**Main Branch.** Main branch is always deployable. Direct commits are forbidden.

**Feature Branches.** Create a branch from main for each feature or fix. Name: `feature/description` or `fix/description`.

**Merge Strategy.** Squash and merge to main. This keeps history clean.

### 16.2 Code Quality

**Linting.** ESLint for JavaScript/TypeScript. ruff for Python. golint for Go.

**Formatting.** Prettier for JavaScript/TypeScript. black for Python. gofmt for Go.

**Pre-commit Hooks.** Husky runs lint and format checks before commit. Commit is rejected if checks fail.

### 16.3 Code Review

**Required Reviews.** All changes require at least one review. Security changes require dedicated review.

**AI-Assisted Review.** AI agents can provide initial review comments, but human approval is required.

---

## SECTION 17: MVP Definition & Phased Rollout

### 17.1 Phase 0: Foundation (Week 1-2)

**Goal:** Establish the development infrastructure.

**Deliverables.**

Monorepo setup complete with pnpm workspace, TypeScript, and build tooling.

CI/CD pipelines configured for all services and applications.

Documentation structure created: all docs folders and template files in place.

Development environment operational with Docker Compose.

**Acceptance Criteria.** Developer can clone repo, run one command, have full dev environment. All CI pipelines pass on empty repo.

### 17.2 Phase 1: Core MVP (Week 3-6)

**Goal:** Minimal viable product for initial testing.

**Deliverables.**

Chrome Extension with YouTube video detection and download.

Backend parser service wrapping yt-dlp for YouTube.

Simple API with single endpoint for parsing.

No ads, no authentication, no web app.

**Acceptance Criteria.** User can install extension, navigate to YouTube, see download button, click to download, receive video file. Success rate > 90% for standard YouTube videos.

### 17.3 Phase 2: Multi-Platform + Web (Week 7-10)

**Goal:** Expand platform support and add web presence.

**Deliverables.**

Parser service expanded to support 5 additional platforms: TikTok, Instagram, Twitter, Facebook, Vimeo.

Next.js web app launched with online download tool.

First ad integration on web app.

Extension updated to detect videos on all supported platforms.

**Acceptance Criteria.** Web app accessible and functional. Extension detects videos on all supported platforms. Ads display correctly on web app.

### 17.4 Phase 3: Growth (Week 11-14)

**Goal:** Launch to users and iterate.

**Deliverables.**

Chrome Web Store submission and launch.

Ad integration in extension.

SEO content system operational.

All major platforms supported (10+ platforms).

Analytics dashboards operational.

**Acceptance Criteria.** Extension available in Chrome Web Store. 10,000 installs within 30 days of launch. First revenue from ads.

### 17.5 Phase 4: Expansion (Week 15-20)

**Goal:** Expand to additional platforms and form factors.

**Deliverables.**

React Native module ready for third-party integration.

WeChat Mini Program launched for Chinese market.

Advanced analytics and reporting.

Performance optimization pass.

**Acceptance Criteria.** At least one third-party app integrates our React Native module. Mini Program passes WeChat review.

---

## SECTION 18: Open-Source Dependency Map

### 18.1 Video Parsing & Processing

**yt-dlp.** GitHub: ytdl-org/yt-dlp. Stars: 120,000+. License: Unlicense. Purpose: Core video parsing engine.

**FFmpeg.** ffmpeg.org. License: LGPL/GPL. Purpose: Video format conversion and processing.

### 18.2 Chrome Extension Development

**wxt.** GitHub: wxt-dev/wxt. Stars: 3,000+. License: MIT. Purpose: Chrome Extension framework with Vite.

### 18.3 Web Framework & UI

**Next.js.** GitHub: vercel/next.js. Stars: 115,000+. License: MIT. Purpose: Web application framework.

**React.** GitHub: facebook/react. Stars: 215,000+. License: MIT. Purpose: UI library.

**Tailwind CSS.** GitHub: tailwindlabs/tailwindcss. Stars: 75,000+. License: MIT. Purpose: CSS framework.

### 18.4 Backend Framework

**FastAPI.** GitHub: tiangolo/fastapi. Stars: 70,000+. License: MIT. Purpose: Python web framework.

**Gin.** GitHub: gin-gonic/gin. Stars: 75,000+. License: MIT. Purpose: Go web framework.

### 18.5 Database & Caching

**Redis.** redis.io. License: BSD. Purpose: Cache and queue.

**PostgreSQL.** postgresql.org. License: PostgreSQL. Purpose: Primary database.

### 18.6 DevOps

**Kubernetes.** kubernetes.io. License: Apache 2.0. Purpose: Container orchestration.

**Docker.** docker.com. Purpose: Containerization.

**GitHub Actions.** github.com/features/actions. Purpose: CI/CD.

---

## SECTION 19: Risk Register & Mitigation

### 19.1 Platform Parser Risk

**Risk.** Platforms change their APIs frequently, breaking parsers.

**Probability:** High. **Impact:** High.

**Mitigation.** Automated monitoring every 15 minutes. Rapid response team availability. Multiple extraction strategies per platform.

### 19.2 Chrome Store Risk

**Risk.** Extension removed from Chrome Web Store.

**Probability:** Medium. **Impact:** Critical.

**Mitigation.** Strict policy compliance. Multiple distribution channels. Web app as fallback.

### 19.3 DMCA Risk

**Risk.** DMCA takedown requests or legal action.

**Probability:** Low. **Impact:** High.

**Mitigation.** Clear terms of service. Platform risk tier system. Response process for takedown requests.

### 19.4 Infrastructure Risk

**Risk.** Traffic spike overwhelms infrastructure.

**Probability:** Medium. **Impact:** Medium.

**Mitigation.** Auto-scaling configuration. Rate limiting. Cost monitoring.

---

## SECTION 20: Appendix

### 20.1 Glossary

**Parser Service.** Backend service that extracts video information from URLs.

**Extractor.** Component within parser service that handles a specific video platform.

**API Gateway.** Entry point for all backend API requests.

**Worker Service.** Handles background jobs like video conversion.

**Ad Service.** Manages advertising across platforms.

**Quality Option.** Available video quality (e.g., 1080p, 720p).

**Format.** Container and codec combination (e.g., MP4/H.264).

### 20.2 Documentation Templates

**New Module Template.** Every new module should include README.md with: purpose, architecture description, data flow, dependencies, integration points, testing strategy, known limitations.

**ADR Template.** Title, Status, Context, Decision, Consequences.

### 20.3 Checklists

**Adding a New Platform.** Research platform → Design extractor → Implement → Test → Update docs → Deploy → Monitor.

**Adding a New Ad Placement.** Define placement → Update backend → Implement frontend → Test → Deploy.

---

*End of BLUEPRINT.md*
