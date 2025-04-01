import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { extname, join } from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string[] }> }) {
    const { file } = await params;
    const filePath = join(process.cwd(), "uploads", ...file);

    try {
        const fileStat = statSync(filePath);
        const fileSize = fileStat.size;
        const range = req.headers.get("range");

        const ext = extname(filePath).toLowerCase();
        let contentType = "application/octet-stream";

        if (ext === ".jpg" || ext === ".jpeg") {
            contentType = "image/jpeg";
        } else if (ext === ".png") {
            contentType = "image/png";
        } else if (ext === ".mp4") {
            contentType = "video/mp4";
        } else if (ext === ".webm") {
            contentType = "video/webm";
        }

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const fileStream = createReadStream(filePath, { start, end });

            return new NextResponse(fileStream as unknown as ReadableStream, {
                status: 206,
                headers: {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunkSize.toString(),
                    "Content-Type": contentType
                }
            });
        }

        const fileStream = createReadStream(filePath);

        return new NextResponse(fileStream as unknown as ReadableStream, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": fileSize.toString()
            }
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
