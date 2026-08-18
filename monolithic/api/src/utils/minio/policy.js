export function buildBucketPolicy(bucketName, type = 'private') {
  const resource = `arn:aws:s3:::${bucketName}/*`;

  const policies = {
    private: {
      Version: '2012-10-17',
      Statement: [],
    },

    'public-read': {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: resource,
        }, 
      ],
    },

    'public-read-write': {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: [
            's3:GetObject',
            's3:PutObject',
          ],
          Resource: resource,
        },
      ],
    },
  }

  const policy = policies[type]

  if (!policy) {
    throw new Error(`Invalid bucket policy type: ${type}`)
  }

  return JSON.stringify(policy)
}
