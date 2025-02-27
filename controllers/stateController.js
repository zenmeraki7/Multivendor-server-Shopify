import State from "../models/State.js";
import mongoose from "mongoose";

import Joi from "joi";

export const stateValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "State name is required",
    "any.required": "State name is required",
  }),
  country: Joi.string().required().messages({
    "string.empty": "Country ID is required",
    "any.required": "Country ID is required",
  }),
  code: Joi.string().optional(),
  isActive: Joi.boolean().required(true),
});

// Create a new state
export const createState = async (req, res) => {
  const { error } = stateValidationSchema.validate(req.body, {
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
    const { name, country, code, icon } = req.body;
    const state = new State( req.body);
    await state.save();
    res.status(201).json({ message: "State created successfully", state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all states
export const getStates = async (req, res) => {
  try {
    const query = {};
    const { isActive, country, page = 1, limit = 10, id, search } = req.query;

    if (isActive && isActive !== "all") query.isActive = isActive === "true";
    if (country && country !== "all") query.country = country;

    // Search logic: Updated to include country search
    if (search) {
      // First, look for countries that match the search term
      const Country = mongoose.model("Country");
      const matchingCountries = await Country.find({
        name: { $regex: search, $options: "i" }
      }).select('_id');
      
      const countryIds = matchingCountries.map(c => c._id);
      
      // Create a query with $or to match either state name or country
      query.$or = [
        { name: { $regex: search, $options: "i" } },  // Search in state name
        { country: { $in: countryIds } }              // Search in countries
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    if (req.query.id) {
      const state = await State.findById(req.query.id).populate(
        "country",
        "name"
      );
      if (!state) {
        return res.status(404).json({
          success: false,
          message: "state not found",
        });
      }
      return res.status(200).json({
        data: state,
        success: true,
        message: "state fetched successfully",
      });
    }
    const states = await State.find(query)
      .populate("country", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const totalCount = await State.countDocuments(query);

    res.status(200).json({
      data: states,
      success: true,
      message: "states fetched successfully",
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active states
export const getActiveStates = async (req, res) => {
  try {
    const states = await State.find({ isActive: true }).populate(
      "country",
      "name"
    );
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a state
export const updateState = async (req, res) => {
  const { error } = stateValidationSchema.validate(req.body, {
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
    const state = await State.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!state) return res.status(404).json({ message: "State not found" });
    res.status(200).json({ message: "State updated successfully", state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a state
export const deleteState = async (req, res) => {
  try {
    const state = await State.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    if (!state) return res.status(404).json({ message: "State not found" });
    res.status(200).json({ message: "State deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
