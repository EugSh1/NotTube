import { Client } from "minio";
import "dotenv/config";

const isTest = process.env.NODE_ENV === "test";

export const minioClient = new Client({
    endPoint: isTest ? "127.0.0.1" : process.env.NEXT_PUBLIC_MINIO_ENDPOINT!,
    port: isTest ? 9000 : parseInt(process.env.NEXT_PUBLIC_MINIO_PORT!),
    useSSL: false,
    accessKey: isTest ? "MINIO_MOCK_ACCESS_KEY" : process.env.MINIO_ACCESS_KEY!,
    secretKey: isTest ? "MINIO_MOCK_SECRET_KEY" : process.env.MINIO_SECRET_KEY!
});
