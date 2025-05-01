import { describe, expect, test, beforeAll, afterAll, beforeEach, vi } from "vitest";
import prisma from "@/lib/prisma";
import * as getUserIdModule from "@/lib/getUserId";
import { mockVideoData } from "./utils";
import { GET, POST } from "@/app/api/video/watched/route";
import { IWatchedVideo } from "@/types";
import { NextRequest } from "next/server";
import { afterEach } from "node:test";

let testVideoId1: string;
let testVideoId2: string;

beforeEach(() => {
    vi.spyOn(getUserIdModule, "getUserId").mockResolvedValue("test-user-id");
});

beforeAll(async () => {
    await prisma.video.deleteMany();
    const createdVideos = await prisma.video.createManyAndReturn({
        data: [
            { title: "Test video 1", ...mockVideoData },
            { title: "Test video 2", ...mockVideoData, authorId: "another-test-user" }
        ]
    });
    testVideoId1 = createdVideos[0].id;
    testVideoId2 = createdVideos[1].id;
});

afterAll(async () => {
    await prisma.video.deleteMany();
});

afterEach(async () => {
    await prisma.watchedVideo.deleteMany();
});

describe("GET /api/video/watched", () => {
    beforeAll(async () => {
        await prisma.watchedVideo.create({
            data: { userId: "test-user-id", videoId: testVideoId1 }
        });

        await prisma.video.update({
            where: { id: testVideoId1 },
            data: {
                views: {
                    increment: 1
                }
            }
        });

        await prisma.watchedVideo.create({
            data: { userId: "another-test-user", videoId: testVideoId2 }
        });

        await prisma.video.update({
            where: { id: testVideoId2 },
            data: {
                views: {
                    increment: 1
                }
            }
        });
    });

    test("Should get the user's viewed videos correctly", async () => {
        const response = await GET();

        expect(response.status).toBe(200);
        const watchedVideos = await response.json();
        expect(
            watchedVideos.map(
                ({ watchedAt, video: { createdAt, ...videoRest }, ...rest }: IWatchedVideo) => ({
                    ...rest,
                    ...videoRest
                })
            )
        ).toEqual([
            {
                userId: "test-user-id",
                videoId: testVideoId1,
                id: testVideoId1,
                title: "Test video 1",
                description: "Mock video description",
                tags: "video coding code webdev",
                views: 1,
                likes: 0,
                videoPath: "mock-video.mp4",
                thumbnailPath: "mock-thumbnail.png",
                authorId: "test-user-id"
            }
        ]);
    });
});

describe("POST /api/video/watched", () => {
    test("Should add videos to watched correctly", async () => {
        const prevVideo = await prisma.video.findUnique({
            where: { id: testVideoId2 }
        });

        const response = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: JSON.stringify({
                    videoId: testVideoId2
                })
            })
        );

        expect(response.status).toBe(201);

        const watchedVideo = await prisma.watchedVideo.findUnique({
            where: { userId_videoId: { userId: "test-user-id", videoId: testVideoId2 } }
        });
        expect(!!watchedVideo).toBe(true);

        const video = await prisma.video.findUnique({
            where: { id: testVideoId2 }
        });

        expect(video?.views).toBe(prevVideo!.views + 1);
    });

    test("Should return a message if the video has already been viewed by the user and should not increment the view counter", async () => {
        await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: JSON.stringify({
                    videoId: testVideoId2
                })
            })
        );

        const prevVideo = await prisma.video.findUnique({
            where: { id: testVideoId2 }
        });

        const response = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: JSON.stringify({
                    videoId: testVideoId2
                })
            })
        );

        const video = await prisma.video.findUnique({
            where: { id: testVideoId2 }
        });

        const data = await response.json();
        expect(data).toEqual({ message: "video is already watched by user" });
        expect(video?.views).toBe(prevVideo!.views);
    });

    test("Should return an error if the video id was not specified", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: JSON.stringify({})
            })
        );

        expect(response.status).toBe(400);
        const data = await response.json();
        const errors = data.details.map(({ code, path, ...rest }: Record<string, string>) => ({
            ...rest
        }));
        expect(errors).toEqual([
            {
                expected: "string",
                message: "Required",
                received: "undefined"
            }
        ]);
    });

    test("Should return an error message if the user tries to watch a video that does not exist", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: JSON.stringify({
                    videoId: "non-existent-video-id"
                })
            })
        );

        expect(response.status).toBe(500);
    });
});
