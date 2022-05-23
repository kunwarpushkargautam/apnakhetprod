require("dotenv").config();
var PaytmConfig = {
    mid: process.env.PAYTM_MID,
    key: 'OJjaE7%vz#AZ@s2c',
    website: process.env.PAYTM_WEBSITE
}

module.exports.PaytmConfig = PaytmConfig