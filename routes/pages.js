const express = require("express");
const router = express.Router();
const qs = require("querystring");
var https = require("https");

// const checksum_lib = require("./paytm/cheksum");
// const config = require("./paytm/config");

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

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
  newsAndArticles,
  getdata
} = require("../controllers/pagesControlFile");

const { sabPaisa, postSpRes, spresponse } = require("./sabPaisa/action");
const {
  paytmPaynow,
  paytmCallback,
} = require("../controllers/paytmController");
const {
  razorPayOrder,
  razorPayOrderResponse,
} = require("../controllers/razorPayController");
const {
  adminloginpage,
  verifyAdmin,
  dashboardAdmin,
  orderOneDay,
  orderOneDaySearch,
  admincartStage,
  admincartStageSearch,
  adminpaymentFailed,
  adminpaymentFailedSearch,
  adminlogout,
  admintotaldata,
  admintotaldataSearch,
  adminquerries,
  adminquerriesSearch,
} = require("../controllers/adminControlFile");

router.get("/", homePageRoute);
router.post("/", getdata);
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
router.post("/razorpayOrder/payment/order", razorPayOrder);
router.post("/razorpay/response", razorPayOrderResponse);
router.post("/paytm/paynow", paytmPaynow);
router.get("/paytmcheckout", paytmcheckout);
router.post("/callback", paytmCallback);
router.post("/sabPaisa", sabPaisa);
router.post("/response.js", postSpRes);
router.get("/response.js", spresponse);
router.get("/errorpage", errorpage);
router.get("/privacy-policy", privacypolicy);
router.get("/terms", termsandcondition);
router.post("/gpayorder", gpayorder);
router.get("/news", newsAndArticles);
router.get("/admin/login", adminloginpage);
router.post("/verifyadmin", verifyAdmin);
router.get("/admindashboard", dashboardAdmin);
router.get("/adminorderoneday", orderOneDay);
router.post("/adminorderoneday", orderOneDaySearch);
router.get("/admincartStage", admincartStage);
router.post("/admincartStage", admincartStageSearch);
router.get("/adminpaymentDash", adminpaymentFailed);
router.post("/adminpaymentDash", adminpaymentFailedSearch);
router.post("/adminlogout", adminlogout);
router.get("/admintotaldata", admintotaldata);
router.post("/admintotaldata", admintotaldataSearch);
router.get("/adminquerries", adminquerries);
router.post("/adminquerries", adminquerriesSearch);
router.get("*", errorpage);
module.exports = router;
