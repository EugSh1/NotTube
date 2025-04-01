"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Video as IVideo } from "@prisma/client";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";

interface IProps {
    selectedVideo: IVideo | null;
    closeFn: () => void;
}

export default function StudioEditVideoDialog({ selectedVideo, closeFn }: IProps) {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        setTitle(selectedVideo?.title || "");
        setDescription(selectedVideo?.description || "");
        setTags(selectedVideo?.tags || "");
    }, [selectedVideo]);

    async function handleSaveVideoChanges() {
        if (!selectedVideo) return;

        if (
            title === selectedVideo?.title &&
            description === selectedVideo?.description &&
            tags === selectedVideo?.tags
        ) {
            closeFn();
            return;
        }
        const { success, error } = await apiFetch(`/video`, {
            method: "PUT",
            body: JSON.stringify({
                videoId: selectedVideo?.id,
                newVideoTitle: title,
                newVideoDescription: description,
                newVideoTags: tags
            })
        });
        if (success) {
            toast.success("Video successfully updated");
        } else {
            toast.error(`Error updating video: ${error}`);
        }
        closeFn();
        router.refresh();
    }

    return (
        <Dialog open={!!selectedVideo} onOpenChange={closeFn}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit video &quot;{selectedVideo?.title}&quot;</DialogTitle>
                    <DialogDescription>
                        Here you can change title, description and tags
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1.5">
                    <div>
                        <Label htmlFor="input-title">Title</Label>
                        <Input
                            id="input-title"
                            placeholder="Title"
                            value={title}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setTitle(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="textarea-description">Description</Label>
                        <Textarea
                            id="textarea-description"
                            placeholder="Description"
                            value={description}
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                setDescription(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="input-tags">Tags</Label>
                        <Input
                            id="input-tags"
                            placeholder="Tags"
                            value={tags}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setTags(event.target.value)
                            }
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSaveVideoChanges}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
