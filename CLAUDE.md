# CLAUDE.md - AI Assistant Guide for VidFlow

You are an AI assistant helping with the VidFlow project. This file provides guidance on how to best assist with development.

## Project Context

VidFlow is a distributed video download platform. The MVP focuses on:
1. Chrome Extension for video detection and download
2. Backend parser service using FastAPI and yt-dlp
3. Simple API for video parsing

## Architecture

### Backend (FastAPI)
- Location: `services/parser/`
- Port: 8000
- Framework: FastAPI + uvicorn

### Frontend (Chrome Extension)
- Location: `extensions/chrome/`
- Framework: wxt (Vite-based)

### Shared Types
- Location: `packages/shared/`
- Contains: VideoMetadata, DownloadRequest, ApiResponse types

## Key Files

- `services/parser/src/main.py` - Main FastAPI application
- `extensions/chrome/src/popup/main.ts` - Extension popup logic
- `extensions/chrome/src/contentScripts/main.ts` - Content script for video detection

## Code Style

### TypeScript
- Use strict TypeScript with explicit types
- Prefer interfaces over types for object shapes
- Use proper naming conventions (camelCase)

### Python (FastAPI)
- Follow PEP 8
- Use type hints
- Use pydantic for data validation

### General
- Keep functions small and focused
- Add comments for complex logic
- Write tests for new features
- Ensure 100% test coverage

## Testing Strategy

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints with mock data
3. **E2E Tests**: Test complete user flows

## Common Tasks

### Adding a New Platform
1. Update `PLATFORM_PATTERNS` in content script
2. Add platform handler in parser service
3. Add tests for the new platform

### Adding a New API Endpoint
1. Define request/response models in shared types
2. Implement endpoint in `services/parser/src/main.py`
3. Add tests for the endpoint
4. Update API.md documentation

## Constraints

- Do NOT modify existing tests to make them pass
- Do NOT reduce test coverage below 100%
- Always validate user input
- Never hardcode credentials
