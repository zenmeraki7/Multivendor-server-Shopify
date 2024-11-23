import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/sendEmail.js";
import Joi from "joi";

// Joi schema for product creation validation
const productCreationSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().required(), // You may want to replace this with ObjectId validation if needed
  subcategories: Joi.array(), // You may want to replace this with ObjectId validation if needed
  price: Joi.number().required().min(0),
  discountedPrice: Joi.number().required().min(0),
  thumbnail: Joi.object({
    url: Joi.string().uri().required(),
    altText: Joi.string().optional(),
  }).required(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().optional(),
      })
    )
    .required(),
  variants: Joi.array()
    .items(
      Joi.object({
        attribute: Joi.string().required(),
        value: Joi.string().required(),
        additionalPrice: Joi.number().min(0).optional(),
        stock: Joi.number().min(0).optional(),
        image: Joi.object({
          url: Joi.string().uri().required(),
          altText: Joi.string().optional(),
        }).optional(),
      })
    )
    .optional(),
  specifications: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .optional(),
  offers: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        discountPercentage: Joi.number().min(0).max(100).optional(),
        validUntil: Joi.date().optional(),
      })
    )
    .optional(),
  stock: Joi.number().min(0).default(0),
  tags: Joi.array().items(Joi.string()).optional(),
  shippingDetails: Joi.object({
    weight: Joi.number().optional(),
    dimensions: Joi.string().optional(),
    freeShipping: Joi.boolean().optional().default(false),
  }).optional(),
  returnPolicy: Joi.object({
    isReturnable: Joi.boolean().default(false),
    returnWindow: Joi.number().optional(),
  }).optional(),
  meta: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    keywords: Joi.array().items(Joi.string()).optional(),
  }).optional(),
});

// Joi schema for product approval/rejection validation
const productApprovalSchema = Joi.object({
  productId: Joi.string().required(),
  action: Joi.string().valid("approve", "reject").required(),
});

// Vendor creates a product (unapproved)
export const createProduct = async (req, res) => {
  try {
    // Validate Input
    const { error } = productCreationSchema.validate(req.body, {
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
    // Check if the vendor is authenticated (assuming vendor ID is in the token)
    const vendorId = req.vendor._id; // Adjust this based on your middleware
    console.log(vendorId);

    if (!vendorId) {
      return res.status(404).json({ message: "Missing vendor id" });
    }
    // Create new product (status 'pending' as it's awaiting approval)
    const newProduct = new Product({ seller: vendorId, ...req.body });

    await newProduct.save();

    await Notification.create({
      title: "New Product Request",
      message: `Vendor "${req.vendor.companyName}" has created a new product "${newProduct.title}" and is awaiting approval.`,
      type: "Product",
      vendorId: vendorId,
      link: `/admin/products/${newProduct._id}`, // Link to the product page in the admin panel
      to: "admin",
    });

    res.status(201).json({
      message: "Product created successfully. Awaiting admin approval.",
      product: newProduct,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating product", error: err.message });
  }
};

// Admin approves or rejects a product
export const updateProductStatus = async (req, res) => {
  const { productId, action } = req.body; // 'action' could be 'approve' or 'reject'

  try {
    const { error } = productApprovalSchema.validate(req.body, {
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
    // Find product by ID
    const product = await Product.findById(productId).populate("seller");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product's isActive status based on admin action
    if (action === "approve") {
      product.isActive = true;
      product.isApproved = true;
      await product.save();

      // Create a notification for the vendor
      const notification = new Notification({
        vendorId: product.seller._id,
        title: "Your product has been approved!",
        message: `Congratulations! Your product "${product.title}" has been approved and is now live.`,
        type: "Product",
        isRead: false,
        link: `/vendor/products/${product._id}`, // You can change this to the actual product link
        to: "vendor",
      });

      await notification.save();

      // Optionally send an email to the vendor (you can customize this as needed)
      sendEmail(
        product.seller.email,
        "Product Approved",
        `Your product "${product.title}" has been approved.`
      );
    } else if (action === "reject") {
      product.isActive = true;
      product.isApproved = false;
      await product.save();

      // Create a notification for the vendor
      const notification = new Notification({
        vendorId: product.seller._id,
        title: "Your product has been rejected.",
        message: `We're sorry, but your product "${product.title}" has been rejected. Please contact support for more details.`,
        type: "Product",
        isRead: false,
        link: `/vendor/products/${product._id}`, // You can change this to the actual product link
        to: "vendor",
      });

      await notification.save();

      // Optionally send an email to the vendor (you can customize this as needed)
      sendEmail(
        product.seller.email,
        "Product Rejected",
        `We're sorry, but your product "${product.title}" has been rejected.`
      );
    }

    res.status(200).json({ message: `Product ${action}ed successfully.` });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating product status", error: err.message });
  }
};

// Get all products (for admin to view all)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller");
    // .populate("category")
    // .populate("subcategories");
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: err.message });
  }
};

// Get a specific product by ID (for vendor and admin)
export const getProductById = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId)
      .populate("seller")
      // .populate("category")
      // .populate("subcategories");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: err.message });
  }
};
