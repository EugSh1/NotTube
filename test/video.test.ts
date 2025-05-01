import { describe, expect, test, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { DELETE, GET, POST, PUT } from "@/app/api/video/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Video as IVideo } from "@prisma/client";
import * as getUserIdModule from "@/lib/getUserId";
import { mockTestVideo, mockVideoData } from "./utils";

beforeEach(() => {
    vi.spyOn(getUserIdModule, "getUserId").mockResolvedValue("test-user-id");
});

describe("GET /api/video", () => {
    let testVideoId1: string;
    let testVideoId2: string;

    beforeAll(async () => {
        await prisma.video.deleteMany();
        const createdVideos = await prisma.video.createManyAndReturn({
            data: [
                { title: "Test video 1", ...mockVideoData },
                { title: "Test video 2", ...mockVideoData },
                { title: "Test video 3", ...mockVideoData },
                { title: "Test video 4", ...mockVideoData, authorId: "another-test-user" },
                { title: "Test video 5", ...mockVideoData },
                { title: "Test video 6", ...mockVideoData },
                { title: "Test video 7", ...mockVideoData },
                { title: "Test video 8", ...mockVideoData },
                { title: "Test video 9", ...mockVideoData, authorId: "another-test-user" },
                { title: "Test video 10", ...mockVideoData }
            ]
        });
        testVideoId1 = createdVideos[0].id;
        testVideoId2 = createdVideos[1].id;
    });

    afterAll(async () => {
        await prisma.video.deleteMany();
    });

    test("Should return a list of videos correctly", async () => {
        const response = await GET(
            new NextRequest("http://localhost/api/video", {
                method: "GET"
            })
        );

        expect(response.status).toBe(200);
        const videos = await response.json();
        expect(videos.map(({ createdAt, ...rest }: IVideo) => ({ ...rest })).slice(0, 2)).toEqual([
            mockTestVideo(testVideoId1, "Test video 1"),
            mockTestVideo(testVideoId2, "Test video 2")
        ]);
    });

    test("Should return a number of videos equal to the specified limit", async () => {
        const response1 = await GET(
            new NextRequest(`http://localhost/api/video?limit=3`, {
                method: "GET"
            })
        );
        const videos1 = await response1.json();
        expect(videos1.length).toBe(3);

        const response2 = await GET(
            new NextRequest(`http://localhost/api/video?limit=5`, {
                method: "GET"
            })
        );
        const videos2 = await response2.json();
        expect(videos2.length).toBe(5);

        const response3 = await GET(
            new NextRequest(`http://localhost/api/video?limit=7`, {
                method: "GET"
            })
        );
        const videos3 = await response3.json();
        expect(videos3.length).toBe(7);
    });

    test("Should return video information correctly if id is passed", async () => {
        const response = await GET(
            new NextRequest(`http://localhost/api/video?id=${testVideoId1}`, {
                method: "GET"
            })
        );

        expect(response.status).toBe(200);
        const video = await response.json();
        const { createdAt, ...videoWithoutCreatedAt } = video;
        expect(videoWithoutCreatedAt).toEqual({
            ...mockTestVideo(testVideoId1, "Test video 1"),
            author: { id: "test-user-id", name: "test user", image: null },
            comments: []
        });
    });

    test("Should return an error if id is passed but such video does not exist", async () => {
        const request = new NextRequest("http://localhost/api/video?id=non-existent-video", {
            method: "GET"
        });

        const response = await GET(request);

        expect(response.status).toBe(404);
    });

    test("Should return a video for a search query", async () => {
        const response = await GET(
            new NextRequest(`http://localhost/api/video?searchQuery=1`, {
                method: "GET"
            })
        );
        const videos = await response.json();
        expect(videos.length).toBe(2); // Because the video titles "Test video 1" and "Test video 10" contain the number 1
    });

    test("Should return video by author id", async () => {
        const response = await GET(
            new NextRequest("http://localhost/api/video?authorId=test-user-id", {
                method: "GET"
            })
        );
        const videos = await response.json();
        expect(videos.length).toBe(8);
    });
});

describe("POST /api/video", () => {
    const mockVideo = new Blob([Buffer.alloc(1024 * 1024)], { type: "video/mp4" });
    const mockImage = new Blob([Buffer.alloc(100 * 1024)], { type: "image/png" });

    test("Should create videos correctly", async () => {
        const formData = new FormData();
        formData.append("file", mockVideo, "mock-video.mp4");
        formData.append("thumbnail", mockImage, "mock-image.png");
        formData.append("title", "Mock video title");
        formData.append("description", mockVideoData.description);
        formData.append("tags", "video coding code webdev");

        const response = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: formData
            })
        );

        expect(response.status).toBe(201);
        const video = await response.json();
        const { id, createdAt, ...videoWithoutCreatedAtAndId } = video;
        expect(videoWithoutCreatedAtAndId).toEqual({
            ...mockTestVideo(undefined, "Mock video title"),
            videoPath: video.videoPath,
            thumbnailPath: video.thumbnailPath
        });
        await prisma.video.delete({ where: { id } });
    });

    test("Should return an error if the video or thumbnail was not sent", async () => {
        const formData1 = new FormData();
        formData1.append("thumbnail", mockImage, "mock-image.png");
        formData1.append("title", "Mock video title");
        formData1.append("description", mockVideoData.description);
        formData1.append("tags", "video coding code webdev");

        const response1 = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: formData1
            })
        );

        expect(response1.status).toBe(400);
        const data1 = await response1.json();
        expect(data1).toEqual({ error: "The video was not sent" });

        const formData2 = new FormData();
        formData2.append("file", mockVideo, "mock-video.mp4");
        formData2.append("title", "Mock video title");
        formData2.append("description", mockVideoData.description);
        formData2.append("tags", "video coding code webdev");

        const response2 = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: formData2
            })
        );

        expect(response2.status).toBe(400);
        const data2 = await response2.json();
        expect(data2).toEqual({ error: "The thumbnail was not sent" });
    });

    test("Should return an error if text fields are invalid", async () => {
        const formData = new FormData();
        formData.append("file", mockVideo, "mock-video.mp4");
        formData.append("thumbnail", mockImage, "mock-image.png");
        formData.append("title", "L");

        const response = await POST(
            new NextRequest("http://localhost/api/video", {
                method: "POST",
                body: formData
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
            },
            {
                expected: "string",
                received: "null",
                message: "Expected string, received null"
            }
        ]);
    });
});

describe("DELETE /api/video", () => {
    let testVideoId1: string;
    let testVideoId2: string;

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

    test("Should delete videos correctly", async () => {
        const response = await DELETE(
            new NextRequest(`http://localhost/api/video?id=${testVideoId1}`, { method: "DELETE" })
        );

        expect(response.status).toBe(200);

        const foundVideo = await prisma.video.findUnique({ where: { id: testVideoId1 } });
        expect(!!foundVideo).toBe(false);
    });

    test("Should not delete videos that the user does not own", async () => {
        const response = await DELETE(
            new NextRequest(`http://localhost/api/video?id=${testVideoId2}`, { method: "DELETE" })
        );

        expect(response.status).toBe(500);

        const foundVideo = await prisma.video.findUnique({ where: { id: testVideoId2 } });
        expect(!!foundVideo).toBe(true);
    });

    test("Should return an error if the video id is not specified", async () => {
        const response = await DELETE(
            new NextRequest("http://localhost/api/video", { method: "DELETE" })
        );

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("id is required");
    });
});

describe("PUT /api/video", () => {
    let testVideoId1: string;
    let testVideoId2: string;

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

    test("Should update video correctly", async () => {
        const response = await PUT(
            new NextRequest(`http://localhost/api/video`, {
                method: "PUT",
                body: JSON.stringify({
                    videoId: testVideoId1,
                    newVideoTitle: "Updated test video 1 title",
                    newVideoDescription: "Updated description",
                    newVideoTags: "Updated tags"
                })
            })
        );

        expect(response.status).toBe(200);

        const updatedVideo = await prisma.video.findUnique({ where: { id: testVideoId1 } });

        const { createdAt, ...videoWithoutCreatedAt } = updatedVideo!;
        expect(videoWithoutCreatedAt).toEqual({
            ...mockTestVideo(testVideoId1, "Updated test video 1 title"),
            description: "Updated description",
            tags: "Updated tags"
        });
    });

    test("Should return an error if the user tries to edit a non-existent video", async () => {
        const response = await PUT(
            new NextRequest(`http://localhost/api/video`, {
                method: "PUT",
                body: JSON.stringify({
                    videoId: "non-existent-video-id",
                    newVideoTitle: "Updated test video 1 title",
                    newVideoDescription: "Updated description",
                    newVideoTags: "Updated tags"
                })
            })
        );

        expect(response.status).toBe(500);
    });

    test("Should not edit videos that the user does not own", async () => {
        const prevVideo = await prisma.video.findUnique({ where: { id: testVideoId2 } });

        const response = await PUT(
            new NextRequest(`http://localhost/api/video`, {
                method: "PUT",
                body: JSON.stringify({
                    videoId: testVideoId2,
                    newVideoTitle: "Updated test video 2 title",
                    newVideoDescription: "Updated description",
                    newVideoTags: "Updated tags"
                })
            })
        );

        expect(response.status).toBe(500);

        const video = await prisma.video.findUnique({ where: { id: testVideoId2 } });

        expect(prevVideo).toEqual(video);
    });

    test("Should return an error if invalid data is sent.", async () => {
        const response = await PUT(
            new NextRequest(`http://localhost/api/video`, {
                method: "PUT",
                body: JSON.stringify({
                    videoId: "S",
                    newVideoTitle: "",
                    newVideoDescription: 37,
                    newVideoTags: ""
                })
            })
        );

        expect(response.status).toBe(400);
        const data = await response.json();
        const errors = data.details.map(
            ({ code, path, exact, inclusive, ...rest }: Record<string, string>) => ({
                ...rest
            })
        );
        expect(errors).toEqual([
            {
                minimum: 1,
                type: "string",
                message: "Video title is required"
            },
            {
                expected: "string",
                received: "number",
                message: "Expected string, received number"
            },
            {
                minimum: 1,
                type: "string",
                message: "Video tags are required"
            }
        ]);
    });
});
