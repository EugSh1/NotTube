import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import VideoCard from "@/components/VideoCard";
import { Metadata } from "next";
import Image from "next/image";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { IVideoWithAuthor } from "@/types";
import { Video as IVideo } from "@prisma/client";
import VideoPlayer from "@/components/VideoPlayer";
import { SessionProvider } from "next-auth/react";
import { formatViews } from "@/lib/formatVideoStats";
import ShareVideoButton from "@/components/ShareVideoButton";
import NewCommentTextarea from "@/components/NewCommentTextarea";
import LikeVideoButton from "@/components/LikeVideoButton";
import { toast } from "sonner";

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const { data: video, success } = await apiFetch<IVideoWithAuthor>(`/video?id=${id}`);

    if (!success || !video) {
        return {
            title: "Video not found"
        };
    }

    return {
        title: video.title,
        description: video.description,
        keywords: video.tags.trim().split(" "),
        openGraph: {
            title: video.title,
            description: video.description,
            type: "video.other",
            images: [video.thumbnailPath]
        }
    };
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: video, success: videoSuccess } = await apiFetch<IVideoWithAuthor>(
        `/video?id=${id}`
    );

    if (!videoSuccess || !video) {
        return <p>Error</p>;
    }

    const { data: nextVideos, success: nextVideosSuccess } = await apiFetch<IVideo[]>(
        `/video?searchQuery=${video.tags}&limit=25`
    );
    const { data: isLikedResponse, success: isLikedSuccess } = await apiFetch<{ isLiked: boolean }>(
        `/video/like?id=${video.id}`
    );

    if (!nextVideosSuccess) {
        toast.error("Error fetching next videos");
    }

    return (
        <main className="grid grid-cols-1 md:grid-cols-3 gap-1.5 px-1.5">
            <section className="col-span-2">
                <SessionProvider>
                    <VideoPlayer
                        videoId={id}
                        thumbnailPath={video.thumbnailPath}
                        videoPath={video.videoPath}
                    />
                </SessionProvider>
                <div className="flex justify-between items-center mt-1">
                    <h3 className="font-semibold text-lg">{video.title}</h3>
                    <div className="flex gap-1.5">
                        <LikeVideoButton
                            videoId={video.id}
                            likes={video.likes}
                            isLiked={isLikedResponse?.isLiked || false}
                            disabled={!isLikedSuccess}
                        />
                        <ShareVideoButton video={video} />
                    </div>
                </div>
                <Link
                    href={`/channel/${video.authorId}`}
                    className="flex items-center gap-2 my-1 w-min"
                >
                    {video.author.image && (
                        <Image
                            className="rounded-full"
                            src={video.author.image}
                            alt={video.author.name}
                            width={45}
                            height={45}
                        />
                    )}
                    <h2 className="font-semibold text-lg">{video.author.name}</h2>
                </Link>
                <div className="bg-secondary rounded-md p-2 mb-2.5">
                    <p className="font-medium">{video.description}</p>
                    <p className="text-muted-foreground">
                        {formatViews(video.views)} •{" "}
                        {formatDistanceToNow(new Date(video.createdAt), {
                            addSuffix: true,
                            locale: enUS
                        })}
                    </p>
                </div>
                <h3 className="text-lg font-semibold">Comments:</h3>
                <NewCommentTextarea videoId={id} isAuthenticated={isLikedSuccess} />
                <div className="flex flex-col gap-1.5">
                    {video.comments.map(({ id, author, message, createdAt }) => (
                        <div className="bg-secondary rounded-md p-2 flex gap-1.5" key={id}>
                            {author.image && (
                                <Image
                                    className="rounded-full w-9 h-9 mt-1"
                                    src={author.image}
                                    alt={author.image}
                                    width={36}
                                    height={36}
                                />
                            )}
                            <div className="flex-grow">
                                <div className="flex gap-2 items-center">
                                    <h3 className="text-lg font-semibold">{author.name}</h3>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {formatDistanceToNow(new Date(createdAt), {
                                            addSuffix: true,
                                            locale: enUS
                                        })}
                                    </p>
                                </div>
                                <p>{message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="col-span-1">
                <div className="flex flex-col gap-3">
                    {nextVideos
                        ?.filter((v) => v.id !== video.id)
                        .map((video) => (
                            <VideoCard key={video.id} variant="medium" video={video} />
                        ))}
                </div>
            </section>
        </main>
    );
}
