const mongoose = require("mongoose");
mongoose
  .connect(`mongodb+srv://${process.env.APNAKHET_USER}:${process.env.APNAKHET_PASS}@cluster0.hnq6k.mongodb.net/ApnaKhet?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useFindAndModify:false
  })
  .then(() => {
    console.log("connection ok");
  })
  .catch((e) => {
    console.log(e);
  }); 
  