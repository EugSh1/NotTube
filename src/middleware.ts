import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const protectedRoutes = ["/video/new", "/api/video", "/history", "/studio"];
    const isProtectedRoute = protectedRoutes.includes(req.nextUrl.pathname);
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");
    const isAuthApiRoute = req.nextUrl.pathname.startsWith("/api/auth");

    if (!req.auth && isProtectedRoute && !isAuthApiRoute) {
        if (isApiRoute && req.method !== "GET") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        } else if (!isApiRoute) {
            const newUrl = new URL("/sign-in", req.nextUrl.origin);
            return NextResponse.redirect(newUrl);
        }
    }
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
