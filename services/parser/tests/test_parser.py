"""
Tests for VidFlow Parser Service
Unit and integration tests for the FastAPI parser service
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


class TestGetPlatformFromUrl:
    """Tests for platform detection from URL"""

    def test_youtube_urls(self):
        """Test YouTube URL detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://www.youtube.com/watch?v=abc123") == "youtube"
        assert get_platform_from_url("https://youtu.be/abc123") == "youtube"
        assert get_platform_from_url("https://youtube.com/shorts/abc123") == "youtube"
        assert get_platform_from_url("https://www.YOUTUBE.COM/watch?v=abc") == "youtube"

    def test_tiktok_urls(self):
        """Test TikTok URL detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://www.tiktok.com/@user/video/123") == "tiktok"
        assert get_platform_from_url("https://tiktok.com/@user/video/456") == "tiktok"

    def test_instagram_urls(self):
        """Test Instagram URL detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://www.instagram.com/reel/abc123/") == "instagram"
        assert get_platform_from_url("https://instagram.com/p/abc123/") == "instagram"

    def test_twitter_urls(self):
        """Test Twitter/X URL detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://twitter.com/user/status/123") == "twitter"
        assert get_platform_from_url("https://x.com/user/status/456") == "twitter"

    def test_facebook_urls(self):
        """Test Facebook URL detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://www.facebook.com/watch/?v=123") == "facebook"
        assert get_platform_from_url("https://fb.watch/abc123") == "facebook"

    def test_vimeo_urls(self):
        """Test Vimeo URL detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://vimeo.com/123456789") == "vimeo"
        assert get_platform_from_url("https://www.vimeo.com/987654321") == "vimeo"

    def test_unknown_platform(self):
        """Test unknown platform detection"""
        from main import get_platform_from_url
        
        assert get_platform_from_url("https://example.com/video") == "unknown"
        assert get_platform_from_url("https://dailymotion.com/video/abc") == "unknown"
        assert get_platform_from_url("") == "unknown"


class TestFormatDuration:
    """Tests for duration formatting"""

    def test_format_duration_with_value(self):
        """Test duration formatting with valid value"""
        from main import format_duration
        
        assert format_duration(120.0) == 120
        assert format_duration(60.5) == 60
        assert format_duration(0.0) == 0
        assert format_duration(3600.9) == 3600

    def test_format_duration_with_none(self):
        """Test duration formatting with None"""
        from main import format_duration
        
        assert format_duration(None) is None


class TestParseVideoInfo:
    """Tests for video info parsing"""

    def test_parse_video_info_complete(self):
        """Test parsing complete video info"""
        from main import parse_video_info
        
        ydl_info = {
            "id": "abc123",
            "url": "https://youtube.com/watch?v=abc123",
            "title": "Test Video",
            "description": "A test video",
            "thumbnail": "https://example.com/thumb.jpg",
            "uploader": "Test Author",
            "uploader_url": "https://example.com/author",
            "duration": 120.0,
            "upload_date": "20240101",
            "view_count": 1000,
            "like_count": 100,
            "height": 1080,
            "formats": [
                {"ext": "mp4", "height": 1080},
                {"ext": "mp4", "height": 720},
                {"ext": "webm", "height": 480},
            ],
            "webpage_url": "https://www.youtube.com/watch?v=abc123",
        }
        
        result = parse_video_info(ydl_info)
        
        assert result.id == "abc123"
        assert result.title == "Test Video"
        assert result.description == "A test video"
        assert result.duration == 120
        assert result.view_count == 1000
        assert result.like_count == 100
        assert "1080p" in result.available_qualities
        assert "720p" in result.available_qualities
        assert "mp4" in result.available_formats
        assert "webm" in result.available_formats

    def test_parse_video_info_minimal(self):
        """Test parsing minimal video info"""
        from main import parse_video_info
        
        ydl_info = {
            "id": "abc123",
            "url": "https://www.youtube.com/watch?v=abc123",
            "title": "Minimal Video",
            "formats": [],
            "webpage_url": "https://www.youtube.com/watch?v=abc123",
        }
        
        result = parse_video_info(ydl_info)
        
        assert result.id == "abc123"
        assert result.title == "Minimal Video"
        assert result.description is None
        assert result.duration is None

    def test_parse_video_info_no_formats(self):
        """Test parsing video info without formats"""
        from main import parse_video_info
        
        ydl_info = {
            "id": "abc123",
            "url": "https://www.youtube.com/watch?v=abc123",
            "title": "Test Video",
            "webpage_url": "https://www.youtube.com/watch?v=abc123",
        }
        
        result = parse_video_info(ydl_info)
        
        assert result.available_qualities == []
        assert result.available_formats == []


class TestAPIEndpoints:
    """Tests for API endpoints"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        from fastapi.testclient import TestClient
        from main import app
        
        return TestClient(app)

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "parser"

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        
        assert response.status_code == 200
        assert response.json()["service"] == "VidFlow Parser"
        assert response.json()["version"] == "1.0.0"

    def test_get_supported_platforms(self, client):
        """Test platforms endpoint"""
        response = client.get("/api/v1/platforms")
        
        assert response.status_code == 200
        platforms = response.json()["platforms"]
        assert len(platforms) == 6
        platform_ids = [p["id"] for p in platforms]
        assert "youtube" in platform_ids
        assert "tiktok" in platform_ids

    @patch('main.yt_dlp.YoutubeDL')
    def test_parse_video_success(self, mock_ytdl, client):
        """Test successful video parsing"""
        # Mock yt-dlp
        mock_ydl_instance = MagicMock()
        mock_ytdl.return_value.__enter__.return_value = mock_ydl_instance
        mock_ydl_instance.extract_info.return_value = {
            "id": "test123",
            "url": "https://youtube.com/watch?v=test123",
            "title": "Test Video",
            "description": "Test description",
            "thumbnail": "https://example.com/thumb.jpg",
            "uploader": "Test Author",
            "duration": 120.0,
            "view_count": 1000,
            "like_count": 50,
            "height": 1080,
            "formats": [
                {"ext": "mp4", "height": 1080},
                {"ext": "mp4", "height": 720},
            ],
            "webpage_url": "https://youtube.com/watch?v=test123",
        }
        
        response = client.post(
            "/api/v1/parse",
            json={"url": "https://youtube.com/watch?v=test123"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["video"]["title"] == "Test Video"

    @patch('main.yt_dlp.YoutubeDL')
    def test_parse_video_error(self, mock_ytdl, client):
        """Test video parsing error handling"""
        import yt_dlp
        
        mock_ydl_instance = MagicMock()
        mock_ytdl.return_value.__enter__.return_value = mock_ydl_instance
        mock_ydl_instance.extract_info.side_effect = yt_dlp.utils.DownloadError("Video not found")
        
        response = client.post(
            "/api/v1/parse",
            json={"url": "https://youtube.com/watch?v=invalid"}
        )
        
        assert response.status_code == 400

    def test_parse_video_invalid_url(self, client):
        """Test parsing with invalid URL"""
        response = client.post(
            "/api/v1/parse",
            json={"url": "not-a-valid-url"}
        )
        
        assert response.status_code == 422  # Validation error

    @patch('main.yt_dlp.YoutubeDL')
    def test_download_video(self, mock_ytdl, client):
        """Test video download endpoint"""
        import tempfile
        import os
        
        # Set a temp download directory for testing
        with patch.dict(os.environ, {'DOWNLOAD_DIR': tempfile.mkdtemp()}):
            mock_ydl_instance = MagicMock()
            mock_ytdl.return_value.__enter__.return_value = mock_ydl_instance
            mock_ydl_instance.extract_info.return_value = {
                "id": "test123",
                "url": "https://youtube.com/watch?v=test123",
                "title": "Test Video",
            }
            
            response = client.post(
                "/api/v1/download",
                json={
                    "url": "https://youtube.com/watch?v=test123",
                    "quality": "1080p",
                    "format": "mp4"
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data["data"]
