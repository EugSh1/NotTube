"use client";

import { KeyboardEvent, useRef } from "react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { TvMinimalPlay } from "lucide-react";
import Link from "next/link";
import HeaderSheet from "./HeaderSheet";
import { SessionProvider } from "next-auth/react";

export default function Header() {
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const query = searchInputRef.current?.value?.trim();
        if (event.code !== "Enter" || !query) return;
        router.push(`/results/?search_query=${encodeURIComponent(query)}`);
    }

    return (
        <header className="sticky top-0 flex justify-between px-3 py-2 z-10 bg-background">
            <Link href="/" className="flex items-center gap-1.5">
                <TvMinimalPlay className="text-primary" />
                <h3>NotTube</h3>
            </Link>

            <Input
                type="search"
                className="w-2/4"
                ref={searchInputRef}
                placeholder="Search"
                onKeyDown={handleInputKeyDown}
            />

            <SessionProvider>
                <HeaderSheet />
            </SessionProvider>
        </header>
    );
}
