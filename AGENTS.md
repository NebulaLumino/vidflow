# AGENTS.md - VidFlow Developer Guide

This file contains essential information for AI agents working on the VidFlow project.

## Project Overview

VidFlow is a distributed video download platform that allows users to download videos from multiple platforms including YouTube, TikTok, Instagram, Twitter, Facebook, and Vimeo.

## Technology Stack

### Frontend
- **Chrome Extension**: wxt (Vite-based Chrome extension framework)
- **Web App**: Next.js 14 with React and Tailwind CSS

### Backend
- **Parser Service**: FastAPI (Python 3.11) with yt-dlp
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

### Infrastructure
- **Container**: Docker with Docker Compose
- **CI/CD**: GitHub Actions

## Package Structure

```
vidflow/
├── apps/
│   └── web/              # Next.js web application (future)
├── services/
│   └── parser/           # FastAPI parser service
├── extensions/
│   └── chrome/           # Chrome extension (wxt)
├── packages/
│   └── shared/           # Shared TypeScript types
└── docs/                 # Documentation
```

## Key Commands

```bash
# Install all dependencies
pnpm install

# Start development environment
docker-compose up -d

# Run parser service locally
cd services/parser
pip install -r requirements.txt
uvicorn main:app --reload

# Build Chrome extension
cd extensions/chrome
pnpm build

# Run tests
pnpm test
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/v1/parse` - Parse video URL and get metadata
- `POST /api/v1/download` - Start video download
- `GET /api/v1/platforms` - Get supported platforms

## Development Standards

1. **TypeScript**: All new code must be TypeScript
2. **Testing**: 100% test coverage required
3. **Linting**: ESLint with strict rules
4. **Formatting**: Prettier for code formatting
5. **Commits**: Conventional commits (feat, fix, docs, etc.)

## Platform Support

Currently supported platforms for video parsing:
- YouTube
- TikTok
- Instagram
- Twitter/X
- Facebook
- Vimeo

## Environment Variables

Parser Service:
- `REDIS_URL` - Redis connection URL
- `DATABASE_URL` - PostgreSQL connection URL
- `DOWNLOAD_DIR` - Directory for downloaded files

## Known Limitations

- Parser service requires yt-dlp to be installed
- Some platforms may have rate limiting
- Download speeds depend on source platform

## Getting Help

- Check API documentation at `/docs` when running the parser service
- Review platform-specific parsers in `services/parser/src`
