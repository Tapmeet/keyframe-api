/* eslint-disable new-cap */
const express = require('express');
const ipn = require('../controllers/IPN');
const router = express.Router();

// UPLOAD
router.post('/validator', ipn.index);


module.exports = router;

