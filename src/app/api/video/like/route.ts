import { getUserId } from "@/lib/getUserId";
import respondWithError from "@/lib/respondWithError";
import { NextRequest, NextResponse } from "next/server";
import { getVideoLikeSchema, toggleVideoLikeSchema } from "./schema";
import { LikedVideoService } from "./service";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const videoId = searchParams.get("id");
        const { id } = getVideoLikeSchema.parse({ id: videoId });

        const userId = await getUserId();
        const isVideoLiked = await LikedVideoService.isVideoLiked(userId, id);

        return NextResponse.json({ isLiked: isVideoLiked });
    } catch (error) {
        return respondWithError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { videoId } = toggleVideoLikeSchema.parse(data);
        const userId = await getUserId();

        if (await LikedVideoService.isVideoLiked(userId, videoId)) {
            await LikedVideoService.removeLikeToVideo(userId, videoId);
        } else {
            await LikedVideoService.addLikeToVideo(userId, videoId);
        }

        return NextResponse.json({ message: "success" });
    } catch (error) {
        return respondWithError(error);
    }
}
