import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "edupay", // Change to your desired folder
    format: async (req, file) => "png", // Supports jpeg, png, etc.
    public_id: (req, file) => file.originalname.split(".")[0], // Use file name as public_id
  },
});

const upload = multer({ storage });

export default upload;
