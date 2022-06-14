require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const { json } = require("express");
const url = require("url");
const Customer = require("./models/customerDetailSchema");
const bodyParser = require('body-parser');
require("./db/connection");
var crypto = require('crypto');
var cookieParser = require('cookie-parser');


const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
console.log("static path==>",static_path)


app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", views_path);
hbs.registerPartials(partial_path);

app.use(cookieParser());
app.use('/',require('../routes/pages'));
app.use('/productList',require('../routes/productList'));

app.listen(port, () => {
    console.log(`page served at port ${port}`);
  });