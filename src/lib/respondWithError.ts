import { NextResponse } from "next/server";
import HTTPError from "./httpError";
import { ZodError } from "zod";

export default function respondWithError(error: unknown) {
    console.error(error);

    if (error instanceof HTTPError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation failed",
                details: error.errors
            },
            { status: 400 }
        );
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
