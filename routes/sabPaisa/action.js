require("dotenv").config();
const request = require("request");
const auth = require("./spauth");
var url = require("url");
const base64 = require("base-64");
const utf8 = require("utf8");
const opn = require("open");
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
  // const fport = portfinder.getPort((err, freeport) => {
  //   return freeport;
  // });
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

  var forChecksumString = utf8.encode(
    `Add` +
      payerAddress +
      `Email` +
      payerEmail +
      `amountTypechannelIdcontactNo` +
      payerContact +
      `failureURL` +
      URLfailure +
      `firstName` +
      payerFirstName +
      `grNumberlstName` +
      payerLastName +
      `midNameparam1param2param3param4pass` +
      password +
      `programIdru` +
      URLsuccess +
      `semstudentUintxnId` +
      txnId +
      `udf10udf11udf12udf13udf14udf15udf16udf17udf18udf19udf20udf5udf6udf7udf8udf9usern` +
      username
  );
  while (forChecksumString.includes("â")) {
    // replace + with â
    forChecksumString = forChecksumString.replace("â", "");
  }
  var checksumString = auth.Auth._checksum(authKey, forChecksumString);
  spURL = utf8.encode(
    `?clientName=` +
      clientCode +
      `​&prodCode=&usern=` +
      username +
      `​&pass=` +
      password +
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
      payerAddress +
      `​&ru=` +
      URLsuccess.trim() +
      `​&failureURL=` +
      URLfailure +
      `&checkSum=` +
      checksumString
  );
  while (spURL.includes("â")) {
    // replace + with â
    spURL = spURL.replace("â", "");
  }
  spURL = spDomain + spURL;

  while (spURL.includes("+")) {
    // replace + with %2B
    spURL = spURL.replace("+", "%2B");
  }

  //window.open(spURL);
  console.log("this is url", spURL);

  // opens the url in the default browser
  // opn(spURL.replace('/[^a-zA-Z0-9]/g', ""), {app: ['google chrome']});
  spURL = spURL.replace(//g, "");
  console.log("sending this url=>",spURL);
  res.json({url:spURL})
  // opn(spURL.replace(//g, ""));
  
};

exports.postSpRes = async (req, res) => {
  // console.log("received from post",req.spCkey.keyId)
  let resUrl = url.parse(req.url, true).query;
  console.log("this is res url==>", resUrl);
  console.log("this is spCkey=>", spCkey);
  if (spCkey.keyId === undefined) {
    res.render("error", {
      statusCode: 404,
      error: "Session Expired if money deducted twice, Confirm by enquiry",
      desMsg: "Go to Home !!",
    });
  } else {
    const UserData = await CustomerCart.findOne({ customerKey: spCkey.keyId });
    let email = UserData.email;
    let userDbId = UserData._id.toString();
    spCkey.keyId = undefined;
    // console.log("during paymentdata===>", UserData);

    // ////  console.log("this is return url===>",resUrl)

    // ////  console.log("this is return query===>",resquery)

    var sabPaisaPaymDetail = {
      transDate: resUrl.transDate,
      txnId: resUrl.SabPaisaTxId,
      clienttxnId: resUrl.clientTxnId,
      netAmount: resUrl.orgTxnAmount,
      amountPaid: resUrl.amount,
      status: resUrl.spRespStatus,
      paymentGateway: "SabPaisa",
      mode: resUrl.payMode,
    };
    var spRespCode = resUrl.spRespCode;
    console.log("this is spRespCode =====>", spRespCode, resUrl.transDate);

    let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
      { _id: userDbId },
      { paymentStatus: true, paymentByGateway: resUrl.payMode },
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
        strmsg = strmsg + `is ${sabPaisaPaymDetail.status}.${resUrl.reMsg}`;
        console.log(strmsg);
        let mailDetails = {
          to: email,
          from: "noreply.apnakhet@gmail.com",
          subject: "Order Status",
          html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
            <p>We have received payments with payment id : ${sabPaisaPaymDetail.txnId} </p>
            <p>${strmsg}</p>
            <p>Total Amount recived ${result.totalCost} via SabPaisa </p>
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
  }

  //{ sabPaisaResparams }

  res.render("sabPaisaPaymentStatus", { sabPaisaResparams: resUrl });

  // res.render(req.url);
};

exports.spresponse = async (req, res) => {
  let resUrl = url.parse(req.url, true).query;
  console.log("this is res url==>", resUrl);

  console.log("this is spCkey=>", spCkey);
  if (spCkey.keyId === undefined) {
    res.render("error", {
      statusCode: 404,
      error: "Session Expired if money deducted Confirm by enquiry",
      desMsg: "Go to Home !!",
    });
  } else {
    const UserData = await CustomerCart.findOne({ customerKey: spCkey.keyId });
    let email = UserData.email;
    let userDbId = UserData._id.toString();
    spCkey.keyId = undefined;
    // console.log("during paymentdata===>", UserData);

    // ////  console.log("this is return url===>",resUrl)

    // ////  console.log("this is return query===>",resquery)

    var sabPaisaPaymDetail = {
      transDate: resUrl.transDate,
      txnId: resUrl.SabPaisaTxId,
      clienttxnId: resUrl.clientTxnId,
      netAmount: resUrl.orgTxnAmount,
      amountPaid: resUrl.amount,
      status: resUrl.spRespStatus,
      paymentGateway: "SabPaisa",
      mode: resUrl.payMode,
    };
    var spRespCode = resUrl.spRespCode;
    console.log("this is spRespCode =====>", spRespCode, resUrl.transDate);

    let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
      { _id: userDbId },
      { paymentStatus: true, paymentByGateway: resUrl.payMode },
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
        strmsg = strmsg + `is ${sabPaisaPaymDetail.status}.${resUrl.reMsg}`;
        console.log(strmsg);
        let mailDetails = {
          to: email,
          from: "noreply.apnakhet@gmail.com",
          subject: "Order Status",
          html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
          <p>We have received payments with payment id : ${sabPaisaPaymDetail.txnId} </p>
          <p>${strmsg}</p>
          <p>Total Amount recived ${result.totalCost} via SabPaisa </p>
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

    //{ sabPaisaResparams }
  }
  res.render("sabPaisaPaymentStatus", { sabPaisaResparams: resUrl });
};
