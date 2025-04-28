export const getVideoPath = (videoPath: string) =>
    `http://${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}:${process.env.NEXT_PUBLIC_MINIO_PORT}/videos/${videoPath}`;

export const getThumbnailPath = (thumbnailPath: string) =>
    `http://${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}:${process.env.NEXT_PUBLIC_MINIO_PORT}/thumbnails/${thumbnailPath}`;
