const async = require("hbs/lib/async");
const { v4: uuidv4 } = require("uuid");
const https = require("https");
const http = require("http");
const Customer = require("../src/models/customerDetailSchema");
const HelpAndSupport = require("../src/models/helpSchema");
const CustomerCart = require("../src/models/withcartSchema");


exports.homePageRoute = (req, res) => {
  res.render("index");
};
exports.gallery = (req, res) => {
  res.render("gallery");
};
exports.shopPageRoute = (req, res) => {
  res.render("shop");
};
exports.cartPageRoute = (req, res) => {
  res.render("cart");
};
exports.helpPageRoute = (req, res) => {
  res.render("help");
};
exports.infoPageRoute = (req, res) => {
  res.render("info");
};
exports.aboutPageRoute = (req, res) => {
  res.render("about");
};
exports.customerAddress = (req, res) => {
  res.render("customerAddress");
};
exports.saveAddress = async (req, res) => {
  var parseData = req.body;
  try {
    const customerDetail = new Customer({
      fullname: parseData.fullname,
      whatsapp: parseData.whatsapp,
      email: parseData.custEmail,
      house: parseData.house,
      street: parseData.street,
      landmark: parseData.landmark,
      pinCode: parseData.postPinCode,
      city: parseData.postCity,
      state: parseData.postState,
    });
    const saveCustAddress = await customerDetail.save();
    console.log("data saved only address");
    res.status(201).redirect("/paymentOption");
  } catch (err) {
    console.log(err);
  }
};
exports.saveAddressandCart = async (req, res) => {
  var cartSaveid;
  var parseData = req.body;

  var cartReceived = parseData.cartDataObj;

  console.log("received this data", parseData.cartDataObj);
  var cartReceivedList = Object.keys(cartReceived).map((key) => {
    return cartReceived[key];
  });
  try {
    const customerDetailCart = new CustomerCart({
      fullname: parseData.fullname,
      whatsapp: parseData.whatsapp,
      email: parseData.custEmail,
      house: parseData.house,
      street: parseData.street,
      landmark: parseData.landmark,
      pinCode: parseData.postPinCode,
      city: parseData.postCity,
      state: parseData.postState,
      originalCost: parseData.oriTotalCost,
      totalCost: parseData.totalCost,
      totalInCart: parseData.totalCart,
      productsInCart: cartReceivedList,
      customerKey: parseData.customerKey,
    });
    const saveCustAddress = await customerDetailCart.save((err, data) => {
      cartSaveid = data._id.toString();
      console.log("this is cart id", cartSaveid);
    });

    console.log("data saved");
  } catch (err) {
    console.log(err);
  }  

  res.send(cartSaveid);
};


exports.helpQuerry = async (req, res) => {
  try {
    const { querrymail, querrysubject, querrytext } = req.body;
    if (querrymail != null && querrysubject != null && querrytext != null) {
      const helpQuerry = new HelpAndSupport({
        email: querrymail,
        topic: querrysubject,
        message: querrytext,
      });
      let helpquerry = await helpQuerry.save();
      res.status(201).render("index");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.paymentOption = (req, res) => {
  res.render("paymentOption");
};



exports.errorpage = (req, res) => {
  res.render("error",{statusCode : 404,error:"Invalid Gateway ",desMsg:"Go to Home Page By Clicking Below Button"});
};

exports.paytmcheckout = (req, res) => {
  res.render("paytm");
};
exports.privacypolicy = (req, res) => {
  res.render("privacyPolicy");
};
exports.termsandcondition = (req, res) => {
  res.render("termsAndCondition");
};
exports.gpayorder = (req, res) => {
  console.log(req.body)
  res.send()
};
exports.newsAndArticles = (req, res) => {
  res.render("news");
};
exports.razorStatus = (req, res) => {
  res.render("razorpayStatus");
};
