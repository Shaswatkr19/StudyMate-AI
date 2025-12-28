from urllib.parse import urlparse, parse_qs


def extract_video_id(youtube_url: str) -> str:
    """
    Extract video ID from YouTube URL
    
    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    
    Args:
        youtube_url: Full YouTube URL
        
    Returns:
        Video ID string or None if invalid
    """
    parsed_url = urlparse(youtube_url)
    
    # youtube.com/watch?v=VIDEO_ID
    if "youtube.com" in parsed_url.netloc:
        video_id = parse_qs(parsed_url.query).get("v", [None])[0]
        if video_id:
            return video_id
    
    # youtu.be/VIDEO_ID
    if "youtu.be" in parsed_url.netloc:
        return parsed_url.path.lstrip("/").split("?")[0]
    
    return None