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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (req.query.id) {
      const bank = await Bank.findById(req.query.id).populate(
        "country",
        "name"
      );
      if (!bank) {
        return res.status(404).json({
          success: false,
          message: "bank not found",
        });
      }
      return res.status(200).json({
        data: bank,
        success: true,
        message: "bank fetched successfully",
      });
    }
    const banks = await Bank.find()
      .populate("country", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await Bank.countDocuments();

    res.status(200).json({
      data: banks,
      success: true,
      message: "bank fetched successfully",
      totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active banks
export const getActiveBanks = async (req, res) => {
  try {
    if (req.query.id) {
      const banks = await Bank.find({
        isActive: true,
        country: req.query.id,
      }).populate("country", "name");
      res.status(200).json(banks);
    } else {
      const banks = await Bank.find({ isActive: true }).populate(
        "country",
        "name"
      );
      res.status(200).json(banks);
    }
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
