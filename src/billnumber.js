var counter = 0;
var flagdate = "20220427";
function receipt() {
  var billnumber;
  var today = new Date();
  var day = String(today.getDate()).padStart(2, "0");
  var month = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var year = today.getFullYear();
  var getTime = today.getTime();
  var date = year + month + day+getTime;

  if (date === flagdate) { 
    billnumber = "Apn" + date ;
    counter += 1;
  } else if (date > flagdate) {
    flagdate = date;
    counter = 1;
    billnumber = "Apn" + date ;
  } else {
    billnumber = "receipt failed";
  }
  return [billnumber,counter];
}

module.exports = { receipt };
