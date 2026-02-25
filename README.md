# VidFlow

Distributed Video Download Platform

## Project Structure

```
vidflow/
├── apps/              # Frontend applications
│   └── web/          # Next.js web application
├── services/         # Backend services
│   └── parser/       # Video parser service (FastAPI + yt-dlp)
├── extensions/       # Browser extensions
│   └── chrome/       # Chrome extension
├── packages/          # Shared packages
│   └── shared/       # Shared types and utilities
└── docs/             # Documentation
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.11
- Docker and Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start development environment
docker-compose up -d

# Run parser service locally
cd services/parser
pip install -r requirements.txt
uvicorn main:app --reload
```

## Development

### Running Tests

```bash
pnpm test
```

### Building

```bash
pnpm build
```

## License

MIT
