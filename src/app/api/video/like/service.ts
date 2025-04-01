import prisma from "@/lib/prisma";

export class LikedVideoService {
    static async isVideoLiked(userId: string, videoId: string) {
        const likedVideo = await prisma.likedVideo.findUnique({
            where: { userId_videoId: { userId, videoId } }
        });
        return !!likedVideo;
    }

    static async addLikeToVideo(userId: string, videoId: string) {
        await prisma.likedVideo.create({
            data: { userId, videoId }
        });

        await prisma.video.update({
            where: { id: videoId },
            data: {
                likes: {
                    increment: 1
                }
            }
        });
    }

    static async removeLikeToVideo(userId: string, videoId: string) {
        await prisma.likedVideo.delete({
            where: { userId_videoId: { userId, videoId } }
        });

        await prisma.video.update({
            where: { id: videoId },
            data: {
                likes: {
                    decrement: 1
                }
            }
        });
    }
}
