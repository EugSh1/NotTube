import prisma from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { minioClient } from "@/lib/minioClient";
import HTTPError from "@/lib/httpError";

export class VideoService {
    static async getVideos(take: number | undefined) {
        return await prisma.video.findMany({
            orderBy: [{ views: "desc" }, { likes: "desc" }],
            take
        });
    }

    static async getVideosByAuthorId(authorId: string) {
        return await prisma.video.findMany({
            where: { authorId },
            include: { author: true },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    static async getVideoById(id: string) {
        const foundVideo = await prisma.video.findUnique({
            where: { id },
            include: {
                author: true,
                comments: {
                    include: {
                        author: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        if (!foundVideo) {
            throw new HTTPError("Video not found", 404);
        }

        return foundVideo;
    }

    static async searchVideos(searchQuery: string, take: number | undefined) {
        const tags = searchQuery.toLowerCase().split(" ");

        return await prisma.video.findMany({
            where: {
                OR: [
                    { title: { contains: searchQuery } },
                    { description: { contains: searchQuery } },
                    ...tags.map((tag) => ({
                        tags: { contains: tag }
                    }))
                ]
            },
            take
        });
    }

    static async createVideo(
        title: string,
        description: string,
        tags: string,
        video: File,
        thumbnail: File,
        userId: string
    ) {
        const videoBytes = await video.arrayBuffer();
        const videoBuffer = Buffer.from(videoBytes);

        const thumbnailBytes = await thumbnail.arrayBuffer();
        const thumbnailBuffer = Buffer.from(thumbnailBytes);

        const videoName = `${randomUUID()}-video.mp4`;
        const thumbnailExtension = path.extname(thumbnail.name);
        const thumbnailName = `${randomUUID()}-thumbnail${thumbnailExtension}`;

        try {
            await Promise.all([
                minioClient.putObject("videos", videoName, videoBuffer),
                minioClient.putObject("thumbnails", thumbnailName, thumbnailBuffer)
            ]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new HTTPError(`Error uploading files: ${errorMessage}`, 500);
        }

        return await prisma.video.create({
            data: {
                title,
                description,
                tags,
                videoPath: videoName,
                thumbnailPath: thumbnailName,
                authorId: userId
            }
        });
    }

    static async deleteVideo(videoId: string, userId: string) {
        const { videoPath, thumbnailPath } = await prisma.video.delete({
            where: { id: videoId, authorId: userId },
            select: { videoPath: true, thumbnailPath: true }
        });

        try {
            await Promise.all([
                minioClient.removeObject("videos", videoPath),
                minioClient.removeObject("thumbnails", thumbnailPath)
            ]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new HTTPError(`Error deleting files: ${errorMessage}`, 500);
        }
    }

    static async updateVideo(
        videoId: string,
        newVideoTitle: string,
        newVideoDescription: string,
        newVideoTags: string,
        userId: string
    ) {
        await prisma.video.update({
            where: { id: videoId, authorId: userId },
            data: { title: newVideoTitle, description: newVideoDescription, tags: newVideoTags }
        });
    }
}
