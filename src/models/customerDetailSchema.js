const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
    },
    whatsapp: {
      type: Number,
    },
    email: {
      type: String,
    },
    house: {
      type: String,
    },
    street: {
      type: String,
    },
    landmark: {
      type: String,
    },
    pinCode: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    totalCost: {
      type: Number,
    },
    totalInCart: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Customer = new mongoose.model("CustomerDetail", customerSchema);
module.exports = Customer;
