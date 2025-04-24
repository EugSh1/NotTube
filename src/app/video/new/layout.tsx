import { formatPageTitle } from "@/lib/formatPageTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: formatPageTitle("Upload Video")
};

export default function Layout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
