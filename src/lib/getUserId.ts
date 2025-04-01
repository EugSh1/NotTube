import { auth } from "@/auth";
import HTTPError from "./httpError";

export async function getUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new HTTPError("Unauthorized", 401);
    }
    return session.user.id;
}
