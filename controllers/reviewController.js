import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Joi from "joi";
// Joi schema for review validation
const reviewValidationSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().optional(),
      })
    )
    .optional(),
});

// Create a review for a product
export const createReview = async (req, res) => {
  const { productId, rating, comment, images } = req.body;
  const userId = req.user.id; // Assuming the user is authenticated and their ID is available

  try {
    const { error } = reviewValidationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create new review
    const newReview = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
      images,
    });

    await newReview.save();

    // Update the product's rating
    const reviews = await Review.find({ product: productId });
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    product.rating.average = averageRating;
    product.rating.count = reviews.length;
    await product.save();

    res
      .status(201)
      .json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing review
export const updateReview = async (req, res) => {
  const { reviewId, rating, comment, images } = req.body;
  const userId = req.user.id; // Assuming the user is authenticated

  try {
    const { error } = reviewValidationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user is the one who wrote the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own review" });
    }

    // Update fields
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    await review.save();

    // Update the product's average rating
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: product._id });
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    product.rating.average = averageRating;
    await product.save();

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id; // Assuming the user is authenticated

  try {
    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user is the one who wrote the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own review" });
    }

    // Delete the review
    await review.remove();

    // Update the product's average rating
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: product._id });
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    product.rating.average = averageRating;
    product.rating.count = reviews.length;
    await product.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reviews for a product
export const getReviewsForProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    // Find reviews for the product
    const reviews = await Review.find({ product: productId }).populate(
      "user",
      "name"
    );
    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reviews by a user
export const getReviewsByUser = async (req, res) => {
  const userId = req.user.id; // Assuming the user is authenticated

  try {
    // Find reviews by the user
    const reviews = await Review.find({ user: userId }).populate("product");
    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this user" });
    }

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
