"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileUp, History, LogOut, PencilRuler } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import HeaderSheetIcon from "./HeaderSheetIcon";

const menuLinks = [
    { title: "Upload video", url: "/video/new", icon: FileUp },
    { title: "Watch history", url: "/history", icon: History },
    { title: "NotTube Studio", url: "/studio", icon: PencilRuler }
];

export default function HeaderSheet() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <Sheet>
            <SheetTrigger>
                <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "N"}</AvatarFallback>
                </Avatar>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{user?.name || "You are logged out"}</SheetTitle>
                    <SheetDescription>
                        {user && <span>@{user?.name?.toLowerCase().replaceAll(" ", "_")}</span>}
                    </SheetDescription>
                    {menuLinks.map(({ title, url, icon }) => (
                        <HeaderSheetIcon
                            key={title}
                            variant="link"
                            title={title}
                            url={url}
                            icon={icon}
                        />
                    ))}
                    {user ? (
                        <HeaderSheetIcon
                            variant="button"
                            title="Sign out"
                            onClickFn={() => signOut()}
                            icon={LogOut}
                        />
                    ) : (
                        <HeaderSheetIcon
                            variant="link"
                            title="Sign in"
                            url="/sign-in"
                            icon={LogOut}
                        />
                    )}
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
}
