const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentDetails = mongoose.Schema(
  {
    transDate: {
      type: String,
    },
    txnId: {
      type: String,
    },
    clienttxnId: {
      type: String,
    },
    netAmount: {
      type: Number,
    },
    amountPaid: {
      type: Number,
    },
    status: {
      type: String,
    },
    paymentGateway: {
      type: String,
    },
    mode: {
      type: String,
    },
  },
  { timestamps: true }
);
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

const CustomerAndPayments = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "CustomerDetailCart",
    },
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

    paymentDetails: [paymentDetails],
  },
  { timestamps: true }
);

const OrderPayment = new mongoose.model(
  "CustomerAndPaymentDetail",
  CustomerAndPayments
);
module.exports = OrderPayment;
