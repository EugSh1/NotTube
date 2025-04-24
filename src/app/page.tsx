import { Video as IVideo } from "@prisma/client";
import VideoCard from "@/components/VideoCard";
import { apiFetch } from "@/lib/apiFetch";
import type { Metadata } from "next";
import { formatPageTitle } from "@/lib/formatPageTitle";

export const metadata: Metadata = {
    title: formatPageTitle("Home")
};

export const revalidate = 0;

export default async function Home() {
    const { data: videos, success, error } = await apiFetch<IVideo[]>("/video?limit=100");

    if (!success) {
        return <p>Something went wrong: {error}</p>;
    }

    return (
        <main className="px-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {videos?.map((video) => (
                <VideoCard key={video.id} variant="small" video={video} />
            ))}
        </main>
    );
}
