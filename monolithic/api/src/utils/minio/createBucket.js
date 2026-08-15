import client from "./minio.js"
import { buildBucketPolicy } from "./policy.js"
 

export async function createBucket(bucketName, policyType = 'private') {
    const exists = await client.bucketExists(bucketName)

    if (exists) {
        throw new Error(`Bucket "${bucketName}" already exists`)
    }

    await client.makeBucket(bucketName)

    try {
        const policy = buildBucketPolicy(bucketName, policyType)

        await client.setBucketPolicy(bucketName, policy)

        console.log(
            `[minio] bucket "${bucketName}" created with "${policyType}" policy`
        )
    } catch (err) {
        console.error(
            `[minio] policy error for "${bucketName}":`,
            err.message
        )

        throw new Error(
            `Bucket "${bucketName}" created but policy update failed`
        )
    }

    return {
        bucketName,
        policyType,
    }
}