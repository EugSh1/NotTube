"use client";

import { Share } from "lucide-react";
import { Button } from "./ui/button";
import { IVideoWithAuthor } from "@/types";
import { toast } from "sonner";

interface IProps {
    video: IVideoWithAuthor;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default function ShareVideoButton({ video }: IProps) {
    const { id, title, description } = video;

    async function handleShareVideo() {
        if (!navigator.share) {
            toast.error("Web Share API is not supported in this browser.");
            return;
        }

        try {
            await navigator.share({
                title,
                text: `${title}\n${description.slice(0, 100)}...\n${baseUrl}/video/${id}`,
                url: `${baseUrl}/video/${id}`
            });
        } catch {}
    }

    return (
        <Button variant="outline" className="flex gap-1.5 rounded-3xl" onClick={handleShareVideo}>
            <Share className="w-8 h-8" />
            <span className="text-lg font-semibold">Share</span>
        </Button>
    );
}
