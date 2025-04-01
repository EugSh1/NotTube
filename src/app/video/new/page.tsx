"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { cloneElement, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Video as IVideo } from "@prisma/client";

const newVideoFormSchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(50, "Title must be at most 50 characters"),
    description: z.string().max(150, "Description must be at most 150 characters").optional(),
    tags: z.string().max(40, "Tags must be at most 40 characters").optional(),
    video: z
        .any()
        .refine((files) => files && files?.length > 0, "Video file is required")
        .refine(
            (files) => files && files[0]?.size < 500 * 1024 * 1024,
            "File size must be less than 500MB"
        ),
    thumbnail: z
        .any()
        .refine((files) => files && files?.length > 0, "Thumbnail file is required")
        .refine(
            (files) => files && files[0]?.size < 15 * 1024 * 1024,
            "File size must be less than 15MB"
        )
});

type NewVideoFormType = z.infer<typeof newVideoFormSchema>;

const formSteps = [
    {
        value: "upload-video",
        displayName: "Upload video",
        card: {
            title: "Upload your video with thumbnail",
            description: "Supported video extension: mp4",
            fields: [
                {
                    label: "Video",
                    element: <Input type="file" accept="video/mp4" placeholder="Your video" />,
                    description: "Select video file"
                },
                {
                    label: "Thumbnail",
                    element: (
                        <Input
                            type="file"
                            accept=".png, .jpg, .jpeg, .webp"
                            placeholder="Your thumbnail image"
                        />
                    ),
                    description: "Select thumbnail file"
                }
            ]
        }
    },
    {
        value: "general-information",
        displayName: "General information",
        card: {
            title: "General information",
            description: "Provide name, description and tags for your video",
            fields: [
                {
                    label: "Title",
                    element: <Input placeholder="Your video title" />,
                    description: "The title of your video"
                },
                {
                    label: "Description",
                    element: <Textarea placeholder="Your video description" />,
                    description: "The description of your video"
                },
                {
                    label: "Tags",
                    element: <Input placeholder="Your video tags" />,
                    description: "Enter tags separated by spaces"
                }
            ]
        }
    }
] as const;

export default function NewVideoPage() {
    const [step, setStep] = useState<"upload-video" | "general-information">("upload-video");
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<NewVideoFormType>({
        resolver: zodResolver(newVideoFormSchema)
    });

    const [isUploading, setIsUploading] = useState(false);

    async function handleUpload(data: NewVideoFormType) {
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description || "");
        formData.append("tags", data.tags || "");
        formData.append("file", data.video[0]);
        formData.append("thumbnail", data.thumbnail[0]);

        try {
            await axios.post<IVideo>("/api/video", formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percent);
                    }
                }
            });

            toast.success("Video uploaded successfully");
            router.push("/studio");
        } catch (error) {
            console.error(error);
            toast.error("Error uploading video");
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    }

    const onSubmit: SubmitHandler<NewVideoFormType> = async (data) => {
        handleUpload(data);
    };

    const getErrorMessage = (field: keyof NewVideoFormType) => {
        const error = errors[field];
        return typeof error?.message === "string" ? error.message : null;
    };

    return (
        <main className="flex justify-center w-full mt-20">
            {uploadProgress !== null ? (
                <div>
                    <Progress value={uploadProgress} className="md:1/2 lg:w-1/3" />
                    <p className="text-center text-sm">{uploadProgress}%</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="md:1/2 lg:w-1/3">
                    <Tabs
                        defaultValue={formSteps[0].value}
                        value={step}
                        onValueChange={(value) =>
                            setStep(value as "upload-video" | "general-information")
                        }
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-secondary">
                            {formSteps.map(({ value, displayName }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className="cursor-pointer"
                                    disabled
                                >
                                    {displayName}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {formSteps.map(({ value, card }) => (
                            <TabsContent value={value} key={value}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{card.title}</CardTitle>
                                        <CardDescription>{card.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2.5">
                                        {card.fields.map(({ label, description, element }) => (
                                            <div className="flex flex-col gap-1.5" key={label}>
                                                <Label htmlFor={`field-${label.toLowerCase()}`}>
                                                    {label}
                                                </Label>
                                                {cloneElement(element, {
                                                    ...register(
                                                        label.toLowerCase() as keyof NewVideoFormType
                                                    ),
                                                    id: `field-${label.toLowerCase()}`
                                                })}
                                                <p className="text-sm text-muted-foreground">
                                                    {description}
                                                </p>
                                                <p className="text-destructive">
                                                    {getErrorMessage(
                                                        label.toLowerCase() as keyof NewVideoFormType
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter>
                                        {value === formSteps.at(-1)?.value ? (
                                            <Button
                                                type="submit"
                                                disabled={isUploading || !isValid}
                                            >
                                                {isUploading ? "Uploading..." : "Publish"}
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled={isUploading}
                                                onClick={() => setStep("general-information")}
                                            >
                                                Next step
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </form>
            )}
        </main>
    );
}
