import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a local file to Cloudinary and remove it from the server after upload
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; // If no file path is provided, return null

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect file type (image, video, etc.)
    });

    console.log("File uploaded successfully:", response);

    //Now safely delete the local file since upload was successful
    fs.unlinkSync(localFilePath);
    console.log("Local file deleted after successful upload");

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    //Don't delete the file immediately; log the failure for manual retry
    console.log(`Upload failed! File still exists at: ${localFilePath}`);

    return null; // Return null so we can handle retrying later if needed
  }
};

// Export function to use in other parts of the project
export { uploadOnCloudinary };
