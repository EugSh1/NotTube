interface IFetchResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<IFetchResult<T>> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        const headers = new Headers({
            "Content-Type": "application/json",
            ...options.headers
        });

        if (typeof window === "undefined") {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            const cookieHeader = cookieStore.toString();
            if (cookieHeader) {
                headers.set("Cookie", cookieHeader);
            }
        }

        const response = await fetch(`${baseUrl}/api${path}`, {
            credentials: "include",
            headers,
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || response.status
            };
        }

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Something went wrong"
        };
    }
}
