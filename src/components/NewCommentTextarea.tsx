"use client";

import { ChangeEvent, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface IProps {
    videoId: string;
    isAuthenticated: boolean;
}

export default function NewCommentTextarea({ videoId, isAuthenticated }: IProps) {
    const [newComment, setNewComment] = useState<string>("");
    const router = useRouter();

    async function handleSendComment() {
        const trimmedComment = newComment.trim();
        if (!trimmedComment) return;

        const { success, error } = await apiFetch("/video/comment", {
            method: "POST",
            body: JSON.stringify({ message: trimmedComment, videoId })
        });

        if (success) {
            setNewComment("");
            router.refresh();
        } else {
            toast.error(`Error posting comment: ${error}`);
        }
    }

    return (
        <div>
            <Textarea
                value={newComment}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setNewComment(event.target.value)
                }
                className="my-1.5"
                placeholder={isAuthenticated ? "Add a comment..." : "Sign in to add a comment"}
                disabled={!isAuthenticated}
            />
            <Button onClick={handleSendComment} disabled={!newComment.trim()} className="mb-1">
                Comment
            </Button>
        </div>
    );
}
