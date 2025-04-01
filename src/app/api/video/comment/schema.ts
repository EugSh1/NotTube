import { z } from "zod";

export const newCommentSchema = z.object({
    videoId: z.string().min(1, "Video ID is required"),
    message: z.string().min(1, "Message is required")
});
