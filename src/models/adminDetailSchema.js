const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    adminPassword: {
      type: String,
      required: true,
      trim: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const AdminManager = new mongoose.model("AdminDetail", adminSchema);
module.exports = AdminManager;
