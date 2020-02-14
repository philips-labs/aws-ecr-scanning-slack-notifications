const sinon = require("sinon");
const rewire = require("rewire");
const AWS = require("aws-sdk");
const ECR = new AWS.ECR();
const S3 = new AWS.S3();
const imageScanner = rewire("../../src/lambda/image-scanner");

imageScanner.__set__("ECR", ECR);
imageScanner.__set__("S3", S3);

describe("image-scanner", () => {
  it("should trigger the scan images task", async () => {
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
    const ecrStartImageScanStub = sinon
      .stub(ECR, "startImageScan")
      .callsFake(() => {
        return {
          promise: () => {
            return Promise.resolve({});
          }
        };
      });

    await imageScanner.scan();

    sinon.assert.calledWithExactly(s3Stub, {
      Bucket: "bucket",
      Key: "key.json"
    });
    sinon.assert.calledWithExactly(ecrListImagesStub, {
      registryId: process.env.REGISTRY_ID,
      repositoryName: "repository-1"
    });

    sinon.assert.calledWithExactly(ecrStartImageScanStub, {
      registryId: process.env.REGISTRY_ID,
      repositoryName: "repository-1",
      imageId: {
        imageDigest:
          "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606",
        imageTag: "some-tag"
      }
    });
    s3Stub.restore();
    ecrListImagesStub.restore();
    ecrStartImageScanStub.restore();
  });
});
