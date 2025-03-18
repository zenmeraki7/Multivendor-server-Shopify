import Joi from "joi";

const productCreationSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
  }),
  status: Joi.string().valid("DRAFT", "ACTIVE", "ARCHIVED").default("ACTIVE"),
  productType: Joi.string().optional(),
  price: Joi.number().min(0).optional().messages({
    "number.min": "Price must be a positive number",
  }),
  compareAtPrice: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string()), // Array of image IDs
  tags: Joi.array().items(Joi.string()), // Tags should be an array of strings
  meta: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
  }).optional(),
  // Variants validation
  variants: Joi.array()
    .items(
      Joi.object({
        barcode: Joi.string().optional(),
        sku: Joi.string().optional(),
        price: Joi.number().min(0).required().messages({
          "number.min": "Variant price must be a positive number",
        }),
        inventoryQuantity: Joi.number().min(0).default(0),
        image: Joi.string().optional(), // Image ID
      })
    )
    .optional(),
});

const variantSchema = Joi.object({
  attribute: Joi.string().required().messages({
    "any.required": "'attribute' is a required field.",
    "string.empty": "'attribute' cannot be empty.",
  }),
  value: Joi.string().required().messages({
    "any.required": "'value' is a required field.",
    "string.empty": "'value' cannot be empty.",
  }),
  additionalPrice: Joi.number().optional().messages({
    "number.base": "'additionalPrice' must be a number.",
  }),
  stock: Joi.number().optional().messages({
    "number.base": "'stock' must be a number.",
  }),
  image: Joi.string(),
});

export const validateProductCreation = (req, res, next) => {
  console.log("validating");

  const { error } = productCreationSchema.validate(req.body, {
    abortEarly: false,
  });
  console.log("validating product");

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      details: error.details.map((err) => ({
        message: err.message,
        field: err.path[0],
      })),
    });
  }

  next();
};

export const validateVariant = (req, res, next) => {
  const { error } = variantSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      details: error.details.map((err) => ({
        message: err.message,
        field: err.path[0],
      })),
    });
  }

  next();
};
