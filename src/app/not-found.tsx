import { formatPageTitle } from "@/lib/formatPageTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: formatPageTitle("Not Found")
};

export default function NotFound() {
    return (
        <div className="w-full h-screen flex flex-col gap-1.5 justify-center items-center">
            <h1 className="text-2xl font-semibold">Not Found</h1>
            <p className="font-medium">This page could not be found.</p>
        </div>
    );
}
