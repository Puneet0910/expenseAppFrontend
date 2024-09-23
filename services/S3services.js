const AWS = require('aws-sdk');
require('dotenv').config();

const uploadToS3 = async (data, filename) => {
  const s3Bucket = new AWS.S3({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.IAM_USER_KEY,
      secretAccessKey: process.env.IAM_USER_SECRET,
    },
  });

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log("Something went wrong");
        reject(err);
      } else {
        console.log("Success", s3response);
        resolve(s3response.Location);
      }
    });
  });
};

module.exports = {uploadToS3};