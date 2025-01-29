import FormConfig from "../models/FormConfig.js";

// Create or Update Form Configuration
export const updateFormConfig = async (req, res) => {
  try {
    const { page, fields } = req.body;

    let formConfig = await FormConfig.findOne({ page });

    if (formConfig) {
      // Update existing config
      formConfig.fields = fields;
      await formConfig.save();
    } else {
      // Create new config
      formConfig = new FormConfig({ page, fields });
      await formConfig.save();
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Form configuration saved successfully",
        formConfig,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Form Configuration for a Specific Page
export const getFormConfig = async (req, res) => {
  try {
    const { page } = req.params;
    const formConfig = await FormConfig.findOne({ page });

    if (!formConfig) {
      return res
        .status(404)
        .json({ success: false, message: "Form configuration not found" });
    }

    res.status(200).json({ success: true, formConfig });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
