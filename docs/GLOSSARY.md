# Glossary

This document defines key terms used throughout the VidFlow project.

## General Terms

### VidFlow

The project name. A distributed video download platform that allows users to download videos from various platforms.

### MVP (Minimum Viable Product)

The minimum set of features required to launch the product and gather user feedback.

### Monorepo

A single repository containing multiple projects, services, and packages.

## Architecture Terms

### Microservices

An architectural style where an application is built as a collection of small, independent services.

### API Gateway

A server that acts as an entry point for API requests, handling routing, authentication, and rate limiting.

### Load Balancer

A device or software that distributes network traffic across multiple servers.

### CDN (Content Delivery Network)

A distributed network of servers that delivers content based on user geographic location.

## Services

### Parser Service

Backend service responsible for extracting video metadata (title, thumbnail, duration, available qualities) from video URLs.

### Worker Service

Backend service responsible for the actual video download process, running in the background.

### Gateway Service

The API Gateway that routes requests to appropriate backend services.

### Database Service

PostgreSQL database service for persistent data storage.

### Ad Service

Service responsible for managing and delivering advertisements.

## Client Applications

### Web App

The primary web application built with Next.js, accessible at vidflow.app.

### Chrome Extension

Browser extension using Manifest V3 that provides one-click video downloading.

### Mobile App

React Native application for iOS and Android.

### Mini Program

WeChat Mini Program for Chinese market, built with Taro.

## Technical Terms

### JWT (JSON Web Token)

A compact, URL-safe token format for securely transmitting claims between parties.

### Rate Limiting

A technique to control the number of requests a user can make in a given time period.

### Caching

Storing frequently accessed data in memory for faster retrieval.

### Queue

A data structure that manages job execution order (FIFO - First In, First Out).

### Webhook

A method of augmenting or altering the behavior of a web page with custom callbacks.

## Video Terms

### Video Metadata

Information about a video including title, description, duration, thumbnail, and available qualities.

### Quality

The resolution of the video (e.g., 360p, 720p, 1080p, 4K).

### Format

The file container/encoding of the video (e.g., MP4, WebM).

### DRM (Digital Rights Management)

Technology used to protect copyrighted content from unauthorized copying.

## Advertising Terms

### CPM (Cost Per Mille)

The cost per thousand impressions of an advertisement.

### CPC (Cost Per Click)

The cost incurred each time a user clicks on an advertisement.

### RPM (Revenue Per Mille)

Revenue generated per thousand impressions.

### Ad Placement

A specific location in the UI where advertisements are displayed.

### Ad Unit

A specific advertisement with defined dimensions and format.

## Development Terms

### Turborepo

A build system for monorepos that provides fast, efficient builds.

### pnpm

A fast, disk space-efficient package manager.

### Next.js

A React framework for production-grade applications with server-side rendering.

### Tailwind CSS

A utility-first CSS framework for rapid UI development.

### TypeScript

A typed superset of JavaScript that compiles to plain JavaScript.

### Go

A programming language designed for simplicity and performance.

### Python

A high-level programming language used for the parser service.

### PostgreSQL

An advanced, open-source relational database.

### Redis

An in-memory data structure store used for caching and queues.

### RabbitMQ

An open-source message broker software.

## Testing Terms

### Unit Testing

Testing individual functions or components in isolation.

### Integration Testing

Testing how multiple components work together.

### E2E (End-to-End) Testing

Testing the entire application flow from start to finish.

### Test Coverage

The percentage of code that is executed during testing.

## Deployment Terms

### Docker

A platform for developing, shipping, and running applications in containers.

### Kubernetes

An open-source container orchestration platform.

### CI/CD

Continuous Integration/Continuous Deployment - automated build and deployment pipelines.

### Staging

A pre-production environment for testing changes before production deployment.

### Production

The live environment where the application serves real users.

## Monitoring Terms

### Uptime

The percentage of time the system is operational and accessible.

### Latency

The time it takes for a request to be processed and a response to be received.

### p95 Latency

The 95th percentile response time, meaning 95% of requests are faster than this value.

### Error Rate

The percentage of requests that result in errors.

### Throughput

The number of requests processed per second.

## User Terms

### Casual Downloader

A user who downloads videos occasionally (approximately 60% of user base).

### Power User

A user who downloads videos frequently and cares about quality/format options (approximately 25% of user base).

### Developer/Integrator

A user who builds products on top of VidFlow's API/SDK (approximately 10% of user base).

### Mobile-Only User

A user who accesses the internet exclusively from mobile devices (approximately 5% of user base).
