const sinon = require("sinon");
const rewire = require("rewire");
const AWS = require("aws-sdk");
const ECR = new AWS.ECR();
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const scanResultsAnalyser = rewire("../../src/lambda/scan-results-analyser");

scanResultsAnalyser.__set__("ECR", ECR);
scanResultsAnalyser.__set__("S3", S3);
scanResultsAnalyser.__set__("DynamoDB", DynamoDB);

describe("scan-results-analyser", () => {
  it("should insert data into dynamodb", async () => {
    const s3Stub = sinon.stub(S3, "getObject").callsFake(() => {
      return {
        promise: () => {
          return Promise.resolve({
            Body: Buffer.from(JSON.stringify(["repository-1"]))
          });
        }
      };
    });
    const ecrListImagesStub = sinon.stub(ECR, "listImages").callsFake(() => {
      return {
        promise: () => {
          return Promise.resolve({
            imageIds: [
              {
                imageDigest:
                  "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606",
                imageTag: "some-tag"
              }
            ]
          });
        }
      };
    });
    const ecrDescribeImageScanFindingsScanStub = sinon
      .stub(ECR, "describeImageScanFindings")
      .callsFake(() => {
        return {
          promise: () => {
            return Promise.resolve({
              imageScanFindings: {
                findingSeverityCounts: {
                  INFORMATIONAL: 28,
                  LOW: 193,
                  MEDIUM: 19
                }
              }
            });
          }
        };
      });

    const dynamoDbPutStub = sinon.stub(DynamoDB, "put").callsFake(() => {
      return {
        promise: () => {
          return Promise.resolve({});
        }
      };
    });

    await scanResultsAnalyser.analyse();

    sinon.assert.calledWithExactly(s3Stub, {
      Bucket: "bucket",
      Key: "key.json"
    });
    sinon.assert.calledWithExactly(ecrListImagesStub, {
      registryId: process.env.REGISTRY_ID,
      repositoryName: "repository-1"
    });

    sinon.assert.calledWithExactly(ecrDescribeImageScanFindingsScanStub, {
      registryId: process.env.REGISTRY_ID,
      repositoryName: "repository-1",
      imageId: {
        imageDigest:
          "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606",
        imageTag: "some-tag"
      }
    });
    sinon.assert.calledWithExactly(dynamoDbPutStub, {
      TableName: process.env.DOCKER_IMAGES_VULNERABILITIES_TABLE,
      Item: {
        sha_digest:
          "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606",
        tag: "some-tag",
        aws_vulnerabilities: {
          INFORMATIONAL: 28,
          LOW: 193,
          MEDIUM: 19
        },
        repository: "repository-1",
        registry_id: "123",
        last_run: new Date().toISOString()
      }
    });
  });
});
