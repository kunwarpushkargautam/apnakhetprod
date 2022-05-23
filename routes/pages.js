const express = require("express");
const router = express.Router();
const qs = require("querystring");
var https = require("https");

// const checksum_lib = require("./paytm/cheksum");
// const config = require("./paytm/config");

const parseUrl = express.urlencoded({ extended:false });
const parseJson = express.json({ extended : false });

const {
  homePageRoute,
  gallery,
  shopPageRoute,
  cartPageRoute,
  helpPageRoute,
  infoPageRoute,
  aboutPageRoute,
  customerAddress,
  saveAddress,
  saveAddressandCart,
  helpQuerry,
  paymentOption,
  paytmcheckout,
  errorpage,
  privacypolicy,
  termsandcondition,
  gpayorder,
  newsAndArticles
} = require("../controllers/pagesControlFile");

const {sabPaisa,utest,sabPaisafailed,sabPaisaResponsePage} = require('./sabPaisa/action')
const {paytmPaynow,paytmCallback,paytmStatus} = require("../controllers/paytmController")
const {razorPayOrder,razorPayOrderResponse} = require("../controllers/razorPayController")

router.get("/", homePageRoute);
router.get("/gallery", gallery);
router.get("/shop", shopPageRoute);
router.get("/cart", cartPageRoute);
router.get("/help", helpPageRoute);
router.get("/info", infoPageRoute);
router.get("/about", aboutPageRoute);
router.get("/index", homePageRoute);
router.get("/checkOut", customerAddress);
router.post("/saveAddress", saveAddress);
router.post("/saveAddressandCart", saveAddressandCart);
router.post("/help", helpQuerry);
router.get("/paymentOption", paymentOption);
router.post("/razorpayOrder/payment/order",razorPayOrder);
router.post("/razorpay/response",razorPayOrderResponse);
router.post("/paytm/paynow",paytmPaynow);
router.get("/paytmcheckout",paytmcheckout);
router.post("/callback",paytmCallback)
router.get("/paytm-status",paytmStatus)
router.post("/sabPaisa",sabPaisa);
router.post("/response.js%0B",utest)
router.post("/response.js",sabPaisafailed)
router.get("/sabPaisaResponse",sabPaisaResponsePage);
router.get("/errorpage",errorpage);
router.get("/privacy-policy",privacypolicy);
router.get("/terms",termsandcondition);
router.post("/gpayorder",gpayorder);
router.get("/news",newsAndArticles)
router.get("*",errorpage)
module.exports = router;
