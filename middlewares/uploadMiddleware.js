import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js"; // Cloudinary config
import { v2 as cloudinaryV2 } from "cloudinary"; // Cloudinary's v2 SDK

// Set up local storage with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the folder where files will be stored temporarily
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname); // Add timestamp to the filename
  },
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

// Handle image upload for thumbnail and product images
export const uploadImages = upload.fields([
  { name: "thumbnail", maxCount: 1 }, // For thumbnail
  { name: "images", maxCount: 5 }, // For product images
]);

// Function to upload image to Cloudinary
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader.upload(
      filePath,
      { folder: "multivendor" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

// Function to handle the actual image upload to Cloudinary
export const handleImageUpload = async (req, res, next) => {
  try {
    if (req.files) {
      const uploadedImagesUrls = [];
      console.log(req.files);
      // Handle the thumbnail upload
      if (req.files.thumbnail) {
        const thumbnail = req.files.thumbnail[0];
        const cloudinaryResult = await uploadToCloudinary(thumbnail.path);
        req.thumbnailUrl = cloudinaryResult.secure_url;
      }
      // Handle the product images upload
      if (req.files.images) {
        for (let image of req.files.images) {
          const cloudinaryResult = await uploadToCloudinary(image.path);
          uploadedImagesUrls.push({
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
          });
        }
        req.uploadedImages = uploadedImagesUrls;
      }
      next(); // Proceed to the next middleware or route handler
    } else {
      res.status(400).json({ message: "No files uploaded" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
};

export default upload;
