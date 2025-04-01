import { cn } from "@/lib/utils";
import VideoCard from "@/components/VideoCard";
import { apiFetch } from "@/lib/apiFetch";
import Image from "next/image";
import { IVideoWithAuthor } from "@/types";
import NoResults from "@/components/NoResults";

export default async function VideoPage({ params }: { params: Promise<{ authorId: string }> }) {
    const { authorId } = await params;

    const {
        data: videos,
        success,
        error
    } = await apiFetch<IVideoWithAuthor[]>(`/video?authorId=${authorId}`);

    if (!success) {
        return (
            <p className="text-primary font-medium">
                Error: {error || "Failed to fetch channel videos"}
            </p>
        );
    }

    return (
        <main className={cn("w-full px-3", !videos?.length && "min-h-screen")}>
            {videos?.length ? (
                <>
                    <div className="flex items-center gap-2 my-1 py-3">
                        {videos[0].author.image && (
                            <Image
                                className="rounded-full"
                                src={videos[0].author.image}
                                alt={videos[0].author.name}
                                width={85}
                                height={85}
                            />
                        )}
                        <h2 className="font-semibold text-xl">{videos[0].author.name}</h2>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {videos.map((video) => (
                            <VideoCard key={video.id} variant="big" video={video} />
                        ))}
                    </div>
                </>
            ) : (
                <NoResults />
            )}
        </main>
    );
}
