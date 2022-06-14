const CustomerCart = require("../src/models/withcartSchema");
const OrderPayment = require("../src/models/paymentDetails");
const Querry = require("../src/models/helpSchema");
const AdminManager = require("../src/models/adminDetailSchema");

const async = require("hbs/lib/async");
const bcrypt = require("bcrypt");
const url = require("url");
const querystring = require("querystring");
let adminIdData, adminPassData;
exports.adminloginpage = (req, res) => {
  res.render("adminlogin");
};

exports.verifyAdmin = async (req, res) => {
  let reqbody = req.body;
  adminIdData = reqbody.adminId;
  adminPassData = reqbody.adminPass;

  let UserData;
  try {
    UserData = await AdminManager.findOne({ adminId: adminIdData });

    if (UserData !== undefined) {
      if (UserData.adminPassword === adminPassData) {
        var hashId = bcrypt.hashSync(adminIdData, 12);
        var hashPass = bcrypt.hashSync(adminPassData, 12);
        res.cookie("adminId", hashId, {
          expires: new Date(Date.now() + 0.5 * 60 * 60 * 1000),
        });
        res.cookie("adminPass", hashPass, {
          expires: new Date(Date.now() + 0.5 * 60 * 60 * 1000),
        });
        console.log("login valid");
        res.redirect("/admindashboard");
      } else {
        res.render("error", {
          statusCode: "oppssss!!",
          error: "Wrong Password Or id",
          desMsg: "Try to Login Again",
        });
      }
    } else {
      console.log("cannot find any admin of Id");
    }
  } catch (error) {
    console.log("catched error", error);
  }
};

exports.dashboardAdmin = async (req, res) => {
  let adminId;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;  
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);

    const orderPaidCount = await OrderPayment.count({
      paymentStatus: "success",
    });
    const paymentFailedCount = await OrderPayment.count({});
    const inCartStageCount = await CustomerCart.count({
      paymentCreated: false,
    });
    const OneDayOrderCount = await OrderPayment.count({
      createdAt: {
        $gte: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      paymentStatus: "success",
    }).sort({ createdAt: -1 });
    const totalDataCount = await CustomerCart.count({});
    const QuerryCount = await Querry.count({});
    if (authId === true && authPass === true) {
      res.render("AdminConsole", {
        paidCount: orderPaidCount,
        failedPayment: paymentFailedCount,
        inCart: inCartStageCount,
        total: totalDataCount,
        lastOneday: OneDayOrderCount,
        querry: QuerryCount,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.redirect("/admin/login");
  }
};

exports.orderOneDay = async (req, res) => {
  let day = 1;
  
  let adminId;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const OneDayOrderCount = await OrderPayment.find({
        createdAt: {
          $gte: new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000),
        },
        paymentStatus: "success",
      }).sort({ createdAt: -1 });
      // console.log("this is total count===>", OneDayOrderCount[0].productsInCart);
      res.render("datadisplay", {
        data: OneDayOrderCount,
        day: day
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.redirect("/admin/login");
  }
};
exports.orderOneDaySearch = async (req, res) => {
  let searchtext = req.body.search;
  let searchday = req.body.day;
  searchtext = searchtext.trim();
  searchday = searchday.trim();
  let day;
  if (searchday) {
    day = searchday;
  } else {
    day = 1;
  }
  
  let adminId;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const regexSearch = new RegExp(searchtext, "i");
      const OneDayOrderCount = await OrderPayment.find({
        createdAt: {
          $gte: new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000),
        },
        $or: [
          { fullname: { $regex: regexSearch } },
          { email: { $regex: regexSearch } },
          { paymentStatus: { $regex: regexSearch } },
        ],

        paymentStatus: "success",
      }).sort({ createdAt: -1 });
      // console.log("this is total count===>", OneDayOrderCount[0].productsInCart);
      res.render("datadisplay", {
        data: OneDayOrderCount,
        day: day,
        searchvalue: searchtext,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.redirect("/admin/login");
  }
};

exports.admincartStage = async (req, res) => {
  
  let adminId;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const inCartStageData = await CustomerCart.find({
        paymentCreated: false,
      });
      // console.log("this is total count===>", OneDayOrderCount[0].productsInCart);
      res.render("cartStage", {
        data: inCartStageData
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.redirect("/admin/login");
  }
};
exports.admincartStageSearch = async (req, res) => {
  let searchtext = req.body.search;
  let searchday = req.body.day;
  searchtext = searchtext.trim();
  searchday = searchday.trim();
  let day;
  let adminId, inCartStage;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const regexSearch = new RegExp(searchtext, "i");
      if (searchday) {
        day = searchday;
        inCartStage = await CustomerCart.find({
          createdAt: {
            $gte: new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000),
          },
          $or: [
            { fullname: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
            { paymentStatus: { $regex: regexSearch } },
          ],
        });
      } else {
        inCartStage = await CustomerCart.find({
          $or: [
            { fullname: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
            { paymentStatus: { $regex: regexSearch } },
          ],
        });
      }
      // console.log("this is total count===>", OneDayOrderCount[0].productsInCart);
      res.render("cartStage", {
        data: inCartStage,
        day: day,
        searchvalue: searchtext,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.redirect("/admin/login");
  }
};
exports.adminpaymentFailed = async (req, res) => {
  
  let adminId, paymentFailedCount;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      paymentFailedCount = await OrderPayment.find({}).sort({ createdAt: -1 });

      console.log("this is total count===>", paymentFailedCount);
      res.render("displaypayment", {
        data: paymentFailedCount
      });
    } else {
      console.log("err yaha hai");
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/admin/login");
  }
};
exports.adminpaymentFailedSearch = async (req, res) => {
  let searchtext = req.body.search;
  let searchday = req.body.day;
  searchtext = searchtext.trim();
  searchday = searchday.trim();
  let day;
  let adminId, paymentFailedData;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const regexSearch = new RegExp(searchtext, "i");
      if (searchday) {
        day = searchday;
        paymentFailedData = await CustomerCart.find({
          createdAt: {
            $gte: new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000),
          },
          $or: [
            { fullname: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
            { paymentStatus: { $regex: regexSearch } },
          ],
        });
      } else {
        paymentFailedData = await CustomerCart.find({
          $or: [
            { fullname: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
            { paymentStatus: { $regex: regexSearch } },
          ],
        });
      }
      console.log("this is total count===>", paymentFailedData);
      res.render("displaypayment", {
        data: paymentFailedData,
        day: day,
        searchvalue: searchtext,
      });
    } else {
      console.log("err yaha hai");
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/admin/login");
  }
};

exports.adminlogout = (req, res) => {
  try {
    res.clearCookie("adminId");
    res.clearCookie("adminPass");
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error);
  }
};
exports.admintotaldata = async (req, res) => {
  
  let adminId;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const totalDataCount = await CustomerCart.find({});
      // console.log("this is total count===>", OneDayOrderCount[0].productsInCart);
      res.render("totaldata", {
        data: totalDataCount
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    res.redirect("/admin/login");
  }
};
exports.admintotaldataSearch = async (req, res) => {
  let searchtext = req.body.search;
  let searchday = req.body.day;
  searchtext = searchtext.trim();
  searchday = searchday.trim();
  let day;

  let adminId, totalDataCount;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const regexSearch = new RegExp(searchtext, "i");
      if (searchday) {
        day = searchday;
        totalDataCount = await CustomerCart.find({
          createdAt: {
            $gte: new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000),
          },
          $or: [
            { fullname: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
            { paymentStatus: { $regex: regexSearch } },
          ],
        });
      } else {
        totalDataCount = await CustomerCart.find({
          $or: [
            { fullname: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
            { paymentStatus: { $regex: regexSearch } },
          ],
        });
      }

      // console.log("this is total count===>", OneDayOrderCount[0].productsInCart);
      res.render("totaldata", {
        data: totalDataCount,
        day: day,
        searchvalue: searchtext,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/admin/login");
  }
};
exports.adminquerries = async (req, res) => {
  
  try {
    const QuerryCount = await Querry.find({}).sort({ createdAt: -1 });
    res.render("adminQuerry", { data: QuerryCount });
  } catch (error) {
    console.log(error);
    res.redirect("/admin/login");
  }
};
exports.adminquerriesSearch = async (req, res) => {
  let searchtext = req.body.search;
  let searchday = req.body.day;
  searchtext = searchtext.trim();
  searchday = searchday.trim();
  let day, QuerryData;
  let adminId;
  let adminPass, reqCookieId, reqCookiePass, authId, authPass;
  try {
    adminId = adminIdData;
    adminPass = adminPassData;
    console.log(adminId, adminPass);
    reqCookieId = req.cookies.adminId;
    reqCookiePass = req.cookies.adminPass;
    console.log(reqCookieId, reqCookiePass);
    authId = bcrypt.compareSync(adminId, reqCookieId);
    authPass = bcrypt.compareSync(adminPass, reqCookiePass);
    if (authId === true && authPass === true) {
      const regexSearch = new RegExp(searchtext, "i");
      if (searchday) {
        day = searchday;
        QuerryData = await Querry.find({
          createdAt: {
            $gte: new Date(new Date().getTime() - day * 24 * 60 * 60 * 1000),
          },
          $or: [
            { name: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
          ],
        });
      } else {
        QuerryData = await Querry.find({
          $or: [
            { name: { $regex: regexSearch } },
            { email: { $regex: regexSearch } },
          ],
        });
      }
      res.render("adminQuerry", {
        data: QuerryData,
        day: day,
        searchvalue: searchtext,
      });
    } else {
      console.log("err yaha hai");
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/admin/login");
  }
};
