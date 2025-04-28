import { minioClient } from "@/lib/minioClient";

async function setupBucket(bucketName: string) {
    const bucketExists = await minioClient.bucketExists(bucketName);

    if (bucketExists) return;

    await minioClient.makeBucket(bucketName);

    const policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: "*",
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
        ]
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
}

setupBucket("videos");
setupBucket("thumbnails");
