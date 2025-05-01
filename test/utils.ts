import { Video as IVideo } from "@prisma/client";
import { minioClient } from "@/lib/minioClient";
import prisma from "@/lib/prisma";

async function clearBucketObjects(bucketName: string): Promise<void> {
    const objectsToDelete: string[] = [];

    const objectsStream = minioClient.listObjects(bucketName, "", true);
    for await (const obj of objectsStream) {
        if (obj.name) {
            objectsToDelete.push(obj.name);
        }
    }

    if (objectsToDelete.length > 0) {
        await minioClient.removeObjects(bucketName, objectsToDelete);
    }
}

export const mockVideoData: Pick<
    IVideo,
    "description" | "videoPath" | "thumbnailPath" | "authorId" | "tags"
> = {
    description: "Mock video description",
    videoPath: "mock-video.mp4",
    thumbnailPath: "mock-thumbnail.png",
    authorId: "test-user-id",
    tags: "video coding code webdev"
};

type VideoWithoutCreatedAtAndWithOptionalId = Omit<IVideo, "createdAt" | "id"> &
    Partial<Pick<IVideo, "id">>;

export function mockTestVideo(id: string | undefined, title: string) {
    const video: VideoWithoutCreatedAtAndWithOptionalId = {
        title,
        description: mockVideoData.description,
        tags: mockVideoData.tags,
        views: 0,
        likes: 0,
        videoPath: "mock-video.mp4",
        thumbnailPath: "mock-thumbnail.png",
        authorId: "test-user-id"
    };

    if (id !== undefined) {
        video.id = id;
    }

    return video;
}

export async function clearBuckets() {
    await Promise.all([clearBucketObjects("videos"), clearBucketObjects("thumbnails")]);
}

export async function createMockUsers() {
    await prisma.user.createMany({
        data: [
            { id: "test-user-id", name: "test user" },
            { id: "another-test-user", name: "another test user" }
        ]
    });
}

export async function deleteMockUsers() {
    await prisma.user.deleteMany({ where: { id: { in: ["test-user-id", "another-test-user"] } } });
}
