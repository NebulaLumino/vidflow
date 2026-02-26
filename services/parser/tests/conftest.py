"""
Pytest configuration and shared fixtures for parser service tests
"""
import pytest
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


@pytest.fixture
def sample_video_info():
    """Sample video information for testing"""
    return {
        "id": "test123",
        "url": "https://youtube.com/watch?v=test123",
        "title": "Test Video Title",
        "description": "This is a test video description",
        "thumbnail": "https://example.com/thumbnail.jpg",
        "uploader": "Test Author",
        "uploader_url": "https://example.com/author",
        "duration": 180.0,
        "upload_date": "20240115",
        "view_count": 5000,
        "like_count": 250,
        "height": 1080,
        "formats": [
            {"ext": "mp4", "height": 1080},
            {"ext": "mp4", "height": 720},
            {"ext": "mp4", "height": 480},
            {"ext": "webm", "height": 1080},
        ],
        "webpage_url": "https://youtube.com/watch?v=test123",
    }


@pytest.fixture
def sample_minimal_video_info():
    """Minimal video information for testing"""
    return {
        "id": "min123",
        "url": "https://example.com/video",
        "title": "Minimal Video",
        "webpage_url": "https://example.com/video",
        "formats": [],
    }


@pytest.fixture
def mock_youtube_url():
    """Sample YouTube URL"""
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"


@pytest.fixture
def mock_tiktok_url():
    """Sample TikTok URL"""
    return "https://www.tiktok.com/@user/video/123456789"


@pytest.fixture
def mock_ydl_opts():
    """Sample yt-dlp options"""
    return {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
    }
