import { describe, expect, test, beforeAll, afterAll, beforeEach, vi } from "vitest";
import prisma from "@/lib/prisma";
import { Comment as IComment } from "@prisma/client";
import * as getUserIdModule from "@/lib/getUserId";
import { mockVideoData } from "./utils";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/video/comment/route";

let testVideoId: string;

beforeEach(() => {
    vi.spyOn(getUserIdModule, "getUserId").mockResolvedValue("test-user-id");
});

beforeAll(async () => {
    await prisma.video.deleteMany();
    const createdVideo = await prisma.video.create({
        data: { title: "Test video 1", ...mockVideoData }
    });
    testVideoId = createdVideo.id;
});

afterAll(async () => {
    await prisma.comment.deleteMany();
});

describe("POST /api/video/like", () => {
    test("Should create a comment correctly", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/comment", {
                method: "POST",
                body: JSON.stringify({
                    videoId: testVideoId,
                    message: "Test comment"
                })
            })
        );

        expect(response.status).toBe(201);

        const video = await prisma.video.findUnique({
            where: { id: testVideoId },
            select: { comments: true }
        });

        console.log(video);
        expect(
            video?.comments.map(({ id, createdAt, ...rest }: IComment) => ({
                ...rest
            }))
        ).toEqual([
            {
                message: "Test comment",
                authorId: "test-user-id",
                videoId: testVideoId
            }
        ]);
    });

    test("Should return an error if the video id or message was not specified", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/comment", {
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
            { expected: "string", received: "undefined", message: "Required" },
            { expected: "string", received: "undefined", message: "Required" }
        ]);
    });

    test("Should return an error message if the user tries to comment a video that does not exist", async () => {
        const response = await POST(
            new NextRequest("http://localhost/api/comment", {
                method: "POST",
                body: JSON.stringify({
                    videoId: "non-existent-video-id",
                    message: "Test comment"
                })
            })
        );

        expect(response.status).toBe(500);
    });
});
