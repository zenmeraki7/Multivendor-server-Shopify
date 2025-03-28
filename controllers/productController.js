import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/sendEmail.js";
import Joi from "joi";
import shopify from "../config/shopify.js";
import {
  CREATE_PRODUCT_QUERY,
  CREATE_VARIANT_QUERY,
  FETCH_PRODUCTS_QUERY,
  UPDATE_VARIANT_QUERY,
} from "../services/graphql.js";
import Variants from "../models/Variants.js";
import Shop from "../models/Shop.js";

// Joi schema for product approval/rejection validation
const productApprovalSchema = Joi.object({
  productId: Joi.string().required(),
  action: Joi.string().valid("approve", "reject").required(),
});

// Vendor creates a product (unapproved)
export const createProduct = async (req, res) => {
  try {
    console.log("first");
    const { variants, ...others } = req.body;
    // Create new product (status 'pending' as it's awaiting approval)
    const newProduct = new Product({
      ...others,
      vendor: req.vendor._id,
      merchantShop: req.vendor.merchantShop,
    });

    let addVariants = [];

    addVariants = await Promise.all(
      variants.map(async (item) => {
        const newVariant = await Variants.create({
          ...item,
          productId: newProduct._id,
          compareAtPrice: newProduct.compareAtPrice,
        });
        console.log(newVariant?._id);
        return newVariant._id; // Return the new variant ID
      })
    );
    console.log(addVariants);
    newProduct.variants = addVariants;
    await newProduct.save();

    // await Notification.create({
    //   title: "New Product Request",
    //   message: `Vendor "${req.vendor.companyName}" has created a new product "${newProduct.title}" and is awaiting approval.`,
    //   type: "Product",
    //   vendorId: vendorId,
    //   link: `/admin/products/${newProduct._id}`, // Link to the product page in the admin panel
    //   to: "admin",
    // });

    return res.status(201).json({
      message: "Product created successfully. Awaiting admin approval.",
      product: newProduct,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating product", error: err.message });
  }
};

// Vendor creates a product (unapproved)
export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  try {
    const {
      title,
      description,
      brand,
      category,
      categoryType,
      subcategory,
      price,
      discountedPrice,
      specifications,
      stock,
      tags,
      shippingDetails,
      returnPolicy,
      meta,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(402)
        .json({ message: "Product no found", success: false });
    }
    title && (product.title = title);
    description && (product.description = description);
    brand && (product.brand = brand);
    category && (product.category = category);
    categoryType && (product.categoryType = categoryType);
    subcategory && (product.subcategory = subcategory);
    price && (product.price = Number(price));
    stock && (product.stock = Number(stock));
    discountedPrice && (product.discountedPrice = Number(discountedPrice));
    specifications && (product.specifications = JSON.parse(specifications));
    shippingDetails && (product.shippingDetails = JSON.parse(shippingDetails));
    returnPolicy && (product.returnPolicy = JSON.parse(returnPolicy));
    tags && (product.tags = JSON.parse(tags).toString().split(","));
    if (meta) {
      const metaField = JSON.parse(meta);
      product.meta = {
        ...metaField,
        keywords: metaField.keywords.toString().split(","),
      };
    }
    if (req.thumbnailUrl) {
      product.thumbnail.url = req.thumbnailUrl;
    }
    console.log(req.uploadedImages);
    let indexes = JSON.parse(req.body.imageIndex);
    console.log(JSON.parse(req.body.imageIndex));
    if (req.uploadedImages?.length) {
      req.uploadedImages?.map((item, index) => {
        let ind = indexes[index];
        product.images[ind] = { url: item.url };
      });
    }

    const vendorId = req.vendor._id;
    // console.log(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $set: product,
      },
      { new: true }
    );
    console.log("saved");
    await Notification.create({
      title: `${updatedProduct.title} Product Updated`,
      message: `Vendor "${req.vendor.companyName}" has updated a product "${updatedProduct.title}".`,
      type: "Product",
      vendorId: vendorId,
      link: `/admin/view-product/${updatedProduct._id}`, // Link to the product page in the admin panel
      to: "admin",
    });
    // console.log("senting resposne");
    // console.log(updatedProduct);
    res.status(201).json({
      message: "Product updated successfully.",
      data: updatedProduct,
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

// Get all products (active)
export const getAllActiveProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    const products = await Product.find({ isActive: true, isApproved: true })
      .select("title thumbnail discountedPrice brand productSold rating")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalItems: totalProducts,
      itemsPerPage: limit,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: err.message });
  }
};
// Get all pending products (for admin to view all)
export const getAllProducts = async (req, res) => {
  try {
    const query = { merchantShop: req.session?.shop, isApproved: false };
    const {
      inStock,
      category,
      subcategory,
      categoryType,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    // Handle boolean filters
    if (inStock === "true") query.stock = { $gt: 0 };
    if (inStock === "false") query.stock = 0;

    // ✅ Handle price range filtering
    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.discountedPrice.$lte = parseFloat(maxPrice);
    }

    // Handle ObjectId validation for category fields
    if (category && category !== "all" && /^[0-9a-fA-F]{24}$/.test(category)) {
      query.category = category;
    }
    if (
      subcategory &&
      subcategory !== "all" &&
      /^[0-9a-fA-F]{24}$/.test(subcategory)
    ) {
      query.subcategory = subcategory;
    }
    if (
      categoryType &&
      categoryType !== "all" &&
      /^[0-9a-fA-F]{24}$/.test(categoryType)
    ) {
      query.categoryType = categoryType;
    }

    // ✅ Implement case-insensitive search for title & description
    if (search && search.trim() !== "") {
      const regexSearch = { $regex: search, $options: "i" };
      query.$or = [{ title: regexSearch }, { description: regexSearch }];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch products
    const products = await Product.find(query)
      .populate("vendor")
      .populate("images")
      .populate({
        path: "variants",
        populate: {
          path: "image", // This populates the "image" field inside "variants"
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Search on populated fields (category, subcategory, categoryType)
    let filteredProducts = products;
    if (search && search.trim() !== "") {
      const regexSearch = new RegExp(search, "i");
      filteredProducts = products.filter(
        (product) =>
          (product.categoryType &&
            regexSearch.test(product.categoryType.name)) ||
          (product.category && regexSearch.test(product.category.name)) ||
          (product.subcategory && regexSearch.test(product.subcategory.name))
      );
    }

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      message: "Pending products fetched successfully",
      data:
        filteredProducts.length < products.length ? filteredProducts : products,
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalItems: totalProducts,
      itemsPerPage: limit,
    });
  } catch (err) {
    console.error("Error in getPendingProducts:", err);
    res
      .status(500)
      .json({ message: "Error fetching pending products", error: err.message });
  }
};

// Get all approved products (for admin to view all)
export const fetchProducts = async (req, res) => {
  try {
    const client = new shopify.clients.Graphql({
      session: req.session,
    });
    console.log("first");
    const variables = {
      first: 50, // Number of products to fetch
      query: "", // Custom query filter
      variantsLimit: 10, // Limit number of variants per product
      mediaLimit: 10, // Limit number of media items per product
    };

    const response = await client.query({
      data: {
        query: FETCH_PRODUCTS_QUERY,
        variables, // Pass variables here
      },
    });
    console.log(response);
    res.status(200).json({ data: response.body.data });
  } catch (err) {
    res.status(400).json({ message: "failed to fetch", error: err.message });
  }
};

// Get all seller products (for seller to view all)
export const getAllSellerProducts = async (req, res) => {
  try {
    const query = { vendor: req.vendor._id, isApproved: false }; // Base query for the seller

    const {
      inStock,
      price,
      isActive,
      category,
      subcategory,
      categoryType,
      search,
    } = req.query;

    // Apply filters only if they are not "all"
    if (inStock && inStock !== "all") query.inStock = inStock;
    if (price && price !== "all") query.price = price;
    if (isActive && isActive !== "all") query.isActive = isActive;
    if (category && category !== "all") query.category = category;
    if (subcategory && subcategory !== "all") query.subcategory = subcategory;
    if (categoryType && categoryType !== "all")
      query.categoryType = categoryType;

    // Add search functionality
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }, // Search in brand as well
        { "categoryType.name": { $regex: search, $options: "i" } }, // Search in categoryType
        { "category.name": { $regex: search, $options: "i" } }, // Search in category
        { "subcategory.name": { $regex: search, $options: "i" } }, // Search in subcategory
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch filtered products
    const products = await Product.find(query)
      .populate("vendor", "companyName companyIcon")
      .populate("images")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count with the current filters applied
    const totalFilteredProducts = await Product.countDocuments(query);

    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalFilteredProducts / limit),
      totalItems: totalFilteredProducts,
      itemsPerPage: limit,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: err.message });
  }
};

// Get all seller approved products (for seller to view all)
export const getAllSellerApprovedProducts = async (req, res) => {
  try {
    const shop = req.vendor?.merchantShop;
    const vendorShop = await Shop.findOne({ shop });

    if (!vendorShop)
      return res
        .status(404)
        .json({ message: "vendor shop not found", error: err.message });

    const vendor_id = req.vendor?._id;

    const client = new shopify.clients.Graphql({
      session: { shop, accessToken: vendorShop.accessToken },
    });

    const variables = {
      first: 50, // Number of products to fetch
      query: `vendor:${vendor_id}`, // Custom query filter
      variantsLimit: 10, // Limit number of variants per product
      mediaLimit: 10, // Limit number of media items per product
    };

    const response = await client.query({
      data: {
        query: FETCH_PRODUCTS_QUERY,
        variables, // Pass variables here
      },
    });
    console.log(response);
    res.status(200).json({ data: response.body.data });
  } catch (err) {
    res.status(400).json({ message: "failed to fetch", error: err.message });
  }
};

// Get a specific product by ID (for vendor and admin)
export const getProductById = async (req, res) => {
  const { productId } = req.params;
  const { fields } = req.query;
  let product = {};
  try {
    if (fields) {
      const neededFields = fields
        ?.toString()
        .split(",")
        .map((item) => item.trim())
        .join(" ");
      product = await Product.findById(productId).select(neededFields);
    } else {
      product = await Product.findById(productId)
        .populate("vendor", "companyName email")
        .populate("images")
        .populate({
          path: "variants",
          populate: {
            path: "image", // This populates the "image" field inside "variants"
          },
        });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      data: product,
      message: "Product fetched successfully",
      success: true,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: err.message });
  }
};

export const addVariant = async (req, res) => {
  const { productId } = req.params;
  const { attribute, value, additionalPrice, stock } = req.body;

  try {
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if the variant already exists
    const existingVariant = product.variants.find(
      (v) =>
        v.attribute.toLowerCase() === attribute.toLowerCase() &&
        v.value.toLowerCase() === value.toLowerCase()
    );

    if (existingVariant) {
      return res.status(400).json({
        message: "Variant with the same attribute and value already exists.",
      });
    }

    // Add new variant
    const newVariant = {
      attribute,
      value,
      additionalPrice: additionalPrice || 0,
      stock: stock || 0,
      image: { url: req.image } || null,
    };
    product.variants.push(newVariant);

    // Save the updated product
    await product.save();

    res.status(201).json({
      message: "Variant added successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding variant.",
      error: error.message,
    });
  }
};

export const editVariant = async (req, res) => {
  const { productId, variantId } = req.params;
  const { attribute, value, additionalPrice, stock } = req.body;
  console.log(req.body);

  try {
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the variant by its ID
    const variantIndex = product.variants.findIndex(
      (v) => v._id.toString() === variantId
    );

    if (variantIndex === -1) {
      return res.status(404).json({
        message: "Variant not found.",
      });
    }

    // Update the variant
    if (attribute !== undefined)
      product.variants[variantIndex].attribute = attribute;
    if (value !== undefined) product.variants[variantIndex].value = value;
    if (additionalPrice !== undefined)
      product.variants[variantIndex].additionalPrice = additionalPrice;
    if (stock !== undefined) product.variants[variantIndex].stock = stock;
    if (req.image !== undefined)
      product.variants[variantIndex].image = req.image
        ? { url: req.image }
        : product.variants[variantIndex].image;

    // Save the updated product
    await product.save();

    res.status(200).json({
      message: "Variant updated successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating variant.",
      error: error.message,
    });
  }
};

// Approve Product and Send Verification Email
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationRemarks } = req.body;

    const product = await Product.findById(id)
      .populate("images")
      .populate("vendor", "companyName _id");

    const variants = await Variants.find({ productId: id });

    console.log(variants.length);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const client = new shopify.clients.Graphql({ session: req.session });

    const response = await client.query({
      data: {
        query: CREATE_PRODUCT_QUERY,
        variables: {
          product: {
            title: product.title,
            descriptionHtml: product.description,
            vendor: product.vendor?._id,
            productType: product.productType,
            tags: product.tags,
            seo: product.seo,
            metafields: [
              {
                namespace: "vendor_info",
                key: "vendor_name",
                type: "single_line_text_field",
                value: product.vendor?.companyName,
              },
            ],
            productOptions: product.productOptions.map((item) => {
              return {
                name: item.name,
                values: item.values?.map((val) => {
                  return {
                    name: val,
                  };
                }),
              };
            }),
            // handle: "helmet-nova",
          },
          media: product.images?.map((item) => {
            return {
              originalSource: item.url,
              mediaContentType: "IMAGE",
            };
          }),
        },
      },
    });

    if (response.body.data.productCreate.userErrors.length > 0) {
      return res
        .status(400)
        .json({ errors: response.body.data.productCreate.userErrors });
    }

    const existingShopifyVariant =
      response.body.data.productCreate.product?.variants?.edges[0]?.node;

    const existingVariant = variants.find(
      (item) => item.variant == existingShopifyVariant?.title
    );
    console.log(existingVariant);
    const creatingVariant = variants.filter(
      (item) => item.variant != existingShopifyVariant?.title
    );

    const variantUpdateResponse = await client.query({
      data: {
        query: UPDATE_VARIANT_QUERY,
        variables: {
          productId: response.body.data.productCreate.product.id,
          variants: [
            {
              id: existingShopifyVariant?.id,
              barcode: existingVariant?.barcode,
              compareAtPrice: existingVariant.compareAtPrice.toString() || "",
              price: existingVariant.price.toString() || "",
              inventoryItem: {
                sku: existingVariant.sku || "",
              },
            },
          ],
        },
      },
    });

    let variantResponse = [];
    if (variants.length > 0) {
      variantResponse = await client.query({
        data: {
          query: CREATE_VARIANT_QUERY,
          variables: {
            productId: response.body.data.productCreate.product.id,
            variants: creatingVariant.map((item) => {
              return {
                barcode: item.barcode || "",
                compareAtPrice: item.compareAtPrice.toString() || "",
                price: item.price.toString() || "",
                optionValues: item.variantTypes.map((val) => {
                  return {
                    name: val.value,
                    optionId:
                      response.body.data.productCreate.product.options.find(
                        (op) => op.name == val.option
                      )?.id,
                  };
                }),
                // mediaSrc: [
                //   "https://media.istockphoto.com/id/178619117/photo/motorcycle-helmet.jpg?s=612x612&w=0&k=20&c=pO2VOZ_M5kDBB4CcWo2VcXppmgA02SM0o8B26Lv2ga8=",
                // ],
                inventoryQuantities: [
                  {
                    availableQuantity: item.quantity,
                    locationId: "gid://shopify/Location/98387394807",
                  },
                ],
                inventoryItem: {
                  // measurement: {
                  //   weight: {
                  //     value: 5,
                  //     unit: "GRAMS",
                  //   },
                  // },
                  sku: item.sku || "",
                },
              };
            }),
          },
        },
      });
    }

    console.log(variantResponse);

    if (
      variantResponse.body.data.productVariantsBulkCreate?.userErrors?.length >
      0
    ) {
      return res.status(400).json({
        errors: variantResponse.body.data.productVariantsBulkCreate.userErrors,
        message: "error while creating variant",
      });
    }

    if (
      variantUpdateResponse.body.data.productVariantsBulkUpdate?.userErrors
        ?.length > 0
    ) {
      return res.status(400).json({
        errors:
          variantUpdateResponse.body.data.productVariantsBulkUpdate.userErrors,
        message: "error while updating variant",
      });
    }

    // Set the vendor as verified after admin approval
    product.isApproved = true;
    product.verificationRemarks = verificationRemarks || "Approved by admin.";
    await product.save();

    // Create notification for the vendor
    // await Notification.create({
    //   title: "Product Approved",
    //   message: `Your product "${product.title}" has been approved.`,
    //   type: "Product",
    //   vendorId: product.seller._id,
    //   link: `/product/view`, // Link to the vendor dashboard
    //   to: product.seller._id,
    // });

    // await sendEmail(
    //   product.seller.email,
    //   "Product approved",
    //   `Dear ${product.seller.fullName},\n\nYour product "${product.title}" has been approved by the admin.`
    // );

    res.status(200).json({
      message: "Product approved successfully",
      product: response.body.data.productCreate.product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving product.", error: error.message });
  }
};
export const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationRemarks } = req.body;

    if (!verificationRemarks) {
      return res.status(400).json({
        message: "Validation error",
        errors: "verificationRemarks is required",
      });
    }
    const product = await Product.findById(id).populate(
      "seller",
      "_id email fullName"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Set the vendor as verified after admin approval
    product.isApproved = false;
    product.verificationRemarks = verificationRemarks;
    await product.save();

    await Notification.create({
      title: "Product Rejected",
      message: `Your Product "${product.title}" has been rejected. Remarks: ${product.verificationRemarks}`,
      type: "Product",
      vendorId: product.seller._id,
      link: `/product/view`, // Example link for vendor support
      to: product.seller._id,
    });

    // Send rejection email
    await sendEmail(
      product.seller.email,
      "Vendor Account Rejected",
      `Dear ${product.seller.fullName},\n\nWe regret to inform you that your product "${product.title}" has been rejected. Remarks: ${product.verificationRemarks}.\n\nIf you believe this is a mistake or need assistance, please contact our support team.\n\nThank you,\nTeam`
    );

    res.status(200).json({ message: "Product rejected successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting product.", error: error.message });
  }
};
