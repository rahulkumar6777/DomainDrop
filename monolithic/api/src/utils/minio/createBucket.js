import client from "./minio.js"
import { buildBucketPolicy } from "./policy.js"
import { createDefaultStorageCorsConfiguration } from "../../constant/storageCors.js"
import { updateBucketCors } from "./updateBucketCors.js"
 

export async function createBucket(bucketName, policyType = 'private') {
    const exists = await client.bucketExists(bucketName)

    if (!exists) {
        await client.makeBucket(bucketName)
    }

    try {
        const policy = buildBucketPolicy(bucketName, policyType)
        const corsConfiguration = createDefaultStorageCorsConfiguration()

        await client.setBucketPolicy(bucketName, policy)
        await updateBucketCors(bucketName, corsConfiguration)

        console.log(
            `[minio] bucket "${bucketName}" ready with "${policyType}" policy and default CORS`
        )

        return {
            bucketName,
            policyType,
            corsConfiguration,
            created: !exists,
        }
    } catch (err) {
        console.error(
            `[minio] bucket setup error for "${bucketName}":`,
            err.message
        )

        throw new Error(
            `Bucket "${bucketName}" setup failed`
        )
    }
}
