"use client";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger
} from "@/components/ui/context-menu";
import { apiFetch } from "@/lib/apiFetch";
import { Video as IVideo } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { toast } from "sonner";

interface IProps {
    video: IVideo;
    children: ReactNode;
    selectVideoFn: (video: IVideo) => void;
}

export default function StudioVideoContextMenu({ video, children, selectVideoFn }: IProps) {
    const router = useRouter();

    async function handleDeleteVideo() {
        if (!confirm("Are you sure you want to delete the video?")) return;
        const { success, error } = await apiFetch(`/video?id=${video.id}`, {
            method: "DELETE"
        });

        if (success) {
            toast.success("Video successfully deleted");
        } else {
            toast.error(`Error deleting video: ${error}`);
        }
        router.refresh();
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onSelect={() => router.push(`/video/${video.id}`)}>
                    Watch
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => selectVideoFn(video)}>Edit</ContextMenuItem>
                <ContextMenuItem onSelect={handleDeleteVideo}>Delete</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
