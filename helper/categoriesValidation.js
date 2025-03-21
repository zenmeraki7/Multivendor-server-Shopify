import Joi from "joi";

const subcategoryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Subcategory name is required",
    "string.base": "Subcategory name should be a string",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category ID is required",
    "string.base": "Category ID should be a valid string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  isActive: Joi.boolean().required(true),
});

const subcategoryUpdateValidationSchema = Joi.object({
  name: Joi.string().messages({
    "string.base": "Subcategory name should be a string",
  }),
  category: Joi.string().messages({
    "string.base": "Category ID should be a valid string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  isActive: Joi.boolean(),
});

export const categoryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required",
    "string.base": "Category name should be a string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  categoryType: Joi.string().required().messages({
    "string.empty": "Category type id is required",
  }),
  isActive: Joi.boolean().required(true),
});
export const categoryUpdateValidationSchema = Joi.object({
  name: Joi.string().messages({
    "string.base": "Category name should be a string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  categoryType: Joi.string().messages({
    "string.empty": "Category type id is required",
  }),
  isActive: Joi.boolean(),
});

export const categoryTypeValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required",
    "string.base": "Category name should be a string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  isActive: Joi.boolean().required(true),
});

export const categoryTypeUpdateValidationSchema = Joi.object({
  name: Joi.string().messages({
    "string.base": "Category name should be a string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  isActive: Joi.boolean(),
});

export const validateCategoryTypeCreation = (req, res, next) => {
  const { error } = categoryTypeValidationSchema.validate(req.body, {
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

export const validateCategoryTypeUpdate = (req, res, next) => {
  const { error } = categoryTypeUpdateValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  console.log("validating categort type");

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

export const validateCategoryCreate = (req, res, next) => {
  const { error } = categoryValidationSchema.validate(req.body, {
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
export const validateCategoryUpdate = (req, res, next) => {
  const { error } = categoryUpdateValidationSchema.validate(req.body, {
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

export const validateSubCategoryCreate = (req, res, next) => {
  const { error } = subcategoryValidationSchema.validate(req.body, {
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

export const validateSubCategoryUpdate = (req, res, next) => {
  const { error } = subcategoryUpdateValidationSchema.validate(req.body, {
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
