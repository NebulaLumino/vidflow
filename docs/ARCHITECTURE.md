# VidFlow Architecture

This document provides a high-level overview of the VidFlow system architecture. For detailed information, see the [BLUEPRINT.md](./BLUEPRINT.md).

## System Overview

VidFlow is a distributed video download platform designed for speed, reliability, and ease of use. The system consists of multiple microservices and client applications working together.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Applications                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Web    │  │Extension │  │  Mobile  │  │Mini-     │        │
│  │   App    │  │          │  │   App    │  │Program   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼──────────────┼─────────────┼─────────────┼───────────────┘
        │              │             │             │
        └──────────────┴──────────────┴─────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Gateway Service                              │
│                    (API Gateway / Load Balancer)                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Services                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   Parser    │  │   Worker    │  │   Ad       │               │
│  │   Service   │  │   Service   │  │   Service  │               │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘               │
│         │                │                                           │
│         ▼                ▼                                           │
│  ┌─────────────┐  ┌─────────────┐                                   │
│  │  Database   │  │   Storage   │                                   │
│  │  Service    │  │   Service   │                                   │
│  └─────────────┘  └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### Client Applications

| Application  | Technology                     | Purpose               |
| ------------ | ------------------------------ | --------------------- |
| Web App      | Next.js + React                | Primary web interface |
| Extension    | Chrome Extension (Manifest V3) | One-click downloads   |
| Mobile       | React Native                   | iOS/Android apps      |
| Mini Program | Taro                           | WeChat integration    |

### Backend Services

| Service    | Technology | Purpose                          |
| ---------- | ---------- | -------------------------------- |
| Gateway    | Go + Gin   | API routing, auth, rate limiting |
| Parser     | Python     | Video metadata extraction        |
| Worker     | Go         | Download processing              |
| Database   | PostgreSQL | Persistent data storage          |
| Ad Service | Node.js    | Ad management and delivery       |

## Data Flow

### 1. Video Parsing Flow

```
User submits URL
       │
       ▼
   Gateway validates
       │
       ▼
  Parser service extracts metadata
       │
       ▼
  Returns video info to client
```

### 2. Download Flow

```
User initiates download
       │
       ▼
  Gateway creates job
       │
       ▼
  Worker picks up job
       │
       ▼
  Downloads video from source
       │
       ▼
  Saves to storage
       │
       ▼
  Notifies client
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Testing**: Jest + React Testing Library

### Backend

- **API Gateway**: Go + Gin
- **Parser**: Python 3.11+
- **Worker**: Go
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Queue**: RabbitMQ

### Infrastructure

- **Container**: Docker + Kubernetes
- **Cloud**: AWS/GCP
- **CDN**: CloudFlare
- **Monitoring**: Datadog
- **Logging**: ELK Stack

## Security

- JWT-based authentication
- Rate limiting per user
- Input validation and sanitization
- HTTPS everywhere
- Regular security audits

## Scaling Strategy

### Horizontal Scaling

- Stateless services behind load balancers
- Auto-scaling based on traffic
- Multi-region deployment

### Caching Strategy

- Redis for session and API cache
- CDN for static assets
- Pre-cache popular videos

## Monitoring

- Real-time metrics via Datadog
- Distributed tracing
- Error tracking
- Performance profiling

## For More Information

- [BLUEPRINT.md](./BLUEPRINT.md) - Full project blueprint
- [API.md](./API.md) - API documentation
- [Services Documentation](./services/) - Service-specific docs
- [Apps Documentation](./apps/) - Application docs
