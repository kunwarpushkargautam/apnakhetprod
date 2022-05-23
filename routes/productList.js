const express = require('express');
const router = express.Router();
const {productControlFunction}= require('../controllers/productControlFile');

router.get('/',productControlFunction);
module.exports = router;