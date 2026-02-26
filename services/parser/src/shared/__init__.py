"""
Shared types for VidFlow - Python implementation
These types are used across all packages, apps, services, and extensions
"""
from enum import Enum
from typing import Optional, List, Dict, Any, TypeVar, Generic
from pydantic import BaseModel, TypeAdapter


class VideoPlatform(str, Enum):
    """Video platform types supported by VidFlow"""
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    VIMEO = "vimeo"


class VideoQuality(str, Enum):
    """Video quality options"""
    R144P = "144p"
    R240P = "240p"
    R360P = "360p"
    R480P = "480p"
    R720P = "720p"
    R1080P = "1080p"
    R1440P = "1440p"
    R2160P = "2160p"
    BEST = "best"


class VideoFormat(str, Enum):
    """Video format options"""
    MP4 = "mp4"
    WEBM = "webm"
    MKV = "mkv"
    AUDIO = "audio"


class Author(BaseModel):
    """Author information"""
    name: str
    url: Optional[str] = None


class VideoMetadata(BaseModel):
    """Video metadata from parser"""
    id: str
    platform: VideoPlatform
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    author: Author
    duration: Optional[float] = None
    upload_date: Optional[str] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    available_qualities: List[VideoQuality] = []
    available_formats: List[VideoFormat] = []
    url: str


class DownloadRequest(BaseModel):
    """Download request"""
    url: str
    quality: Optional[VideoQuality] = None
    format: Optional[VideoFormat] = None


class DownloadResponse(BaseModel):
    """Download response"""
    id: str
    status: str  # 'pending' | 'processing' | 'completed' | 'failed'
    video: Optional[VideoMetadata] = None
    download_url: Optional[str] = None
    error: Optional[str] = None
    progress: Optional[float] = None


class ApiError(BaseModel):
    """API error details"""
    code: str
    message: str


T = TypeVar('T')


class ApiResponse(BaseModel, Generic[T]):
    """API response wrapper"""
    model_config = {"arbitrary_types_allowed": True}
    
    success: bool
    data: Optional[T] = None
    error: Optional[ApiError] = None


class ParseRequest(BaseModel):
    """Parse request"""
    url: str


class ParseResponse(BaseModel):
    """Parse response"""
    video: VideoMetadata


# Validation functions
VALID_PLATFORMS: List[str] = [p.value for p in VideoPlatform]
VALID_QUALITIES: List[str] = [q.value for q in VideoQuality]
VALID_FORMATS: List[str] = [f.value for f in VideoFormat]


def is_valid_video_platform(platform: str) -> bool:
    """Check if a string is a valid VideoPlatform"""
    return platform in VALID_PLATFORMS


def is_valid_video_quality(quality: str) -> bool:
    """Check if a string is a valid VideoQuality"""
    return quality in VALID_QUALITIES


def is_valid_video_format(format: str) -> bool:
    """Check if a string is a valid VideoFormat"""
    return format in VALID_FORMATS


def validate_url(url: str) -> bool:
    """Validate a URL format"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return parsed.scheme in ('http', 'https')
    except Exception:
        return False


def create_api_response(
    data: Any = None,
    error_code: Optional[str] = None,
    error_message: Optional[str] = None
) -> Dict[str, Any]:
    """Create a standardized API response"""
    if error_code or error_message:
        return {
            "success": False,
            "error": {
                "code": error_code or "UNKNOWN_ERROR",
                "message": error_message or "An unknown error occurred"
            }
        }
    
    return {
        "success": True,
        "data": data
    }
