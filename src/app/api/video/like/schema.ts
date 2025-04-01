import { z } from "zod";

export const getVideoLikeSchema = z.object({
    id: z.string().min(1, "Video ID is required")
});

export const toggleVideoLikeSchema = z.object({
    videoId: z.string().min(1, "Video ID is required")
});
