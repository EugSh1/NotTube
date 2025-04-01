import { getUserId } from "@/lib/getUserId";
import respondWithError from "@/lib/respondWithError";
import { NextRequest, NextResponse } from "next/server";
import { createWatchedVideoSchema } from "./schema";
import { WatchedVideoService } from "./service";

export async function GET() {
    try {
        const userId = await getUserId();
        const watchedVideos = await WatchedVideoService.getWatchedVideos(userId);

        return NextResponse.json(watchedVideos);
    } catch (error) {
        return respondWithError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { videoId } = createWatchedVideoSchema.parse(data);
        const userId = await getUserId();

        if (await WatchedVideoService.isVideoWatched(userId, videoId)) {
            return NextResponse.json({ message: "video is already watched by user" });
        }

        await WatchedVideoService.markVideoAsWatched(userId, videoId);

        return NextResponse.json({ message: "success" }, { status: 201 });
    } catch (error) {
        return respondWithError(error);
    }
}
