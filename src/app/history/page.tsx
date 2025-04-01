import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";
import NoResults from "@/components/NoResults";
import { IWatchedVideo } from "@/types";
import VideoCard from "@/components/VideoCard";

export default async function HistoryPage() {
    const { data: videos, success, error } = await apiFetch<IWatchedVideo[]>(`/video/watched`);

    if (!success) {
        return (
            <p className="text-primary font-medium">Error: {error || "Failed to fetch history"}</p>
        );
    }

    return (
        <main className={cn("w-full px-3", !videos?.length && "min-h-screen")}>
            <h2 className="text-2xl font-semibold mb-1">Your watch history</h2>
            {videos?.length ? (
                <div className="flex flex-col gap-1.5">
                    {videos.map(({ video }) => (
                        <VideoCard key={video.id} variant="big" video={video} />
                    ))}
                </div>
            ) : (
                <NoResults />
            )}
        </main>
    );
}
