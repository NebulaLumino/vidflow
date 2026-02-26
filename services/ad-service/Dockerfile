FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o ad-service ./cmd/server

# Production image
FROM alpine:3.18

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/ad-service .

EXPOSE 8082

ENV PORT=8082
ENV NODE_ENV=production

CMD ["./ad-service"]
