const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    productid: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    priceInfo: {
      type: String,
    },
    image: {
      type: String,
    },
    info: {
      type: String,
    },
    inCart: {
      type: Number,
    },
    pinfo: {
      type: String,
    },
    hindiName: {
      type: String,
    },
    section: {
      type: String,
    },
    stockStatus: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
