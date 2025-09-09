from typing import List
from fastapi import UploadFile
from aws import bucket_session

def upload_images_to_s3(prefix: str, images: List[UploadFile]):
    if not images:
        return
    with bucket_session() as s3:
        for i, image in enumerate(images, start=1):
            extension = image.filename.split(".")[-1]
            key = f"{prefix}/img_{i}.{extension}"
            s3.upload_fileobj(
                image.file,
                "birdie-image-bucket",
                key,
            )

def delete_images_from_s3(prefix: str):
    bucket_name = "birdie-image-bucket"
    with bucket_session() as s3:
        objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        if "Contents" not in objects:
            return  # No images to delete
        delete_keys = [{"Key": obj["Key"]} for obj in objects["Contents"]]
        s3.delete_objects(
            Bucket=bucket_name,
            Delete={"Objects": delete_keys}
        )
