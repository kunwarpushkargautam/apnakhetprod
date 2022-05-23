const mongoose = require("mongoose");

const productsDetails = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    incart: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const customerSchemaCart = new mongoose.Schema(
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
    originalCost: {
      type: Number,
    },
    totalCost: {
      type: Number,
    },
    totalInCart: {
      type: Number,
    },
    productsInCart: [productsDetails],
    customerKey: {
      type: String,
      required: true,
    },
    paymentCreated: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
    },
    paymentByGateway: {
      type: String,
    },
  },
  { timestamps: true }
);

const CustomerCart = new mongoose.model(
  "CustomerDetailCart",
  customerSchemaCart
);
module.exports = CustomerCart;
