const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helpSchema = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "RegisteredOfficer",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const HelpAndSupport = new mongoose.model("HelpQuerry", helpSchema);
module.exports = HelpAndSupport;
