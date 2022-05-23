require("dotenv").config();
const request = require("request");
const auth = require("./spauth");
var url = require("url");
const base64 = require("base-64");
const utf8 = require("utf8");
const open = require("open");
const { v4: uuidv4 } = require("uuid");
var querystring = require("querystring");
const portfinder = require("portfinder");
const http = require("http");
var tid = new Date();
const CustomerCart = require("../../src/models/withcartSchema");
const OrderPayment = require("../../src/models/paymentDetails");
const router = require("../pages");
const nodemailer = require("nodemailer");
let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
var spURL = null;
const success = `http://127.0.0.1:3000/response.js`;
const failure = `http://127.0.0.1:3000/response.js`;
var spCkey;

exports.sabPaisa = async (req, res) => {
  const fport = portfinder.getPort((err, freeport) => {
    return freeport;
  });
  spCkey = req.body;
  console.log("this is sabPaisa data", spCkey.keyId);
  const UserData = await CustomerCart.findOne({ customerKey: spCkey.keyId });
  console.log(UserData);
  let tamount = UserData.totalCost;
  let cName = UserData.fullname;
  let splitName = cName.split(" ");
  let fName = cName.split(" ")[0];
  let lName = "";
  for (let i = 0; i < splitName.length; i++) {
    if (i !== 0) {
      lName += splitName[i] + " ";
    }
  }
  console.log("last name = ", lName);
  let cphone = UserData.whatsapp;
  let cemail = UserData.email;
  let cadd =
    UserData.house +
    "," +
    UserData.street +
    "," +
    UserData.landmark +
    "," +
    UserData.city +
    "," +
    UserData.state +
    ". Pincode :" +
    UserData.pinCode;
  console.log(cadd, fName);

  // var spDomain = "https://uatsp.sabpaisa.in/SabPaisa/sabPaisaInit"; // test environment / test server
  var spDomain = "https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit"; // production environment
  var username = process.env.SP_USERNAME;
  var password = process.env.SP_PASS;
  var programID = "5666";
  var clientCode = process.env.SP_CLENT;
  var authKey = process.env.SP_AUTHKEY;
  var authIV = process.env.SP_AUTHIV;
  ////var txnId =315464687897;
  var txnId = Math.floor(Math.random() * 1000000000);
  var tnxAmt = tamount;
  var URLsuccess = success.trim();
  var URLfailure = failure.trim();
  var payerFirstName = fName;
  var payerLastName = lName;
  var payerContact = cphone;
  var payerAddress = UserData.state;
  var payerEmail = cemail;
  var channelId = "m";

  spURL =
    `?clientName=` +
    clientCode.trim() +
    `​&prodCode=&usern=` +
    username.trim() +
    `​&pass=` +
    password.trim() +
    `&amt=​` +
    tnxAmt +
    `​&txnId=` +
    txnId +
    `​&firstName=` +
    payerFirstName +
    `​&lstName=` +
    payerLastName +
    `&contactNo=` +
    payerContact +
    `​&Email=` +
    payerEmail +
    `​&Add=` +
    payerAddress.trim() +
    `​&ru=` +
    URLsuccess.trim() +
    `​&failureURL=` +
    URLfailure;

  console.log("check for mandat", spURL);
  //// spURL = '?clientName=SIPL1​&prodCode=&usern=nishant.jha_2885​&pass=SIPL1_SP2885&amt=​10​&txnId=315464687897​&firstName=Mukesh​&lstName=Kumar';

  while (spURL.includes("â")) {
    // replace + with â
    // console.log("come sppppp=============");
    spURL = spURL.replace("â", "");
  }

  // spURL = "?clientName=SIPL1​&prodCode=";
  var encryptParamUrl = auth.Auth._encrypt(authKey, authIV, spURL);
  // console.log("encryptParamUrl = ",encryptParamUrl);
  spURL = "?query=" + encryptParamUrl + "&clientName=" + clientCode;

  spURL = spDomain + spURL;

  while (spURL.includes("+")) {
    // replace + with %2B
    spURL = spURL.replace("+", "%2B");
  }

  console.log("final URL====", spURL);
  res.json({ spURL });

  open(spURL);
};

exports.utest = async (req, res) => {
  let resUrl = req.url;
  console.log("this is spCkey=>", spCkey);
  const UserData = await CustomerCart.findOne({ customerKey: spCkey.keyId });
  let email = UserData.email;
  let userDbId = UserData._id.toString();
  console.log("during paymentdata===>", UserData);

  ////  console.log("this is return url===>",resUrl)
  let resquery = req.query;
  resquery = resquery.query;
  ////  console.log("this is return query===>",resquery)
  var authKey = process.env.SP_AUTHKEY;
  var authIV = process.env.SP_AUTHIV;
  var decrypturl = auth.Auth._decrypt(authKey, authIV, resquery);
  console.log("this is decrypted url =====>", decrypturl);
  const sabPaisaResparams = Object.fromEntries(new URLSearchParams(decrypturl));
  console.log(sabPaisaResparams);
  var sabPaisaPaymDetail = {
    transDate: sabPaisaResparams.transDate,
    txnId: sabPaisaResparams.SabPaisaTxId,
    clienttxnId: sabPaisaResparams.clientTxnId,
    netAmount: sabPaisaResparams.orgTxnAmount,
    amountPaid: sabPaisaResparams.amount,
    status: sabPaisaResparams.spRespStatus,
    paymentGateway: "SabPaisa",
    mode: sabPaisaResparams.payMode,
  };
  var spRespCode = sabPaisaResparams.spRespCode;
  console.log("this is spRespCode =====>", spRespCode);

  let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
    { _id: userDbId },
    { paymentStatus: true, paymentByGateway: sabPaisaResparams.payMode },
    { returnOriginal: false }
  );

  const customerAndpayment = new OrderPayment({
    userid: UserData._id,
    fullname: UserData.fullname,
    whatsapp: UserData.whatsapp,
    email: UserData.email,
    house: UserData.house,
    street: UserData.street,
    landmark: UserData.landmark,
    pinCode: UserData.pinCode,
    city: UserData.city,
    state: UserData.state,
    originalCost: UserData.originalCost,
    totalCost: UserData.totalCost,
    totalInCart: UserData.totalCart,
    productsInCart: UserData.productsInCart,
    customerKey: UserData.customerKey,
    paymentDetails: [sabPaisaPaymDetail],
  });
  let saveCustomerAndpayment = await customerAndpayment
    .save()
    .then((result) => {
      console.log("paytm data from result==>", result.productsInCart);
      let strmsg = "Your Order of ";
      for (let j = 0; j < result.productsInCart.length; j++) {
        strmsg =
          strmsg +
          result.productsInCart[j].productName +
          " of Qty " +
          result.productsInCart[j].incart +
          ", ";
      }
      strmsg = strmsg + "have been received.";
      console.log(strmsg);
      let mailDetails = {
        to: email,
        from: "noreply.apnakhet@gmail.com",
        subject: "Order Confirmation",
        html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
          <p>We have received payments with payment id : ${sabPaisaPaymDetail.txnId} </p>
          <p>${strmsg}</p>
          <p>Total Amount recived ${result.totalCost} via Paytm </p>
          <p>We are heartly thankful to You for purchasing from us</p>
    `,
      };
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log("Error Occurs");
        } else {
          console.log("Email sent successfully");
        }
      });
    });

  res.render("sabPaisaPaymentStatus", { sabPaisaResparams });

  // res.render(req.url);
};
exports.sabPaisafailed = async (req, res) => {
  let resUrl = req.url;
  console.log("this is spCkey=>", spCkey);
  const UserData = await CustomerCart.findOne({ customerKey: spCkey.keyId });
  let userDbId = UserData._id.toString();
  console.log("during paymentdata===>", UserData);

  ////  console.log("this is return url===>",resUrl)
  let resquery = req.query;
  resquery = resquery.query;
  ////  console.log("this is return query===>",resquery)
  var authKey = process.env.SP_AUTHKEY;
  var authIV = process.env.SP_AUTHIV;
  var decrypturl = auth.Auth._decrypt(authKey, authIV, resquery);
  console.log("this is decrypted url =====>", decrypturl);
  const sabPaisaResparams = Object.fromEntries(new URLSearchParams(decrypturl));
  console.log(sabPaisaResparams);
  var sabPaisaPaymDetail = {
    transDate: sabPaisaResparams.transDate,
    txnId: sabPaisaResparams.SabPaisaTxId,
    clienttxnId: sabPaisaResparams.clientTxnId,
    netAmount: sabPaisaResparams.orgTxnAmount,
    amountPaid: sabPaisaResparams.amount,
    status: sabPaisaResparams.spRespStatus,
    paymentGateway: "SabPaisa",
    mode: sabPaisaResparams.payMode,
  };
  var spRespCode = sabPaisaResparams.spRespCode;
  console.log("this is spRespCode =====>", spRespCode);

  let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
    { _id: userDbId },
    {
      paymentCreated: true,
      paymentStatus: sabPaisaResparams.spRespStatus,
      paymentByGateway: sabPaisaResparams.payMode,
    },
    { returnOriginal: false }
  );

  const customerAndpayment = new OrderPayment({
    userid: UserData._id,
    fullname: UserData.fullname,
    whatsapp: UserData.whatsapp,
    email: UserData.email,
    house: UserData.house,
    street: UserData.street,
    landmark: UserData.landmark,
    pinCode: UserData.pinCode,
    city: UserData.city,
    state: UserData.state,
    originalCost: UserData.originalCost,
    totalCost: UserData.totalCost,
    totalInCart: UserData.totalCart,
    productsInCart: UserData.productsInCart,
    customerKey: UserData.customerKey,
    paymentDetails: [sabPaisaPaymDetail],
  });
  let saveCustomerAndpayment = await customerAndpayment.save();

  res.render("sabPaisaPaymentStatus", { sabPaisaResparams });

  // res.render(req.url);
};

exports.sabPaisaResponsePage = (req, res) => {
  res.render("sabPaisaPaymentStatus");
};
