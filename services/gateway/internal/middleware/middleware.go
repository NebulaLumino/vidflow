package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"golang.org/x/time/rate"
)

// Logging returns a gin middleware for request logging
func Logging(log zerolog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log request details
		latency := time.Since(start)
		status := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		if query != "" {
			path = path + "?" + query
		}

		log.Info().
			Str("method", method).
			Str("path", path).
			Int("status", status).
			Str("ip", clientIP).
			Dur("latency", latency).
			Msg("request")
	}
}

// Recovery returns a gin middleware that recovers from panics
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				c.Header("Content-Type", "application/json")
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
			}
		}()
		c.Next()
	}
}

// CORS returns a gin middleware for CORS handling
func CORS(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Check if origin is allowed
		if isOriginAllowed(origin, allowedOrigins) {
			c.Header("Access-Control-Allow-Origin", origin)
		} else if len(allowedOrigins) > 0 {
			c.Header("Access-Control-Allow-Origin", allowedOrigins[0])
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func isOriginAllowed(origin string, allowedOrigins []string) bool {
	if origin == "" {
		return false
	}
	for _, allowed := range allowedOrigins {
		if allowed == "*" || allowed == origin {
			return true
		}
		// Support wildcard subdomains
		if strings.HasPrefix(allowed, "*.") {
			domain := strings.TrimPrefix(allowed, "*.")
			if strings.HasSuffix(origin, domain) {
				return true
			}
		}
	}
	return false
}

// RateLimit returns a gin middleware for rate limiting
func RateLimit(requests int, window time.Duration) gin.HandlerFunc {
	limiter := rate.NewLimiter(rate.Limit(float64(requests)/window.Seconds()), requests)

	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
			})
			return
		}
		c.Next()
	}
}

// Timeout returns a gin middleware that adds a timeout to requests
func Timeout(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Note: For proper timeout handling, you'd use http.TimeoutHandler
		// This is a simplified version
		c.Set("timeout", timeout)
		c.Next()
	}
}
