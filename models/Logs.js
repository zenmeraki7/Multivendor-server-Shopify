import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    requestBody: { type: Object, default: {} },
    queryParams: { type: Object, default: {} },
    headers: { type: Object, default: {} },
    responseStatus: { type: Number, required: true },
    responseBody: { type: Object, default: {} },
    error: { type: Object, default: null }, // Add error details (if any)
    user: { type: String },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, expireAfterSeconds: 2592000 }
);

const Log = mongoose.model("Log", logSchema);

export default Log;
