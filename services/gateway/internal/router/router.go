package router

import (
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/vidflow/gateway/internal/config"
	"github.com/vidflow/gateway/internal/handlers"
)

// Setup configures and returns the router
func Setup(cfg *config.Config, h *handlers.Handler) *gin.Engine {
	r := gin.Default()

	// Health check
	r.GET("/health", h.HealthCheck)
	r.GET("/ready", h.HealthCheck)

	// Metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Video routes
		v1.POST("/parse", h.ParseVideo)
		v1.GET("/videos", h.ListVideos)
		v1.GET("/videos/:id", h.GetVideo)
		v1.POST("/videos/:id/download", h.DownloadVideo)

		// Platform routes
		v1.GET("/platforms", h.GetSupportedPlatforms)

		// Job routes
		v1.POST("/jobs", h.SubmitJob)
		v1.GET("/jobs/:id", h.GetJobStatus)

		// Ad routes
		v1.POST("/ads", h.GetAd)
		v1.POST("/ads/:ad_id/impression", h.TrackAdImpression)
		v1.POST("/ads/:ad_id/click", h.TrackAdClick)
	}

	// Proxy metrics from upstream services
	r.GET("/parser/metrics", h.ProxyMetrics)

	return r
}
