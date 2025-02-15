

import Vendor from "../models/Vendor.js";
export const checkVendorBlocked = async (req, res, next) => {
try{
  const id = req.vendor?.id;  
      if (!id )  {
        return res.status(401).json({ 
          message: "Unauthorized - Vendor ID not found" 
        });  
      }
  
      // Find vendor in database
      const vendor = await Vendor.findById(id)
  
      if (!id ){
        return res.status(404).json({ 
          message: "Vendor not found" 
        });
      }
  
      // Check if vendor is blocked
      if (vendor.isBlocked) {
        return res.status(403).json({
          message: "Access denied - Your account is currently blocked"
        });
      }
  
      // If vendor is not blocked, proceed to next middleware/controller
      next();
    } catch (error) {

      return res.status(500).json({ 
        message: "Internal Server Error", 
        error: error.message 
      });
    }
  };
  
