var counter = 0;
var flagdate = "20220427";
function receipt() {
  var billnumber;
  var today = new Date();
  var day = String(today.getDate()).padStart(2, "0");
  var month = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var year = today.getFullYear();
  var date = year + month + day;

  if (date === flagdate) {
    billnumber = "Apn" + date + counter;
    counter += 1;
  } else if (date > flagdate) {
    flagdate = date;
    counter = 1;
    billnumber = "Apn" + date + counter;
  } else {
    billnumber = "receipt failed";
  }
  return [billnumber,counter];
}

module.exports = { receipt };
