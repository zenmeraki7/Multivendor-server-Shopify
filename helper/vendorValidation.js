import Joi from "joi";
import mongoose from "mongoose";
// Vendor schema validation
export const vendorRegistrationSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Full name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  phoneNum: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "any.required": "Phone number is required.",
    }),
  address: Joi.string().required().messages({
    "any.required": "Address is required.",
  }),
  zipCode: Joi.number().positive().required().messages({
    "number.base": "Zip code must be a valid number.",
    "any.required": "Zip code is required.",
  }),
  city: Joi.string().required().messages({
    "any.required": "City is required.",
  }),
  state: Joi.string().required().messages({
    "any.required": "State is required.",
  }),
  country: Joi.string().default("India").messages({
    "any.required": "Country is required.",
  }),
  companyName: Joi.string().trim().required().messages({
    "string.empty": "Company name is required.",
    "any.required": "Company name is required.",
  }),
  website: Joi.string().uri().messages({
    "string.uri": "Website must be a valid URL.",
  }),
  businessType: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .required()
    .messages({
      "any.invalid": "Invalid business type ID.",
      "string.empty": "Business type is required.",
      "any.required": "Business type is required.",
    }),

 
  supportContact: Joi.object({
    email: Joi.string().email().default("").messages({
      "string.email": "Support email must be a valid email.",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .default("")
      .messages({
        "string.pattern.base":
          "Support phone number must be exactly 10 digits.",
      }),
  }),
});

export const vendorUpdateSchema = Joi.object({
  fullName: Joi.string().trim().messages({
    "string.empty": "Full name is required.",
  }),
  email: Joi.string().email().messages({
    "string.email": "Please provide a valid email address.",
    "any.required": "Email is required.",
  }),
  phoneNum: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "any.required": "Phone number is required.",
    }),
  address: Joi.string().messages({
    "any.required": "Address is required.",
  }),
  zipCode: Joi.number().positive().messages({
    "number.base": "Zip code must be a valid number.",
    "any.required": "Zip code is required.",
  }),
  city: Joi.string().messages({
    "any.required": "City is required.",
  }),
  state: Joi.string().messages({
    "any.required": "State is required.",
  }),
  country: Joi.string().default("India").messages({
    "any.required": "Country is required.",
  }),
  companyName: Joi.string().trim().messages({
    "string.empty": "Company name is required.",
    "any.required": "Company name is required.",
  }),
  website: Joi.string().uri().messages({
    "string.uri": "Website must be a valid URL.",
  }),
  businessType: Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "any.invalid": "Invalid business type ID.",
  }),

  supportContact: Joi.object({
    email: Joi.string().email().default("").messages({
      "string.email": "Support email must be a valid email.",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .default("")
      .messages({
        "string.pattern.base":
          "Support phone number must be exactly 10 digits.",
      }),
  }),
  storeDescription: Joi.string().trim().allow("").messages({
    "string.base": "Store description must be a string.",
  }),
  sellerDescription: Joi.string().trim().allow("").messages({
    "string.base": "Seller description must be a string.",
  }),
  sellerPolicy : Joi.string().trim().allow("").messages({
    "string.base": "Seller Policy must be a string.",
  }),
});


const documentDetailsSchema = Joi.object({
  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/) // PAN format: AAAAA1234A
    .required()
    .messages({
      "string.empty": "PAN number is required.",
      "any.required": "PAN number is required.",
      "string.pattern.base": "Invalid PAN number format.",
    }),
  gstinNumber: Joi.string()
    .pattern(/^[A-Z0-9]{15}$/) // GSTIN format: 15 characters (letters and digits)
    .required()
    .messages({
      "string.empty": "GSTIN number is required.",
      "any.required": "GSTIN number is required.",
      "string.pattern.base": "Invalid GSTIN number format.",
    }),
});

// Define Joi validation schema for both PAN and GSTIN
const bankDetailsSchema = Joi.object({
  accountHolderName: Joi.string().required().messages({
    "any.required": "Account holder name is required.",
  }),
  accountNumber: Joi.string()
    .pattern(/^[0-9]{9,18}$/)
    .required()
    .messages({
      "string.pattern.base": "Account number must be between 9 and 18 digits.",
      "any.required": "Account number is required.",
    }),
  ifscCode: Joi.string().length(11).required().messages({
    "string.length": "IFSC code must be exactly 11 characters.",
    "any.required": "IFSC code is required.",
  }),
  bankName: Joi.string().required().messages({
    "any.required": "Bank name is required.",
  }),
});

export const validateVendorCreation = (req, res, next) => {
  const { error } = vendorRegistrationSchema.validate(req.body, {
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
export const validateAddDocument = (req, res, next) => {
  const { error } = documentDetailsSchema.validate(req.body, {
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
export const validateAddBankDetails = (req, res, next) => {
  const { error } = bankDetailsSchema.validate(req.body, {
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
