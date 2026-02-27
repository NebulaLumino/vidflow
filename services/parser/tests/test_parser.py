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


class TestLRUCache:
    """Tests for LRU cache implementation"""
    
    def test_cache_set_and_get(self):
        """Test basic cache set and get operations"""
        from main import LRUCache
        
        cache = LRUCache(maxsize=3, ttl=60)
        cache.set("key1", "value1")
        
        assert cache.get("key1") == "value1"
    
    def test_cache_miss(self):
        """Test cache miss returns None"""
        from main import LRUCache
        
        cache = LRUCache(maxsize=3, ttl=60)
        
        assert cache.get("nonexistent") is None
    
    def test_cache_lru_eviction(self):
        """Test LRU eviction when cache is full"""
        from main import LRUCache
        
        cache = LRUCache(maxsize=3, ttl=60)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        # This should evict key1 (least recently used)
        cache.set("key4", "value4")
        
        assert cache.get("key1") is None  # Evicted
        assert cache.get("key2") == "value2"
        assert cache.get("key3") == "value3"
        assert cache.get("key4") == "value4"
    
    def test_cache_ttl_expiration(self):
        """Test cache TTL expiration"""
        from main import LRUCache
        import time
        
        cache = LRUCache(maxsize=3, ttl=1)  # 1 second TTL
        cache.set("key1", "value1")
        
        assert cache.get("key1") == "value1"
        
        # Wait for TTL to expire
        time.sleep(1.1)
        
        assert cache.get("key1") is None  # Expired
    
    def test_cache_access_updates_lru(self):
        """Test that accessing an item updates its LRU position"""
        from main import LRUCache
        
        cache = LRUCache(maxsize=3, ttl=60)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        # Access key1 to make it most recently used
        cache.get("key1")
        
        # Add new item - should evict key2 (now least recently used)
        cache.set("key4", "value4")
        
        assert cache.get("key1") == "value1"  # Still there
        assert cache.get("key2") is None  # Evicted
        assert cache.get("key3") == "value3"
        assert cache.get("key4") == "value4"
    
    def test_cache_clear(self):
        """Test cache clear operation"""
        from main import LRUCache
        
        cache = LRUCache(maxsize=3, ttl=60)
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        cache.clear()
        
        assert cache.get("key1") is None
        assert cache.get("key2") is None
        assert cache.size() == 0
    
    def test_cache_size(self):
        """Test cache size tracking"""
        from main import LRUCache
        
        cache = LRUCache(maxsize=5, ttl=60)
        
        assert cache.size() == 0
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        assert cache.size() == 2
    
    def test_cache_thread_safety(self):
        """Test cache thread safety"""
        from main import LRUCache
        import threading
        
        cache = LRUCache(maxsize=100, ttl=60)
        
        def worker(start, end):
            for i in range(start, end):
                cache.set(f"key{i}", f"value{i}")
        
        threads = [
            threading.Thread(target=worker, args=(0, 50)),
            threading.Thread(target=worker, args=(50, 100)),
        ]
        
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        
        assert cache.size() <= 100


class TestCacheEndpoints:
    """Tests for cache management endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        from fastapi.testclient import TestClient
        from main import app
        
        return TestClient(app)
    
    def test_cache_stats_endpoint(self, client):
        """Test cache stats endpoint"""
        response = client.get("/api/v1/cache/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert "size" in data
        assert "maxsize" in data
        assert "ttl" in data
    
    def test_cache_clear_endpoint(self, client):
        """Test cache clear endpoint"""
        response = client.post("/api/v1/cache/clear")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_cache_health_endpoint(self, client):
        """Test cache health endpoint"""
        response = client.get("/api/v1/cache/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "cache_size" in data


class TestCacheIntegration:
    """Integration tests for caching with parse endpoint"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        from fastapi.testclient import TestClient
        from main import app
        
        return TestClient(app)
    
    @patch('main.yt_dlp.YoutubeDL')
    def test_parse_uses_cache(self, mock_ytdl, client):
        """Test that parse endpoint uses cache"""
        from main import video_cache
        
        # Clear cache first
        video_cache.clear()
        
        mock_ydl_instance = MagicMock()
        mock_ytdl.return_value.__enter__.return_value = mock_ydl_instance
        mock_ydl_instance.extract_info.return_value = {
            "id": "test123",
            "url": "https://youtube.com/watch?v=test123",
            "title": "Test Video",
            "thumbnail": "https://example.com/thumb.jpg",
            "duration": 120,
            "uploader": "Test Channel",
            "view_count": 1000,
            "like_count": 100,
            "height": 1080,
            "formats": [{"ext": "mp4", "height": 1080}],
        }
        
        # First request - should call yt-dlp
        response1 = client.post(
            "/api/v1/parse",
            json={"url": "https://youtube.com/watch?v=test123"}
        )
        
        assert response1.status_code == 200
        call_count_1 = mock_ytdl.return_value.__enter__.return_value.extract_info.call_count
        
        # Second request - should use cache (not call yt-dlp again)
        response2 = client.post(
            "/api/v1/parse",
            json={"url": "https://youtube.com/watch?v=test123"}
        )
        
        assert response2.status_code == 200
        call_count_2 = mock_ytdl.return_value.__enter__.return_value.extract_info.call_count
        
        # The extract_info should only be called once (first request)
        assert call_count_1 == 1
        assert call_count_2 == 1  # Same as before because cache was used
    
    @patch('main.yt_dlp.YoutubeDL')
    def test_different_urls_not_cached(self, mock_ytdl, client):
        """Test that different URLs are not served from cache"""
        from main import video_cache
        
        # Clear cache first
        video_cache.clear()
        
        mock_ydl_instance = MagicMock()
        mock_ytdl.return_value.__enter__.return_value = mock_ydl_instance
        mock_ydl_instance.extract_info.return_value = {
            "id": "test123",
            "url": "https://youtube.com/watch?v=test123",
            "title": "Test Video",
            "thumbnail": "https://example.com/thumb.jpg",
            "duration": 120,
            "uploader": "Test Channel",
            "view_count": 1000,
            "like_count": 100,
            "height": 1080,
            "formats": [{"ext": "mp4", "height": 1080}],
        }
        
        # First URL
        response1 = client.post(
            "/api/v1/parse",
            json={"url": "https://youtube.com/watch?v=test123"}
        )
        
        # Second URL - different
        response2 = client.post(
            "/api/v1/parse",
            json={"url": "https://youtube.com/watch?v=different"}
        )
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Should have called extract_info twice (once for each URL)
        assert mock_ydl_instance.extract_info.call_count == 2
