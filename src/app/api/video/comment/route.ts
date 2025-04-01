import { getUserId } from "@/lib/getUserId";
import prisma from "@/lib/prisma";
import respondWithError from "@/lib/respondWithError";
import { NextRequest, NextResponse } from "next/server";
import { newCommentSchema } from "./schema";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { videoId, message } = newCommentSchema.parse(data);
        const userId = await getUserId();

        await prisma.comment.create({
            data: {
                message,
                videoId,
                authorId: userId
            }
        });

        return NextResponse.json({ message: "success" }, { status: 200 });
    } catch (error) {
        return respondWithError(error);
    }
}
