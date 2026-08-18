import client from "./minio.js"
import { buildBucketPolicy } from "./policy.js"

export async function updateBucketPolicy(bucketName, policyType) {
  const exists = await client.bucketExists(bucketName)

  if (!exists) {
    throw new Error(`Bucket "${bucketName}" does not exist`)
  }

  const policy = buildBucketPolicy(bucketName, policyType)

  await client.setBucketPolicy(bucketName, policy)

  console.log(
    `[minio] "${bucketName}" policy changed to "${policyType}"`
  )

  return {
    bucketName,
    policyType,
  }
}