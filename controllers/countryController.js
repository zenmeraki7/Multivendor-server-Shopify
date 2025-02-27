import Country from "../models/Country.js";
import Joi from "joi";

export const countryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Country name is required",
    "any.required": "Country name is required",
  }),
  code: Joi.string().required().messages({
    "string.empty": "Country code is required",
    "any.required": "Country code is required",
  }),
  isActive: Joi.boolean().required(true),
});

// Create a new country
export const createCountry = async (req, res) => {
  const { error } = countryValidationSchema.validate(req.body, {
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
    const { name, code, icon } = req.body;
    const country = new Country(req.body);
    await country.save();
    res.status(201).json({ message: "Country created successfully", country });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all countries
export const getCountries = async (req, res) => {
  try {
    const query = {};
    const { isActive, page = 1, limit = 10, search, id } = req.query;

    // Status filtering (Convert isActive to boolean)
    if (isActive && isActive !== "all") query.isActive = isActive === "true";

    // Search filtering (Case-insensitive search by name)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Pagination calculations
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch a single country by ID if provided
    if (id) {
      const country = await Country.findById(id);
      if (!country) {
        return res.status(404).json({
          success: false,
          message: "Country not found",
        });
      }
      return res.status(200).json({
        data: country,
        success: true,
        message: "Country fetched successfully",
      });
    }

    // Fetch countries with filtering and pagination
    const countries = await Country.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Count total filtered results
    const totalCount = await Country.countDocuments(query);

    res.status(200).json({
      data: countries,
      success: true,
      message: "Countries fetched successfully",
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all active countries
export const getActiveCountries = async (req, res) => {
  try {
    const countries = await Country.find({ isActive: true });
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a country
export const updateCountry = async (req, res) => {
  const { error } = countryValidationSchema.validate(req.body, {
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
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!country) return res.status(404).json({ message: "Country not found" });
    res.status(200).json({ message: "Country updated successfully", country });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a country
export const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    if (!country) return res.status(404).json({ message: "Country not found" });
    res.status(200).json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
