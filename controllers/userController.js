import Users from "../models/User.js";

export const getUserByToken = async (req, res) => {
  try {
    // `req.user` is set by the `authentication` middleware
    const userId = req.user.id;

    // Fetch the user from the database
    const user = await Users.findById(userId).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // Send user details as the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
