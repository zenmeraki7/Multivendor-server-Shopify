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
  { name: "companyIcon", maxCount: 1 }, // For product images
  { name: "PAN", maxCount: 1 }, // For product images
  { name: "GSTIN", maxCount: 1 }, // For product images
  { name: "image", maxCount: 1 }, // For product images
]);

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinaryV2.uploader.upload(filePath, {
      folder: "multivendor",
    });
    return result; // Resolves with the upload result
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`); // Rejects with the error
  }
};

// Function to handle the actual image upload to Cloudinary
export const handleImageUpload = async (req, res, next) => {
  try {
    // if (req.files) {
    const uploadedImagesUrls = [];
    // console.log(req.files);
    // Handle the thumbnail upload
    if (req.files?.thumbnail) {
      console.log("thumbnail");
      const thumbnail = req.files.thumbnail[0];
      const cloudinaryResult = await uploadToCloudinary(thumbnail.path);
      console.log(cloudinaryResult, "thumb");
      req.thumbnailUrl = cloudinaryResult.secure_url;
    }
    if (req.files?.companyIcon) {
      const companyIcon = req.files.companyIcon[0];
      const cloudinaryResult = await uploadToCloudinary(companyIcon.path);
      req.companyIconUrl = cloudinaryResult.secure_url;
    }
    if (req.files?.image) {
      const image = req.files.image[0];
      const cloudinaryResult = await uploadToCloudinary(image.path);
      req.image = cloudinaryResult.secure_url;
    }
    if (req.files?.PAN && req.files?.GSTIN) {
      const PANdocument = req.files.PAN[0];
      const GSTINdocument = req.files.GSTIN[0];
      const cloudinaryResultPAN = await uploadToCloudinary(PANdocument.path);
      const cloudinaryResultGSTIN = await uploadToCloudinary(
        GSTINdocument.path
      );
      req.PAN_URL = cloudinaryResultPAN.secure_url;
      req.GSTIN_URL = cloudinaryResultGSTIN.secure_url;
    }
    // Handle the product images upload
    if (req.files?.images) {
      console.log("img");
      for (let image of req.files.images) {
        const cloudinaryResult = await uploadToCloudinary(image.path);
        uploadedImagesUrls.push({
          url: cloudinaryResult.secure_url,
          public_id: cloudinaryResult.public_id,
        });
      }
      console.log(uploadImages, "images");
      req.uploadedImages = uploadedImagesUrls;
    }
    next(); // Proceed to the next middleware or route handler
    // } else {
    //   res.status(400).json({ message: "No files uploaded" });
    // }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
};

export default upload;
