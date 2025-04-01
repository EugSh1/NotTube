"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useEffect, useRef, useState } from "react";

interface IProps {
    videoId: string;
    thumbnailPath: string;
    videoPath: string;
}

export default function VideoPlayer({ videoId, thumbnailPath, videoPath }: IProps) {
    const [isWatched, setIsWatched] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        function handleUpdateTime() {
            if (!video?.currentTime || !video.duration) return;

            if (video?.currentTime > video?.duration * 0.7 && !isWatched) {
                setIsWatched(true);
                apiFetch("/video/watched", {
                    method: "POST",
                    body: JSON.stringify({
                        videoId
                    })
                });
            }
        }

        video.addEventListener("timeupdate", handleUpdateTime);

        return () => {
            video.removeEventListener("timeupdate", handleUpdateTime);
        };
    }, [videoId, videoPath, isWatched]);

    return (
        <video
            ref={videoRef}
            className="rounded-lg aspect-video w-full object-cover"
            poster={thumbnailPath}
            src={videoPath}
            controls
            controlsList="nodownload"
        />
    );
}
