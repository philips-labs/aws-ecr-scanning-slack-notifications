const AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.AWS_REGION
});
const ECR = new AWS.ECR();
const S3 = new AWS.S3();

const scan = async () => {
  const s3 = await S3.getObject({
    Bucket: process.env.BUCKET,
    Key: process.env.KEY
  }).promise();
  const repositories = JSON.parse(Buffer.from(s3.Body).toString("utf8"));
  for (const repository of repositories) {
    const images = await ECR.listImages({
      registryId: process.env.REGISTRY_ID,
      repositoryName: repository
    }).promise();
    for (const imageId of images.imageIds) {
        try {
          await ECR.startImageScan({
          registryId: process.env.REGISTRY_ID,
          repositoryName: repository,
          imageId
        }).promise()
      } catch (e) {
        console.log(`Failed scanning image: ${repository}:${imageId.imageTag}`, e)
      }
    }
  }
};

module.exports = {
  scan
};
