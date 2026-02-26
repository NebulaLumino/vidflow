package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ad struct {
	ID          string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name        string    `gorm:"type:varchar(255)" json:"name"`
	AdType      string    `gorm:"type:varchar(50)" json:"ad_type"` // banner, video, interstitial
	Placement   string    `gorm:"type:varchar(100)" json:"placement"`
	Content     string    `gorm:"type:text" json:"content"`
	ImageURL    string    `gorm:"type:varchar(500)" json:"image_url,omitempty"`
	TargetURL   string    `gorm:"type:varchar(500)" json:"target_url"`
	Impressions int       `gorm:"default:0" json:"impressions"`
	Clicks      int       `gorm:"default:0" json:"clicks"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Active      bool      `gorm:"default:true" json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (ad *Ad) BeforeCreate(tx *gorm.DB) error {
	if ad.ID == "" {
		ad.ID = uuid.New().String()
	}
	return nil
}

type AdImpression struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	AdID      string    `gorm:"type:varchar(36);index" json:"ad_id"`
	IPAddress string    `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent string    `gorm:"type:text" json:"user_agent"`
	Country   string    `gorm:"type:varchar(10)" json:"country"`
	CreatedAt time.Time `json:"created_at"`
}

func (impression *AdImpression) BeforeCreate(tx *gorm.DB) error {
	if impression.ID == "" {
		impression.ID = uuid.New().String()
	}
	return nil
}

type AdClick struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	AdID      string    `gorm:"type:varchar(36);index" json:"ad_id"`
	IPAddress string    `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent string    `gorm:"type:text" json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
}

func (click *AdClick) BeforeCreate(tx *gorm.DB) error {
	if click.ID == "" {
		click.ID = uuid.New().String()
	}
	return nil
}
