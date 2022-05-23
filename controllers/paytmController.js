require("dotenv").config();
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const qs = require("querystring");
const CustomerCart = require("../src/models/withcartSchema");
const OrderPayment = require("../src/models/paymentDetails");
const PaytmChecksum = require("../public/paytm/checksum");
const PaytmConfig = require("../public/paytm/config");
const { Console } = require("console");
const nodemailer = require("nodemailer");
const twilio = require('twilio');
const twilioClient = twilio(
       process.env.TWILIO_ACCOUNT_SID,
       process.env.TWILIO_AUTH_TOKEN
);

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

var UserData;
var userDbId;

exports.paytmPaynow = async (req, res) => {
  var data = req.body;
  console.log(data);
  UserData = await CustomerCart.findOne({ customerKey: data.key });
  let phone = UserData.whatsapp;
  let fname = UserData.fullname;
  let products = UserData.productsInCart;
  userDbId = UserData._id.toString();
  console.log("this is user data==>", UserData);
  console.log("checking paytm porcess..emv", process.env.PAYTM_KEY);
  console.log("checking paytm porcess..emv", process.env.PAYTM_MID);
  let tamount = UserData.totalCost;
  let email = UserData.email;

  const orderId = "TEST_" + new Date().getTime();

  const paytmParams = {};

  paytmParams.body = {
    requestType: "Payment",
    mid: PaytmConfig.PaytmConfig.mid,
    websiteName: PaytmConfig.PaytmConfig.website,
    orderId: orderId,
    callbackUrl: "http://localhost:3000/callback",
    txnAmount: {
      value: tamount,
      currency: "INR",
    },
    userInfo: {
      custId: email,
    },
  };
  console.log("paytmParms", paytmParams);
  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    PaytmConfig.PaytmConfig.key
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=${PaytmConfig.PaytmConfig.mid}&orderId=${orderId}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
    };

    var response = "";
    var post_req = https.request(options, function (post_res) {
      post_res.on("data", function (chunk) {
        response += chunk;
      });

      post_res.on("end", function () {
        response = JSON.parse(response);
        console.log("txnToken:", response);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(`<html>
                                <head>
                                    <title>Show Payment Page</title>
                                </head>
                                <body>
                                    <center>
                                        <h1>Please do not refresh this page...</h1>
                                    </center>
                                    <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${PaytmConfig.PaytmConfig.mid}&orderId=${orderId}" name="paytm">
                                        <table border="1">
                                            <tbody>
                                                <input type="hidden" name="mid" value="${PaytmConfig.PaytmConfig.mid}">
                                                    <input type="hidden" name="orderId" value="${orderId}">
                                                    <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                                         </tbody>
                                      </table>
                                                    <script type="text/javascript"> document.paytm.submit(); </script>
                                   </form>
                                </body>
                             </html>`);
        res.end();
      });
    });

    post_req.write(post_data);
    post_req.end();
  });
  // });
};

exports.paytmCallback = async (req, res) => {
  console.log(
    "=================================== CALLBACK START ======================================================="
  );
  let strmsg;
  console.log("this is res call==>", req.body);
  var data = req.body;
  ////console.log("this is res CHECKSUMHASH==>", data.CHECKSUMHASH);
  console.log("This is User Data==>", UserData);
  
  if (UserData === undefined) {
    res.render("error", {
      statusCode: 404,
      error: "Session Expired if money deducted Confirm by enquiry",
      desMsg: "Go to Home !!",
    });
  }
  let email = UserData.email;
  var paytmPaymDetail = {
    transDate: data.TXNDATE,
    txnId: data.TXNID,
    clienttxnId: data.BANKTXNID,
    netAmount: UserData.originalCost,
    amountPaid: data.TXNAMOUNT,
    status: data.RESPMSG,
    paymentGateway: "Paytm",
    mode: data.PAYMENTMODE,
  };

  let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
    { _id: userDbId },
    { paymentStatus: true, paymentByGateway: "paytm" },
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
    paymentDetails: [paytmPaymDetail],
  });
  let saveCustomerAndpayment = await customerAndpayment
    .save()
    .then((result) => {
      console.log("paytm data from result==>", result.productsInCart);
      strmsg = "Your Order of ";
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
            <p>We have received payments with payment id : ${paytmPaymDetail.txnId} </p>
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
    console.log(strmsg)
    twilioClient.messages 
      .create({ 
         body: strmsg+'with total payment of '+UserData.totalCost +' thank you!!. contact: wa.me/919262290959 Or mail us : business@apnakhet.org. Visit: http://www.apnakhet.in ', 
         from: 'whatsapp:+14155238886',       
         to: `whatsapp:+91${UserData.whatsapp}` 
       }) 
      .then(message => console.log("wasdasd9u==>",message.sid)) 
      .done();

  var body = "";

  var paytmChecksum = data.CHECKSUMHASH;
  // delete post_data.CHECKSUMHASH;

  var isVerifySignature = PaytmChecksum.verifySignature(
    data,
    PaytmConfig.PaytmConfig.key,
    paytmChecksum
  );
  if (isVerifySignature) {
    console.log("Checksum Matched");

    var paytmParams = {};

    paytmParams.body = {
      mid: PaytmConfig.PaytmConfig.mid,
      orderId: data.ORDERID,
    };

    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      PaytmConfig.PaytmConfig.key
    ).then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        /* for Staging */
        hostname: "securegw-stage.paytm.in",

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: "/v3/order/status",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      // Set up the request
      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", function () {
          //console.log("Response: ", response);//getting response!!! hurray!!
          ////console.log("type of Response: ", typeof(response));
          let parsedResponse = JSON.parse(response);
          // res.write(response);
          console.log("PARSED RESPONSE", parsedResponse);

          res.render("paytmStatus", { parsedResponse });
          // res.end();
        });
      });

      // post the data
      //console.log("past data=>",post_data)
      post_req.write(post_data);
      post_req.end();
    });
  } else {
    console.log("Checksum Mismatched");
  }
};

exports.paytmStatus = (req, res) => {
  res.render("paytmStatus");
};
