import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviewsForProduct,
  getReviewsByUser,
} from "../controllers/reviewController.js";
import { authentication } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Route to create a new review
router.post(
  "/create",
  authentication, // Ensure the user is authenticated
  createReview // Call the controller function
);

// Route to update an existing review
router.put(
  "/update/:reviewId",
  authentication, // Ensure the user is authenticated
  updateReview // Call the controller function
);

// Route to delete a review
router.delete(
  "/delete/:reviewId",
  authentication, // Ensure the user is authenticated
  deleteReview // Call the controller function
);

// Route to get all reviews for a product
router.get("/product-all/:productId", getReviewsForProduct);

// Route to get all reviews by a user
router.get("/user-all", authentication, getReviewsByUser);

export default router;
