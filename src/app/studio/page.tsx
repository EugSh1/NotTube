import { auth } from "@/auth";
import StudioVideoList from "@/components/StudioVideoList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VideoCard from "@/components/VideoCard";
import { apiFetch } from "@/lib/apiFetch";
import { formatPageTitle } from "@/lib/formatPageTitle";
import { formatBigNumber } from "@/lib/formatVideoStats";
import { IVideoWithAuthor } from "@/types";
import { FileVideo2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: formatPageTitle("Studio")
};

export default async function StudioPage() {
    const session = await auth();
    const {
        data: videos,
        success,
        error
    } = await apiFetch<IVideoWithAuthor[]>(`/video?authorId=${session?.user?.id}`);

    if (!success || !videos) {
        return (
            <p className="text-primary font-medium">Error: {error || "Failed to fetch videos"}</p>
        );
    }

    const totalViews = videos.reduce((totalViews, video) => totalViews + video.views, 0);

    const NoVideos = <p className="text-muted-foreground font-medium">No videos yet!</p>;

    return (
        <main className="px-3 pb-3">
            <div className="flex justify-between items-center py-2">
                <h2 className="text-lg font-semibold">Channel dashboard</h2>
                <Link href="/video/new">
                    <Button
                        variant="outline"
                        className="rounded-full"
                        size="icon"
                        title="Upload New Video"
                    >
                        <FileVideo2 />
                    </Button>
                </Link>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                <Card className="col-span-full md:col-span-1">
                    <CardHeader>
                        <CardTitle>Total Views</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-full">
                        <h1 className="text-4xl font-semibold">{formatBigNumber(totalViews)}</h1>
                    </CardContent>
                </Card>

                <Card className="col-span-full md:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Latest Videos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {videos.length
                            ? videos
                                  .slice(0, 3)
                                  .map((video) => (
                                      <VideoCard key={video.id} variant="tiny" video={video} />
                                  ))
                            : NoVideos}
                    </CardContent>
                </Card>

                <Card className="col-span-full md:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Most Popular Videos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {videos.length
                            ? videos
                                  .toSorted((a, b) => b.views - a.views)
                                  .slice(0, 3)
                                  .map((video) => (
                                      <VideoCard key={video.id} variant="tiny" video={video} />
                                  ))
                            : NoVideos}
                    </CardContent>
                </Card>

                <Card className="col-span-1 sm:col-span-3 md:col-span-4 lg:col-span-full">
                    <CardHeader>
                        <CardTitle>All Your Videos</CardTitle>
                        <CardDescription>
                            Right-click on the video to open the action menu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <StudioVideoList videos={videos} />
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
