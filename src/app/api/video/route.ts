import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "./service";
import HTTPError from "@/lib/httpError";
import { getUserId } from "@/lib/getUserId";
import respondWithError from "@/lib/respondWithError";
import { createVideoSchema, updateVideoSchema } from "./schema";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const searchQuery = searchParams.get("searchQuery")?.toLowerCase();
        const id = searchParams.get("id");
        const authorId = searchParams.get("authorId");
        const limitParam = searchParams.get("limit");

        const limit = limitParam ? parseInt(limitParam) : undefined;
        const take = limit && !isNaN(limit) ? limit : undefined;

        if (authorId) {
            const foundVideos = await VideoService.getVideosByAuthorId(authorId);
            return NextResponse.json(foundVideos);
        }

        if (id) {
            const foundVideo = await VideoService.getVideoById(id);
            return NextResponse.json(foundVideo);
        }

        if (searchQuery) {
            const foundVideos = await VideoService.searchVideos(searchQuery, take);
            return NextResponse.json(foundVideos);
        }

        const foundVideos = await VideoService.getVideos(take);
        return NextResponse.json(foundVideos);
    } catch (error) {
        return respondWithError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId();

        const formData = await req.formData();
        const video = formData.get("file") as File;
        const thumbnail = formData.get("thumbnail") as File;

        const { title, description, tags } = createVideoSchema.parse({
            title: formData.get("title"),
            description: formData.get("description"),
            tags: formData.get("tags")
        });

        if (!video) {
            throw new HTTPError("The video was not sent", 400);
        }

        if (!thumbnail) {
            throw new HTTPError("The thumbnail was not sent", 400);
        }

        const newVideo = await VideoService.createVideo(
            title,
            description,
            tags,
            video,
            thumbnail,
            userId
        );

        return NextResponse.json(newVideo, { status: 201 });
    } catch (error) {
        return respondWithError(error);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const id = searchParams.get("id");
        const userId = await getUserId();

        if (!id) {
            throw new HTTPError("id is required", 400);
        }

        await VideoService.deleteVideo(id, userId);

        return NextResponse.json({ message: "success" });
    } catch (error) {
        return respondWithError(error);
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { videoId, newVideoTitle, newVideoDescription, newVideoTags } =
            updateVideoSchema.parse(data);
        const userId = await getUserId();

        await VideoService.updateVideo(
            videoId,
            newVideoTitle,
            newVideoDescription,
            newVideoTags,
            userId
        );

        return NextResponse.json({ message: "success" });
    } catch (error) {
        return respondWithError(error);
    }
}
