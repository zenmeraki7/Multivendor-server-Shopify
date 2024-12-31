import Bank from "../models/Bank.js";
import Joi from "joi";

export const bankValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Bank name is required",
    "any.required": "Bank name is required",
  }),
  country: Joi.string().required().messages({
    "string.empty": "Country ID is required",
    "any.required": "Country ID is required",
  }),
});

// Create a new bank
export const createBank = async (req, res) => {
  const { error } = bankValidationSchema.validate(req.body, {
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
  try {
    const { name, country, icon } = req.body;
    const bank = new Bank({ name, country, icon });
    await bank.save();
    res.status(201).json({ message: "Bank created successfully", bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all banks
export const getBanks = async (req, res) => {
  try {
    const banks = await Bank.find().populate("country", "name");
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active banks
export const getActiveBanks = async (req, res) => {
  try {
    const banks = await Bank.find({ isActive: true }).populate(
      "country",
      "name"
    );
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single bank by ID
export const getBankById = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id).populate("country");
    if (!bank) return res.status(404).json({ message: "Bank not found" });
    res.status(200).json(bank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a bank
export const updateBank = async (req, res) => {
  const { error } = bankValidationSchema.validate(req.body, {
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
  try {
    const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!bank) return res.status(404).json({ message: "Bank not found" });
    res.status(200).json({ message: "Bank updated successfully", bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a bank
export const deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    if (!bank) return res.status(404).json({ message: "Bank not found" });
    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
