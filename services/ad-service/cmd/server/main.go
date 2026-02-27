package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vidflow/ad-service/internal/handlers"
	"github.com/vidflow/ad-service/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Database setup
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./ad_service.db"
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate tables
	db.AutoMigrate(&models.Ad{})
	db.Exec("CREATE TABLE IF NOT EXISTS ad_impressions (id TEXT PRIMARY KEY, ad_id TEXT, ip_address TEXT, user_agent TEXT, country TEXT, created_at DATETIME)")
	db.Exec("CREATE TABLE IF NOT EXISTS ad_clicks (id TEXT PRIMARY KEY, ad_id TEXT, ip_address TEXT, user_agent TEXT, created_at DATETIME)")

	// Initialize handlers
	h := handlers.New(db)

	// Setup router
	r := gin.Default()

	// Health check
	r.GET("/health", h.HealthCheck)

	// API routes
	api := r.Group("/api/v1")
	{
		api.POST("/ads", h.GetAd)
		api.POST("/ads/:ad_id/impression", h.TrackImpression)
		api.POST("/ads/:ad_id/click", h.TrackClick)
	}

	// Seed some sample ads
	seedAds(db)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	log.Printf("Ad Service starting on port %s", port)
	r.Run(":" + port)
}

func seedAds(db *gorm.DB) {
	var count int64
	db.Model(&models.Ad{}).Count(&count)
	if count > 0 {
		return
	}

	now := time.Now()
	nextMonth := now.AddDate(0, 1, 0)
	
	sampleAds := []models.Ad{
		{
			Name:      "VidFlow Premium",
			AdType:    "banner",
			Placement: "sidebar",
			Content:   "Get VidFlow Premium - No Ads, Faster Downloads!",
			TargetURL: "https://vidflow.io/premium",
			StartDate: now,
			EndDate:   nextMonth,
			Active:    true,
		},
		{
			Name:      "Cloud Storage Deal",
			AdType:    "banner",
			Placement: "player",
			Content:   "50% off Cloud Storage - Limited Time!",
			TargetURL: "https://example.com/cloud",
			StartDate: now,
			EndDate:   nextMonth,
			Active:    true,
		},
	}

	for i := range sampleAds {
		db.Create(&sampleAds[i])
	}
}
