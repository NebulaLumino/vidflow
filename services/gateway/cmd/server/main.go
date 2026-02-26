package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/vidflow/gateway/internal/config"
	"github.com/vidflow/gateway/internal/handlers"
	"github.com/vidflow/gateway/internal/middleware"
	"github.com/vidflow/gateway/internal/router"
	"github.com/vidflow/gateway/pkg/logger"
)

func main() {
	// Initialize logger
	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}
	logger.Init(logLevel)
	log := logger.Log

	log.Info().Msg("Starting VidFlow API Gateway")

	// Load configuration
	cfg := config.Load()

	// Initialize handlers
	h := handlers.New(cfg)

	// Setup router
	r := router.Setup(cfg, h)

	// Apply global middleware
	r.Use(middleware.Logging(log))
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS(cfg.AllowedOrigins))
	r.Use(middleware.RateLimit(cfg.RateLimitRequests, cfg.RateLimitWindow))
	r.Use(middleware.Timeout(cfg.RequestTimeout))

	// Create server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// Start server in goroutine
	go func() {
		log.Info().Int("port", cfg.Port).Msg("Server starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failed")
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exited")
}
