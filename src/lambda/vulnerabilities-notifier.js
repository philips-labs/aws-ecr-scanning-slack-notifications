const axios = require("axios");
const util = require("util");
const AWS = require("aws-sdk");
const converter = AWS.DynamoDB.Converter;

const notify = async records => {
  for (const record of records) {
    if (record.eventName === "INSERT") {
      const imageMetadata = converter.unmarshall(record.dynamodb.NewImage);
      await axios.post(process.env.SLACK_ENDPOINT, {
        text: util.format(
          "_Vulnerabilities Detected_ for *%s* with SHA *%s* tagged *%s* \n ```%s```",
          imageMetadata.repository,
          imageMetadata.sha_digest,
          imageMetadata.tag,
          JSON.stringify(imageMetadata.aws_vulnerabilities)
        )
      });
      console.log(`Notification for image ${imageMetadata.repository} sent to Slack successfully`)
    } else if (record.eventName === "MODIFY") {
      const potentiallyChangedRecord = converter.unmarshall(
        record.dynamodb.NewImage
      );
      const originalRecord = converter.unmarshall(record.dynamodb.OldImage);
      if (
        JSON.stringify(potentiallyChangedRecord.aws_vulnerabilities) !==
        JSON.stringify(originalRecord.aws_vulnerabilities)
      ) {
        await axios.post(process.env.SLACK_ENDPOINT, {
          text: util.format(
            "_Vulnerabilities Changed_ for *%s* with SHA *%s* tagged *%s* \n ```%s```",
            potentiallyChangedRecord.repository,
            potentiallyChangedRecord.sha_digest,
            potentiallyChangedRecord.tag,
            JSON.stringify(potentiallyChangedRecord.aws_vulnerabilities)
          )
        });
      } else {
        console.log("Same scan results, nothing to do :)");
      }
    }
  }
};

module.exports = {
  notify
};
