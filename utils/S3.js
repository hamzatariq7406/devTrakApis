import AWS from "aws-sdk";

// Configure AWS with your access and secret key.
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

// Function to upload file to S3
const uploadFile = async (bucketName, fileBuffer, key) => {
  // Setting up S3 upload parameters
  const params = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: key, // File name you want to save as in S3
  };

  // Uploading files to the bucket
  return s3.upload(params).promise();
};

const deleteFile = async (url) => {
  const parsedUrl = new URL(url);
  const s3 = new AWS.S3();
  const key = parsedUrl.pathname.substring(1);
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  };

  return s3.deleteObject(params).promise();
};

export { uploadFile, deleteFile };
