import { Prisma } from "@prisma/client";

export type IVideoWithAuthor = Prisma.VideoGetPayload<{
    include: {
        author: true;
        comments: {
            include: {
                author: true;
            };
        };
    };
}>;

export type IWatchedVideo = Prisma.WatchedVideoGetPayload<{
    include: { video: true };
}>;
