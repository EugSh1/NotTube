import { formatViews } from "@/lib/formatVideoStats";
import { getThumbnailPath } from "@/lib/getFilePaths";
import { cn } from "@/lib/utils";
import { Video as IVideo } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import Image from "next/legacy/image";
import Link from "next/link";
import { ComponentProps } from "react";

type Variant = "tiny" | "small" | "medium" | "big";

interface IVariantStyles {
    container?: string;
    thumbnail?: string;
    descriptionContainer?: string;
}

interface IProps extends ComponentProps<"a"> {
    variant: Variant;
    video: IVideo;
    className?: string;
}

export default function VideoCard({ variant, video, className, ...props }: IProps) {
    const { id, title, views, thumbnailPath, createdAt } = video;

    const variants: Record<Variant, IVariantStyles> = {
        tiny: {
            container: "grid grid-cols-5 gap-2",
            thumbnail: "col-span-1 aspect-video",
            descriptionContainer: "col-span-4"
        },
        small: {
            container: ""
        },
        medium: {
            container: "grid grid-cols-2 gap-2"
        },
        big: {
            container: "grid sm:grid-cols-4 gap-2",
            thumbnail: "sm:col-span-2 md:col-span-1",
            descriptionContainer: "sm:col-span-2 md:col-span-3"
        }
    };

    const variantStyles = variants[variant];

    return (
        <Link href={`/video/${id}`} className={cn(variantStyles.container, className)} {...props}>
            <Image
                src={getThumbnailPath(thumbnailPath)}
                alt={video.title}
                className={cn(
                    "w-full aspect-video rounded-lg object-cover",
                    variant === "big" && variants.big.thumbnail
                )}
                layout="intrinsic"
                width={800}
                height={450}
            />
            <div className={cn("flex flex-col", variantStyles?.descriptionContainer || "")}>
                <h4 className="text-lg font-semibold">{title}</h4>
                <h4 className="text-sm font-medium text-muted-foreground">
                    {formatViews(views)} •{" "}
                    {formatDistanceToNow(new Date(createdAt), {
                        addSuffix: true,
                        locale: enUS
                    })}
                </h4>
            </div>
        </Link>
    );
}
