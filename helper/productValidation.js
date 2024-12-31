import Joi from "joi";

const productCreationSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required(),
  brand: Joi.string().required(),
  category: Joi.string().required(), // You may want to replace this with ObjectId validation if needed
  thumbnailAltText: Joi.string().optional(),
  imagesAltText: Joi.array().optional(),
  subcategories: Joi.string().required(), // You may want to replace this with ObjectId validation if needed
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
    weight: Joi.string().optional(),
    freeShipping: Joi.boolean().optional().default(false),
    ShippingCharge: Joi.number().optional(),
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
  const { error } = productCreationSchema.validate(req.body, {
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
