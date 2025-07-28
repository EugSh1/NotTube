import { Video as IVideo } from "@prisma/client";
import { cn } from "@/lib/utils";
import VideoCard from "@/components/VideoCard";
import { apiFetch } from "@/lib/apiFetch";
import NoResults from "@/components/NoResults";
import type { Metadata } from "next";
import { formatPageTitle } from "@/lib/formatPageTitle";

interface IProps {
    searchParams?: Promise<{ search_query?: string }>;
}

export async function generateMetadata({ searchParams }: Readonly<IProps>): Promise<Metadata> {
    const searchQuery = (await searchParams)?.search_query ?? "";

    return {
        title: formatPageTitle(searchQuery)
    };
}

export default async function ResultsPage({ searchParams }: Readonly<IProps>) {
    const searchQuery = (await searchParams)?.search_query ?? "";

    const {
        data: videos,
        success,
        error
    } = await apiFetch<IVideo[]>(`/video?searchQuery=${searchQuery}`);

    if (!success) {
        return (
            <p className="text-primary font-medium">Error: {error || "Failed to fetch videos"}</p>
        );
    }

    return (
        <main className={cn("w-full px-3", !videos?.length && "min-h-screen")}>
            {videos?.length ? (
                <div className="flex flex-col gap-1.5">
                    {videos.map((video) => (
                        <VideoCard key={video.id} variant="big" video={video} />
                    ))}
                </div>
            ) : (
                <NoResults />
            )}
        </main>
    );
}
