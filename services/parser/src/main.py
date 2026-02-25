"""
VidFlow Parser Service
FastAPI backend for video parsing using yt-dlp
"""
import os
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

import yt_dlp
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from src.shared import VideoMetadata, VideoQuality, VideoFormat, ApiResponse, ParseResponse, Author


# Initialize FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print("Starting VidFlow Parser Service...")
    yield
    # Shutdown
    print("Shutting down VidFlow Parser Service...")


app = FastAPI(
    title="VidFlow Parser Service",
    description="Video parsing API using yt-dlp",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParseRequest(BaseModel):
    """Request model for parsing a video URL"""
    url: HttpUrl


class DownloadRequest(BaseModel):
    """Request model for downloading a video"""
    url: HttpUrl
    quality: Optional[VideoQuality] = "best"
    format: Optional[VideoFormat] = "mp4"


def get_platform_from_url(url: str) -> str:
    """Extract platform from URL"""
    url_lower = url.lower()
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    elif "tiktok.com" in url_lower:
        return "tiktok"
    elif "instagram.com" in url_lower:
        return "instagram"
    elif "twitter.com" in url_lower or "x.com" in url_lower:
        return "twitter"
    elif "facebook.com" in url_lower or "fb.watch" in url_lower:
        return "facebook"
    elif "vimeo.com" in url_lower:
        return "vimeo"
    return "unknown"


def format_duration(seconds: Optional[float]) -> Optional[int]:
    """Format duration from seconds to integer"""
    if seconds is None:
        return None
    return int(seconds)


def parse_video_info(ydl_info: dict) -> VideoMetadata:
    """Parse yt-dlp info dict to VideoMetadata"""
    duration = ydl_info.get("duration")
    
    # Extract available formats and qualities
    formats = ydl_info.get("formats", [])
    available_qualities = set()
    available_formats = set()
    
    for fmt in formats:
        if fmt.get("ext"):
            available_formats.add(fmt["ext"])
        if fmt.get("height"):
            quality = f"{fmt['height']}p"
            available_qualities.add(quality)
    
    # Add best quality
    if ydl_info.get("height"):
        available_qualities.add(f"{ydl_info['height']}p")
    
    # Determine format from ext
    if "mp4" in available_formats:
        primary_format = "mp4"
    elif "webm" in available_formats:
        primary_format = "webm"
    else:
        primary_format = list(available_formats)[0] if available_formats else "mp4"
    
    return VideoMetadata(
        id=ydl_info.get("id", ""),
        platform=get_platform_from_url(ydl_info.get("url", "")),
        title=ydl_info.get("title", ""),
        description=ydl_info.get("description"),
        thumbnail_url=ydl_info.get("thumbnail"),
        author=Author(
            name=ydl_info.get("uploader", ydl_info.get("channel", "Unknown")),
            url=ydl_info.get("uploader_url", ydl_info.get("channel_url")),
        ),
        duration=format_duration(duration),
        upload_date=ydl_info.get("upload_date"),
        view_count=ydl_info.get("view_count"),
        like_count=ydl_info.get("like_count"),
        available_qualities=sorted(list(available_qualities), key=lambda x: int(x[:-1]) if x != "best" else 9999, reverse=True),
        available_formats=sorted(list(available_formats)),
        url=ydl_info.get("webpage_url", ""),
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "parser"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "VidFlow Parser",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.post("/api/v1/parse", response_model=ApiResponse[ParseResponse])
async def parse_video(request: ParseRequest):
    """
    Parse a video URL and return metadata
    
    This endpoint extracts video information from the given URL
    including title, duration, available qualities, and formats.
    """
    url = str(request.url)
    
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                raise HTTPException(status_code=400, detail="Could not extract video information")
            
            video_metadata = parse_video_info(info)
            
            return ApiResponse(
                success=True,
                data=ParseResponse(video=video_metadata),
            )
            
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=f"Download error: {str(e)}")
    except yt_dlp.utils.ExtractorError as e:
        raise HTTPException(status_code=400, detail=f"Extractor error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/v1/download", response_model=ApiResponse[dict])
async def download_video(request: DownloadRequest, background_tasks: BackgroundTasks):
    """
    Download a video from the given URL
    
    This endpoint initiates a video download and returns a download ID
    that can be used to check the download status.
    """
    url = str(request.url)
    quality = request.quality
    format_type = request.format
    
    download_dir = os.environ.get("DOWNLOAD_DIR", "/app/downloads")
    os.makedirs(download_dir, exist_ok=True)
    
    def download_task():
        """Background task to download video"""
        ydl_opts = {
            "format": f"bestvideo[height<={quality[:-1]}]+bestaudio/best" if quality != "best" else "best",
            "outtmpl": f"{download_dir}/%(title)s-%(id)s.%(ext)s",
            "quiet": False,
            "no_warnings": False,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                return {"status": "completed", "filename": ydl.prepare_filename(info)}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
    
    # Add task to background
    background_tasks.add_task(download_task)
    
    return ApiResponse(
        success=True,
        data={"message": "Download started", "url": url},
    )


@app.get("/api/v1/platforms")
async def get_supported_platforms():
    """Get list of supported video platforms"""
    return {
        "platforms": [
            {"id": "youtube", "name": "YouTube", "supported": True},
            {"id": "tiktok", "name": "TikTok", "supported": True},
            {"id": "instagram", "name": "Instagram", "supported": True},
            {"id": "twitter", "name": "Twitter/X", "supported": True},
            {"id": "facebook", "name": "Facebook", "supported": True},
            {"id": "vimeo", "name": "Vimeo", "supported": True},
        ]
    }
