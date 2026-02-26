package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func New(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

type GetAdRequest struct {
	Placement string `json:"placement" binding:"required"`
	Context   string `json:"context"`
}

type GetAdResponse struct {
	Ad *AdDTO `json:"ad,omitempty"`
}

type AdDTO struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AdType    string `json:"ad_type"`
	Content   string `json:"content"`
	ImageURL  string `json:"image_url,omitempty"`
	TargetURL string `json:"target_url"`
}

// GetAd handles ad requests
func (h *Handler) GetAd(c *gin.Context) {
	var req GetAdRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placement is required"})
		return
	}

	var ad struct {
		ID       string
		Name     string
		AdType   string
		Content  string
		ImageURL string
		TargetURL string
	}

	// Find active ad for placement
	result := h.db.Raw(`
		SELECT id, name, ad_type, content, image_url, target_url 
		FROM ads 
		WHERE placement = ? AND active = 1 AND start_date <= ? AND end_date >= ?
		ORDER BY RANDOM() LIMIT 1
	`, req.Placement, time.Now(), time.Now()).Scan(&ad)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch ad"})
		return
	}

	if ad.ID == "" {
		c.JSON(http.StatusNoContent, nil)
		return
	}

	// Track impression
	impression := map[string]interface{}{
		"ad_id":       ad.ID,
		"ip_address":  c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
		"created_at":  time.Now(),
	}
	h.db.Table("ad_impressions").Create(impression)

	// Increment impression count
	h.db.Exec("UPDATE ads SET impressions = impressions + 1 WHERE id = ?", ad.ID)

	c.JSON(http.StatusOK, GetAdResponse{
		Ad: &AdDTO{
			ID:        ad.ID,
			Name:      ad.Name,
			AdType:    ad.AdType,
			Content:   ad.Content,
			ImageURL:  ad.ImageURL,
			TargetURL: ad.TargetURL,
		},
	})
}

// TrackImpression handles impression tracking
func (h *Handler) TrackImpression(c *gin.Context) {
	adID := c.Param("ad_id")

	var ad struct {
		ID string
	}
	if err := h.db.Raw("SELECT id FROM ads WHERE id = ?", adID).Scan(&ad).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ad not found"})
		return
	}

	impression := map[string]interface{}{
		"id":          adID,
		"ad_id":       adID,
		"ip_address":  c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
		"created_at":  time.Now(),
	}
	h.db.Table("ad_impressions").Create(impression)
	h.db.Exec("UPDATE ads SET impressions = impressions + 1 WHERE id = ?", adID)

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// TrackClick handles click tracking
func (h *Handler) TrackClick(c *gin.Context) {
	adID := c.Param("ad_id")

	var ad struct {
		ID string
	}
	if err := h.db.Raw("SELECT id FROM ads WHERE id = ?", adID).Scan(&ad).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ad not found"})
		return
	}

	click := map[string]interface{}{
		"id":          adID,
		"ad_id":       adID,
		"ip_address":  c.ClientIP(),
		"user_agent":  c.Request.UserAgent(),
		"created_at":  time.Now(),
	}
	h.db.Table("ad_clicks").Create(click)
	h.db.Exec("UPDATE ads SET clicks = clicks + 1 WHERE id = ?", adID)

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// HealthCheck handles health checks
func (h *Handler) HealthCheck(c *gin.Context) {
	sqlDB, err := h.db.DB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy"})
		return
	}

	if err := sqlDB.Ping(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unhealthy"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "ad-service"})
}
