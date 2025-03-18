import Images from "../models/Images.js";

export const uploadImageController = async (req, res) => {
  try {
    console.log(req.image);
    if (!req.image) {
      return res.status(404).json({ message: "Missing image" });
    }
    if (!req.cloudinaryId) {
      return res.status(404).json({ message: "Missing cloudinary id" });
    }

    const image = new Images({
      cloudinaryId: req.cloudinaryId,
      userId: req.vendor?._id || null,
      url: req.image,
    });
    // console.log(image);
    await image.save();
    console.log("Image uploaded successfully");

    res
      .status(201)
      .json({ message: "Image uploaded successfully", data: image });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
};
