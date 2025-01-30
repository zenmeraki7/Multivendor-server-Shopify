import BusinessType from "../models/BusinessTypes.js";
import Joi from "joi";

// Joi Validation Schema
const businessTypeValidationSchema = Joi.object({
  name: Joi.string()
    .valid(
      "Sole Proprietorship",
      "Limited Liability Partnership (LLP)",
      "One Person Company (OPC)",
      "Partnership",
      "Private Limited Company (Pvt Ltd)",
      "Public Limited Company (Ltd)",
      "Non-Profit Organization (NGO)",
      "Cooperative Society",
      "Trust"
    )
    .required(),
  description: Joi.string().required(),
  taxBenefits: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// 📌 Add a new Business Type
export const addBusinessType = async (req, res) => {
  try {
    // Validate Request Body
    const { error } = businessTypeValidationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { name, description, taxBenefits, isActive } = req.body;

    // Check if Business Type already exists
    const existingBusinessType = await BusinessType.findOne({ name });
    if (existingBusinessType) {
      return res.status(400).json({ message: "Business Type already exists" });
    }

    // Create New Business Type
    const newBusinessType = new BusinessType({
      name,
      description,
      taxBenefits,
      isActive,
    });

    await newBusinessType.save();
    res
      .status(201)
      .json({ message: "Business Type added successfully", newBusinessType });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get All Business Types
export const getAllActiveBusinessTypes = async (req, res) => {
  try {
    const businessTypes = await BusinessType.find({ isActive: true });
    res
      .status(200)
      .json({
        data: businessTypes,
        success: true,
        message: "All active Business Types fetched successfully",
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Get Single Business Type by ID
export const getBusinessTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const businessType = await BusinessType.findById(id);

    if (!businessType) {
      return res.status(404).json({ message: "Business Type not found" });
    }

    res.status(200).json(businessType);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 Update Business Type by ID
export const updateBusinessType = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Request Body
    const { error } = businessTypeValidationSchema.validate(req.body, {
      allowUnknown: true,
    });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const updatedBusinessType = await BusinessType.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedBusinessType) {
      return res.status(404).json({ message: "Business Type not found" });
    }

    res.status(200).json({
      message: "Business Type updated successfully",
      updatedBusinessType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
