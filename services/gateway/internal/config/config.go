package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the gateway
type Config struct {
	// Server
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
	RequestTimeout time.Duration

	// Rate limiting
	RateLimitRequests int
	RateLimitWindow   time.Duration

	// CORS
	AllowedOrigins []string

	// Upstream services
	ParserURL      string
	WorkerURL      string
	AdServiceURL   string

	// Authentication
	JWTSecret     string
	JWTExpiration time.Duration

	// Logging
	LogLevel string
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		// Server defaults
		Port:         getEnvInt("PORT", 8080),
		ReadTimeout:  getEnvDuration("READ_TIMEOUT", 15*time.Second),
		WriteTimeout: getEnvDuration("WRITE_TIMEOUT", 15*time.Second),
		IdleTimeout:  getEnvDuration("IDLE_TIMEOUT", 60*time.Second),
		RequestTimeout: getEnvDuration("REQUEST_TIMEOUT", 30*time.Second),

		// Rate limiting (100 requests per minute by default)
		RateLimitRequests: getEnvInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitWindow:   getEnvDuration("RATE_LIMIT_WINDOW", 1*time.Minute),

		// CORS
		AllowedOrigins: getEnvSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:5173"}),

		// Upstream services
		ParserURL:    getEnv("PARSER_URL", "http://localhost:8000"),
		WorkerURL:    getEnv("WORKER_URL", "http://localhost:8081"),
		AdServiceURL: getEnv("AD_SERVICE_URL", "http://localhost:8082"),

		// Authentication
		JWTSecret:     getEnv("JWT_SECRET", "vidflow-secret-change-in-production"),
		JWTExpiration: getEnvDuration("JWT_EXPIRATION", 24*time.Hour),

		// Logging
		LogLevel: getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value, exists := os.LookupEnv(key); exists {
		// Simple comma-separated list
		if value == "" {
			return []string{}
		}
		return []string{value} // Will be split in middleware
	}
	return defaultValue
}
