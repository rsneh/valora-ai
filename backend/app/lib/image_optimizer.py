"""
Image optimization utilities for processing uploaded images.

This module provides functions to optimize images by:
- Resizing to maximum dimensions while maintaining aspect ratio
- Compressing to reduce file size while maintaining quality
- Converting to optimal formats (WebP or JPEG)
"""

import io
from typing import Tuple
from PIL import Image, ImageOps
from fastapi import UploadFile


# Configuration constants
MAX_WIDTH = 2048  # Maximum width in pixels
MAX_HEIGHT = 2048  # Maximum height in pixels
JPEG_QUALITY = 85  # Quality for JPEG compression (1-100)
WEBP_QUALITY = 85  # Quality for WebP compression (1-100)
MAX_FILE_SIZE_MB = 5  # Maximum file size in MB after optimization


def optimize_image(
    file: UploadFile,
    max_width: int = MAX_WIDTH,
    max_height: int = MAX_HEIGHT,
    quality: int = JPEG_QUALITY,
) -> Tuple[io.BytesIO, str]:
    """
    Optimizes an uploaded image by resizing and compressing it.

    Args:
        file: The uploaded file object
        max_width: Maximum width in pixels (default: 2048)
        max_height: Maximum height in pixels (default: 2048)
        quality: Compression quality 1-100 (default: 85)

    Returns:
        A tuple of (optimized_image_buffer, content_type)
    """
    # Read the image
    image_data = file.file.read()
    image = Image.open(io.BytesIO(image_data))

    # Auto-rotate image based on EXIF orientation
    image = ImageOps.exif_transpose(image)

    # Convert RGBA to RGB if necessary (for JPEG compatibility)
    if image.mode in ("RGBA", "LA", "P"):
        # Create a white background
        background = Image.new("RGB", image.size, (255, 255, 255))
        if image.mode == "P":
            image = image.convert("RGBA")
        background.paste(
            image, mask=image.split()[-1] if image.mode in ("RGBA", "LA") else None
        )
        image = background
    elif image.mode != "RGB":
        image = image.convert("RGB")

    # Get original dimensions
    original_width, original_height = image.size

    # Calculate new dimensions while maintaining aspect ratio
    if original_width > max_width or original_height > max_height:
        # Calculate scaling factor
        width_ratio = max_width / original_width
        height_ratio = max_height / original_height
        scale_factor = min(width_ratio, height_ratio)

        new_width = int(original_width * scale_factor)
        new_height = int(original_height * scale_factor)

        # Resize using high-quality Lanczos resampling
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(
            f"Image resized from {original_width}x{original_height} "
            f"to {new_width}x{new_height}"
        )

    # Optimize and save to buffer
    output_buffer = io.BytesIO()

    # Try WebP first for better compression, fallback to JPEG
    try:
        image.save(
            output_buffer,
            format="WEBP",
            quality=quality,
            method=6,  # Slowest but best compression
        )
        content_type = "image/webp"
        print(f"Image optimized as WebP, size: {output_buffer.tell() / 1024:.2f} KB")
    except Exception as e:
        print(f"WebP conversion failed, falling back to JPEG: {e}")
        output_buffer = io.BytesIO()
        image.save(
            output_buffer,
            format="JPEG",
            quality=quality,
            optimize=True,
        )
        content_type = "image/jpeg"
        print(f"Image optimized as JPEG, size: {output_buffer.tell() / 1024:.2f} KB")

    # Reset buffer position to beginning
    output_buffer.seek(0)

    # Check if file size is within limits
    file_size_mb = output_buffer.tell() / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        print(
            f"Warning: Optimized image size ({file_size_mb:.2f} MB) "
            f"exceeds recommended maximum ({MAX_FILE_SIZE_MB} MB)"
        )

    return output_buffer, content_type


def get_image_dimensions(file: UploadFile) -> Tuple[int, int]:
    """
    Gets the dimensions of an uploaded image without loading it fully into memory.

    Args:
        file: The uploaded file object

    Returns:
        A tuple of (width, height)
    """
    image_data = file.file.read()
    file.file.seek(0)  # Reset file pointer
    image = Image.open(io.BytesIO(image_data))
    return image.size


def validate_image(file: UploadFile) -> bool:
    """
    Validates that the uploaded file is a valid image.

    Args:
        file: The uploaded file object

    Returns:
        True if valid image, False otherwise
    """
    try:
        image_data = file.file.read()
        file.file.seek(0)  # Reset file pointer
        Image.open(io.BytesIO(image_data))
        return True
    except Exception as e:
        print(f"Invalid image file: {e}")
        return False
