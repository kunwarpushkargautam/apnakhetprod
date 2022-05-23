require("dotenv").config();
const Customer = require("../src/models/customerDetailSchema");
const HelpAndSupport = require("../src/models/helpSchema");
const CustomerCart = require("../src/models/withcartSchema");
const OrderPayment = require("../src/models/paymentDetails");
var Razorpay = require("razorpay");
let instance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});
const twilio = require('twilio');
const twilioClient = twilio(
       process.env.TWILIO_ACCOUNT_SID,
       process.env.TWILIO_AUTH_TOKEN
);
var UserData;
var userDbId;
var { receipt } = require("../src/billnumber");

const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// console.log("check razorpay",instance.key_id)

exports.razorPayOrder = async (req, res) => {
  let datakey = req.body.keyId;
  console.log(datakey);
  UserData = await CustomerCart.findOne({ customerKey: datakey });
  userDbId = UserData._id.toString();
  let tamount = UserData.totalCost;
  let phone = UserData.whatsapp;
  let email = UserData.email;
  let fname = UserData.fullname;
  let products = UserData.productsInCart;
  let productArrayMail=[];
  for(let i =0;i<products.length;i++){
    let pObj = {};
    pObj.name = products[i].productName;
    pObj.cart = products[i].incart;
    pObj.cost = products[i].cost;
    productArrayMail.push(pObj)
  }
  console.log("products===>",productArrayMail)
  let receiptno = receipt()[0];
  console.log(receiptno);
  let order = await instance.orders.create({
    amount: tamount,
    currency: "INR",
    receipt: receiptno,
  });
  console.log("order generated successfully==>", order);
  res.status(201).json({
    success: true,
    order,
    tamount,
    phone,
    email,
    fname,
    productArrayMail,
    key:instance.key_id
  });
};

exports.razorPayOrderResponse = async(req, res) => {
  let razorpay_payment_id = req.body.razorpay_payment_id;
  let tosendEmail = req.body.email;
  let mailObj = req.body.mailitems;
  let amountPaid = req.body.amount;
  let phone = req.body.phone;
  console.log(amountPaid)
  let strmsg='Your Order of ';
  for(let j=0;j<mailObj.length;j++){
      strmsg = strmsg + mailObj[j].name + ' of Qty '+ mailObj[j].cart +', ';
  }
  strmsg = strmsg + 'have been received.'
  console.log(strmsg);
  if (UserData === undefined) {
    res.render("error", {
      statusCode: 404,
      error: "Session Expired if money deducted Confirm by enquiry",
      desMsg: "Go to Home !!",
    });
  }
  if (razorpay_payment_id) {
     
    var paytmPaymDetail = {
      transDate: '',
      txnId: razorpay_payment_id,
      clienttxnId: '',
      netAmount: '',
      amountPaid: amountPaid,
      status: '',
      paymentGateway: "RazorPay",
      mode: '',
    };
  
    let updatePaymentInCart = await CustomerCart.findOneAndUpdate(
      { _id: userDbId },
      { paymentStatus: true, paymentByGateway: "RazorPay" },
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

    let mailDetails = {
      from: "noreply.apnakhet@gmail.com",
      to: tosendEmail,
      subject: "Order Confirmation",
      html:`<h5>Greetings from Apna Khet Bagan Foundtion</h5>
            <p>We have received payments with payment id : ${razorpay_payment_id} </p>
            <p>${strmsg}</p>
            <p>Total Amount recived ${amountPaid} via RazorPay </p>
            <p>We are heartly thankful to You for purchasing from us</p>
      `
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log("Error Occurs");
      } else {
        console.log("Email sent successfully");
      }
    });
 
    twilioClient.messages 
    .create({ 
       body: strmsg+'with total payment of '+ amountPaid +' thank you!!. contact: wa.me/919262290959 Or mail us : business@apnakhet.org. Visit: http://www.apnakhet.in ', 
       from: 'whatsapp:+14155238886',       
       to: `whatsapp:+91${phone}` 
     }) 
    .then(message => console.log("wasdasd9u==>",message.sid)) 
    .done();

  }
  res.send();
};
