import { z } from "zod";

export const updateVideoSchema = z.object({
    videoId: z.string().min(1, "Video ID is required"),
    newVideoTitle: z.string().min(1, "Video title is required"),
    newVideoDescription: z.string(),
    newVideoTags: z.string().min(1, "Video tags are required")
});

export const createVideoSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    tags: z.string()
});
