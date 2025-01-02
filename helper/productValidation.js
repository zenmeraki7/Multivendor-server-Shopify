import Joi from "joi";

const productCreationSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().required(), // You may want to replace this with ObjectId validation if needed
  categoryType: Joi.string().required(), // You may want to replace this with ObjectId validation if needed
  thumbnailAltText: Joi.string().optional(),
  imagesAltText: Joi.array().optional(),
  subcategory: Joi.string().required(), // You may want to replace this with ObjectId validation if needed
  price: Joi.number().required().min(0),
  discountedPrice: Joi.number().required().min(0),
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
  specifications: Joi.string().optional(),
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
  tags: Joi.string().optional(),
  shippingDetails: Joi.string().optional(),
  returnPolicy: Joi.string().optional(),
  meta: Joi.string().optional(),
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
