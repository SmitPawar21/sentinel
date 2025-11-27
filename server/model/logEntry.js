import mongoose from "mongoose";

const LogEntrySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
      enum: ["AuthService", "PaymentService", "UserService", "AnyOtherService"],
    },

    level: {
      type: String,
      required: true,
      enum: ["INFO", "ERROR", "CRITICAL"],
    },

    message: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: ["LOGIN_SUCCESS", "LOGIN_FAILURE", "PAGE_VIEW"],
    },

    meta: {
      ip: { type: String, required: true },
      responseTime: { type: Number, required: true },
    },

    isAttack: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "LogEntries", 
    versionKey: false,
  }
);

export default mongoose.model("LogEntry", LogEntrySchema);