const async = require("hbs/lib/async");
const { v4: uuidv4 } = require("uuid");
const https = require("https");
const http = require("http");
const Customer = require("../src/models/customerDetailSchema");
const HelpAndSupport = require("../src/models/helpSchema");
const CustomerCart = require("../src/models/withcartSchema");
const Product = require("../src/models/productModel");


exports.homePageRoute = (req, res) => {
  res.render("index");
};

exports.getdata = async(req,res) =>{
  try {
    let category = req.body.category;
    console.log(category)
    let productData = await Product.find({
      section:category
    })
    console.log(category)
    let fruitOnDemandData = await Product.find({
      section:"fruitOnDemand"
    })
    let demandproduct = await Product.find({
      section:"productOnDemand"
    })
    console.log("this is aam",fruitOnDemandData);
    res.json({prods : productData,fruit:fruitOnDemandData,demandproduct:demandproduct,msg:"his is message"})

  } catch (error) {
    console.log(error)
  }
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
  let amountcheck;
  let keycheck;
  try {
    amountcheck =  req.cookies.amount;
    keycheck =  req.cookies.customerKey;
    amountcheck = parseInt(amountcheck);
    console.log(typeof(amountcheck)) 
    if(amountcheck !== undefined  && amountcheck > 100){
      res.render("customerAddress");
    }else{
      res.redirect("/shop");
    }
  } catch (error) {
    res.render("error",{statusCode : 404,error:"Add Some Before checkout",desMsg:"Go to Home Page By Clicking Below Button"});
    
  }
};
exports.saveAddress = async (req, res) => {
  var parseData = req.body;
      let fullname= parseData.fullname.toLowerCase();
      let whatsapp= parseData.whatsapp.toLowerCase();
      let email= parseData.custEmail;
      let house= parseData.house.toLowerCase();
      let street= parseData.street.toLowerCase();
      let landmark= parseData.landmark.toLowerCase();
      let pinCode= parseData.postPinCode.toLowerCase();
      let city= parseData.postCity.toLowerCase();
      let state= parseData.postState.toLowerCase();
      console.log("==========>",fullname)
  try {
    const customerDetail = new Customer({
      fullname: fullname,
      whatsapp: whatsapp,
      email: email,
      house: house,
      street: street,
      landmark: landmark,
      pinCode: pinCode,
      city: city,
      state: state,
    });
    const saveCustAddress = await customerDetail.save();
    console.log("data saved only address");
    res.status(201).redirect("/paymentOption");
  } catch (err) {
    console.log(err);
    res.render("error",{statusCode : 404,error:"Ooops!! went Unexpected , We will back soon :-P ,Have a nice day!!",desMsg:"Try After few Hours , Techies are solving this issue."});
  }
};
exports.saveAddressandCart = async (req, res) => {
  var cartSaveid;
  var parseData = req.body;
  let fullname= parseData.fullname.toLowerCase();
  let whatsapp= parseData.whatsapp.toLowerCase();
  let email= parseData.custEmail;
  let house= parseData.house.toLowerCase();
  let street= parseData.street.toLowerCase();
  let landmark= parseData.landmark.toLowerCase();
  let pinCode= parseData.postPinCode.toLowerCase();
  let city= parseData.postCity.toLowerCase();
  let state= parseData.postState.toLowerCase();
  var cartReceived = parseData.cartDataObj;

  console.log("received this data", parseData.cartDataObj);
  var cartReceivedList = Object.keys(cartReceived).map((key) => {
    return cartReceived[key];
  });
  try {
    const customerDetailCart = new CustomerCart({
      fullname: fullname,
      whatsapp: whatsapp,
      email: email,
      house: house,
      street: street,
      landmark: landmark,
      pinCode: pinCode,
      city: city,
      state: state,
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
    res.render("error",{statusCode : 404,error:"Ooops!! went Unexpected , We will back soon :-P ,Have a nice day!!",desMsg:"Try After few Hours , Techies are solving this issue."});
  }  

  res.send(cartSaveid);
};


exports.helpQuerry = async (req, res) => {
  try {
    const { querryname,querrymail, querrysubject, querrytext } = req.body;
    if (querryname != null && querrymail != null && querrysubject != null && querrytext != null) {
      const helpQuerry = new HelpAndSupport({
        name:querryname,
        email: querrymail,
        topic: querrysubject,
        message: querrytext,
      });
      let helpquerry = await helpQuerry.save();
      res.status(201).render("index");
    }
  } catch (err) {
    console.log(err);
    res.render("error",{statusCode : 404,error:"Ooops!! went Unexpected , We will back soon :-P ,Have a nice day!!",desMsg:"Try After few Hours , Techies are solving this issue."});
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

