require("dotenv").config();
const request = require("request");
const auth = require("./spauth");
var url = require("url");
const path = require("path");
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
let greetpath = path.join(__dirname, "../../public/images");
console.log("greet from sabpaisa", greetpath);
var spURL = null;
// const success = `http://localhost:3000/response.js`;
// const failure = `http://localhost:3000/response.js`;
const success = `https://apnakhet.org/response.js`;
const failure = `https://apnakhet.org/response.js`;

var spCkey;

exports.sabPaisa = async (req, res) => {
  try {
    spCkey = req.body;
  console.log("this is sabPaisa data", spCkey.keyId);
  if (spCkey.keyId === "--something went wrong---") {
    console.log("i am coming");
    res.json({ paymentstatus: "absentKey" });
  } else {
    const UserData = await CustomerCart.findOne({ customerKey: spCkey.keyId });
    if (UserData === null) {
      console.log("hyy i am here");
      res.json({ paymentstatus: "err" });
    }
    console.log("payment status==>", UserData.paymentStatus);
    console.log(UserData.paymentStatus === "success");
    if (UserData.paymentStatus === "success") {
      res.json({ paymentstatus: "success" });
    } else {
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
        spURL = spURL.replace("+", "%2B");
      }

      console.log("this is url", spURL);

      spURL = spURL.replace(//g, "");
      console.log("sending this url=>", spURL);
      res.json({ url: spURL });
      // opn(spURL.replace(//g, ""));
    }
  }
  } catch (error) {
    res.render("error", {
      statusCode: 404,
      mainmsg: "Try Again or After sometime",
      error:
        "oops! Something went unexpected,We are working on it..Try again after sometimes",
      desMsg: "Go to Home !!",
    });
  }
  
};

exports.postSpRes = async (req, res) => {
  try {
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
    let message;

    if (resUrl.spRespStatus === "FAILED") {
      message = "failed";
      let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
        { _id: userDbId },
        {
          paymentCreated: true,
          paymentStatus: "failed",
          paymentByGateway: resUrl.payMode,
        },
        { returnOriginal: false }
      );
    } else {
      message = "success";
      let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
        { _id: userDbId },
        {
          paymentCreated: true,
          paymentStatus: "success",
          paymentByGateway: resUrl.payMode,
        },
        { returnOriginal: false }
      );
    }
    let mailDetails;
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
        let strmsg = "having item(s) in cart  ";
        for (let j = 0; j < result.productsInCart.length; j++) {
          strmsg =
            strmsg +
            result.productsInCart[j].productName +
            " of Qty " +
            result.productsInCart[j].incart +
            ", ";
        }
        strmsg = strmsg + `is ${sabPaisaPaymDetail.status}.`;
        console.log(strmsg);
        if (sabPaisaPaymDetail.status === "FAILED") {
          mailDetails = {
            to: email,
            from: "no-reply@apnakhet.org",
            subject: "Order Status",
            html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
              <p>Order with payment id : ${sabPaisaPaymDetail.txnId} </p>
              <p>${strmsg}</p>
              <p>of Total Amount  ${result.totalCost} via SabPaisa </p>
              <p>Please try again Or aftr Some time </p>
              <p>Contact us  in case any enquery</p>
              <a herf="https://www.apnakhet.org/help" > contact here: https://www.apnakhet.org/help</a>
        `,
          };
        } else {
          mailDetails = {
            to: email,
            from: "no-reply@apnakhet.org",
            subject: "Order Status",
            html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
            <p>We have received payments with payment id : ${sabPaisaPaymDetail.txnId} </p>
            <p>${strmsg}</p>
            <p>of Total Amount  ${result.totalCost} via SabPaisa </p>
            <p>We are heartly thankful to You for purchasing from us</p>
            <img src="cid:uniq-greet.jpeg"  alt="greeting image" />
            `,
            attachments: [
              {
                filename: "greet.jpeg",
                path: greetpath + "\\greet.jpeg",
                cid: "uniq-greet.jpeg",
              },
            ],
          };
        }

        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log("Error Occurs===>", err);
          } else {
            console.log("Email sent successfully", mailDetails);
          }
        });
      });
  }

  //{ sabPaisaResparams }

  res.render("sabPaisaPaymentStatus", { sabPaisaResparams: resUrl });
  } catch (error) {
    res.render("error", {
      statusCode: 404,
      mainmsg: "Try again or after sometime",
      error:
        "oops! Something went unexpected,If money deducted..Confirm by Enquiry",
      desMsg: "Go to Home !!",
    });
  }
  

  // res.render(req.url);
};

exports.spresponse = async (req, res) => {
  try {
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

    // let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
    //   { _id: userDbId },
    //   { paymentStatus: true, paymentByGateway: resUrl.payMode },
    //   { returnOriginal: false }
    // );
    let message;
    if (resUrl.spRespStatus === "FAILED") {
      message = "failed";
      let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
        { _id: userDbId },
        {
          paymentCreated: true,
          paymentStatus: "failed",
          paymentByGateway: resUrl.payMode,
        },
        { returnOriginal: false }
      );
    } else {
      message = "success";
      let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
        { _id: userDbId },
        {
          paymentCreated: true,
          paymentStatus: "success",
          paymentByGateway: resUrl.payMode,
        },
        { returnOriginal: false }
      );
    }
    let mailDetails;
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
      paymentStatus: message,
      paymentDetails: [sabPaisaPaymDetail],
    });
    let saveCustomerAndpayment = await customerAndpayment
      .save()
      .then((result) => {
        console.log("paytm data from result==>", result.productsInCart);
        let strmsg = "having item(s) in cart  ";
        for (let j = 0; j < result.productsInCart.length; j++) {
          strmsg =
            strmsg +
            result.productsInCart[j].productName +
            " of Qty " +
            result.productsInCart[j].incart +
            ", ";
        }
        strmsg = strmsg + `is ${sabPaisaPaymDetail.status}.`;
        console.log(strmsg);
        if (sabPaisaPaymDetail.status === "FAILED") {
          mailDetails = {
            to: email,
            from: "no-reply@apnakhet.org",
            subject: "Order Status",
            html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
            <p>Order with payment id : ${sabPaisaPaymDetail.txnId} </p>
            <p>${strmsg}</p>
            <p>of Total Amount  ${result.totalCost} via SabPaisa </p>
            <p>Please try again Or aftr Some time </p>
            <p>Contact us on below link in case of money deduction</p>
            <a herf="https://www.apnakhet.org/help"> Contact here :https://www.apnakhet.org/help</a>
      `,
          };
        } else {
          mailDetails = {
            to: email,
            from: "no-reply@apnakhet.org",
            subject: "Order Status",
            html: `<h2>Greetings from Apna Khet Bagan Foundtion</h2>
          <p>We have received payments with payment id : ${sabPaisaPaymDetail.txnId} </p>
          <p>${strmsg}</p>
          <p>of Total Amount  ${result.totalCost} via SabPaisa </p>
          <p>We are heartly thankful to You for purchasing from us</p>
          <img src="cid:uniq-greet.jpeg" style="width:250px;" alt="greeting image" />
          `,
            attachments: [
              {
                filename: "greet.jpeg",
                path: greetpath + "\\greet.jpeg",
                cid: "uniq-greet.jpeg",
              },
            ],
          };
        }

        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log("Error Occurs");
          } else {
            console.log("Email sent successfully");
          }
        });
      });
  }
  res.render("sabPaisaPaymentStatus", { sabPaisaResparams: resUrl });
  } catch (error) {
    res.render("error", {
      statusCode: 404,
      mainmsg: "Try again or after sometime",
      error:
        "oops! Something went unexpected,If money deducted..Confirm by Enquiry",
      desMsg: "Go to Home !!",
    });
  }
  
};
