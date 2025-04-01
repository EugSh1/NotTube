"use client";

import { ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatBigNumber } from "@/lib/formatVideoStats";
import { ComponentProps } from "react";

interface IProps extends ComponentProps<"button"> {
    videoId: string;
    likes: number;
    isLiked: boolean;
}

export default function LikeVideoButton({ videoId, likes, isLiked, ...props }: IProps) {
    const router = useRouter();

    async function handleLikeVideo() {
        const { success, error } = await apiFetch("/video/like", {
            method: "POST",
            body: JSON.stringify({
                videoId
            })
        });

        if (!success) {
            toast.error(error);
        } else {
            router.refresh();
        }
    }

    return (
        <Button
            variant="outline"
            className="flex gap-1.5 rounded-3xl"
            onClick={handleLikeVideo}
            {...props}
        >
            <ThumbsUp
                className="w-8 h-8 tabular-nums"
                fill={isLiked ? "var(--foreground)" : undefined}
            />
            <span className="text-lg font-semibold">{formatBigNumber(likes)}</span>
        </Button>
    );
}
