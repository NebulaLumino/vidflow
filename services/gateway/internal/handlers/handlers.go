package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vidflow/gateway/internal/config"
)

// Handler holds all handlers
type Handler struct {
	cfg        *config.Config
	httpClient *http.Client
}

// New creates a new handler instance
func New(cfg *config.Config) *Handler {
	return &Handler{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: cfg.RequestTimeout,
		},
	}
}

// HealthCheck handles health check requests
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"service": "gateway",
		"version": "1.0.0",
	})
}

// ParseVideo handles video parsing requests
func (h *Handler) ParseVideo(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: URL is required"})
		return
	}

	// Forward to parser service
	resp, err := h.httpClient.Post(
		h.cfg.ParserURL+"/api/v1/parse",
		"application/json",
		bytes.NewBuffer([]byte(fmt.Sprintf(`{"url":"%s"}`, req.URL))),
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to parser service"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	
	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": string(body)})
		return
	}

	var result map[string]interface{}
	json.Unmarshal(body, &result)
	c.JSON(http.StatusOK, result)
}

// GetVideo handles GET video requests
func (h *Handler) GetVideo(c *gin.Context) {
	videoID := c.Param("id")

	resp, err := h.httpClient.Get(h.cfg.ParserURL + "/api/v1/videos/" + videoID)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to parser service"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
		return
	}

	var result map[string]interface{}
	json.Unmarshal(body, &result)
	c.JSON(http.StatusOK, result)
}

// ListVideos handles listing videos
func (h *Handler) ListVideos(c *gin.Context) {
	resp, err := h.httpClient.Get(h.cfg.ParserURL + "/api/v1/videos")
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to parser service"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	c.JSON(http.StatusOK, result)
}

// DownloadVideo handles video download requests
func (h *Handler) DownloadVideo(c *gin.Context) {
	videoID := c.Param("id")
	format := c.Query("format")

	req := map[string]string{}
	if format != "" {
		req["format"] = format
	}

	bodyBytes, _ := json.Marshal(req)
	resp, err := h.httpClient.Post(
		h.cfg.ParserURL+"/api/v1/videos/"+videoID+"/download",
		"application/json",
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to parser service"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": string(respBody)})
		return
	}

	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	c.JSON(http.StatusOK, result)
}

// SubmitJob handles background job submission
func (h *Handler) SubmitJob(c *gin.Context) {
	var jobReq struct {
		Type    string                 `json:"type" binding:"required"`
		Payload map[string]interface{} `json:"payload"`
	}

	if err := c.ShouldBindJSON(&jobReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job request"})
		return
	}

	bodyBytes, _ := json.Marshal(jobReq)
	resp, err := h.httpClient.Post(
		h.cfg.WorkerURL+"/api/v1/jobs",
		"application/json",
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to worker service"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	c.JSON(resp.StatusCode, result)
}

// GetJobStatus handles job status requests
func (h *Handler) GetJobStatus(c *gin.Context) {
	jobID := c.Param("id")

	resp, err := h.httpClient.Get(h.cfg.WorkerURL + "/api/v1/jobs/" + jobID)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to worker service"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	c.JSON(http.StatusOK, result)
}

// GetAd handles ad request
func (h *Handler) GetAd(c *gin.Context) {
	var req struct {
		Placement string `json:"placement" binding:"required"`
		Context   string `json:"context"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placement is required"})
		return
	}

	bodyBytes, _ := json.Marshal(req)
	resp, err := h.httpClient.Post(
		h.cfg.AdServiceURL+"/api/v1/ads",
		"application/json",
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to ad service"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusNoContent {
		c.JSON(http.StatusOK, gin.H{"ad": nil})
		return
	}

	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	c.JSON(http.StatusOK, result)
}

// TrackAdImpression handles ad impression tracking
func (h *Handler) TrackAdImpression(c *gin.Context) {
	var req struct {
		AdID string `json:"ad_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ad ID is required"})
		return
	}

	resp, err := h.httpClient.Post(
		h.cfg.AdServiceURL+"/api/v1/ads/"+req.AdID+"/impression",
		"application/json",
		nil,
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to ad service"})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// TrackAdClick handles ad click tracking
func (h *Handler) TrackAdClick(c *gin.Context) {
	var req struct {
		AdID string `json:"ad_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ad ID is required"})
		return
	}

	resp, err := h.httpClient.Post(
		h.cfg.AdServiceURL+"/api/v1/ads/"+req.AdID+"/click",
		"application/json",
		nil,
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to ad service"})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetSupportedPlatforms handles platform listing
func (h *Handler) GetSupportedPlatforms(c *gin.Context) {
	resp, err := h.httpClient.Get(h.cfg.ParserURL + "/api/v1/platforms")
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to connect to parser service"})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)
	c.JSON(http.StatusOK, result)
}

// ProxyMetrics handles metrics proxying to Prometheus
func (h *Handler) ProxyMetrics(c *gin.Context) {
	// Fetch metrics from parser service
	resp, err := h.httpClient.Get(h.cfg.ParserURL + "/metrics")
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch metrics"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	c.Data(http.StatusOK, "text/plain", body)
}
