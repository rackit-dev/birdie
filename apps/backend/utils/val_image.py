from typing import List
from fastapi import HTTPException, status, UploadFile

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MAX_FILE_SIZE_MB = 5  # 5MB
MAX_IMAGES = 5

def validate_images(images: List[UploadFile]):
    if len(images) > MAX_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can upload up to {MAX_IMAGES} images only."
        )

    for image in images:
        contents = image.file.read()
        size_mb = len(contents) / (1024 * 1024)
        image.file.seek(0)
        if size_mb > MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File {image.filename} exceeds the maximum size of {MAX_FILE_SIZE_MB}MB."
            )
