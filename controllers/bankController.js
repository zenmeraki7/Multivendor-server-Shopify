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
  isActive: Joi.boolean().required(true),
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
    const bank = new Bank(req.body);
    await bank.save();
    res.status(201).json({ message: "Bank created successfully", bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all banks
export const getBanks = async (req, res) => {
  try {
    const query = {};
    const { isActive, country, page = 1, limit = 10, id, search } = req.query;

    if (isActive && isActive !== "all") query.isActive = isActive === "true";
    if (country && country !== "all") query.country = country;

    // Search logic: Case-insensitive search for bank name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch a single bank by ID
    if (id) {
      const bank = await Bank.findById(id).populate("country", "name");
      if (!bank) {
        return res.status(404).json({
          success: false,
          message: "Bank not found",
        });
      }
      return res.status(200).json({
        data: bank,
        success: true,
        message: "Bank fetched successfully",
      });
    }

    // Fetch banks with search & filters
    const banks = await Bank.find(query)
      .populate("country", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Bank.countDocuments(query);

    res.status(200).json({
      data: banks,
      success: true,
      message: "Banks fetched successfully",
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
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
