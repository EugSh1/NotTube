import { describe, expect, test, beforeAll, afterAll, beforeEach, vi } from "vitest";
import prisma from "@/lib/prisma";
import * as getUserIdModule from "@/lib/getUserId";
import { mockVideoData } from "./utils";
import { NextRequest } from "next/server";
import { afterEach } from "node:test";
import { GET, POST } from "@/app/api/video/like/route";

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
    await prisma.likedVideo.deleteMany();
});

describe("GET /api/video/like", () => {
    beforeAll(async () => {
        await prisma.likedVideo.create({
            data: { userId: "test-user-id", videoId: testVideoId1 }
        });

        await prisma.video.update({
            where: { id: testVideoId1 },
            data: {
                likes: {
                    increment: 1
                }
            }
        });

        await prisma.likedVideo.create({
            data: { userId: "another-test-user", videoId: testVideoId2 }
        });

        await prisma.video.update({
            where: { id: testVideoId2 },
            data: {
                likes: {
                    increment: 1
                }
            }
        });
    });

    test("Should return whether the video was liked by the user", async () => {
        const response1 = await GET(
            new NextRequest(`http://localhost/api/video/like?id=${testVideoId1}`, {
                method: "GET"
            })
        );

        expect(response1.status).toBe(200);
        const { isLiked: isLiked1 } = await response1.json();
        expect(isLiked1).toBe(true);

        const response2 = await GET(
            new NextRequest(`http://localhost/api/video/like?id=${testVideoId2}`, {
                method: "GET"
            })
        );

        expect(response2.status).toBe(200);
        const { isLiked: isLiked2 } = await response2.json();
        expect(isLiked2).toBe(false);
    });

    test("Should return an error if the video id is not specified", async () => {
        const response = await GET(
            new NextRequest("http://localhost/api/video/like", {
                method: "GET"
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
                received: "null",
                message: "Expected string, received null"
            }
        ]);
    });
});

describe("POST /api/video/like", () => {
    test("Should toggle video like correctly", async () => {
        for (let i = 0; i <= 1; i++) {
            const prevVideo = await prisma.video.findUnique({
                where: { id: testVideoId1 }
            });
            const prevIsLiked = !!(await prisma.likedVideo.findUnique({
                where: { userId_videoId: { userId: "test-user-id", videoId: testVideoId1 } }
            }));

            const response = await POST(
                new NextRequest("http://localhost/api/like", {
                    method: "POST",
                    body: JSON.stringify({
                        videoId: testVideoId1
                    })
                })
            );

            expect(response.status).toBe(200);

            const isLiked = !!(await prisma.likedVideo.findUnique({
                where: { userId_videoId: { userId: "test-user-id", videoId: testVideoId1 } }
            }));

            expect(isLiked).toBe(!prevIsLiked);

            const video = await prisma.video.findUnique({
                where: { id: testVideoId1 }
            });

            if (isLiked) {
                expect(video?.likes).toBe(prevVideo!.likes + 1);
            } else {
                expect(video?.likes).toBe(prevVideo!.likes - 1);
            }
        }
    });

    test("Should return an error if the video id was not specified", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/like", {
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

    test("Should return an error message if the user tries to like a video that does not exist", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/like", {
                method: "POST",
                body: JSON.stringify({
                    videoId: "non-existent-video-id"
                })
            })
        );

        expect(response.status).toBe(500);
    });
});
