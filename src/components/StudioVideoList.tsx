"use client";

import { Video as IVideo } from "@prisma/client";
import StudioVideoContextMenu from "./StudioVideoContextMenu";
import VideoCard from "./VideoCard";
import { useState } from "react";
import StudioEditVideoDialog from "./StudioEditVideoDialog";

interface IProps {
    videos: IVideo[];
}

export default function StudioVideoList({ videos }: IProps) {
    const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);

    return (
        <>
            {videos.length ? (
                videos
                    .sort((a, b) => (a.views === b.views ? 0 : a.views > b.views ? -1 : 1))
                    .map((video) => (
                        <StudioVideoContextMenu
                            key={video.id}
                            video={video}
                            selectVideoFn={(video) => setSelectedVideo(video)}
                        >
                            <VideoCard
                                variant="tiny"
                                video={video}
                                className="hover:bg-secondary/70 p-2 rounded-xl transition select-none"
                            />
                        </StudioVideoContextMenu>
                    ))
            ) : (
                <p className="text-muted-foreground font-medium">No videos yet!</p>
            )}

            <StudioEditVideoDialog
                selectedVideo={selectedVideo}
                closeFn={() => setSelectedVideo(null)}
            />
        </>
    );
}
