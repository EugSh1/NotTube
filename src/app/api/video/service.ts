import prisma from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";

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
        return await prisma.video.findUnique({
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

        const uploadsDir = path.join(process.cwd(), "uploads");
        const videoName = `${randomUUID()}-video.mp4`;
        const videoPath = path.join(uploadsDir, videoName);
        const thumbnailExtension = path.extname(thumbnail.name);
        const thumbnailName = `${randomUUID()}-thumbnail${thumbnailExtension}`;
        const thumbnailPath = path.join(uploadsDir, thumbnailName);

        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        await writeFile(videoPath, videoBuffer);
        await writeFile(thumbnailPath, thumbnailBuffer);

        return await prisma.video.create({
            data: {
                title,
                description,
                tags,
                videoPath: `/uploads/${videoName}`,
                thumbnailPath: `/uploads/${thumbnailName}`,
                authorId: userId
            }
        });
    }

    static async deleteVideo(videoId: string, userId: string) {
        const video = await prisma.video.delete({
            where: { id: videoId, authorId: userId },
            select: { videoPath: true, thumbnailPath: true }
        });

        const videoPath = path.join(process.cwd(), video.videoPath);
        const thumbnailPath = path.join(process.cwd(), video.thumbnailPath);

        await Promise.all([unlink(videoPath), unlink(thumbnailPath)]);
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
