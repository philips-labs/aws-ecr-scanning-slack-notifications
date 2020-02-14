const AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.AWS_REGION
});
const ECR = new AWS.ECR();
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();

const analyse = async () => {
  const s3 = await S3.getObject({
    Bucket: process.env.BUCKET,
    Key: process.env.KEY
  }).promise();
  const repositories = JSON.parse(Buffer.from(s3.Body).toString("utf8"));
  const dynamoDbPromises = [];
  for (const repository of repositories) {
    const images = await ECR.listImages({
      registryId: process.env.REGISTRY_ID,
      repositoryName: repository
    }).promise();
    for (const imageId of images.imageIds) {
      const results = await ECR.describeImageScanFindings({
        registryId: process.env.REGISTRY_ID,
        repositoryName: repository,
        imageId
      }).promise();
      if (results) {
        dynamoDbPromises.push(
          DynamoDB.put({
            TableName: process.env.DOCKER_IMAGES_VULNERABILITIES_TABLE,
            Item: {
              sha_digest: imageId.imageDigest,
              tag: imageId.imageTag,
              aws_vulnerabilities: results.imageScanFindings.findingSeverityCounts,
              repository: repository,
              registry_id: process.env.REGISTRY_ID,
              last_run: new Date().toISOString()
            }
          }).promise()
        );
      }
    }
    await Promise.all(dynamoDbPromises);
  }
};

module.exports = {
  analyse
};
