import HTTPError from "@/lib/httpError";
import prisma from "@/lib/prisma";

export class WatchedVideoService {
    static async isVideoWatched(userId: string, videoId: string) {
        const watchedVideo = await prisma.watchedVideo.findUnique({
            where: { userId_videoId: { userId, videoId } }
        });
        return !!watchedVideo;
    }

    static async getWatchedVideos(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                watchedVideos: {
                    include: { video: true },
                    orderBy: { watchedAt: "desc" }
                }
            }
        });

        if (!user) {
            throw new HTTPError("User not found", 404);
        }

        return user.watchedVideos;
    }

    static async markVideoAsWatched(userId: string, videoId: string) {
        await prisma.watchedVideo.create({
            data: { userId, videoId }
        });

        await prisma.video.update({
            where: { id: videoId },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    }
}
